import type { Metadata } from 'next'
import { Zen_Maru_Gothic } from 'next/font/google'
import './globals.css'
import VoicePreloader from './VoicePreloader'

const zenMaru = Zen_Maru_Gothic({
  weight: ['400', '700'],
  subsets: ['latin'],
  variable: '--font-maru',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'おはなしのもり',
  description: '昔話を聞いて、やさしい質問に答えよう',
}

// viewport-fit=cover でノッチ・ダイナミックアイランド対応
export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,       // ピンチズームを無効化（子ども向けアプリのため）
  viewportFit: 'cover',  // セーフエリアを使えるようにする
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body className={`${zenMaru.variable} font-maru antialiased`}>
        <VoicePreloader />
        {children}
      </body>
    </html>
  )
}
