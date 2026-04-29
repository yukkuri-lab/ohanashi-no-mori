'use client'
import { useState } from 'react'
import Image from 'next/image'
import { Story } from '@/data/stories'
import { getRecord } from '@/lib/storage'
import { unlockAudio } from '@/lib/speech'

interface Props {
  stories: Story[]
  onSelect: (storyId: string) => void
}

// 3色ローテーション：あたたかいきいろ・やさしいみどり・やわらかいそら
const PALETTE = [
  {
    bg:     'linear-gradient(135deg, #fffcf0 0%, #fef3cc 100%)',
    border: '#e8cc70',
    badge:  '#c49a20',
  },
  {
    bg:     'linear-gradient(135deg, #f2faf4 0%, #d8edde 100%)',
    border: '#7cc890',
    badge:  '#3a9e5f',
  },
  {
    bg:     'linear-gradient(135deg, #f0f7ff 0%, #d8ebf8 100%)',
    border: '#7aaed8',
    badge:  '#3a6ea8',
  },
]

export default function StorySelectScreen({ stories, onSelect }: Props) {
  // マウント時に localStorage からデータ取得（SSR safe）
  const [{ completedStories, readCounts }] = useState(() => {
    if (typeof window === 'undefined') return { completedStories: [] as string[], readCounts: {} as Record<string, number> }
    const r = getRecord()
    return { completedStories: r.completedStories, readCounts: r.readCounts }
  })

  return (
    <div
      className="min-h-screen-safe flex flex-col px-5 pt-safe"
      style={{ backgroundColor: '#faf6ea' }}
    >
      {/* ヘッダー */}
      <div className="pt-6 pb-4 text-center animate-fadeInUp">
        <div className="text-4xl mb-2">📚</div>
        <h2 className="text-2xl font-bold text-forest-600 tracking-wide">
          おはなしを えらんでね
        </h2>
      </div>

      {/* ストーリーカード一覧 */}
      <div className="w-full flex flex-col gap-4 pb-8">
        {stories.map((story, i) => {
          const theme     = PALETTE[i % PALETTE.length]
          const completed = completedStories.includes(story.id)

          return (
            <button
              key={story.id}
              onClick={() => { unlockAudio(); onSelect(story.id) }}
              className="w-full block text-left rounded-3xl shadow-md animate-fadeInUp
                         active:scale-[0.97] transition-transform duration-150 overflow-hidden"
              style={{
                background:        theme.bg,
                border:            `2px solid ${theme.border}`,
                animationDelay:    `${i * 100}ms`,
                animationFillMode: 'both',
              }}
            >
              <div className="flex flex-row flex-nowrap items-center gap-4 px-5 py-5">
                {/* キャラクターアイコン */}
                <div className="relative flex-shrink-0">
                  <div
                    className="w-16 h-16 rounded-full flex items-center justify-center
                               text-4xl shadow-sm border-2 border-white overflow-hidden"
                    style={{ backgroundColor: '#f7f7f7' }}
                  >
                    {story.character.imageSrc ? (
                      <Image
                        src={story.character.imageSrc}
                        alt={story.character.name}
                        width={64}
                        height={64}
                        className="w-full h-full object-contain p-1"
                      />
                    ) : (
                      <span className="text-4xl">{story.character.emoji}</span>
                    )}
                  </div>
                  {/* 完了スタンプ */}
                  {completed && (
                    <div
                      className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full
                                 flex items-center justify-center text-xs
                                 bg-amber-400 border-2 border-white shadow-sm"
                    >
                      ⭐
                    </div>
                  )}
                </div>

                {/* テキスト */}
                <div className="flex-1 min-w-0 overflow-hidden">
                  <p className="text-xl font-bold text-[#3d3028] leading-snug mb-1 break-words">
                    {story.title}
                  </p>
                  {completed ? (
                    <p className="text-xs font-bold text-amber-600">
                      ⭐ よんだよ！　もういちど よむ？
                    </p>
                  ) : (
                    <p className="text-sm text-[#7a6555] truncate">
                      {story.character.name}と いっしょに よもう
                    </p>
                  )}
                  {/* 読み返しカウント スタンプ */}
                  {(readCounts[story.id] ?? 0) > 0 && (
                    <div className="flex items-center gap-0.5 mt-1">
                      {Array.from({ length: Math.min(readCounts[story.id], 5) }).map((_, k) => (
                        <span key={k} className="text-sm leading-none">📖</span>
                      ))}
                      {readCounts[story.id] > 5 && (
                        <span className="text-[10px] font-bold text-[#7a6555] ml-0.5">
                          ×{readCounts[story.id]}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* 矢印 */}
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center
                             text-white text-lg font-bold flex-shrink-0"
                  style={{ backgroundColor: theme.badge }}
                >
                  ▶
                </div>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
