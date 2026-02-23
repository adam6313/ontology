import { useCallback, useSyncExternalStore } from 'react'

const STORAGE_KEY = 'watchlist-ids'
const EVENT_NAME = 'watchlist-change'

function getIds(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function setIds(ids: string[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(ids))
  window.dispatchEvent(new Event(EVENT_NAME))
}

// External store for cross-component sync
let snapshot = getIds()

function subscribe(cb: () => void) {
  const handler = () => { snapshot = getIds(); cb() }
  window.addEventListener(EVENT_NAME, handler)
  window.addEventListener('storage', handler)
  return () => {
    window.removeEventListener(EVENT_NAME, handler)
    window.removeEventListener('storage', handler)
  }
}

function getSnapshot() { return snapshot }

export function useWatchlist() {
  const ids = useSyncExternalStore(subscribe, getSnapshot)

  const toggle = useCallback((id: string) => {
    const current = getIds()
    const next = current.includes(id)
      ? current.filter(x => x !== id)
      : [...current, id]
    setIds(next)
  }, [])

  const has = useCallback((id: string) => ids.includes(id), [ids])

  return { ids, toggle, has, count: ids.length }
}
