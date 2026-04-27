'use client'
import { useState, useEffect, useRef, useMemo } from 'react'
import Image from 'next/image'
import { speak, stopSpeaking, isIOSSafari } from '@/lib/speech'
import { StoryPage } from '@/data/stories'

interface Props {
  page: StoryPage
  pageIndex: number
  totalPages: number
  onNext: () => void
  isLastPage: boolean
}

// 読み上げ完了後、この秒数待って自動で次へ進む
const AUTO_ADVANCE_DELAY = 1800 // ms

interface SentenceChunk {
  prefix: string  // 直前の改行（spanの外に出してハイライトを汚さない）
  text: string    // 実際の文内容（読み上げ・ハイライト対象）
}

/** テキストを「。」単位で分割。先頭の改行はprefixとして分離する */
function splitSentences(text: string): SentenceChunk[] {
  const parts = text.split('。')
  const chunks: SentenceChunk[] = []
  for (let i = 0; i < parts.length; i++) {
    const raw = i < parts.length - 1 ? parts[i] + '。' : parts[i]
    const firstNonNL = raw.search(/[^\n]/)
    const prefix  = firstNonNL > 0 ? raw.slice(0, firstNonNL) : ''
    const content = firstNonNL >= 0 ? raw.slice(firstNonNL) : raw
    if (content.trim().length > 0) {
      chunks.push({ prefix, text: content })
    }
  }
  return chunks.length > 0 ? chunks : [{ prefix: '', text }]
}

// ── マイクアイコン SVG（スクリーンショットに近いカラフルデザイン）──
function MicIcon({ size = 36 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      {/* マイク本体（黄色） */}
      <rect x="18" y="4" width="12" height="22" rx="6" fill="#FACC15"/>
      {/* マイク下部のアーチ（青） */}
      <path d="M10 24a14 14 0 0 0 28 0" stroke="#3B82F6" strokeWidth="3.5" strokeLinecap="round" fill="none"/>
      {/* スタンド縦線（青） */}
      <line x1="24" y1="38" x2="24" y2="44" stroke="#3B82F6" strokeWidth="3.5" strokeLinecap="round"/>
      {/* スタンド横線（赤） */}
      <line x1="16" y1="44" x2="32" y2="44" stroke="#EF4444" strokeWidth="3.5" strokeLinecap="round"/>
    </svg>
  )
}

type RecordState = 'idle' | 'recording' | 'recorded'

