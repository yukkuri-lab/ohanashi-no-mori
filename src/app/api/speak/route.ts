// =============================================
// /api/speak — Google Cloud Text-to-Speech API で音声を生成して返す
// APIキーは環境変数 GOOGLE_TTS_API_KEY に設定（コードには絶対に書かない）
// =============================================

import { NextRequest } from 'next/server'

const VOICE_NAME   = 'ja-JP-Neural2-B' // 自然でやさしい女性の声
const SPEAKING_RATE = 0.9              // 読み上げ速度（1.0が標準、小さいほどゆっくり）

export async function GET(req: NextRequest) {
  const text = req.nextUrl.searchParams.get('text') ?? ''
  if (!text.trim()) {
    return new Response('text is required', { status: 400 })
  }

  const apiKey = process.env.GOOGLE_TTS_API_KEY
  if (!apiKey) {
    return new Response('GOOGLE_TTS_API_KEY が設定されていません', { status: 500 })
  }

  try {
    const res = await fetch(
      `https://texttospeech.googleapis.com/v1/text:synthesize?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          input: { text },
          voice: {
            languageCode: 'ja-JP',
            name: VOICE_NAME,
          },
          audioConfig: {
            audioEncoding: 'MP3',
            speakingRate: SPEAKING_RATE,
          },
        }),
      }
    )

    if (!res.ok) {
      const err = await res.text()
      console.error('[speak API] Google TTS error:', err)
      return new Response('音声の生成に失敗しました', { status: 500 })
    }

    const { audioContent } = await res.json() as { audioContent: string }

    // audioContent は Base64 エンコードされた MP3
    const audioBuffer = Buffer.from(audioContent, 'base64')

    return new Response(audioBuffer, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Cache-Control': 'public, max-age=86400', // 同じテキストは1日キャッシュ（API呼び出し節約）
      },
    })
  } catch (err) {
    console.error('[speak API] error:', err)
    return new Response('音声の生成に失敗しました', { status: 500 })
  }
}
