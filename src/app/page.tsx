'use client'

import { useState, useCallback } from 'react'
import { stories } from '@/data/stories'
import TitleScreen       from '@/components/screens/TitleScreen'
import StorySelectScreen from '@/components/screens/StorySelectScreen'
import IntroScreen       from '@/components/screens/IntroScreen'
import StoryScreen       from '@/components/screens/StoryScreen'
import QuestionScreen    from '@/components/screens/QuestionScreen'
import EndingScreen      from '@/components/screens/EndingScreen'
import { stopSpeaking } from '@/lib/speech'

// アプリ全体の画面状態
type Screen = 'title' | 'select' | 'intro' | 'story' | 'question' | 'ending'

export default function App() {
  const [screen, setScreen]                 = useState<Screen>('title')
  const [selectedStoryId, setSelectedStoryId] = useState<string>(stories[0].id)
  const [storyPageIndex, setStoryPageIndex] = useState(0)
  const [questionIndex, setQuestionIndex]   = useState(0)
  const [correctCount, setCorrectCount]     = useState(0)

  // 選択中のストーリー
  const story = stories.find(s => s.id === selectedStoryId) ?? stories[0]

  // 画面遷移時に読み上げを止める
  const go = useCallback((next: Screen) => {
    stopSpeaking()
    setScreen(next)
  }, [])

  // タイトル → おはなし選択
  function handleStart() { go('select') }

  // おはなし選択 → イントロ
  function handleSelectStory(storyId: string) {
    setSelectedStoryId(storyId)
    setStoryPageIndex(0)
    setQuestionIndex(0)
    setCorrectCount(0)
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

  // おしまい → もういちど（おはなし選択に戻る）
  function handleRestart() {
    setStoryPageIndex(0)
    setQuestionIndex(0)
    setCorrectCount(0)
    go('select')
  }

  // おしまい → 同じおはなしをページ1から読み直す
  function handleReadAgain() {
    setStoryPageIndex(0)
    setQuestionIndex(0)
    setCorrectCount(0)
    go('story')
  }

  function handleQuit() { handleRestart() }

  return (
    <main>
      {screen === 'title' && (
        <TitleScreen onStart={handleStart} />
      )}

      {screen === 'select' && (
        <StorySelectScreen
          stories={stories}
          onSelect={handleSelectStory}
        />
      )}

      {screen === 'intro' && (
        <IntroScreen
          key={selectedStoryId}
          storyTitle={story.title}
          character={story.character}
          onNext={handleIntroNext}
        />
      )}

      {screen === 'story' && (
        <StoryScreen
          key={`${selectedStoryId}-${storyPageIndex}`}
          page={story.pages[storyPageIndex]}
          pageIndex={storyPageIndex}
          totalPages={story.pages.length}
          isLastPage={storyPageIndex === story.pages.length - 1}
          onNext={handleStoryNext}
        />
      )}

      {screen === 'question' && (
        <QuestionScreen
          key={`${selectedStoryId}-${questionIndex}`}
          question={story.questions[questionIndex]}
          questionIndex={questionIndex}
          totalQuestions={story.questions.length}
          character={story.character}
          pages={story.pages}
          onNext={(isCorrect) => handleQuestionNext(isCorrect)}
        />
      )}

      {screen === 'ending' && (
        <EndingScreen
          storyId={story.id}
          character={story.character}
          correctCount={correctCount}
          totalQuestions={story.questions.length}
          onReadAgain={handleReadAgain}
          onRestart={handleRestart}
          onQuit={handleQuit}
        />
      )}
    </main>
  )
}
