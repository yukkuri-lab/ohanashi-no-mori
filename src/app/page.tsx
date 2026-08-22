'use client'

import { useState, useCallback, useMemo, useRef, useEffect } from 'react'
import { stories } from '@/data/stories'
import TitleScreen       from '@/components/screens/TitleScreen'
import StorySelectScreen from '@/components/screens/StorySelectScreen'
import IntroScreen       from '@/components/screens/IntroScreen'
import StoryScreen       from '@/components/screens/StoryScreen'
import QuestionScreen    from '@/components/screens/QuestionScreen'
import EndingScreen      from '@/components/screens/EndingScreen'
import { stopSpeaking } from '@/lib/speech'
import { recordRead } from '@/lib/storage'
import { savePageRecording } from '@/lib/recordings'

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
  const [isGlobalRecording, setIsGlobalRecording] = useState(false)

  // ── 全ページ通し録音（record モード用）──────────────
  const globalRecorderRef    = useRef<MediaRecorder | null>(null)
  const globalStreamRef      = useRef<MediaStream | null>(null)
  const globalAudioChunksRef = useRef<Blob[]>([])

  // マイク確保＆録音開始。成功で true、失敗（拒否・占有など）で false を返す
  async function startGlobalRecording(storyId: string): Promise<boolean> {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const preferredMime =
        MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' :
        MediaRecorder.isTypeSupported('audio/mp4')  ? 'audio/mp4'  : ''
      const mr = preferredMime
        ? new MediaRecorder(stream, { mimeType: preferredMime })
        : new MediaRecorder(stream)
      globalAudioChunksRef.current = []
      mr.ondataavailable = (e) => { if (e.data.size > 0) globalAudioChunksRef.current.push(e.data) }
      mr.onstop = () => {
        stream.getTracks().forEach(t => t.stop())
        globalStreamRef.current = null
        const blob = new Blob(globalAudioChunksRef.current, { type: mr.mimeType || 'audio/mp4' })
        savePageRecording(storyId, 0, blob)  // 全体録音をpage 0として保存
      }
      mr.start()
      globalRecorderRef.current = mr
      globalStreamRef.current   = stream
      setIsGlobalRecording(true)
      return true
    } catch (e) {
      console.warn('[recording] マイクが使えませんでした:', e)
      setIsGlobalRecording(false)
      return false
    }
  }

  function stopGlobalRecording() {
    if (globalRecorderRef.current?.state === 'recording') {
      globalRecorderRef.current.stop()   // onstop の中で保存とマイク解放が走る
    }
    globalRecorderRef.current = null
    setIsGlobalRecording(false)
  }

  // アプリを閉じる・タブを離れるときに、マイクを確実に止める。
  // これが無いと、録音中に閉じたときマイクが掴まれたまま残る（録音ランプが消えない）。
  // 保存より「マイクを止めること」を優先する後始末なので、状態更新はしない。
  const releaseMicNow = useCallback(() => {
    try { globalRecorderRef.current?.stop() } catch { /* すでに止まっている */ }
    globalRecorderRef.current = null
    globalStreamRef.current?.getTracks().forEach(t => t.stop())
    globalStreamRef.current = null
  }, [])

  useEffect(() => {
    // pagehide はタブを閉じる・別ページへ移る・iOSでアプリを切り替えるときに発火する
    window.addEventListener('pagehide', releaseMicNow)
    return () => {
      window.removeEventListener('pagehide', releaseMicNow)
      releaseMicNow()   // 画面が消えるとき（アンマウント）にも必ず解放する
    }
  }, [releaseMicNow])

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
  // record モード: 最終ページ後 → 録音停止 → エンディングへ（クイズはスキップ）
  function handleStoryNext() {
    const nextPage = storyPageIndex + 1
    if (nextPage < story.pages.length) {
      setStoryPageIndex(nextPage)
    } else if (storyMode === 'record') {
      stopGlobalRecording()                    // 全ページ読み終わったら録音停止
      setBonusStars(story.pages.length)        // 全ページ分ボーナス⭐
      recordRead(story.id)
      go('ending')
    } else {
      recordRead(story.id)
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

  // 録音を途中で止めてエンディングへ
  function handleStopRecording() {
    stopGlobalRecording()
    recordRead(story.id)
    go('ending')
  }

  // エンディング → じぶんのこえで よんでみる（record モード）
  // 先にマイクを確保し、成功した時だけ録音モードへ。失敗時は false を返して袋小路を防ぐ
  async function handleRecordMode(): Promise<boolean> {
    const ok = await startGlobalRecording(selectedStoryId)
    if (!ok) return false
    setStoryPageIndex(0)
    setStoryMode('record')
    setBonusStars(0)
    go('story')
    return true
  }

  // エンディング → もう一度きく（listen モード）
  function handleReadAgain() {
    stopGlobalRecording()
    setStoryPageIndex(0)
    setQuestionIndex(0)
    setCorrectCount(0)
    setStoryMode('listen')
    setBonusStars(0)
    go('story')
  }

  // エンディング → おはなし選択に戻る
  function handleRestart() {
    stopGlobalRecording()
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
          isRecording={isGlobalRecording}
          onStopRecording={storyMode === 'record' ? handleStopRecording : undefined}
          onPrev={storyPageIndex > 0 ? handleStoryPrev : undefined}
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
          onNext={handleQuestionNext}
        />
      )}

      {screen === 'ending' && (
        <EndingScreen
          storyId={story.id}
          storyTitle={story.title}
          fromRecordMode={storyMode === 'record'}
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
