'use client'
import { useEffect } from 'react'
import Image from 'next/image'
import { Character } from '@/data/stories'
import { recordCompletion } from '@/lib/storage'
import { unlockAudio } from '@/lib/speech'

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
  useEffect(() => {
    recordCompletion(storyId)
  }, [storyId])

  const stars = Math.round((correctCount / totalQuestions) * 3)
  const hasBonusStars = bonusStars > 0

  return (
    <div className="h-screen-safe flex flex-col" style={{ backgroundColor: '#faf6ea' }}>

      {/* ── スクロールエリア ── */}
      <div className="flex-1 scroll-area">
        <div className="max-w-lg mx-auto px-5 pt-8 pb-4 flex flex-col items-center gap-5 animate-fadeInUp">

          {/* キャラクター */}
          <div className="animate-popIn">
            {character.imageSrc ? (
              <Image
                src={character.imageSrc}
                alt={character.name}
                width={112}
                height={112}
                className="w-28 h-28 object-contain mx-auto animate-floatY"
                style={{ mixBlendMode: 'multiply' }}
              />
            ) : (
              <div className="text-7xl text-center animate-floatY">{character.emoji}</div>
            )}
          </div>

          {/* メッセージ */}
          <div className="text-center">
            <p className="text-xl font-bold text-[#3d3028] leading-loose mb-1 whitespace-pre-wrap">
              {character.endingMessage1}
            </p>
            <p className="text-lg text-forest-600 font-bold">{character.endingMessage2}</p>
          </div>

          {/* ── スコアカード：もんだい ── */}
          <div className="bg-white rounded-3xl px-8 py-6 shadow-md border-2 border-[#c8e6c9] text-center w-full">
            <p className="text-xs font-bold text-[#7a6555] mb-2 tracking-widest">もんだい せいかい</p>
            <p className="text-6xl font-black text-forest-600 leading-none">
              {correctCount}
              <span className="text-2xl font-bold text-[#afd4ba] ml-2">/ {totalQuestions}</span>
            </p>
            <div className="flex justify-center gap-3 mt-4 text-4xl">
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
            <div className="bg-gradient-to-r from-amber-50 to-yellow-50 rounded-3xl px-8 py-5
                            shadow-md border-2 border-amber-300 text-center w-full animate-popIn">
              <p className="text-xs font-bold text-amber-700 mb-3 tracking-widest">よみあげ ボーナス ⭐</p>
              <div className="flex justify-center gap-2 flex-wrap">
                {Array.from({ length: totalPages }, (_, i) => (
                  <span
                    key={i}
                    className={`text-4xl transition-all duration-500 ${
                      i < bonusStars ? 'opacity-100 scale-110' : 'opacity-20 grayscale'
                    }`}
                    style={{ transitionDelay: `${i * 120}ms` }}
                  >
                    ⭐
                  </span>
                ))}
              </div>
              <p className="text-sm font-bold text-amber-700 mt-3">
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
        className="flex-shrink-0 px-5 pt-3 bg-[#faf6ea] border-t border-[#ede5d5] flex flex-col gap-3"
        style={{ paddingBottom: 'max(env(safe-area-inset-bottom), 20px)' }}
      >
        {/* 🎙️ じぶんのこえで よんでみよう（メインCTA） */}
        <button
          onClick={() => { unlockAudio(); onRecordMode() }}
          className="w-full py-5 rounded-full text-xl font-bold text-white tracking-widest
                     bg-gradient-to-br from-amber-400 to-amber-500
                     shadow-[0_5px_0_#b45309]
                     active:translate-y-1 active:shadow-[0_2px_0_#b45309]
                     transition-all duration-150 flex items-center justify-center gap-2"
        >
          <span className="text-2xl">🎙️</span>
          <span>{hasBonusStars ? 'もういちど じぶんで よむ' : 'じぶんのこえで よんでみよう！'}</span>
          {!hasBonusStars && <span className="text-2xl">⭐</span>}
        </button>

        {/* もう一度きく（サブボタン） */}
        <button
          onClick={() => { unlockAudio(); onReadAgain() }}
          className="w-full py-4 rounded-full text-xl font-bold tracking-widest
                     text-white
                     bg-gradient-to-br from-forest-400 to-forest-600
                     shadow-[0_4px_0_#224f35]
                     active:translate-y-1 active:shadow-[0_2px_0_#224f35]
                     transition-all duration-150 flex items-center justify-center gap-2"
        >
          <span>👂</span>
          <span>もう一度 きく</span>
        </button>

        {/* 下段：ほかのおはなし ＋ おわる */}
        <div className="flex gap-2">
          <button
            onClick={() => { unlockAudio(); onRestart() }}
            className="flex-1 py-3 rounded-full text-base font-bold
                       text-[#3a8058] bg-white border-2 border-[#7db994]
                       active:bg-[#f0f7f2] active:scale-95
                       transition-all duration-150"
          >
            ほかのおはなし 🌿
          </button>
          <button
            onClick={onQuit}
            className="flex-1 py-3 rounded-full text-base font-bold text-[#9a8070]
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
