'use client'
import { Story } from '@/data/stories'
import { unlockAudio } from '@/lib/speech'

interface Props {
  stories: Story[]
  onSelect: (storyId: string) => void
}

// おはなしごとのテーマカラー
const THEME: Record<string, { bg: string; border: string; badge: string }> = {
  'omusubi-kororin': {
    bg:     'linear-gradient(135deg, #fff8e6 0%, #fdecc8 100%)',
    border: '#e8c97a',
    badge:  '#f0a030',
  },
  fukinotou: {
    bg:     'linear-gradient(135deg, #f0faf0 0%, #d4edda 100%)',
    border: '#7dc89a',
    badge:  '#3a9e5f',
  },
  'tanpopo-no-chie': {
    bg:     'linear-gradient(135deg, #fffde7 0%, #fff9c4 100%)',
    border: '#f9d342',
    badge:  '#c8a000',
  },
}

const DEFAULT_THEME = {
  bg:     'linear-gradient(135deg, #f5f0ff 0%, #e8e0ff 100%)',
  border: '#b39ddb',
  badge:  '#7c56c8',
}

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
      <div className="flex flex-col gap-4 animate-fadeInUp">
        {stories.map((story, i) => {
          const theme = THEME[story.id] ?? DEFAULT_THEME
          return (
            <button
              key={story.id}
              onClick={() => { unlockAudio(); onSelect(story.id) }}
              className="w-full text-left rounded-3xl shadow-md
                         active:scale-[0.97] transition-transform duration-150 overflow-hidden"
              style={{
                background:   theme.bg,
                border:       `2px solid ${theme.border}`,
                animationDelay: `${i * 120}ms`,
              }}
            >
              <div className="flex items-center gap-4 px-5 py-5">
                {/* キャラクターアイコン */}
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center
                             text-4xl flex-shrink-0 shadow-sm border-2 border-white"
                  style={{ backgroundColor: '#ffffff88' }}
                >
                  {story.character.emoji}
                </div>

                {/* テキスト */}
                <div className="flex-1 min-w-0">
                  <p className="text-xl font-bold text-[#3d3028] leading-snug mb-1">
                    {story.title}
                  </p>
                  <p className="text-sm text-[#7a6555]">
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
