'use client'

import { useState, useCallback } from 'react'
import { stories } from '@/data/stories'
import TitleScreen    from '@/components/screens/TitleScreen'
import IntroScreen    from '@/components/screens/IntroScreen'
import StoryScreen    from '@/components/screens/StoryScreen'
import QuestionScreen from '@/components/screens/QuestionScreen'
import EndingScreen   from '@/components/screens/EndingScreen'
import { stopSpeaking } from '@/lib/speech'

// アプリ全体の画面状態
type Screen = 'title' | 'intro' | 'story' | 'question' | 'ending'

export default function App() {
  // 現在表示中の画面
  const [screen, setScreen]               = useState<Screen>('title')
  // 現在のストーリーページ番号（0始まり）
  const [storyPageIndex, setStoryPageIndex] = useState(0)
  // 現在の質問番号（0始まり）
  const [questionIndex, setQuestionIndex] = useState(0)
  // 正解数
  const [correctCount, setCorrectCount]   = useState(0)

  // 今回は最初のストーリーを使う（複数対応時はここで選ぶ）
  const story = stories[0]

  // 画面遷移時に読み上げを止める
  const go = useCallback((next: Screen) => {
    stopSpeaking()
    setScreen(next)
  }, [])

  // ── 各画面からのコールバック ────────────────────

  // タイトル → イントロ
  function handleStart() {
    go('intro')
  }

  // イントロ → お話ページ1
  function handleIntroNext() {
    setStoryPageIndex(0)
    go('story')
  }

  // お話ページ → 次のページ or 質問へ
  function handleStoryNext() {
    const nextPage = storyPageIndex + 1
    if (nextPage < story.pages.length) {
      setStoryPageIndex(nextPage)
      // 同じ 'story' 画面のまま pageIndex を更新するため
      // 再レンダリングを強制（setScreen は変化なし → useEffect で page.text 変化で対応済み）
    } else {
      setQuestionIndex(0)
      setCorrectCount(0)
      go('question')
    }
  }

  // 質問 → 次の質問 or おしまい画面
  function handleQuestionNext(isCorrect: boolean) {
    if (isCorrect) setCorrectCount(c => c + 1)
    const nextQ = questionIndex + 1
    if (nextQ < story.questions.length) {
      setQuestionIndex(nextQ)
    } else {
      go('ending')
    }
  }

  // おしまい → もういちど（タイトルに戻る）
  function handleRestart() {
    setStoryPageIndex(0)
    setQuestionIndex(0)
    setCorrectCount(0)
    go('title')
  }

  // おしまい → おわる（同じくタイトルへ）
  function handleQuit() {
    handleRestart()
  }

  // ── 画面レンダリング ─────────────────────────────
  return (
    <main>
      {screen === 'title' && (
        <TitleScreen onStart={handleStart} />
      )}

      {screen === 'intro' && (
        <IntroScreen
          storyTitle={story.title}
          character={story.character}
          onNext={handleIntroNext}
        />
      )}

      {screen === 'story' && (
        <StoryScreen
          key={storyPageIndex}             // ページが変わったら再マウントしてアニメーション再生
          page={story.pages[storyPageIndex]}
          pageIndex={storyPageIndex}
          totalPages={story.pages.length}
          isLastPage={storyPageIndex === story.pages.length - 1}
          onNext={handleStoryNext}
        />
      )}

      {screen === 'question' && (
        <QuestionScreen
          key={questionIndex}              // 問題が変わったら再マウント
          question={story.questions[questionIndex]}
          questionIndex={questionIndex}
          totalQuestions={story.questions.length}
          character={story.character}
          onNext={(isCorrect) => handleQuestionNext(isCorrect)}
        />
      )}

      {screen === 'ending' && (
        <EndingScreen
          storyId={story.id}
          character={story.character}
          correctCount={correctCount}
          totalQuestions={story.questions.length}
          onRestart={handleRestart}
          onQuit={handleQuit}
        />
      )}
    </main>
  )
}
