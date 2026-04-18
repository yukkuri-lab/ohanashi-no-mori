// =============================================
// speech.ts — 読み上げ機能
// 全プラットフォーム: Google Cloud TTS + AudioContext
// iOS Safari も AudioContext を使用（Journey-D の高品質な声）
// =============================================

const SPEAK_URL = '/api/speak'

let _audioCtx: AudioContext | null = null
let _currentSource: AudioBufferSourceNode | null = null

// ページ非表示 → 再表示時に AudioContext が suspend される問題を修正
if (typeof document !== 'undefined') {
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden && _audioCtx?.state === 'suspended') {
      _audioCtx.resume().catch(() => {})
    }
  })
}

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null
  if (!_audioCtx) {
    _audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
  }
  return _audioCtx
}

/**
 * iOS Safari かどうか判定（StoryScreen のハイライト切替用に export）
 * Chrome iOS (CriOS) / Firefox iOS (FxiOS) は除外
 */
export function isIOSSafari(): boolean {
  if (typeof navigator === 'undefined') return false
  const ua = navigator.userAgent
  if (/CriOS|FxiOS/.test(ua)) return false
  return (
    /iPad|iPhone|iPod/.test(ua) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
  )
}

/** テキストを読み上げる（全プラットフォーム: Google Cloud TTS） */
export function speak(text: string, onEnd?: () => void): void {
  stopSpeaking()
  speakWithAudioContext(text, onEnd)
}

async function speakWithAudioContext(text: string, onEnd?: () => void): Promise<void> {
  let ended = false
  const safeEnd = () => { if (!ended) { ended = true; onEnd?.() } }

  const ctx = getAudioContext()
  if (!ctx) { safeEnd(); return }

  // suspended なら resume（unlockAudio で既に resume 済みのはず）
  if (ctx.state === 'suspended') {
    try { await ctx.resume() } catch { safeEnd(); return }
  }

  try {
    const url = `${SPEAK_URL}?text=${encodeURIComponent(text)}`
    const res  = await fetch(url)
    if (!res.ok) { console.error('[speech] API error:', res.status); safeEnd(); return }

    const buffer  = await res.arrayBuffer()
    const decoded = await ctx.decodeAudioData(buffer)

    // 前の再生を止める
    if (_currentSource) { try { _currentSource.stop() } catch { /* ignore */ } }

    const source = ctx.createBufferSource()
    source.buffer = decoded
    source.connect(ctx.destination)
    source.onended = safeEnd
    _currentSource = source
    source.start()
  } catch (err) {
    console.error('[speech] 再生エラー:', err)
    safeEnd()
  }
}

/** 読み上げを止める */
export function stopSpeaking(): void {
  if (_currentSource) {
    try { _currentSource.stop() } catch { /* ignore */ }
    _currentSource = null
  }
}

/** 読み上げ中かどうか */
export function isSpeaking(): boolean {
  return _currentSource !== null
}

/**
 * オーディオブロック解除 — ボタンを押した瞬間（ユーザージェスチャー内）に呼ぶ
 * iOS Safari では AudioContext を resume + サイレントバッファ再生で確実にアンロック
 */
export function unlockAudio(): void {
  if (typeof window === 'undefined') return

  const ctx = getAudioContext()
  if (!ctx) return

  // resume をユーザージェスチャー内で呼ぶ
  ctx.resume().catch(() => {})

  // iOS Safari: resume だけでは不十分な場合があるため、
  // サイレントな 1サンプルバッファを再生してオーディオシステムを確実に起動する
  try {
    const buf = ctx.createBuffer(1, 1, 22050)
    const src = ctx.createBufferSource()
    src.buffer = buf
    src.connect(ctx.destination)
    src.start(0)
  } catch { /* ignore */ }
}

/** VoicePreloader から呼ばれる（互換性のため残す） */
export function preloadVoice(): void {}
