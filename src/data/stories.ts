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

  // ─── ふきのとう ─────────────────────────────────
  {
    id: 'fukinotou',
    title: 'ふきのとう',
    character: {
      name: 'チョウさん',
      emoji: '🦋',
      color: '#5b9e6e',
      introMessage: 'はるの おはなし\nしってる？',
      endingMessage1: 'はるが きたね！\nよく きいてたね',
      endingMessage2: 'またいっしょに よもうね',
    },
    pages: [
      {
        // 場面1: ふきのとうがふんばる
        text: 'どこかで、小さな こえが しました。\n「よいしょ、よいしょ。\nおもたいな。」\n\n竹やぶのそばの ふきのとうです。\n雪の したに あたまを出して、\n雪をどけようと、\nふんばっているところです。\n\n「よいしょ、よいしょ。\nそとが みたいな。」',
        imageLabel: 'ふきのとう 場面1',
        imageSrc: '/fukinotou1.jpg',
      },
      {
        // 場面2: 雪と竹やぶ
        text: '「ごめんね。」\nと、雪が 言いました。\n「わたしも、早くとけて 水になり、\nとおくへ いって あそびたいけど。」\n\n「竹やぶのかげに なって、\nお日さまが あたらない。」\nざんねんそうです。\n\n「すまない。」\nと、竹やぶが 言いました。',
        imageLabel: 'ふきのとう 場面2',
        imageSrc: '/fukinotou2.jpeg',
      },
      {
        // 場面3: はるかぜ登場
        text: 'お日さまに おこされて、\nはるかぜは、大きな あくび。\nそれから、せのびして 言いました。\n\n「や、お日さま。\nや、みんな。\nおまちどお。」\n\nはるかぜは、むねいっぱいに\nいきをすい、\nふうっと いきをはきました。',
        imageLabel: 'ふきのとう 場面3',
        imageSrc: '/fukinotou3.jpeg',
      },
      {
        // 場面4: 春が来た
        text: 'はるかぜに ふかれて、\n竹やぶが、ゆれる ゆれる、おどる。\n雪が、とける とける、水になる。\nふきのとうが、ふんばる、せがのびる。\n\nふかれて、ゆれて、\nとけて、ふんばって、もっこり。\n\nふきのとうが、かおを 出しました。\n「こんにちは。」\n\nもう、すっかり はるです。',
        imageLabel: 'ふきのとう 場面4',
        imageSrc: '/fukinotou4.jpeg',
      },
    ],
    questions: [
      {
        id: 'fq1',
        text: '「おもたいな」と いっているのは だれ？',
        speech: 'おはなし たのしかった？\nクイズだよ！\n「おもたいな」と いっているのは\nだれでしょう？',
        choices: [
          { id: 'a', text: 'ふきのとう' },
          { id: 'b', text: 'ゆき' },
          { id: 'c', text: 'たけやぶ' },
        ],
        correctId: 'a',
        correctFeedback: 'そうだね！ふきのとうが ゆきを おもたいと いっていたね！',
        incorrectFeedback: 'さいしょの ばめんを おもいだしてみよう',
      },
      {
        id: 'fq2',
        text: 'ふきのとうは なにを しようとしていた？',
        speech: 'つぎのもんだい！\nふきのとうは なにを\nしようとしていたでしょう？',
        choices: [
          { id: 'a', text: 'ゆきをどけて\nそとにでようとしていた' },
          { id: 'b', text: 'うたを うたおうとしていた' },
          { id: 'c', text: 'ねようとしていた' },
        ],
        correctId: 'a',
        correctFeedback: 'せいかい！「よいしょ、よいしょ」と ふんばって そとに でようとしていたね！',
        incorrectFeedback: 'さいしょの ばめんを おもいだしてみよう',
      },
      {
        id: 'fq3',
        text: '「ごめんね」と いったのは だれ？',
        speech: 'もうひとつ！\n「ごめんね」と いったのは\nだれでしょう？',
        choices: [
          { id: 'a', text: 'ゆき' },
          { id: 'b', text: 'たけやぶ' },
          { id: 'c', text: 'ふきのとう' },
        ],
        correctId: 'a',
        correctFeedback: 'そうだね！ゆきが ふきのとうに 「ごめんね」と いったんだね。',
        incorrectFeedback: 'だいじょうぶ、もういっかい',
      },
      {
        id: 'fq4',
        text: 'ゆきが とけられないのは なぜ？',
        speech: 'むずかしいよ！\nゆきが とけられないのは\nなぜでしょう？',
        choices: [
          { id: 'a', text: 'たけやぶのかげで\nおひさまが あたらない' },
          { id: 'b', text: 'さむすぎるから' },
          { id: 'c', text: 'みずがないから' },
        ],
        correctId: 'a',
        correctFeedback: 'そのとおり！たけやぶのかげになって おひさまが あたらないから とけられないんだね。',
        incorrectFeedback: 'ふたつめの ばめんを おもいだしてみよう',
      },
      {
        id: 'fq5',
        text: '「すまない」と いったのは だれ？',
        speech: 'つぎ！\n「すまない」と いったのは\nだれでしょう？',
        choices: [
          { id: 'a', text: 'たけやぶ' },
          { id: 'b', text: 'ゆき' },
          { id: 'c', text: 'はるかぜ' },
        ],
        correctId: 'a',
        correctFeedback: 'せいかい！たけやぶが かげに なってしまって もうしわけない、と いったんだね。',
        incorrectFeedback: 'もういちど みてみよう',
      },
      {
        id: 'fq6',
        text: '「もっこり」は なにが どうした ようす？',
        speech: 'もうすこし！\n「もっこり」は\nなにが どうした ようすでしょう？',
        choices: [
          { id: 'a', text: 'ふきのとうが\nゆきのなかから かおを だした' },
          { id: 'b', text: 'はるかぜが ふいた' },
          { id: 'c', text: 'ゆきが つもった' },
        ],
        correctId: 'a',
        correctFeedback: 'そうだね！ふきのとうが もっこりと かおを だしたんだね。かわいいね！',
        incorrectFeedback: 'さいごの ばめんを おもいだしてみよう',
      },
      {
        id: 'fq7',
        text: 'このおはなしは どの きせつ？',
        speech: 'さいごのもんだいだよ！\nこのおはなしは\nどの きせつでしょう？',
        choices: [
          { id: 'a', text: 'はる' },
          { id: 'b', text: 'なつ' },
          { id: 'c', text: 'ふゆ' },
        ],
        correctId: 'a',
        correctFeedback: 'そうだね！「もう、すっかり はるです」って かいてあったね！',
        incorrectFeedback: 'さいごの ばめんを おもいだしてみよう',
      },
    ],
  },
]
