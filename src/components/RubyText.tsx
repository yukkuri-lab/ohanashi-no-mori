// =============================================
// RubyText — ふりがな付きテキスト表示コンポーネント
// showRuby=false のときはプレーンテキストとして描画（パフォーマンス考慮）
// =============================================

import { buildRubySegments, RubySegment } from '@/lib/ruby'

interface Props {
  text: string
  showRuby: boolean
  className?: string
  style?: React.CSSProperties
}

function renderLine(line: string, showRuby: boolean): React.ReactNode {
  if (!showRuby) return line

  const segments: RubySegment[] = buildRubySegments(line)

  return segments.map((seg, i) =>
    seg.type === 'text' ? (
      <span key={i}>{seg.content}</span>
    ) : (
      <ruby key={i}>
        {seg.kanji}
        <rt style={{ fontSize: '0.62em', letterSpacing: '-0.01em', fontWeight: 'normal' }}>
          {seg.reading}
        </rt>
      </ruby>
    )
  )
}

export default function RubyText({ text, showRuby, className, style }: Props) {
  const lines = text.split('\n')

  return (
    <span className={className} style={style}>
      {lines.map((line, i) => (
        <span key={i}>
          {renderLine(line, showRuby)}
          {i < lines.length - 1 && <br />}
        </span>
      ))}
    </span>
  )
}
