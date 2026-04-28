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

const FALLBACK: AppRecord = { openCount: 0, totalAnswered: 0, totalCorrect: 0, completedStories: [] }

// ⑦ パース後に型を検証して不完全なデータを安全に補完する
function validateRecord(data: unknown): AppRecord {
  if (typeof data !== 'object' || data === null) return { ...FALLBACK }
  const r = data as Record<string, unknown>
  return {
    openCount:        typeof r.openCount === 'number'        ? r.openCount        : 0,
    totalAnswered:    typeof r.totalAnswered === 'number'    ? r.totalAnswered    : 0,
    totalCorrect:     typeof r.totalCorrect === 'number'     ? r.totalCorrect     : 0,
    completedStories: Array.isArray(r.completedStories)
      ? r.completedStories.filter((s): s is string => typeof s === 'string')
      : [],
  }
}

function load(): AppRecord {
  if (typeof window === 'undefined') return { ...FALLBACK }
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return { ...FALLBACK }
    return validateRecord(JSON.parse(raw))
  } catch {
    return { ...FALLBACK }
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
