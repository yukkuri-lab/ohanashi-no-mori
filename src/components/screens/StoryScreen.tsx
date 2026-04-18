'use client'
import { useState, useEffect, useRef } from 'react'
import { speak, stopSpeaking } from '@/lib/speech'
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
    // 先頭の改行を分離（s フラグなしで安全に処理）
    const firstNonNL = raw.search(/[^\n]/)
    const prefix  = firstNonNL > 0 ? raw.slice(0, firstNonNL) : ''
    const content = firstNonNL >= 0 ? raw.slice(firstNonNL) : raw
    if (content.trim().length > 0) {
      chunks.push({ prefix, text: content })
    }
  }
  return chunks.length > 0 ? chunks : [{ prefix: '', text }]
}

export default function StoryScreen({ page, pageIndex, totalPages, onNext, isLastPage }: Props) {
  const [isReading,    setIsReading]    = useState(false)
  const [readingIndex, setReadingIndex] = useState(-1)   // 現在ハイライト中の文のインデックス
  const [autoProgress, setAutoProgress] = useState<number | null>(null)

  const speakTimerRef    = useRef<ReturnType<typeof setTimeout> | null>(null)
  const progressTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const sentences = splitSentences(page.text)   // SentenceChunk[]

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

  /** 文を順番に読み上げてハイライト */
  function speakFrom(chunks: SentenceChunk[], index: number) {
    if (index >= chunks.length) {
      setIsReading(false)
      setReadingIndex(-1)
      startAutoAdvance()
      return
    }
    setReadingIndex(index)
    // iOS Safari: onEnd 直後に次の speak() を呼ぶとエラーになるため少し待つ
    speak(chunks[index].text, () => setTimeout(() => speakFrom(chunks, index + 1), 150))
  }

  // 画面表示時に自動読み上げ開始
  useEffect(() => {
    const s = splitSentences(page.text)
    speakTimerRef.current = setTimeout(() => {
      setIsReading(true)
      speakFrom(s, 0)
    }, 600)

    return () => {
      clearAll()
      stopSpeaking()
      setIsReading(false)
      setReadingIndex(-1)
      setAutoProgress(null)
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
      const s = splitSentences(page.text)
      setIsReading(true)
      speakFrom(s, 0)
    }
  }

  function handleNext() {
    clearAll()
    stopSpeaking()
    setIsReading(false)
    setReadingIndex(-1)
    setAutoProgress(null)
    onNext()
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
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={page.imageSrc}
              alt={page.imageLabel}
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
        <div className="bg-white rounded-2xl px-4 py-3 shadow-sm border border-[#e8dcc8] flex-1 min-h-0 overflow-y-auto">
          <p className="story-text text-[0.95rem] font-bold text-[#3d3028] leading-relaxed">
            {sentences.map((chunk, i) => (
              <span key={i}>
                {/* 改行はspanの外に置く → 前行に黄色が漏れない */}
                {chunk.prefix}
                <span
                  style={{
                    backgroundColor: readingIndex === i && isReading ? '#fef08a' : 'transparent',
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

        {/* よみあげボタン */}
        <button
          onClick={handleSpeak}
          className={`
            w-full py-3 rounded-2xl text-base font-bold tracking-wide flex-shrink-0
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
          <span>{isReading ? 'よんでいるよ…（とめる）' : 'もういちど よむ'}</span>
        </button>

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
