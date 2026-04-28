import type { Metadata } from 'next'
import { Zen_Maru_Gothic } from 'next/font/google'
import './globals.css'
// ⑥ VoicePreloader は preloadVoice() が空実装のため削除

const zenMaru = Zen_Maru_Gothic({
  weight: ['400', '700'],
  subsets: ['latin'],
  variable: '--font-maru',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'おはなしの森',
  description: 'むかしばなしをきいて、やさしいもんだいにこたえよう。小学校1・2年生むけのよみきかせアプリ。',
  openGraph: {
    title: 'おはなしの森',
    description: 'むかしばなしをきいて、やさしいもんだいにこたえよう。',
    siteName: 'おはなしの森',
    locale: 'ja_JP',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'おはなしの森',
    description: 'むかしばなしをきいて、やさしいもんだいにこたえよう。',
  },
  robots: { index: true, follow: true },
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
        {children}
      </body>
    </html>
  )
}
