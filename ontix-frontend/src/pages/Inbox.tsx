import { useState, useEffect, useCallback } from 'react'
import { Sidebar } from '../components/Sidebar'
import { InboxSkeleton } from '../components/Skeleton'
import type { ApiResponse, InboxFact } from '../types'

const CARD = 'bg-surface-light rounded-2xl border border-border-light shadow-sm'

const SEVERITY_STYLES: Record<string, string> = {
  critical: 'border-l-4 border-l-rose-500',
  warning: 'border-l-4 border-l-amber-500',
  info: 'border-l-4 border-l-blue-400',
}

const SEVERITY_BADGE: Record<string, string> = {
  critical: 'bg-rose-100 text-rose-700',
  warning: 'bg-amber-100 text-amber-700',
  info: 'bg-blue-100 text-blue-700',
}

const FACT_TYPE_ICON: Record<string, string> = {
  alert: 'warning',
  risk_signal: 'trending_down',
  trend: 'trending_up',
  insight: 'auto_awesome',
}

const FACT_TYPE_LABEL: Record<string, string> = {
  alert: '警報',
  risk_signal: '風險',
  trend: '趨勢',
  insight: '洞察',
}

const SEVERITY_LABEL: Record<string, string> = {
  critical: '嚴重',
  warning: '警告',
  info: '資訊',
}

type SeverityFilter = '' | 'critical' | 'warning' | 'info'
type FactTypeFilter = '' | 'alert' | 'risk_signal' | 'trend' | 'insight'

function formatEvidence(evidence: Record<string, unknown> | undefined): string[] {
  if (!evidence || Object.keys(evidence).length === 0) return []
  const lines: string[] = []
  // Common evidence fields
  if (evidence.delta != null) lines.push(`Delta: ${evidence.delta}`)
  if (evidence.delta_pct != null) lines.push(`Change: ${evidence.delta_pct}%`)
  if (evidence.current_value != null) lines.push(`Current: ${evidence.current_value}`)
  if (evidence.previous_value != null) lines.push(`Previous: ${evidence.previous_value}`)
  if (evidence.threshold != null) lines.push(`Threshold: ${evidence.threshold}`)
  if (evidence.rule_name) lines.push(`Rule: ${String(evidence.rule_name)}`)
  if (evidence.aspects && Array.isArray(evidence.aspects)) lines.push(`Aspects: ${(evidence.aspects as string[]).join(', ')}`)
  if (evidence.mention_count != null) lines.push(`Mentions: ${evidence.mention_count}`)
  if (evidence.avg_sentiment != null) lines.push(`Sentiment: ${(Number(evidence.avg_sentiment) * 10).toFixed(1)}/10`)
  // Fallback for remaining keys
  if (lines.length === 0) {
    for (const [k, v] of Object.entries(evidence)) {
      if (typeof v === 'object') continue
      lines.push(`${k}: ${v}`)
    }
  }
  return lines
}

