'use client'
// アプリ起動時に音声をキャッシュしておく（画面には何も表示しない）
// これにより speak() がユーザー操作コンテキストで同期的に動けるようになる
import { useEffect } from 'react'
import { preloadVoice } from '@/lib/speech'

export default function VoicePreloader() {
  useEffect(() => {
    preloadVoice()
  }, [])
  return null
}
