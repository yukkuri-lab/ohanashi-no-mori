'use client'
import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { Character } from '@/data/stories'
import { recordCompletion } from '@/lib/storage'
import { unlockAudio } from '@/lib/speech'
import { loadPageRecording } from '@/lib/recordings'

interface Props {
  storyId: string
  storyTitle: string
  character: Character
  correctCount: number
  totalQuestions: number
  bonusStars: number
  totalPages: number
  onReadAgain: () => void
  onRecordMode: () => void
  onRestart: () => void
  onQuit: () => void
}

export default function EndingScreen({
  storyId,
  storyTitle,
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
  const isPlayingRef = useRef(false)
  useEffect(() => { isPlayingRef.current = isPlayingBack }, [isPlayingBack])

  useEffect(() => {
    recordCompletion(storyId)
    // index 0 = 全ページ通し録音（page.tsx が保存）
    loadPageRecording(storyId, 0).then(blob => setHasRecordings(blob !== null))
  }, [storyId])

  async function handlePlayRecording() {
    if (isPlayingBack) {
      playbackAudioRef.current?.pause()
      if (playbackAudioRef.current) playbackAudioRef.current.src = ''
      setIsPlayingBack(false)
      return
    }
    const blob = await loadPageRecording(storyId, 0)
    if (!blob) return

    setIsPlayingBack(true)
    const audio = new Audio()
    audio.setAttribute('playsinline', '')
    playbackAudioRef.current = audio
    const url = URL.createObjectURL(blob)
    audio.src = url
    audio.onended = () => { URL.revokeObjectURL(url); setIsPlayingBack(false) }
    audio.onerror = () => { URL.revokeObjectURL(url); setIsPlayingBack(false) }
    audio.play().catch(() => setIsPlayingBack(false))
  }

  async function handleShare() {
    const blob = await loadPageRecording(storyId, 0)
    if (!blob) return
    const ext = blob.type.includes('mp4') ? 'm4a' : 'webm'
    const file = new File([blob], `${storyTitle}-よみきかせ.${ext}`, { type: blob.type })
    const shareData = {
      title: `「${storyTitle}」をよんだよ！`,
      text: `「${storyTitle}」を じょうずに よめたよ！きいてみてね 🎉`,
      files: [file],
    }
    try {
      if (navigator.share && navigator.canShare?.(shareData)) {
        await navigator.share(shareData)
      } else {
        // フォールバック：ダウンロード
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url; a.download = file.name; a.click()
        URL.revokeObjectURL(url)
      }
    } catch {
      // キャンセルは無視
    }
  }

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

          {/* スコアカード */}
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

          {/* ボーナス⭐カード */}
          {hasBonusStars && (
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
          )}

        </div>
      </div>

      {/* ── フッター：ボタン ── */}
      <div
        className="flex-shrink-0 px-5 pt-2 bg-[#faf6ea] border-t border-[#ede5d5] flex flex-col gap-2"
        style={{ paddingBottom: 'max(env(safe-area-inset-bottom), 12px)' }}
      >
        {hasRecordings ? (
          <>
            {/* 録音あり：① きいてみる（アンバー・トップ） */}
            <button
              onClick={() => { unlockAudio(); handlePlayRecording() }}
              className={`
                w-full py-4 rounded-full text-xl font-bold text-white tracking-wide
                flex items-center justify-center gap-2
                transition-all duration-150 active:scale-95
                ${isPlayingBack
                  ? 'bg-gradient-to-br from-amber-300 to-amber-500 shadow-[0_4px_0_#92400e]'
                  : 'bg-gradient-to-br from-amber-400 to-amber-600 shadow-[0_4px_0_#92400e]'
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

            {/* 録音あり：② じぶんのこえでよんでみよう（赤） */}
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

            {/* 録音あり：③ おくる（シェア） */}
            <button
              onClick={() => { unlockAudio(); handleShare() }}
              className="w-full py-4 rounded-full text-xl font-bold text-white tracking-wide
                         flex items-center justify-center gap-2
                         bg-gradient-to-br from-forest-400 to-forest-600 shadow-[0_4px_0_#224f35]
                         transition-all duration-150 active:scale-95"
              aria-label="じょうずによめた！おくる"
            >
              じょうずによめた！📤 おくる
            </button>
          </>
        ) : (
          /* 録音なし：じぶんのこえでよんでみよう（トップ・赤） */
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
        )}

        {/* もう一度きく（お手本・緑・常時表示） */}
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
            ほかのおはなし&nbsp;
            <svg width="18" height="18" viewBox="0 0 100 100" fill="none" style={{display:'inline',verticalAlign:'middle'}}>
              {/* 左手 */}
              <path d="M18 72 Q10 68 10 58 L10 45 Q10 40 15 40 Q20 40 20 45 L20 55 Q28 50 36 50 L36 78 Q26 78 18 72Z" fill="#3a8058"/>
              {/* 右手 */}
              <path d="M82 72 Q90 68 90 58 L90 45 Q90 40 85 40 Q80 40 80 45 L80 55 Q72 50 64 50 L64 78 Q74 78 82 72Z" fill="#3a8058"/>
              {/* 本（左ページ） */}
              <path d="M36 22 L36 78 L50 74 L50 18 Z" fill="#3a8058"/>
              {/* 本（右ページ） */}
              <path d="M64 22 L64 78 L50 74 L50 18 Z" fill="#3a8058"/>
              {/* 左ページの線 */}
              <rect x="38" y="30" width="9" height="3" rx="1.5" fill="white"/>
              <rect x="38" y="37" width="9" height="3" rx="1.5" fill="white"/>
              <rect x="38" y="44" width="9" height="3" rx="1.5" fill="white"/>
              <rect x="38" y="51" width="9" height="3" rx="1.5" fill="white"/>
              {/* 右ページの線 */}
              <rect x="53" y="30" width="9" height="3" rx="1.5" fill="white"/>
              <rect x="53" y="37" width="9" height="3" rx="1.5" fill="white"/>
              <rect x="53" y="44" width="9" height="3" rx="1.5" fill="white"/>
              <rect x="53" y="51" width="9" height="3" rx="1.5" fill="white"/>
            </svg>
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
