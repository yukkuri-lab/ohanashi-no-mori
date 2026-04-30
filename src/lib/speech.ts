// =============================================
// speech.ts — 読み上げ機能
// 1st try: <audio> 要素 + Google Cloud TTS
// fallback: Web Speech API (SpeechSynthesis)
// iOS Safari / Chrome iOS でも確実に動く方法
// =============================================

const SPEAK_URL = '/api/speak?v=5'

// iOS アンロック用のミニマムな無音 WAV（44バイト）
const SILENT_WAV = 'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA='

let _audioEl: HTMLAudioElement | null = null

function getAudio(): HTMLAudioElement | null {
  if (typeof document === 'undefined') return null
  if (!_audioEl) {
    _audioEl = new Audio()
    _audioEl.setAttribute('playsinline', '')
    _audioEl.preload = 'none'
  }
  return _audioEl
}

// ページ再表示時に再生が止まっていたら再開
let _visibilityListenerAdded = false
if (typeof document !== 'undefined' && !_visibilityListenerAdded) {
  _visibilityListenerAdded = true
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
      const el = getAudio()
      if (el && el.paused && el.src && !el.ended && el.currentTime > 0) {
        el.play().catch(() => {})
      }
    }
  })
}

/**
 * iOS Safari かどうか判定
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

const SPEAK_TIMEOUT_MS = 8000

// ─────────────────────────────────────────────
// Web Speech API フォールバック
// ─────────────────────────────────────────────

/** 日本語ボイスをキャッシュ */
let _jaVoice: SpeechSynthesisVoice | null | undefined = undefined

function getJaVoice(): SpeechSynthesisVoice | null {
  if (typeof window === 'undefined' || !window.speechSynthesis) return null
  if (_jaVoice !== undefined) return _jaVoice

  const voices = window.speechSynthesis.getVoices()
  // ja-JP を優先、なければ ja で始まるものを使う
  _jaVoice =
    voices.find(v => v.lang === 'ja-JP') ??
    voices.find(v => v.lang.startsWith('ja')) ??
    null
  return _jaVoice
}

// voiceschanged でキャッシュをリフレッシュ
if (typeof window !== 'undefined' && window.speechSynthesis) {
  window.speechSynthesis.addEventListener('voiceschanged', () => {
    _jaVoice = undefined
  })
}

/** Web Speech API で読み上げる（Google TTS 失敗時のフォールバック） */
function speakWithWebSpeech(
  text: string,
  onEnd?: () => void,
  onError?: () => void,
): void {
  if (typeof window === 'undefined' || !window.speechSynthesis) {
    onError?.()
    onEnd?.()
    return
  }

  // 既存の発話をキャンセル
  window.speechSynthesis.cancel()

  const utter = new SpeechSynthesisUtterance(text)
  utter.lang  = 'ja-JP'
  utter.rate  = 0.88   // 子ども向けに少しゆっくり
  utter.pitch = 1.05

  const voice = getJaVoice()
  if (voice) utter.voice = voice

  let ended = false
  utter.onend = () => {
    if (!ended) { ended = true; onEnd?.() }
  }
  utter.onerror = (e) => {
    // 'interrupted' はこちらが cancel() したケース → エラー扱いしない
    if (e.error === 'interrupted') return
    console.warn('[speech] WebSpeech error:', e.error)
    if (!ended) { ended = true; onError?.(); onEnd?.() }
  }

  window.speechSynthesis.speak(utter)
  console.info('[speech] fallback → Web Speech API')
}

// ─────────────────────────────────────────────
// メイン speak 関数
// ─────────────────────────────────────────────

/** テキストを読み上げる（Google TTS → Web Speech API フォールバック） */
export function speak(text: string, onEnd?: () => void, onError?: () => void): void {
  stopSpeaking()

  const el = getAudio()
  if (!el) {
    // <audio> 要素が使えない（SSR等）→ Web Speech API で試みる
    speakWithWebSpeech(text, onEnd, onError)
    return
  }

  let ended = false

  // Google TTS 失敗 → Web Speech API にフォールバック
  const fallback = () => {
    if (ended) return
    ended = true
    clearTimeout(timeoutId)
    speakWithWebSpeech(text, onEnd, onError)
  }

  const safeEnd = () => {
    if (!ended) { ended = true; clearTimeout(timeoutId); onEnd?.() }
  }

  // タイムアウト → フォールバック
  // ※ ネットワーク取得・デコードに失敗した場合のみ発動させる
  //    再生が始まったら clearTimeout して、あとは onended を待つ
  const timeoutId = setTimeout(() => {
    console.warn('[speech] Google TTS timeout – falling back to Web Speech API')
    el.src = ''
    fallback()
  }, SPEAK_TIMEOUT_MS)

  const url = `${SPEAK_URL}&text=${encodeURIComponent(text)}`
  el.src = url
  el.onended = safeEnd
  // 再生開始できたらタイムアウトをキャンセル（長い音声でも途中で止まらなくなる）
  el.onplaying = () => clearTimeout(timeoutId)
  el.onerror = () => {
    console.warn('[speech] Google TTS audio error – falling back to Web Speech API')
    fallback()
  }

  el.play().catch(err => {
    console.warn('[speech] Google TTS play() rejected – falling back to Web Speech API:', err)
    fallback()
  })
}

/** 読み上げを止める（Google TTS + Web Speech API 両方） */
export function stopSpeaking(): void {
  // Google TTS 停止
  const el = getAudio()
  if (el) {
    el.onended = null
    el.onerror = null
    el.pause()
  }
  // Web Speech API 停止
  if (typeof window !== 'undefined' && window.speechSynthesis) {
    window.speechSynthesis.cancel()
  }
}

/** 読み上げ中かどうか */
export function isSpeaking(): boolean {
  const el = getAudio()
  const audioPlaying = el ? !el.paused && !el.ended && el.currentTime > 0 : false
  const webSpeechPlaying =
    typeof window !== 'undefined' &&
    window.speechSynthesis?.speaking === true
  return audioPlaying || webSpeechPlaying
}

/**
 * オーディオブロック解除 — ボタンを押した瞬間（ユーザージェスチャー内）に呼ぶ
 */
let _audioUnlocked = false

export function unlockAudio(): void {
  if (typeof window === 'undefined') return
  // <audio> 要素のアンロック
  if (!_audioUnlocked) {
    const el = getAudio()
    if (el) {
      el.src = SILENT_WAV
      el.play()
        .then(() => { _audioUnlocked = true })
        .catch((err) => console.warn('[speech] iOS audio unlock failed:', err))
    }
  }
  // Web Audio (sounds.ts) も同じユーザージェスチャー内でアンロック
  import('@/lib/sounds').then(({ unlockSounds }) => unlockSounds()).catch(() => {})
}

/** VoicePreloader から呼ばれる（互換性のため残す） */
export function preloadVoice(): void {}
