import type { EntityObservation } from '../../types'

interface SentimentChartProps {
  observations: EntityObservation[]
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export function SentimentChart({ observations }: SentimentChartProps) {
  if (observations.length < 2) return null

  // Reverse to chronological order (API returns DESC)
  const data = [...observations].reverse()

  const maxTotal = Math.max(
    ...data.map(d => d.positive_count + d.negative_count + d.neutral_count + d.mixed_count),
    1,
  )

  const BAR_H = 176 // h-44 = 11rem = 176px

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2.5">
          <span className="material-symbols-outlined text-primary text-[20px]">bar_chart</span>
          Sentiment Over Time
        </h3>
        <span className="text-sm text-gray-400">Last {data.length} weeks</span>
      </div>

      {/* Chart */}
      <div className="flex items-end gap-1.5" style={{ height: BAR_H }}>
        {data.map((d, i) => {
          const total = d.positive_count + d.negative_count + d.neutral_count + d.mixed_count
          const barPx = Math.round((total / maxTotal) * BAR_H)
          const posPx = total > 0 ? Math.round((d.positive_count / total) * barPx) : 0
          const negPx = total > 0 ? Math.round((d.negative_count / total) * barPx) : 0
          const neuPx = Math.max(0, barPx - posPx - negPx)

          return (
            <div key={i} className="flex-1 flex flex-col justify-end group relative h-full">
              {/* Hover tooltip */}
              <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 hidden group-hover:block z-10 bg-slate-900 text-white text-[11px] rounded-lg px-3 py-2 whitespace-nowrap pointer-events-none shadow-lg">
                <p className="font-semibold mb-0.5">{formatDate(d.period_start)}</p>
                <p>Positive: {d.positive_count} &middot; Negative: {d.negative_count}</p>
                <p>Neutral: {d.neutral_count} &middot; Mixed: {d.mixed_count}</p>
              </div>
              {/* Stacked bar (pixel heights) */}
              {barPx > 0 && (
                <div className="w-full rounded-t-md overflow-hidden cursor-pointer transition-opacity hover:opacity-80">
                  {posPx > 0 && <div className="bg-primary/70 w-full" style={{ height: posPx }} />}
                  {neuPx > 0 && <div className="bg-primary/25 w-full" style={{ height: neuPx }} />}
                  {negPx > 0 && <div className="bg-rose-400/60 w-full" style={{ height: negPx }} />}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* X-axis labels (show first, middle, last) */}
      <div className="flex gap-1.5 mt-2">
        {data.map((d, i) => (
          <div key={i} className="flex-1 text-center">
            {(i === 0 || i === data.length - 1 || i === Math.floor(data.length / 2)) ? (
              <span className="text-[10px] text-gray-400">{formatDate(d.period_start)}</span>
            ) : null}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-5 mt-4 text-[11px] text-gray-500">
        <span className="flex items-center gap-1.5"><span className="size-2.5 rounded-sm bg-primary/70" /> Positive</span>
        <span className="flex items-center gap-1.5"><span className="size-2.5 rounded-sm bg-primary/25" /> Neutral</span>
        <span className="flex items-center gap-1.5"><span className="size-2.5 rounded-sm bg-rose-400/60" /> Negative</span>
      </div>
    </div>
  )
}