export default function StoryScreen({ page, pageIndex, totalPages, onNext, isLastPage }: Props) {
  const [isReading,    setIsReading]    = useState(false)
  const [readingIndex, setReadingIndex] = useState(-1)
  const [autoProgress, setAutoProgress] = useState<number | null>(null)

  // 録音関連
  const [recState,  setRecState]  = useState<RecordState>('idle')
  const [audioURL,  setAudioURL]  = useState<string | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [micError,  setMicError]  = useState<string | null>(null)
  const [speakError, setSpeakError] = useState(false)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef   = useRef<Blob[]>([])
  const playbackRef      = useRef<HTMLAudioElement | null>(null)

  const speakTimerRef    = useRef<ReturnType<typeof setTimeout> | null>(null)
  const progressTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const sentences = useMemo(() => splitSentences(page.text), [page.text])

  function clearAll() {
    if (speakTimerRef.current)    clearTimeout(speakTimerRef.current)
    if (progressTimerRef.current) clearInterval(progressTimerRef.current)
    speakTimerRef.current = progressTimerRef.current = null
  }

  function startAutoAdvance() {
    setAutoProgress(0)
    const start = Date.now()
    progressTimerRef.current = setInterval(() => {
      const progress = Math.min(((Date.now() - start) / AUTO_ADVANCE_DELAY) * 100, 100)
      setAutoProgress(progress)
      if (progress >= 100) {
        clearInterval(progressTimerRef.current!)
        progressTimerRef.current = null
        setAutoProgress(null)
        onNext()
      }
    }, 30)
  }

  function handleSpeakError() {
    setSpeakError(true)
    setIsReading(false)
    setReadingIndex(-1)
    setTimeout(() => setSpeakError(false), 3000)
  }

  function speakFrom(chunks: SentenceChunk[], index: number) {
    if (index >= chunks.length) {
      setIsReading(false)
      setReadingIndex(-1)
      startAutoAdvance()
      return
    }
    setReadingIndex(index)
    speak(chunks[index].text, () => speakFrom(chunks, index + 1), handleSpeakError)
  }

  function speakWhole() {
    setReadingIndex(-2)
    speak(page.text, () => {
      setIsReading(false)
      setReadingIndex(-1)
      startAutoAdvance()
    }, handleSpeakError)
  }

  // 画面表示時に自動読み上げ開始
  useEffect(() => {
    speakTimerRef.current = setTimeout(() => {
      setIsReading(true)
      if (isIOSSafari()) {
        speakWhole()
      } else {
        const s = splitSentences(page.text)
        speakFrom(s, 0)
      }
    }, 600)

    return () => {
      clearAll()
      stopSpeaking()
      stopRecording()
      stopPlayback()
      setIsReading(false)
      setReadingIndex(-1)
      setAutoProgress(null)
      setRecState('idle')
      setAudioURL(null)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page.text])

  function handleSpeak() {
    clearAll()
    setAutoProgress(null)
    if (isReading) {
      stopSpeaking()
      setIsReading(false)
      setReadingIndex(-1)
    } else {
      setIsReading(true)
      if (isIOSSafari()) {
        speakWhole()
      } else {
        const s = splitSentences(page.text)
        speakFrom(s, 0)
      }
    }
  }

  function handleNext() {
    clearAll()
    stopSpeaking()
    stopRecording()
    stopPlayback()
    setIsReading(false)
    setReadingIndex(-1)
    setAutoProgress(null)
    onNext()
  }

  // ── 録音 ──────────────────────────────────────
  async function handleMic() {
    if (recState === 'idle') {
      // 読み上げ中なら止める
      if (isReading) {
        clearAll()
        stopSpeaking()
        setIsReading(false)
        setReadingIndex(-1)
      }
      await startRecording()
    } else if (recState === 'recording') {
      stopRecording()
    } else {
      // recorded → もう一度録音
      stopPlayback()
      setRecState('idle')
      setAudioURL(null)
    }
  }

  async function startRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mr = new MediaRecorder(stream)
      mediaRecorderRef.current = mr
      audioChunksRef.current = []

      mr.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data)
      }
      mr.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
        const url  = URL.createObjectURL(blob)
        setAudioURL(url)
        setRecState('recorded')
        stream.getTracks().forEach(t => t.stop())
      }

      mr.start()
      setRecState('recording')
    } catch {
      setMicError('マイクがつかえませんでした')
      setTimeout(() => setMicError(null), 3000)
    }
  }

  function stopRecording() {
    if (mediaRecorderRef.current?.state === 'recording') {
      mediaRecorderRef.current.stop()
    }
  }

  function handlePlayback() {
    if (!audioURL) return
    if (isPlaying) {
      stopPlayback()
      return
    }
    const audio = new Audio(audioURL)
    playbackRef.current = audio
    setIsPlaying(true)
    audio.onended  = () => setIsPlaying(false)
    audio.onerror  = () => setIsPlaying(false)
    audio.play().catch(() => setIsPlaying(false))
  }

  function stopPlayback() {
    if (playbackRef.current) {
      playbackRef.current.pause()
      playbackRef.current = null
    }
    setIsPlaying(false)
  }

  return (
    <div className="h-screen-safe flex flex-col" style={{ backgroundColor: '#faf6ea' }}>

      {/* ── ヘッダー ── */}
      <div className="flex-shrink-0 flex items-center justify-between px-5 pt-safe pt-3 pb-2">
        <span className="text-sm text-[#bba898] font-bold tracking-wide">
          {'🌿'.repeat(pageIndex + 1)}
        </span>
        <span className="text-sm text-[#bba898] font-bold">
          {pageIndex + 1} / {totalPages}
        </span>
      </div>

      {/* ── コンテンツエリア ── */}
      <div className="flex-1 flex flex-col px-4 pb-2 gap-2 min-h-0 animate-fadeInUp">

        {/* 絵 */}
        <div className="rounded-2xl overflow-hidden shadow-md border border-[#e8dcc8] flex-shrink-0">
          {page.imageSrc ? (
            <Image
              src={page.imageSrc}
              alt={page.imageLabel}
              width={800}
              height={280}
              className="w-full object-cover"
              style={{ maxHeight: 'min(28vw, 140px)' }}
            />
          ) : (
            <div
              className="flex flex-col items-center justify-center py-8 gap-1"
              style={{ background: 'linear-gradient(135deg, #dceade 0%, #c8e6c9 50%, #b2dfdb 100%)' }}
            >
              <span className="text-4xl">🖼️</span>
              <span className="text-[#5a7a5a] font-bold text-sm">{page.imageLabel}</span>
            </div>
          )}
        </div>

        {/* 本文テキスト */}
        <div className="bg-white rounded-2xl px-4 py-3 shadow-sm border border-[#e8dcc8] flex-1 min-h-0 overflow-y-auto max-h-[55vh]">
          <p className="story-text text-[0.95rem] font-bold text-[#3d3028] leading-relaxed">
            {sentences.map((chunk, i) => (
              <span key={i}>
                {chunk.prefix}
                <span
                  style={{
                    backgroundColor:
                      isReading && (readingIndex === i || readingIndex === -2)
                        ? '#fef08a'
                        : 'transparent',
                    borderRadius: '4px',
                    boxDecorationBreak: 'clone',
                    WebkitBoxDecorationBreak: 'clone',
                    transition: 'background-color 0.2s ease',
                  }}
                >
                  {chunk.text}
                </span>
              </span>
            ))}
          </p>
        </div>

        {/* エラーメッセージ */}
        {(speakError || micError) && (
          <div className="flex-shrink-0 bg-red-50 border border-red-200 rounded-xl px-3 py-2 text-center">
            <p className="text-sm font-bold text-red-500">
              {micError ?? '🔇 よみあげに しっぱいしました。もういちど おしてね'}
            </p>
          </div>
        )}

        {/* ── ボタン行：よみあげ ＋ マイク ── */}
        <div className="flex gap-2 flex-shrink-0">

          {/* よみあげボタン */}
          <button
            onClick={handleSpeak}
            className={`
              flex-1 py-3 rounded-2xl text-base font-bold tracking-wide
              flex items-center justify-center gap-2
              border-2 transition-all duration-200 active:scale-95
              ${isReading
                ? 'bg-[#fff3e0] border-[#e0943a] text-[#b85c00]'
                : 'bg-[#fffbf0] border-[#e8c97a] text-[#7a5c1a] active:bg-[#fff3d0]'
              }
            `}
          >
            <span className={`text-xl ${isReading ? 'animate-bounce' : ''}`}>
              {isReading ? '🔊' : '🔈'}
            </span>
            <span>{isReading ? 'とめる' : 'もういちど'}</span>
          </button>

          {/* マイクボタン */}
          <div className="flex flex-col items-center gap-1">
            <button
              onClick={handleMic}
              className={`
                w-16 h-16 rounded-full flex items-center justify-center
                shadow-md border-2 transition-all duration-200 active:scale-95
                ${recState === 'recording'
                  ? 'bg-red-100 border-red-400 animate-pulse'
                  : recState === 'recorded'
                  ? 'bg-green-50 border-green-400'
                  : 'bg-white border-[#e8dcc8] active:bg-gray-50'
                }
              `}
            >
              {recState === 'recording' ? (
                // 録音中：赤い停止ボタン
                <span className="w-5 h-5 rounded bg-red-500 block" />
              ) : recState === 'recorded' ? (
                // 録音済み：もう一度アイコン
                <span className="text-2xl">🔄</span>
              ) : (
                // 待機中：マイクアイコン
                <MicIcon size={34} />
              )}
            </button>
            <span className="text-[10px] font-bold text-[#9a8070]">
              {recState === 'recording' ? 'やめる' : recState === 'recorded' ? 'もういちど' : 'じぶんでよむ'}
            </span>
          </div>
        </div>

        {/* 録音済み → きいてみるボタン */}
        {recState === 'recorded' && audioURL && (
          <button
            onClick={handlePlayback}
            className={`
              w-full py-3 rounded-2xl text-base font-bold flex-shrink-0
              flex items-center justify-center gap-2
              border-2 transition-all duration-200 active:scale-95
              ${isPlaying
                ? 'bg-blue-100 border-blue-400 text-blue-700'
                : 'bg-[#e8f5e9] border-[#66bb6a] text-[#2e7d32]'
              }
            `}
          >
            <span className="text-xl">{isPlaying ? '⏹' : '▶️'}</span>
            <span>{isPlaying ? 'とめる' : 'じぶんのこえを きいてみる 🎧'}</span>
          </button>
        )}

      </div>

      {/* ── フッター ── */}
      <div
        className="flex-shrink-0 px-5 pt-3 bg-[#faf6ea] border-t border-[#ede5d5]"
        style={{ paddingBottom: 'max(env(safe-area-inset-bottom), 20px)' }}
      >
        {autoProgress !== null ? (
          <button
            onClick={handleNext}
            className="w-full rounded-full text-2xl font-bold text-white tracking-widest
                       bg-gradient-to-br from-forest-400 to-forest-600
                       shadow-[0_5px_0_#224f35]
                       active:translate-y-1 active:shadow-[0_2px_0_#224f35]
                       transition-all duration-150 overflow-hidden relative"
            style={{ paddingTop: '20px', paddingBottom: '20px' }}
          >
            <div
              className="absolute bottom-0 left-0 h-full bg-white/20 transition-none rounded-full"
              style={{ width: `${autoProgress}%` }}
            />
            <span className="relative">
              {isLastPage ? 'しつもんへ ✏️' : 'つぎへ →'}
            </span>
          </button>
        ) : (
          <button
            onClick={handleNext}
            className="w-full py-5 rounded-full text-2xl font-bold text-white tracking-widest
                       bg-gradient-to-br from-forest-400 to-forest-600
                       shadow-[0_5px_0_#224f35]
                       active:translate-y-1 active:shadow-[0_2px_0_#224f35]
                       transition-all duration-150"
          >
            {isLastPage ? 'しつもんへ ✏️' : 'つぎへ →'}
          </button>
        )}
      </div>
    </div>
  )
}
