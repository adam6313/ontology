import { useState, useEffect, useRef, useMemo } from 'react'
import { Sidebar } from '../components/Sidebar'
import { PulseSkeleton } from '../components/Skeleton'
import { Sparkline } from '../components/entity/Sparkline'
import { PeriodSelector } from '../components/PeriodSelector'
import { useWatchlist } from '../hooks/useWatchlist'
import { usePeriod } from '../hooks/usePeriod'
import type { ApiResponse, EntitySummary, DashboardResponse, InboxFact, EntityGridItem } from '../types'
import { TYPE_BADGE } from '../constants'
import { DEMO_ID } from '../demo-context'

// --- Shared UI constants ---

const CARD = 'bg-surface-light rounded-2xl border border-border-light shadow-sm'
const CARD_HOVER = `${CARD} hover:-translate-y-0.5 hover:shadow-md transition-all`

const TYPE_LABELS: Record<string, string> = {
  brand: 'Brand', product: 'Product', place: 'Place', person: 'Person',
  work: 'Work', event: 'Event', organization: 'Organization', content_topic: 'Topic',
  scenario: 'Scenario',
}

const SORT_OPTIONS = [
  { key: 'mention_count', label: 'Mentions' },
  { key: 'avg_sentiment', label: 'Sentiment' },
  { key: 'signal_count', label: 'Signals' },
  { key: 'name', label: 'Name' },
] as const

type SortKey = (typeof SORT_OPTIONS)[number]['key']

const TYPE_ORDER = ['brand', 'product', 'scenario', 'place', 'person', 'work', 'event', 'organization', 'content_topic']

const TWM_TREEMAP_NAMES: Record<string, string> = {
  brand: 'Telecom Brands',
  product: 'Plans & Services',
  scenario: 'Life Scenarios',
  person: 'KOLs & Creators',
  place: 'Stores & Counters',
  work: 'Content & Products',
  event: 'Events & Campaigns',
  organization: 'Organizations',
  content_topic: 'Topics & Trends',
}

const CARREFOUR_TREEMAP_NAMES: Record<string, string> = {
  brand: 'Retail Brands',
  product: 'Products & Sections',
  scenario: 'Life Scenarios',
  person: 'KOLs & Creators',
  place: 'Stores',
  work: 'Content & Products',
  event: 'Events & Campaigns',
  organization: 'Organizations',
  content_topic: 'Topics & Trends',
}

const TREEMAP_NAMES = DEMO_ID === 'carrefour' ? CARREFOUR_TREEMAP_NAMES : TWM_TREEMAP_NAMES

/** Only match explicit +/- change rates, not absolute proportions like "35%" */
function extractPct(title: string): string | null {
  const m = title.match(/[+-]\d+\.?\d*%/)
  return m ? m[0] : null
}

/** Remove the % fragment from a title to use as subtitle (badge already shows %) */
function trendSubtitle(title: string): string {
  return title.replace(/\s*[+-]?\d+\.?\d*%\s*/, ' ').replace(/\s+/g, ' ').trim()
}

