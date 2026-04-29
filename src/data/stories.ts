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
  pageIndex?: number        // 関連する場面のページ番号（本文表示用）
}

export interface StoryPage {
  text: string         // 本文（\n で改行）
  imageLabel: string   // 仮画像のラベル（画像がないときのフォールバック表示）
  imageSrc?: string    // 画像パス（/public 以下。例: '/story1.jpg'）
}

export interface Character {
  name: string
  emoji: string
  imageSrc?: string   // カスタム画像（省略時は emoji を使う）
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
      imageSrc: '/ant.jpeg',
      color: '#c17a3a',
      introMessage: 'ねえ、この おはなし\nしってる？',
      endingMessage1: 'いっしょに おはなしを\nみつけられたね',
      endingMessage2: 'また きいてみよう',
    },
    pages: [
      {
        // 場面1: おじいさんが山へ
        text: 'むかし むかし、\nやさしい おじいさんが いました。\n\nある日 おじいさんは、\n山へ しばかりに いきました。\n\nお昼に なると、\n木の したで ひとやすみ。\n「さあ、おむすびを たべよう」と\nおもいました。',
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
        speech: 'ねえねえ、おじいさんは どこへ いったか おぼえてる？',
        choices: [
          { id: 'a', text: '山' },
          { id: 'b', text: '海' },
          { id: 'c', text: '町' },
        ],
        correctId: 'a',
        correctFeedback: 'そうだね！やまへ いったんだね。',
        incorrectFeedback: 'もういちど みてみよう',
        pageIndex: 0,
      },
      {
        id: 'q2',
        text: 'おむすびは どこに はいった？',
        speech: 'ころころ ころりん、おむすびは どこに はいっていったっけ？',
        choices: [
          { id: 'a', text: 'いえ' },
          { id: 'b', text: 'あな' },
          { id: 'c', text: 'はこ' },
        ],
        correctId: 'b',
        correctFeedback: 'みつけたね！',
        incorrectFeedback: 'だいじょうぶ、もういっかい',
        pageIndex: 1,
      },
      {
        id: 'q3',
        text: 'あなの なかに いたのは だれ？',
        speech: 'あなの なかに いたのは だれだったか おぼえてる？',
        choices: [
          { id: 'a', text: 'おばあさん' },
          { id: 'b', text: 'いぬ' },
          { id: 'c', text: 'ねずみたち' },
        ],
        correctId: 'c',
        correctFeedback: 'すごいね！よく おぼえてたね！',
        incorrectFeedback: 'もういちど みてみよう',
        pageIndex: 2,
      },
      {
        id: 'q4',
        text: 'おじいさんは どんな きもち？',
        speech: 'さいごに おじいさんは どんな きもちだったかな？',
        choices: [
          { id: 'a', text: 'かなしい' },
          { id: 'b', text: 'うれしい' },
          { id: 'c', text: 'こわい' },
          { id: 'd', text: 'おこっている' },
        ],
        correctId: 'b',
        correctFeedback: 'そうだね！うれしい きもちだね。',
        incorrectFeedback: 'だいじょうぶ、もういっかい',
        pageIndex: 3,
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
      imageSrc: '/butterfly.jpeg',
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
        text: 'お日さまに おこされて、\n春かぜは、大きな あくび。\nそれから、せのびして 言いました。\n\n「や、お日さま。\nや、みんな。\nおまちどお。」\n\n春かぜは、むねいっぱいに\nいきをすい、\nふうっと いきをはきました。',
        imageLabel: 'ふきのとう 場面3',
        imageSrc: '/fukinotou3.jpeg',
      },
      {
        // 場面4: 春が来た
        text: '春かぜに ふかれて、\n竹やぶが、ゆれる ゆれる、おどる。\n雪が、とける とける、水になる。\nふきのとうが、ふんばる、せがのびる。\n\nふかれて、ゆれて、\nとけて、ふんばって、もっこり。\n\nふきのとうが、顔を 出しました。\n「こんにちは。」\n\nもう、すっかり 春です。',
        imageLabel: 'ふきのとう 場面4',
        imageSrc: '/fukinotou4.jpeg',
      },
    ],
    questions: [
      {
        id: 'fq1',
        text: '「おもたいな」と いっているのは だれ？',
        speech: '「おもたいな」って いってるのは だれか わかる？',
        choices: [
          { id: 'a', text: 'ふきのとう' },
          { id: 'b', text: 'ゆき' },
          { id: 'c', text: 'たけやぶ' },
        ],
        correctId: 'a',
        correctFeedback: 'そうだね！ふきのとうが ゆきを おもたいと いっていたね！',
        incorrectFeedback: 'さいしょの ばめんを おもいだしてみよう',
        pageIndex: 0,
      },
      {
        id: 'fq2',
        text: 'ふきのとうは なにを しようとしていた？',
        speech: 'ふきのとうは なにを しようとしてたんだっけ？',
        choices: [
          { id: 'a', text: 'うたを うたおうとしていた' },
          { id: 'b', text: 'ねようとしていた' },
          { id: 'c', text: 'ゆきをどけて\nそとにでようとしていた' },
        ],
        correctId: 'c',
        correctFeedback: 'せいかい！「よいしょ、よいしょ」と ふんばって そとに でようとしていたね！',
        incorrectFeedback: 'さいしょの ばめんを おもいだしてみよう',
        pageIndex: 0,
      },
      {
        id: 'fq3',
        text: '「ごめんね」と いったのは だれ？',
        speech: '「ごめんね」って いったのは だれだったかな？',
        choices: [
          { id: 'a', text: 'ふきのとう' },
          { id: 'b', text: 'ゆき' },
          { id: 'c', text: 'たけやぶ' },
        ],
        correctId: 'b',
        correctFeedback: 'そうだね！ゆきが ふきのとうに 「ごめんね」と いったんだね。',
        incorrectFeedback: 'だいじょうぶ、もういっかい',
        pageIndex: 1,
      },
      {
        id: 'fq4',
        text: 'ゆきが とけられないのは なぜ？',
        speech: 'ゆきが とけられないのは どうしてだっけ？',
        choices: [
          { id: 'a', text: 'たけやぶのかげで\nおひさまが あたらない' },
          { id: 'b', text: 'さむすぎるから' },
          { id: 'c', text: 'みずがないから' },
        ],
        correctId: 'a',
        correctFeedback: 'そのとおり！たけやぶのかげになって おひさまが あたらないから とけられないんだね。',
        incorrectFeedback: 'ふたつめの ばめんを おもいだしてみよう',
        pageIndex: 1,
      },
      {
        id: 'fq5',
        text: '「すまない」と いったのは だれ？',
        speech: '「すまない」って いったのは だれか おぼえてる？',
        choices: [
          { id: 'a', text: 'ゆき' },
          { id: 'b', text: '春かぜ' },
          { id: 'c', text: 'たけやぶ' },
        ],
        correctId: 'c',
        correctFeedback: 'せいかい！たけやぶが かげに なってしまって もうしわけない、と いったんだね。',
        incorrectFeedback: 'もういちど みてみよう',
        pageIndex: 1,
      },
      {
        id: 'fq6',
        text: '「もっこり」は なにが どうした ようす？',
        speech: '「もっこり」って どんな ようすの ことか わかる？',
        choices: [
          { id: 'a', text: 'はるかぜが ふいた' },
          { id: 'b', text: 'ゆきが つもった' },
          { id: 'c', text: 'ふきのとうが\n雪の中から 顔を だした' },
        ],
        correctId: 'c',
        correctFeedback: 'そうだね！ふきのとうが もっこりと かおを だしたんだね。かわいいね！',
        incorrectFeedback: 'さいごの ばめんを おもいだしてみよう',
        pageIndex: 3,
      },
      {
        id: 'fq7',
        text: 'このおはなしは どの きせつ？',
        speech: 'このおはなしは どの きせつのおはなしだっけ？',
        choices: [
          { id: 'a', text: '夏' },
          { id: 'b', text: '春' },
          { id: 'c', text: '冬' },
        ],
        correctId: 'b',
        correctFeedback: 'そうだね！「もう、すっかり はるです」って かいてあったね！',
        incorrectFeedback: 'さいごの ばめんを おもいだしてみよう',
        pageIndex: 3,
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
      imageSrc: '/ladybug.jpeg',
      color: '#e05555',
      introMessage: 'たんぽぽって\nすごいんだよ！',
      endingMessage1: 'たんぽぽのちえ\nわかったね！',
      endingMessage2: 'またいっしょに よもうね',
    },
    pages: [
      {
        text: '春になると、\nたんぽぽの きいろい きれいな\n花が さきます。\n\nに、さんにちたつと、その花は しぼんで、\nだんだん くろっぽい いろに\nかわっていきます。\n\nそうして、たんぽぽの花の じくは、\nぐったりと じめんに\nたおれてしまいます。',
        imageLabel: 'たんぽぽ 場面1',
        imageSrc: '/tanpopo1.jpg',
      },
      {
        text: 'けれども、たんぽぽは、\nかれてしまったのでは ありません。\n\n花と じくを しずかに やすませて、\nたねに、たくさんの えいようを\nおくっているのです。\n\nこうして、たんぽぽは、\nたねを どんどん ふとらせるのです。',
        imageLabel: 'たんぽぽ 場面2',
        imageSrc: '/tanpopo2.jpeg',
      },
      {
        text: 'このころになると、\nたおれていた 花の じくが、\nまた おき上がります。\n\nそうして、せのびをするように、\nぐんぐん のびていきます。\n\nそれは、せいを たかくするほうが、\nわた毛に かぜが よくあたって、\nたねを とおくまで とばすことが\nできるからです。',
        imageLabel: 'たんぽぽ 場面3',
        imageSrc: '/tanpopo3.jpeg',
      },
      {
        text: 'よく はれて、かぜのある ひには、\nわた毛の らっかさんは、\nいっぱいに ひらいて、\nとおくまで とんでいきます。\n\nでも、しめりけの おおい ひや、\nあめふりの ひには、\nわた毛の らっかさんは、\nすぼんでしまいます。\n\nわた毛が しめると おもくなって、\nたねを とおくに とばせないからです。',
        imageLabel: 'たんぽぽ 場面4',
        imageSrc: '/tanpopo4.jpeg',
      },
    ],
    questions: [
      {
        id: 'tq1',
        text: 'たんぽぽは いつの きせつに 花をさかせますか？',
        speech: 'たんぽぽは いつのきせつに 花をさかせるか おぼえてる？',
        choices: [
          { id: 'a', text: '春' },
          { id: 'b', text: '夏' },
          { id: 'c', text: '冬' },
        ],
        correctId: 'a',
        correctFeedback: 'そうだね！はるに きいろい きれいな 花が さくんだね。',
        incorrectFeedback: 'さいしょの ばめんを おもいだしてみよう',
        pageIndex: 0,
      },
      {
        id: 'tq2',
        text: '花が しぼんだあと、じくは どうなった？',
        speech: '花がしぼんだあと、じくは どうなったっけ？',
        choices: [
          { id: 'a', text: 'たかく のびた' },
          { id: 'b', text: 'じめんに たおれた' },
          { id: 'c', text: 'きえてしまった' },
        ],
        correctId: 'b',
        correctFeedback: 'そうだね！じくが ぐったりと じめんに たおれたんだね。',
        incorrectFeedback: 'さいしょの ばめんを おもいだしてみよう',
        pageIndex: 0,
      },
      {
        id: 'tq3',
        text: 'じくを たおして たんぽぽは なにをしていた？',
        speech: 'じくをたおして たんぽぽは なにをしていたのかな？',
        choices: [
          { id: 'a', text: 'たねに えいようを おくっていた' },
          { id: 'b', text: 'やすんでいた' },
          { id: 'c', text: 'かれていた' },
        ],
        correctId: 'a',
        correctFeedback: 'せいかい！たねに えいようを おくって、たねを ふとらせていたんだね。',
        incorrectFeedback: 'ふたつめの ばめんを おもいだしてみよう',
        pageIndex: 1,
      },
      {
        id: 'tq4',
        text: 'たおれていた じくは そのあと どうなった？',
        speech: 'たおれていたじくは そのあと どうなったか わかる？',
        choices: [
          { id: 'a', text: 'そのまま たおれていた' },
          { id: 'b', text: 'きれいな 花を さかせた' },
          { id: 'c', text: 'また おき上がって\nぐんぐん のびた' },
        ],
        correctId: 'c',
        correctFeedback: 'そうだね！せのびをするように ぐんぐん のびたんだね。',
        incorrectFeedback: 'みっつめの ばめんを おもいだしてみよう',
        pageIndex: 2,
      },
      {
        id: 'tq5',
        text: 'じくが たかく のびるのは なぜ？',
        speech: 'じくが たかくのびるのは どうしてだっけ？',
        choices: [
          { id: 'a', text: 'わた毛に かぜが よくあたって\nたねを とおくに とばせるから' },
          { id: 'b', text: 'おひさまに ちかづくため' },
          { id: 'c', text: 'もっと おおきな 花を さかせるため' },
        ],
        correctId: 'a',
        correctFeedback: 'すごい！せいを たかくすると わた毛に かぜが よくあたるんだね。',
        incorrectFeedback: 'みっつめの ばめんを おもいだしてみよう',
        pageIndex: 2,
      },
      {
        id: 'tq6',
        text: 'よく はれたひ、わた毛のらっかさんは どうなる？',
        speech: 'はれてかぜのある日、わた毛のらっかさんは どうなるか わかる？',
        choices: [
          { id: 'a', text: 'すぼんでしまう' },
          { id: 'b', text: 'いっぱいに ひらいて\nとおくまで とんでいく' },
          { id: 'c', text: 'じめんに おちる' },
        ],
        correctId: 'b',
        correctFeedback: 'せいかい！はれたひは わた毛のらっかさんが とおくまで とべるんだね！',
        incorrectFeedback: 'さいごの ばめんを おもいだしてみよう',
        pageIndex: 3,
      },
      {
        id: 'tq7',
        text: 'わた毛のらっかさんが すぼむのは なぜ？',
        speech: 'わた毛のらっかさんが すぼんじゃうのは どうしてだっけ？',
        choices: [
          { id: 'a', text: 'かぜが つよすぎるから' },
          { id: 'b', text: 'たねが まだ できていないから' },
          { id: 'c', text: 'わた毛が しめって おもくなると\nたねを とおくに とばせないから' },
        ],
        correctId: 'c',
        correctFeedback: 'そのとおり！ぬれると おもくなって とびにくくなるんだね。たんぽぽって かしこいね！',
        incorrectFeedback: 'さいごの ばめんを おもいだしてみよう',
        pageIndex: 3,
      },
    ],
  },

  // ─── スイミー ────────────────────────────────────
  {
    id: 'swimmy',
    title: 'スイミー',
    character: {
      name: 'クラゲさん',
      emoji: '🪼',
      imageSrc: '/jellyfish.jpeg',
      color: '#4a7fb5',
      introMessage: 'うみの おはなし\nしってる？',
      endingMessage1: 'スイミーって\nすごいね！',
      endingMessage2: 'またいっしょに よもうね',
    },
    pages: [
      {
        // 場面1: まぐろがやってきて赤い魚たちを食べた / スイミーだけ逃げた
        text: 'ある 日、おそろしい まぐろが、\nおなかを すかせて、\nすごい はやさで、\nミサイルみたいに つっこんで きた。\n小さな 赤い 魚たちを、\nひとくちで まぐろは、\nのこらず のみこんだ。\nにげたのは スイミーだけ。\nくらい 海の そこを、\nスイミーは およいだ。\nさびしかった。とても かなしかった。',
        imageLabel: 'スイミー 場面1',
        imageSrc: '/swimmy1.jpeg',
      },
      {
        // 場面2: 海のすばらしいものを見て元気を取り戻す
        text: 'けれど、海には、\nいっぱい すばらしい ものが あった。\nおもしろい ものを 見る たびに、\nスイミーは、だんだん\n元気を とりもどした。\nにじ色の ゼリーのような くらげ。\n水中ブルドーザーみたいな いせえび。',
        imageLabel: 'スイミー 場面2',
        imageSrc: '/swimmy2.jpeg',
      },
      {
        // 場面3: 岩かげの小さな魚たちを見つける / いろいろ考える
        text: 'ある 日、スイミーは 岩かげに、\n小さな 魚の 兄弟たちを\n見つけた。\n「出て こいよ。いっしょに あそぼう。」\n「だめだよ。大きな 魚に\n食べられてしまうから。」\nスイミーは うんと 考えた。\nいろいろ 考えた。\nそして、とつぜん、スイミーは さけんだ。',
        imageLabel: 'スイミー 場面3',
        imageSrc: '/swimmy3.jpeg',
      },
      {
        // 場面4: みんなで大きな魚のふりをしてまぐろを追い出す
        text: '「そうだ。みんな いっしょに\nおよごう！\nみんなで、ひとひきの 大きな\n魚みたいに なろう。」\nスイミーは みんなに 教えた。\n大きな 魚の ふりを して、\nいっしょに およぐ こと。\nぜったいに、はなれないように すること。\nみんなが、ひとひきの 大きな\n魚みたいに なった。\nそして、大きな まぐろを おいだした。',
        imageLabel: 'スイミー 場面4',
        imageSrc: '/swimmy4.jpeg',
      },
    ],
    questions: [
      {
        // p.24 ①「ミサイルみたいに」→まぐろのようす
        id: 'sq1',
        text: '「ミサイルみたいに」から まぐろの どんな ようすが わかる？',
        speech: '「ミサイルみたいに」って どんな ようすか わかる？',
        choices: [
          { id: 'a', text: 'まっすぐに むかって\nくる ようす' },
          { id: 'b', text: 'まわりを ぐるぐる\nまわって くる ようす' },
          { id: 'c', text: 'ゆっくり ただよって\nくる ようす' },
        ],
        correctId: 'a',
        correctFeedback: 'そうだね！まっすぐに すごい はやさで むかって くる ようすだね。',
        incorrectFeedback: 'さいしょの ばめんを おもいだしてみよう',
        pageIndex: 0,
      },
      {
        // p.24 ②まぐろは赤い魚たちをどうした
        id: 'sq2',
        text: 'まぐろは 赤い 魚たちを どうした？',
        speech: 'まぐろは 赤い 魚たちを どうしたっけ？',
        choices: [
          { id: 'a', text: 'おいかけて にがした' },
          { id: 'b', text: 'ひとくちで のこらず\nのみこんだ' },
          { id: 'c', text: 'いっしょに あそんだ' },
        ],
        correctId: 'b',
        correctFeedback: 'せいかい！ひとくちで のこらず のみこんでしまったんだね。こわいね。',
        incorrectFeedback: 'さいしょの ばめんを おもいだしてみよう',
        pageIndex: 0,
      },
      {
        // p.24 ③スイミーのきもち（さびしかった・かなしかった）
        id: 'sq3',
        text: 'くらい 海の そこを およぐ スイミーの きもちは？',
        speech: 'ひとりで くらい 海の そこを およぐ スイミーは どんな きもちだったかな？',
        choices: [
          { id: 'a', text: 'さびしくて かなしい きもち' },
          { id: 'b', text: 'うれしくて たのしい きもち' },
          { id: 'c', text: 'わくわく した きもち' },
        ],
        correctId: 'a',
        correctFeedback: 'そうだね！「さびしかった。とても かなしかった。」と かいてあったね。',
        incorrectFeedback: 'さいしょの ばめんを おもいだしてみよう',
        pageIndex: 0,
      },
      {
        // p.25 ④おもしろいものを見るたびにどうなった
        id: 'sq4',
        text: 'おもしろい ものを みる たびに スイミーは どうなった？',
        speech: 'おもしろい ものを みる たびに、スイミーは どうなったっけ？',
        choices: [
          { id: 'a', text: 'もっと さびしくなった' },
          { id: 'b', text: 'はやく にげようと おもった' },
          { id: 'c', text: 'だんだん げんきを とりもどした' },
        ],
        correctId: 'c',
        correctFeedback: 'せいかい！うみの すばらしい ものを みて だんだん げんきに なったんだね！',
        incorrectFeedback: 'ふたつめの ばめんを おもいだしてみよう',
        pageIndex: 1,
      },
      {
        // p.25 ⑤①くらげは何にたとえられた
        id: 'sq5',
        text: 'くらげは なにに たとえられた？',
        speech: 'くらげは なにに たとえられたか おぼえてる？',
        choices: [
          { id: 'a', text: 'にじ色の ゼリー' },
          { id: 'b', text: '水中ブルドーザー' },
          { id: 'c', text: 'ミサイル' },
        ],
        correctId: 'a',
        correctFeedback: 'そうだね！にじ色の ゼリーのような くらげ、きれいだね！',
        incorrectFeedback: 'ふたつめの ばめんを おもいだしてみよう',
        pageIndex: 1,
      },
      {
        // p.25 ⑤②いせえびは何にたとえられた
        id: 'sq6',
        text: 'いせえびは なにに たとえられた？',
        speech: 'いせえびは なにに たとえられたっけ？',
        choices: [
          { id: 'a', text: 'にじ色の ゼリー' },
          { id: 'b', text: 'ミサイル' },
          { id: 'c', text: '水中ブルドーザー' },
        ],
        correctId: 'c',
        correctFeedback: 'せいかい！水中ブルドーザーみたいな いせえびだね。つよそう！',
        incorrectFeedback: 'ふたつめの ばめんを おもいだしてみよう',
        pageIndex: 1,
      },
      {
        // p.30 ①魚の兄弟が出てこない理由
        id: 'sq7',
        text: '小さな 魚たちが でてこないのは なぜ？',
        speech: '小さな 魚たちが 岩かげから でてこないのは なぜだっけ？',
        choices: [
          { id: 'a', text: '海が つめたいから' },
          { id: 'b', text: '大きな 魚に\n食べられてしまうから' },
          { id: 'c', text: 'ねむくて きゅうけい して いるから' },
        ],
        correctId: 'b',
        correctFeedback: 'そうだね！おおきな さかなに たべられるのが こわかったんだね。',
        incorrectFeedback: 'みっつめの ばめんを おもいだしてみよう',
        pageIndex: 2,
      },
      {
        // p.30 ②スイミーが考えたこと
        id: 'sq8',
        text: 'スイミーは どんな ほうほうを 考えた？',
        speech: 'スイミーは どんな ほうほうを 考えたかな？',
        choices: [
          { id: 'a', text: '大きな 魚に 食べられないで\n海の なかを じゆうに およぐ ほうほう' },
          { id: 'b', text: '大きな 魚より\nはやく およぐ ほうほう' },
          { id: 'c', text: '大きな 魚に みつからないよう\nじっとして いる ほうほう' },
        ],
        correctId: 'a',
        correctFeedback: 'せいかい！みんなで じゆうに うみを およぐ ほうほうを かんがえたんだね。',
        incorrectFeedback: 'みっつめの ばめんを おもいだしてみよう',
        pageIndex: 2,
      },
      {
        // p.31 ④スイミーがみんなに教えたこと
        id: 'sq9',
        text: 'スイミーが みんなに おしえたのは どんな こと？',
        speech: 'スイミーが みんなに おしえたのは どんな こと？',
        choices: [
          { id: 'a', text: 'いわかげに かくれて じっとして いる こと' },
          { id: 'b', text: '大きな 魚の ふりを して\nいっしょに はなれずに およぐ こと' },
          { id: 'c', text: 'ばらばらに にげて うみの そこに もぐる こと' },
        ],
        correctId: 'b',
        correctFeedback: 'そうだね！みんなで かたちを まもって おおきな さかなに なったんだね！',
        incorrectFeedback: 'さいごの ばめんを おもいだしてみよう',
        pageIndex: 3,
      },
      {
        // p.31 ⑤みんなで泳いだらどうなった
        id: 'sq10',
        text: 'みんなで いっしょに およいだら どうなった？',
        speech: 'みんなで いっしょに およいだら どうなったか おぼえてる？',
        choices: [
          { id: 'a', text: 'まぐろと なかよくなった' },
          { id: 'b', text: 'うみの そこに にげた' },
          { id: 'c', text: '大きな まぐろを おいだした' },
        ],
        correctId: 'c',
        correctFeedback: 'そうだね！みんなで ちからを あわせて まぐろを おいだしたんだね。すごいね！',
        incorrectFeedback: 'さいごの ばめんを おもいだしてみよう',
        pageIndex: 3,
      },
    ],
  },

  // ─── ミリーのすてきなぼうし ─────────────────────────
  {
    id: 'millie',
    title: 'ミリーのすてきなぼうし',
    character: {
      name: 'ことりさん',
      emoji: '🐦',
      imageSrc: '/bird.jpeg',
      color: '#9b59b6',
      introMessage: 'すてきな ぼうしの\nおはなしだよ！',
      endingMessage1: 'ミリーの ぼうし、\nすてきだったね！',
      endingMessage2: 'またいっしょに よもうね',
    },
    pages: [
      {
        // 場面1: ぼうしやさんで羽のぼうしを試す / 値段が高い
        text: 'ミリーは、ぼうしやさんに はいりました。\n「はのついた ぼうしを、みせてください。」\nみせのひとは、さっそく、その ぼうしを\nもってきてくれました。\nためしてみると、ぴったりです。\n「じゃあ、これ ください。」\n「かしこまりました。おねだんは、\nきゅうまんきゅうせんきゅうひゃく\nきゅうじゅうきゅうえん でございます。」',
        imageLabel: 'ミリー 場面1',
        imageSrc: '/millie1.jpeg',
      },
      {
        // 場面2: お金が足りない / 空っぽのさいふ / 店長さんが「ありますよ」
        text: 'ミリーは、おさいふを とりだしました。\nでも、ちょっと たりないみたいです。\n「あの、もうすこし やすいの ありますか。」\n「どのくらいが よろしいですか。」\n「あの、このくらい。」\nおさいふの なかを みせると、からっぽでした。\nみせのひとは てんじょうを みあげて、\n「あっ、ありますよ！」と さけびました。',
        imageLabel: 'ミリー 場面2',
        imageSrc: '/millie2.jpeg',
      },
      {
        // 場面3: すてきなぼうしをかぶってお店を出る
        text: 'みせのひとが もってきたのは、\nとても すてきな ぼうしでした。\n「はこに いれましょうか。」\n「いいえ、このまま かぶっていくから、\nけっこうです。」\nミリーは、おみせを でました。\nあたらしい ぼうしのことを\n考えながら、あるきました。',
        imageLabel: 'ミリー 場面3',
        imageSrc: '/millie3.jpg',
      },
      {
        // 場面4: ケーキやさん・花やさん・公園でぼうしが変わる
        text: 'ケーキやさんの まえを とおると、\nぼうしは、ケーキの ぼうしに なりました。\n花やさんを とおりすぎると、\n花いっぱいの ぼうしに なりました。\n公園では、ふんすいの ぼうしに なりました。\nミリーの すてきな ぼうしは、\nいつも あたらしい ぼうしに\nへんしんして いくのでした。',
        imageLabel: 'ミリー 場面4',
        imageSrc: '/millie4.jpeg',
      },
    ],
    questions: [
      {
        // p.36 ①「ただいま」のいみ
        id: 'mq1',
        text: '「ただいま」は どういう いみ？',
        speech: '「ただいま」って どういう いみか わかる？',
        choices: [
          { id: 'a', text: 'いますぐに\nもってきます、という いみ' },
          { id: 'b', text: 'いま、おみせに かえってきます、という いみ' },
          { id: 'c', text: 'いまなら、ただで かえます、という いみ' },
        ],
        correctId: 'a',
        correctFeedback: 'そうだね！「ただいま」は いますぐに もってきます、という いみだね。',
        incorrectFeedback: 'さいしょの ばめんを おもいだしてみよう',
        pageIndex: 0,
      },
      {
        // p.36 ③「かしこまりました」のいみ
        id: 'mq2',
        text: '「かしこまりました」は どういう いみ？',
        speech: '「かしこまりました」って どういう いみだっけ？',
        choices: [
          { id: 'a', text: 'きんちょう しました' },
          { id: 'b', text: 'わかりました' },
          { id: 'c', text: 'きちんと すわりました' },
        ],
        correctId: 'b',
        correctFeedback: 'せいかい！「かしこまりました」は「わかりました」という ていねいな いみだね。',
        incorrectFeedback: 'さいしょの ばめんを おもいだしてみよう',
        pageIndex: 0,
      },
      {
        // p.36 ④やすいぼうしをたのんだわけ
        id: 'mq3',
        text: 'ミリーが やすいぼうしを たのんだのは なぜ？',
        speech: 'ミリーが やすいぼうしを たのんだのは どうしてだっけ？',
        choices: [
          { id: 'a', text: 'やすいほうが すきだから' },
          { id: 'b', text: 'おさいふの なかが たりなかったから' },
          { id: 'c', text: 'もっと たくさん かいたかったから' },
        ],
        correctId: 'b',
        correctFeedback: 'そうだね！おさいふが からっぽで おかねが たりなかったんだね。',
        incorrectFeedback: 'さいしょの ばめんを おもいだしてみよう',
        pageIndex: 1,
      },
      {
        // p.37 ⑤「このくらい」と言ったのはだれ
        id: 'mq4',
        text: '「あの、このくらい。」と いったのは だれ？',
        speech: '「あの、このくらい。」って いったのは だれかな？',
        choices: [
          { id: 'a', text: 'ミリー' },
          { id: 'b', text: 'みせのひと' },
          { id: 'c', text: 'とおりすがりの ひと' },
        ],
        correctId: 'a',
        correctFeedback: 'せいかい！ミリーが おさいふを みせながら いったんだね。',
        incorrectFeedback: 'ふたつめの ばめんを おもいだしてみよう',
        pageIndex: 1,
      },
      {
        // p.38 ①「けっこうです」のいみ
        id: 'mq5',
        text: '「けっこうです」は どういう いみ？',
        speech: '「けっこうです」って どういう いみか わかる？',
        choices: [
          { id: 'a', text: 'ぼうしが きにいらなかった、という いみ' },
          { id: 'b', text: 'もっと やすくして、という いみ' },
          { id: 'c', text: 'はこは いりません、という いみ' },
        ],
        correctId: 'c',
        correctFeedback: 'そうだね！はこに いれなくて いいです、という ていねいな いいかただね。',
        incorrectFeedback: 'みっつめの ばめんを おもいだしてみよう',
        pageIndex: 2,
      },
      {
        // p.38 ②「なにかぞうしなくちゃ」の理由
        id: 'mq6',
        text: 'ミリーが「なにかそうぞうしなくちゃ」と おもったのは なぜ？',
        speech: 'ミリーが「そうぞうしなくちゃ」と おもったのは なぜかな？',
        choices: [
          { id: 'a', text: 'ぼうしを ほめてもらいたいから' },
          { id: 'b', text: 'あたらしい ぼうしの かたちが\nみえないから' },
          { id: 'c', text: 'ぼうしを なくして しまったから' },
        ],
        correctId: 'b',
        correctFeedback: 'せいかい！かたちが みえないから、そうぞうして たのしんだんだね！',
        incorrectFeedback: 'みっつめの ばめんを おもいだしてみよう',
        pageIndex: 2,
      },
      {
        // p.38/39 ミリーがそうぞうしたぼうし
        id: 'mq7',
        text: '公園で ぼうしは なんの ぼうしに なった？',
        speech: '公園で ミリーの ぼうしは なんに へんしんしたっけ？',
        choices: [
          { id: 'a', text: 'ケーキの ぼうし' },
          { id: 'b', text: '花いっぱいの ぼうし' },
          { id: 'c', text: 'ふんすいの ぼうし' },
        ],
        correctId: 'c',
        correctFeedback: 'そうだね！公園では ふんすいの ぼうしに なったんだね。すてきだね！',
        incorrectFeedback: 'さいごの ばめんを おもいだしてみよう',
        pageIndex: 3,
      },
    ],
  },

  // ─── お手紙 ──────────────────────────────────────
  {
    id: 'otegami',
    title: 'お手紙',
    character: {
      name: 'かたつむりさん',
      emoji: '🐌',
      imageSrc: '/snail.jpeg',
      color: '#c07a30',
      introMessage: 'こんにちは！\nかたつむりさんだよ！\nがまくんと かえるくんの\nお話を 読んでみよう！',
      endingMessage1: 'がまくん、よかったね！\nすてきなお手紙だったね！',
      endingMessage2: 'もんだいも ぜんぶ できたね！\nすごいぞ！',
    },
    pages: [
      {
        // 場面1：がまくんがかなしそう
        text: 'がまくんは、げんかんの前にこしを下ろしていました。かえるくんがやって来て、言いました。「どうしたんだい、がまくん。なんだかかなしそうだね。」「今、一日のうちのかなしい時なんだ。お手紙をまつ時間なんだよ。」',
        imageLabel: 'げんかんに座るがまくん',
        imageSrc: '/tegami1.jpeg',
      },
      {
        // 場面2：だれからもお手紙をもらったことがない
        text: '「だって、ぼく、お手紙をもらったことがないんだ。だれからも。」「いちどもかい。」「いちどもないよ。」ふたりとも、かなしい気分で、げんかんの前にこしを下ろしていました。',
        imageLabel: 'ふたりともかなしい',
        imageSrc: '/tegami2.jpeg',
      },
      {
        // 場面3：かえるくんが手紙を書く
        text: 'かえるくんは、大いそぎで家へ帰りました。えんぴつと紙を見つけました。紙にこう書きました。「親愛なるがまくん。ぼくは、うれしく思っています。きみがぼくの親友であることを。きみの親友、かえるくんより。」かえるくんは、ふうとうに入れました。',
        imageLabel: '手紙を書くかえるくん',
        imageSrc: '/tegami3.jpeg',
      },
      {
        // 場面4：かたつむりくんに頼む
        text: 'かえるくんは、家からとび出しました。知り合いのかたつむりくんに会いました。「このお手紙を、がまくんのゆうびんうけに入れてくれないかい。」「まかせてくれよ。すぐやるぜ。」かたつむりくんが言いました。',
        imageLabel: 'かたつむりに頼むかえるくん',
        imageSrc: '/tegami4.jpeg',
      },
      {
        // 場面5：がまくんの家でまどの外を見てまつ
        text: 'かえるくんは、がまくんの家へもどりました。がまくんは、ベッドでお昼ねをしていました。「がまくん、きみ、まどの外を見ていないかい。きっと、お手紙が来るよ。ぼくが、きみにお手紙を出したんだもの。」ふたりは、まどの外をながめてまちました。',
        imageLabel: 'まどの外を見てまつ',
        imageSrc: '/tegami5.jpeg',
      },
      {
        // 場面6：手紙の内容・しあわせにまつ
        text: '「ぼくは、こう書いたんだ。親愛なるがまくん。きみがぼくの親友であることを、うれしく思っています。きみの親友、かえるくんより。」「ああ。とてもいいお手紙だ。」ふたりは、げんかんに出て、お手紙の来るのをまっていました。とてもしあわせな気もちで、そこにすわって、長いことまっていました。',
        imageLabel: 'ふたりでしあわせにまつ',
        imageSrc: '/tegami6.jpeg',
      },
    ],
    questions: [
      {
        id: 'tegamiq1',
        text: 'かえるくんが「いちどもかい。」とたずねたのは、なぜですか？',
        speech: 'かえるくんが「いちどもかい。」って たずねたのは なぜかわかる？',
        choices: [
          { id: 'a', text: 'がまくんを なぐさめようとしたから' },
          { id: 'b', text: 'がまくんの話が しんじられなかったから' },
          { id: 'c', text: 'がまくんを かなしくさせてしまったから' },
        ],
        correctId: 'b',
        correctFeedback: 'せいかい！いちどもないなんて、ほんとう？とおどろいたんだね！',
        incorrectFeedback: 'かえるくんとがまくんが話している場面を もういちど よんでみよう！',
        pageIndex: 1,
      },
      {
        id: 'tegamiq2',
        text: 'なぜかえるくんも「かなしい気分」になったのですか？',
        speech: 'かえるくんも「かなしい気分」に なったのは なぜかな？',
        choices: [
          { id: 'a', text: 'がまくんのことが よく 分からなかったから' },
          { id: 'b', text: 'がまくんが きげんをなおしてくれなかったから' },
          { id: 'c', text: 'がまくんが かなしい思いをしていることが かなしかったから' },
        ],
        correctId: 'c',
        correctFeedback: 'せいかい！友だちがかなしんでいると、じぶんもかなしくなるんだね！',
        incorrectFeedback: 'ふたりがげんかんにすわっている場面を もういちど よんでみよう！',
        pageIndex: 1,
      },
      {
        id: 'tegamiq3',
        text: 'かえるくんは、家に帰って何をしましたか？',
        speech: 'かえるくんは 家に帰って なにをしたっけ？',
        choices: [
          { id: 'a', text: 'えんぴつと紙で がまくんに お手紙を書いた' },
          { id: 'b', text: 'ごはんを たべて やすんだ' },
          { id: 'c', text: 'かたつむりくんに でんわをかけた' },
        ],
        correctId: 'a',
        correctFeedback: 'せいかい！えんぴつと紙を見つけて、がまくんにお手紙を書いたんだね！',
        incorrectFeedback: 'かえるくんが家に帰った場面を もういちど よんでみよう！',
        pageIndex: 2,
      },
      {
        id: 'tegamiq4',
        text: 'かえるくんが家からとびだしたのは、なぜですか？',
        speech: 'かえるくんが 家から とびだしたのは なぜだろう？',
        choices: [
          { id: 'a', text: 'かたつむりくんが 家の外を通るのを見かけたから' },
          { id: 'b', text: 'がまくんに すこしでも早く お手紙をとどけたかったから' },
          { id: 'c', text: 'なるべく早く がまくんの家に もどりたかったから' },
        ],
        correctId: 'b',
        correctFeedback: 'せいかい！がまくんに早くとどけたくて、とびだしたんだね！',
        incorrectFeedback: 'かえるくんが外にとびだした場面を もういちど よんでみよう！',
        pageIndex: 3,
      },
      {
        id: 'tegamiq5',
        text: 'がまくんの家にもどったとき、がまくんはどうしていましたか？',
        speech: 'かえるくんが もどったとき、がまくんは どうしていたっけ？',
        choices: [
          { id: 'a', text: 'ベッドで お昼ねをしていた' },
          { id: 'b', text: 'げんかんの前に すわっていた' },
          { id: 'c', text: 'まどの外を ながめていた' },
        ],
        correctId: 'a',
        correctFeedback: 'せいかい！がまくんはベッドでお昼ねをしていたんだね！',
        incorrectFeedback: 'かえるくんがもどってきた場面を もういちど よんでみよう！',
        pageIndex: 4,
      },
      {
        id: 'tegamiq6',
        text: '「きみが。」と聞いたとき、がまくんはどんな気もちでしたか？',
        speech: '「きみが。」と聞いたとき、がまくんは どんな気もちだったかな？',
        choices: [
          { id: 'a', text: 'ばかにした気もち' },
          { id: 'b', text: 'おどろいた気もち' },
          { id: 'c', text: 'かなしい気もち' },
        ],
        correctId: 'b',
        correctFeedback: 'せいかい！かえるくんがお手紙をくれたと知って、びっくりしたんだね！',
        incorrectFeedback: 'かえるくんがお手紙のことを話した場面を もういちど よんでみよう！',
        pageIndex: 4,
      },
      {
        id: 'tegamiq7',
        text: 'げんかんでお手紙をまっていたとき、ふたりはどんな気もちでしたか？',
        speech: 'げんかんで まっているとき、ふたりは どんな気もちだったっけ？',
        choices: [
          { id: 'a', text: '手紙のいみが よく分からない気もち' },
          { id: 'b', text: '手紙など どうでもいいという気もち' },
          { id: 'c', text: 'とても しあわせな気もち' },
        ],
        correctId: 'c',
        correctFeedback: 'せいかい！ふたりとも、とてもしあわせな気もちでまっていたんだね！',
        incorrectFeedback: 'さいごの場面を もういちど よんでみよう！',
        pageIndex: 5,
      },
      {
        id: 'tegamiq8',
        text: 'かえるくんが「しあわせな気もち」になったのは、なぜですか？',
        speech: 'かえるくんが「しあわせな気もち」に なったのは なぜかな？',
        choices: [
          { id: 'a', text: 'がまくんが 元気になってくれたから' },
          { id: 'b', text: '親友のがまくんに お手紙を書いて ふたりでまったから' },
          { id: 'c', text: 'お手紙が とどいたから' },
        ],
        correctId: 'b',
        correctFeedback: 'せいかい！大切な友だちのためにしたことが、うれしかったんだね！',
        incorrectFeedback: 'かえるくんがお手紙を書いた場面を もういちど よんでみよう！',
        pageIndex: 5,
      },
    ],
  },

  // ─── どうぶつ園のじゅうい ─────────────────────────
  {
    id: 'doubutsuen-no-juui',
    title: 'どうぶつ園のじゅうい',
    character: {
      name: 'くまさん',
      imageSrc: '/bear.jpeg',
      emoji: '🐻',
      color: '#3a9a50',
      introMessage: 'こんにちは！\nくまさんだよ！\nどうぶつ園のじゅういさんの\nおしごとを読んでみよう！',
      endingMessage1: 'じゅういさんのおしごと、すごかったね！',
      endingMessage2: 'もんだいも ぜんぶ できたね！\nすごいぞ！',
    },
    pages: [
      {
        // 場面1：朝の見回り
        text: '朝、わたしのしごとは、どうぶつ園の中を見回ることからはじまります。元気なときのどうぶつのようすを見ておくと、びょうきになったとき、すぐに気づくことができます。また、なれてもらえると、見せてもらいやすくなります。毎日、「おはよう。」と言いながら、おりの中へ入り、顔も声もおぼえてもらうようにしていました。',
        imageLabel: '朝の見回り',
        imageSrc: '/juui1b.jpeg',
      },
      {
        // 場面2：いのししの赤ちゃん
        text: '見回りがおわるころ、しいくいんさんによばれました。いのししのおなかに赤ちゃんがいるかどうか、しらべてほしいというのです。おなかにきかいを当てなければなりませんが、いのししはこわがります。しいくいんさんがえさを食べさせている間に、そっとおなかにきかいを当ててしらべました。おなかの中に、赤ちゃんがいました。',
        imageLabel: 'いのししを診察',
        imageSrc: '/juui2b.jpeg',
      },
      {
        // 場面3：ペンギンのボールペン
        text: '夕方、しいくいんさんから電話がかかってきました。ペンギンが、ボールペンをのみこんでしまったということです。ペンギンは水中で魚をつかまえて、丸ごとのみこみます。えさとまちがえてのみこんだのでしょう。大いそぎで手当てをして、ボールペンをとりだすことができました。早めに手当てできたので、ペンギンは元気になりました。',
        imageLabel: 'ペンギンの手当て',
        imageSrc: '/juui3b.jpeg',
      },
      {
        // 場面4：一日のおわり
        text: '一日のしごとのおわりには、どうぶつのようすを日記に書きます。つぎに同じようなびょうきやけがのどうぶつを、よりよくちりょうするためです。どうぶつ園を出る前には、かならずおふろに入ります。どうぶつをさわった後は、体をあらわなければいけないのです。これで、ようやく長い一日がおわります。',
        imageLabel: '日記を書くじゅういさん',
        imageSrc: '/juui4b.jpeg',
      },
    ],
    questions: [
      {
        id: 'juuiq1',
        text: 'じゅういさんの 一日のはじまりのしごとは なんですか？',
        speech: 'じゅういさんの 一日のはじまりのしごとは なんだっけ？',
        choices: [
          { id: 'a', text: 'どうぶつ園の中を 見回ること' },
          { id: 'b', text: 'どうぶつに えさをあげること' },
          { id: 'c', text: '日記を書くこと' },
        ],
        correctId: 'a',
        correctFeedback: 'せいかい！毎朝、どうぶつの元気なようすを 見回るんだね！',
        incorrectFeedback: 'さいしょの場面を おもいだしてみよう！',
        pageIndex: 0,
      },
      {
        id: 'juuiq2',
        text: '「元気なときのようすを見ておく」のは、なぜですか？',
        speech: '「元気なときのようすを見ておく」のは なぜだっけ？',
        choices: [
          { id: 'a', text: 'どうぶつたちに おぼえてもらいやすくなるから' },
          { id: 'b', text: 'びょうきになったとき、すぐに気づくことができるから' },
          { id: 'c', text: 'えさを あげやすくなるから' },
        ],
        correctId: 'b',
        correctFeedback: 'せいかい！いつもと違うことに すぐ気づけるんだね！',
        incorrectFeedback: 'さいしょの場面を もういちど よんでみよう！',
        pageIndex: 0,
      },
      {
        id: 'juuiq3',
        text: 'じゅういさんは どうぶつたちに なにをおぼえてもらうようにしていましたか？',
        speech: 'じゅういさんは どうぶつたちに なにを おぼえてもらうように していたかな？',
        choices: [
          { id: 'a', text: 'なまえをおぼえてもらうようにしていた' },
          { id: 'b', text: 'えさの食べかたをおぼえてもらうようにしていた' },
          { id: 'c', text: '顔と声をおぼえてもらうようにしていた' },
        ],
        correctId: 'c',
        correctFeedback: 'せいかい！毎日「おはよう」と言って、顔も声もおぼえてもらっていたんだね！',
        incorrectFeedback: 'さいしょの場面を もういちど よんでみよう！',
        pageIndex: 0,
      },
      {
        id: 'juuiq4',
        text: 'しいくいんさんが じゅういさんをよんだのは、なぜですか？',
        speech: 'しいくいんさんが じゅういさんを よんだのは なぜだっけ？',
        choices: [
          { id: 'a', text: 'いのししのおなかに 赤ちゃんがいるかどうか しらべてほしかったから' },
          { id: 'b', text: 'いのししが けがをしているかどうか たしかめてほしかったから' },
          { id: 'c', text: 'いのししに えさをあげてほしかったから' },
        ],
        correctId: 'a',
        correctFeedback: 'せいかい！いのししのおなかに赤ちゃんがいるかしらべてほしかったんだね！',
        incorrectFeedback: 'いのししの場面を もういちど よんでみよう！',
        pageIndex: 1,
      },
      {
        id: 'juuiq5',
        text: 'じゅういさんは どのように いのししをしらべましたか？',
        speech: 'じゅういさんは どのように いのししを しらべたのかな？',
        choices: [
          { id: 'a', text: 'いのししをつかまえて、おなかをさわった' },
          { id: 'b', text: 'しいくいんさんが えさを食べさせている間に、おなかにきかいを当てた' },
          { id: 'c', text: 'いのししに ねむりぐすりをつかった' },
        ],
        correctId: 'b',
        correctFeedback: 'せいかい！こわがるいのししが気づかないように、そっとしらべたんだね！',
        incorrectFeedback: 'いのししの場面を もういちど よんでみよう！',
        pageIndex: 1,
      },
      {
        id: 'juuiq6',
        text: 'しいくいんさんから電話がかかってきたのは、なぜですか？',
        speech: 'しいくいんさんから 電話がきたのは なぜだっけ？',
        choices: [
          { id: 'a', text: 'ペンギンが ボールペンをのみこんでしまったから' },
          { id: 'b', text: 'ペンギンが けがをしてしまったから' },
          { id: 'c', text: 'ペンギンが 池から にげてしまったから' },
        ],
        correctId: 'a',
        correctFeedback: 'せいかい！ペンギンがボールペンをのみこんでしまったんだね！',
        incorrectFeedback: 'ペンギンの場面を もういちど よんでみよう！',
        pageIndex: 2,
      },
      {
        id: 'juuiq7',
        text: 'ペンギンは なにをえさとまちがえてのみこみましたか？',
        speech: 'ペンギンは なにを えさとまちがえて のみこんじゃったの？',
        choices: [
          { id: 'a', text: '石' },
          { id: 'b', text: 'プラスチックのかけら' },
          { id: 'c', text: 'ボールペン' },
        ],
        correctId: 'c',
        correctFeedback: 'せいかい！ボールペンを魚とまちがえてのみこんだんだね！',
        incorrectFeedback: 'ペンギンの場面を もういちど よんでみよう！',
        pageIndex: 2,
      },
      {
        id: 'juuiq8',
        text: '電話をうけたじゅういさんは、どうしましたか？',
        speech: '電話をうけた じゅういさんは どうしたっけ？',
        choices: [
          { id: 'a', text: '大いそぎで手当てをして ボールペンをとりだした' },
          { id: 'b', text: 'つぎの日に ペンギンを びょういんへ連れていった' },
          { id: 'c', text: 'しいくいんさんに ペンギンをみてもらった' },
        ],
        correctId: 'a',
        correctFeedback: 'せいかい！早めに手当てできたから、ペンギンは元気になったんだね！',
        incorrectFeedback: 'ペンギンの場面を もういちど よんでみよう！',
        pageIndex: 2,
      },
      {
        id: 'juuiq9',
        text: '一日のおわりに日記を書くのは、なぜですか？',
        speech: '一日のおわりに 日記を書くのは なぜかな？',
        choices: [
          { id: 'a', text: 'どうぶつのかかりやすいびょうきを 知るため' },
          { id: 'b', text: 'つぎに同じようなびょうきやけがのどうぶつを よりよくちりょうするため' },
          { id: 'c', text: 'しいくいんさんに 毎日ほうこくするため' },
        ],
        correctId: 'b',
        correctFeedback: 'せいかい！つぎのどうぶつをもっとよくなおすために書いているんだね！',
        incorrectFeedback: 'さいごの場面を もういちど よんでみよう！',
        pageIndex: 3,
      },
      {
        id: 'juuiq10',
        text: 'どうぶつ園を出る前に おふろに入るのは、なぜですか？',
        speech: 'どうぶつ園を出る前に おふろに入るのは なぜだっけ？',
        choices: [
          { id: 'a', text: 'つぎに同じびょうきのどうぶつを よりよくちりょうするため' },
          { id: 'b', text: 'どうぶつのかかりやすいびょうきを 知るため' },
          { id: 'c', text: 'どうぶつをさわった後は 体をあらわなければいけないから' },
        ],
        correctId: 'c',
        correctFeedback: 'せいかい！どうぶつにふれた後は体をきれいにしなければいけないんだね！',
        incorrectFeedback: 'さいごの場面を もういちど よんでみよう！',
        pageIndex: 3,
      },
    ],
  },

  // ─── あめのうた ──────────────────────────────────
  {
    id: 'ame-no-uta',
    title: 'あめのうた',
    character: {
      name: 'かえるさん',
      imageSrc: '/frog.jpeg',
      emoji: '🐸',
      color: '#4a90d9',
      introMessage: 'こんにちは！\nかえるさんだよ！\nいっしょに あめのうたを よもう！',
      endingMessage1: 'あめの うたは すてきだったね！',
      endingMessage2: 'もんだいも ぜんぶ できたね！\nすごいぞ！',
    },
    pages: [
      {
        // 場面1：あめはひとりじゃうたえない
        text: 'あめのうた\nあめは ひとりじゃ うたえない、\nきっと だれかと いっしょだよ。',
        imageLabel: '雨が降っている様子',
        imageSrc: '/ame1.jpeg',
      },
      {
        // 場面2：やねとつちのうた
        text: 'あめと やねと いっしょに やねのうた\nあめと つちと いっしょに つちのうた',
        imageLabel: 'やねと土に雨が降る',
        imageSrc: '/ame2.jpg',
      },
      {
        // 場面3：かわとはなのうた
        text: 'あめと かわと いっしょに かわのうた\nあめと 花と いっしょに 花のうた\nあめは だれとも なかよし、\nどんな うたでも しってるよ。',
        imageLabel: '川と花に雨が降る',
        imageSrc: '/ame3.jpeg',
      },
      {
        // 場面4：雨の音
        text: 'やねで とんとん やねのうた\nつちで ぴんちん つちのうた\nかわで つんつん かわのうた\n花で とんしとし 花のうた。',
        imageLabel: '雨の音のリズム',
        imageSrc: '/ame4.jpg',
      },
    ],
    questions: [
      {
        id: 'aq1',
        text: 'あめは だれと いっしょに うたいますか？',
        speech: 'あめは だれと いっしょに うたうか おぼえてる？',
        choices: [
          { id: 'a', text: 'やね・つち・かわ・花' },
          { id: 'b', text: 'やね・つち だけ' },
          { id: 'c', text: 'かわ・花 だけ' },
        ],
        correctId: 'a',
        correctFeedback: 'せいかい！やね、つち、かわ、花　みんなと いっしょに うたうんだね！',
        incorrectFeedback: 'もういちど しを よんでみよう。やねとつちとかわと花が でてくるよ。',
        pageIndex: 2,
      },
      {
        id: 'aq2',
        text: 'なぜ「どんな うたでも しってる」のですか？',
        speech: 'あめが「どんな うたでも しってる」のは なぜかな？',
        choices: [
          { id: 'a', text: 'たくさん れんしゅうしたから' },
          { id: 'b', text: 'だれとも なかよしだから' },
          { id: 'c', text: 'うたが だいすきだから' },
        ],
        correctId: 'b',
        correctFeedback: 'せいかい！だれとも なかよしだから、どんな うたでも しってるんだね！',
        incorrectFeedback: 'しの なかに「あめは だれとも なかよし」って あったよ。',
        pageIndex: 2,
      },
      {
        id: 'aq3',
        text: 'この しを どのように よみますか？',
        speech: 'この しは どんなふうに よむと いいかな？',
        choices: [
          { id: 'a', text: 'おおきな こえで よむ' },
          { id: 'b', text: 'ゆっくり もじを たどって よむ' },
          { id: 'c', text: 'りずむを かんじながら よむ' },
        ],
        correctId: 'c',
        correctFeedback: 'そうだね！りずむを かんじながら よむと たのしいね！',
        incorrectFeedback: 'とんとん、ぴんちん、つんつん…　おとの りずむを かんじてみよう！',
        pageIndex: 3,
      },
    ],
  },
]


// ② 開発時のみ：correctId が choices に存在するか全問チェック
if (process.env.NODE_ENV === 'development') {
  for (const story of stories) {
    for (const q of story.questions) {
      const ids = q.choices.map(c => c.id)
      if (!ids.includes(q.correctId)) {
        console.error(
          `[stories] ❌ 正解IDエラー: story="${story.id}" question="${q.id}" correctId="${q.correctId}" が choices に存在しません`
        )
      }
    }
  }
}
