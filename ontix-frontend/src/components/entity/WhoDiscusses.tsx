import type { DiscusserItem } from '../../types'

export function WhoDiscusses({ discussers }: { discussers: DiscusserItem[] }) {
  if (discussers.length === 0) return null

  return (
    <div>
      <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2.5">
        <span className="material-symbols-outlined text-orange-500 text-[20px]">group</span>
        Who Discusses
      </h3>
      <div className="flex flex-col gap-2">
        {discussers.map(d => {
          const sentPct = Math.round(d.avg_sentiment * 100)
          const sentColor = d.avg_sentiment >= 0.7 ? 'text-emerald-600' : d.avg_sentiment >= 0.4 ? 'text-amber-600' : 'text-red-600'
          const barColor = d.avg_sentiment >= 0.7 ? 'bg-emerald-400' : d.avg_sentiment >= 0.4 ? 'bg-amber-400' : 'bg-red-400'

          return (
            <a
              key={d.entity_id}
              href={`#entities/${d.entity_id}`}
              className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-slate-50 -mx-2 transition-colors group"
            >
              <span className="text-sm font-medium text-slate-900 group-hover:text-primary transition-colors truncate flex-1 min-w-0">
                {d.entity_name}
              </span>
              <span className="text-xs text-slate-500 tabular-nums shrink-0">
                {d.mention_count} posts
              </span>
              <div className="w-10 h-1.5 rounded-full bg-slate-100 overflow-hidden shrink-0">
                <div
                  className={`h-full rounded-full ${barColor}`}
                  style={{ width: `${sentPct}%` }}
                />
              </div>
              <span className={`text-[11px] font-bold tabular-nums shrink-0 ${sentColor}`}>
                {sentPct}%
              </span>
            </a>
          )
        })}
      </div>
    </div>
  )
}
