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

      {/* ── 透明なタップボタン（画像の「はじめる」の上に重ねる） ── */}
      {/* top/height は画像内のボタン位置に合わせて調整 */}
      <button
        onClick={() => { unlockAudio(); onStart() }}
        aria-label="はじめる"
        className="absolute pointer-events-auto active:opacity-40 transition-opacity"
        style={{
          top: '44%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '64%',
          maxWidth: '320px',
          height: '80px',          /* 大きめのタップ領域 */
          backgroundColor: 'transparent',
          border: 'none',
          borderRadius: '20px',
          cursor: 'pointer',
          WebkitTapHighlightColor: 'transparent',
        }}
      />
    </div>
  )
}
