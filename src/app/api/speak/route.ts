// =============================================
// /api/speak — Google Cloud Text-to-Speech API で音声を生成して返す
// APIキーは環境変数 GOOGLE_TTS_API_KEY に設定（コードには絶対に書かない）
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
 *  4. 改行 → 500ms ポーズ（場面・段落の切り替え）
 *  5. 句読点ポーズ: 。450ms / 、200ms / ！280ms / ？360ms / …600ms
 *
 * 実装方針：
 *  - 台詞「」をプレースホルダーに置換 → 感嘆・疑問の検出 → ポーズ挿入 → 台詞を戻す
 *  - これにより台詞内の！？を誤って感嘆文・疑問文とみなすのを防ぐ
 *  - 台詞は Step 4 のポーズ挿入を通らないので、台詞内のポーズは Step 1 で入れておく
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
    // 台詞は Step 4 を通らないため、句読点のポーズはここで入れ切る。
    // （入れないと、長い台詞が一息で読まれて聞き取りづらくなる）
    const innerWithBreaks = inner
      .replace(/、/g, '、<break time="180ms"/>')
      .replace(/。/g, '。<break time="380ms"/>')
      .replace(/！/g, '！<break time="260ms"/>')
      .replace(/？/g, '？<break time="330ms"/>')
      .replace(/…/g, '<break time="600ms"/>')
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
    .replace(/\n/g, '<break time="500ms"/>')   // 段落・場面転換
    .replace(/。/g, '。<break time="450ms"/>')  // 文末（やや長め）
    .replace(/、/g, '、<break time="200ms"/>')  // 読点
    .replace(/！/g, '！<break time="280ms"/>')  // 感嘆
    .replace(/？/g, '？<break time="360ms"/>')  // 疑問
    .replace(/・・・/g, '<break time="600ms"/>') // 沈黙・余韻（表記ゆれ。…より先に処理する）
    .replace(/…/g, '<break time="600ms"/>')    // 沈黙・余韻

  // ─── Step 5: 台詞プレースホルダーを戻す ───
  ssml = ssml.replace(/\x00(\d+)\x00/g, (_, idx) => dialogues[parseInt(idx)])

  return `<speak>${ssml}</speak>`
}

// =============================================
// 使いすぎ・悪用の防止
//
// 大事な注意：Origin / Referer は送る側が自由に名乗れるヘッダーなので、
// これだけでは「本物の歯止め」にはならない（curl 等では偽装できる）。
// 本当の歯止めは以下の3段構えで、①②がこのファイル、③はGoogle Cloud側の設定。
//   ① 呼び出し元のドメイン確認（素人向けの入口の鍵）
//   ② 回数制限＋1日あたりの文字数上限（請求が跳ねないための天井）
//   ③ Google Cloud で APIキー自体に HTTPリファラ制限と割当上限をかける ← 最重要
// ③の手順は README-運用メモ.md に書いてあります。
// =============================================

const RATE_WINDOW_MS    = 60_000   // 集計の窓：1分
const RATE_MAX_REQUESTS = 60       // 1分あたり60回まで（普通に読ませる分には十分足りる）
const DAILY_CHAR_BUDGET = 200_000  // 1日あたりの合計文字数の上限（これを超えたら止める）

// サーバーレスではインスタンスごとの集計になるため完全ではないが、
// 連打やスクリプトによる大量リクエストはこれで確実に頭打ちになる。
const hits = new Map<string, number[]>()
let budgetDay  = ''
let budgetUsed = 0

function clientKey(req: NextRequest): string {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get('x-real-ip') ||
    'unknown'
  )
}

