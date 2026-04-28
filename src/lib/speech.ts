// =============================================
// speech.ts — 読み上げ機能
// 全プラットフォーム: <audio> 要素 + Google Cloud TTS
// iOS Safari / Chrome iOS でも確実に動く方法
// =============================================

const SPEAK_URL = '/api/speak?v=5'  // v= を変えるとキャッシュがリセットされる

// iOS アンロック用のミニマムな無音 WAV（44バイト）
const SILENT_WAV = 'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA='

let _audioEl: HTMLAudioElement | null = null

function getAudio(): HTMLAudioElement | null {
  if (typeof document === 'undefined') return null
  if (!_audioEl) {
    _audioEl = new Audio()
    _audioEl.setAttribute('playsinline', '')  // iOS: インライン再生
    _audioEl.preload = 'none'
  }
  return _audioEl
}

// ④ ページ再表示時に再生が止まっていたら再開（重複登録防止フラグ付き）
let _visibilityListenerAdded = false
if (typeof document !== 'undefined' && !_visibilityListenerAdded) {
  _visibilityListenerAdded = true
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
      const el = getAudio()
      // iOS がバックグラウンド時に pause した場合に再開
      if (el && el.paused && el.src && !el.ended && el.currentTime > 0) {
        el.play().catch(() => {})
      }
    }
  })
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

const SPEAK_TIMEOUT_MS = 8000 // 8秒でタイムアウト

/** テキストを読み上げる */
export function speak(text: string, onEnd?: () => void, onError?: () => void): void {
  stopSpeaking()

  const el = getAudio()
  if (!el) { onEnd?.(); return }

  let ended = false
  const safeEnd = () => { if (!ended) { ended = true; clearTimeout(timeoutId); onEnd?.() } }
  const safeError = () => { if (!ended) { ended = true; clearTimeout(timeoutId); onError?.(); onEnd?.() } }

  // タイムアウト：音声が一定時間内に再生開始しない場合はスキップ
  const timeoutId = setTimeout(() => {
    console.warn('[speech] timeout – skipping')
    el.src = ''
    safeError()
  }, SPEAK_TIMEOUT_MS)

  const url = `${SPEAK_URL}&text=${encodeURIComponent(text)}`
  el.src = url
  el.onended  = safeEnd
  el.onerror  = () => { console.error('[speech] audio error'); safeError() }

  el.play().catch(err => {
    console.error('[speech] play() rejected:', err)
    safeError()
  })
}

/** 読み上げを止める */
export function stopSpeaking(): void {
  const el = getAudio()
  if (!el) return
  el.onended = null
  el.onerror = null
  el.pause()
}

/** 読み上げ中かどうか */
export function isSpeaking(): boolean {
  const el = getAudio()
  return el ? !el.paused && !el.ended && el.currentTime > 0 : false
}

/**
 * オーディオブロック解除 — ボタンを押した瞬間（ユーザージェスチャー内）に呼ぶ
 * iOS では <audio>.play() をジェスチャー内で一度呼ぶことで以後の再生が可能になる
 */
export function unlockAudio(): void {
  if (typeof window === 'undefined') return
  const el = getAudio()
  if (!el) return
  // ⑧ 無音WAVをジェスチャー内で再生 → iOS オーディオをアンロック（成否をログ）
  el.src = SILENT_WAV
  el.play()
    .then(() => { /* iOS audio unlock 成功 */ })
    .catch((err) => console.warn('[speech] iOS audio unlock failed:', err))
}

/** VoicePreloader から呼ばれる（互換性のため残す） */
export function preloadVoice(): void {}