export function Pulse() {
  // Data
  const [entities, setEntities] = useState<EntitySummary[]>([])
  const [dashboard, setDashboard] = useState<DashboardResponse | null>(null)
  const [signals, setSignals] = useState<InboxFact[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(true)

  // UI
  const [selectedType, setSelectedType] = useState('')
  const [sortKey, setSortKey] = useState<SortKey>('mention_count')
  const { period, setPeriod } = usePeriod()
  const [watchlistOnly, setWatchlistOnly] = useState(false)
  const watchlist = useWatchlist()

  // Search
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<EntitySummary[]>([])
  const [showDropdown, setShowDropdown] = useState(false)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const debounceRef = useRef<number | undefined>(undefined)
  const blurRef = useRef<number | undefined>(undefined)

  // ⌘K shortcut
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        searchInputRef.current?.focus()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  // Parallel fetch (re-runs when period changes)
  useEffect(() => {
    setLoading(true)
    const periodParam = period ? `&period=${period}` : ''
    Promise.all([
      fetch(`/api/entities?limit=200&sort=mention_count&order=desc${periodParam}`).then(r => r.json()),
      fetch(`/api/dashboard${period ? `?period=${period}` : ''}`).then(r => r.json()),
      fetch('/api/inbox?limit=50&sort=severity&order=desc').then(r => r.json()),
      fetch('/api/inbox/count').then(r => r.json()),
    ])
      .then(([entRes, dashData, inboxRes, countRes]: [ApiResponse<EntitySummary[]>, DashboardResponse, ApiResponse<InboxFact[]>, { count: number }]) => {
        setEntities(entRes.data ?? [])
        setDashboard(dashData)
        setSignals(inboxRes.data ?? [])
        setUnreadCount(countRes.count ?? 0)
      })
      .finally(() => setLoading(false))
  }, [period])

  // Search debounce
  useEffect(() => {
    if (!searchQuery.trim()) { setSearchResults([]); setShowDropdown(false); return }
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = window.setTimeout(() => {
      fetch(`/api/entities?q=${encodeURIComponent(searchQuery.trim())}&limit=8`)
        .then(r => r.json())
        .then((res: ApiResponse<EntitySummary[]>) => { setSearchResults(res.data ?? []); setShowDropdown(true) })
    }, 200)
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current) }
  }, [searchQuery])

  // --- Computed ---

  const signalsByEntity = useMemo(() => {
    const map = new Map<string, InboxFact[]>()
    for (const s of signals) {
      const arr = map.get(s.object_id) ?? []
      arr.push(s)
      map.set(s.object_id, arr)
    }
    return map
  }, [signals])

  const entityGridItems = useMemo<EntityGridItem[]>(() => {
    return entities.map(e => {
      const sigs = signalsByEntity.get(e.id) ?? []
      const critical = sigs.find(s => s.severity === 'critical')
      const warning = sigs.find(s => s.severity === 'warning')
      return { ...e, signals: sigs, signalCount: sigs.length, topSignal: critical ?? warning ?? sigs[0] ?? null }
    })
  }, [entities, signalsByEntity])

  const typeCounts = useMemo(() => {
    const map = new Map<string, number>()
    for (const e of entityGridItems) map.set(e.type, (map.get(e.type) ?? 0) + 1)
    return map
  }, [entityGridItems])

  const filteredEntities = useMemo(() => {
    let items = entityGridItems
    if (watchlistOnly) items = items.filter(e => watchlist.has(e.id))
    if (selectedType) items = items.filter(e => e.type === selectedType)
    return items.slice().sort((a, b) => {
      switch (sortKey) {
        case 'mention_count': return b.mention_count - a.mention_count
        case 'avg_sentiment': return a.avg_sentiment - b.avg_sentiment
        case 'signal_count': return b.signalCount - a.signalCount
        case 'name': return a.canonical_name.localeCompare(b.canonical_name, 'zh-TW')
      }
    })
  }, [entityGridItems, selectedType, sortKey, watchlistOnly, watchlist])

  const totalMentions = useMemo(() => entities.reduce((s, e) => s + e.mention_count, 0), [entities])

  // Aggregate sparklines for metric cards
  const aggregateSparkline = useMemo(() => {
    const allSp = entities.filter(e => e.sparkline && e.sparkline.length >= 2).map(e => e.sparkline!)
    if (allSp.length === 0) return []
    const maxLen = Math.max(...allSp.map(s => s.length))
    const agg: number[] = new Array(maxLen).fill(0)
    for (const sp of allSp) {
      const offset = maxLen - sp.length
      for (let i = 0; i < sp.length; i++) agg[offset + i] += sp[i]
    }
    return agg
  }, [entities])

  const sentimentSparkline = useMemo(() => {
    const allSp = entities.filter(e => e.sparkline && e.sparkline.length >= 2)
    if (allSp.length === 0) return []
    // Use average sentiment across entities per week as proxy (just show mention trend shape)
    return aggregateSparkline
  }, [entities, aggregateSparkline])

  const bannerSignals = useMemo(() => {
    const critical = signals.filter(s => s.severity === 'critical')
    const warning = signals.filter(s => s.severity === 'warning')
    const topSignal = critical[0] ?? warning[0]
    const alertCount = critical.length + warning.length
    return { topSignal, alertCount, hasCritical: critical.length > 0, show: alertCount > 0 }
  }, [signals])

  const trendSignals = useMemo(() =>
    signals.filter(s => s.fact_type === 'trend').slice(0, 4),
  [signals])

  // What Changed: Top Movers, Sentiment Drops, New Entities
  const topMovers = useMemo(() => {
    return entities
      .filter(e => e.mention_delta != null && e.mention_delta !== 0)
      .sort((a, b) => Math.abs(b.mention_delta ?? 0) - Math.abs(a.mention_delta ?? 0))
      .slice(0, 3)
  }, [entities])

  const sentimentDrops = useMemo(() => {
    return entities
      .filter(e => e.mention_count >= 3)
      .sort((a, b) => a.avg_sentiment - b.avg_sentiment)
      .slice(0, 3)
  }, [entities])

  const recentEntities = useMemo(() => {
    return entities
      .filter(e => e.mention_count > 0)
      .sort((a, b) => a.mention_count - b.mention_count)
      .slice(0, 3)
  }, [entities])

  // Topic trend radar: use mention_delta + sparkline from entity data
  const topicRadarItems = useMemo(() => {
    const topicEntities = entities.filter(e => e.type === 'content_topic')
    const topicSignals = signals.filter(s => s.entity_type === 'content_topic')
    const signalMap = new Map<string, InboxFact>()
    for (const s of topicSignals) signalMap.set(s.object_id, s)

    return topicEntities
      .map(t => {
        const sig = signalMap.get(t.id)
        // Compute % change from sparkline or mention_delta
        let pct: string | null = sig ? extractPct(sig.title) : null
        if (!pct && t.sparkline && t.sparkline.length >= 2) {
          const prev = t.sparkline[t.sparkline.length - 2]
          const curr = t.sparkline[t.sparkline.length - 1]
          if (prev > 0) {
            const delta = Math.round(((curr - prev) / prev) * 100)
            if (delta !== 0) pct = `${delta > 0 ? '+' : ''}${delta}%`
          } else if (curr > 0) {
            pct = '+∞%'
          }
        }
        const hasTrend = !!sig || (t.mention_delta != null && t.mention_delta !== 0)
        return { ...t, signal: sig, pct, isNew: !pct && t.mention_count <= 10, hasTrend }
      })
      .sort((a, b) => {
        if (a.hasTrend && !b.hasTrend) return -1
        if (!a.hasTrend && b.hasTrend) return 1
        return b.mention_count - a.mention_count
      })
      .slice(0, 6)
  }, [entities, signals])

  const insights = useMemo(() => signals.filter(s => s.fact_type === 'insight'), [signals])

  const treemapData = useMemo(() => {
    const typeMap = new Map<string, { mentions: number; topNames: string[] }>()
    for (const e of entities) {
      const entry = typeMap.get(e.type) ?? { mentions: 0, topNames: [] }
      entry.mentions += e.mention_count
      if (entry.topNames.length < 3) entry.topNames.push(e.canonical_name)
      typeMap.set(e.type, entry)
    }
    const totalM = entities.reduce((s, e) => s + e.mention_count, 0)
    return Array.from(typeMap.entries())
      .map(([type, { mentions, topNames }]) => ({
        type,
        label: TYPE_LABELS[type] ?? type,
        name: TREEMAP_NAMES[type] ?? type,
        desc: `Led by ${topNames.slice(0, 2).join(', ')}`,
        pct: totalM > 0 ? Math.round((mentions / totalM) * 100) : 0,
      }))
      .sort((a, b) => b.pct - a.pct)
      .slice(0, 5)
  }, [entities])

  return (
    <div className="h-screen flex overflow-hidden">
      <Sidebar />
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* Sticky Header */}
        <div className="w-full bg-surface-light border-b border-border-light px-8 py-6 z-10 shrink-0">
          <div className="max-w-5xl mx-auto w-full flex flex-col gap-6">
            <div className="flex items-end justify-between gap-4">
              <div>
                <h2 className="text-3xl font-bold tracking-tight text-slate-900 mb-1">Market Pulse</h2>
                <p className="text-slate-500">Real-time analysis of brand trends and consumer sentiment.</p>
              </div>
              <PeriodSelector value={period} onChange={setPeriod} />
            </div>
            {/* AI Search Bar */}
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-primary">
                <span className="material-symbols-outlined">auto_awesome</span>
              </div>
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Ask about trends..."
                className="w-full h-14 pl-12 pr-20 rounded-xl bg-slate-50 border border-slate-200 focus:border-primary focus:ring-1 focus:ring-primary text-slate-900 placeholder:text-slate-400 transition-all shadow-sm group-hover:shadow-md text-sm"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                onFocus={() => { if (searchResults.length > 0) setShowDropdown(true) }}
                onBlur={() => { blurRef.current = window.setTimeout(() => setShowDropdown(false), 200) }}
              />
              <div className="absolute inset-y-0 right-2 flex items-center gap-2">
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="p-1 text-slate-400 hover:text-primary transition-colors"
                  >
                    <span className="material-symbols-outlined text-xl">close</span>
                  </button>
                )}
                <kbd className="bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs font-medium text-slate-500 shadow-sm">
                  ⌘ K
                </kbd>
              </div>
              {/* Search dropdown */}
              {showDropdown && searchResults.length > 0 && (
                <div className={`absolute z-20 top-full mt-2 left-0 right-0 ${CARD} overflow-hidden`}>
                  {searchResults.map(e => (
                    <a
                      key={e.id}
                      href={`#entities/${e.id}`}
                      className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition-colors"
                      onMouseDown={() => { if (blurRef.current) clearTimeout(blurRef.current) }}
                    >
                      <span className="text-sm font-bold text-slate-900">{e.canonical_name}</span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${TYPE_BADGE[e.type] ?? 'bg-gray-100 text-gray-600 border-gray-200'}`}>
                        {e.type}
                      </span>
                      <span className="ml-auto text-xs text-slate-500">{e.mention_count} mentions</span>
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-8">
          <div className="max-w-5xl mx-auto w-full flex flex-col gap-8 pb-10">
            {loading ? (
              <PulseSkeleton />
            ) : (
              <div className="flex flex-col gap-8 animate-[fadeSlideIn_200ms_ease-out]">

                {/* Signal Banner (conditional — only critical/warning) */}
                {bannerSignals.show && (
                  <div className={`rounded-2xl border px-6 py-4 flex items-center gap-4 ${
                    bannerSignals.hasCritical ? 'bg-red-50 border-red-100' : 'bg-amber-50 border-amber-100'
                  }`}>
                    <div className={`size-10 rounded-xl flex items-center justify-center shrink-0 ${
                      bannerSignals.hasCritical ? 'bg-red-100' : 'bg-amber-100'
                    }`}>
                      <span className={`material-symbols-outlined text-[20px] ${
                        bannerSignals.hasCritical ? 'text-red-600' : 'text-amber-600'
                      }`}>warning</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-bold ${
                        bannerSignals.hasCritical ? 'text-red-800' : 'text-amber-800'
                      }`}>
                        {bannerSignals.alertCount} signal{bannerSignals.alertCount > 1 ? 's' : ''} need attention
                      </p>
                      {bannerSignals.topSignal && (
                        <a
                          href={`#entities/${bannerSignals.topSignal.object_id}`}
                          className={`text-sm hover:underline truncate block ${
                            bannerSignals.hasCritical ? 'text-red-700' : 'text-amber-700'
                          }`}
                        >
                          {bannerSignals.topSignal.entity_name}: {bannerSignals.topSignal.title}
                        </a>
                      )}
                    </div>
                    <a
                      href="#inbox"
                      className={`text-sm font-semibold whitespace-nowrap shrink-0 ${
                        bannerSignals.hasCritical ? 'text-red-700 hover:text-red-900' : 'text-amber-700 hover:text-amber-900'
                      }`}
                    >
                      View all →
                    </a>
                  </div>
                )}

                {/* What Changed — 3-col summary */}
                {(topMovers.length > 0 || sentimentDrops.length > 0 || recentEntities.length > 0) && (
                  <section>
                    <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-4">
                      <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                      Key Changes
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* Top Movers */}
                      <div className={`${CARD} p-5`}>
                        <h4 className="text-sm font-semibold text-slate-500 mb-3 flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-[16px] text-emerald-500">moving</span>
                          Top Movers
                        </h4>
                        <div className="flex flex-col gap-3">
                          {topMovers.map(e => (
                            <a key={e.id} href={`#entities/${e.id}`} className="flex items-center gap-3 group">
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold text-slate-900 truncate group-hover:text-primary transition-colors">{e.canonical_name}</p>
                                <p className="text-xs text-slate-400">{e.mention_count} mentions</p>
                              </div>
                              <div className="shrink-0 flex items-center gap-1">
                                {e.sparkline && e.sparkline.length >= 2 && (
                                  <Sparkline data={e.sparkline} width={48} height={20} color={(e.mention_delta ?? 0) >= 0 ? '#10b981' : '#ef4444'} />
                                )}
                                {(() => {
                                  const d = deltaStyle(e.mention_delta, e.sparkline)
                                  return <span className={`text-xs font-bold ${d.color}`}>{d.label}</span>
                                })()}
                              </div>
                            </a>
                          ))}
                          {topMovers.length === 0 && <p className="text-xs text-slate-400">No significant changes</p>}
                        </div>
                      </div>
                      {/* Sentiment Drops */}
                      <div className={`${CARD} p-5`}>
                        <h4 className="text-sm font-semibold text-slate-500 mb-3 flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-[16px] text-red-500">sentiment_dissatisfied</span>
                          Lowest Sentiment
                        </h4>
                        <div className="flex flex-col gap-3">
                          {sentimentDrops.map(e => (
                            <a key={e.id} href={`#entities/${e.id}`} className="flex items-center gap-3 group">
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold text-slate-900 truncate group-hover:text-primary transition-colors">{e.canonical_name}</p>
                                <p className="text-xs text-slate-400">{e.type}</p>
                              </div>
                              <span className={`text-sm font-bold ${e.avg_sentiment >= 0.4 ? 'text-amber-600' : 'text-red-600'}`}>
                                {(e.avg_sentiment * 10).toFixed(1)}
                              </span>
                            </a>
                          ))}
                          {sentimentDrops.length === 0 && <p className="text-xs text-slate-400">No data</p>}
                        </div>
                      </div>
                      {/* New Entities */}
                      <div className={`${CARD} p-5`}>
                        <h4 className="text-sm font-semibold text-slate-500 mb-3 flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-[16px] text-teal-500">fiber_new</span>
                          Emerging
                        </h4>
                        <div className="flex flex-col gap-3">
                          {recentEntities.map(e => (
                            <a key={e.id} href={`#entities/${e.id}`} className="flex items-center gap-3 group">
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold text-slate-900 truncate group-hover:text-primary transition-colors">{e.canonical_name}</p>
                                <p className="text-xs text-slate-400">{e.mention_count} mentions</p>
                              </div>
                              <span className={`px-2 py-0.5 rounded-lg text-[10px] font-semibold border ${TYPE_BADGE[e.type] ?? 'bg-gray-100 text-gray-600 border-gray-200'}`}>
                                {e.type}
                              </span>
                            </a>
                          ))}
                          {recentEntities.length === 0 && <p className="text-xs text-slate-400">No new entities</p>}
                        </div>
                      </div>
                    </div>
                  </section>
                )}

                {/* Trend Detection */}
                {trendSignals.length > 0 && (
                  <section>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary">trending_up</span>
                        Trend Detection
                      </h3>
                      <a href="#inbox" className="text-sm text-primary font-medium hover:text-primary-dark transition-colors">
                        View detailed report
                      </a>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      {trendSignals.map((sig, i) => {
                        const pct = extractPct(sig.title)
                        const isNeg = pct?.startsWith('-')
                        return (
                          <a
                            key={sig.id}
                            href={`#entities/${sig.object_id}`}
                            className={`${CARD_HOVER} p-5 group cursor-pointer`}
                            style={{ animation: `cardIn 400ms ease-out ${i * 80}ms both` }}
                          >
                            <div className="flex justify-between items-start mb-2">
                              <span className="text-sm font-medium text-slate-500">
                                {TYPE_LABELS[sig.entity_type] ?? sig.entity_type}
                              </span>
                              {pct ? (
                                <span className={`text-xs font-bold px-2 py-1 rounded-full flex items-center gap-0.5 ${
                                  isNeg ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'
                                }`}>
                                  <span className="material-symbols-outlined text-[16px]">
                                    {isNeg ? 'trending_down' : 'trending_up'}
                                  </span>
                                  {pct.replace(/^[+-]/, '')}
                                </span>
                              ) : (
                                <span className="bg-teal-100 text-teal-700 text-xs font-bold px-2 py-1 rounded-full">
                                  New
                                </span>
                              )}
                            </div>
                            <h4 className="text-xl font-bold text-slate-900 mb-1 group-hover:text-primary transition-colors truncate">
                              {sig.entity_name}
                            </h4>
                            <p className="text-xs text-slate-500 truncate">
                              {trendSubtitle(sig.title)}
                            </p>
                          </a>
                        )
                      })}
                    </div>
                  </section>
                )}

                {/* Topic Trend Radar */}
                {topicRadarItems.length > 0 && (
                  <section>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                        <span className="material-symbols-outlined text-indigo-500">radar</span>
                        Trend Radar
                      </h3>
                      <button
                        onClick={() => setSelectedType(selectedType === 'content_topic' ? '' : 'content_topic')}
                        className="text-sm text-primary font-medium hover:text-primary-dark transition-colors"
                      >
                        View all topics →
                      </button>
                    </div>
                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                      {topicRadarItems.map((item, i) => {
                        const isNeg = item.pct?.startsWith('-')
                        return (
                          <a
                            key={item.id}
                            href={`#entities/${item.id}`}
                            className={`${CARD_HOVER} p-5 group cursor-pointer`}
                            style={{ animation: `cardIn 400ms ease-out ${i * 80}ms both` }}
                          >
                            <div className="flex justify-between items-start mb-2">
                              <div className="flex items-center gap-1.5">
                                {item.hasTrend && (
                                  <span className="text-base" title="Trending">🔥</span>
                                )}
                                <h4 className="text-base font-bold text-slate-900 group-hover:text-primary transition-colors truncate">
                                  {item.canonical_name}
                                </h4>
                              </div>
                              {item.pct ? (
                                <span className={`text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-0.5 shrink-0 ${
                                  isNeg ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'
                                }`}>
                                  <span className="material-symbols-outlined text-[14px]">
                                    {isNeg ? 'trending_down' : 'trending_up'}
                                  </span>
                                  {item.pct.replace(/^[+-]/, '')}
                                </span>
                              ) : item.isNew ? (
                                <span className="bg-teal-100 text-teal-700 text-xs font-bold px-2 py-0.5 rounded-full">
                                  NEW
                                </span>
                              ) : null}
                            </div>
                            <p className="text-xs text-slate-500 mb-2">
                              {item.mention_count} mentions
                            </p>
                          </a>
                        )
                      })}
                    </div>
                  </section>
                )}

                {/* Topic Discovery Treemap */}
                {treemapData.length >= 3 && (
                  <section className="flex flex-col gap-4">
                    <div className="flex justify-between items-end">
                      <div>
                        <h3 className="text-lg font-bold text-slate-900">Share of Voice</h3>
                        <p className="text-sm text-slate-500">Mention distribution by entity category.</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-4 grid-rows-4 gap-4 h-[400px]">
                      {/* Block 1: Largest */}
                      {treemapData[0] && (
                        <div className="col-span-2 row-span-4 bg-primary rounded-2xl p-6 relative overflow-hidden group hover:scale-[1.01] transition-transform duration-300 shadow-sm cursor-pointer">
                          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-black/5 pointer-events-none" />
                          <div className="relative z-10 flex flex-col h-full justify-between text-white">
                            <div className="flex justify-between items-start">
                              <span className="font-semibold tracking-wide uppercase text-sm opacity-80">{treemapData[0].label}</span>
                              <span className="material-symbols-outlined opacity-0 group-hover:opacity-100 transition-opacity">open_in_new</span>
                            </div>
                            <div>
                              <h4 className="text-4xl font-light mb-1">{treemapData[0].pct}%</h4>
                              <p className="text-xl font-bold">{treemapData[0].name}</p>
                              <p className="text-sm text-white/80 mt-2 line-clamp-2">{treemapData[0].desc}</p>
                            </div>
                          </div>
                        </div>
                      )}
                      {treemapData[1] && (
                        <div className="col-span-2 row-span-2 bg-[#2dccc5] rounded-2xl p-5 relative overflow-hidden group hover:scale-[1.01] transition-transform duration-300 shadow-sm cursor-pointer text-white">
                          <div className="relative z-10 flex flex-col h-full justify-between">
                            <span className="font-semibold tracking-wide uppercase text-xs opacity-80">{treemapData[1].label}</span>
                            <div>
                              <h4 className="text-3xl font-light mb-1">{treemapData[1].pct}%</h4>
                              <p className="text-lg font-bold">{treemapData[1].name}</p>
                              <p className="text-xs text-white/90 mt-1 line-clamp-2">{treemapData[1].desc}</p>
                            </div>
                          </div>
                        </div>
                      )}
                      {treemapData[2] && (
                        <div className="row-span-2 bg-slate-200 rounded-2xl p-5 relative overflow-hidden group hover:scale-[1.01] transition-transform duration-300 shadow-sm cursor-pointer text-slate-800">
                          <div className="relative z-10 flex flex-col h-full justify-between">
                            <span className="font-semibold tracking-wide uppercase text-xs opacity-60">{treemapData[2].label}</span>
                            <div>
                              <h4 className="text-2xl font-light mb-1">{treemapData[2].pct}%</h4>
                              <p className="text-base font-bold">{treemapData[2].name}</p>
                            </div>
                          </div>
                        </div>
                      )}
                      {treemapData[3] && (
                        <div className="bg-slate-100 rounded-2xl p-4 relative overflow-hidden group hover:scale-[1.01] transition-transform duration-300 shadow-sm cursor-pointer border border-slate-200">
                          <div className="relative z-10 flex flex-col h-full justify-between">
                            <h4 className="text-xl font-light text-slate-400">{treemapData[3].pct}%</h4>
                            <p className="text-sm font-bold text-slate-700">{treemapData[3].name}</p>
                          </div>
                        </div>
                      )}
                      {treemapData[4] && (
                        <div className="bg-slate-100 rounded-2xl p-4 relative overflow-hidden group hover:scale-[1.01] transition-transform duration-300 shadow-sm cursor-pointer border border-slate-200">
                          <div className="relative z-10 flex flex-col h-full justify-between">
                            <h4 className="text-xl font-light text-slate-400">{treemapData[4].pct}%</h4>
                            <p className="text-sm font-bold text-slate-700">{treemapData[4].name}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </section>
                )}

                {/* Metrics Row (3 cards with sparklines) */}
                <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className={`${CARD_HOVER} p-6 flex items-center gap-4`}>
                    <div className="bg-blue-50 p-3 rounded-full text-blue-600 shrink-0">
                      <span className="material-symbols-outlined">visibility</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Mentions</p>
                      <p className="text-2xl font-light text-slate-900 tabular-nums">
                        {totalMentions > 1000 ? `${(totalMentions / 1000).toFixed(1)}k` : totalMentions}
                      </p>
                    </div>
                    {aggregateSparkline.length >= 2 && (
                      <Sparkline data={aggregateSparkline} width={64} height={28} color="#3b82f6" />
                    )}
                  </div>
                  <div className={`${CARD_HOVER} p-6 flex items-center gap-4`}>
                    <div className="bg-purple-50 p-3 rounded-full text-purple-600 shrink-0">
                      <span className="material-symbols-outlined">sentiment_satisfied</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Sentiment Score</p>
                      <p className="text-2xl font-light text-slate-900 tabular-nums">
                        {dashboard?.stats.avg_sentiment != null
                          ? (dashboard.stats.avg_sentiment * 10).toFixed(1)
                          : '\u2014'}
                        <span className="text-sm font-normal text-slate-400">/10</span>
                      </p>
                    </div>
                    {sentimentSparkline.length >= 2 && (
                      <Sparkline data={sentimentSparkline} width={64} height={28} color="#8b5cf6" />
                    )}
                  </div>
                  <a href="#inbox" className={`${CARD_HOVER} p-6 flex items-center gap-4 cursor-pointer`}>
                    <div className="bg-orange-50 p-3 rounded-full text-orange-600 shrink-0">
                      <span className="material-symbols-outlined">electric_bolt</span>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active Signals</p>
                      <p className={`text-2xl font-light tabular-nums ${unreadCount > 0 ? 'text-red-600' : 'text-slate-900'}`}>
                        {unreadCount}
                      </p>
                    </div>
                  </a>
                </section>

                {/* Entity Health Grid */}
                <section>
                  <div className="flex items-center justify-between mb-5">
                    <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2.5">
                      <span className="material-symbols-outlined text-primary text-[22px]">monitoring</span>
                      Entity Monitor
                      <span className="text-sm font-normal text-slate-400 ml-1">
                        {filteredEntities.length}/{entityGridItems.length}
                      </span>
                    </h3>
                    <div className="relative">
                      <select
                        value={sortKey}
                        onChange={e => setSortKey(e.target.value as SortKey)}
                        className="text-sm font-medium text-slate-600 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 pr-8 appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/20"
                      >
                        {SORT_OPTIONS.map(o => (
                          <option key={o.key} value={o.key}>Sort: {o.label}</option>
                        ))}
                      </select>
                      <span className="material-symbols-outlined text-[14px] text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none">
                        unfold_more
                      </span>
                    </div>
                  </div>

                  {/* Type filter chips */}
                  <div className="flex flex-wrap gap-2 mb-5">
                    {watchlist.count > 0 && (
                      <button
                        onClick={() => { setWatchlistOnly(!watchlistOnly); if (!watchlistOnly) setSelectedType('') }}
                        className={`px-3.5 py-1.5 rounded-full text-sm font-medium transition-colors flex items-center gap-1.5 ${
                          watchlistOnly
                            ? 'bg-amber-500 text-white'
                            : 'bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200'
                        }`}
                      >
                        <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                        Watchlist ({watchlist.count})
                      </button>
                    )}
                    <button
                      onClick={() => { setSelectedType(''); setWatchlistOnly(false) }}
                      className={`px-3.5 py-1.5 rounded-full text-sm font-medium transition-colors ${
                        selectedType === '' && !watchlistOnly
                          ? 'bg-primary text-white'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      All ({entityGridItems.length})
                    </button>
                    {TYPE_ORDER.filter(t => typeCounts.has(t)).map(t => (
                      <button
                        key={t}
                        onClick={() => setSelectedType(selectedType === t ? '' : t)}
                        className={`px-3.5 py-1.5 rounded-full text-sm font-medium transition-colors ${
                          selectedType === t
                            ? 'bg-primary text-white'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {TYPE_LABELS[t] ?? t} ({typeCounts.get(t) ?? 0})
                      </button>
                    ))}
                  </div>

                  {/* Entity cards grid */}
                  {filteredEntities.length === 0 ? (
                    <div className={`${CARD} p-12 text-center`}>
                      {entities.length === 0 ? (
                        <>
                          <span className="material-symbols-outlined text-5xl text-slate-300 mb-3">search_off</span>
                          <p className="text-sm text-slate-500">Nothing tracked yet. Items will appear after posts are processed.</p>
                        </>
                      ) : (
                        <>
                          <span className="material-symbols-outlined text-5xl text-slate-300 mb-3">filter_list_off</span>
                          <p className="text-sm text-slate-500 mb-3">No entities match this filter.</p>
                          <button
                            onClick={() => setSelectedType('')}
                            className="text-sm font-medium text-primary hover:text-primary-dark"
                          >
                            Clear filter
                          </button>
                        </>
                      )}
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {filteredEntities.map((item, i) => (
                        <div
                          key={item.id}
                          style={i < 12 ? { animation: `cardIn 400ms ease-out ${i * 60}ms both` } : undefined}
                        >
                          <EntityCard item={item} starred={watchlist.has(item.id)} onToggleStar={() => watchlist.toggle(item.id)} />
                        </div>
                      ))}
                    </div>
                  )}
                </section>

                {/* Recent Insights (conditional — only if insight-type facts exist) */}
                {insights.length > 0 && (
                  <section>
                    <div className="flex items-center justify-between mb-5">
                      <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2.5">
                        <span className="material-symbols-outlined text-purple-500 text-[22px]">auto_awesome</span>
                        Recent Insights
                      </h3>
                      <a href="#inbox" className="text-sm font-medium text-primary hover:text-primary-dark transition-colors">
                        View all →
                      </a>
                    </div>
                    <div className="flex flex-col gap-4">
                      {insights.slice(0, 3).map(ins => (
                        <a
                          key={ins.id}
                          href={`#entities/${ins.object_id}`}
                          className="rounded-2xl border border-purple-100 bg-gradient-to-r from-purple-50/60 to-white px-6 py-5 shadow-sm hover:-translate-y-0.5 hover:shadow-md transition-all group"
                        >
                          <div className="flex items-center gap-2 mb-2">
                            <span className="material-symbols-outlined text-[16px] text-purple-500">auto_awesome</span>
                            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-purple-100 text-purple-700">
                              {ins.entity_name}
                            </span>
                          </div>
                          <h4 className="text-sm font-bold text-slate-900 group-hover:text-primary transition-colors mb-1">
                            {ins.title}
                          </h4>
                          <p className="text-sm text-slate-600 line-clamp-2 leading-relaxed">{ins.description}</p>
                        </a>
                      ))}
                    </div>
                  </section>
                )}

              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

// --- Entity Card sub-component ---

function deriveStatus(item: EntityGridItem): { label: string; style: string; icon: string } {
  if (item.signals.some(s => s.severity === 'critical'))
    return { label: 'Critical Issue', style: 'text-red-700 bg-red-50', icon: 'error' }
  if (item.signals.some(s => s.severity === 'warning'))
    return { label: 'Needs Attention', style: 'text-amber-700 bg-amber-50', icon: 'warning' }
  const hasTrend = item.signals.some(s => s.fact_type === 'trend')
  if (hasTrend && item.avg_sentiment >= 0.6)
    return { label: 'Rising Trend', style: 'text-emerald-700 bg-emerald-50', icon: 'trending_up' }
  if (item.mention_count <= 5)
    return { label: 'Emerging', style: 'text-teal-700 bg-teal-50', icon: 'fiber_new' }
  return { label: 'Stable', style: 'text-slate-600 bg-slate-100', icon: 'check_circle' }
}

function deltaStyle(delta: number | null | undefined, sparkline?: number[]): { icon: string; color: string; label: string } {
  if (delta == null || delta === 0) return { icon: 'trending_flat', color: 'text-slate-400', label: '—' }
  if (sparkline && sparkline.length >= 2) {
    const prev = sparkline[sparkline.length - 2]
    const pct = prev > 0 ? Math.round(((sparkline[sparkline.length - 1] - prev) / prev) * 100) : 0
    if (pct !== 0) {
      const sign = pct > 0 ? '+' : ''
      return {
        icon: pct > 0 ? 'trending_up' : 'trending_down',
        color: pct > 0 ? 'text-emerald-600' : 'text-red-600',
        label: `${sign}${pct}%`,
      }
    }
  }
  if (delta > 0) return { icon: 'trending_up', color: 'text-emerald-600', label: `+${delta}` }
  return { icon: 'trending_down', color: 'text-red-600', label: `${delta}` }
}

function EntityCard({ item, starred, onToggleStar }: { item: EntityGridItem; starred: boolean; onToggleStar: () => void }) {
  const sentPct = Math.round(item.avg_sentiment * 100)
  const pct = item.topSignal ? extractPct(item.topSignal.title) : null
  const isNeg = pct?.startsWith('-')
  const status = deriveStatus(item)
  const sentLabel = item.avg_sentiment >= 0.7 ? 'Pos' : item.avg_sentiment >= 0.4 ? 'Mix' : 'Neg'
  const barColor = item.avg_sentiment >= 0.7 ? 'bg-emerald-400' : item.avg_sentiment >= 0.4 ? 'bg-amber-400' : 'bg-red-400'
  const sentColor = item.avg_sentiment >= 0.7 ? 'text-emerald-600' : item.avg_sentiment >= 0.4 ? 'text-amber-600' : 'text-red-600'
  const delta = deltaStyle(item.mention_delta, item.sparkline)

  return (
    <a
      href={`#entities/${item.id}`}
      className={`${CARD_HOVER} p-5 cursor-pointer group flex flex-col`}
    >
      {/* Header: name + star + pct/type badge */}
      <div className="flex items-start justify-between gap-2 mb-1">
        <div className="flex items-center gap-1.5 min-w-0">
          <button
            onClick={e => { e.preventDefault(); e.stopPropagation(); onToggleStar() }}
            className={`shrink-0 transition-colors ${starred ? 'text-amber-500' : 'text-slate-300 hover:text-amber-400'}`}
            title={starred ? 'Remove from watchlist' : 'Add to watchlist'}
          >
            <span className="material-symbols-outlined text-[18px]" style={starred ? { fontVariationSettings: "'FILL' 1" } : undefined}>star</span>
          </button>
          <h4 className="text-base font-bold text-slate-900 group-hover:text-primary transition-colors truncate">
            {item.canonical_name}
          </h4>
        </div>
        {pct ? (
          <span className={`text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-0.5 shrink-0 ${
            isNeg ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'
          }`}>
            <span className="material-symbols-outlined text-[14px]">{isNeg ? 'trending_down' : 'trending_up'}</span>
            {pct.replace(/^[+-]/, '')}
          </span>
        ) : (
          <span className={`px-2 py-0.5 rounded-lg text-[10px] font-semibold border shrink-0 ${TYPE_BADGE[item.type] ?? 'bg-gray-100 text-gray-600 border-gray-200'}`}>
            {item.type}
          </span>
        )}
      </div>

      {/* Status label + type */}
      <div className="flex items-center gap-2 mb-3">
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold ${status.style}`}>
          <span className="material-symbols-outlined text-[13px]">{status.icon}</span>
          {status.label}
        </span>
        {pct && (
          <span className={`text-[10px] font-medium text-slate-400`}>
            {TYPE_LABELS[item.type] ?? item.type}
          </span>
        )}
      </div>

      {/* Description */}
      <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mb-3 flex-1">
        {item.topSignal
          ? (item.topSignal.description || item.topSignal.title)
          : `${item.mention_count} mentions across ${item.aspect_count} aspects this period.`}
      </p>

      {/* Sparkline */}
      {item.sparkline && item.sparkline.length >= 2 && (
        <div className="mb-3">
          <Sparkline
            data={item.sparkline}
            width={240}
            height={40}
            color={item.avg_sentiment >= 0.7 ? '#10b981' : item.avg_sentiment >= 0.4 ? '#00a38d' : '#ef4444'}
          />
        </div>
      )}

      {/* Footer: mentions + delta trend + sentiment */}
      <div className="flex items-center justify-between gap-3 pt-3 border-t border-slate-100">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 text-xs text-slate-500">
            <span className="material-symbols-outlined text-[14px]">bar_chart</span>
            <span className="tabular-nums font-medium text-slate-700">{item.mention_count.toLocaleString()}</span>
          </span>
          {item.mention_delta != null && item.mention_delta !== 0 && (
            <span className={`flex items-center gap-0.5 text-xs font-bold ${delta.color}`}>
              <span className="material-symbols-outlined text-[16px]">{delta.icon}</span>
              <span className="tabular-nums">{delta.label}</span>
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <div className="w-14 h-1.5 rounded-full bg-slate-100 overflow-hidden">
            <div className={`h-full rounded-full ${barColor}`} style={{ width: `${sentPct}%` }} />
          </div>
          <span className={`text-[11px] font-bold tabular-nums whitespace-nowrap ${sentColor}`}>
            {sentPct}% {sentLabel}
          </span>
        </div>
      </div>
    </a>
  )
}
