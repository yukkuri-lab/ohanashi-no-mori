'use client'
import { useState, useEffect, useRef } from 'react'
import ChoiceButton from '@/components/ChoiceButton'
import { Question, Character } from '@/data/stories'
import { recordAnswer } from '@/lib/storage'
import { speak, stopSpeaking } from '@/lib/speech'

interface Props {
  question: Question
  questionIndex: number
  totalQuestions: number
  character: Character
  onNext: (isCorrect: boolean) => void
}

export default function QuestionScreen({
  question,
  questionIndex,
  totalQuestions,
  character,
  onNext,
}: Props) {
  const [showBubble,  setShowBubble]  = useState(false) // アリさんの吹き出し
  const [showChoices, setShowChoices] = useState(false) // 選択肢
  const [selectedId,  setSelectedId]  = useState<string | null>(null)
  const [isCorrect,   setIsCorrect]   = useState<boolean | null>(null)

  const t1 = useRef<ReturnType<typeof setTimeout> | null>(null)
  const t2 = useRef<ReturnType<typeof setTimeout> | null>(null)

  // 画面が出るたびにリセット＆シーケンス開始
  useEffect(() => {
    setShowBubble(false)
    setShowChoices(false)
    setSelectedId(null)
    setIsCorrect(null)

    // アリさんが歩いてきて止まる（1.8s）→ 吹き出し＋読み上げ
    t1.current = setTimeout(() => {
      setShowBubble(true)

      // 選択肢を「１、〇〇、２、〇〇、３、〇〇、どれかな？」と読み上げるテキストを作成
      const nums = ['１', '２', '３', '４', '５']
      const choicesText = question.choices
        .map((c, i) => `${nums[i]}、${c.text.replace(/\n/g, '')}`)
        .join('、') + '、どれかな？'

      // 質問を読み上げ → 終わったら選択肢を読み上げ
      speak(question.speech, () => {
        setTimeout(() => speak(choicesText), 400)
      })
    }, 1900)

    // 吹き出しから少し遅れて選択肢を表示
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
    if (selectedId !== null) return
    const correct = choiceId === question.correctId
    setSelectedId(choiceId)
    setIsCorrect(correct)
    recordAnswer(correct)

    const correctText = question.choices.find(c => c.id === question.correctId)?.text ?? ''
    const incorrectFull = `${question.incorrectFeedback}正解は「${correctText}」だよ！`

    // フィードバックを読み上げ
    stopSpeaking()
    setTimeout(() => {
      const feedback = correct ? question.correctFeedback : incorrectFull
      speak(feedback, () => {
        // 正解なら読み上げ終了後に自動で次へ
        if (correct) {
          setTimeout(() => onNext(true), 500)
        }
      })
    }, 200)
  }

  const correctText = question.choices.find(c => c.id === question.correctId)?.text ?? ''
  const feedbackMessage =
    isCorrect === null ? null
    : isCorrect ? question.correctFeedback
    : `${question.incorrectFeedback}正解は「${correctText}」だよ！`

  return (
    <div className="h-screen-safe flex flex-col" style={{ backgroundColor: '#faf6ea' }}>

      {/* ── 進捗バー（上部固定） ── */}
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

          {/* ── アリさん：右から歩いてくる ── */}
          <div className="flex flex-col items-center gap-2 mt-2 animate-walkInFromRight">
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center text-5xl
                         border-4 border-white shadow-md"
              style={{ backgroundColor: character.color + '28' }}
            >
              {character.emoji}
            </div>
            <span className="text-xs text-[#7a6555] font-bold">{character.name}</span>
          </div>

          {/* ── 吹き出し（歩き終わったら表示） ── */}
          {showBubble && (
            <div className="animate-popIn relative">
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
                {/* 回答前：質問のセリフ */}
                {isCorrect === null ? (
                  <p className="text-lg font-bold text-[#3d3028] leading-relaxed whitespace-pre-wrap"
                     style={{ wordBreak: 'keep-all', overflowWrap: 'anywhere' }}>
                    {question.speech}
                  </p>
                ) : (
                  /* 回答後：フィードバック */
                  <p className={`text-xl font-bold leading-relaxed animate-popIn
                    ${isCorrect ? 'text-forest-700' : 'text-[#b85c00]'}`}>
                    {feedbackMessage}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* ── 選択肢 ── */}
          {showChoices && (
            <div className="flex flex-col gap-3 animate-fadeInUp">
              {question.choices.map((choice, i) => {
                let state: 'idle' | 'correct' | 'incorrect' | 'disabled' = 'idle'
                if (selectedId !== null) {
                  if (choice.id === question.correctId)   state = 'correct'
                  else if (choice.id === selectedId)       state = 'incorrect'
                  else                                     state = 'disabled'
                }
                return (
                  <ChoiceButton
                    key={choice.id}
                    text={choice.text}
                    state={state}
                    onClick={() => handleSelect(choice.id)}
                    animationDelay={i * 80}
                  />
                )
              })}
            </div>
          )}

        </div>
      </div>

      {/* ── フッター：つぎへボタン（回答後のみ表示） ── */}
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
            {questionIndex + 1 < totalQuestions ? 'つぎのもんだい →' : 'おしまい 🎉'}
          </button>
        ) : (
          <div className="w-full py-5 opacity-0 pointer-events-none" aria-hidden />
        )}
      </div>
    </div>
  )
}
