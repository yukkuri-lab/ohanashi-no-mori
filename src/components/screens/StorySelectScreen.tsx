'use client'
import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import { Story } from '@/data/stories'
import { unlockAudio } from '@/lib/speech'
import { getRecord } from '@/lib/storage'
import { getStoriesWithRecordings, loadPageRecording } from '@/lib/recordings'

interface Props {
  stories: Story[]
  onSelect: (storyId: string) => void
}

function ForestIcon({ size = 44 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 120 100" fill="none">
      {/* 左の木 */}
      <path
        d="M24,20 C29,20 40,33 40,53 C40,64 37,70 34,70 L14,70 C11,70 8,64 8,53 C8,33 19,20 24,20Z"
        fill="#3a9040" stroke="#1a1a1a" strokeWidth="6" strokeLinejoin="round"
      />
      {/* 中央の木（一番高い） */}
      <path
        d="M60,6 C66,6 80,22 80,48 C80,61 77,70 73,70 L47,70 C43,70 40,61 40,48 C40,22 54,6 60,6Z"
        fill="#8bc34a" stroke="#1a1a1a" strokeWidth="6" strokeLinejoin="round"
      />
      {/* 右の木 */}
      <path
        d="M96,20 C101,20 112,33 112,53 C112,64 109,70 106,70 L86,70 C83,70 80,64 80,53 C80,33 91,20 96,20Z"
        fill="#2e7d32" stroke="#1a1a1a" strokeWidth="6" strokeLinejoin="round"
      />
      {/* 幹 */}
      <rect x="19" y="69" width="10" height="16" rx="2" fill="#cd8a4a" stroke="#1a1a1a" strokeWidth="5"/>
      <rect x="54" y="69" width="12" height="20" rx="2" fill="#cd8a4a" stroke="#1a1a1a" strokeWidth="5"/>
      <rect x="91" y="69" width="10" height="16" rx="2" fill="#cd8a4a" stroke="#1a1a1a" strokeWidth="5"/>
    </svg>
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
    // 全体録音（page 0）を再生
    const blob = await loadPageRecording(story.id, 0)
    if (!blob) return
    setPlayingId(story.id)
    const url = URL.createObjectURL(blob)
    const audio = new Audio(url)
    audioRef.current = audio
    audio.onended = () => { URL.revokeObjectURL(url); setPlayingId(null) }
    audio.onerror = () => { URL.revokeObjectURL(url); setPlayingId(null) }
    audio.play().catch(() => { URL.revokeObjectURL(url); setPlayingId(null) })
  }

  // フィーチャー：最多読書数のお話。同数・未読なら先頭を維持
  const featured = stories.reduce((best, s) =>
    (readCounts[s.id] ?? 0) > (readCounts[best.id] ?? 0) ? s : best
  , stories[0])

  const rest = stories.filter(s => s.id !== featured.id)
  const readRest   = rest.filter(s => (readCounts[s.id] ?? 0) > 0)
  const unreadRest = rest.filter(s => (readCounts[s.id] ?? 0) === 0)

  const featuredCount   = readCounts[featured.id] ?? 0
  const featuredStars   = Math.min(featuredCount, 3)
  const featuredHasRec  = recordedIds.has(featured.id)
  const featuredPlaying = playingId === featured.id

  return (
    <div
      className="h-screen-safe flex flex-col pt-safe"
      style={{ backgroundColor: '#faf6ea' }}
    >
      {/* ── スクロールエリア ── */}
      <div className="flex-1 scroll-area">
        <div className="max-w-lg mx-auto px-4 pt-5 pb-8 flex flex-col gap-4">

          {/* ヘッダー */}
          <div className="text-center animate-fadeInUp">
            <div className="flex justify-center mb-1">
              <ForestIcon size={48} />
            </div>
            <h2 className="text-xl font-bold text-[#5a3e1b] tracking-wide">おはなしの もり</h2>
          </div>

          {/* ── フィーチャーカード ── */}
          <div
            className="rounded-2xl overflow-hidden shadow-lg border border-[#e8dcc8] animate-popIn"
            style={{ backgroundColor: '#ffffff' }}
          >
            {/* 大きい絵 */}
            <button
              onClick={() => { unlockAudio(); onSelect(featured.id) }}
              className="w-full relative block active:opacity-80 transition-opacity"
              style={{ height: '200px' }}
              aria-label={featured.title}
            >
              {featured.pages[0]?.imageSrc ? (
                <Image
                  src={featured.pages[0].imageSrc}
                  alt={featured.title}
                  fill
                  className="object-cover object-top"
                />
              ) : (
                <div
                  className="w-full h-full flex items-center justify-center"
                  style={{ backgroundColor: '#F3EDE3' }}
                >
                  <span className="text-7xl">{featured.character.emoji}</span>
                </div>
              )}
              {/* おすすめラベル */}
              <div
                className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-xs font-bold text-white"
                style={{ backgroundColor: '#e07840', boxShadow: '0 2px 6px rgba(0,0,0,0.25)' }}
              >
                {featuredCount > 0 ? '⭐ おきにいり' : '✨ おすすめ'}
              </div>
              {/* よんだよバッジ */}
              {featuredCount > 0 && (
                <div
                  className="absolute top-3 right-3 px-2 py-1 rounded-full text-xs font-bold text-white"
                  style={{ backgroundColor: '#4a9068' }}
                >
                  ✓ よんだよ
                </div>
              )}
            </button>

            {/* カード下段 */}
            <div className="px-4 py-3 flex items-center gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-lg font-black text-[#1a1a1a] leading-snug truncate">
                  {featured.title}
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                  {featuredCount > 0 ? (
                    <>
                      <span className="text-sm leading-none">
                        {Array.from({ length: 3 }, (_, i) => (
                          <span key={i} className={i < featuredStars ? 'opacity-100' : 'opacity-20'}>⭐</span>
                        ))}
                      </span>
                      <span className="text-xs text-[#9a8070] font-bold">{featuredCount}かい よんだよ</span>
                    </>
                  ) : (
                    <span className="text-xs text-[#9a8070]">まだよんでないよ</span>
                  )}
                  {/* 録音バッジ */}
                  {featuredHasRec && (
                    <button
                      onClick={(e) => { unlockAudio(); togglePlayback(featured, e) }}
                      className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-full active:scale-90 transition-transform"
                      style={{
                        backgroundColor: featuredPlaying ? '#d97706' : '#fef3c7',
                        border: '1.5px solid #d97706',
                      }}
                      aria-label={featuredPlaying ? 'とめる' : 'じぶんのこえをきく'}
                    >
                      <span className="text-[11px]">{featuredPlaying ? '⏹' : '🎙'}</span>
                      <span className="text-[10px] font-bold" style={{ color: featuredPlaying ? '#fff' : '#92400e' }}>
                        {featuredPlaying ? 'とめる' : 'じぶんのこえ'}
                      </span>
                    </button>
                  )}
                </div>
              </div>
              {/* 丸い再生ボタン */}
              <button
                onClick={() => { unlockAudio(); onSelect(featured.id) }}
                className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0
                           active:scale-95 transition-transform"
                style={{
                  background: 'linear-gradient(135deg, #5aaa78, #3a7a58)',
                  boxShadow: '0 3px 0 #2a5a3a',
                }}
                aria-label="よむ"
              >
                <svg width="18" height="18" viewBox="0 0 48 48" fill="none">
                  <polygon points="11,5 44,24 11,43" fill="white"/>
                </svg>
              </button>
            </div>
          </div>

          {/* ── 残りのリスト ── */}
          <div className="flex flex-col gap-0 rounded-2xl overflow-hidden shadow-sm border border-[#e8dcc8]"
               style={{ backgroundColor: '#ffffff' }}>

            {/* 読んだ本 */}
            {readRest.map((story, i) => (
              <ListRow
                key={story.id}
                story={story}
                count={readCounts[story.id] ?? 0}
                hasRecording={recordedIds.has(story.id)}
                isPlaying={playingId === story.id}
                dimmed={false}
                isLast={i === readRest.length - 1 && unreadRest.length === 0}
                onSelect={() => { unlockAudio(); onSelect(story.id) }}
                onTogglePlay={(e) => { unlockAudio(); togglePlayback(story, e) }}
                animDelay={i * 60}
              />
            ))}

            {/* 区切り */}
            {unreadRest.length > 0 && (
              <div
                className="flex items-center gap-2 px-4 py-2"
                style={{ backgroundColor: '#f5f0e8', borderTop: readRest.length > 0 ? '1px solid #e8dcc8' : undefined }}
              >
                <div className="flex-1 h-px" style={{ backgroundColor: '#c8a87a', opacity: 0.5 }} />
                <span className="text-[10px] font-bold text-[#9a7a5a] whitespace-nowrap">まだよんでないよ</span>
                <div className="flex-1 h-px" style={{ backgroundColor: '#c8a87a', opacity: 0.5 }} />
              </div>
            )}

            {/* 未読本（薄く） */}
            {unreadRest.map((story, i) => (
              <ListRow
                key={story.id}
                story={story}
                count={0}
                hasRecording={false}
                isPlaying={false}
                dimmed={true}
                isLast={i === unreadRest.length - 1}
                onSelect={() => { unlockAudio(); onSelect(story.id) }}
                onTogglePlay={() => {}}
                animDelay={(readRest.length + i) * 60}
              />
            ))}
          </div>

        </div>
      </div>
    </div>
  )
}

