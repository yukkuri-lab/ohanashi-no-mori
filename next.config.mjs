/** @type {import('next').NextConfig} */

// ビルド日時を NEXT_PUBLIC_BUILD_TIME として埋め込む（JST で表示）
const buildTime = new Date().toLocaleString('ja-JP', {
  timeZone: 'Asia/Tokyo',
  year:   '2-digit',
  month:  '2-digit',
  day:    '2-digit',
  hour:   '2-digit',
  minute: '2-digit',
  hour12: false,
})

const nextConfig = {
  env: {
    NEXT_PUBLIC_BUILD_TIME: buildTime,
  },
  // ② ビルド最適化
  compress: true,                        // gzip 圧縮を有効化
  productionBrowserSourceMaps: false,    // 本番でソースマップを出力しない（バンドル軽量化）
  poweredByHeader: false,                // X-Powered-By ヘッダーを削除（セキュリティ向上）

  // 画像最適化：モダンフォーマット優先配信
  images: {
    formats: ['image/avif', 'image/webp'],
    // public/ 内のローカル画像を使用（外部ドメインなし）
  },

  // 実験的機能：パッケージインポートの最適化
  experimental: {
    optimizePackageImports: ['next/image'],
  },
}

export default nextConfig
