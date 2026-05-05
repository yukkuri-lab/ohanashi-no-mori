'use client'
import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import { Story } from '@/data/stories'
import { unlockAudio } from '@/lib/speech'
import { getRecord } from '@/lib/storage'
import { getStoriesWithRecordings, loadAllPageRecordings } from '@/lib/recordings'

// 背表紙（スパイン）の色：学年ごと
const GRADE_SPINE_COLOR: Record<1 | 2, string> = {
  1: '#f0963a', // オレンジ（小1）
  2: '#3a7ab8', // ブルー（小2）
}

interface Props {
  stories: Story[]
  onSelect: (storyId: string) => void
}

function BookCard({
  story,
  count,
  hasRecording,
  isPlaying,
  dimmed,
  onSelect,
  onTogglePlay,
}: {
  story: Story
  count: number
  hasRecording: boolean
  isPlaying: boolean
  dimmed: boolean
  onSelect: () => void
  onTogglePlay: (e: React.MouseEvent) => void
}) {
  const spineColor = GRADE_SPINE_COLOR[story.grade]
  const stars = Math.min(Math.max(count, 0), 3)

  return (
    <div
      className="flex-1 flex flex-col overflow-hidden transition-opacity"
      style={{
        opacity: dimmed ? 0.45 : 1,
        backgroundColor: '#ffffff',
        borderRadius: '0 6px 6px 0',
        borderLeft: `10px solid ${spineColor}`,
        boxShadow: [
          '4px 6px 12px rgba(0,0,0,0.28)',
          'inset -2px 0 4px rgba(0,0,0,0.06)',
        ].join(', '),
      }}
    >
      {/* ── 表紙絵 ── */}
      <button
        onClick={onSelect}
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
        {/* よんだよバッジ */}
        {count > 0 && (
          <div className="absolute top-1.5 right-1.5 bg-[#4a9068] rounded-full px-1.5 py-0.5">
            <span className="text-white text-[9px] font-bold leading-none">✓ よんだよ</span>
          </div>
        )}
      </button>

      {/* ── タイトル ── */}
      <button
        onClick={onSelect}
        className="flex-1 flex items-center justify-center px-2 py-2
                   active:opacity-80 transition-opacity"
        style={{ backgroundColor: '#ffffff', minHeight: '52px' }}
      >
        <p className="text-sm font-bold text-[#1A1A1A] text-center leading-snug break-words">
          {story.title}
        </p>
      </button>

      {/* ── フッター：星 ＋ 録音再生 ── */}
      <div
        className="flex items-center justify-between px-2 py-1.5 flex-shrink-0"
        style={{
          backgroundColor: '#faf6ea',
          borderTop: '1px solid #e8dcc8',
          minHeight: '32px',
        }}
      >
        {/* 星ランク or 未読ラベル */}
        {count > 0 ? (
          <span className="text-[11px] leading-none">
            {Array.from({ length: 3 }, (_, i) => (
              <span key={i} className={i < stars ? 'opacity-100' : 'opacity-20'}>⭐</span>
            ))}
          </span>
        ) : (
          <span className="text-[10px] text-[#c8bdb0] font-bold">まだよんでないよ</span>
        )}

        {/* 🎙 録音きく */}
        {hasRecording && (
          <button
            onClick={onTogglePlay}
            className="flex items-center gap-0.5 px-1.5 py-1 rounded-full active:scale-90 transition-transform"
            style={{
              backgroundColor: isPlaying ? '#468541' : '#e8f5e9',
              border: '1px solid #468541',
            }}
            aria-label={isPlaying ? '再生をとめる' : 'じぶんのこえをきく'}
          >
            <span className="text-[10px] leading-none">{isPlaying ? '⏹' : '🎙'}</span>
            <span
              className="text-[9px] font-bold leading-none"
              style={{ color: isPlaying ? '#ffffff' : '#468541' }}
            >
              {isPlaying ? 'とめる' : 'きく'}
            </span>
          </button>
        )}
      </div>
    </div>
  )
}

