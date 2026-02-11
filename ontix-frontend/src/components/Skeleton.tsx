/** Base shimmer block */
function Sk({ className = '', style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <div
      className={`rounded-lg bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 bg-[length:200%_100%] animate-[shimmer_1.5s_ease-in-out_infinite] ${className}`}
      style={style}
    />
  )
}

const C = 'bg-surface-light rounded-2xl border border-border-light shadow-sm p-6'

// --- Pulse page skeleton ---

export function PulseSkeleton() {
  return (
    <div className="flex flex-col gap-8">
      {/* Signal Banner */}
      <Sk className="h-16 rounded-2xl" />

      {/* Trend Detection */}
      <section>
        <Sk className="h-6 w-40 mb-4" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[0, 1, 2, 3].map(i => (
            <div key={i} className={C}>
              <div className="flex justify-between mb-3">
                <Sk className="h-3 w-16" />
                <Sk className="h-5 w-12 rounded-full" />
              </div>
              <Sk className="h-6 w-28 mb-2" />
              <Sk className="h-3 w-20" />
            </div>
          ))}
        </div>
      </section>

      {/* Treemap */}
      <Sk className="h-[400px] rounded-2xl" />

      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[0, 1, 2].map(i => (
          <div key={i} className={`${C} flex items-center gap-4`}>
            <Sk className="size-12 rounded-full shrink-0" />
            <div className="flex-1">
              <Sk className="h-3 w-20 mb-2" />
              <Sk className="h-7 w-14" />
            </div>
          </div>
        ))}
      </div>

      {/* Entity Grid */}
      <section>
        <div className="flex items-center justify-between mb-5">
          <Sk className="h-6 w-36" />
          <Sk className="h-9 w-28 rounded-xl" />
        </div>
        <div className="flex gap-2 mb-5">
          {[0, 1, 2, 3, 4].map(i => (
            <Sk key={i} className="h-8 w-20 rounded-full" />
          ))}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[0, 1, 2, 3, 4, 5].map(i => (
            <div key={i} className={C}>
              <div className="flex justify-between mb-2">
                <Sk className="h-5 w-24" />
                <Sk className="h-5 w-14 rounded-full" />
              </div>
              <Sk className="h-5 w-20 rounded-full mb-3" />
              <Sk className="h-3 w-full mb-1" />
              <Sk className="h-3 w-3/4 mb-4" />
              <div className="pt-3 border-t border-slate-100 flex justify-between">
                <Sk className="h-3 w-10" />
                <Sk className="h-1.5 w-16 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

// --- EntityProfile page skeleton ---

export function ProfileSkeleton() {
  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div>
        <Sk className="h-4 w-14 mb-5" />
        <div className="flex items-center gap-3 mb-2">
          <Sk className="h-9 w-48" />
          <Sk className="h-7 w-16 rounded-xl" />
        </div>
        <Sk className="h-4 w-36" />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-5">
        {[0, 1, 2, 3].map(i => (
          <div key={i} className={C}>
            <div className="flex justify-between mb-4">
              <Sk className="h-3 w-20" />
              <Sk className="size-9 rounded-xl" />
            </div>
            <Sk className="h-8 w-16 mb-2" />
            <Sk className="h-3 w-14" />
          </div>
        ))}
      </div>

      {/* Chart + Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-5">
        <div className={C}>
          <Sk className="h-5 w-40 mb-5" />
          <Sk className="h-44 rounded-lg" />
          <div className="flex gap-4 mt-4">
            <Sk className="h-3 w-14" />
            <Sk className="h-3 w-14" />
            <Sk className="h-3 w-14" />
          </div>
        </div>
        <div className={C}>
          <Sk className="h-5 w-24 mb-4" />
          <Sk className="h-2.5 w-full rounded-full mb-4" />
          <div className="flex gap-4">
            <Sk className="h-3 w-10" />
            <Sk className="h-3 w-10" />
            <Sk className="h-3 w-10" />
          </div>
        </div>
      </div>

      {/* Two columns */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8">
        <div className="flex flex-col gap-8">
          <div className={C}>
            <Sk className="h-5 w-20 mb-5" />
            {[0, 1, 2, 3, 4].map(i => (
              <div key={i} className="flex items-center gap-4 mb-3">
                <Sk className="h-4 w-24 shrink-0" />
                <Sk className="h-5 flex-1" />
                <Sk className="h-4 w-8 shrink-0" />
              </div>
            ))}
          </div>
          {[0, 1].map(i => (
            <div key={i} className="bg-surface-light rounded-xl border border-border-light p-4">
              <div className="flex justify-between mb-2">
                <Sk className="h-3 w-20" />
                <Sk className="h-3 w-14" />
              </div>
              <Sk className="h-3 w-full mb-1" />
              <Sk className="h-3 w-4/5 mb-3" />
              <div className="flex gap-1.5">
                <Sk className="h-5 w-16 rounded-full" />
                <Sk className="h-5 w-14 rounded-full" />
              </div>
            </div>
          ))}
        </div>
        <div className="flex flex-col gap-6">
          <div className={C}>
            <Sk className="h-5 w-24 mb-4" />
            <div className="flex flex-wrap gap-2">
              {[56, 44, 68, 52, 40, 64, 48, 36].map((w, i) => (
                <Sk key={i} className="h-7 rounded-full" style={{ width: w }} />
              ))}
            </div>
          </div>
          <div className={C}>
            <Sk className="h-5 w-20 mb-4" />
            {[0, 1, 2].map(i => (
              <div key={i} className="flex items-center gap-2 mb-2">
                <Sk className="h-3 w-3 rounded shrink-0" />
                <Sk className="h-4 w-28" />
                <Sk className="h-4 w-12 ml-auto rounded shrink-0" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// --- SemanticSearch page skeleton ---

export function SearchSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-8">
      <div className="flex flex-col gap-8">
        {/* Distribution */}
        <div className={C}>
          <div className="flex justify-between mb-5">
            <Sk className="h-5 w-40" />
            <Sk className="h-7 w-20" />
          </div>
          {[0, 1, 2, 3].map(i => (
            <div key={i} className="flex items-center gap-3 mb-3">
              <Sk className="h-3 w-16 shrink-0" />
              <Sk className="h-7 flex-1 rounded-lg" />
              <Sk className="h-3 w-8 shrink-0" />
            </div>
          ))}
        </div>
        {/* Entity list */}
        <div>
          <Sk className="h-5 w-36 mb-4" />
          {[0, 1, 2, 3, 4, 5].map(i => (
            <div key={i} className="flex items-center gap-3 px-4 py-3 mb-1">
              <Sk className="h-4 w-28" />
              <Sk className="h-4 w-12 rounded-full shrink-0" />
              <Sk className="h-3 w-8 ml-auto shrink-0" />
              <Sk className="h-1.5 w-10 rounded-full shrink-0" />
            </div>
          ))}
        </div>
      </div>
      <div className="flex flex-col gap-6">
        <div className={C}>
          <Sk className="h-4 w-20 mb-3" />
          <div className="flex flex-wrap gap-2">
            {[48, 56, 40, 52, 44, 60].map((w, i) => (
              <Sk key={i} className="h-6 rounded-full" style={{ width: w }} />
            ))}
          </div>
        </div>
        <div className={C}>
          <Sk className="h-4 w-24 mb-3" />
          {[0, 1, 2].map(i => (
            <div key={i} className="flex items-center gap-2 mb-2">
              <Sk className="h-3 w-3 shrink-0" />
              <Sk className="h-4 w-24" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// --- Inbox page skeleton ---

export function InboxSkeleton() {
  return (
    <div className="flex flex-col gap-3">
      {[0, 1, 2, 3, 4].map(i => (
        <div key={i} className="bg-surface-light rounded-2xl border border-border-light shadow-sm p-5 border-l-4 border-l-slate-200">
          <div className="flex items-start gap-3">
            <Sk className="size-6 rounded shrink-0" />
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Sk className="h-4 w-12 rounded" />
                <Sk className="h-4 w-10 rounded" />
                <Sk className="h-4 w-40" />
              </div>
              <Sk className="h-3 w-full mb-1" />
              <Sk className="h-3 w-3/4 mb-3" />
              <div className="flex items-center gap-3">
                <Sk className="h-3 w-16" />
                <Sk className="h-3 w-12" />
                <Sk className="h-3 w-20" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
