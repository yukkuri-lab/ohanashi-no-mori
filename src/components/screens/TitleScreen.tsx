'use client'
import { useEffect } from 'react'
import Image from 'next/image'
import { recordOpen } from '@/lib/storage'
import { unlockAudio } from '@/lib/speech'

interface Props {
  onStart: () => void
}

export default function TitleScreen({ onStart }: Props) {
  useEffect(() => { recordOpen() }, [])

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
    </div>
  )
}
