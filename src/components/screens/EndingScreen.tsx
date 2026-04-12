'use client'
import { useEffect } from 'react'
import CharacterBubble from '@/components/CharacterBubble'
import { Character } from '@/data/stories'
import { recordCompletion } from '@/lib/storage'

interface Props {
  storyId: string
  character: Character
  correctCount: number
  totalQuestions: number
  onRestart: () => void
  onQuit: () => void
}

export default function EndingScreen({
  storyId,
  character,
  correctCount,
  totalQuestions,
  onRestart,
  onQuit,
}: Props) {
  useEffect(() => {
    recordCompletion(storyId)
  }, [storyId])

  const stars = Math.round((correctCount / totalQuestions) * 3)

  return (
    <div
      className="h-screen-safe flex flex-col"
      style={{ backgroundColor: '#faf6ea' }}
    >
      {/* ── スクロールエリア ── */}
      <div className="flex-1 scroll-area">
        <div className="max-w-lg mx-auto px-5 pt-8 pb-4 flex flex-col items-center gap-6 animate-fadeInUp">

          {/* キャラクター */}
          <div className="animate-popIn">
            <div className="text-7xl text-center animate-floatY">{character.emoji}</div>
          </div>

          {/* メッセージ */}
          <div className="text-center">
            <p className="text-xl font-bold text-[#3d3028] leading-loose mb-1 whitespace-pre-wrap">
              {character.endingMessage1}
            </p>
            <p className="text-lg text-forest-600 font-bold">{character.endingMessage2}</p>
          </div>

          {/* スコア */}
          <div className="bg-white rounded-3xl px-8 py-5 shadow-sm border border-[#e8dcc8] text-center w-full">
            <p className="text-[#7a6555] mb-1 text-sm">せいかい</p>
            <p className="text-5xl font-bold text-forest-600">
              {correctCount}
              <span className="text-xl text-[#bba898] ml-1">/ {totalQuestions}</span>
            </p>
            <div className="flex justify-center gap-2 mt-3 text-4xl">
              {Array.from({ length: 3 }, (_, i) => (
                <span key={i} className={`transition-opacity ${i < stars ? 'opacity-100' : 'opacity-20'}`}>
                  ⭐
                </span>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* ── フッター：ボタン（常に画面下） ── */}
      <div
        className="flex-shrink-0 px-5 pt-3 pb-safe bg-[#faf6ea] border-t border-[#ede5d5] flex flex-col gap-3"
      >
        <button
          onClick={onRestart}
          className="w-full py-5 rounded-full text-2xl font-bold text-white tracking-widest
                     bg-gradient-to-br from-forest-400 to-forest-600
                     shadow-[0_5px_0_#224f35]
                     active:translate-y-1 active:shadow-[0_2px_0_#224f35]
                     transition-all duration-150"
        >
          もういちど 🔄
        </button>
        <button
          onClick={onQuit}
          className="w-full py-4 rounded-full text-xl font-bold text-[#7a6555] tracking-widest
                     bg-white border-2 border-[#e8dcc8]
                     active:bg-[#f0f7f2] active:scale-95
                     transition-all duration-150"
        >
          おわる
        </button>
      </div>
    </div>
  )
}
