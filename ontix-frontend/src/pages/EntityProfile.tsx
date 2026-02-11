import { useState, useEffect, useMemo, useRef } from 'react'
import { Sidebar } from '../components/Sidebar'
import { ProfileSkeleton } from '../components/Skeleton'
import { SentimentChart } from '../components/entity/SentimentChart'
import { TrendChart } from '../components/entity/TrendChart'
import { AspectList } from '../components/entity/AspectList'
import { MentionCard } from '../components/entity/MentionCard'
import { TopicDistribution } from '../components/entity/TopicDistribution'
import { WhoDiscusses } from '../components/entity/WhoDiscusses'
import { RelatedBrands } from '../components/entity/RelatedBrands'
import { KOLAttributionPanel } from '../components/entity/KOLAttributionPanel'
import { useEntityChat, AIChatMessages, AIChatInput } from '../components/entity/AIChatPanel'
import { PeriodSelector } from '../components/PeriodSelector'
import { useWatchlist } from '../hooks/useWatchlist'
import { usePeriod } from '../hooks/usePeriod'
import type { ApiResponse, EntityDetail, EntityObservation, LinkItem, InboxFact, TopicDistributionItem, DiscusserItem, MentionItem, EntityAISummary } from '../types'
import { TYPE_BADGE } from '../constants'

const CARD = 'bg-surface-light rounded-xl border border-border-light shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05)]'

const SEVERITY_STYLE: Record<string, { icon: string; bg: string; color: string }> = {
  critical: { icon: 'error', bg: 'bg-red-50', color: 'text-red-600' },
  warning: { icon: 'warning', bg: 'bg-amber-50', color: 'text-amber-600' },
  info: { icon: 'info', bg: 'bg-blue-50', color: 'text-blue-600' },
}

const FACT_TYPE_LABEL: Record<string, string> = {
  alert: 'Alert',
  risk_signal: 'Risk',
  trend: 'Trend',
  insight: 'Insight',
}

const RANK_COLORS = ['bg-yellow-400', 'bg-slate-300', 'bg-amber-600', 'bg-slate-200']

const LINK_AVATAR_COLORS = [
  'bg-blue-500', 'bg-emerald-500', 'bg-violet-500', 'bg-rose-500',
  'bg-amber-500', 'bg-teal-500', 'bg-indigo-500', 'bg-pink-500',
]

function linkAvatarColor(name: string): string {
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash)
  return LINK_AVATAR_COLORS[Math.abs(hash) % LINK_AVATAR_COLORS.length]
}

function linkInitial(name: string): string {
  if (!name) return '?'
  if (/[\u4e00-\u9fff\u3400-\u4dbf]/.test(name)) return name.charAt(0)
  return name.charAt(0).toUpperCase()
}

