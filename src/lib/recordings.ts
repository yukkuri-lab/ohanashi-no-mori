// =============================================
// recordings.ts — ページごとの録音を IndexedDB に保存・読み込み
// key: `${storyId}:${pageIndex}`
//
// 子どもの声が入るデータなので、消す手段（delete系）を必ず用意しておくこと。
// =============================================

const DB_NAME    = 'ohanashi-recordings'
const STORE_NAME = 'blobs'
const DB_VERSION = 1

// 接続は1本を使い回す。
// （呼ぶたびに開くと、開きっぱなしの接続が積み上がっていく）
let _dbPromise: Promise<IDBDatabase> | null = null

function openDB(): Promise<IDBDatabase> {
  if (_dbPromise) return _dbPromise
  _dbPromise = new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') { reject(new Error('no indexedDB')); return }
    const req = indexedDB.open(DB_NAME, DB_VERSION)
    req.onupgradeneeded = () => req.result.createObjectStore(STORE_NAME)
    req.onsuccess  = () => {
      const db = req.result
      // 接続が切れたら次回はつなぎ直せるようにしておく
      db.onclose = () => { _dbPromise = null }
      resolve(db)
    }
    req.onerror    = () => { _dbPromise = null; reject(req.error) }
  })
  return _dbPromise
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
    return await new Promise<Blob | null>((resolve, reject) => {
      const tx  = db.transaction(STORE_NAME, 'readonly')
      const req = tx.objectStore(STORE_NAME).get(key(storyId, pageIndex))
      req.onsuccess = () => resolve((req.result as Blob) ?? null)
      req.onerror   = () => reject(req.error)
    })
  } catch {
    return null
  }
}

/** ストーリー全ページ分の録音をまとめて取得（1つのトランザクションで済ませる） */
export async function loadAllPageRecordings(
  storyId: string,
  totalPages: number,
): Promise<(Blob | null)[]> {
  try {
    const db = await openDB()
    return await new Promise<(Blob | null)[]>((resolve, reject) => {
      const tx    = db.transaction(STORE_NAME, 'readonly')
      const store = tx.objectStore(STORE_NAME)
      const out: (Blob | null)[] = new Array(totalPages).fill(null)
      for (let i = 0; i < totalPages; i++) {
        const req = store.get(key(storyId, i))
        req.onsuccess = () => { out[i] = (req.result as Blob) ?? null }
      }
      tx.oncomplete = () => resolve(out)
      tx.onerror    = () => reject(tx.error)
    })
  } catch {
    return new Array(totalPages).fill(null)
  }
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

// ─── 消す ───────────────────────────────────────

/** 1つのおはなしの録音を、全ページぶん消す */
export async function deleteStoryRecordings(storyId: string): Promise<void> {
  try {
    const db = await openDB()
    const keys = await new Promise<IDBValidKey[]>((resolve, reject) => {
      const tx  = db.transaction(STORE_NAME, 'readonly')
      const req = tx.objectStore(STORE_NAME).getAllKeys()
      req.onsuccess = () => resolve(req.result)
      req.onerror   = () => reject(req.error)
    })
    const targets = keys.filter(k => String(k).split(':')[0] === storyId)
    if (targets.length === 0) return

    await new Promise<void>((resolve, reject) => {
      const tx    = db.transaction(STORE_NAME, 'readwrite')
      const store = tx.objectStore(STORE_NAME)
      targets.forEach(k => store.delete(k))
      tx.oncomplete = () => resolve()
      tx.onerror    = () => reject(tx.error)
    })
  } catch (e) {
    console.warn('[recordings] delete failed:', e)
  }
}

/** 保存されている録音を、すべて消す */
export async function deleteAllRecordings(): Promise<void> {
  try {
    const db = await openDB()
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite')
      tx.objectStore(STORE_NAME).clear()
      tx.oncomplete = () => resolve()
      tx.onerror    = () => reject(tx.error)
    })
  } catch (e) {
    console.warn('[recordings] clear failed:', e)
  }
}
