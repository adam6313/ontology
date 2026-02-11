import type { PeriodKey } from '../hooks/usePeriod'

interface PeriodSelectorProps {
  value: PeriodKey
  onChange: (p: PeriodKey) => void
}

const OPTIONS: { key: PeriodKey; label: string }[] = [
  { key: '', label: 'All' },
  { key: '1w', label: '1W' },
  { key: '4w', label: '4W' },
  { key: '12w', label: '12W' },
]

export function PeriodSelector({ value, onChange }: PeriodSelectorProps) {
  return (
    <div className="flex items-center bg-slate-100 rounded-xl p-0.5 gap-0.5">
      {OPTIONS.map(o => (
        <button
          key={o.key}
          onClick={() => onChange(o.key)}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
            value === o.key
              ? 'bg-white text-primary shadow-sm'
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}