export default function StorySelectScreen({ stories, onSelect }: Props) {
  const [readCounts,  setReadCounts]  = useState<Record<string, number>>({})
  const [recordedIds, setRecordedIds] = useState<Set<string>>(new Set())
  const [playingId,   setPlayingId]   = useState<string | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setReadCounts(getRecord().readCounts ?? {})
    }
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
    const valid = blobs.filter(Boolean) as Blob[]
    if (valid.length === 0) return
    setPlayingId(story.id)
    let i = 0
    const playNext = () => {
      if (i >= valid.length) { setPlayingId(null); return }
      const url = URL.createObjectURL(valid[i++])
      const audio = new Audio(url)
      audioRef.current = audio
      audio.onended = () => { URL.revokeObjectURL(url); playNext() }
      audio.onerror = () => { URL.revokeObjectURL(url); playNext() }
      audio.play().catch(() => { URL.revokeObjectURL(url); setPlayingId(null) })
    }
    playNext()
  }

  // 読んだ／まだの分類
  const readStories   = stories.filter(s => (readCounts[s.id] ?? 0) > 0)
  const unreadStories = stories.filter(s => (readCounts[s.id] ?? 0) === 0)
  const hasAnyRead    = readStories.length > 0

  // 表示順：読んだ本→未読（初回は全部まとめて通常表示）
  const displayRead   = hasAnyRead ? readStories   : stories
  const displayUnread = hasAnyRead ? unreadStories : []

  function toRows(list: Story[]): Story[][] {
    const rows: Story[][] = []
    for (let i = 0; i < list.length; i += 2) rows.push(list.slice(i, i + 2))
    return rows
  }

  const readRows   = toRows(displayRead)
  const unreadRows = toRows(displayUnread)

  function renderShelfRows(rows: Story[][], dimmed: boolean, rowOffset: number) {
    return rows.map((row, rowIdx) => (
      <div
        key={rowIdx}
        className="flex flex-col animate-fadeInUp"
        style={{ animationDelay: `${(rowOffset + rowIdx) * 120}ms`, animationFillMode: 'both' }}
      >
        {/* 本の行 */}
        <div className="flex gap-4 px-5 pt-5 pb-0 items-end">
          {row.map(story => (
            <BookCard
              key={story.id}
              story={story}
              count={readCounts[story.id] ?? 0}
              hasRecording={recordedIds.has(story.id)}
              isPlaying={playingId === story.id}
              dimmed={dimmed}
              onSelect={() => { unlockAudio(); onSelect(story.id) }}
              onTogglePlay={(e) => { unlockAudio(); togglePlayback(story, e) }}
            />
          ))}
          {/* 奇数冊のとき空きスペース */}
          {row.length < 2 && <div className="flex-1" />}
        </div>
        {/* 棚板 */}
        <div
          style={{
            height: '18px',
            backgroundColor: '#9c6b30',
            boxShadow: '0 6px 10px rgba(0,0,0,0.25)',
          }}
        />
      </div>
    ))
  }

  return (
    <div
      className="min-h-screen-safe flex flex-col pt-safe"
      style={{ backgroundColor: '#eddfc8' }}
    >
      {/* ── ヘッダー ── */}
      <div className="pt-5 pb-3 text-center animate-fadeInUp flex-shrink-0 px-4">
        <div className="text-3xl mb-0.5">📚</div>
        <h2 className="text-2xl font-bold text-[#5a3e1b] tracking-wide">
          おはなしの もり
        </h2>
        <p className="text-xs text-[#9a7a5a] font-bold mt-0.5">
          {hasAnyRead
            ? `${readStories.length}さつ よんだよ！ すごい！`
            : 'すきなおはなしをえらんでね'}
        </p>
      </div>

      {/* ── 本棚エリア ── */}
      <div className="flex-1 pb-10 flex flex-col gap-0">

        {/* 読んだ本（または初回：全部） */}
        {renderShelfRows(readRows, false, 0)}

        {/* 区切り：まだよんでないよ */}
        {displayUnread.length > 0 && (
          <div
            className="flex items-center gap-2 px-5 pt-5 pb-0 animate-fadeInUp"
            style={{
              animationDelay: `${readRows.length * 120 + 80}ms`,
              animationFillMode: 'both',
            }}
          >
            <div className="flex-1 h-px" style={{ backgroundColor: '#c8a87a', opacity: 0.7 }} />
            <span className="text-[11px] font-bold text-[#9a7a5a] whitespace-nowrap tracking-wide">
              まだよんでないよ
            </span>
            <div className="flex-1 h-px" style={{ backgroundColor: '#c8a87a', opacity: 0.7 }} />
          </div>
        )}

        {/* 未読の本（薄く） */}
        {renderShelfRows(unreadRows, true, readRows.length + 1)}

      </div>
    </div>
  )
}
