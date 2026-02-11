interface SentimentBarProps {
  positive: number
  negative: number
  neutral: number
  mixed?: number
}

export function SentimentBar({ positive, negative, neutral, mixed = 0 }: SentimentBarProps) {
  const total = positive + negative + neutral + mixed
  if (total === 0) return <div className="h-2.5 rounded-full bg-gray-100" />

  const pPct = (positive / total) * 100
  const nPct = (negative / total) * 100
  const mPct = (mixed / total) * 100
  // neutral fills the rest

  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-2.5 rounded-full bg-gray-100 overflow-hidden flex">
        {pPct > 0 && (
          <div
            className="h-full bg-emerald-400 transition-all duration-500"
            style={{ width: `${pPct}%` }}
            title={`Positive: ${positive}`}
          />
        )}
        {mPct > 0 && (
          <div
            className="h-full bg-amber-300 transition-all duration-500"
            style={{ width: `${mPct}%` }}
            title={`Mixed: ${mixed}`}
          />
        )}
        {nPct > 0 && (
          <div
            className="h-full bg-rose-400 transition-all duration-500"
            style={{ width: `${nPct}%` }}
            title={`Negative: ${negative}`}
          />
        )}
      </div>
      <div className="flex gap-3 text-xs text-slate-500 shrink-0">
        <span className="flex items-center gap-1">
          <span className="size-2 rounded-full bg-emerald-400" />Pos {positive}
        </span>
        <span className="flex items-center gap-1">
          <span className="size-2 rounded-full bg-gray-300" />Neu {neutral}
        </span>
        <span className="flex items-center gap-1">
          <span className="size-2 rounded-full bg-rose-400" />Neg {negative}
        </span>
      </div>
    </div>
  )
}
