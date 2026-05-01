'use client'
import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import { Story } from '@/data/stories'
import { unlockAudio } from '@/lib/speech'
import { getStoriesWithRecordings, loadAllPageRecordings } from '@/lib/recordings'

// 絵本カバーの色（物語ごとに異なる）
const COVER_COLORS = [
  '#E8A87C', // あたたかいオレンジ
  '#7BBFB5', // やさしいターコイズ
  '#B39DDB', // やわらかいむらさき
  '#81C784', // みずみずしいみどり
  '#F0B429', // あたたかいきいろ
  '#64B5F6', // さわやかなそら
  '#F06292', // やさしいピンク
  '#A1887F', // あたたかいブラウン
]

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

  return (
    <div
      className="min-h-screen-safe flex flex-col pt-safe"
      style={{ backgroundColor: '#faf6ea' }}
    >
      {/* ヘッダー */}
      <div className="pt-6 pb-5 text-center animate-fadeInUp flex-shrink-0">
        <div className="text-4xl mb-1">📚</div>
        <h2 className="text-2xl font-bold text-forest-600 tracking-wide">
          おはなしを えらんでね
        </h2>
      </div>

      {/* 本棚 */}
      <div className="flex-1 px-5 pb-10">
        <div className="grid grid-cols-2 gap-x-5 gap-y-7">
          {stories.map((story, i) => {
            const coverColor  = COVER_COLORS[i % COVER_COLORS.length]
            const hasRecording = recordedIds.has(story.id)
            const isPlaying   = playingId === story.id

            return (
              <div
                key={story.id}
                className="flex flex-col animate-fadeInUp"
                style={{ animationDelay: `${i * 80}ms`, animationFillMode: 'both' }}
              >
                {/* 絵本カバー */}
                <div className="relative">
                  <button
                    onClick={() => { unlockAudio(); onSelect(story.id) }}
                    className="w-full relative rounded-t-2xl overflow-hidden shadow-md
                               active:scale-95 transition-transform duration-150 block"
                    style={{ backgroundColor: coverColor }}
                  >
                    {/* アスペクト比 3:4 の空間確保 */}
                    <div style={{ paddingBottom: '133.33%' }} />

                    {/* カバー内コンテンツ */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 p-3">
                      {/* キャラクター */}
                      <div
                        className="w-20 h-20 rounded-full flex items-center justify-center overflow-hidden"
                        style={{ backgroundColor: 'rgba(255,255,255,0.35)' }}
                      >
                        {story.character.imageSrc ? (
                          <Image
                            src={story.character.imageSrc}
                            alt={story.character.name}
                            width={80}
                            height={80}
                            className="w-full h-full object-contain p-1"
                          />
                        ) : (
                          <span className="text-4xl">{story.character.emoji}</span>
                        )}
                      </div>

                      {/* タイトル帯 */}
                      <div
                        className="w-full rounded-xl px-2 py-2 text-center"
                        style={{ backgroundColor: 'rgba(255,255,255,0.82)' }}
                      >
                        <p className="text-sm font-bold text-[#1A1A1A] leading-snug break-words">
                          {story.title}
                        </p>
                      </div>
                    </div>
                  </button>

                  {/* 🎙 録音済みバッジ（右上） */}
                  {hasRecording && (
                    <button
                      onClick={(e) => togglePlayback(story, e)}
                      className="absolute top-2 right-2 z-10 w-8 h-8 rounded-full
                                 flex items-center justify-center
                                 bg-forest-500 border-2 border-white shadow-md
                                 active:scale-90 transition-transform"
                      aria-label={isPlaying ? '再生をとめる' : 'じぶんのこえをきく'}
                    >
                      <span className="text-[11px] leading-none">
                        {isPlaying ? '⏹' : '🎙'}
                      </span>
                    </button>
                  )}
                </div>

                {/* 棚板 */}
                <div
                  className="h-3.5 rounded-b-md"
                  style={{
                    backgroundColor: '#b5854a',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.18)',
                  }}
                />
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