export function Inbox() {
  const [facts, setFacts] = useState<InboxFact[]>([])
  const [total, setTotal] = useState(0)
  const [hasMore, setHasMore] = useState(false)
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)

  const [severity, setSeverity] = useState<SeverityFilter>('')
  const [factType, setFactType] = useState<FactTypeFilter>('')

  // Batch selection
  const [selected, setSelected] = useState<Set<number>>(new Set())
  const [batchLoading, setBatchLoading] = useState(false)

  const fetchFacts = (offset: number, append: boolean) => {
    const setter = append ? setLoadingMore : setLoading
    setter(true)
    const params = new URLSearchParams()
    if (severity) params.set('severity', severity)
    if (factType) params.set('fact_type', factType)
    params.set('offset', String(offset))
    params.set('limit', '30')
    params.set('order', 'desc')

    fetch(`/api/inbox?${params}`)
      .then(r => r.json())
      .then((res: ApiResponse<InboxFact[]>) => {
        const data = res.data ?? []
        if (append) {
          setFacts(prev => [...prev, ...data])
        } else {
          setFacts(data)
        }
        setTotal(res.pagination?.total ?? 0)
        setHasMore(res.pagination?.has_more ?? false)
      })
      .finally(() => setter(false))
  }

  useEffect(() => {
    fetchFacts(0, false)
    setSelected(new Set())
  }, [severity, factType])

  const loadMore = () => {
    fetchFacts(facts.length, true)
  }

  const markRead = (id: number) => {
    fetch(`/api/inbox/${id}/read`, { method: 'PATCH' })
      .then(r => r.json())
      .then(() => {
        setFacts(prev => prev.map(f => f.id === id ? { ...f, is_read: true } : f))
      })
  }

  const dismiss = (id: number) => {
    fetch(`/api/inbox/${id}/dismiss`, { method: 'PATCH' })
      .then(r => r.json())
      .then(() => {
        setFacts(prev => prev.filter(f => f.id !== id))
        setTotal(prev => prev - 1)
        setSelected(prev => { const s = new Set(prev); s.delete(id); return s })
      })
  }

  const toggleSelect = (id: number) => {
    setSelected(prev => {
      const s = new Set(prev)
      if (s.has(id)) s.delete(id)
      else s.add(id)
      return s
    })
  }

  const selectAll = useCallback(() => {
    if (selected.size === facts.length) {
      setSelected(new Set())
    } else {
      setSelected(new Set(facts.map(f => f.id)))
    }
  }, [facts, selected.size])

  const batchMarkRead = useCallback(() => {
    if (selected.size === 0) return
    setBatchLoading(true)
    const ids = [...selected]
    fetch('/api/inbox/batch', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids, action: 'read' }),
    })
      .then(r => r.json())
      .then(() => {
        setFacts(prev => prev.map(f => selected.has(f.id) ? { ...f, is_read: true } : f))
        setSelected(new Set())
      })
      .finally(() => setBatchLoading(false))
  }, [selected])

  const batchDismiss = useCallback(() => {
    if (selected.size === 0) return
    setBatchLoading(true)
    const ids = [...selected]
    fetch('/api/inbox/batch', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids, action: 'dismiss' }),
    })
      .then(r => r.json())
      .then(() => {
        setFacts(prev => prev.filter(f => !selected.has(f.id)))
        setTotal(prev => prev - ids.length)
        setSelected(new Set())
      })
      .finally(() => setBatchLoading(false))
  }, [selected])

  const formatDate = (iso: string) => {
    const d = new Date(iso)
    return `${d.getMonth() + 1}/${d.getDate()} ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`
  }

  const severityFilters: { value: SeverityFilter; label: string; icon?: string }[] = [
    { value: '', label: '全部' },
    { value: 'critical', label: '嚴重', icon: '🔴' },
    { value: 'warning', label: '警告', icon: '🟡' },
    { value: 'info', label: '資訊', icon: '🔵' },
  ]

  const factTypeFilters: { value: FactTypeFilter; label: string }[] = [
    { value: '', label: '全部' },
    { value: 'alert', label: '警報' },
    { value: 'trend', label: '趨勢' },
    { value: 'insight', label: '洞察' },
  ]

  return (
    <div className="h-screen flex overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-8 py-8 flex flex-col gap-6">
          {/* Header */}
          <div>
            <h2 className="text-2xl font-bold text-slate-900">收件匣</h2>
            <p className="text-sm text-slate-500 mt-1">
              {total} 則通知
            </p>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 font-medium">嚴重度</span>
              <div className="flex gap-1">
                {severityFilters.map(f => (
                  <button
                    key={f.value}
                    onClick={() => setSeverity(f.value)}
                    className={`px-3 py-1.5 rounded-xl text-sm font-medium transition-all ${
                      severity === f.value
                        ? 'bg-primary text-white shadow-sm'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {f.icon && <span className="mr-1">{f.icon}</span>}
                    {f.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 font-medium">類型</span>
              <div className="flex gap-1">
                {factTypeFilters.map(f => (
                  <button
                    key={f.value}
                    onClick={() => setFactType(f.value)}
                    className={`px-3 py-1.5 rounded-xl text-sm font-medium transition-all ${
                      factType === f.value
                        ? 'bg-primary text-white shadow-sm'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Batch action bar */}
          {facts.length > 0 && (
            <div className="flex items-center gap-3 text-sm">
              <button
                onClick={selectAll}
                className="flex items-center gap-1.5 text-slate-500 hover:text-primary transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">
                  {selected.size === facts.length ? 'check_box' : selected.size > 0 ? 'indeterminate_check_box' : 'check_box_outline_blank'}
                </span>
                {selected.size === facts.length ? '取消全選' : '全選'}
              </button>
              {selected.size > 0 && (
                <>
                  <span className="text-slate-400">|</span>
                  <span className="text-slate-500">{selected.size} 則已選</span>
                  <button
                    onClick={batchMarkRead}
                    disabled={batchLoading}
                    className="flex items-center gap-1 text-emerald-600 hover:text-emerald-700 font-medium transition-colors disabled:opacity-50"
                  >
                    <span className="material-symbols-outlined text-[16px]">check</span>
                    全部已讀
                  </button>
                  <button
                    onClick={batchDismiss}
                    disabled={batchLoading}
                    className="flex items-center gap-1 text-rose-600 hover:text-rose-700 font-medium transition-colors disabled:opacity-50"
                  >
                    <span className="material-symbols-outlined text-[16px]">close</span>
                    全部忽略
                  </button>
                </>
              )}
            </div>
          )}

          {/* Facts */}
          {loading ? (
            <InboxSkeleton />
          ) : facts.length === 0 ? (
            <div className={`${CARD} p-5`}>
              <div className="flex flex-col items-center py-10 text-slate-400">
                <span className="material-symbols-outlined text-4xl mb-2">inbox</span>
                <span className="text-sm">沒有通知</span>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {facts.map((fact, i) => {
                const isInsight = fact.fact_type === 'insight'
                const evidenceLines = formatEvidence(fact.evidence)
                const isSelected = selected.has(fact.id)
                return (
                  <div
                    key={fact.id}
                    className={`${CARD} p-5 ${SEVERITY_STYLES[fact.severity] ?? ''} ${
                      fact.is_read ? 'opacity-60' : ''
                    } ${isInsight ? 'bg-gradient-to-r from-purple-50/60 to-white' : ''} ${
                      isSelected ? 'ring-2 ring-primary/30' : ''
                    } hover:-translate-y-0.5 hover:shadow-md transition-all`}
                    style={i < 10 ? { animation: `cardIn 400ms ease-out ${i * 60}ms both` } : undefined}
                  >
                    <div className="flex items-start gap-3">
                      {/* Checkbox */}
                      <button
                        onClick={() => toggleSelect(fact.id)}
                        className={`mt-0.5 shrink-0 transition-colors ${isSelected ? 'text-primary' : 'text-slate-300 hover:text-slate-400'}`}
                      >
                        <span className="material-symbols-outlined text-[20px]">
                          {isSelected ? 'check_box' : 'check_box_outline_blank'}
                        </span>
                      </button>

                      {/* Icon */}
                      <span className={`material-symbols-outlined text-xl mt-0.5 ${
                        isInsight ? 'text-purple-500' : 'text-slate-500'
                      }`}>
                        {FACT_TYPE_ICON[fact.fact_type] ?? 'info'}
                      </span>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        {/* Badges + Title */}
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            SEVERITY_BADGE[fact.severity] ?? 'bg-gray-100 text-gray-600'
                          }`}>
                            {SEVERITY_LABEL[fact.severity] ?? fact.severity}
                          </span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-600">
                            {FACT_TYPE_LABEL[fact.fact_type] ?? fact.fact_type}
                          </span>
                          <h4 className="font-semibold text-slate-900 text-sm">
                            {fact.title}
                          </h4>
                        </div>

                        {/* Description */}
                        <p className={`text-sm text-slate-600 mt-1.5 ${
                          isInsight ? 'whitespace-pre-line' : ''
                        }`}>
                          {fact.description}
                        </p>

                        {/* Evidence (human-readable) */}
                        {evidenceLines.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-2">
                            {evidenceLines.map((line, j) => (
                              <span key={j} className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-50 text-slate-600 border border-slate-100">
                                {line}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Entity + Time + Actions */}
                        <div className="flex items-center gap-3 mt-3 text-xs text-slate-400">
                          <a
                            href={`#entities/${fact.object_id}`}
                            className="text-primary hover:underline font-medium"
                          >
                            {fact.entity_name}
                          </a>
                          <span>{fact.entity_type}</span>
                          {fact.period_start && (
                            <span>期間: {fact.period_start}</span>
                          )}
                          <span>{formatDate(fact.created_at)}</span>

                          <div className="ml-auto flex gap-2">
                            {!fact.is_read && (
                              <button
                                onClick={() => markRead(fact.id)}
                                className="flex items-center gap-1 text-slate-400 hover:text-emerald-600 transition-colors"
                                title="標記已讀"
                              >
                                <span className="material-symbols-outlined text-[16px]">check</span>
                                已讀
                              </button>
                            )}
                            <button
                              onClick={() => dismiss(fact.id)}
                              className="flex items-center gap-1 text-slate-400 hover:text-rose-600 transition-colors"
                              title="忽略"
                            >
                              <span className="material-symbols-outlined text-[16px]">close</span>
                              忽略
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* Load more */}
          {hasMore && (
            <button
              onClick={loadMore}
              disabled={loadingMore}
              className="w-full py-2.5 text-sm text-primary hover:text-primary-dark font-medium transition-colors disabled:opacity-50"
            >
              {loadingMore ? '載入中...' : '顯示更多 ↓'}
            </button>
          )}
        </div>
      </main>
    </div>
  )
}
