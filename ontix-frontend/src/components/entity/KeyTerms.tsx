import type { AspectSummary } from '../../types'

interface KeyTermsProps {
  aspects: AspectSummary[]
  maxTerms?: number
}

export function KeyTerms({ aspects, maxTerms = 12 }: KeyTermsProps) {
  if (aspects.length === 0) return null

  const sorted = [...aspects].sort((a, b) => b.total - a.total).slice(0, maxTerms)
  const maxTotal = Math.max(...sorted.map(a => a.total), 1)

  return (
    <div>
      <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2.5">
        <span className="material-symbols-outlined text-primary text-[20px]">sell</span>
        Key Terms
      </h3>
      <div className="flex flex-wrap gap-2">
        {sorted.map(a => {
          const ratio = a.total / maxTotal
          const fontSize = 0.75 + ratio * 0.5 // 0.75rem to 1.25rem
          const color =
            a.avg_sentiment >= 0.6
              ? 'bg-primary/10 text-primary border-primary/20'
              : a.avg_sentiment <= 0.3
                ? 'bg-rose-50 text-rose-600 border-rose-100'
                : 'bg-gray-50 text-gray-600 border-gray-200'

          return (
            <span
              key={a.aspect}
              className={`inline-block px-3 py-1.5 rounded-full border font-medium cursor-default transition-all hover:shadow-sm hover:-translate-y-px hover:scale-[1.03] ${color}`}
              style={{ fontSize: `${fontSize}rem` }}
              title={`${a.aspect}: ${a.total} mentions, sentiment ${a.avg_sentiment.toFixed(2)}`}
            >
              {a.aspect}
            </span>
          )
        })}
      </div>
      {aspects.length > maxTerms && (
        <p className="text-sm text-primary font-medium mt-3">
          View all {aspects.length} terms
        </p>
      )}
    </div>
  )
}
