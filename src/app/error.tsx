'use client'
// ③ アプリがクラッシュしたときに表示されるエラー画面
// Next.js の ErrorBoundary として機能する

import { useEffect } from 'react'

interface Props {
  error: Error & { digest?: string }
  reset: () => void
}

export default function ErrorPage({ error, reset }: Props) {
  useEffect(() => {
    console.error('[app] uncaught error:', error)
  }, [error])

  return (
    <div
      className="h-screen flex flex-col items-center justify-center px-6 gap-6"
      style={{ backgroundColor: '#faf6ea' }}
    >
      <div className="text-6xl">😢</div>
      <div className="text-center">
        <p className="text-2xl font-black text-[#3d3028] mb-2">
          エラーが おきました
        </p>
        <p className="text-base text-[#7a6555]">
          もういちど やってみてね
        </p>
      </div>
      <button
        onClick={reset}
        className="font-bold text-white rounded-2xl px-10 py-4 text-lg
                   active:translate-y-1 transition-all duration-150"
        style={{
          backgroundColor: '#4a8c3c',
          boxShadow: '0 5px 0 #1e4c1a',
        }}
      >
        もういちど
      </button>
    </div>
  )
}
