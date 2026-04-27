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
      className="h-screen-safe relative overflow-hidden flex flex-col"
      style={{ backgroundColor: '#f5f0e3' }}
    >
      {/* ── テキスト＋ボタン ── */}
      <div
        className="relative z-10 flex flex-col items-center justify-center select-none"
        style={{ height: '52%', padding: '0 32px', paddingTop: '3vh' }}
      >
        <h1
          className="font-black text-[#111] text-center leading-tight mb-3"
          style={{ fontSize: 'clamp(2.6rem, 10vw, 4.2rem)' }}
        >
          おはなしの森
        </h1>
        <p
          className="text-[#888] text-center mb-10"
          style={{ fontSize: 'clamp(0.85rem, 2.5vw, 1rem)' }}
        >
          ふしぎなおはなしがまってるよ
        </p>
        <button
          onClick={() => { unlockAudio(); onStart() }}
          className="font-bold text-white active:translate-y-1 transition-all duration-150"
          style={{
            fontSize: 'clamp(1.1rem, 3vw, 1.3rem)',
            backgroundColor: '#4a8c3c',
            borderRadius: '18px',
            padding: '16px 56px',
            minWidth: '200px',
            boxShadow: '0 6px 0 #1e4c1a, 0 8px 20px rgba(0,0,0,0.18)',
          }}
        >
          はじめる
        </button>
      </div>

      {/* ── 波の画像（下部） ── */}
      <div className="absolute bottom-0 left-0 w-full" style={{ height: '65%' }}>
        <Image
          src="/title-waves.png"
          alt=""
          fill
          style={{ objectFit: 'cover', objectPosition: 'bottom center' }}
          priority
        />
      </div>
    </div>
  )
}
