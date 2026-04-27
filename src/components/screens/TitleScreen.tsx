'use client'
import { useEffect } from 'react'
import { recordOpen } from '@/lib/storage'
import { unlockAudio } from '@/lib/speech'

interface Props {
  onStart: () => void
}

export default function TitleScreen({ onStart }: Props) {
  useEffect(() => {
    recordOpen()
  }, [])

  return (
    <div
      className="h-screen-safe flex flex-col relative overflow-hidden"
      style={{ backgroundColor: '#f7f2e4' }}
    >
      {/* ── メインコンテンツ ── */}
      <div
        className="relative z-10 flex flex-col items-center justify-center flex-1 px-8 select-none"
        style={{ paddingBottom: '38vh' }}
      >
        <h1
          className="font-black text-[#111] text-center leading-tight mb-3"
          style={{ fontSize: 'clamp(2.6rem, 10vw, 4.2rem)' }}
        >
          おはなしの森
        </h1>

        <p className="text-[#888] text-center mb-10" style={{ fontSize: 'clamp(0.85rem, 2.5vw, 1rem)' }}>
          ふしぎなおはなしがまってるよ
        </p>

        <button
          onClick={() => { unlockAudio(); onStart() }}
          className="font-bold text-white text-xl rounded-[14px]
                     shadow-[0_5px_0_#1a4520]
                     active:translate-y-1 active:shadow-[0_2px_0_#1a4520]
                     transition-all duration-150"
          style={{
            backgroundColor: '#3c7840',
            padding: '16px 56px',
            minWidth: '220px',
          }}
        >
          はじめる
        </button>
      </div>

      {/* ── 波形の森（下部） ── */}
      <div className="absolute bottom-0 left-0 w-full pointer-events-none" style={{ height: '44vh' }}>
        <svg
          viewBox="0 0 1000 440"
          preserveAspectRatio="none"
          className="w-full h-full block"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* 葉っぱのテクスチャパターン（濃い目） */}
            <pattern id="leafDark" x="0" y="0" width="48" height="48" patternUnits="userSpaceOnUse">
              <ellipse cx="12" cy="24" rx="10" ry="4"  fill="rgba(0,0,0,0.13)" transform="rotate(-38 12 24)"/>
              <ellipse cx="32" cy="12" rx="9"  ry="3.5" fill="rgba(0,0,0,0.10)" transform="rotate(22 32 12)"/>
              <ellipse cx="36" cy="36" rx="10" ry="4"  fill="rgba(0,0,0,0.11)" transform="rotate(-18 36 36)"/>
              <ellipse cx="20" cy="40" rx="8"  ry="3"  fill="rgba(0,0,0,0.09)" transform="rotate(32 20 40)"/>
            </pattern>
            {/* 葉っぱのテクスチャパターン（薄め） */}
            <pattern id="leafLight" x="4" y="4" width="48" height="48" patternUnits="userSpaceOnUse">
              <ellipse cx="14" cy="20" rx="11" ry="4.5" fill="rgba(0,0,0,0.10)" transform="rotate(-42 14 20)"/>
              <ellipse cx="34" cy="34" rx="9"  ry="3.5" fill="rgba(0,0,0,0.08)" transform="rotate(18 34 34)"/>
              <ellipse cx="28" cy="8"  rx="8"  ry="3"   fill="rgba(0,0,0,0.09)" transform="rotate(-25 28 8)"/>
              <ellipse cx="6"  cy="38" rx="9"  ry="3.5" fill="rgba(0,0,0,0.07)" transform="rotate(40 6 38)"/>
            </pattern>
          </defs>

          {/* ── Wave 1（最背面・最も暗い緑） ── */}
          <path
            d="M0,80 C100,45 220,75 340,55 C460,35 560,65 680,45 C790,25 900,55 1000,38 L1000,440 L0,440 Z"
            fill="#1c521c"
          />
          <path
            d="M0,80 C100,45 220,75 340,55 C460,35 560,65 680,45 C790,25 900,55 1000,38 L1000,440 L0,440 Z"
            fill="url(#leafDark)"
          />

          {/* ── Wave 2 ── */}
          <path
            d="M0,135 C130,95 260,130 390,108 C520,86 640,120 770,100 C880,83 950,105 1000,95 L1000,440 L0,440 Z"
            fill="#286628"
          />
          <path
            d="M0,135 C130,95 260,130 390,108 C520,86 640,120 770,100 C880,83 950,105 1000,95 L1000,440 L0,440 Z"
            fill="url(#leafDark)"
          />

          {/* ── Wave 3 ── */}
          <path
            d="M0,195 C110,160 230,192 360,172 C490,152 610,185 740,165 C850,148 940,170 1000,158 L1000,440 L0,440 Z"
            fill="#388038"
          />
          <path
            d="M0,195 C110,160 230,192 360,172 C490,152 610,185 740,165 C850,148 940,170 1000,158 L1000,440 L0,440 Z"
            fill="url(#leafLight)"
          />

          {/* ── Wave 4（黄緑） ── */}
          <path
            d="M0,262 C140,230 270,258 400,240 C530,222 650,250 780,233 C880,220 950,240 1000,230 L1000,440 L0,440 Z"
            fill="#7ab420"
          />
          <path
            d="M0,262 C140,230 270,258 400,240 C530,222 650,250 780,233 C880,220 950,240 1000,230 L1000,440 L0,440 Z"
            fill="url(#leafLight)"
          />

          {/* ── Wave 5（最前面・明るい黄緑） ── */}
          <path
            d="M0,318 C110,296 240,316 370,302 C500,288 620,308 750,295 C860,284 950,298 1000,292 L1000,440 L0,440 Z"
            fill="#a8c828"
          />
          <path
            d="M0,318 C110,296 240,316 370,302 C500,288 620,308 750,295 C860,284 950,298 1000,292 L1000,440 L0,440 Z"
            fill="url(#leafLight)"
          />
        </svg>
      </div>
    </div>
  )
}
