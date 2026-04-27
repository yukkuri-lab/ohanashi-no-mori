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
      className="h-screen-safe relative overflow-hidden flex flex-col"
      style={{ backgroundColor: '#f7f2e4' }}
    >
      {/* ── メインコンテンツ（上58%） ── */}
      <div
        className="relative z-10 flex flex-col items-center justify-center select-none"
        style={{ height: '58%', padding: '0 32px' }}
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
          className="font-bold text-white rounded-[14px]
                     active:translate-y-1
                     transition-all duration-150"
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

      {/* ── 波形の森（下42%） ── */}
      <div className="absolute bottom-0 left-0 w-full" style={{ height: '46%' }}>
        <svg
          viewBox="0 0 1000 420"
          preserveAspectRatio="none"
          style={{ width: '100%', height: '100%', display: 'block' }}
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* 葉テクスチャ（濃い面用） */}
            <pattern id="ldark" x="0" y="0" width="44" height="44" patternUnits="userSpaceOnUse">
              <ellipse cx="11" cy="22" rx="9"  ry="3.5" fill="rgba(0,0,0,0.13)" transform="rotate(-40 11 22)"/>
              <ellipse cx="30" cy="11" rx="8"  ry="3"   fill="rgba(0,0,0,0.10)" transform="rotate(25 30 11)"/>
              <ellipse cx="33" cy="34" rx="9"  ry="3.5" fill="rgba(0,0,0,0.11)" transform="rotate(-18 33 34)"/>
              <ellipse cx="18" cy="40" rx="7"  ry="2.8" fill="rgba(0,0,0,0.08)" transform="rotate(35 18 40)"/>
            </pattern>
            {/* 葉テクスチャ（明るい面用） */}
            <pattern id="llight" x="6" y="6" width="44" height="44" patternUnits="userSpaceOnUse">
              <ellipse cx="14" cy="20" rx="10" ry="4"   fill="rgba(0,0,0,0.09)" transform="rotate(-42 14 20)"/>
              <ellipse cx="32" cy="32" rx="8"  ry="3"   fill="rgba(0,0,0,0.07)" transform="rotate(20 32 32)"/>
              <ellipse cx="26" cy="7"  rx="8"  ry="3"   fill="rgba(0,0,0,0.08)" transform="rotate(-26 26 7)"/>
              <ellipse cx="5"  cy="37" rx="8"  ry="3"   fill="rgba(0,0,0,0.06)" transform="rotate(38 5 37)"/>
            </pattern>
          </defs>

          {/* ── Wave 1: 最背面・最暗 ── */}
          <path
            d="M-10,42 C200,-2 480,12 720,50 C880,74 980,68 1010,66 L1010,420 L-10,420 Z"
            fill="#1b521b"
          />
          <path
            d="M-10,42 C200,-2 480,12 720,50 C880,74 980,68 1010,66 L1010,420 L-10,420 Z"
            fill="url(#ldark)"
          />

          {/* ── Wave 2 ── */}
          <path
            d="M-10,98 C220,56 490,68 730,104 C900,126 985,122 1010,120 L1010,420 L-10,420 Z"
            fill="#286828"
          />
          <path
            d="M-10,98 C220,56 490,68 730,104 C900,126 985,122 1010,120 L1010,420 L-10,420 Z"
            fill="url(#ldark)"
          />

          {/* ── Wave 3 ── */}
          <path
            d="M-10,158 C210,122 490,130 740,162 C906,182 990,178 1010,176 L1010,420 L-10,420 Z"
            fill="#388038"
          />
          <path
            d="M-10,158 C210,122 490,130 740,162 C906,182 990,178 1010,176 L1010,420 L-10,420 Z"
            fill="url(#llight)"
          />

          {/* ── Wave 4: 黄緑 ── */}
          <path
            d="M-10,218 C230,186 500,193 740,218 C906,234 990,232 1010,230 L1010,420 L-10,420 Z"
            fill="#7ab420"
          />
          <path
            d="M-10,218 C230,186 500,193 740,218 C906,234 990,232 1010,230 L1010,420 L-10,420 Z"
            fill="url(#llight)"
          />

          {/* ── Wave 5: 最前面・最明 ── */}
          <path
            d="M-10,274 C240,248 500,252 740,272 C906,284 990,282 1010,281 L1010,420 L-10,420 Z"
            fill="#a8c828"
          />
          <path
            d="M-10,274 C240,248 500,252 740,272 C906,284 990,282 1010,281 L1010,420 L-10,420 Z"
            fill="url(#llight)"
          />
        </svg>
      </div>
    </div>
  )
}
