'use client'
import Image from 'next/image'
import { Story } from '@/data/stories'
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
      {/* カードに個別に animate-fadeInUp を付けて stagger アニメーションを実現 */}
      <div className="w-full flex flex-col gap-4 pb-8">
        {stories.map((story, i) => {
          const theme = PALETTE[i % PALETTE.length]
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
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center
                             text-4xl flex-shrink-0 shadow-sm border-2 border-white overflow-hidden"
                  style={{ backgroundColor: '#ffffff' }}
                >
                  {story.character.imageSrc ? (
                    <Image
                      src={story.character.imageSrc}
                      alt={story.character.name}
                      width={64}
                      height={64}
                      className="w-full h-full object-contain p-1"
                      style={{ filter: 'brightness(1.25)' }}
                    />
                  ) : (
                    <span className="text-4xl">{story.character.emoji}</span>
                  )}
                </div>

                {/* テキスト */}
                <div className="flex-1 min-w-0 overflow-hidden">
                  <p className="text-xl font-bold text-[#3d3028] leading-snug mb-1 break-words">
                    {story.title}
                  </p>
                  <p className="text-sm text-[#7a6555] truncate">
                    {story.character.name}と いっしょに よもう
                  </p>
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
