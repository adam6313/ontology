import type { TopicDistributionItem } from '../../types'

const CATEGORY_COLORS: Record<string, string> = {
  '美妝': 'bg-pink-100 text-pink-700',
  '穿搭': 'bg-purple-100 text-purple-700',
  '美食': 'bg-orange-100 text-orange-700',
  '旅遊': 'bg-blue-100 text-blue-700',
  '3C': 'bg-slate-100 text-slate-700',
  '生活': 'bg-green-100 text-green-700',
  '健身': 'bg-amber-100 text-amber-700',
  '寵物': 'bg-teal-100 text-teal-700',
  '其他': 'bg-gray-100 text-gray-600',
}

export function TopicDistribution({ topics }: { topics: TopicDistributionItem[] }) {
  if (topics.length === 0) return null

  const maxPct = Math.max(...topics.map(t => t.percentage), 1)

  return (
    <div>
      <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2.5">
        <span className="material-symbols-outlined text-indigo-500 text-[20px]">donut_large</span>
        Topic Distribution
      </h3>
      <div className="flex flex-col gap-3">
        {topics.map(topic => (
          <a
            key={topic.topic_id}
            href={`#entities/${topic.topic_id}`}
            className="group flex items-center gap-3 hover:bg-slate-50 rounded-lg px-2 py-1.5 -mx-2 transition-colors"
          >
            <span className="text-sm font-medium text-slate-900 group-hover:text-primary transition-colors w-24 truncate shrink-0">
              {topic.topic_name}
            </span>
            <div className="flex-1 h-2 rounded-full bg-slate-100 overflow-hidden">
              <div
                className="h-full rounded-full bg-indigo-400 transition-all"
                style={{ width: `${(topic.percentage / maxPct) * 100}%` }}
              />
            </div>
            <span className="text-xs font-bold text-slate-600 tabular-nums w-10 text-right shrink-0">
              {topic.percentage}%
            </span>
            {topic.category && (
              <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium shrink-0 ${CATEGORY_COLORS[topic.category] ?? CATEGORY_COLORS['其他']}`}>
                {topic.category}
              </span>
            )}
          </a>
        ))}
      </div>
    </div>
  )
}
