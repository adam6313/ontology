import { useState, useEffect, useCallback, useRef } from 'react'
import { Sidebar } from '../components/Sidebar'
import { EntitySelector } from '../components/compare/EntitySelector'
import { CompareTrendChart } from '../components/compare/CompareTrendChart'
import { AspectList } from '../components/entity/AspectList'
import { MentionCard } from '../components/entity/MentionCard'
import type { ApiResponse, EntityDetail, EntityObservation, EntitySummary } from '../types'

const CARD = 'bg-surface-light rounded-xl border border-border-light shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05)]'
const COLOR_A = '#00a38d'
const COLOR_B = '#8b5cf6'
const LS_KEY = 'compare-saved'

interface SavedEntity { id: string; name: string; type: string }
interface SavedComparison { a: SavedEntity; b: SavedEntity; savedAt: number }

function loadSaved(): SavedComparison[] {
  try { return JSON.parse(localStorage.getItem(LS_KEY) ?? '[]') }
  catch { return [] }
}
function persistSaved(list: SavedComparison[]) {
  localStorage.setItem(LS_KEY, JSON.stringify(list))
}

interface ComparePageProps {
  entityIdA?: string
  entityIdB?: string
}

interface EntityData {
  detail: EntityDetail
  observations: EntityObservation[]
}

function StatBox({ label, valueA, valueB, format, lowerIsBetter }: {
  label: string
  valueA: number
  valueB: number
  format?: (n: number) => string
  lowerIsBetter?: boolean
}) {
  const fmt = format ?? ((n: number) => n.toLocaleString())
  const aWins = lowerIsBetter ? valueA < valueB : valueA > valueB
  const bWins = lowerIsBetter ? valueB < valueA : valueB > valueA
  return (
    <div className="flex items-center gap-4">
      <div className={`flex-1 text-right p-3 rounded-lg ${aWins ? 'bg-primary/5' : 'bg-slate-50'}`}>
        <p className={`text-lg font-bold tabular-nums ${aWins ? 'text-primary' : 'text-slate-700'}`}>{fmt(valueA)}</p>
      </div>
      <div className="text-xs text-slate-400 font-medium w-20 text-center shrink-0">{label}</div>
      <div className={`flex-1 p-3 rounded-lg ${bWins ? 'bg-purple-50' : 'bg-slate-50'}`}>
        <p className={`text-lg font-bold tabular-nums ${bWins ? 'text-purple-600' : 'text-slate-700'}`}>{fmt(valueB)}</p>
      </div>
    </div>
  )
}

function fetchEntityData(entityId: string, signal?: AbortSignal): Promise<EntityData> {
  return Promise.all([
    fetch(`/api/entities/${entityId}?include=aspects,mentions`, { signal })
      .then(r => { if (!r.ok) throw new Error('Not found'); return r.json() })
      .then((res: ApiResponse<EntityDetail>) => res.data),
    fetch(`/api/entities/${entityId}/observations?period_type=week&limit=12`, { signal })
      .then(r => r.ok ? r.json() : { data: [] })
      .then((res: ApiResponse<EntityObservation[]>) => res.data ?? []),
  ]).then(([detail, observations]) => ({ detail, observations }))
}