// ── リスト行コンポーネント ──────────────────────────
function ListRow({
  story, count, hasRecording, isPlaying, dimmed, isLast,
  onSelect, onTogglePlay, animDelay,
}: {
  story: Story
  count: number
  hasRecording: boolean
  isPlaying: boolean
  dimmed: boolean
  isLast: boolean
  onSelect: () => void
  onTogglePlay: (e: React.MouseEvent) => void
  animDelay: number
}) {
  const stars = Math.min(count, 3)

  return (
    <div
      className="flex items-center gap-3 px-3 py-2.5 animate-fadeInUp"
      style={{
        opacity: dimmed ? 0.45 : 1,
        borderBottom: isLast ? 'none' : '1px solid #f0ebe0',
        animationDelay: `${animDelay}ms`,
        animationFillMode: 'both',
      }}
    >
      {/* サムネイル（録音バッジつき） */}
      <div className="relative flex-shrink-0" style={{ width: 56, height: 56 }}>
        <button
          onClick={onSelect}
          className="w-full h-full rounded-xl overflow-hidden active:opacity-80 transition-opacity"
          aria-label={story.title}
        >
          {story.pages[0]?.imageSrc ? (
            <Image
              src={story.pages[0].imageSrc}
              alt={story.title}
              width={56}
              height={56}
              className="w-full h-full object-cover object-top"
            />
          ) : (
            <div
              className="w-full h-full flex items-center justify-center"
              style={{ backgroundColor: '#F3EDE3' }}
            >
              <span className="text-2xl">{story.character.emoji}</span>
            </div>
          )}
        </button>
        {/* 🎙 録音バッジ */}
        {hasRecording && (
          <button
            onClick={onTogglePlay}
            className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center
                       active:scale-90 transition-transform"
            style={{
              backgroundColor: isPlaying ? '#d97706' : '#fbbf24',
              boxShadow: '0 1px 4px rgba(0,0,0,0.3)',
            }}
            aria-label={isPlaying ? 'とめる' : 'じぶんのこえをきく'}
          >
            <span className="text-[10px] leading-none">{isPlaying ? '⏹' : '🎙'}</span>
          </button>
        )}
      </div>

      {/* タイトル ＋ 星 */}
      <button
        onClick={onSelect}
        className="flex-1 min-w-0 text-left active:opacity-70 transition-opacity"
      >
        <p className="text-sm font-bold text-[#1a1a1a] leading-snug truncate">{story.title}</p>
        <div className="mt-0.5">
          {count > 0 ? (
            <span className="text-[11px] leading-none">
              {Array.from({ length: 3 }, (_, i) => (
                <span key={i} className={i < stars ? 'opacity-100' : 'opacity-20'}>⭐</span>
              ))}
              <span className="text-[10px] text-[#9a8070] font-bold ml-1">{count}かい</span>
            </span>
          ) : (
            <span className="text-[10px] text-[#c8bdb0]">まだよんでないよ</span>
          )}
        </div>
      </button>

      {/* 丸い再生ボタン */}
      <button
        onClick={onSelect}
        className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0
                   active:scale-95 transition-transform"
        style={{
          background: 'linear-gradient(135deg, #5aaa78, #3a7a58)',
          boxShadow: '0 2px 0 #2a5a3a',
        }}
        aria-label="よむ"
      >
        <svg width="14" height="14" viewBox="0 0 48 48" fill="none">
          <polygon points="11,5 44,24 11,43" fill="white"/>
        </svg>
      </button>
    </div>
  )
}
