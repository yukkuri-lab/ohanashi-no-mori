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

  // ─── たんぽぽのちえ ─────────────────────────────
  {
    id: 'tanpopo-no-chie',
    title: 'たんぽぽのちえ',
    character: {
      name: 'テントウさん',
      emoji: '🐞',
      color: '#e05555',
      introMessage: 'たんぽぽって\nすごいんだよ！',
      endingMessage1: 'たんぽぽのちえ\nわかったね！',
      endingMessage2: 'またいっしょに よもうね',
    },
    pages: [
      {
        text: 'はるになると、\nたんぽぽの きいろい きれいな\n花が さきます。\n\n二、三日たつと、その花は しぼんで、\nだんだん くろっぽい 色に\nかわっていきます。\n\nそうして、たんぽぽの花の じくは、\nぐったりと じめんに\nたおれてしまいます。',
        imageLabel: 'たんぽぽ 場面1',
      },
      {
        text: 'けれども、たんぽぽは、\nかれてしまったのでは ありません。\n\n花と じくを しずかに 休ませて、\nたねに、たくさんの えいようを\nおくっているのです。\n\nこうして、たんぽぽは、\nたねを どんどん ふとらせるのです。',
        imageLabel: 'たんぽぽ 場面2',
      },
      {
        text: 'このころになると、\nたおれていた 花の じくが、\nまた おき上がります。\n\nそうして、せのびをするように、\nぐんぐん のびていきます。\n\nそれは、せいを 高くするほうが、\nわた毛に 風が よくあたって、\nたねを とおくまで とばすことが\nできるからです。',
        imageLabel: 'たんぽぽ 場面3',
      },
      {
        text: 'よく 晴れて、風のある 日には、\nわた毛の らっかさんは、\nいっぱいに ひらいて、\nとおくまで とんでいきます。\n\nでも、しめり気の 多い日や、\n雨ふりの 日には、\nわた毛の らっかさんは、\nすぼんでしまいます。\n\nわた毛が しめると おもくなって、\nたねを とおくに とばせないからです。',
        imageLabel: 'たんぽぽ 場面4',
      },
    ],
    questions: [
      {
        id: 'tq1',
        text: 'たんぽぽは いつの きせつに 花をさかせますか？',
        speech: 'たんぽぽのおはなし\nたのしかった？\nクイズだよ！\nたんぽぽは いつの きせつに\n花をさかせますか？',
        choices: [
          { id: 'a', text: 'はる' },
          { id: 'b', text: 'なつ' },
          { id: 'c', text: 'ふゆ' },
        ],
        correctId: 'a',
        correctFeedback: 'そうだね！はるに きいろい きれいな花が さくんだね。',
        incorrectFeedback: 'さいしょの ばめんを おもいだしてみよう',
      },
      {
        id: 'tq2',
        text: '花が しぼんだあと、じくは どうなった？',
        speech: 'つぎのもんだい！\n花が しぼんだあと、\nじくは どうなったでしょう？',
        choices: [
          { id: 'a', text: 'じめんに たおれた' },
          { id: 'b', text: 'たかく のびた' },
          { id: 'c', text: 'きえてしまった' },
        ],
        correctId: 'a',
        correctFeedback: 'そうだね！じくが ぐったりと じめんに たおれたんだね。',
        incorrectFeedback: 'さいしょの ばめんを おもいだしてみよう',
      },
      {
        id: 'tq3',
        text: 'じくを たおして たんぽぽは なにをしていた？',
        speech: 'もうひとつ！\nじくを たおして\nたんぽぽは なにをしていたでしょう？',
        choices: [
          { id: 'a', text: 'たねに えいようを おくっていた' },
          { id: 'b', text: 'やすんでいた' },
          { id: 'c', text: 'かれていた' },
        ],
        correctId: 'a',
        correctFeedback: 'せいかい！たねに えいようを おくって、たねを ふとらせていたんだね。',
        incorrectFeedback: 'ふたつめの ばめんを おもいだしてみよう',
      },
      {
        id: 'tq4',
        text: 'たおれていた じくは そのあと どうなった？',
        speech: 'つぎ！\nたおれていた じくは\nそのあと どうなったでしょう？',
        choices: [
          { id: 'a', text: 'また おき上がって\nぐんぐん のびた' },
          { id: 'b', text: 'そのまま たおれていた' },
          { id: 'c', text: 'きれいな花を さかせた' },
        ],
        correctId: 'a',
        correctFeedback: 'そうだね！せのびをするように ぐんぐん のびたんだね。',
        incorrectFeedback: 'みっつめの ばめんを おもいだしてみよう',
      },
      {
        id: 'tq5',
        text: 'じくが たかく のびるのは なぜ？',
        speech: 'むずかしいよ！\nじくが たかく のびるのは\nなぜでしょう？',
        choices: [
          { id: 'a', text: 'わた毛に 風が よくあたって\nたねを とおくに とばせるから' },
          { id: 'b', text: 'おひさまに ちかづくため' },
          { id: 'c', text: 'もっと 大きな 花を さかせるため' },
        ],
        correctId: 'a',
        correctFeedback: 'すごい！せいを 高くすると わた毛に 風が よくあたるんだね。',
        incorrectFeedback: 'みっつめの ばめんを おもいだしてみよう',
      },
      {
        id: 'tq6',
        text: 'よく晴れた日、わた毛のらっかさんは どうなる？',
        speech: 'もうすこし！\nよく晴れて 風のある日、\nわた毛のらっかさんは どうなるでしょう？',
        choices: [
          { id: 'a', text: 'いっぱいに ひらいて\nとおくまで とんでいく' },
          { id: 'b', text: 'すぼんでしまう' },
          { id: 'c', text: 'じめんに おちる' },
        ],
        correctId: 'a',
        correctFeedback: 'せいかい！はれた日は わた毛のらっかさんが とおくまで とべるんだね！',
        incorrectFeedback: 'さいごの ばめんを おもいだしてみよう',
      },
      {
        id: 'tq7',
        text: 'わた毛のらっかさんが すぼむのは なぜ？',
        speech: 'さいごのもんだいだよ！\nわた毛のらっかさんが すぼむのは\nなぜでしょう？',
        choices: [
          { id: 'a', text: 'わた毛が しめって おもくなると\nたねを とおくに とばせないから' },
          { id: 'b', text: 'かぜが つよすぎるから' },
          { id: 'c', text: 'たねが まだ できていないから' },
        ],
        correctId: 'a',
        correctFeedback: 'そのとおり！ぬれると おもくなって とびにくくなるんだね。たんぽぽって かしこいね！',
        incorrectFeedback: 'さいごの ばめんを おもいだしてみよう',
      },
    ],
  },
]
