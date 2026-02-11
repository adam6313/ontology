import { useState, useEffect, useRef, useCallback } from 'react'
import type { ApiResponse, EntitySummary } from '../../types'
import { TYPE_BADGE } from '../../constants'

interface EntitySelectorProps {
  selected: EntitySummary | null
  onSelect: (entity: EntitySummary | null) => void
  label: string
  accentColor: string
  excludeId?: string
  loading?: boolean
}

export function EntitySelector({ selected, onSelect, label, accentColor, excludeId, loading: externalLoading }: EntitySelectorProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<EntitySummary[]>([])
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const timerRef = useRef<number | undefined>(undefined)
  const containerRef = useRef<HTMLDivElement>(null)

  const [searched, setSearched] = useState(false)

  const search = useCallback((q: string) => {
    if (q.length < 1) { setResults([]); setSearched(false); return }
    setLoading(true)
    fetch(`/api/entities?q=${encodeURIComponent(q)}&limit=8`)
      .then(r => r.json())
      .then((res: ApiResponse<EntitySummary[]>) => {
        const items = res.data ?? []
        setResults(excludeId ? items.filter(e => e.id !== excludeId) : items)
      })
      .catch(() => setResults([]))
      .finally(() => { setLoading(false); setSearched(true) })
  }, [excludeId])

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    if (query.length < 1) { setResults([]); return }
    timerRef.current = window.setTimeout(() => search(query), 300)
    return () => { if (timerRef.current) clearTimeout(timerRef.current) }
  }, [query, search])

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  if (selected) {
    return (
      <div className="flex items-center gap-2 px-4 py-3 rounded-xl border border-border-light bg-surface-light">
        <div className={`size-3 rounded-full`} style={{ backgroundColor: accentColor }} />
        <span className="text-sm font-semibold text-slate-900 truncate flex-1">{selected.canonical_name}</span>
        {externalLoading ? (
          <span className="material-symbols-outlined text-[16px] text-slate-400 animate-spin">progress_activity</span>
        ) : (
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${TYPE_BADGE[selected.type] ?? 'bg-gray-100 text-gray-600'}`}>
            {selected.type}
          </span>
        )}
        <button
          onClick={() => onSelect(null)}
          className="text-slate-400 hover:text-slate-600 transition-colors ml-1"
          title="Clear"
        >
          <span className="material-symbols-outlined text-[18px]">close</span>
        </button>
      </div>
    )
  }

  return (
    <div className="relative" ref={containerRef}>
      <div className="flex items-center gap-2 px-4 py-3 rounded-xl border border-border-light bg-surface-light focus-within:ring-2 focus-within:ring-primary/30">
        <div className={`size-3 rounded-full opacity-40`} style={{ backgroundColor: accentColor }} />
        <input
          type="text"
          value={query}
          onChange={e => { setQuery(e.target.value); setOpen(true) }}
          onFocus={() => { if (results.length > 0) setOpen(true) }}
          placeholder={`Search ${label}...`}
          className="flex-1 bg-transparent text-sm outline-none placeholder:text-slate-400"
        />
        {loading && (
          <span className="material-symbols-outlined text-[16px] text-slate-400 animate-spin">progress_activity</span>
        )}
      </div>

      {open && (results.length > 0 || (searched && !loading && query.length > 0)) && (
        <div className="absolute z-20 top-full mt-1 left-0 right-0 bg-white rounded-xl border border-border-light shadow-lg max-h-64 overflow-y-auto">
          {results.length > 0 ? results.map(e => (
            <button
              key={e.id}
              className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 transition-colors text-left"
              onClick={() => {
                onSelect(e)
                setQuery('')
                setResults([])
                setOpen(false)
                setSearched(false)
              }}
            >
              <span className="text-sm font-medium text-slate-900 truncate flex-1">{e.canonical_name}</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${TYPE_BADGE[e.type] ?? 'bg-gray-100 text-gray-600'}`}>
                {e.type}
              </span>
              <span className="text-xs text-slate-400 tabular-nums">{e.mention_count}</span>
            </button>
          )) : (
            <div className="px-4 py-3 text-sm text-slate-400 text-center">No results found</div>
          )}
        </div>
      )}
    </div>
  )
}
