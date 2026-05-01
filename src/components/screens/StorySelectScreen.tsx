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

  // 2冊ずつ行に分ける
  const rows: Story[][] = []
  for (let i = 0; i < stories.length; i += 2) {
    rows.push(stories.slice(i, i + 2))
  }

  return (
    <div
      className="min-h-screen-safe flex flex-col pt-safe"
      style={{ backgroundColor: '#eddfc8' }}  /* 本棚の背景：あたたかいベージュ */
    >
      {/* ヘッダー */}
      <div className="pt-6 pb-5 text-center animate-fadeInUp flex-shrink-0">
        <div className="text-4xl mb-1">📚</div>
        <h2 className="text-2xl font-bold text-[#5a3e1b] tracking-wide">
          おはなしを えらんでね
        </h2>
      </div>

      {/* 本棚：2冊×行 */}
      <div className="flex-1 pb-10 flex flex-col gap-0">
        {rows.map((row, rowIdx) => (
          <div
            key={rowIdx}
            className="flex flex-col animate-fadeInUp"
            style={{ animationDelay: `${rowIdx * 120}ms`, animationFillMode: 'both' }}
          >
            {/* 本の行 */}
            <div className="flex gap-4 px-5 pt-5 pb-0 items-end">
              {row.map((story, storyIdx) => {
                const hasRecording = recordedIds.has(story.id)
                const isPlaying   = playingId === story.id

                return (
                  <div key={story.id} className="flex-1 relative">
                    <button
                      onClick={() => { unlockAudio(); onSelect(story.id) }}
                      className="w-full relative rounded-t-xl overflow-hidden
                                 active:scale-95 transition-transform duration-150 block"
                      style={{
                        backgroundColor: '#d4b896',
                        boxShadow: '2px 0 6px rgba(0,0,0,0.18), -1px 0 3px rgba(0,0,0,0.08)',
                      }}
                    >
                      {/* 3:4 アスペクト比 */}
                      <div style={{ paddingBottom: '133.33%' }} />

                      {/* カバーコンテンツ：1ページ目の絵を表紙に */}
                      <div className="absolute inset-0">
                        {story.pages[0]?.imageSrc ? (
                          <Image
                            src={story.pages[0].imageSrc}
                            alt={story.title}
                            width={300}
                            height={400}
                            className="absolute inset-0 w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <span className="text-5xl">{story.character.emoji}</span>
                          </div>
                        )}
                        {/* 下部グラデーション＋タイトル */}
                        <div
                          className="absolute bottom-0 left-0 right-0 px-2 pt-8 pb-2"
                          style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 100%)' }}
                        >
                          <p className="text-xs font-bold text-white leading-snug break-words text-center drop-shadow">
                            {story.title}
                          </p>
                        </div>
                      </div>
                    </button>

                    {/* 🎙 録音済みバッジ */}
                    {hasRecording && (
                      <button
                        onClick={(e) => togglePlayback(story, e)}
                        className="absolute top-2 right-2 z-10 w-7 h-7 rounded-full
                                   flex items-center justify-center
                                   bg-forest-500 border-2 border-white shadow-md
                                   active:scale-90 transition-transform"
                        aria-label={isPlaying ? '再生をとめる' : 'じぶんのこえをきく'}
                      >
                        <span className="text-[10px] leading-none">
                          {isPlaying ? '⏹' : '🎙'}
                        </span>
                      </button>
                    )}
                  </div>
                )
              })}

              {/* 奇数冊のとき空きスペース */}
              {row.length < 2 && <div className="flex-1" />}
            </div>

            {/* 棚板：行全体に広がる */}
            <div
              style={{
                height: '18px',
                backgroundColor: '#9c6b30',
                boxShadow: '0 6px 10px rgba(0,0,0,0.25)',
              }}
            />
          </div>
        ))}
      </div>
    </div>
  )
}