function timeAgo(isoString: string): string {
  const diff = Date.now() - new Date(isoString).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

function sentimentLabel(s: number): { text: string; color: string; bg: string; border: string; icon: string } {
  if (s >= 0.7) return { text: 'Positive', color: 'text-green-700', bg: 'bg-green-50', border: 'border-green-100', icon: 'trending_up' }
  if (s >= 0.4) return { text: 'Neutral', color: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-100', icon: 'trending_flat' }
  return { text: 'Negative', color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-100', icon: 'trending_down' }
}

type SentimentFilter = '' | 'positive' | 'negative'
type MentionSort = 'created_at' | 'sentiment_asc' | 'sentiment_desc'

const OBS_LIMIT: Record<string, number> = { '1w': 7, '4w': 8, '12w': 12, '': 24 }

interface EntityProfileProps {
  entityId: string
}

export function EntityProfile({ entityId }: EntityProfileProps) {
  const watchlist = useWatchlist()
  const { period, setPeriod } = usePeriod()
  const [entity, setEntity] = useState<EntityDetail | null>(null)
  const [facts, setFacts] = useState<InboxFact[]>([])
  const [observations, setObservations] = useState<EntityObservation[]>([])
  const [summary, setSummary] = useState<EntityAISummary | null>(null)
  const [summaryLoading, setSummaryLoading] = useState(true)
  const chat = useEntityChat(entityId, period || '4w')
  const summaryScrollRef = useRef<HTMLDivElement>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Aspect drill-down
  const [selectedAspect, setSelectedAspect] = useState<string | null>(null)
  const [aspectMentions, setAspectMentions] = useState<MentionItem[]>([])
  const [aspectMentionsLoading, setAspectMentionsLoading] = useState(false)
  const [aspectMentionTotal, setAspectMentionTotal] = useState(0)

  // Aspect sentiment filter
  const [aspectSentimentFilter, setAspectSentimentFilter] = useState<SentimentFilter>('')

  // Mention sort + filter
  const [mentionSort, setMentionSort] = useState<MentionSort>('created_at')
  const [mentionSentimentFilter, setMentionSentimentFilter] = useState<SentimentFilter>('')

  useEffect(() => {
    setLoading(true)
    setError('')
    setSummaryLoading(true)
    const periodParam = period ? `&period=${period}` : ''
    const obsLimit = OBS_LIMIT[period] ?? 24
    Promise.all([
      fetch(`/api/entities/${entityId}?include=aspects,mentions,links${periodParam}`)
        .then(res => { if (!res.ok) throw new Error('Not found'); return res.json() })
        .then((res: ApiResponse<EntityDetail>) => res.data),
      fetch(`/api/entities/${entityId}/facts?limit=10`)
        .then(res => res.ok ? res.json() : { data: [] })
        .then((res: ApiResponse<InboxFact[]>) => res.data ?? []),
      fetch(`/api/entities/${entityId}/observations?period_type=week&limit=${obsLimit}`)
        .then(res => res.ok ? res.json() : { data: [] })
        .then((res: ApiResponse<EntityObservation[]>) => res.data ?? []),
    ])
      .then(([ent, f, obs]) => {
        setEntity(ent ?? null)
        setFacts(f)
        setObservations(obs)
      })
      .catch(() => setError('Entity not found'))
      .finally(() => setLoading(false))

    // Fetch AI summary in parallel (non-blocking)
    const summaryPeriod = period || '4w'
    fetch(`/api/entities/${entityId}/summary?period=${summaryPeriod}`)
      .then(res => res.ok ? res.json() : null)
      .then((res: ApiResponse<EntityAISummary> | null) => setSummary(res?.data ?? null))
      .catch(() => setSummary(null))
      .finally(() => {
        setSummaryLoading(false)
        requestAnimationFrame(() => {
          if (summaryScrollRef.current) {
            summaryScrollRef.current.scrollTop = 0
          }
        })
      })
  }, [entityId, period])

  // Fetch filtered mentions when aspect is selected or mention sort/filter changes
  useEffect(() => {
    if (!selectedAspect && !mentionSentimentFilter && mentionSort === 'created_at') {
      setAspectMentions([])
      setAspectMentionTotal(0)
      return
    }
    setAspectMentionsLoading(true)
    const params = new URLSearchParams({ limit: '20' })
    if (selectedAspect) params.set('aspect', selectedAspect)
    if (mentionSentimentFilter) params.set('sentiment', mentionSentimentFilter)
    if (mentionSort === 'sentiment_asc') { params.set('sort', 'sentiment_score'); params.set('order', 'asc') }
    else if (mentionSort === 'sentiment_desc') { params.set('sort', 'sentiment_score'); params.set('order', 'desc') }

    fetch(`/api/entities/${entityId}/mentions?${params}`)
      .then(r => r.json())
      .then((res: ApiResponse<MentionItem[]>) => {
        setAspectMentions(res.data ?? [])
        setAspectMentionTotal(res.pagination?.total ?? (res.data ?? []).length)
      })
      .finally(() => setAspectMentionsLoading(false))
  }, [entityId, selectedAspect, mentionSort, mentionSentimentFilter])

  // Reset filters when navigating to new entity
  useEffect(() => {
    setSelectedAspect(null)
    setAspectSentimentFilter('')
    setMentionSort('created_at')
    setMentionSentimentFilter('')
  }, [entityId])

  // Filtered aspects
  const filteredAspects = useMemo(() => {
    const aspects = entity?.top_aspects ?? []
    if (!aspectSentimentFilter) return aspects
    return aspects.filter(a => {
      if (aspectSentimentFilter === 'positive') return a.positive_count > a.negative_count
      return a.negative_count > a.positive_count
    })
  }, [entity?.top_aspects, aspectSentimentFilter])

  const mentionChange = useMemo(() => {
    if (observations.length < 2) return null
    const curr = observations[observations.length - 1].mention_count
    const prev = observations[observations.length - 2].mention_count
    if (prev === 0) return curr > 0 ? 100 : 0
    return Math.round(((curr - prev) / prev) * 100)
  }, [observations])

  const topicDistribution = useMemo<TopicDistributionItem[]>(() => {
    if (!entity || entity.type !== 'person') return []
    const topicLinks = (entity.links ?? []).filter(l => l.link_type === 'discusses' && l.direction === 'outgoing')
    if (topicLinks.length === 0) return []
    const total = topicLinks.length
    return topicLinks.map(l => ({
      topic_id: l.linked_id, topic_name: l.linked_name, category: '',
      mention_count: 1, percentage: Math.round((1 / total) * 100),
    }))
  }, [entity])

  const discussers = useMemo<DiscusserItem[]>(() => {
    if (!entity || entity.type !== 'content_topic') return []
    return (entity.links ?? [])
      .filter(l => l.link_type === 'discussed_by' && l.direction === 'outgoing')
      .map(l => ({ entity_id: l.linked_id, entity_name: l.linked_name, entity_type: l.linked_type, mention_count: 1, avg_sentiment: 0.5 }))
  }, [entity])

  const relatedBrands = useMemo<LinkItem[]>(() => {
    if (!entity || entity.type !== 'content_topic') return []
    return (entity.links ?? []).filter(l => l.link_type === 'relevant_to' && l.direction === 'outgoing')
  }, [entity])

  const useFilteredMentions = selectedAspect || mentionSentimentFilter || mentionSort !== 'created_at'

  return (
    <div className="h-screen flex overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto bg-background-light">
        <div className="max-w-7xl mx-auto px-6 py-6 flex flex-col gap-6">

          {/* Back */}
          <a href="#" className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-primary transition-colors w-fit">
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            Back to overview
          </a>

          {loading ? (
            <ProfileSkeleton />
          ) : error ? (
            <div className="text-center py-20 text-slate-400">{error}</div>
          ) : entity ? (
            <>
              {/* ===== Entity Header Card (top, full width) ===== */}
              <div className={`${CARD} p-6`}>
                <div className="flex flex-col lg:flex-row lg:items-center gap-6">
                  {/* Left: Avatar + Name + Aliases */}
                  <div className="flex items-center gap-4 lg:min-w-0 lg:flex-1">
                    <div className={`size-14 rounded-full ${linkAvatarColor(entity.canonical_name)} flex items-center justify-center text-white text-xl font-bold shrink-0`}>
                      {linkInitial(entity.canonical_name)}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-3 flex-wrap">
                        <button
                          onClick={() => watchlist.toggle(entityId)}
                          className={`shrink-0 transition-colors ${watchlist.has(entityId) ? 'text-amber-500' : 'text-slate-300 hover:text-amber-400'}`}
                          title={watchlist.has(entityId) ? 'Remove from watchlist' : 'Add to watchlist'}
                        >
                          <span className="material-symbols-outlined text-[22px]" style={watchlist.has(entityId) ? { fontVariationSettings: "'FILL' 1" } : undefined}>star</span>
                        </button>
                        <h2 className="text-xl font-bold text-slate-900 truncate">{entity.canonical_name}</h2>
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${TYPE_BADGE[entity.type] ?? 'bg-gray-100 text-gray-600 border-gray-200'}`}>
                          {entity.type}
                        </span>
                        {entity.sub_type && (
                          <span className="text-xs text-slate-400">{entity.sub_type}</span>
                        )}
                      </div>
                      {entity.aliases && entity.aliases.length > 0 && (
                        <p className="text-xs text-slate-500 mt-1">
                          Also known as: {entity.aliases.join(', ')}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Right: Period selector + Stats row */}
                  <div className="flex items-center gap-4 shrink-0">
                    <PeriodSelector value={period} onChange={setPeriod} />
                    {(() => {
                      const s = sentimentLabel(entity.stats.avg_sentiment)
                      return (
                        <div className={`text-center px-4 py-2 rounded-lg ${s.bg}`}>
                          <p className={`text-lg font-bold tabular-nums ${s.color}`}>{(entity.stats.avg_sentiment * 10).toFixed(1)}</p>
                          <p className="text-[10px] font-medium text-slate-500">Sentiment</p>
                        </div>
                      )
                    })()}
                    <div className="text-center px-4 py-2 rounded-lg bg-slate-50">
                      <p className="text-lg font-bold tabular-nums text-slate-900">{entity.stats.mention_count}</p>
                      <p className="text-[10px] font-medium text-slate-500">Mentions</p>
                    </div>
                    <div className="text-center px-4 py-2 rounded-lg bg-emerald-50">
                      <p className="text-lg font-bold tabular-nums text-emerald-700">{entity.stats.positive_count}</p>
                      <p className="text-[10px] font-medium text-slate-500">Positive</p>
                    </div>
                    <div className="text-center px-4 py-2 rounded-lg bg-rose-50">
                      <p className="text-lg font-bold tabular-nums text-rose-600">{entity.stats.negative_count}</p>
                      <p className="text-[10px] font-medium text-slate-500">Negative</p>
                    </div>
                  </div>
                </div>

                {/* Sentiment bar */}
                {(() => {
                  const total = entity.stats.positive_count + entity.stats.negative_count + entity.stats.neutral_count + entity.stats.mixed_count
                  if (total === 0) return null
                  const pPct = (entity.stats.positive_count / total) * 100
                  const mPct = (entity.stats.mixed_count / total) * 100
                  const nPct = (entity.stats.negative_count / total) * 100
                  return (
                    <div className="mt-4">
                      <div className="h-2 rounded-full bg-gray-100 overflow-hidden flex">
                        {pPct > 0 && <div className="h-full bg-emerald-400" style={{ width: `${pPct}%` }} />}
                        {mPct > 0 && <div className="h-full bg-amber-300" style={{ width: `${mPct}%` }} />}
                        {nPct > 0 && <div className="h-full bg-rose-400" style={{ width: `${nPct}%` }} />}
                      </div>
                      <div className="flex justify-between mt-2 text-[10px] text-slate-400">
                        <span>Pos {Math.round(pPct)}%</span>
                        <span>Neu {Math.round(100 - pPct - nPct - mPct)}%</span>
                        <span>Neg {Math.round(nPct)}%</span>
                      </div>
                    </div>
                  )
                })()}
              </div>

            {/* ===== AI Insight Summary ===== */}
            {(summaryLoading || summary) && (
              <div className={`rounded-2xl transition-all duration-700 ease-out flex flex-col ${
                summaryLoading
                  ? 'liquid-glass-loading p-6'
                  : 'liquid-glass'
              }`}>
                {summaryLoading ? (
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-purple-400 animate-spin text-[20px]">progress_activity</span>
                    <span className="text-sm font-semibold text-purple-500/80 ai-loading-dots">Generating AI Insight</span>
                  </div>
                ) : summary ? (
                  <div className="ai-summary-enter flex flex-col">
                    {/* Scrollable summary content */}
                    <div ref={summaryScrollRef} className={`overflow-y-auto px-6 pt-6 pb-2 scrollbar-thin transition-[max-height] duration-300 ${chat.messages.length > 0 ? 'max-h-[600px]' : 'max-h-[420px]'}`}>
                      <div className="flex items-center gap-2 mb-3">
                        <span className="material-symbols-outlined text-purple-400">auto_awesome</span>
                        <h3 className="text-sm font-bold text-purple-600/80 uppercase tracking-wider">AI Insight Summary</h3>
                        {summary.generated_at && (
                          <span className="ml-auto text-[11px] text-slate-400/60">{timeAgo(summary.generated_at)}</span>
                        )}
                      </div>
                      <p className="text-base font-bold text-slate-800 mb-4">{summary.headline}</p>

                      {/* Reasoning Chain */}
                      {summary.reasoning_chain && summary.reasoning_chain.length > 0 && (
                        <div className="mb-5">
                          <div className="flex items-center gap-2 mb-3">
                            <span className="material-symbols-outlined text-purple-400 text-[16px]">account_tree</span>
                            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Reasoning Chain</span>
                            <div className="flex-1 h-px bg-gradient-to-r from-slate-200/60 to-transparent" />
                          </div>
                          <div className="relative pl-4 border-l-2 border-purple-300/50 space-y-4">
                            {summary.reasoning_chain.map((step, i) => (
                              <div key={i} className="relative">
                                <div className="absolute -left-[calc(1rem+5px)] top-1 size-2.5 rounded-full bg-purple-400/70 ring-2 ring-white/60" />
                                <div className="bg-white/40 backdrop-blur-sm rounded-lg p-3 space-y-1.5 border border-white/50">
                                  <p className="text-xs font-semibold text-purple-600/80 flex items-center gap-1">
                                    <span className="material-symbols-outlined text-[13px]">sensors</span>
                                    {step.signal}
                                  </p>
                                  <p className="text-xs text-slate-500 flex items-center gap-1">
                                    <span className="material-symbols-outlined text-[13px]">arrow_forward</span>
                                    {step.reasoning}
                                  </p>
                                  <p className="text-sm font-medium text-slate-700 flex items-center gap-1">
                                    <span className="material-symbols-outlined text-[13px]">check_circle</span>
                                    <HighlightedText text={step.conclusion} />
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Body */}
                      <div className="text-sm text-slate-600 leading-relaxed mb-4">
                        <HighlightedText text={summary.body} />
                      </div>

                      {/* Actions */}
                      {summary.actions && summary.actions.length > 0 && (
                        <div className="mb-2">
                          <div className="flex items-center gap-2 mb-3">
                            <span className="material-symbols-outlined text-amber-400 text-[16px]">lightbulb</span>
                            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Suggested Actions</span>
                            <div className="flex-1 h-px bg-gradient-to-r from-slate-200/60 to-transparent" />
                          </div>
                          <div className="space-y-2.5">
                            {summary.actions.map((action, i) => (
                              <div key={i} className="bg-white/40 backdrop-blur-sm border border-white/50 rounded-xl p-3.5 hover:bg-white/55 transition-colors">
                                <span className="text-xs font-semibold text-slate-400">{action.trigger}</span>
                                <p className="text-sm text-slate-700 font-medium leading-relaxed mt-1 mb-1.5">{action.action}</p>
                                <div className="flex items-center gap-1.5">
                                  <span className="material-symbols-outlined text-emerald-500/70 text-[13px]">flag</span>
                                  <span className="text-xs text-emerald-600/80">{action.target}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Chat messages — inside scroll area */}
                      <AIChatMessages messages={chat.messages} scrollContainerRef={summaryScrollRef} />
                    </div>

                    {/* Chat input — pinned at bottom */}
                    <div className="px-6 pb-5 pt-3 border-t border-white/20">
                      <AIChatInput
                        input={chat.input}
                        setInput={chat.setInput}
                        streaming={chat.streaming}
                        sendMessage={chat.sendMessage}
                        hasMessages={chat.messages.length > 0}
                      />
                    </div>
                  </div>
                ) : null}
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

              {/* ===== LEFT COLUMN (8 cols) ===== */}
              <div className="lg:col-span-8 flex flex-col gap-6">

                {/* Hero: Aspect Distribution */}
                <div className={`${CARD} p-6`}>
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h1 className="text-xl font-bold text-slate-900 mb-1">Aspect Distribution</h1>
                      <p className="text-sm text-slate-500">
                        Analysis of {entity.stats.mention_count.toLocaleString()} mentions for{' '}
                        <span className="text-primary font-semibold">"{entity.canonical_name}"</span>
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-slate-900 tabular-nums">
                        {entity.stats.mention_count.toLocaleString()}
                      </div>
                      {mentionChange != null && mentionChange !== 0 && (
                        <div className={`text-xs font-medium flex items-center justify-end gap-1 px-2 py-0.5 rounded-full ${
                          mentionChange > 0 ? 'text-green-600 bg-green-50' : 'text-rose-600 bg-rose-50'
                        }`}>
                          <span className="material-symbols-outlined text-[14px]">
                            {mentionChange > 0 ? 'trending_up' : 'trending_down'}
                          </span>
                          {mentionChange > 0 ? '+' : ''}{mentionChange}% vs last period
                        </div>
                      )}
                    </div>
                  </div>
                  {/* Aspect sentiment filter pills */}
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-xs text-slate-500 font-medium">Filter:</span>
                    {([['', 'All'], ['positive', 'Positive'], ['negative', 'Negative']] as const).map(([val, label]) => (
                      <button
                        key={val}
                        onClick={() => setAspectSentimentFilter(val as SentimentFilter)}
                        className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                          aspectSentimentFilter === val
                            ? 'bg-primary text-white shadow-sm'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                  <AspectList
                    aspects={filteredAspects}
                    totalMentions={entity.stats.mention_count}
                    selectedAspect={selectedAspect ?? undefined}
                    onSelectAspect={setSelectedAspect}
                  />
                </div>

                {/* Mention Trend (line chart) */}
                {observations.length >= 2 && (
                  <div className={`${CARD} p-6`}>
                    <TrendChart observations={observations} entityId={entityId} />
                  </div>
                )}

                {/* KOL Attribution — brand/product/organization only */}
                {(entity.type === 'brand' || entity.type === 'product' || entity.type === 'organization') && (
                  <div className={`${CARD} p-6`}>
                    <KOLAttributionPanel entityId={entityId} />
                  </div>
                )}

                {/* Sentiment Over Time */}
                {observations.length > 0 && (
                  <div className={`${CARD} p-6`}>
                    <SentimentChart observations={observations} />
                  </div>
                )}

                {/* Who Discusses — only for content_topic */}
                {entity.type === 'content_topic' && discussers.length > 0 && (
                  <div className={`${CARD} p-6`}>
                    <WhoDiscusses discussers={discussers} />
                  </div>
                )}

                {/* Recent Mentions */}
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    {selectedAspect ? (
                      <>
                        <span className="material-symbols-outlined text-primary text-[20px]">filter_alt</span>
                        Mentions for "{selectedAspect}"
                        <span className="text-sm font-normal text-slate-400">({aspectMentionTotal})</span>
                      </>
                    ) : (
                      'Recent Mentions'
                    )}
                  </h3>
                  <div className="flex items-center gap-2">
                    {selectedAspect && (
                      <button
                        onClick={() => setSelectedAspect(null)}
                        className="text-xs font-medium text-primary hover:text-primary-dark flex items-center gap-1 transition-colors"
                      >
                        <span className="material-symbols-outlined text-[14px]">close</span>
                        Clear filter
                      </button>
                    )}
                  </div>
                </div>

                {/* Mention sort + sentiment filter controls */}
                <div className="flex items-center gap-3 flex-wrap">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs text-slate-500">Sort:</span>
                    {([['created_at', 'Latest'], ['sentiment_desc', 'Most Positive'], ['sentiment_asc', 'Most Negative']] as const).map(([val, label]) => (
                      <button
                        key={val}
                        onClick={() => setMentionSort(val as MentionSort)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                          mentionSort === val
                            ? 'bg-primary text-white shadow-sm'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs text-slate-500">Sentiment:</span>
                    {([['', 'All'], ['positive', 'Positive'], ['negative', 'Negative']] as const).map(([val, label]) => (
                      <button
                        key={val}
                        onClick={() => setMentionSentimentFilter(val as SentimentFilter)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                          mentionSentimentFilter === val
                            ? 'bg-primary text-white shadow-sm'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col gap-4">
                  {aspectMentionsLoading ? (
                    <div className="flex items-center justify-center py-8 text-slate-400">
                      <span className="material-symbols-outlined animate-spin text-[20px] mr-2">progress_activity</span>
                      Loading mentions...
                    </div>
                  ) : ((): React.ReactNode => {
                    const mentions = useFilteredMentions ? aspectMentions : (entity.recent_mentions ?? [])
                    if (mentions.length === 0) {
                      return <p className="text-sm text-slate-400 py-4">{selectedAspect ? 'No mentions found for this aspect.' : 'No mentions yet.'}</p>
                    }
                    return mentions.map((m, i) => (
                      <MentionCard key={`${m.post_id}-${i}`} mention={m} />
                    ))
                  })()}
                </div>
              </div>

              {/* ===== RIGHT COLUMN (4 cols) ===== */}
              <div className="lg:col-span-4 flex flex-col gap-6">
                {/* Sticky sidebar */}
                <div className="lg:sticky lg:top-6 flex flex-col gap-6">

                  {/* Topic Distribution — person/KOL only */}
                  {entity.type === 'person' && topicDistribution.length > 0 && (
                    <div className={`${CARD} p-6`}>
                      <TopicDistribution topics={topicDistribution} />
                    </div>
                  )}

                  {/* Related Brands — content_topic only */}
                  {entity.type === 'content_topic' && relatedBrands.length > 0 && (
                    <div className={`${CARD} p-6`}>
                      <RelatedBrands brands={relatedBrands} />
                    </div>
                  )}

                  {/* Related Entities (KOL-style list with avatars) */}
                  {(entity.links ?? []).length > 0 && (
                    <div className={`${CARD} p-6`}>
                      <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary">hub</span>
                        Related Entities
                      </h3>
                      <div className="flex flex-col gap-1">
                        {(entity.links ?? []).map((link, i) => (
                          <a
                            key={i}
                            href={`#entities/${link.linked_id}`}
                            className="flex items-center gap-3 p-2 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer group"
                          >
                            <div className="relative">
                              <div className={`size-10 rounded-full ${linkAvatarColor(link.linked_name)} flex items-center justify-center text-white text-sm font-bold`}>
                                {linkInitial(link.linked_name)}
                              </div>
                              {i < 3 && (
                                <div className={`absolute -bottom-1 -right-1 ${RANK_COLORS[i]} text-[9px] font-bold size-4 flex items-center justify-center rounded-full text-white border-2 border-white`}>
                                  {i + 1}
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="text-sm font-bold text-slate-900 truncate group-hover:text-primary transition-colors">
                                {link.linked_name}
                              </h4>
                              <p className="text-xs text-slate-500 truncate">
                                {link.link_type} · {link.linked_type}
                              </p>
                            </div>
                            <span className="material-symbols-outlined text-slate-300 group-hover:text-primary text-[20px]">chevron_right</span>
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Insights & Alerts */}
                  {facts.length > 0 && (
                    <div className={`${CARD} p-6`}>
                      <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
                        <span className="material-symbols-outlined text-purple-500">auto_awesome</span>
                        Insights & Alerts
                      </h3>
                      <div className="flex flex-col gap-2">
                        {facts.map(f => (
                          <FactCard key={f.id} fact={f} />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Quick Info */}
                  <div className={`${CARD} p-6`}>
                    <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
                      <span className="material-symbols-outlined text-slate-400">info</span>
                      Information
                    </h3>
                    <dl className="flex flex-col gap-3 text-sm">
                      <div className="flex items-center justify-between">
                        <dt className="text-slate-500">Status</dt>
                        <dd className="font-medium text-slate-900">
                          <span className={`inline-flex items-center gap-1 ${entity.status === 'active' ? 'text-emerald-600' : 'text-slate-400'}`}>
                            <span className={`size-1.5 rounded-full ${entity.status === 'active' ? 'bg-emerald-500' : 'bg-gray-300'}`} />
                            {entity.status}
                          </span>
                        </dd>
                      </div>
                      <div className="flex items-center justify-between">
                        <dt className="text-slate-500">Aspects</dt>
                        <dd className="font-medium text-slate-900 tabular-nums">{entity.stats.aspect_count}</dd>
                      </div>
                      <div className="flex items-center justify-between">
                        <dt className="text-slate-500">Created</dt>
                        <dd className="font-medium text-slate-900">
                          {new Date(entity.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                        </dd>
                      </div>
                    </dl>
                  </div>

                </div>
              </div>

            </div>
            </>
          ) : null}
        </div>
      </main>
    </div>
  )
}

/** Renders **bold** as purple highlight and !!text!! as red highlight */
function HighlightedText({ text }: { text: string }) {
  const parts = text.split(/(\*\*[^*]+\*\*|!![^!]+!!)/)
  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <mark key={i} className="bg-purple-100 text-purple-800 font-semibold px-0.5 rounded-sm">{part.slice(2, -2)}</mark>
        }
        if (part.startsWith('!!') && part.endsWith('!!')) {
          return <mark key={i} className="bg-red-100 text-red-700 font-semibold px-0.5 rounded-sm">{part.slice(2, -2)}</mark>
        }
        return <span key={i}>{part}</span>
      })}
    </>
  )
}

function FactCard({ fact }: { fact: InboxFact }) {
  const sev = SEVERITY_STYLE[fact.severity] ?? SEVERITY_STYLE.info
  const isInsight = fact.fact_type === 'insight'

  return (
    <div className={`rounded-xl p-4 border ${isInsight ? 'bg-purple-50/50 border-purple-100' : 'bg-gray-50/50 border-gray-100'}`}>
      <div className="flex items-start gap-3">
        <div className={`${isInsight ? 'bg-purple-100' : sev.bg} p-1.5 rounded-lg shrink-0 mt-0.5`}>
          <span className={`material-symbols-outlined text-[16px] ${isInsight ? 'text-purple-600' : sev.color}`}>
            {isInsight ? 'auto_awesome' : sev.icon}
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-1">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              {FACT_TYPE_LABEL[fact.fact_type] ?? fact.fact_type}
            </span>
          </div>
          <p className="text-sm font-medium text-slate-900 leading-relaxed">{fact.title}</p>
          {fact.description && (
            <p className="text-sm text-slate-500 mt-1 line-clamp-2">{fact.description}</p>
          )}
        </div>
      </div>
    </div>
  )
}
