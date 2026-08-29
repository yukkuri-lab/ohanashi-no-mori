'use client'
import { useEffect, useState } from 'react'
import Image from 'next/image'
import { recordOpen, clearRecord } from '@/lib/storage'
import { deleteAllRecordings } from '@/lib/recordings'
import { unlockAudio } from '@/lib/speech'

interface Props {
  onStart: () => void
}

export default function TitleScreen({ onStart }: Props) {
  const [cleared, setCleared] = useState(false)
  useEffect(() => { recordOpen() }, [])

  // おうちのかた用：学習の記録と、録音した声をすべて消す。
  // 子どもが誤って押さないよう、隅に小さく置いて確認も挟む。
  async function handleClearAll() {
    const ok = window.confirm(
      'このはしまつは、おうちのかた向けです。\n\n' +
      '・がくしゅうの きろく（よんだ回数・せいかい数）\n' +
      '・ろくおんした こえ すべて\n\n' +
      'この2つを すべて 消します。もとには もどせません。よろしいですか？'
    )
    if (!ok) return
    clearRecord()
    await deleteAllRecordings()
    setCleared(true)
    setTimeout(() => setCleared(false), 3000)
  }

  return (
    <div
      className="h-screen-safe relative overflow-hidden"
      style={{ backgroundColor: '#f5f0e3' }}
    >
      {/* ── iPhone用背景画像（md未満） ── */}
      <div className="absolute inset-0 md:hidden pointer-events-none">
        <Image
          src="/ohanashinomori.jpeg"
          alt=""
          fill
          style={{ objectFit: 'contain', objectPosition: 'center' }}
          priority
        />
      </div>

      {/* ── iPad / PC用背景画像（md以上） ── */}
      <div className="absolute inset-0 hidden md:block pointer-events-none">
        <Image
          src="/ohanashinomori-large.jpeg"
          alt=""
          fill
          style={{ objectFit: 'contain', objectPosition: 'center' }}
          priority
        />
      </div>

      {/* ── 全画面タップエリア ── */}
      <button
        onClick={() => { unlockAudio(); onStart() }}
        aria-label="はじめる"
        className="absolute inset-0 w-full h-full pointer-events-auto active:opacity-70 transition-opacity"
        style={{
          backgroundColor: 'transparent',
          border: 'none',
          cursor: 'pointer',
          WebkitTapHighlightColor: 'transparent',
        }}
      />

      {/* ── おうちのかたへ（左下・小さく。子どもが押しにくい位置） ── */}
      <div
        className="absolute bottom-1 left-2 z-10"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        <button
          onClick={(e) => { e.stopPropagation(); handleClearAll() }}
          className="inline-flex items-center min-h-[24px] text-xs text-black/70 active:text-black/60 bg-[#faf6ea] rounded-full px-2 py-1"
          aria-label="おうちのかた向け：きろくとろくおんをすべて消す"
        >
          {cleared ? 'けしました' : 'おうちのかたへ'}
        </button>
      </div>

      {/* ── バージョン表示（右下・目立たない） ── */}
      <div
        className="absolute bottom-2 right-3 pointer-events-none select-none"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        <span suppressHydrationWarning className="text-xs font-mono text-black/70 tracking-tight bg-[#faf6ea] rounded-full px-2 py-0.5">
          {process.env.NEXT_PUBLIC_BUILD_TIME}
        </span>
      </div>
    </div>
  )
}
