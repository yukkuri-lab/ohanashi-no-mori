'use client'
import { useEffect } from 'react'
import { recordOpen } from '@/lib/storage'

interface Props {
  onStart: () => void
}

export default function TitleScreen({ onStart }: Props) {
  useEffect(() => {
    recordOpen()
  }, [])

  return (
    <div
      className="min-h-screen-safe flex flex-col items-center justify-center px-5 relative overflow-hidden"
      style={{ background: 'linear-gradient(160deg, #fff9e6 0%, #e8f5e9 50%, #e3f2fd 100%)' }}
    >
      {/* 背景ツリー（下部・セーフエリア考慮） */}
      <div className="pointer-events-none fixed bottom-0 left-0 w-full flex justify-between items-end px-3 pb-safe opacity-40">
        <TreeIcon size="small" />
        <TreeIcon size="large" />
        <TreeIcon size="small" />
        <TreeIcon size="large" />
        <TreeIcon size="small" />
      </div>

      {/* メインカード */}
      <div className="relative z-10 animate-fadeInUp
                      bg-white/75 backdrop-blur-sm
                      rounded-3xl shadow-xl border-2 border-white/90
                      w-full max-w-xs
                      px-8 py-10
                      text-center">

        <div className="text-6xl mb-3 animate-floatY">🌳</div>

        <h1 className="text-4xl font-bold text-forest-600 tracking-wider mb-2 leading-snug">
          おはなしの<br />もり
        </h1>

        <p className="text-sm text-forest-400 mb-8 tracking-wide">
          ふしぎな おはなしが まっているよ
        </p>

        {/* はじめるボタン：大きく・押しやすく */}
        <button
          onClick={onStart}
          className="w-full py-5 rounded-full text-2xl font-bold text-white tracking-widest
                     bg-gradient-to-br from-forest-400 to-forest-600
                     shadow-[0_6px_0_#224f35]
                     active:translate-y-1 active:shadow-[0_3px_0_#224f35]
                     transition-all duration-150"
        >
          はじめる
        </button>
      </div>
    </div>
  )
}

function TreeIcon({ size }: { size: 'small' | 'large' }) {
  const s = size === 'large'
    ? { trunk: 'w-3 h-10', t1: 'border-x-[28px] border-b-[52px]', t2: 'border-x-[20px] border-b-[38px] -mb-3', t3: 'border-x-[13px] border-b-[25px] -mb-2' }
    : { trunk: 'w-2 h-7',  t1: 'border-x-[18px] border-b-[34px]', t2: 'border-x-[13px] border-b-[24px] -mb-2', t3: 'border-x-[8px]  border-b-[16px] -mb-1' }
  return (
    <div className="flex flex-col items-center">
      <div className={`${s.t3} border-x-transparent border-b-[#c8e6c9]`} style={{ width: 0, height: 0, borderStyle: 'solid' }} />
      <div className={`${s.t2} border-x-transparent border-b-[#a5d6a7]`} style={{ width: 0, height: 0, borderStyle: 'solid' }} />
      <div className={`${s.t1} border-x-transparent border-b-[#81c784]`} style={{ width: 0, height: 0, borderStyle: 'solid' }} />
      <div className={`${s.trunk} bg-[#a1887f] rounded`} />
    </div>
  )
}
