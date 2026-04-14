// =============================================
// speech.ts — 読み上げ機能
// iOS Safari : SpeechSynthesis API（ブラウザ内蔵）
// その他    : Google Cloud TTS via /api/speak
// =============================================

const SPEAK_URL = '/api/speak'

let currentAudio: HTMLAudioElement | null = null
let currentUtterance: SpeechSynthesisUtterance | null = null

/**
 * iOS Safari かどうか判定
 * Chrome iOS (CriOS) や Firefox iOS (FxiOS) は除外する
 * → それらは Audio API が使えるので Google TTS を利用
 */
function isIOS(): boolean {
  if (typeof navigator === 'undefined') return false
  const ua = navigator.userAgent
  // Chrome iOS・Firefox iOS は除外
  if (/CriOS|FxiOS/.test(ua)) return false
  return (
    /iPad|iPhone|iPod/.test(ua) ||
    // iPadOS 13+ は MacIntel と報告するが maxTouchPoints で区別
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
    // ── その他: Google Cloud TTS ──
    const url   = `${SPEAK_URL}?text=${encodeURIComponent(text)}`
    const audio = new Audio(url)
    currentAudio = audio
    // onEnd が複数回呼ばれないよう一度だけ呼ぶ
    let ended = false
    const safeEnd = () => { if (!ended) { ended = true; onEnd?.() } }
    audio.onended = safeEnd
    audio.onerror = () => { console.error('[speech] 読み込みエラー'); safeEnd() }
    audio.play().catch((err) => { console.error('[speech] 再生エラー:', err); safeEnd() })
  }
}

/** 読み上げを止める */
export function stopSpeaking(): void {
  if (currentAudio) {
    currentAudio.pause()
    currentAudio.src = ''
    currentAudio = null
  }
  if (currentUtterance) {
    window.speechSynthesis?.cancel()
    currentUtterance = null
  }
}

/** 読み上げ中かどうか */
export function isSpeaking(): boolean {
  if (currentAudio)     return !currentAudio.paused && !currentAudio.ended
  if (currentUtterance) return window.speechSynthesis?.speaking ?? false
  return false
}

/** オーディオブロック解除 — ボタンを押した瞬間（ユーザージェスチャー内）に呼ぶ */
export function unlockAudio(): void {
  if (typeof window === 'undefined') return
  if ('speechSynthesis' in window) {
    // iOS Safari: 最初のユーザージェスチャーで空の utterance を speak() しないとブロックされる
    const unlock = new SpeechSynthesisUtterance('')
    window.speechSynthesis.speak(unlock)
  }
  // 非iOS 向けに Audio コンテキストも起こす
  const silent = new Audio(
    'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA='
  )
  silent.play().catch(() => {})
}

/** VoicePreloader から呼ばれる（互換性のため残す） */
export function preloadVoice(): void {}
