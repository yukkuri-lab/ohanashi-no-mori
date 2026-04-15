// 選択肢ボタンコンポーネント
// 状態: 未選択 / 選択済み(正解) / 選択済み(不正解) / 無効

interface Props {
  text: string
  onClick: () => void
  state: 'idle' | 'correct' | 'incorrect' | 'disabled'
  animationDelay?: number  // ms: 順番にフェードインするための遅延
}

export default function ChoiceButton({ text, onClick, state, animationDelay = 0 }: Props) {
  const baseClass =
    'w-full py-5 px-6 rounded-2xl text-xl font-bold transition-all duration-200 ' +
    'border-2 shadow-sm text-left flex items-center gap-3 '

  const stateClass = {
    // idle: タップ時に少し縮む（押した感）
    idle:      'bg-white border-[#e8dcc8] text-[#3d3028] active:scale-95 active:bg-[#f0f7f2] cursor-pointer',
    correct:   'bg-[#d9edde] border-[#4d9e6e] text-[#224f35] cursor-default',
    incorrect: 'bg-[#fdecea] border-[#e07b7b] text-[#7a2a2a] cursor-default opacity-80',
    disabled:  'bg-[#f5f0e8] border-[#e8dcc8] text-[#bba898] cursor-default opacity-60',
  }

  const icon = state === 'correct' ? '⭕' : state === 'incorrect' ? '✕' : '　'

  return (
    <button
      className={`${baseClass} ${stateClass[state]} animate-fadeInUp`}
      style={{ animationDelay: `${animationDelay}ms` }}
      onClick={state === 'idle' ? onClick : undefined}
      disabled={state !== 'idle'}
      aria-pressed={state === 'correct' || state === 'incorrect'}
    >
      <span className="text-2xl w-8 text-center select-none">{icon}</span>
      <span style={{ wordBreak: 'keep-all', overflowWrap: 'anywhere' }}>{text}</span>
    </button>
  )
}
