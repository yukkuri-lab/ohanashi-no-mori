'use client'
import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import { Character } from '@/data/stories'
import { speak, stopSpeaking, unlockAudio } from '@/lib/speech'

interface Props {
  storyTitle: string
  character: Character
  onNext: () => void
}

// フェーズ定義
// 0: アリさん歩いてくる
// 1: 挨拶の吹き出し＋読み上げ
// 2: 「きょうのおはなしは…」ドット点滅＋読み上げ
// 3: タイトル登場（どーん）
// 4: ボタン登場
type Phase = 0 | 1 | 2 | 3 | 4

export default function IntroScreen({ storyTitle, character, onNext }: Props) {
  const [phase, setPhase] = useState<Phase>(0)
  // ③ タイマーIDを配列で管理 → 全部まとめて clearTimeout できる
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([])

  function addTimer(id: ReturnType<typeof setTimeout>) {
    timersRef.current.push(id)
    return id
  }
  function clearAllTimers() {
    timersRef.current.forEach(clearTimeout)
    timersRef.current = []
  }

  useEffect(() => {
    // アリさんが歩いてくる（1.8s アニメ終了後）→ 挨拶
    addTimer(setTimeout(() => {
      setPhase(1)
      // 挨拶セリフ読み上げ → 終わったら「きょうのおはなしは…」へ
      speak(character.introMessage, () => {
        addTimer(setTimeout(() => {
          setPhase(2)
          // 「きょうのおはなしは　なんだろう？」読み上げ → タイトル登場
          speak('きょうのおはなしは　なんだろう？', () => {
            addTimer(setTimeout(() => {
              setPhase(3)
              // タイトルを読み上げ → ボタン登場
              speak(storyTitle, () => {
                addTimer(setTimeout(() => setPhase(4), 400))
              })
            }, 600))
          })
        }, 300))
      })
    }, 1900))

    return () => {
      clearAllTimers()
      stopSpeaking()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div
      className="min-h-screen-safe flex flex-col items-center justify-center px-5 gap-6 overflow-hidden"
      style={{ backgroundColor: '#faf6ea' }}
    >
      {/* ── キャラクター：右から歩いてくる ── */}
      <div className="flex flex-col items-center gap-1 animate-walkInFromRight">
        <div
          className="w-24 h-24 rounded-full flex items-center justify-center overflow-hidden
                     border-4 border-white shadow-md"
          style={{ backgroundColor: character.color + '28' }}
        >
          {character.imageSrc ? (
            <Image
              src={character.imageSrc}
              alt={character.name}
              width={96}
              height={96}
              className="w-full h-full object-contain p-1"
              style={{ mixBlendMode: 'multiply' }}
            />
          ) : (
            <span className="text-6xl">{character.emoji}</span>
          )}
        </div>
        <span className="text-sm text-[#7a6555] font-bold">{character.name}</span>
      </div>

      {/* ── 吹き出し ── */}
      {phase >= 1 && (
        <div className="animate-popIn w-full max-w-xs relative">
          {/* 三角 */}
          <div
            className="absolute -top-3 left-1/2 -translate-x-1/2 w-0 h-0"
            style={{
              borderLeft:   '10px solid transparent',
              borderRight:  '10px solid transparent',
              borderBottom: `12px solid ${character.color}33`,
            }}
          />
          <div
            className="rounded-2xl px-6 py-5 text-center shadow-sm"
            style={{
              backgroundColor: character.color + '18',
              border: `2px solid ${character.color}33`,
            }}
          >
            {phase === 1 && (
              <p className="text-xl font-bold text-[#3d3028] leading-relaxed whitespace-pre-wrap">
                {character.introMessage}
              </p>
            )}
            {phase >= 2 && (
              <p className="text-xl font-bold text-[#3d3028] leading-relaxed">
                きょうのおはなしは
                {phase === 2 && <DotsAnimation visible={phase === 2} />}
                {phase >= 3 && '…'}
              </p>
            )}
          </div>
        </div>
      )}

      {/* ── タイトル（どーん） ── */}
      {phase >= 3 && (
        <div className="animate-titleReveal text-center w-full max-w-xs">
          <div className="bg-white rounded-2xl px-6 py-5 shadow-md border-2 border-[#c8e6c9]">
            <p className="text-xs text-[#7a6555] mb-2 tracking-wide">きょうの おはなし</p>
            <h2 className="text-3xl font-bold text-forest-600 tracking-wide leading-snug">
              {storyTitle}
            </h2>
          </div>
        </div>
      )}

      {/* ── ボタン ── */}
      {phase >= 4 && (
        <button
          onClick={() => { unlockAudio(); onNext() }}
          className="animate-slideUp w-full max-w-xs
                     py-5 rounded-full text-2xl font-bold text-white tracking-widest
                     bg-gradient-to-br from-forest-400 to-forest-600
                     shadow-[0_6px_0_#224f35]
                     active:translate-y-1 active:shadow-[0_3px_0_#224f35]
                     transition-all duration-150"
        >
          きいてみる 👂
        </button>
      )}
    </div>
  )
}

// ⑩ 「…」がひとつずつ増えるドットアニメーション（visible=false で即停止）
function DotsAnimation({ visible }: { visible: boolean }) {
  const [dots, setDots] = useState('.')
  useEffect(() => {
    if (!visible) { setDots('.'); return }
    const id = setInterval(() => {
      setDots(d => d.length >= 3 ? '.' : d + '.')
    }, 400)
    return () => clearInterval(id)
  }, [visible])
  return <span className="inline-block w-8 text-left">{dots}</span>
}
