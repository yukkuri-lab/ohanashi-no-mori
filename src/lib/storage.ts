// =============================================
// storage.ts — localStorage へのデータ保存
// =============================================

const KEY = 'ohanashi-no-mori:records'

export interface AppRecord {
  openCount: number          // アプリを開いた回数
  totalAnswered: number      // 解いた問題数（累計）
  totalCorrect: number       // 正解した問題数（累計）
  completedStories: string[] // 最後まで終えたお話のIDリスト
}

function load(): AppRecord {
  if (typeof window === 'undefined') {
    return { openCount: 0, totalAnswered: 0, totalCorrect: 0, completedStories: [] }
  }
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return { openCount: 0, totalAnswered: 0, totalCorrect: 0, completedStories: [] }
    return JSON.parse(raw) as AppRecord
  } catch {
    return { openCount: 0, totalAnswered: 0, totalCorrect: 0, completedStories: [] }
  }
}

function save(record: AppRecord) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(KEY, JSON.stringify(record))
  } catch (err) {
    // localStorage 容量超過時はサイレント失敗（子どもアプリなのでデータ量が少ないため稀）
    console.warn('[storage] 保存に失敗しました:', err)
  }
}

/** アプリを開いたときに呼ぶ */
export function recordOpen() {
  const r = load()
  r.openCount += 1
  save(r)
}

/** 1問解いたときに呼ぶ */
export function recordAnswer(isCorrect: boolean) {
  const r = load()
  r.totalAnswered += 1
  if (isCorrect) r.totalCorrect += 1
  save(r)
}

/** お話を最後まで終えたときに呼ぶ */
export function recordCompletion(storyId: string) {
  const r = load()
  if (!r.completedStories.includes(storyId)) {
    r.completedStories.push(storyId)
  }
  save(r)
}

/** 保存データを取得する（デバッグ用など） */
export function getRecord(): AppRecord {
  return load()
}

/** 学習履歴をすべて削除する */
export function clearRecord(): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.removeItem(KEY)
  } catch (err) {
    console.warn('[storage] 削除に失敗しました:', err)
  }
}
