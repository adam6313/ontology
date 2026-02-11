import { useState, useEffect, useCallback } from 'react'

export interface EventMarker {
  id: string
  entityId: string
  date: string
  label: string
  createdAt: string
}

const STORAGE_KEY = 'event-markers'

function loadAll(): EventMarker[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function saveAll(markers: EventMarker[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(markers))
}

export function useEventMarkers(entityId: string | undefined) {
  const [allMarkers, setAllMarkers] = useState(loadAll)

  // Sync on storage event (cross-tab)
  useEffect(() => {
    const handler = () => setAllMarkers(loadAll())
    window.addEventListener('storage', handler)
    return () => window.removeEventListener('storage', handler)
  }, [])

  const markers = entityId
    ? allMarkers.filter(m => m.entityId === entityId)
    : []

  const addMarker = useCallback((date: string, label: string) => {
    if (!entityId) return
    const marker: EventMarker = {
      id: crypto.randomUUID(),
      entityId,
      date,
      label,
      createdAt: new Date().toISOString(),
    }
    const next = [...loadAll(), marker]
    saveAll(next)
    setAllMarkers(next)
  }, [entityId])

  const removeMarker = useCallback((id: string) => {
    const next = loadAll().filter(m => m.id !== id)
    saveAll(next)
    setAllMarkers(next)
  }, [])

  return { markers, addMarker, removeMarker }
}
