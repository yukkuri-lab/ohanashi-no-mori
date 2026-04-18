// =============================================
// speech.ts — 読み上げ機能
// 全プラットフォーム: Google Cloud TTS (Journey voice) + AudioContext
// =============================================

const SPEAK_URL = '/api/speak'

// AudioContext を一度だけ作成してキープする
let _audioCtx: AudioContext | null = null
let _currentSource: AudioBufferSourceNode | null = null

// iOS Safari: ページが再表示されたとき AudioContext が suspend される問題を修正
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

/** テキストを読み上げる（全プラットフォーム: Google TTS + AudioContext） */
export function speak(text: string, onEnd?: () => void): void {
  stopSpeaking()
  speakWithAudioContext(text, onEnd)
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
}

/** 読み上げ中かどうか */
export function isSpeaking(): boolean {
  return _currentSource !== null
}

/** オーディオブロック解除 — ボタンを押した瞬間（ユーザージェスチャー内）に呼ぶ */
export function unlockAudio(): void {
  if (typeof window === 'undefined') return

  const ctx = getAudioContext()
  if (ctx && ctx.state === 'suspended') {
    ctx.resume().catch(() => {})
  }
}

/** VoicePreloader から呼ばれる（互換性のため残す） */
export function preloadVoice(): void {}
