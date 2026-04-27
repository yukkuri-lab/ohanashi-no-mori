'use client'
import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import ChoiceButton from '@/components/ChoiceButton'
import { Question, Character, StoryPage } from '@/data/stories'
import { recordAnswer } from '@/lib/storage'
import { speak, stopSpeaking } from '@/lib/speech'
import { playCorrect, playIncorrect } from '@/lib/sounds'

interface Props {
  question: Question
  questionIndex: number
  totalQuestions: number
  character: Character
  pages?: StoryPage[]
  onNext: (isCorrect: boolean) => void
}

export default function QuestionScreen({
  question,
  questionIndex,
  totalQuestions,
  character,
  pages,
  onNext,
}: Props) {
  const [showBubble,    setShowBubble]    = useState(false)
  const [showChoices,   setShowChoices]   = useState(false)
  const [choicesLocked, setChoicesLocked] = useState(true)  // 音声読み上げ中はロック
  const [selectedId,    setSelectedId]    = useState<string | null>(null)
  const [isCorrect,     setIsCorrect]     = useState<boolean | null>(null)

  const t1 = useRef<ReturnType<typeof setTimeout> | null>(null)
  const t2 = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    setShowBubble(false)
    setShowChoices(false)
    setChoicesLocked(true)
    setSelectedId(null)
    setIsCorrect(null)

    const nums = ['１', '２', '３', '４', '５']
    const choicesText = question.choices
      .map((c, i) => `${nums[i]}、${c.text.replace(/\n/g, '')}`)
      .join('、') + '、どれかな？'

    // アリさんが歩いてくる → 吹き出し → 質問を読む → 選択肢を読む → ロック解除
    t1.current = setTimeout(() => {
      setShowBubble(true)
      speak(question.speech, () => {
        setTimeout(() => {
          speak(choicesText, () => {
            // 選択肢読み上げ完了 → ロック解除
            setChoicesLocked(false)
          })
        }, 400)
      })
    }, 1900)

    // 選択肢を画面に表示（ロック状態で）
    t2.current = setTimeout(() => {
      setShowChoices(true)
    }, 2800)

    return () => {
      t1.current && clearTimeout(t1.current)
      t2.current && clearTimeout(t2.current)
      stopSpeaking()
    }
  }, [question.id, question.speech])

  function handleSelect(choiceId: string) {
    if (selectedId !== null || choicesLocked) return   // ロック中は無視
    const correct = choiceId === question.correctId
    setSelectedId(choiceId)
    setIsCorrect(correct)
    recordAnswer(correct)

    const correctText = question.choices.find(c => c.id === question.correctId)?.text ?? ''
    const incorrectFull = `${question.incorrectFeedback}正解は「${correctText}」だよ！`

    const cheers = [
      'やったー！せいかい！',
      'ピンポーン！せいかい！',
      'すごい！せいかい！',
      'その通り！せいかい！',
      'よくわかったね！せいかい！',
    ]
    const cheer = cheers[Math.floor(Math.random() * cheers.length)]

    if (correct) playCorrect()
    else         playIncorrect()

    stopSpeaking()
    setTimeout(() => {
      if (correct) {
        speak(cheer, () => {
          setTimeout(() => {
            speak(question.correctFeedback, () => {
              setTimeout(() => onNext(true), 500)
            })
          }, 300)
        })
      } else {
        speak(incorrectFull)
      }
    }, 200)
  }

  const correctText2 = question.choices.find(c => c.id === question.correctId)?.text ?? ''
  const feedbackMessage =
    isCorrect === null ? null
    : isCorrect ? question.correctFeedback
    : `${question.incorrectFeedback}正解は「${correctText2}」だよ！`

  // 関連場面（絵＋文しょう）
  const referencePage =
    pages && question.pageIndex !== undefined ? pages[question.pageIndex] : null

  return (
    <div className="h-screen-safe flex flex-col" style={{ backgroundColor: '#faf6ea' }}>

      {/* ── 進捗バー ── */}
      <div className="flex-shrink-0 px-5 pt-safe pt-3 pb-2">
        <div className="flex items-center gap-3 max-w-lg mx-auto">
          <div className="flex-1 h-2 bg-[#e8dcc8] rounded-full overflow-hidden">
            <div
              className="h-full bg-forest-400 rounded-full transition-all duration-500"
              style={{ width: `${(questionIndex / totalQuestions) * 100}%` }}
            />
          </div>
          <span className="text-sm text-[#7a6555] font-bold whitespace-nowrap">
            {questionIndex + 1} / {totalQuestions}
          </span>
        </div>
      </div>

      {/* ── スクロールエリア ── */}
      <div className="flex-1 scroll-area">
        <div className="max-w-lg mx-auto px-5 pb-6 flex flex-col gap-5">

          {/* 関連する場面（絵＋文しょう） */}
          {referencePage && (
            <div className="rounded-2xl overflow-hidden border border-[#e8dcc8] shadow-md animate-fadeInUp">
              {/* 絵 */}
              {referencePage.imageSrc ? (
                <Image
                  src={referencePage.imageSrc}
                  alt={referencePage.imageLabel}
                  width={800}
                  height={260}
                  className="w-full object-cover"
                  style={{ maxHeight: '130px' }}
                />
              ) : (
                <div className="flex items-center justify-center py-4"
                  style={{ background: 'linear-gradient(135deg, #dceade 0%, #c8e6c9 50%, #b2dfdb 100%)' }}>
                  <span className="text-3xl">🖼️</span>
                </div>
              )}
              {/* 文しょう（全文表示） */}
              <div className="bg-white px-4 py-3">
                <p className="story-text text-[0.8rem] font-bold text-[#3d3028] leading-relaxed whitespace-pre-wrap">
                  {referencePage.text}
                </p>
              </div>
            </div>
          )}

          {/* キャラクター ＋ 吹き出し（横並び） */}
          <div className="flex items-start gap-3 animate-walkInFromRight">

            {/* アリさん（左） */}
            <div className="flex flex-col items-center gap-1 flex-shrink-0">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center overflow-hidden
                           border-4 border-white shadow-md"
                style={{ backgroundColor: character.color + '28' }}
              >
                {character.imageSrc ? (
                  <Image
                    src={character.imageSrc}
                    alt={character.name}
                    width={64}
                    height={64}
                    className="w-full h-full object-contain p-1"
                    style={{ mixBlendMode: 'multiply' }}
                  />
                ) : (
                  <span className="text-4xl">{character.emoji}</span>
                )}
              </div>
              <span className="text-xs text-[#7a6555] font-bold">{character.name}</span>
            </div>

            {/* 吹き出し（右、左向きの口） */}
            {showBubble ? (
              <div className="relative flex-1 animate-popIn mt-1">
                {/* 左向き三角 */}
                <div
                  className="absolute top-4"
                  style={{
                    left: '-9px',
                    width: 0, height: 0,
                    borderTop:    '8px solid transparent',
                    borderBottom: '8px solid transparent',
                    borderRight:  `10px solid ${character.color}33`,
                  }}
                />
                <div
                  className="rounded-2xl px-4 py-3 shadow-sm"
                  style={{
                    backgroundColor: character.color + '18',
                    border: `2px solid ${character.color}33`,
                  }}
                >
                  {isCorrect === null ? (
                    <>
                      <p className="text-base font-bold text-[#3d3028] leading-relaxed whitespace-pre-wrap"
                         style={{ wordBreak: 'keep-all', overflowWrap: 'anywhere' }}>
                        {question.speech}
                      </p>
                      {choicesLocked && selectedId === null && (
                        <div className="flex items-center gap-1 mt-2">
                          <span className="text-sm animate-bounce">🎧</span>
                          <span className="text-xs font-bold text-[#9a8070]">きいてね…</span>
                        </div>
                      )}
                    </>
                  ) : isCorrect ? (
                    <div className="animate-popIn flex flex-col items-center gap-1">
                      <p className="text-2xl font-black text-forest-600">🎉 せいかい！</p>
                      <p className="text-sm font-bold text-forest-700 leading-relaxed">{feedbackMessage}</p>
                    </div>
                  ) : (
                    <p className="text-base font-bold leading-relaxed animate-popIn text-[#b85c00]">
                      {feedbackMessage}
                    </p>
                  )}
                </div>
              </div>
            ) : (
              /* 吹き出し登場前のプレースホルダー */
              <div className="flex-1" />
            )}
          </div>

          {/* 選択肢 */}
          {showChoices && (
            <div className="flex flex-col gap-3 animate-fadeInUp">

              {question.choices.map((choice, i) => {
                let state: 'idle' | 'correct' | 'incorrect' | 'disabled' = 'idle'
                if (selectedId !== null) {
                  if (choice.id === question.correctId)  state = 'correct'
                  else if (choice.id === selectedId)      state = 'incorrect'
                  else                                    state = 'disabled'
                } else if (choicesLocked) {
                  state = 'disabled'   // 音声中はグレーアウト
                }
                return (
                  <ChoiceButton
                    key={choice.id}
                    number={i + 1}
                    text={choice.text}
                    state={state}
                    onClick={() => handleSelect(choice.id)}
                    animationDelay={i * 80}
                  />
                )
              })}

              {/* アンロック時 */}
              {!choicesLocked && selectedId === null && (
                <p className="text-center text-xs font-bold text-[#4d9e6e] animate-popIn">
                  👆 えらんでみよう！
                </p>
              )}

            </div>
          )}

        </div>
      </div>

      {/* フッター */}
      <div
        className="flex-shrink-0 px-5 pt-3 bg-[#faf6ea] border-t border-[#ede5d5]"
        style={{ paddingBottom: 'max(env(safe-area-inset-bottom), 20px)' }}
      >
        {selectedId !== null ? (
          <button
            onClick={() => onNext(isCorrect ?? false)}
            className="w-full py-5 rounded-full text-2xl font-bold text-white tracking-widest
                       bg-gradient-to-br from-forest-400 to-forest-600
                       shadow-[0_5px_0_#224f35]
                       active:translate-y-1 active:shadow-[0_2px_0_#224f35]
                       transition-all duration-150 animate-popIn"
          >
            {questionIndex + 1 < totalQuestions ? 'つぎへ →' : 'おしまい 🎉'}
          </button>
        ) : (
          <div className="w-full py-5 opacity-0 pointer-events-none" aria-hidden />
        )}
      </div>
    </div>
  )
}
