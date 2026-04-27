'use client'
import { useEffect } from 'react'
import { recordOpen } from '@/lib/storage'
import { unlockAudio } from '@/lib/speech'

interface Props {
  onStart: () => void
}

// 2色のみ：明るい黄緑 ↔ 濃い緑（参考画像に合わせる）
const YG = '#bcd428'   // bright yellow-green
const DG = '#1e5820'   // dark forest green

export default function TitleScreen({ onStart }: Props) {
  useEffect(() => { recordOpen() }, [])

  return (
    <div
      className="h-screen-safe relative overflow-hidden flex flex-col"
      style={{ backgroundColor: '#f7f2e4' }}
    >
      {/* ── テキスト＋ボタン ── */}
      <div
        className="relative z-10 flex flex-col items-center justify-center select-none"
        style={{ height: '45%', padding: '0 32px', paddingTop: '5vh' }}
      >
        <h1
          className="font-black text-[#111] text-center leading-tight mb-3"
          style={{ fontSize: 'clamp(2.6rem, 10vw, 4.2rem)' }}
        >
          おはなしの森
        </h1>
        <p className="text-[#888] text-center mb-10"
           style={{ fontSize: 'clamp(0.85rem, 2.5vw, 1rem)' }}>
          ふしぎなおはなしがまってるよ
        </p>
        <button
          onClick={() => { unlockAudio(); onStart() }}
          className="font-bold text-white rounded-[14px] active:translate-y-1 transition-all duration-150"
          style={{
            fontSize: 'clamp(1.1rem, 3vw, 1.3rem)',
            backgroundColor: '#3c7840',
            padding: '16px 56px',
            minWidth: '200px',
            boxShadow: '0 5px 0 #1a4520',
          }}
        >
          はじめる
        </button>
      </div>

      {/* ── 波形の森 ── */}
      <div className="absolute bottom-0 left-0 w-full" style={{ height: '62%' }}>
        <svg
          viewBox="0 0 1000 420"
          preserveAspectRatio="none"
          style={{ width: '100%', height: '100%', display: 'block' }}
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* 点描テクスチャ（黄緑面用） */}
            <pattern id="dotYG" x="0" y="0" width="7" height="7" patternUnits="userSpaceOnUse">
              <circle cx="1.8" cy="1.8" r="1.1" fill="rgba(0,60,0,0.30)"/>
              <circle cx="5.3" cy="5.3" r="0.8" fill="rgba(0,60,0,0.18)"/>
              <circle cx="5.3" cy="1.8" r="0.5" fill="rgba(0,60,0,0.12)"/>
              <circle cx="1.8" cy="5.3" r="0.6" fill="rgba(0,60,0,0.14)"/>
            </pattern>
            {/* 点描テクスチャ（濃い緑面用） */}
            <pattern id="dotDG" x="2" y="2" width="7" height="7" patternUnits="userSpaceOnUse">
              <circle cx="1.8" cy="1.8" r="0.9" fill="rgba(0,0,0,0.25)"/>
              <circle cx="5.3" cy="5.3" r="0.7" fill="rgba(0,0,0,0.15)"/>
              <circle cx="5.3" cy="1.8" r="0.4" fill="rgba(0,0,0,0.10)"/>
              <circle cx="1.8" cy="5.3" r="0.5" fill="rgba(0,0,0,0.12)"/>
            </pattern>
          </defs>

          {/*
            描画順（後 → 前）:
            1. YG（背面）: 左右に2つの丘 → 上部に黄緑の山2つ見える
            2. DG: YGの谷を埋める → 山の間に緑
            3. YG: 中間バンド
            4. DG（前面）: 最前面のバンド
          */}

          {/* ── Layer 1: YG（背面）左右に2つの丘 ── */}
          <path
            d="M-10,55 C60,15 180,8 330,60 C460,105 540,100 680,8 C830,8 940,28 1010,55 L1010,420 L-10,420 Z"
            fill={YG}
          />
          <path
            d="M-10,55 C60,15 180,8 330,60 C460,105 540,100 680,8 C830,8 940,28 1010,55 L1010,420 L-10,420 Z"
            fill="url(#dotYG)"
          />

          {/* ── Layer 2: DG（谷を埋め・中央の丘） ── */}
          <path
            d="M-10,95 C80,72 220,98 370,90 C480,84 560,72 700,98 C840,115 960,100 1010,95 L1010,420 L-10,420 Z"
            fill={DG}
          />
          <path
            d="M-10,95 C80,72 220,98 370,90 C480,84 560,72 700,98 C840,115 960,100 1010,95 L1010,420 L-10,420 Z"
            fill="url(#dotDG)"
          />

          {/* ── Layer 3: YG（中間バンド） ── */}
          <path
            d="M-10,175 C130,148 320,178 530,162 C700,150 860,168 1010,162 L1010,420 L-10,420 Z"
            fill={YG}
          />
          <path
            d="M-10,175 C130,148 320,178 530,162 C700,150 860,168 1010,162 L1010,420 L-10,420 Z"
            fill="url(#dotYG)"
          />

          {/* ── Layer 4: DG（前面バンド） ── */}
          <path
            d="M-10,262 C160,240 380,258 600,245 C800,233 940,248 1010,245 L1010,420 L-10,420 Z"
            fill={DG}
          />
          <path
            d="M-10,262 C160,240 380,258 600,245 C800,233 940,248 1010,245 L1010,420 L-10,420 Z"
            fill="url(#dotDG)"
          />
        </svg>
      </div>
    </div>
  )
}
