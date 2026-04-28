// 選択肢ボタンコンポーネント
// 状態: 未選択 / 選択済み(正解) / 選択済み(不正解) / 無効

interface Props {
  text: string
  number: number  // 1・2・3
  onClick: () => void
  state: 'idle' | 'correct' | 'incorrect' | 'disabled'
  animationDelay?: number
}

export default function ChoiceButton({ text, number, onClick, state, animationDelay = 0 }: Props) {
  const baseClass =
    'w-full py-5 px-4 rounded-2xl text-xl font-bold transition-all duration-200 ' +
    'border-2 shadow-sm text-left flex items-center gap-3 '

  const stateClass = {
    idle:      'bg-white border-[#e8dcc8] text-[#3d3028] active:scale-95 active:bg-[#f0f7f2] cursor-pointer',
    correct:   'bg-[#d9edde] border-[#4d9e6e] text-[#224f35] cursor-default',
    incorrect: 'bg-[#fdecea] border-[#e07b7b] text-[#7a2a2a] cursor-default opacity-80',
    disabled:  'bg-[#f5f0e8] border-[#e8dcc8] text-[#7a6555] cursor-default opacity-70',
  }

  // 未回答：番号　/ 正解：⭕　/ 不正解：✕
  const badge =
    state === 'correct'   ? '⭕' :
    state === 'incorrect' ? '✕'  :
    String(number)

  const badgeClass =
    state === 'idle' || state === 'disabled'
      ? 'w-8 h-8 rounded-full bg-[#e8dcc8] text-[#7a6555] flex items-center justify-center text-sm font-black flex-shrink-0'
      : 'text-2xl w-8 text-center flex-shrink-0 select-none'

  const ariaLabel =
    state === 'correct'   ? `${text}（せいかい）` :
    state === 'incorrect' ? `${text}（まちがい）` :
    text

  return (
    <button
      className={`${baseClass} ${stateClass[state]} animate-fadeInUp`}
      style={{ animationDelay: `${animationDelay}ms` }}
      onClick={state === 'idle' ? onClick : undefined}
      disabled={state !== 'idle'}
      aria-label={ariaLabel}
      aria-disabled={state !== 'idle'}
    >
      <span className={badgeClass} aria-hidden="true">{badge}</span>
      <span style={{ overflowWrap: 'break-word', minWidth: 0 }}>{text}</span>
    </button>
  )
}
