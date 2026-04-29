// =============================================
// /api/speak — Google Cloud Text-to-Speech API で音声を生成して返す
// APIキーは環境変数 GOOGLE_TTS_API_KEY に設定（コードには絶対に書かない）
// Journey ボイス + SSML で自然な抑揚を実現
// =============================================

import { NextRequest } from 'next/server'

const VOICE_NAME    = 'ja-JP-Neural2-B' // Neural2: 安定して動作する自然な日本語音声
const SPEAKING_RATE = 0.95              // 子ども向けにわずかにゆっくり

/**
 * テキストを SSML に変換する
 * - 句読点の後にポーズを挿入して自然なリズムを作る
 * - 「台詞」部分をわずかに強調してドラマチックに読む
 */
function toSSML(text: string): string {
  // XML特殊文字をエスケープ
  const escaped = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')

  let ssml = escaped
    // 文末の句点 → 長めのポーズ
    .replace(/。/g, '。<break time="450ms"/>')
    // 読点 → 短いポーズ
    .replace(/、/g, '、<break time="200ms"/>')
    // 感嘆符・疑問符 → 適度なポーズ
    .replace(/！/g, '！<break time="350ms"/>')
    .replace(/？/g, '？<break time="400ms"/>')
    // 三点リーダー → 間（ま）
    .replace(/…/g, '<break time="500ms"/>')
    .replace(/・・・/g, '<break time="500ms"/>')

  // 「台詞」を少しテンポを落として丁寧に読む
  ssml = ssml.replace(/「([^」]*)」/g, (_, inner) =>
    `「<prosody rate="95%">${inner}</prosody>」`
  )

  return `<speak>${ssml}</speak>`
}

/**
 * 自分のドメイン（またはlocalhost）からのリクエストかどうかチェック
 * 外部サイトや野良ツールからの不正利用を防ぐ
 */
function isAllowedRequest(req: NextRequest): boolean {
  const origin  = req.headers.get('origin')  ?? ''
  const referer = req.headers.get('referer') ?? ''
  const source  = origin || referer

  // 開発環境（localhost）は常に許可
  if (!source || source.includes('localhost') || source.includes('127.0.0.1')) return true

  // 本番ドメイン（Vercel の環境変数 ALLOWED_ORIGIN で指定）
  const allowedOrigin = process.env.ALLOWED_ORIGIN
  if (allowedOrigin && source.startsWith(allowedOrigin)) return true

  // Vercel 環境では *.vercel.app からのリクエストを許可
  // （自分の Vercel アカウントのデプロイURLは全て vercel.app のサブドメイン）
  if (process.env.VERCEL_URL && source.includes('.vercel.app')) return true

  return false
}

export async function GET(req: NextRequest) {
  // 不正アクセスをブロック
  if (!isAllowedRequest(req)) {
    return new Response('Forbidden', { status: 403 })
  }

  const text = req.nextUrl.searchParams.get('text') ?? ''
  if (!text.trim()) {
    return new Response('text is required', { status: 400 })
  }
  // ① 文字数制限（悪意あるリクエストによる API 料金爆発を防ぐ）
  const MAX_TEXT_LENGTH = 500
  if (text.length > MAX_TEXT_LENGTH) {
    return new Response(`text too long (max ${MAX_TEXT_LENGTH} chars)`, { status: 400 })
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
          input: { ssml: toSSML(text) },  // SSML で抑揚・ポーズを適用
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
      console.error('[speak API] Google TTS error:', res.status, err)
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
