'use client'
import { useState, useEffect, useRef, useMemo } from 'react'
import Image from 'next/image'
import { speak, stopSpeaking, isIOSSafari } from '@/lib/speech'
import { playPageTurn } from '@/lib/sounds'
import { StoryPage, WordHint } from '@/data/stories'
import RubyText from '@/components/RubyText'

interface Props {
  page: StoryPage
  pageIndex: number
  totalPages: number
  onPrev?: () => void         // 前のページへ（1ページ目は undefined）
  onNext: () => void
  isLastPage: boolean
  mode?: 'listen' | 'record'
  isRecording?: boolean              // 全ページ通し録音中フラグ（page.tsx が管理）
  onBonusStar?: () => void
  onRecorded?: (blob: Blob) => void
}

// 読み上げ完了後、ページめくり音が鳴り終わる頃にページが変わる
const AUTO_ADVANCE_DELAY = 350 // ms（音の長さ 約200ms + 余韻）

interface SentenceChunk {
  prefix: string
  text: string
}

function splitSentences(text: string): SentenceChunk[] {
  // 。の直後の閉じ括弧（」』）も同じチャンクに含める
  // 例: 「すまない。」 → 1チャンク（分割されない）
  const parts: string[] = []
  let last = 0
  const re = /。[」』]?/g
  let m: RegExpExecArray | null
  while ((m = re.exec(text)) !== null) {
    parts.push(text.slice(last, m.index + m[0].length))
    last = m.index + m[0].length
  }
  if (last < text.length) parts.push(text.slice(last))

  const chunks: SentenceChunk[] = []
  for (const raw of parts) {
    const firstNonNL = raw.search(/[^\n]/)
    const prefix  = firstNonNL > 0 ? raw.slice(0, firstNonNL) : ''
    const content = firstNonNL >= 0 ? raw.slice(firstNonNL) : raw
    if (content.trim().length > 0) {
      chunks.push({ prefix, text: content })
    }
  }
  return chunks.length > 0 ? chunks : [{ prefix: '', text }]
}

function RetryIcon({ size = 40 }: { size?: number }) {
  // 中心(24,24) 半径15の円
  // 弧1: (13,34)→(34,13) 時計回り（上を通る）約170°
  // 弧2: (35,14)→(14,35) 時計回り（下を通る）約170°
  // 矢印ヘッドは弧の進行方向に合わせた三角形
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      {/* 弧1: 左下→右上（時計回り・上を通る） */}
      <path
        d="M 13 34 A 15 15 0 0 1 34 13"
        stroke="#e05555" strokeWidth="4.5" strokeLinecap="round" fill="none"
      />
      {/* 右上の矢印ヘッド（進行方向：右下向き） */}
      <polygon points="34,13 27,12 32,6" fill="#e05555"/>

      {/* 弧2: 右上→左下（時計回り・下を通る） */}
      <path
        d="M 35 14 A 15 15 0 0 1 14 35"
        stroke="#e05555" strokeWidth="4.5" strokeLinecap="round" fill="none"
      />
      {/* 左下の矢印ヘッド（進行方向：左上向き） */}
      <polygon points="14,35 21,36 16,42" fill="#e05555"/>
    </svg>
  )
}

function MicIcon({ size = 36 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      {/* マイク本体：あかい */}
      <rect x="18" y="4" width="12" height="22" rx="6" fill="#e05555"/>
      {/* アーチ：すこし濃いあか */}
      <path d="M10 24a14 14 0 0 0 28 0" stroke="#b83232" strokeWidth="3.5" strokeLinecap="round" fill="none"/>
      {/* スタンド縦線 */}
      <line x1="24" y1="38" x2="24" y2="44" stroke="#b83232" strokeWidth="3.5" strokeLinecap="round"/>
      {/* スタンド横線 */}
      <line x1="16" y1="44" x2="32" y2="44" stroke="#c94444" strokeWidth="3.5" strokeLinecap="round"/>
    </svg>
  )
}

type RecordState = 'idle' | 'recording' | 'recorded'

