// =============================================
// speech.ts — 読み上げ機能
// iOS Safari : SpeechSynthesis API（ブラウザ内蔵）
// その他    : Google Cloud TTS via /api/speak
// =============================================

const SPEAK_URL = '/api/speak'

let currentAudio: HTMLAudioElement | null = null
let currentUtterance: SpeechSynthesisUtterance | null = null

/** iOS Safari かどうか判定 */
function isIOS(): boolean {
  if (typeof navigator === 'undefined') return false
  return (
    /iPad|iPhone|iPod/.test(navigator.userAgent) ||
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
    if (onEnd) utterance.onend = () => onEnd()
    currentUtterance = utterance
    window.speechSynthesis.speak(utterance)
  } else {
    // ── その他: Google Cloud TTS ──
    const url   = `${SPEAK_URL}?text=${encodeURIComponent(text)}`
    const audio = new Audio(url)
    currentAudio = audio
    if (onEnd) audio.onended = () => onEnd()
    audio.play().catch((err) => console.error('[speech] 再生エラー:', err))
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

/** iOS のオーディオブロック解除（非iOS では不要だが念のため残す） */
export function unlockAudio(): void {
  if (typeof window === 'undefined') return
  // iOS SpeechSynthesis はユーザージェスチャー不要のため何もしなくてよい
  // 非iOS 向けに Audio context を起こす
  if (!isIOS()) {
    const silent = new Audio(
      'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA='
    )
    silent.play().catch(() => {})
  }
}

/** VoicePreloader から呼ばれる（互換性のため残す） */
export function preloadVoice(): void {}
