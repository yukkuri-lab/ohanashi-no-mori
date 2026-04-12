// =============================================
// stories.ts — お話データ
// 新しいお話を追加するときはここに追記するだけでOKです
// =============================================

export interface Choice {
  id: string
  text: string
}

export interface Question {
  id: string
  text: string    // 選択肢の上に表示する短い問題文
  speech: string  // キャラクターが話す会話的なセリフ（読み上げにも使う）
  choices: Choice[]
  correctId: string
  correctFeedback: string   // 正解時のキャラクターセリフ
  incorrectFeedback: string // 不正解時のキャラクターセリフ
}

export interface StoryPage {
  text: string         // 本文（\n で改行）
  imageLabel: string   // 仮画像のラベル（画像がないときのフォールバック表示）
  imageSrc?: string    // 画像パス（/public 以下。例: '/story1.jpg'）
}

export interface Character {
  name: string
  emoji: string
  color: string       // 吹き出しのアクセントカラー
  introMessage: string
  endingMessage1: string
  endingMessage2: string
}

export interface Story {
  id: string
  title: string
  character: Character
  pages: StoryPage[]
  questions: Question[]
}

// ─── おむすびころりん ─────────────────────────────
export const stories: Story[] = [
  {
    id: 'omusubi-kororin',
    title: 'おむすびころりん',
    character: {
      name: 'アリさん',
      emoji: '🐜',
      color: '#c17a3a',
      introMessage: 'ねえ、この おはなし\nしってる？',
      endingMessage1: 'いっしょに おはなしを\nみつけられたね',
      endingMessage2: 'また きいてみよう',
    },
    pages: [
      {
        // 場面1: おじいさんが山へ
        text: 'むかし むかし、\nやさしい おじいさんが いました。\n\nあるひ おじいさんは、\nやまへ しばかりに いきました。\n\nおひるに なると、\nきの したで ひとやすみ。\n「さあ、おむすびを たべよう」と\nおもいました。',
        imageLabel: 'お話の絵 1',
        imageSrc: '/story1.jpg',
      },
      {
        // 場面2: おむすびがころころ
        text: 'すると おむすびが、\nころころ ころころ、ころりん。\n\nおじいさんの てを はなれて、\nじめんの あなの なかへ\nはいって いきました。\n\n「おやおや、たいへんだ」',
        imageLabel: 'お話の絵 2',
        imageSrc: '/story2.jpg',
      },
      {
        // 場面3: ねずみたちが歌っている
        text: 'すると、あなの なかから\nうたごえが きこえてきました。\n\nおじいさんが そっと のぞいてみると、\nあなの なかで ねずみたちが\nおむすびを たべて、\nうたって おどっていました。',
        imageLabel: 'お話の絵 3',
        imageSrc: '/story3.jpg',
      },
      {
        // 場面4: ねずみからお礼
        text: 'ねずみたちは\n「おじいさん、ありがとう」と\nいいました。\n\nそして おれいに、\nたからものを たくさん\nもってきて くれました。\n\nおじいさんは とても うれしそうです。',
        imageLabel: 'お話の絵 4',
        imageSrc: '/story4.jpg',
      },
    ],
    questions: [
      {
        id: 'q1',
        text: 'おじいさんは どこへ いった？',
        speech: 'おはなし おもしろかった？\nさて、クイズだよ！\nおじいさんは どこへ\nいったでしょう？',
        choices: [
          { id: 'a', text: 'やま' },
          { id: 'b', text: 'うみ' },
          { id: 'c', text: 'まち' },
        ],
        correctId: 'a',
        correctFeedback: 'そうだね！やまへ いったんだね。',
        incorrectFeedback: 'もういちど みてみよう',
      },
      {
        id: 'q2',
        text: 'おむすびは どこに はいった？',
        speech: 'つぎの もんだいだよ！\nおむすびは どこに\nはいったでしょう？',
        choices: [
          { id: 'a', text: 'あな' },
          { id: 'b', text: 'いえ' },
          { id: 'c', text: 'はこ' },
        ],
        correctId: 'a',
        correctFeedback: 'みつけたね！',
        incorrectFeedback: 'だいじょうぶ、もういっかい',
      },
      {
        id: 'q3',
        text: 'あなの なかに いたのは だれ？',
        speech: 'もうひとつ！\nあなの なかに いたのは\nだれでしょう？',
        choices: [
          { id: 'a', text: 'ねずみたち' },
          { id: 'b', text: 'いぬ' },
          { id: 'c', text: 'おばあさん' },
        ],
        correctId: 'a',
        correctFeedback: 'すごいね！よく おぼえてたね！',
        incorrectFeedback: 'もういちど みてみよう',
      },
      {
        id: 'q4',
        text: 'おじいさんは どんな きもち？',
        speech: 'さいごの もんだいだよ！\nおじいさんは どんな\nきもちだったでしょう？',
        choices: [
          { id: 'a', text: 'うれしい' },
          { id: 'b', text: 'かなしい' },
          { id: 'c', text: 'こわい' },
          { id: 'd', text: 'おこっている' },
        ],
        correctId: 'a',
        correctFeedback: 'そうだね！うれしい きもちだね。',
        incorrectFeedback: 'だいじょうぶ、もういっかい',
      },
    ],
  },

  // ─── 追加例: たぬきの糸車（未実装・コメントアウト中）────────────
  // {
  //   id: 'tanuki-itoguruma',
  //   title: 'たぬきの糸車',
  //   character: { ... },
  //   pages: [ ... ],
  //   questions: [ ... ],
  // },
]