/** 短時間に叩きすぎていないか */
function isRateLimited(req: NextRequest): boolean {
  const key = clientKey(req)
  const now = Date.now()
  const recent = (hits.get(key) ?? []).filter(t => now - t < RATE_WINDOW_MS)
  recent.push(now)
  hits.set(key, recent)

  // 記録が溜まりすぎないよう、古いものを掃除する
  if (hits.size > 1000) {
    const stale: string[] = []
    hits.forEach((times, k) => {
      if (times.every((t: number) => now - t >= RATE_WINDOW_MS)) stale.push(k)
    })
    stale.forEach(k => hits.delete(k))
  }
  return recent.length > RATE_MAX_REQUESTS
}

/** 今日の合計文字数が上限を超えていないか（超えていなければ加算する） */
function isOverDailyBudget(chars: number): boolean {
  const today = new Date().toISOString().slice(0, 10)
  if (today !== budgetDay) {
    budgetDay  = today
    budgetUsed = 0
  }
  if (budgetUsed + chars > DAILY_CHAR_BUDGET) return true
  budgetUsed += chars
  return false
}

/**
 * 呼び出しを許可するホスト名の一覧を作る
 * ALLOWED_ORIGIN はカンマ区切りで複数指定できる
 */
function allowedHosts(): string[] {
  const hosts: string[] = []

  for (const entry of (process.env.ALLOWED_ORIGIN ?? '').split(',')) {
    const value = entry.trim()
    if (!value) continue
    try {
      hosts.push(new URL(value).hostname)
    } catch {
      // ホスト名だけで書かれている場合（例: my-app.vercel.app）
      hosts.push(value.replace(/^https?:\/\//, '').split('/')[0])
    }
  }

  // Vercel が自動で入れてくれる自分のURL。
  // ここを「.vercel.app で終わればOK」にすると、他人がVercelに置いたサイトからも
  // 呼べてしまう（＝料金を肩代わりさせられる）ので、必ず完全一致で照合する。
  for (const value of [process.env.VERCEL_PROJECT_PRODUCTION_URL, process.env.VERCEL_URL]) {
    if (value) hosts.push(value.replace(/^https?:\/\//, '').split('/')[0])
  }

  return hosts
}

/** 自分のサイトからのリクエストかどうかの一次チェック */
function isAllowedRequest(req: NextRequest): boolean {
  const origin  = req.headers.get('origin')  ?? ''
  const referer = req.headers.get('referer') ?? ''
  const source  = origin || referer
  const isDev   = process.env.NODE_ENV !== 'production'

  // origin も referer も無いリクエスト（curl・スクリプト等）。
  // ブラウザからのアクセスなら必ずどちらかが付くので、本番では拒否する。
  if (!source) return isDev

  // 判定はホスト名で行う（パスやクエリに文字列を仕込む偽装を防ぐ）
  let host: string
  try {
    host = new URL(source).hostname
  } catch {
    return false   // URL として解釈できない source は拒否
  }

  // ローカル開発（開発時のみ）
  if (isDev && (host === 'localhost' || host === '127.0.0.1' || host === '[::1]')) return true

  return allowedHosts().includes(host)
}

export async function GET(req: NextRequest) {
  // ① 呼び出し元のドメイン確認
  if (!isAllowedRequest(req)) {
    return new Response('Forbidden', { status: 403 })
  }

  // ② 短時間の叩きすぎを止める
  if (isRateLimited(req)) {
    return new Response('Too Many Requests', {
      status: 429,
      headers: { 'Retry-After': '60' },
    })
  }

  const text = req.nextUrl.searchParams.get('text') ?? ''
  if (!text.trim()) {
    return new Response('text is required', { status: 400 })
  }

  // 1回あたりの文字数制限（1回のリクエストで請求が跳ねるのを防ぐ）
  const MAX_TEXT_LENGTH = 500
  if (text.length > MAX_TEXT_LENGTH) {
    return new Response(`text too long (max ${MAX_TEXT_LENGTH} chars)`, { status: 400 })
  }

  // ②' 1日あたりの合計文字数の天井
  if (isOverDailyBudget(text.length)) {
    console.warn('[speak API] 1日の文字数上限に達したため停止しました')
    return new Response('Daily quota exceeded', { status: 429 })
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
