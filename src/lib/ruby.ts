// =============================================
// ruby.ts — テキストにふりがな（ルビ）セグメントを付与する
// RUBY_ENTRIES は「長い語 → 短い語」の順で並べ、部分マッチを防ぐ
// =============================================

export type RubySegment =
  | { type: 'text'; content: string }
  | { type: 'ruby'; kanji: string; reading: string }

// このアプリの全お話に出てくる語のみ収録（長いものを先に）
const RUBY_ENTRIES: [string, string][] = [
  // ── 4文字以上 ──
  ['春かぜ',   'はるかぜ'],
  ['お日さま', 'おひさま'],
  ['大いそぎ', 'おおいそぎ'],
  ['岩かげ',   'いわかげ'],
  ['赤ちゃん', 'あかちゃん'],
  // ── 3文字 ──
  ['見回り',  'みまわり'],
  ['小さな',  'ちいさな'],
  ['小さい',  'ちいさい'],
  ['大きな',  'おおきな'],
  ['大きい',  'おおきい'],
  ['一休み',  'ひとやすみ'],
  ['歌声',   'うたごえ'],
  // ── 2文字の熟語 ──
  ['お昼',   'おひる'],
  ['一日',   'いちにち'],
  ['毎日',   'まいにち'],
  ['日記',   'にっき'],
  ['元気',   'げんき'],
  ['手紙',   'てがみ'],
  ['気分',   'きぶん'],
  ['親愛',   'しんあい'],
  ['親友',   'しんゆう'],
  ['電話',   'でんわ'],
  ['公園',   'こうえん'],
  ['水中',   'すいちゅう'],
  ['早め',   'はやめ'],
  ['連れ',   'つれ'],
  ['食べ',   'たべ'],
  ['考え',   'かんがえ'],
  ['書き',   'かき'],
  // ── 単漢字（このお話では読みが一定なもの） ──
  ['一人', 'ひとり'],
  ['春', 'はる'],
  ['夏', 'なつ'],
  ['冬', 'ふゆ'],
  ['雪', 'ゆき'],
  ['顔', 'かお'],
  ['花', 'はな'],
  ['海', 'うみ'],
  ['岩', 'いわ'],
  ['山', 'やま'],
  ['竹', 'たけ'],
  ['朝', 'あさ'],
  ['声', 'こえ'],
  ['魚', 'さかな'],
  ['歌', 'うた'],
  ['犬', 'いぬ'],
  ['土', 'つち'],
  ['川', 'かわ'],
  ['水', 'みず'],
  ['外', 'そと'],
  ['手', 'て'],
  ['中', 'なか'],
  ['下', 'した'],
  ['毛', 'げ'],
  ['家', 'いえ'],
  ['前', 'まえ'],
  ['今', 'いま'],
  ['帰', 'かえ'],
  ['紙', 'かみ'],
]

/**
 * テキストを RubySegment の配列に変換する
 * すでに ruby になっているセグメントはスキップ（二重マッチ防止）
 */
export function buildRubySegments(text: string): RubySegment[] {
  let segments: RubySegment[] = [{ type: 'text', content: text }]

  for (const [kanji, reading] of RUBY_ENTRIES) {
    const next: RubySegment[] = []

    for (const seg of segments) {
      if (seg.type === 'ruby') {
        next.push(seg)
        continue
      }

      let remaining = seg.content
      let searchFrom = 0

      while (true) {
        const idx = remaining.indexOf(kanji, searchFrom)
        if (idx === -1) {
          next.push({ type: 'text', content: remaining })
          break
        }
        if (idx > 0) next.push({ type: 'text', content: remaining.slice(0, idx) })
        next.push({ type: 'ruby', kanji, reading })
        remaining = remaining.slice(idx + kanji.length)
        searchFrom = 0
      }
    }

    segments = next
  }

  return segments.filter(s => s.type === 'ruby' || s.content !== '')
}
