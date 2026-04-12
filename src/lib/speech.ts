// =============================================
// speech.ts — 読み上げ機能
// /api/speak (macOS say コマンド) → Audio で再生
// 本番TTS APIに差し替えるときは SPEAK_URL だけ変えてください
// =============================================

// 音声生成APIのエンドポイント
const SPEAK_URL = '/api/speak'

// 再生中の Audio インスタンスを保持
let currentAudio: HTMLAudioElement | null = null

/** テキストを読み上げる */
export function speak(text: string, onEnd?: () => void): void {
  // 再生中なら止める
  stopSpeaking()

  const url = `${SPEAK_URL}?text=${encodeURIComponent(text)}`
  const audio = new Audio(url)
  currentAudio = audio

  if (onEnd) {
    audio.onended = () => { onEnd() }
  }

  audio.play().catch((err) => {
    console.error('[speech] 再生エラー:', err)
  })
}

/** 読み上げを止める */
export function stopSpeaking(): void {
  if (currentAudio) {
    currentAudio.pause()
    currentAudio.src = ''
    currentAudio = null
  }
}

/** 読み上げ中かどうか */
export function isSpeaking(): boolean {
  return currentAudio !== null && !currentAudio.paused && !currentAudio.ended
}

/** VoicePreloader から呼ばれる（この実装では不要だが互換性のため残す） */
export function preloadVoice(): void {
  // say コマンド方式では事前ロード不要
}
