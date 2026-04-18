// =============================================
// speech.ts — 読み上げ機能
// iOS Safari    : Web Speech API（ブラウザ内蔵・自然な声）
// Chrome iOS 他 : Google Cloud TTS + AudioContext
// =============================================

const SPEAK_URL = '/api/speak'

let _audioCtx: AudioContext | null = null
let _currentSource: AudioBufferSourceNode | null = null
let _currentUtterance: SpeechSynthesisUtterance | null = null

// iOS Safari: ページ非表示 → 再表示時に speechSynthesis が pause する問題を修正
if (typeof document !== 'undefined') {
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
      if (typeof window !== 'undefined' && window.speechSynthesis?.paused) {
        window.speechSynthesis.resume()
      }
      if (_audioCtx?.state === 'suspended') {
        _audioCtx.resume().catch(() => {})
      }
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
 * iOS Safari かどうか判定
 * Chrome iOS (CriOS) / Firefox iOS (FxiOS) は除外 → AudioContext を使う
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

/** テキストを読み上げる */
export function speak(text: string, onEnd?: () => void): void {
  stopSpeaking()

  if (isIOSSafari() && 'speechSynthesis' in window) {
    // ── iOS Safari: Web Speech API ──
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang  = 'ja-JP'
    utterance.rate  = 0.88
    utterance.pitch = 1.05
    let ended = false
    const safeEnd = () => { if (!ended) { ended = true; onEnd?.() } }
    utterance.onend   = safeEnd
    utterance.onerror = safeEnd
    _currentUtterance = utterance
    window.speechSynthesis.cancel()
    window.speechSynthesis.speak(utterance)
  } else {
    // ── Chrome iOS / その他: Google Cloud TTS + AudioContext ──
    speakWithAudioContext(text, onEnd)
  }
}

async function speakWithAudioContext(text: string, onEnd?: () => void): Promise<void> {
  let ended = false
  const safeEnd = () => { if (!ended) { ended = true; onEnd?.() } }

  const ctx = getAudioContext()
  if (!ctx) { safeEnd(); return }

  if (ctx.state === 'suspended') {
    try { await ctx.resume() } catch { safeEnd(); return }
  }

  try {
    const url = `${SPEAK_URL}?text=${encodeURIComponent(text)}`
    const res  = await fetch(url)
    if (!res.ok) { console.error('[speech] API error:', res.status); safeEnd(); return }

    const buffer  = await res.arrayBuffer()
    const decoded = await ctx.decodeAudioData(buffer)

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
  if (typeof window !== 'undefined') {
    window.speechSynthesis?.cancel()
  }
  _currentUtterance = null
}

/** 読み上げ中かどうか */
export function isSpeaking(): boolean {
  if (_currentUtterance) return window.speechSynthesis?.speaking ?? false
  return _currentSource !== null
}

/** オーディオブロック解除 — ボタンを押した瞬間（ユーザージェスチャー内）に呼ぶ */
export function unlockAudio(): void {
  if (typeof window === 'undefined') return

  // iOS Safari: cancel してから空の utterance でアンロック
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel()
    const unlock = new SpeechSynthesisUtterance(' ')
    unlock.volume = 0
    unlock.lang = 'ja-JP'
    window.speechSynthesis.speak(unlock)
  }

  // AudioContext unlock（Chrome iOS 他）
  const ctx = getAudioContext()
  if (ctx && ctx.state === 'suspended') {
    ctx.resume().catch(() => {})
  }
}

/** VoicePreloader から呼ばれる（互換性のため残す） */
export function preloadVoice(): void {}