export default function StoryScreen({
  page,
  pageIndex,
  totalPages,
  onPrev,
  onNext,
  isLastPage,
  mode = 'listen',
  isRecording = false,
  onBonusStar,
  onRecorded,
}: Props) {
  const isRecordMode = mode === 'record'

  const [isReading,    setIsReading]    = useState(false)
  const [readingIndex, setReadingIndex] = useState(-1)
  const [showRuby,     setShowRuby]     = useState(false)
  const [activeHint,   setActiveHint]   = useState<WordHint | null>(null)

  // 録音関連（record モードのみ使用）
  const [recState,     setRecState]     = useState<RecordState>('idle')
  const [audioURL,     setAudioURL]     = useState<string | null>(null)
  const [isPlaying,    setIsPlaying]    = useState(false)
  const [micError,     setMicError]     = useState<string | null>(null)
  const [speakError,   setSpeakError]   = useState(false)
  const [bonusClaimed, setBonusClaimed] = useState(false)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef   = useRef<Blob[]>([])
  const playbackRef      = useRef<HTMLAudioElement | null>(null)
  const speakTimerRef    = useRef<ReturnType<typeof setTimeout> | null>(null)
  const advanceTimerRef  = useRef<ReturnType<typeof setTimeout> | null>(null)

  const sentences = useMemo(() => splitSentences(page.text), [page.text])

  function clearAll() {
    if (speakTimerRef.current)   clearTimeout(speakTimerRef.current)
    if (advanceTimerRef.current) clearTimeout(advanceTimerRef.current)
    speakTimerRef.current = advanceTimerRef.current = null
  }

  function startAutoAdvance() {
    // 読み終わったら即ページめくり音 → 少し待ってページ遷移
    playPageTurn()
    advanceTimerRef.current = setTimeout(() => {
      advanceTimerRef.current = null
      onNext()
    }, AUTO_ADVANCE_DELAY)
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
      if (!isRecordMode) startAutoAdvance()
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
      if (!isRecordMode) startAutoAdvance()
    }, handleSpeakError)
  }

  useEffect(() => {
    // listen モードのみ自動読み上げ開始。record モードは手動。
    if (!isRecordMode) {
      speakTimerRef.current = setTimeout(() => {
        setIsReading(true)
        if (isIOSSafari()) {
          speakWhole()
        } else {
          const s = splitSentences(page.text)
          speakFrom(s, 0)
        }
      }, 400)
    }

    return () => {
      clearAll()
      stopSpeaking()
      stopRecording()
      stopPlayback()
      setIsReading(false)
      setReadingIndex(-1)
      setRecState('idle')
      setAudioURL(prev => {
        if (prev) URL.revokeObjectURL(prev)
        return null
      })
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page.text])

  function handleSpeak() {
    clearAll()
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

  function handlePrev() {
    clearAll()
    stopSpeaking()
    stopRecording()
    stopPlayback()
    setIsReading(false)
    setReadingIndex(-1)
    onPrev?.()
  }

  function handleNext() {
    clearAll()
    stopSpeaking()
    stopRecording()
    stopPlayback()
    setIsReading(false)
    setReadingIndex(-1)
    playPageTurn()
    onNext()
  }

  // ── 録音 ──────────────────────────────────────
  async function handleMic() {
    if (recState === 'idle') {
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
      stopPlayback()
      setBonusClaimed(false)
      setRecState('idle')
      setAudioURL(null)
    }
  }

  async function startRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })

      // iOS Safari は audio/webm 非対応 → audio/mp4 を優先
      // ブラウザが実際に使う mimeType を後で blob 生成に使う
      const preferredMime =
        MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' :
        MediaRecorder.isTypeSupported('audio/mp4')  ? 'audio/mp4'  : ''

      const mr = preferredMime
        ? new MediaRecorder(stream, { mimeType: preferredMime })
        : new MediaRecorder(stream)
      mediaRecorderRef.current = mr
      audioChunksRef.current = []

      mr.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data)
      }
      mr.onstop = () => {
        // mr.mimeType = 実際に録音されたフォーマット（iOS: mp4, Chrome: webm など）
        const blob = new Blob(audioChunksRef.current, { type: mr.mimeType || 'audio/mp4' })
        const url  = URL.createObjectURL(blob)
        setAudioURL(prev => {
          if (prev) URL.revokeObjectURL(prev)
          return url
        })
        setRecState('recorded')
        stream.getTracks().forEach(t => t.stop())
        onRecorded?.(blob)  // ページ録音を親コンポーネントへ渡す
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
    if (isPlaying) { stopPlayback(); return }
    const audio = new Audio(audioURL)
    playbackRef.current = audio
    setIsPlaying(true)
    audio.onended = () => setIsPlaying(false)
    audio.onerror = () => setIsPlaying(false)
    audio.play().catch(() => setIsPlaying(false))
  }

  function stopPlayback() {
    if (playbackRef.current) {
      playbackRef.current.pause()
      playbackRef.current = null
    }
    setIsPlaying(false)
  }

  // ── 最終ページのボタンラベル
  const lastPageLabel = isRecordMode ? 'よみおわった！ 🎉' : 'しつもんへ ✏️'

  return (
    <div className="h-screen-safe flex flex-col relative" style={{ backgroundColor: '#faf6ea' }}>

      {/* ── ヘッダー ── */}
      <div className="flex-shrink-0 flex items-center justify-between px-5 pt-safe pt-3 pb-2">
        <div className="flex items-center gap-2">
          <span className="text-xl">{isRecordMode ? '🎙️' : '📖'}</span>
          <span className="text-sm text-[#bba898] font-bold tracking-wide">
            {isRecordMode
              ? <span className="text-forest-600">よみあげ れんしゅう</span>
              : '🌿'.repeat(pageIndex + 1)
            }
          </span>
        </div>
        <div className="flex items-center gap-2">
          {/* ふりがなトグル */}
          <button
            onClick={() => setShowRuby(v => !v)}
            className={`text-xs font-bold px-2.5 py-1 rounded-full border transition-all duration-150 active:scale-95
              ${showRuby
                ? 'bg-amber-100 border-amber-400 text-amber-700'
                : 'bg-white/60 border-[#e8dcc8] text-[#bba898]'
              }`}
          >
            ふりがな
          </button>
          <span className="text-sm text-[#bba898] font-bold bg-white/60 px-3 py-1 rounded-full border border-[#e8dcc8]">
            {pageIndex + 1} / {totalPages}
          </span>
        </div>
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
          <p
            className="story-text text-[0.95rem] font-bold text-[#3d3028]"
            aria-label={isReading && readingIndex >= 0 ? `読み上げ中: ${sentences[readingIndex]?.text ?? ''}` : undefined}
          >
            {sentences.map((chunk, i) => (
              <span key={i}>
                {chunk.prefix}
                <span
                  aria-current={isReading && readingIndex === i ? 'true' : undefined}
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
                  <RubyText text={chunk.text} showRuby={showRuby} />
                </span>
              </span>
            ))}
          </p>
        </div>

        {/* ことばのふくろ：ヒントチップ */}
        {page.wordHints && page.wordHints.length > 0 && (
          <div className="flex-shrink-0 flex items-center gap-2 flex-wrap">
            <span className="text-[10px] font-bold text-[#9a8070] whitespace-nowrap">💬 ことば</span>
            {page.wordHints.map((hint, i) => (
              <button
                key={i}
                onClick={() => setActiveHint(hint)}
                className="px-2.5 py-1 rounded-full text-xs font-bold
                           bg-amber-50 border border-amber-300 text-amber-800
                           active:scale-95 transition-all duration-150"
              >
                {hint.word}
              </button>
            ))}
          </div>
        )}

        {/* エラーメッセージ */}
        {(speakError || micError) && (
          <div className="flex-shrink-0 bg-red-50 border border-red-200 rounded-xl px-3 py-2 text-center">
            <p className="text-sm font-bold text-red-500">
              {micError ?? '🔇 よみあげに しっぱいしました。もういちど おしてね'}
            </p>
          </div>
        )}

        {/* ── recordモード：録音インジケーター ── */}
        {isRecordMode && (
          <div className="flex items-center gap-3 flex-shrink-0 py-1">
            {/* 🔴 録音中インジケーター */}
            <div className="flex-1 flex items-center gap-2">
              {/* マイクアイコン */}
              <svg width="36" height="36" viewBox="0 0 100 100" fill="none">
                {/* マイク本体（カプセル） */}
                <rect x="35" y="5" width="30" height="50" rx="15" fill="#1a1a1a"/>
                {/* アーチ */}
                <path d="M20 48 a30 30 0 0 0 60 0" stroke="#1a1a1a" strokeWidth="7" strokeLinecap="round" fill="none"/>
                {/* スタンド縦線 */}
                <line x1="50" y1="78" x2="50" y2="90" stroke="#1a1a1a" strokeWidth="7" strokeLinecap="round"/>
                {/* スタンド台（三角） */}
                <polygon points="28,95 50,78 72,95" fill="#1a1a1a"/>
              </svg>
              {/* 赤いドット＋テキスト */}
              <div className="flex items-center gap-1.5">
                <div className="relative flex-shrink-0">
                  {isRecording && <div className="absolute inset-0 rounded-full bg-red-400 animate-ping opacity-75" />}
                  <div className={`w-3.5 h-3.5 rounded-full ${isRecording ? 'bg-red-500' : 'bg-gray-300'}`} />
                </div>
                <span className={`text-sm font-bold ${isRecording ? 'text-red-600' : 'text-[#9a8070]'}`}>
                  {isRecording ? 'ろくおんちゅう' : 'マイクがつかえません'}
                </span>
              </div>
            </div>
            {/* きく（お手本）ボタン */}
            <button
              onClick={handleSpeak}
              className={`
                w-14 h-14 rounded-2xl flex flex-col items-center justify-center gap-0.5
                border-2 transition-all duration-200 active:scale-95 flex-shrink-0
                ${isReading
                  ? 'bg-forest-100 border-forest-400'
                  : 'bg-forest-50 border-forest-300'
                }
              `}
              aria-label={isReading ? '読み上げをとめる' : 'お手本を聞く'}
            >
              {isReading ? (
                <svg width="26" height="26" viewBox="0 0 48 48" fill="none">
                  <rect x="10" y="20" width="28" height="20" rx="5" fill="#3a7a55"/>
                  <rect x="14" y="9" width="6" height="16" rx="3" fill="#3a7a55"/>
                  <rect x="21" y="7" width="6" height="17" rx="3" fill="#3a7a55"/>
                  <rect x="28" y="9" width="6" height="15" rx="3" fill="#3a7a55"/>
                  <rect x="7" y="22" width="6" height="11" rx="3" fill="#3a7a55"/>
                </svg>
              ) : (
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#4a7a5a" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="11,5 6,9 2,9 2,15 6,15 11,19" fill="none"/>
                  <path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>
                  <path d="M19.07 4.93a10 10 0 0 1 0 14.14"/>
                </svg>
              )}
              <span className="text-[10px] font-bold text-[#4a7a5a] leading-none mt-0.5">
                {isReading ? 'とめる' : 'きく'}
              </span>
            </button>
          </div>
        )}

      </div>

      {/* ── ことばのふくろ モーダル ── */}
      {activeHint && (
        <div
          className="absolute inset-0 z-50 flex items-end justify-center"
          style={{ backgroundColor: 'rgba(0,0,0,0.35)' }}
          onClick={() => setActiveHint(null)}
        >
          <div
            className="w-full max-w-lg mx-auto bg-white rounded-t-3xl px-6 pt-5 pb-safe animate-fadeInUp"
            style={{ paddingBottom: 'max(env(safe-area-inset-bottom), 28px)' }}
            onClick={e => e.stopPropagation()}
          >
            {/* ハンドルバー */}
            <div className="w-10 h-1 bg-[#e8dcc8] rounded-full mx-auto mb-4" />

            {/* ことばラベル */}
            <div className="flex items-baseline gap-3 mb-3">
              <span className="text-3xl font-black text-[#3d3028]">{activeHint.word}</span>
              <span className="text-base font-bold text-[#9a8070]">【{activeHint.reading}】</span>
            </div>

            {/* 説明文 */}
            <p className="story-text text-base font-bold text-[#4a3a2a] leading-relaxed mb-4">
              {activeHint.explanation}
            </p>

            {/* 閉じるボタン */}
            <button
              onClick={() => setActiveHint(null)}
              className="w-full py-3 rounded-full text-base font-bold text-white
                         bg-gradient-to-br from-forest-400 to-forest-600
                         shadow-[0_3px_0_#224f35]
                         active:translate-y-0.5 active:shadow-[0_1px_0_#224f35]
                         transition-all duration-150"
            >
              とじる
            </button>
          </div>
        </div>
      )}

      {/* ── フッター ── */}
      <div
        className="flex-shrink-0 px-4 pt-3 bg-[#faf6ea] border-t border-[#ede5d5]"
        style={{ paddingBottom: 'max(env(safe-area-inset-bottom), 16px)' }}
      >
        {isRecordMode ? (
          /* record モード：従来の大きい「つぎへ」ボタン */
          <button
            onClick={handleNext}
            className="w-full py-5 rounded-full text-2xl font-bold text-white tracking-widest
                       bg-gradient-to-br from-forest-400 to-forest-600
                       shadow-[0_5px_0_#224f35]
                       active:translate-y-1 active:shadow-[0_2px_0_#224f35]
                       transition-all duration-150"
          >
            {isLastPage ? lastPageLabel : 'つぎへ →'}
          </button>
        ) : (
          /* listen モード：3ボタン */
          <div className="flex items-stretch gap-2">

            {/* ← 前にもどる */}
            <button
              onClick={handlePrev}
              disabled={!onPrev}
              className="w-20 rounded-2xl flex flex-col items-center justify-center gap-1
                         border-2 border-[#e8dcc8] bg-white text-[#7a6555]
                         disabled:opacity-25 disabled:cursor-default
                         active:scale-95 active:bg-[#f5f0e8] transition-all duration-150"
              aria-label="前のページへ"
            >
              <span className="text-xl">←</span>
              <span className="text-[10px] font-bold leading-none">もどる</span>
            </button>

            {/* ⏸/▶ 本読みを止める／よむ */}
            <button
              onClick={handleSpeak}
              className={`
                flex-1 py-3 rounded-2xl flex flex-col items-center justify-center gap-1
                border-2 transition-all duration-200 active:scale-95
                ${isReading
                  ? 'bg-forest-100 border-forest-400 text-forest-700'
                  : 'bg-forest-50 border-forest-300 text-forest-600'
                }
              `}
              aria-label={isReading ? '読み上げをとめる' : '読み上げをはじめる'}
            >
              {isReading ? (
                /* とめる：緑円＋白横線 */
                <svg width="30" height="30" viewBox="0 0 48 48" fill="none">
                  <circle cx="24" cy="24" r="22" fill="#4a9068"/>
                  <rect x="13" y="21" width="22" height="6" rx="3" fill="white"/>
                </svg>
              ) : (
                /* よむ：緑円＋白三角 */
                <svg width="30" height="30" viewBox="0 0 48 48" fill="none">
                  <circle cx="24" cy="24" r="22" fill="#4a9068"/>
                  <polygon points="19,14 37,24 19,34" fill="white"/>
                </svg>
              )}
              <span className="text-xs font-bold leading-none">
                {isReading ? 'とめる' : 'よむ'}
              </span>
            </button>

            {/* 次にすすむ → */}
            <button
              onClick={handleNext}
              className="w-20 rounded-2xl flex flex-col items-center justify-center gap-1
                         border-2 border-forest-400 bg-forest-400 text-white
                         active:scale-95 active:brightness-90 transition-all duration-150
                         shadow-[0_3px_0_#224f35] active:shadow-none active:translate-y-0.5"
              aria-label={isLastPage ? 'しつもんへ' : '次のページへ'}
            >
              <span className="text-xl">{isLastPage ? '✏️' : '→'}</span>
              <span className="text-[10px] font-bold leading-none">
                {isLastPage ? 'もんだい' : 'すすむ'}
              </span>
            </button>

          </div>
        )}
      </div>
    </div>
  )
}
