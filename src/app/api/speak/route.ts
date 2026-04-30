// =============================================
// /api/speak — Google Cloud Text-to-Speech API で音声を生成して返す
// APIキーは環境変数 GOOGLE_TTS_API_KEY に設定（コードには絶対に書かない）
// Journey ボイス + SSML で自然な抑揚を実現
// =============================================

import { NextRequest } from 'next/server'

const VOICE_NAME    = 'ja-JP-Neural2-C' // Neural2-C: 温かみのある自然な女性の日本語音声
const SPEAKING_RATE = 0.93              // 子ども向けにわずかにゆっくり

/**
 * テキストを SSML に変換する
 *
 * 抑揚ルール：
 *  1. 「台詞」→ ピッチ +2.5st でいきいきと（セリフ感を強める）
 *  2. 感嘆文（！で終わる文節）→ ピッチ +1.5st で明るく・元気よく
 *  3. 疑問文（？で終わる文節）→ ピッチ +1.0st で語尾を上げる
 *  4. 改行 → 650ms ポーズ（場面・段落の切り替え）
 *  5. 句読点ポーズ: 。450ms / 、200ms / ！280ms / ？360ms / …600ms
 *
 * 実装方針：
 *  - 台詞「」をプレースホルダーに置換 → 感嘆・疑問の検出 → ポーズ挿入 → 台詞を戻す
 *  - これにより台詞内の！？を誤って感嘆文・疑問文とみなすのを防ぐ
 */
function toSSML(text: string): string {
  // XML特殊文字をエスケープ
  const esc = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')

  // ─── Step 1: 台詞「」をプレースホルダーに退避 ───
  const dialogues: string[] = []
  let ssml = esc.replace(/「([^」]*)」/g, (_, inner) => {
    const idx = dialogues.length
    // 台詞内の読点にもポーズを入れておく
    const innerWithBreaks = inner.replace(/、/g, '、<break time="180ms"/>')
    dialogues.push(`「<prosody pitch="+2.5st">${innerWithBreaks}</prosody>」`)
    return `\x00${idx}\x00`
  })

  // ─── Step 2: 感嘆文（！直前の文節）をピッチアップ ───
  // \x00 / 。！？\n を越えない範囲でマッチ → 台詞や他の文には影響しない
  ssml = ssml.replace(/([^\x00。！？\n]+)(?=！)/g, (seg) =>
    `<prosody pitch="+1.5st">${seg}</prosody>`
  )

  // ─── Step 3: 疑問文（？直前の文節）をピッチアップ ───
  ssml = ssml.replace(/([^\x00。！？\n]+)(?=？)/g, (seg) =>
    `<prosody pitch="+1.0st">${seg}</prosody>`
  )

  // ─── Step 4: 句読点・改行にポーズを挿入 ───
  ssml = ssml
    .replace(/\n/g, '<break time="650ms"/>')   // 段落・場面転換
    .replace(/。/g, '。<break time="450ms"/>')  // 文末（やや長め）
    .replace(/、/g, '、<break time="200ms"/>')  // 読点
    .replace(/！/g, '！<break time="280ms"/>')  // 感嘆
    .replace(/？/g, '？<break time="360ms"/>')  // 疑問
    .replace(/…/g, '<break time="600ms"/>')    // 沈黙・余韻
    .replace(/・・・/g, '<break time="600ms"/>') // 同上（表記ゆれ対応）

  // ─── Step 5: 台詞プレースホルダーを戻す ───
  ssml = ssml.replace(/\x00(\d+)\x00/g, (_, idx) => dialogues[parseInt(idx)])

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
