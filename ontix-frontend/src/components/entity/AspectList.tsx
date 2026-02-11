import type { AspectSummary } from '../../types'

// Bar color by sentiment: green for positive, red for negative, gray for neutral
function barColor(s: number): string {
  if (s >= 0.6) return 'bg-primary'
  if (s >= 0.4) return 'bg-amber-400'
  return 'bg-rose-400'
}

function barHoverColor(s: number): string {
  if (s >= 0.6) return 'group-hover:bg-[#006b5c]'
  if (s >= 0.4) return 'group-hover:bg-amber-600'
  return 'group-hover:bg-rose-600'
}

function barOpacity(rank: number): string {
  if (rank === 0) return ''
  if (rank === 1) return 'opacity-90'
  if (rank === 2) return 'opacity-75'
  return 'opacity-60'
}

interface AspectListProps {
  aspects: AspectSummary[]
  totalMentions?: number
  selectedAspect?: string
  onSelectAspect?: (aspect: string | null) => void
}

export function AspectList({ aspects, totalMentions, selectedAspect, onSelectAspect }: AspectListProps) {
  if (aspects.length === 0) {
    return <p className="text-sm text-slate-400 py-4">No aspects recorded yet.</p>
  }

  const total = totalMentions ?? aspects.reduce((s, a) => s + a.total, 0)

  return (
    <div className="grid gap-4">
      {aspects.map((a, i) => {
        const pct = total > 0 ? Math.round((a.total / total) * 100) : 0
        const widthPct = Math.max(pct, 4) // minimum width for visibility
        const color = barColor(a.avg_sentiment)
        const hover = barHoverColor(a.avg_sentiment)
        const opacity = barOpacity(i)
        const isSelected = selectedAspect === a.aspect

        return (
          <button
            key={a.aspect}
            className={`group text-left w-full rounded-lg transition-all ${
              isSelected
                ? 'ring-2 ring-primary/40 bg-primary/5 p-2 -m-2'
                : onSelectAspect ? 'cursor-pointer hover:bg-slate-50 p-2 -m-2' : ''
            }`}
            onClick={() => onSelectAspect?.(isSelected ? null : a.aspect)}
          >
            <div className="flex justify-between text-xs font-semibold mb-1.5">
              <span className={`flex items-center gap-1.5 ${isSelected ? 'text-primary' : 'text-slate-800'}`}>
                {isSelected && (
                  <span className="material-symbols-outlined text-[14px]">filter_alt</span>
                )}
                {a.aspect}
              </span>
              <span className="text-slate-400 tabular-nums">{a.total} · {pct}%</span>
            </div>
            <div className="h-8 w-full bg-slate-100 rounded-lg overflow-hidden relative flex items-center">
              <div
                className={`h-full ${color} ${hover} ${opacity} absolute top-0 left-0 rounded-lg transition-all duration-500 ease-out`}
                style={{ width: `${widthPct}%` }}
              />
              <span className="relative z-10 ml-3 text-xs font-semibold text-white drop-shadow-sm opacity-0 group-hover:opacity-100 transition-opacity tabular-nums">
                {a.total} mentions · {a.avg_sentiment.toFixed(2)} avg
              </span>
            </div>
          </button>
        )
      })}
    </div>
  )
}
