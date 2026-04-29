'use client'

import { useState, useCallback, useMemo } from 'react'
import { stories } from '@/data/stories'
import TitleScreen       from '@/components/screens/TitleScreen'
import StorySelectScreen from '@/components/screens/StorySelectScreen'
import IntroScreen       from '@/components/screens/IntroScreen'
import StoryScreen       from '@/components/screens/StoryScreen'
import QuestionScreen    from '@/components/screens/QuestionScreen'
import EndingScreen      from '@/components/screens/EndingScreen'
import { stopSpeaking } from '@/lib/speech'
import { recordRead } from '@/lib/storage'

// アプリ全体の画面状態
type Screen = 'title' | 'select' | 'intro' | 'story' | 'question' | 'ending'

// おはなし画面のモード
type StoryMode = 'listen' | 'record'

export default function App() {
  const [screen,          setScreen]          = useState<Screen>('title')
  const [selectedStoryId, setSelectedStoryId] = useState<string>(stories[0].id)
  const [storyPageIndex,  setStoryPageIndex]  = useState(0)
  const [questionIndex,   setQuestionIndex]   = useState(0)
  const [correctCount,    setCorrectCount]    = useState(0)
  const [storyMode,       setStoryMode]       = useState<StoryMode>('listen')
  const [bonusStars,      setBonusStars]      = useState(0)

  const story = useMemo(
    () => stories.find(s => s.id === selectedStoryId) ?? stories[0],
    [selectedStoryId]
  )

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
    setStoryMode('listen')
    setBonusStars(0)
    go('intro')
  }

  // イントロ → お話ページ1
  function handleIntroNext() {
    setStoryPageIndex(0)
    go('story')
  }

  // お話ページ → 前のページ
  function handleStoryPrev() {
    if (storyPageIndex > 0) setStoryPageIndex(p => p - 1)
  }

  // お話ページ → 次のページ
  // listen モード: 最終ページ後 → クイズへ
  // record モード: 最終ページ後 → エンディングへ（クイズはスキップ）
  function handleStoryNext() {
    const nextPage = storyPageIndex + 1
    if (nextPage < story.pages.length) {
      setStoryPageIndex(nextPage)
    } else if (storyMode === 'record') {
      recordRead(story.id)   // 読み返しカウント
      go('ending')
    } else {
      recordRead(story.id)   // 読み返しカウント
      setQuestionIndex(0)
      setCorrectCount(0)
      go('question')
    }
  }

  // 質問 → 次の質問 or エンディング
  function handleQuestionNext(isCorrect: boolean) {
    if (isCorrect) setCorrectCount(c => c + 1)
    const nextQ = questionIndex + 1
    if (nextQ < story.questions.length) {
      setQuestionIndex(nextQ)
    } else {
      go('ending')
    }
  }

  // エンディング → じぶんのこえで よんでみる（record モード）
  function handleRecordMode() {
    setStoryPageIndex(0)
    setStoryMode('record')
    setBonusStars(0)
    go('story')
  }

  // エンディング → もう一度きく（listen モード）
  function handleReadAgain() {
    setStoryPageIndex(0)
    setQuestionIndex(0)
    setCorrectCount(0)
    setStoryMode('listen')
    setBonusStars(0)
    go('story')
  }

  // エンディング → おはなし選択に戻る
  function handleRestart() {
    setStoryPageIndex(0)
    setQuestionIndex(0)
    setCorrectCount(0)
    setStoryMode('listen')
    setBonusStars(0)
    go('select')
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
          key={`${selectedStoryId}-${storyPageIndex}-${storyMode}`}
          page={story.pages[storyPageIndex]}
          pageIndex={storyPageIndex}
          totalPages={story.pages.length}
          isLastPage={storyPageIndex === story.pages.length - 1}
          mode={storyMode}
          onPrev={storyPageIndex > 0 ? handleStoryPrev : undefined}
          onNext={handleStoryNext}
          onBonusStar={() => setBonusStars(b => b + 1)}
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
          onNext={handleQuestionNext}
        />
      )}

      {screen === 'ending' && (
        <EndingScreen
          storyId={story.id}
          character={story.character}
          correctCount={correctCount}
          totalQuestions={story.questions.length}
          bonusStars={bonusStars}
          totalPages={story.pages.length}
          onRecordMode={handleRecordMode}
          onReadAgain={handleReadAgain}
          onRestart={handleRestart}
          onQuit={handleQuit}
        />
      )}
    </main>
  )
}
