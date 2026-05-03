'use client'
import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { Character } from '@/data/stories'
import { recordCompletion } from '@/lib/storage'
import { unlockAudio } from '@/lib/speech'
import { loadAllPageRecordings } from '@/lib/recordings'

interface Props {
  storyId: string
  character: Character
  correctCount: number
  totalQuestions: number
  bonusStars: number   // 録音ボーナス⭐の数
  totalPages: number   // ボーナスの最大値（ページ数）
  onReadAgain: () => void     // 同じおはなしをページ1からきく（listen モード）
  onRecordMode: () => void    // じぶんのこえでよむ（record モード）
  onRestart: () => void       // おはなし選択に戻る
  onQuit: () => void
}

export default function EndingScreen({
  storyId,
  character,
  correctCount,
  totalQuestions,
  bonusStars,
  totalPages,
  onReadAgain,
  onRecordMode,
  onRestart,
  onQuit,
}: Props) {
  const [hasRecordings, setHasRecordings] = useState(false)
  const [isPlayingBack, setIsPlayingBack] = useState(false)
  const playbackAudioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    recordCompletion(storyId)
    // 録音データがあればボタンを表示
    loadAllPageRecordings(storyId, totalPages).then(blobs => {
      setHasRecordings(blobs.some(b => b !== null))
    })
  }, [storyId, totalPages])

  async function handlePlayRecording() {
    if (isPlayingBack) {
      // 再生中なら止める
      playbackAudioRef.current?.pause()
      if (playbackAudioRef.current) playbackAudioRef.current.src = ''
      setIsPlayingBack(false)
      return
    }
    const blobs = await loadAllPageRecordings(storyId, totalPages)
    const pages = blobs.filter((b): b is Blob => b !== null)
    if (pages.length === 0) return

    setIsPlayingBack(true)
    const audio = new Audio()
    audio.setAttribute('playsinline', '')
    playbackAudioRef.current = audio

    for (const blob of pages) {
      if (!isPlayingRef.current) break
      const url = URL.createObjectURL(blob)
      audio.src = url
      await new Promise<void>(resolve => {
        audio.onended = () => { URL.revokeObjectURL(url); resolve() }
        audio.onerror = () => { URL.revokeObjectURL(url); resolve() }
        audio.play().catch(() => resolve())
      })
    }
    setIsPlayingBack(false)
  }

  // isPlayingBack の最新値を async ループ内で参照するための ref
  const isPlayingRef = useRef(false)
  useEffect(() => { isPlayingRef.current = isPlayingBack }, [isPlayingBack])

  const stars = Math.round((correctCount / totalQuestions) * 3)
  const hasBonusStars = bonusStars > 0

  return (
    <div className="h-screen-safe flex flex-col" style={{ backgroundColor: '#faf6ea' }}>

      {/* ── スクロールエリア ── */}
      <div className="flex-1 scroll-area">
        <div className="max-w-lg mx-auto px-5 pt-5 pb-4 flex flex-col items-center gap-3 animate-fadeInUp">

          {/* キャラクター */}
          <div className="animate-popIn">
            {character.imageSrc ? (
              <Image
                src={character.imageSrc}
                alt={character.name}
                width={80}
                height={80}
                className="w-20 h-20 object-contain mx-auto animate-floatY"
                style={{ mixBlendMode: 'multiply' }}
              />
            ) : (
              <div className="text-5xl text-center animate-floatY">{character.emoji}</div>
            )}
          </div>

          {/* メッセージ */}
          <div className="text-center">
            <p className="text-base font-bold text-[#3d3028] leading-relaxed mb-0.5 whitespace-pre-wrap">
              {character.endingMessage1}
            </p>
            <p className="text-sm text-forest-600 font-bold">{character.endingMessage2}</p>
          </div>

          {/* ── スコアカード：もんだい ── */}
          <div className="bg-white rounded-2xl px-6 py-3 shadow-md border-2 border-[#c8e6c9] text-center w-full">
            <p className="text-xs font-bold text-[#7a6555] mb-1 tracking-widest">もんだい せいかい</p>
            <p className="text-4xl font-black text-forest-600 leading-none">
              {correctCount}
              <span className="text-xl font-bold text-[#afd4ba] ml-2">/ {totalQuestions}</span>
            </p>
            <div className="flex justify-center gap-3 mt-2 text-3xl">
              {Array.from({ length: 3 }, (_, i) => (
                <span
                  key={i}
                  className={`transition-all duration-300 ${i < stars ? 'opacity-100 scale-110' : 'opacity-20 grayscale'}`}
                  style={{ transitionDelay: `${i * 150}ms` }}
                >
                  ⭐
                </span>
              ))}
            </div>
          </div>

          {/* ── ボーナス⭐カード（読み上げ後に表示） ── */}
          {hasBonusStars ? (
            <div className="bg-gradient-to-r from-amber-50 to-yellow-50 rounded-2xl px-5 py-3
                            shadow-md border-2 border-amber-300 text-center w-full animate-popIn">
              <p className="text-xs font-bold text-amber-700 mb-1.5 tracking-widest">よみあげ ボーナス ⭐</p>
              <div className="flex justify-center gap-1.5 flex-wrap">
                {Array.from({ length: totalPages }, (_, i) => (
                  <span
                    key={i}
                    className={`text-2xl transition-all duration-500 ${
                      i < bonusStars ? 'opacity-100 scale-110' : 'opacity-20 grayscale'
                    }`}
                    style={{ transitionDelay: `${i * 120}ms` }}
                  >
                    ⭐
                  </span>
                ))}
              </div>
              <p className="text-xs font-bold text-amber-700 mt-1.5">
                {bonusStars === totalPages
                  ? '🎉 ぜんぶ じぶんで よめた！ すごい！！'
                  : `${bonusStars}ページ じょうずに よめたね！`}
              </p>
            </div>
          ) : null}

        </div>
      </div>

      {/* ── フッター：ボタン ── */}
      <div
        className="flex-shrink-0 px-5 pt-2 bg-[#faf6ea] border-t border-[#ede5d5] flex flex-col gap-2"
        style={{ paddingBottom: 'max(env(safe-area-inset-bottom), 12px)' }}
      >
        {/* 🎙️ じぶんのこえで よんでみよう（メインCTA） */}
        <button
          onClick={() => { unlockAudio(); onRecordMode() }}
          className="w-full active:scale-95 active:opacity-80 transition-all duration-150"
          aria-label="じぶんのこえでよんでみよう"
        >
          <Image
            src="/jibun-no-koe.jpeg"
            alt="じぶんのこえでよんでみよう！"
            width={600}
            height={120}
            className="w-full h-auto rounded-full"
          />
        </button>

        {/* 👂 じぶんのこえをきいてみる（録音がある場合のみ） */}
        {hasRecordings && (
          <button
            onClick={() => { unlockAudio(); handlePlayRecording() }}
            className={`
              w-full py-4 rounded-full text-xl font-bold text-white tracking-wide
              flex items-center justify-center gap-2
              transition-all duration-150 active:scale-95
              ${isPlayingBack
                ? 'bg-gradient-to-br from-amber-400 to-amber-600 shadow-[0_4px_0_#b45309]'
                : 'bg-gradient-to-br from-forest-400 to-forest-600 shadow-[0_4px_0_#224f35]'
              }
            `}
            aria-label="じぶんのこえをきいてみる"
          >
            {isPlayingBack ? (
              <>
                <svg width="22" height="22" viewBox="0 0 48 48" fill="none">
                  <rect x="10" y="10" width="10" height="28" rx="3" fill="white"/>
                  <rect x="28" y="10" width="10" height="28" rx="3" fill="white"/>
                </svg>
                とめる
              </>
            ) : (
              <>
                じぶんのこえをきいてみる
                <span className="text-2xl leading-none">👂</span>
              </>
            )}
          </button>
        )}

        {/* もう一度きく（サブボタン） */}
        <button
          onClick={() => { unlockAudio(); onReadAgain() }}
          className="w-full active:scale-95 active:opacity-80 transition-all duration-150"
          aria-label="もう一度きく"
        >
          <Image
            src="/mouichido-kiku.jpeg"
            alt="もういちど きく"
            width={600}
            height={120}
            className="w-full h-auto rounded-full"
          />
        </button>

        {/* 下段：ほかのおはなし ＋ おわる */}
        <div className="flex gap-2">
          <button
            onClick={() => { unlockAudio(); onRestart() }}
            className="flex-1 py-2 rounded-full text-sm font-bold
                       text-[#3a8058] bg-white border-2 border-[#7db994]
                       active:bg-[#f0f7f2] active:scale-95
                       transition-all duration-150"
          >
            ほかのおはなし 🌿
          </button>
          <button
            onClick={onQuit}
            className="flex-1 py-2 rounded-full text-sm font-bold text-[#9a8070]
                       bg-white border-2 border-[#e8dcc8]
                       active:bg-gray-50 active:scale-95
                       transition-all duration-150"
          >
            おわる
          </button>
        </div>
      </div>
    </div>
  )
}