export function ComparePage({ entityIdA, entityIdB }: ComparePageProps) {
  const [selectedA, setSelectedA] = useState<EntitySummary | null>(null)
  const [selectedB, setSelectedB] = useState<EntitySummary | null>(null)
  const [dataA, setDataA] = useState<EntityData | null>(null)
  const [dataB, setDataB] = useState<EntityData | null>(null)
  const [loading, setLoading] = useState(false)
  const [loadingA, setLoadingA] = useState(false)
  const [loadingB, setLoadingB] = useState(false)
  const abortA = useRef<AbortController | undefined>(undefined)
  const abortB = useRef<AbortController | undefined>(undefined)

  // Helper: build EntitySummary from EntityDetail
  function toSummary(d: EntityDetail): EntitySummary {
    return {
      id: d.id, canonical_name: d.canonical_name, type: d.type, sub_type: d.sub_type,
      mention_count: d.stats.mention_count, aspect_count: d.stats.aspect_count, avg_sentiment: d.stats.avg_sentiment,
    }
  }

  const [savedList, setSavedList] = useState<SavedComparison[]>(() => loadSaved())

  // Load from URL params on mount
  useEffect(() => {
    if (!entityIdA && !entityIdB) return
    setLoading(true)
    const ctrl = new AbortController()
    const promises: Promise<void>[] = []

    if (entityIdA) {
      promises.push(
        fetchEntityData(entityIdA, ctrl.signal).then(data => {
          setDataA(data)
          setSelectedA(toSummary(data.detail))
        }).catch(() => {})
      )
    }
    if (entityIdB) {
      promises.push(
        fetchEntityData(entityIdB, ctrl.signal).then(data => {
          setDataB(data)
          setSelectedB(toSummary(data.detail))
        }).catch(() => {})
      )
    }

    Promise.all(promises).finally(() => setLoading(false))
    return () => ctrl.abort()
  }, [entityIdA, entityIdB])

  // Update URL when selections change
  const updateUrl = useCallback((a: EntitySummary | null, b: EntitySummary | null) => {
    const params = new URLSearchParams()
    if (a) params.set('a', a.id)
    if (b) params.set('b', b.id)
    const qs = params.toString()
    const newHash = qs ? `compare?${qs}` : 'compare'
    if (window.location.hash.slice(1) !== newHash) {
      history.replaceState(null, '', `#${newHash}`)
    }
  }, [])

  const handleSelectA = useCallback((entity: EntitySummary | null) => {
    abortA.current?.abort()
    setSelectedA(entity)
    if (entity) {
      const ctrl = new AbortController()
      abortA.current = ctrl
      setLoadingA(true)
      fetchEntityData(entity.id, ctrl.signal)
        .then(setDataA)
        .catch(() => { if (!ctrl.signal.aborted) setDataA(null) })
        .finally(() => { if (!ctrl.signal.aborted) setLoadingA(false) })
    } else {
      setDataA(null)
      setLoadingA(false)
    }
    updateUrl(entity, selectedB)
  }, [selectedB, updateUrl])

  const handleSelectB = useCallback((entity: EntitySummary | null) => {
    abortB.current?.abort()
    setSelectedB(entity)
    if (entity) {
      const ctrl = new AbortController()
      abortB.current = ctrl
      setLoadingB(true)
      fetchEntityData(entity.id, ctrl.signal)
        .then(setDataB)
        .catch(() => { if (!ctrl.signal.aborted) setDataB(null) })
        .finally(() => { if (!ctrl.signal.aborted) setLoadingB(false) })
    } else {
      setDataB(null)
      setLoadingB(false)
    }
    updateUrl(selectedA, entity)
  }, [selectedA, updateUrl])

  // Saved comparisons
  const canSave = selectedA && selectedB &&
    !savedList.some(s => (s.a.id === selectedA.id && s.b.id === selectedB.id) || (s.a.id === selectedB.id && s.b.id === selectedA.id))

  const handleSave = useCallback(() => {
    if (!selectedA || !selectedB) return
    const entry: SavedComparison = {
      a: { id: selectedA.id, name: selectedA.canonical_name, type: selectedA.type },
      b: { id: selectedB.id, name: selectedB.canonical_name, type: selectedB.type },
      savedAt: Date.now(),
    }
    const next = [entry, ...savedList].slice(0, 20)
    setSavedList(next)
    persistSaved(next)
  }, [selectedA, selectedB, savedList])

  const handleDeleteSaved = useCallback((idx: number) => {
    const next = savedList.filter((_, i) => i !== idx)
    setSavedList(next)
    persistSaved(next)
  }, [savedList])

  const handleLoadSaved = useCallback((s: SavedComparison) => {
    window.location.hash = `compare?a=${s.a.id}&b=${s.b.id}`
  }, [])

  const hasBoth = dataA && dataB

  return (
    <div className="h-screen flex overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto bg-background-light">
        <div className="max-w-6xl mx-auto px-6 py-6 flex flex-col gap-6">

          {/* Header */}
          <div>
            <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">compare_arrows</span>
              Compare Entities
            </h1>
            <p className="text-sm text-slate-500 mt-1">Select two entities to compare side by side</p>
          </div>

          {/* Selectors */}
          <div className={`${CARD} p-6`}>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <EntitySelector
                  selected={selectedA}
                  onSelect={handleSelectA}
                  label="Entity A"
                  accentColor={COLOR_A}
                  excludeId={selectedB?.id}
                  loading={loadingA}
                />
              </div>
              <div className="text-sm font-bold text-slate-300 shrink-0">vs</div>
              <div className="flex-1">
                <EntitySelector
                  selected={selectedB}
                  onSelect={handleSelectB}
                  label="Entity B"
                  accentColor={COLOR_B}
                  excludeId={selectedA?.id}
                  loading={loadingB}
                />
              </div>
            </div>
            {/* Save button */}
            {selectedA && selectedB && (
              <div className="mt-4 pt-4 border-t border-border-light flex items-center justify-end">
                <button
                  onClick={handleSave}
                  disabled={!canSave}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    canSave
                      ? 'bg-primary/10 text-primary hover:bg-primary/20'
                      : 'bg-slate-50 text-slate-300 cursor-not-allowed'
                  }`}
                >
                  <span className="material-symbols-outlined text-[16px]">
                    {canSave ? 'bookmark_add' : 'bookmark_added'}
                  </span>
                  {canSave ? 'Save comparison' : 'Saved'}
                </button>
              </div>
            )}
          </div>

          {/* Saved Comparisons */}
          {savedList.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-slate-500 mb-2 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px]">bookmarks</span>
                Saved Comparisons
              </h3>
              <div className="flex flex-wrap gap-2">
                {savedList.map((s, idx) => {
                  const isActive = selectedA?.id === s.a.id && selectedB?.id === s.b.id
                  return (
                    <div
                      key={`${s.a.id}-${s.b.id}`}
                      className={`group flex items-center gap-2 pl-3 pr-1.5 py-1.5 rounded-lg border text-sm transition-colors ${
                        isActive
                          ? 'bg-primary/5 border-primary/30 text-primary'
                          : 'bg-surface-light border-border-light hover:border-primary/30 cursor-pointer'
                      }`}
                    >
                      <button
                        className="flex items-center gap-2 min-w-0"
                        onClick={() => handleLoadSaved(s)}
                      >
                        <span className="size-2 rounded-full shrink-0" style={{ backgroundColor: COLOR_A }} />
                        <span className="font-medium truncate max-w-[100px]">{s.a.name}</span>
                        <span className="text-slate-300 text-xs">vs</span>
                        <span className="size-2 rounded-full shrink-0" style={{ backgroundColor: COLOR_B }} />
                        <span className="font-medium truncate max-w-[100px]">{s.b.name}</span>
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDeleteSaved(idx) }}
                        className="text-slate-300 hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100 shrink-0"
                        title="Remove"
                      >
                        <span className="material-symbols-outlined text-[14px]">close</span>
                      </button>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {loading && (
            <div className="flex items-center justify-center py-12 text-slate-400">
              <span className="material-symbols-outlined animate-spin text-[20px] mr-2">progress_activity</span>
              Loading...
            </div>
          )}

          {!loading && !hasBoth && (
            <div className="text-center py-16 text-slate-400">
              <span className="material-symbols-outlined text-[48px] mb-3 block opacity-30">compare_arrows</span>
              <p className="text-sm">
                {savedList.length > 0
                  ? 'Select a saved comparison or search for entities above'
                  : 'Select two entities above to start comparing'}
              </p>
            </div>
          )}

          {hasBoth && (
            <>
              {/* Trend Chart */}
              {(dataA.observations.length >= 2 || dataB.observations.length >= 2) && (
                <div className={`${CARD} p-6`}>
                  <CompareTrendChart
                    observationsA={dataA.observations}
                    observationsB={dataB.observations}
                    nameA={dataA.detail.canonical_name}
                    nameB={dataB.detail.canonical_name}
                  />
                </div>
              )}

              {/* Stats Comparison */}
              <div className={`${CARD} p-6`}>
                <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined text-slate-400 text-[20px]">analytics</span>
                  Key Metrics
                </h3>

                {/* Entity name headers */}
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex-1 text-right">
                    <span className="text-sm font-semibold" style={{ color: COLOR_A }}>{dataA.detail.canonical_name}</span>
                  </div>
                  <div className="w-20 shrink-0" />
                  <div className="flex-1">
                    <span className="text-sm font-semibold" style={{ color: COLOR_B }}>{dataB.detail.canonical_name}</span>
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  <StatBox label="Mentions" valueA={dataA.detail.stats.mention_count} valueB={dataB.detail.stats.mention_count} />
                  <StatBox
                    label="Sentiment"
                    valueA={dataA.detail.stats.avg_sentiment}
                    valueB={dataB.detail.stats.avg_sentiment}
                    format={n => (n * 10).toFixed(1)}
                  />
                  <StatBox label="Positive" valueA={dataA.detail.stats.positive_count} valueB={dataB.detail.stats.positive_count} />
                  <StatBox label="Negative" valueA={dataA.detail.stats.negative_count} valueB={dataB.detail.stats.negative_count} lowerIsBetter />
                  <StatBox label="Neutral" valueA={dataA.detail.stats.neutral_count} valueB={dataB.detail.stats.neutral_count} />
                </div>
              </div>

              {/* Aspects Side by Side */}
              <div className="grid grid-cols-2 gap-6">
                <div className={`${CARD} p-6`}>
                  <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <span className="size-2.5 rounded-full" style={{ backgroundColor: COLOR_A }} />
                    Top Aspects
                  </h3>
                  <AspectList
                    aspects={(dataA.detail.top_aspects ?? []).slice(0, 5)}
                    totalMentions={dataA.detail.stats.mention_count}
                  />
                </div>
                <div className={`${CARD} p-6`}>
                  <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <span className="size-2.5 rounded-full" style={{ backgroundColor: COLOR_B }} />
                    Top Aspects
                  </h3>
                  <AspectList
                    aspects={(dataB.detail.top_aspects ?? []).slice(0, 5)}
                    totalMentions={dataB.detail.stats.mention_count}
                  />
                </div>
              </div>

              {/* Recent Mentions Side by Side */}
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h3 className="text-base font-bold text-slate-900 mb-3 flex items-center gap-2">
                    <span className="size-2.5 rounded-full" style={{ backgroundColor: COLOR_A }} />
                    Recent Mentions
                  </h3>
                  <div className="flex flex-col gap-3">
                    {(dataA.detail.recent_mentions ?? []).slice(0, 3).map((m, i) => (
                      <MentionCard key={`a-${m.post_id}-${i}`} mention={m} />
                    ))}
                    {(dataA.detail.recent_mentions ?? []).length === 0 && (
                      <p className="text-sm text-slate-400 py-4">No mentions yet.</p>
                    )}
                  </div>
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 mb-3 flex items-center gap-2">
                    <span className="size-2.5 rounded-full" style={{ backgroundColor: COLOR_B }} />
                    Recent Mentions
                  </h3>
                  <div className="flex flex-col gap-3">
                    {(dataB.detail.recent_mentions ?? []).slice(0, 3).map((m, i) => (
                      <MentionCard key={`b-${m.post_id}-${i}`} mention={m} />
                    ))}
                    {(dataB.detail.recent_mentions ?? []).length === 0 && (
                      <p className="text-sm text-slate-400 py-4">No mentions yet.</p>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  )
}
