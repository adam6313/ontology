import { useState, useEffect } from 'react'
import { Sparkline } from './Sparkline'
import type { ApiResponse, KOLAttribution } from '../../types'

const RANK_COLORS = ['bg-yellow-400', 'bg-slate-300', 'bg-amber-600']
const AVATAR_COLORS = [
  'bg-blue-500', 'bg-emerald-500', 'bg-violet-500', 'bg-rose-500',
  'bg-amber-500', 'bg-teal-500', 'bg-indigo-500', 'bg-pink-500',
]

function avatarColor(name: string): string {
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash)
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length]
}

function initial(name: string): string {
  if (!name) return '?'
  if (/[\u4e00-\u9fff\u3400-\u4dbf]/.test(name)) return name.charAt(0)
  return name.charAt(0).toUpperCase()
}

const RELATION_BADGE: Record<string, { label: string; style: string }> = {
  endorses: { label: 'Endorses', style: 'bg-blue-50 text-blue-600 border-blue-200' },
  founded: { label: 'Founded', style: 'bg-purple-50 text-purple-600 border-purple-200' },
  co_mentioned: { label: 'Co-mentioned', style: 'bg-slate-50 text-slate-500 border-slate-200' },
}

interface KOLAttributionPanelProps {
  entityId: string
}

export function KOLAttributionPanel({ entityId }: KOLAttributionPanelProps) {
  const [items, setItems] = useState<KOLAttribution[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    fetch(`/api/entities/${entityId}/kol-attribution?limit=10`)
      .then(r => r.ok ? r.json() : { data: [] })
      .then((res: ApiResponse<KOLAttribution[]>) => setItems(res.data ?? []))
      .finally(() => setLoading(false))
  }, [entityId])

  if (loading) {
    return (
      <div className="animate-pulse flex flex-col gap-3">
        <div className="h-5 w-32 bg-slate-100 rounded" />
        {[1, 2, 3].map(i => (
          <div key={i} className="h-14 bg-slate-50 rounded-lg" />
        ))}
      </div>
    )
  }

  if (items.length === 0) return null

  const maxCount = items[0]?.co_mention_count ?? 1

  return (
    <div>
      <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
        <span className="material-symbols-outlined text-primary">groups</span>
        KOL Impact
        <span className="text-sm font-normal text-slate-400">({items.length})</span>
      </h3>

      <div className="flex flex-col gap-2">
        {items.map((kol, i) => {
          const rel = RELATION_BADGE[kol.relation_type] ?? RELATION_BADGE.co_mentioned
          const sentColor = kol.avg_sentiment >= 0.7 ? 'text-green-600' : kol.avg_sentiment >= 0.4 ? 'text-amber-600' : 'text-red-600'

          return (
            <a
              key={kol.kol_id}
              href={`#entities/${kol.kol_id}`}
              className="flex items-center gap-3 p-3 hover:bg-slate-50 rounded-xl transition-colors group"
            >
              {/* Rank + Avatar */}
              <div className="relative shrink-0">
                <div className={`size-10 rounded-full ${avatarColor(kol.kol_name)} flex items-center justify-center text-white text-sm font-bold`}>
                  {initial(kol.kol_name)}
                </div>
                {i < 3 && (
                  <div className={`absolute -bottom-1 -right-1 ${RANK_COLORS[i]} text-[9px] font-bold size-4 flex items-center justify-center rounded-full text-white border-2 border-white`}>
                    {i + 1}
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-bold text-slate-900 truncate group-hover:text-primary transition-colors">
                    {kol.kol_name}
                  </span>
                  <span className={`px-1.5 py-0.5 text-[10px] font-medium rounded border ${rel.style}`}>
                    {rel.label}
                  </span>
                </div>

                {/* Contribution bar */}
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full transition-all"
                      style={{ width: `${Math.max((kol.co_mention_count / maxCount) * 100, 4)}%` }}
                    />
                  </div>
                  <span className="text-[11px] font-semibold text-primary tabular-nums shrink-0">
                    {kol.contribution_pct}%
                  </span>
                </div>

                {/* Stats row */}
                <div className="flex items-center gap-3 mt-1 text-[11px] text-slate-400">
                  <span className="tabular-nums">{kol.co_mention_count} co-mentions</span>
                  <span className={`tabular-nums font-medium ${sentColor}`}>
                    {(kol.avg_sentiment * 10).toFixed(1)} sent.
                  </span>
                </div>
              </div>

              {/* Sparkline */}
              {kol.sparkline.length >= 2 && (
                <div className="shrink-0">
                  <Sparkline data={kol.sparkline} width={64} height={24} />
                </div>
              )}
            </a>
          )
        })}
      </div>
    </div>
  )
}
