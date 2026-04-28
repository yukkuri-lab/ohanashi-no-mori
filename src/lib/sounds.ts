// =============================================
// sounds.ts — 効果音（Web Audio API でプログラム生成）
// 音声ファイル不要。ボタン押下（ユーザージェスチャー）内で呼ぶこと。
// =============================================

// ⑨ Safari / 古い iOS 向けに型安全な webkitAudioContext 宣言
declare global {
  interface Window { webkitAudioContext?: typeof AudioContext }
}

let _ctx: AudioContext | null = null

function getCtx(): AudioContext | null {
  if (typeof window === 'undefined') return null

  // ⑤ closed 状態のコンテキストは再作成（バックグラウンド復帰後などに発生）
  if (_ctx?.state === 'closed') _ctx = null

  if (!_ctx) {
    const AudioCtx = window.AudioContext ?? window.webkitAudioContext
    if (!AudioCtx) return null
    _ctx = new AudioCtx()
  }

  // suspended 状態なら resume してから返す
  if (_ctx.state === 'suspended') {
    _ctx.resume().catch(() => {})
  }
  return _ctx
}

/** ピンポーン 🎵 — 正解音（明るい2音チャイム）*/
export function playCorrect(): void {
  const ctx = getCtx()
  if (!ctx) return
  // resume は getCtx() 内で処理済み

  // 「ピン」= 880Hz (A5) → 「ポーン」= 1108Hz (C#6)
  const notes = [
    { freq: 880,  startAt: 0,   duration: 0.35 },
    { freq: 1108, startAt: 0.22, duration: 0.55 },
  ]

  notes.forEach(({ freq, startAt, duration }) => {
    const osc  = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain)
    gain.connect(ctx.destination)

    osc.type = 'sine'
    osc.frequency.value = freq

    const t = ctx.currentTime + startAt
    gain.gain.setValueAtTime(0, t)
    gain.gain.linearRampToValueAtTime(0.45, t + 0.01)       // 立ち上がり
    gain.gain.exponentialRampToValueAtTime(0.001, t + duration) // 減衰

    osc.start(t)
    osc.stop(t + duration)
  })
}

/** ブブッ 🔔 — 不正解音（低い2回バズ）*/
export function playIncorrect(): void {
  const ctx = getCtx()
  if (!ctx) return
  // resume は getCtx() 内で処理済み

  // 「ブッ」を2回（0ms と 220ms）
  const bursts = [0, 0.22]

  bursts.forEach(startAt => {
    const osc  = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain)
    gain.connect(ctx.destination)

    osc.type = 'square'
    osc.frequency.value = 140   // 低めの周波数でブザー感

    const t = ctx.currentTime + startAt
    gain.gain.setValueAtTime(0, t)
    gain.gain.linearRampToValueAtTime(0.25, t + 0.01)
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.18)

    osc.start(t)
    osc.stop(t + 0.18)
  })
}
