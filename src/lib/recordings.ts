// =============================================
// recordings.ts — ページごとの録音を IndexedDB に保存・読み込み
// key: `${storyId}:${pageIndex}`
// =============================================

const DB_NAME    = 'ohanashi-recordings'
const STORE_NAME = 'blobs'
const DB_VERSION = 1

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') { reject(new Error('no indexedDB')); return }
    const req = indexedDB.open(DB_NAME, DB_VERSION)
    req.onupgradeneeded = () => req.result.createObjectStore(STORE_NAME)
    req.onsuccess  = () => resolve(req.result)
    req.onerror    = () => reject(req.error)
  })
}

function key(storyId: string, pageIndex: number) {
  return `${storyId}:${pageIndex}`
}

/** ページの録音を保存（上書き） */
export async function savePageRecording(
  storyId: string,
  pageIndex: number,
  blob: Blob,
): Promise<void> {
  try {
    const db = await openDB()
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite')
      tx.objectStore(STORE_NAME).put(blob, key(storyId, pageIndex))
      tx.oncomplete = () => resolve()
      tx.onerror    = () => reject(tx.error)
    })
  } catch (e) {
    console.warn('[recordings] save failed:', e)
  }
}

/** 1ページ分の録音を取得（なければ null） */
export async function loadPageRecording(
  storyId: string,
  pageIndex: number,
): Promise<Blob | null> {
  try {
    const db = await openDB()
    return new Promise<Blob | null>((resolve, reject) => {
      const tx  = db.transaction(STORE_NAME, 'readonly')
      const req = tx.objectStore(STORE_NAME).get(key(storyId, pageIndex))
      req.onsuccess = () => resolve((req.result as Blob) ?? null)
      req.onerror   = () => reject(req.error)
    })
  } catch {
    return null
  }
}

/** ストーリー全ページ分の録音を順番に取得 */
export async function loadAllPageRecordings(
  storyId: string,
  totalPages: number,
): Promise<(Blob | null)[]> {
  const result: (Blob | null)[] = []
  for (let i = 0; i < totalPages; i++) {
    result.push(await loadPageRecording(storyId, i))
  }
  return result
}

/** 録音が1件以上保存されているストーリーIDのセットを返す */
export async function getStoriesWithRecordings(): Promise<Set<string>> {
  try {
    const db = await openDB()
    const keys = await new Promise<IDBValidKey[]>((resolve, reject) => {
      const tx  = db.transaction(STORE_NAME, 'readonly')
      const req = tx.objectStore(STORE_NAME).getAllKeys()
      req.onsuccess = () => resolve(req.result)
      req.onerror   = () => reject(req.error)
    })
    const ids = new Set<string>()
    for (const k of keys) {
      ids.add(String(k).split(':')[0])
    }
    return ids
  } catch {
    return new Set()
  }
}
