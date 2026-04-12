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

export default function StoryScreen({ page, pageIndex, totalPages, onNext, isLastPage }: Props) {
  const [isReading,    setIsReading]    = useState(false)
  const [autoProgress, setAutoProgress] = useState<number | null>(null) // null=非表示, 0〜100=カウントダウン中

  // タイマー類を ref で管理（クリーンアップのため）
  const speakTimerRef    = useRef<ReturnType<typeof setTimeout> | null>(null)
  const checkDoneRef     = useRef<ReturnType<typeof setInterval> | null>(null)
  const progressTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // すべてのタイマーを止める
  function clearAll() {
    if (speakTimerRef.current)    clearTimeout(speakTimerRef.current)
    if (checkDoneRef.current)     clearInterval(checkDoneRef.current)
    if (progressTimerRef.current) clearInterval(progressTimerRef.current)
    speakTimerRef.current = checkDoneRef.current = progressTimerRef.current = null
  }

  // 読み上げ完了後のカウントダウン → 自動で次へ
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
    }, 30) // 30ms ごとに更新（なめらかなバー）
  }

  // 画面が表示されたら自動読み上げ開始
  useEffect(() => {
    speakTimerRef.current = setTimeout(() => {
      setIsReading(true)
      // onEnd コールバックで読み終わりを確実に検知
      speak(page.text, () => {
        setIsReading(false)
        startAutoAdvance()
      })
    }, 600) // 絵を見る間（0.6秒）

    return () => {
      clearAll()
      stopSpeaking()
      setIsReading(false)
      setAutoProgress(null)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page.text])

  // 手動で「よみあげる」ボタンを押したとき
  function handleSpeak() {
    clearAll()
    setAutoProgress(null)

    if (isReading) {
      stopSpeaking()
      setIsReading(false)
    } else {
      setIsReading(true)
      speak(page.text, () => {
        setIsReading(false)
        startAutoAdvance()
      })
    }
  }

  // 「つぎへ」ボタン（手動）または自動カウントダウン中にタップで即進む
  function handleNext() {
    clearAll()
    stopSpeaking()
    setIsReading(false)
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

      {/* ── スクロールエリア ── */}
      <div className="flex-1 scroll-area">
        <div className="max-w-lg mx-auto px-5 pb-4 flex flex-col gap-4 animate-fadeInUp">

          {/* 絵 */}
          <div className="rounded-3xl overflow-hidden shadow-md border border-[#e8dcc8]">
            {page.imageSrc ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={page.imageSrc}
                alt={page.imageLabel}
                className="w-full object-cover"
                style={{ maxHeight: 'min(38vw, 200px)' }}
              />
            ) : (
              <div
                className="flex flex-col items-center justify-center py-12 gap-2"
                style={{ background: 'linear-gradient(135deg, #dceade 0%, #c8e6c9 50%, #b2dfdb 100%)' }}
              >
                <span className="text-5xl">🖼️</span>
                <span className="text-[#5a7a5a] font-bold text-sm">{page.imageLabel}</span>
              </div>
            )}
          </div>

          {/* 本文テキスト */}
          <div className="bg-white rounded-3xl px-6 py-5 shadow-sm border border-[#e8dcc8]">
            <p className="story-text text-[1.05rem] font-bold text-[#3d3028]">
              {page.text}
            </p>
          </div>

          {/* よみあげボタン */}
          <button
            onClick={handleSpeak}
            className={`
              w-full py-4 rounded-2xl text-lg font-bold tracking-wide
              flex items-center justify-center gap-3
              border-2 transition-all duration-200 active:scale-95
              ${isReading
                ? 'bg-[#fff3e0] border-[#e0943a] text-[#b85c00]'
                : 'bg-[#fffbf0] border-[#e8c97a] text-[#7a5c1a] active:bg-[#fff3d0]'
              }
            `}
          >
            <span className={`text-2xl ${isReading ? 'animate-bounce' : ''}`}>
              {isReading ? '🔊' : '🔈'}
            </span>
            <span>{isReading ? 'よんでいるよ…（とめる）' : 'もういちど よむ'}</span>
          </button>

        </div>
      </div>

      {/* ── フッター ── */}
      <div
        className="flex-shrink-0 px-5 pt-3 bg-[#faf6ea] border-t border-[#ede5d5]"
        style={{ paddingBottom: 'max(env(safe-area-inset-bottom), 20px)' }}
      >
        {/* カウントダウン中：バー付きボタン */}
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
            {/* 進行バー（下から塗り上がる） */}
            <div
              className="absolute bottom-0 left-0 h-full bg-white/20 transition-none rounded-full"
              style={{ width: `${autoProgress}%` }}
            />
            <span className="relative">
              {isLastPage ? 'しつもんへ ✏️' : 'つぎへ →'}
            </span>
          </button>
        ) : (
          /* 通常の「つぎへ」ボタン */
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
