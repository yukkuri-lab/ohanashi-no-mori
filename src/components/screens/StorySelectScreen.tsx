'use client'
import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import { Story } from '@/data/stories'
import { unlockAudio } from '@/lib/speech'
import { getStoriesWithRecordings, loadAllPageRecordings } from '@/lib/recordings'

interface Props {
  stories: Story[]
  onSelect: (storyId: string) => void
}

export default function StorySelectScreen({ stories, onSelect }: Props) {
  const [recordedIds, setRecordedIds] = useState<Set<string>>(new Set())
  const [playingId,   setPlayingId]   = useState<string | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  // IndexedDB から録音済みストーリー一覧を取得
  useEffect(() => {
    getStoriesWithRecordings().then(ids => setRecordedIds(ids))
  }, [])

  function stopPlayback() {
    audioRef.current?.pause()
    audioRef.current = null
    setPlayingId(null)
  }

  async function togglePlayback(story: Story, e: React.MouseEvent) {
    e.stopPropagation()
    if (playingId === story.id) { stopPlayback(); return }
    stopPlayback()

    const blobs = await loadAllPageRecordings(story.id, story.pages.length)
    const valid  = blobs.filter(Boolean) as Blob[]
    if (valid.length === 0) return

    setPlayingId(story.id)
    let i = 0
    const playNext = () => {
      if (i >= valid.length) { setPlayingId(null); return }
      const url   = URL.createObjectURL(valid[i++])
      const audio = new Audio(url)
      audioRef.current = audio
      audio.onended = () => { URL.revokeObjectURL(url); playNext() }
      audio.onerror = () => { URL.revokeObjectURL(url); playNext() }
      audio.play().catch(() => { URL.revokeObjectURL(url); setPlayingId(null) })
    }
    playNext()
  }

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
          return (
            <button
              key={story.id}
              onClick={() => { unlockAudio(); onSelect(story.id) }}
              className="w-full block text-left rounded-3xl shadow-sm animate-fadeInUp
                         active:scale-[0.97] transition-transform duration-150 overflow-hidden"
              style={{
                background:        '#ffffff',
                border:            '1.5px solid #D9D2C5',
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
                    style={{ backgroundColor: '#F3EDE3' }}
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
                  {/* 録音済みバッジ（タップで再生） */}
                  {recordedIds.has(story.id) && (
                    <button
                      onClick={(e) => togglePlayback(story, e)}
                      className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full
                                 flex items-center justify-center
                                 bg-forest-500 border-2 border-white shadow-sm
                                 active:scale-90 transition-transform"
                      aria-label={playingId === story.id ? '再生をとめる' : 'じぶんのこえをきく'}
                    >
                      <span className="text-[10px] leading-none">
                        {playingId === story.id ? '⏹' : '🎙'}
                      </span>
                    </button>
                  )}
                </div>

                {/* テキスト */}
                <div className="flex-1 min-w-0 overflow-hidden">
                  <p className="text-xl font-bold text-[#1A1A1A] leading-snug break-words">
                    {story.title}
                  </p>
                </div>

                {/* 矢印 */}
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center
                             text-white text-lg font-bold flex-shrink-0"
                  style={{ backgroundColor: '#468541' }}
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
