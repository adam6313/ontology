import { useState, useEffect, useMemo } from 'react'
import { Sidebar } from '../components/Sidebar'
import { SearchSkeleton } from '../components/Skeleton'
import { MentionCard } from '../components/entity/MentionCard'
import type { ApiResponse, EntitySummary, EntityDetail } from '../types'
import { TYPE_BADGE } from '../constants'

const CARD = 'bg-surface-light rounded-2xl border border-border-light shadow-sm'
const CARD_HOVER = `${CARD} hover:-translate-y-0.5 hover:shadow-md transition-all`

const TYPE_LABELS: Record<string, string> = {
  brand: 'Brand', product: 'Product', place: 'Place', person: 'Person',
  work: 'Work', event: 'Event', organization: 'Organization',
}

const TYPE_BAR_COLORS: Record<string, string> = {
  brand: 'bg-blue-500', product: 'bg-purple-500', place: 'bg-emerald-500',
  person: 'bg-orange-500', work: 'bg-pink-500', event: 'bg-yellow-500', organization: 'bg-teal-500',
}

export function SemanticSearch() {
  const [allEntities, setAllEntities] = useState<EntitySummary[]>([])
  const [query, setQuery] = useState('')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [detail, setDetail] = useState<EntityDetail | null>(null)
  const [loading, setLoading] = useState(true)

  // Load all entities on mount
  useEffect(() => {
    fetch('/api/entities?limit=200&sort=mention_count&order=desc')
      .then(r => r.json())
      .then((res: ApiResponse<EntitySummary[]>) => setAllEntities(res.data ?? []))
      .finally(() => setLoading(false))
  }, [])

  // Fetch detail when entity selected
  useEffect(() => {
    if (!selectedId) { setDetail(null); return }
    fetch(`/api/entities/${selectedId}?include=aspects,mentions,links`)
      .then(r => r.json())
      .then((res: ApiResponse<EntityDetail>) => setDetail(res.data ?? null))
  }, [selectedId])

  // Client-side filtered results
  const results = useMemo(() => {
    if (!query.trim()) return allEntities.slice(0, 20)
    const q = query.trim().toLowerCase()
    return allEntities.filter(e =>
      e.canonical_name.toLowerCase().includes(q) ||
      e.type.includes(q) ||
      (e.sub_type ?? '').includes(q)
    )
  }, [allEntities, query])

  // Auto-select first result when results change
  useEffect(() => {
    if (results.length === 0) {
      if (selectedId) setSelectedId(null)
      return
    }
    if (!selectedId || !results.find(r => r.id === selectedId)) {
      setSelectedId(results[0].id)
    }
  }, [results, selectedId])

  // Type distribution of results
  const typeDistribution = useMemo(() => {
    const map = new Map<string, number>()
    for (const e of results) map.set(e.type, (map.get(e.type) ?? 0) + e.mention_count)
    const total = results.reduce((s, e) => s + e.mention_count, 0)
    return Array.from(map.entries())
      .map(([type, count]) => ({ type, count, pct: total > 0 ? Math.round((count / total) * 100) : 0 }))
      .sort((a, b) => b.count - a.count)
  }, [results])

  const totalMentions = useMemo(() => results.reduce((s, e) => s + e.mention_count, 0), [results])

  return (
    <div className="h-screen flex overflow-hidden">
      <Sidebar />
      <main className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Sticky header */}
        <div className="bg-surface-light border-b border-border-light px-8 py-6 shrink-0 z-10">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold tracking-tight text-slate-900">Semantic Search</h2>
                <p className="text-sm text-slate-500">Explore entities, mentions, and semantic relationships.</p>
              </div>
              {results.length > 0 && (
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <span className="tabular-nums font-medium text-slate-700">{results.length}</span> results
                  <span className="text-slate-300">·</span>
                  <span className="tabular-nums font-medium text-slate-700">{totalMentions.toLocaleString()}</span> mentions
                </div>
              )}
            </div>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-primary">search</span>
              <input
                type="text"
                placeholder="Search entities, topics, or keywords..."
                className="w-full h-12 pl-12 pr-4 rounded-xl bg-slate-50 border border-slate-200 focus:border-primary focus:ring-1 focus:ring-primary text-slate-900 placeholder:text-slate-400 text-sm transition-all"
                value={query}
                onChange={e => setQuery(e.target.value)}
                autoFocus
              />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8">
          <div className="max-w-6xl mx-auto">
            {loading ? (
              <SearchSkeleton />
            ) : results.length === 0 ? (
              <div className="text-center py-20">
                <span className="material-symbols-outlined text-5xl text-slate-300 mb-3">search_off</span>
                <p className="text-sm text-slate-500">No entities match &ldquo;{query}&rdquo;. Try a different search.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-8">
                {/* Left column */}
                <div className="flex flex-col gap-8 min-w-0">
                  {/* Semantic Distribution */}
                  {typeDistribution.length > 0 && (
                    <div className={`${CARD} p-6`}>
                      <div className="flex items-center justify-between mb-5">
                        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                          <span className="material-symbols-outlined text-primary text-[20px]">donut_small</span>
                          Semantic Distribution
                        </h3>
                        <div className="text-right">
                          <span className="text-2xl font-light text-slate-900 tabular-nums">{totalMentions.toLocaleString()}</span>
                          <span className="text-xs text-slate-400 ml-1">mentions</span>
                        </div>
                      </div>
                      <div className="flex flex-col gap-3">
                        {typeDistribution.map(item => (
                          <button
                            key={item.type}
                            onClick={() => setQuery(item.type)}
                            className="flex items-center gap-3 group"
                          >
                            <span className="text-xs font-medium text-slate-500 w-20 text-left truncate group-hover:text-primary transition-colors">
                              {TYPE_LABELS[item.type] ?? item.type}
                            </span>
                            <div className="flex-1 h-7 rounded-lg bg-slate-100 overflow-hidden relative">
                              <div
                                className={`h-full rounded-lg ${TYPE_BAR_COLORS[item.type] ?? 'bg-slate-400'} transition-all duration-500 group-hover:opacity-80`}
                                style={{ width: `${Math.max(item.pct, 3)}%` }}
                              />
                              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] font-semibold text-slate-600">
                                {item.count.toLocaleString()}
                              </span>
                            </div>
                            <span className="text-xs font-bold text-slate-700 tabular-nums w-10 text-right">{item.pct}%</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Matching entities */}
                  <div>
                    <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
                      <span className="material-symbols-outlined text-primary text-[20px]">hub</span>
                      Matching Entities
                    </h3>
                    <div className="flex flex-col gap-1.5">
                      {results.slice(0, 12).map(e => (
                        <button
                          key={e.id}
                          onClick={() => setSelectedId(e.id)}
                          className={`flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all ${
                            selectedId === e.id
                              ? 'bg-primary/10 border border-primary/20 shadow-sm'
                              : 'bg-surface-light border border-transparent hover:bg-slate-50 hover:-translate-y-px'
                          }`}
                        >
                          <span className="text-sm font-bold text-slate-900 truncate">{e.canonical_name}</span>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border shrink-0 ${TYPE_BADGE[e.type] ?? 'bg-gray-100 text-gray-600 border-gray-200'}`}>
                            {e.type}
                          </span>
                          <span className="ml-auto text-xs text-slate-500 tabular-nums shrink-0">{e.mention_count}</span>
                          <div className="w-10 h-1.5 rounded-full bg-slate-100 overflow-hidden shrink-0">
                            <div
                              className={`h-full rounded-full ${
                                e.avg_sentiment >= 0.7 ? 'bg-emerald-400' : e.avg_sentiment >= 0.4 ? 'bg-amber-400' : 'bg-red-400'
                              }`}
                              style={{ width: `${Math.round(e.avg_sentiment * 100)}%` }}
                            />
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Mentions from selected entity */}
                  {detail?.recent_mentions && detail.recent_mentions.length > 0 && (
                    <div>
                      <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary text-[20px]">forum</span>
                        Recent Mentions
                        <span className="text-sm font-normal text-slate-400">— {detail.canonical_name}</span>
                      </h3>
                      <div className="flex flex-col gap-3">
                        {detail.recent_mentions.map((m, i) => (
                          <MentionCard key={`${m.post_id}-${i}`} mention={m} />
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Right sidebar */}
                <div className="flex flex-col gap-6">
                  {/* Key terms (aspects) */}
                  {detail?.top_aspects && detail.top_aspects.length > 0 && (
                    <div className={`${CARD} p-5`}>
                      <h4 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary text-[18px]">tag</span>
                        Key Terms
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {detail.top_aspects.map(a => (
                          <span
                            key={a.aspect}
                            className="px-3 py-1.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700 hover:bg-primary/10 hover:text-primary cursor-pointer transition-colors"
                          >
                            {a.aspect}
                            <span className="ml-1 text-slate-400 tabular-nums">{a.total}</span>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Related entities */}
                  {detail?.links && detail.links.length > 0 && (
                    <div className={`${CARD} p-5`}>
                      <h4 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary text-[18px]">device_hub</span>
                        Related Entities
                      </h4>
                      <div className="flex flex-col gap-0.5">
                        {detail.links.map((link, i) => (
                          <a
                            key={i}
                            href={`#entities/${link.linked_id}`}
                            className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-50 transition-colors group"
                          >
                            <span className="material-symbols-outlined text-[14px] text-slate-400">
                              {link.direction === 'outgoing' ? 'arrow_forward' : 'arrow_back'}
                            </span>
                            <span className="text-sm font-medium text-slate-700 group-hover:text-primary truncate transition-colors">
                              {link.linked_name}
                            </span>
                            <span className={`ml-auto px-1.5 py-0.5 rounded text-[9px] font-medium border shrink-0 ${TYPE_BADGE[link.linked_type] ?? 'bg-gray-100 text-gray-600 border-gray-200'}`}>
                              {link.linked_type}
                            </span>
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Entity info card */}
                  {detail && (
                    <div className={`${CARD} p-5`}>
                      <h4 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary text-[18px]">info</span>
                        Entity Info
                      </h4>
                      <dl className="flex flex-col gap-2.5 text-sm">
                        <div className="flex justify-between">
                          <dt className="text-slate-500">Type</dt>
                          <dd className="font-medium text-slate-900">{detail.type}</dd>
                        </div>
                        {detail.sub_type && (
                          <div className="flex justify-between">
                            <dt className="text-slate-500">Sub-type</dt>
                            <dd className="font-medium text-slate-900">{detail.sub_type}</dd>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <dt className="text-slate-500">Aspects</dt>
                          <dd className="font-medium text-slate-900 tabular-nums">{detail.stats.aspect_count}</dd>
                        </div>
                        {detail.aliases && detail.aliases.length > 0 && (
                          <div className="flex justify-between gap-4">
                            <dt className="text-slate-500 shrink-0">Aliases</dt>
                            <dd className="font-medium text-slate-900 text-right truncate">{detail.aliases.join(', ')}</dd>
                          </div>
                        )}
                      </dl>
                    </div>
                  )}

                  {/* Explore graph CTA */}
                  <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-gradient-to-b from-slate-50 to-white p-6 text-center">
                    <span className="material-symbols-outlined text-3xl text-slate-300 mb-2">explore</span>
                    <p className="text-sm text-slate-500 mb-3">Explore the full knowledge graph</p>
                    <a
                      href="#graph"
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary-dark transition-colors"
                    >
                      <span className="material-symbols-outlined text-[16px]">hub</span>
                      Open Graph
                    </a>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
