// =============================================
// speech.ts — 読み上げ機能
// iOS Safari : SpeechSynthesis API（ブラウザ内蔵）
// その他    : Google Cloud TTS + AudioContext
// =============================================

const SPEAK_URL = '/api/speak'

// AudioContext を一度だけ作成してキープする（ユーザージェスチャー後に resume）
let _audioCtx: AudioContext | null = null
let _currentSource: AudioBufferSourceNode | null = null
let currentUtterance: SpeechSynthesisUtterance | null = null

// iOS Safari: ページが再表示されたとき speechSynthesis が pause 状態になる問題を修正
if (typeof document !== 'undefined') {
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden && typeof window !== 'undefined' && window.speechSynthesis?.paused) {
      window.speechSynthesis.resume()
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
 * Chrome iOS (CriOS) や Firefox iOS (FxiOS) は除外する
 * → それらは AudioContext + Google TTS を利用
 */
function isIOS(): boolean {
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

  if (isIOS() && typeof window !== 'undefined' && 'speechSynthesis' in window) {
    // ── iOS Safari: Web Speech API ──
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang  = 'ja-JP'
    utterance.rate  = 0.88
    utterance.pitch = 1.05
    let ended = false
    const safeEnd = () => { if (!ended) { ended = true; onEnd?.() } }
    utterance.onend   = safeEnd
    utterance.onerror = safeEnd
    currentUtterance = utterance
    window.speechSynthesis.speak(utterance)
  } else {
    // ── その他: Google Cloud TTS + AudioContext ──
    speakWithAudioContext(text, onEnd)
  }
}

async function speakWithAudioContext(text: string, onEnd?: () => void): Promise<void> {
  let ended = false
  const safeEnd = () => { if (!ended) { ended = true; onEnd?.() } }

  const ctx = getAudioContext()
  if (!ctx) { safeEnd(); return }

  // AudioContext が suspended なら resume（ユーザージェスチャー後ならOK）
  if (ctx.state === 'suspended') {
    try { await ctx.resume() } catch { safeEnd(); return }
  }

  try {
    const url = `${SPEAK_URL}?text=${encodeURIComponent(text)}`
    const res  = await fetch(url)
    if (!res.ok) { console.error('[speech] API error:', res.status); safeEnd(); return }

    const buffer  = await res.arrayBuffer()
    const decoded = await ctx.decodeAudioData(buffer)

    // 前の音声が残っていれば止める
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
  // iOS Safari: 常にキューをクリア（詰まり防止）
  if (typeof window !== 'undefined') window.speechSynthesis?.cancel()
  currentUtterance = null
}

/** 読み上げ中かどうか */
export function isSpeaking(): boolean {
  if (currentUtterance) return window.speechSynthesis?.speaking ?? false
  return false
}

/** オーディオブロック解除 — ボタンを押した瞬間（ユーザージェスチャー内）に呼ぶ */
export function unlockAudio(): void {
  if (typeof window === 'undefined') return

  // iOS Safari: 一度 cancel() してからダミー utterance で起こす
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel()
    const unlock = new SpeechSynthesisUtterance('・')
    unlock.volume = 0.001  // ほぼ無音だが確実にアンロック
    unlock.lang = 'ja-JP'
    window.speechSynthesis.speak(unlock)
  }

  // AudioContext を作成・resume（これ以降 play() がユーザージェスチャー不要になる）
  const ctx = getAudioContext()
  if (ctx && ctx.state === 'suspended') {
    ctx.resume().catch(() => {})
  }
}

/** VoicePreloader から呼ばれる（互換性のため残す） */
export function preloadVoice(): void {}
