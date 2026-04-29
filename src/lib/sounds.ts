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

/** サラッ 📄 — ページめくり音（紙がこすれる短いノイズ）*/
export function playPageTurn(): void {
  const ctx = getCtx()
  if (!ctx) return

  const t = ctx.currentTime

  // ① 高周波ノイズ：紙がこすれる「サラッ」
  const dur1 = 0.13
  const buf1 = ctx.createBuffer(1, Math.ceil(ctx.sampleRate * dur1), ctx.sampleRate)
  const d1 = buf1.getChannelData(0)
  for (let i = 0; i < d1.length; i++) d1[i] = Math.random() * 2 - 1

  const src1 = ctx.createBufferSource()
  src1.buffer = buf1

  const f1 = ctx.createBiquadFilter()
  f1.type = 'bandpass'
  f1.frequency.value = 4500
  f1.Q.value = 0.7

  const g1 = ctx.createGain()
  g1.gain.setValueAtTime(0, t)
  g1.gain.linearRampToValueAtTime(0.18, t + 0.008)
  g1.gain.exponentialRampToValueAtTime(0.001, t + dur1)

  src1.connect(f1); f1.connect(g1); g1.connect(ctx.destination)
  src1.start(t); src1.stop(t + dur1)

  // ② 中低音ノイズ：ページが落ち着く「トン」（少し遅れて）
  const dur2 = 0.07
  const buf2 = ctx.createBuffer(1, Math.ceil(ctx.sampleRate * dur2), ctx.sampleRate)
  const d2 = buf2.getChannelData(0)
  for (let i = 0; i < d2.length; i++) d2[i] = Math.random() * 2 - 1

  const src2 = ctx.createBufferSource()
  src2.buffer = buf2

  const f2 = ctx.createBiquadFilter()
  f2.type = 'bandpass'
  f2.frequency.value = 900
  f2.Q.value = 1.8

  const g2 = ctx.createGain()
  const t2 = t + 0.05
  g2.gain.setValueAtTime(0, t2)
  g2.gain.linearRampToValueAtTime(0.09, t2 + 0.01)
  g2.gain.exponentialRampToValueAtTime(0.001, t2 + dur2)

  src2.connect(f2); f2.connect(g2); g2.connect(ctx.destination)
  src2.start(t2); src2.stop(t2 + dur2)
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
