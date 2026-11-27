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
// 0: キャラクター歩いてくる
// 1: 吹き出し＋introMessage読み上げ
// 2: タイトル登場（どーん）
// 3: ボタン登場
type Phase = 0 | 1 | 2 | 3

// 読み上げが鳴らなくても、おそくともこの時間でボタンを出す。
// speak() は音が鳴り出すと自前の保険タイマーを外すので、途中で止まると
// 読み終わりの合図（onEnd）もエラーも来ない。このままだと先に進むボタンが
// 永久に出ず、子どもが詰まってしまうので、最後の受け皿として必ず出す。
const SHOW_BUTTON_AT_LATEST_MS = 12_000

/** 何度呼ばれても一度しか走らせない（onEnd と onError が両方来ることがあるため） */
function once(fn: () => void): () => void {
  let done = false
  return () => { if (!done) { done = true; fn() } }
}

export default function IntroScreen({ storyTitle, character, onNext }: Props) {
  const [phase, setPhase] = useState<Phase>(0)
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
    // 読み上げが止まっても必ずボタンが出るようにしておく（袋小路の防止）
    addTimer(setTimeout(() => setPhase(3), SHOW_BUTTON_AT_LATEST_MS))

    // タイトルを読み上げ → ボタン登場
    const afterTitle = once(() => {
      addTimer(setTimeout(() => setPhase(3), 400))
    })
    // introMessage を読み上げ → タイトル登場
    const afterIntro = once(() => {
      addTimer(setTimeout(() => {
        setPhase(2)
        speak(storyTitle, afterTitle, afterTitle)
      }, 300))
    })

    // キャラクターが歩いてくる（1.8s アニメ終了後）→ 吹き出し
    addTimer(setTimeout(() => {
      setPhase(1)
      speak(character.introMessage, afterIntro, afterIntro)
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
      {/* ── キャラクター ── */}
      <div className="flex flex-col items-center gap-1 animate-walkInFromRight">
        <div
          className="w-24 h-24 rounded-full flex items-center justify-center overflow-hidden
                     border-4 border-white shadow-md"
          style={{ backgroundColor: '#f7f7f7' }}
        >
          {character.imageSrc ? (
            <Image
              src={character.imageSrc}
              alt={character.name}
              width={96}
              height={96}
              className="w-full h-full object-contain p-1"
              style={{}}
            />
          ) : (
            <span className="text-6xl">{character.emoji}</span>
          )}
        </div>
        <span className="text-sm text-[#7a6555] font-bold">{character.name}</span>
      </div>

      {/* ── 吹き出し（introMessage のみ） ── */}
      {phase >= 1 && (
        <div className="animate-popIn w-full max-w-xs relative">
          {/* 上向き三角 */}
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
            <p className="ja-bubble text-xl font-bold text-[#3d3028] whitespace-pre-wrap">
              {character.introMessage}
            </p>
          </div>
        </div>
      )}

      {/* ── タイトル（どーん） ── */}
      {phase >= 2 && (
        <div className="animate-titleReveal text-center w-full max-w-xs">
          <div className="bg-white rounded-2xl px-6 py-5 shadow-md border-2 border-[#c8e6c9]">
            <h2 className="text-3xl font-bold text-forest-600 tracking-wide leading-snug">
              {storyTitle}
            </h2>
          </div>
        </div>
      )}

      {/* ── はじめるボタン ── */}
      {phase >= 3 && (
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
