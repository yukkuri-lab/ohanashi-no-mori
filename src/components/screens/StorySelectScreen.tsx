'use client'
import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import { Story } from '@/data/stories'
import { unlockAudio } from '@/lib/speech'
import { getRecord } from '@/lib/storage'
import { getStoriesWithRecordings, loadAllPageRecordings } from '@/lib/recordings'

// 背表紙（スパイン）の色：物語ごとに異なる
const SPINE_COLORS = [
  '#c0714a', // テラコッタ
  '#4a8fa8', // スレートブルー
  '#7a5fa8', // パープル
  '#4a8f6a', // フォレストグリーン
  '#a87a2a', // ゴールデンブラウン
  '#4a6fa8', // ネイビー
  '#a84a6a', // ローズ
  '#5a7a4a', // オリーブグリーン
]

interface Props {
  stories: Story[]
  onSelect: (storyId: string) => void
}

export default function StorySelectScreen({ stories, onSelect }: Props) {
  const [readCounts,   setReadCounts]   = useState<Record<string, number>>({})
  const [recordedIds,  setRecordedIds]  = useState<Set<string>>(new Set())
  const [playingId,    setPlayingId]    = useState<string | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    // 読んだ回数（localStorage）
    if (typeof window !== 'undefined') {
      setReadCounts(getRecord().readCounts ?? {})
    }
    // 録音済み一覧（IndexedDB）
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
      style={{ backgroundColor: '#eddfc8' }}
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
                const isPlaying    = playingId === story.id
                const count        = readCounts[story.id] ?? 0
                const globalIdx    = rowIdx * 2 + storyIdx
                const spineColor   = SPINE_COLORS[globalIdx % SPINE_COLORS.length]

                return (
                  <div
                    key={story.id}
                    className="flex-1 flex flex-col overflow-hidden"
                    style={{
                      backgroundColor: '#ffffff',
                      borderRadius: '0 6px 6px 0',       // 右側だけ角丸
                      borderLeft: `10px solid ${spineColor}`,  // 背表紙
                      boxShadow: [
                        '4px 6px 12px rgba(0,0,0,0.28)',  // 接地シャドウ
                        'inset -2px 0 4px rgba(0,0,0,0.06)', // 右端：ページ感
                      ].join(', '),
                    }}
                  >
                    {/* ── 上部：絵（約35%） ── */}
                    <button
                      onClick={() => { unlockAudio(); onSelect(story.id) }}
                      className="w-full relative flex-shrink-0 active:opacity-80 transition-opacity overflow-hidden"
                      style={{ height: '90px', borderRadius: '0 6px 0 0' }}
                      aria-label={story.title}
                    >
                      {story.pages[0]?.imageSrc ? (
                        <Image
                          src={story.pages[0].imageSrc}
                          alt={story.title}
                          width={300}
                          height={200}
                          className="absolute inset-0 w-full h-full object-cover object-top"
                        />
                      ) : (
                        <div
                          className="w-full h-full flex items-center justify-center"
                          style={{ backgroundColor: '#F3EDE3' }}
                        >
                          <span className="text-4xl">{story.character.emoji}</span>
                        </div>
                      )}
                    </button>

                    {/* ── 中央：タイトル ── */}
                    <button
                      onClick={() => { unlockAudio(); onSelect(story.id) }}
                      className="flex-1 flex items-center justify-center px-2 py-3
                                 active:opacity-80 transition-opacity"
                      style={{ backgroundColor: '#ffffff', minHeight: '60px' }}
                    >
                      <p className="text-sm font-bold text-[#1A1A1A] text-center leading-snug break-words">
                        {story.title}
                      </p>
                    </button>

                    {/* ── 下部：読んだ回数 ＋ 🎙ボタン ── */}
                    <div
                      className="flex items-center justify-between px-2 py-2 flex-shrink-0"
                      style={{
                        backgroundColor: '#faf6ea',
                        borderTop: '1px solid #e8dcc8',
                        minHeight: '36px',
                      }}
                    >
                      {/* 読んだ回数 */}
                      <span className="text-[10px] font-bold text-[#9a8070]">
                        {count > 0 ? `📖 ${count}かい` : '　'}
                      </span>

                      {/* 🎙 じぶんのこえをきく */}
                      {hasRecording ? (
                        <button
                          onClick={(e) => togglePlayback(story, e)}
                          className="flex items-center gap-0.5 px-1.5 py-1 rounded-full
                                     active:scale-90 transition-transform"
                          style={{
                            backgroundColor: isPlaying ? '#468541' : '#e8f5e9',
                            border: '1px solid #468541',
                          }}
                          aria-label={isPlaying ? '再生をとめる' : 'じぶんのこえをきく'}
                        >
                          <span className="text-[10px] leading-none">
                            {isPlaying ? '⏹' : '🎙'}
                          </span>
                          <span
                            className="text-[9px] font-bold leading-none"
                            style={{ color: isPlaying ? '#ffffff' : '#468541' }}
                          >
                            {isPlaying ? 'とめる' : 'きく'}
                          </span>
                        </button>
                      ) : (
                        <span className="text-[10px] text-[#d9d2c5]">🎙</span>
                      )}
                    </div>
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
