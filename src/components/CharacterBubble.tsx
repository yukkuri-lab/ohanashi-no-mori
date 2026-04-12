// キャラクターと吹き出しを表示するコンポーネント
// name, emoji, message, color を受け取ります

interface Props {
  emoji: string
  name: string
  message: string
  accentColor?: string
  animateIn?: boolean  // trueのときフェードインアニメーション
}

export default function CharacterBubble({
  emoji,
  name,
  message,
  accentColor = '#4d9e6e',
  animateIn = true,
}: Props) {
  return (
    <div className={`flex flex-col items-center gap-3 ${animateIn ? 'animate-fadeInUp' : ''}`}>
      {/* キャラクターアイコン */}
      <div
        className="w-20 h-20 rounded-full flex items-center justify-center text-5xl shadow-md border-4 border-white"
        style={{ backgroundColor: accentColor + '22' }}
        aria-label={name}
      >
        {emoji}
      </div>

      {/* 吹き出し */}
      <div className="relative max-w-xs w-full">
        {/* 吹き出しの三角 */}
        <div
          className="absolute -top-3 left-1/2 -translate-x-1/2 w-0 h-0"
          style={{
            borderLeft: '10px solid transparent',
            borderRight: '10px solid transparent',
            borderBottom: `12px solid ${accentColor}33`,
          }}
        />
        <div
          className="rounded-2xl px-6 py-4 text-center shadow-sm"
          style={{
            backgroundColor: accentColor + '18',
            border: `2px solid ${accentColor}33`,
          }}
        >
          <p className="text-[#3d3028] text-xl leading-relaxed whitespace-pre-wrap font-bold">
            {message}
          </p>
        </div>
      </div>

      {/* キャラクター名 */}
      <span className="text-sm text-[#7a6555]">{name}</span>
    </div>
  )
}
