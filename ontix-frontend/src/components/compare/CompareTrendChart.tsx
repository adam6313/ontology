import { useMemo, useState, useRef } from 'react'
import type { EntityObservation } from '../../types'

interface CompareTrendChartProps {
  observationsA: EntityObservation[]
  observationsB: EntityObservation[]
  nameA: string
  nameB: string
}

const MARGIN = { left: 40, right: 16, top: 16, bottom: 32 }
const CHART_W = 600
const CHART_H = 260
const INNER_W = CHART_W - MARGIN.left - MARGIN.right
const INNER_H = CHART_H - MARGIN.top - MARGIN.bottom
const COLOR_A = '#00a38d'
const COLOR_B = '#8b5cf6'

function formatDate(dateStr: string): string {
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function monotonePath(points: [number, number][]): string {
  if (points.length < 2) return ''
  const n = points.length
  const slopes: number[] = new Array(n)
  for (let i = 0; i < n - 1; i++) {
    slopes[i] = (points[i + 1][1] - points[i][1]) / (points[i + 1][0] - points[i][0])
  }
  slopes[n - 1] = slopes[n - 2]
  const t: number[] = new Array(n)
  t[0] = slopes[0]
  t[n - 1] = slopes[n - 2]
  for (let i = 1; i < n - 1; i++) {
    t[i] = slopes[i - 1] * slopes[i] <= 0 ? 0 : (slopes[i - 1] + slopes[i]) / 2
  }
  let d = `M${points[0][0]},${points[0][1]}`
  for (let i = 0; i < n - 1; i++) {
    const dx = (points[i + 1][0] - points[i][0]) / 3
    d += `C${points[i][0] + dx},${points[i][1] + t[i] * dx} ${points[i + 1][0] - dx},${points[i + 1][1] - t[i + 1] * dx} ${points[i + 1][0]},${points[i + 1][1]}`
  }
  return d
}

export function CompareTrendChart({ observationsA, observationsB, nameA, nameB }: CompareTrendChartProps) {
  const [hoverIdx, setHoverIdx] = useState<number | null>(null)
  const svgRef = useRef<SVGSVGElement>(null)

  const chartData = useMemo(() => {
    const dataA = [...observationsA].reverse()
    const dataB = [...observationsB].reverse()

    const allDates = new Set<string>()
    for (const d of dataA) allDates.add(d.period_start)
    for (const d of dataB) allDates.add(d.period_start)
    const sortedDates = [...allDates].sort()

    const xLabels = sortedDates.map(d => formatDate(d))
    const mapA = new Map(dataA.map(d => [d.period_start, d.mention_count]))
    const mapB = new Map(dataB.map(d => [d.period_start, d.mention_count]))

    return {
      xLabels,
      mentionsA: sortedDates.map(d => mapA.get(d) ?? 0),
      mentionsB: sortedDates.map(d => mapB.get(d) ?? 0),
    }
  }, [observationsA, observationsB])

  if (chartData.xLabels.length < 2) return null

  const n = chartData.xLabels.length
  const maxVal = Math.max(...chartData.mentionsA, ...chartData.mentionsB, 1)

  const xScale = (i: number) => MARGIN.left + (i / (n - 1)) * INNER_W
  const yScale = (v: number) => MARGIN.top + (1 - v / maxVal) * INNER_H

  const ptsA: [number, number][] = chartData.mentionsA.map((v, i) => [xScale(i), yScale(v)])
  const ptsB: [number, number][] = chartData.mentionsB.map((v, i) => [xScale(i), yScale(v)])

  const lineA = monotonePath(ptsA)
  const lineB = monotonePath(ptsB)
  const areaA = `${lineA}L${ptsA[ptsA.length - 1][0]},${MARGIN.top + INNER_H}L${ptsA[0][0]},${MARGIN.top + INNER_H}Z`
  const areaB = `${lineB}L${ptsB[ptsB.length - 1][0]},${MARGIN.top + INNER_H}L${ptsB[0][0]},${MARGIN.top + INNER_H}Z`

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!svgRef.current) return
    const rect = svgRef.current.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * CHART_W
    const idx = Math.round(((x - MARGIN.left) / INNER_W) * (n - 1))
    setHoverIdx(Math.max(0, Math.min(n - 1, idx)))
  }

  return (
    <div>
      <h3 className="text-base font-bold text-slate-900 flex items-center gap-2.5 mb-2">
        <span className="material-symbols-outlined text-primary text-[20px]">show_chart</span>
        Mention Trend
      </h3>

      <svg
        ref={svgRef}
        viewBox={`0 0 ${CHART_W} ${CHART_H}`}
        className="w-full"
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setHoverIdx(null)}
      >
        {/* Grid */}
        {[0, 0.25, 0.5, 0.75, 1].map(f => (
          <line key={f} x1={MARGIN.left} x2={CHART_W - MARGIN.right} y1={yScale(f * maxVal)} y2={yScale(f * maxVal)} stroke="#f1f5f9" />
        ))}

        {/* Areas */}
        <defs>
          <linearGradient id="cmp-a" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={COLOR_A} stopOpacity={0.1} />
            <stop offset="100%" stopColor={COLOR_A} stopOpacity={0} />
          </linearGradient>
          <linearGradient id="cmp-b" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={COLOR_B} stopOpacity={0.1} />
            <stop offset="100%" stopColor={COLOR_B} stopOpacity={0} />
          </linearGradient>
        </defs>
        <path d={areaA} fill="url(#cmp-a)" />
        <path d={areaB} fill="url(#cmp-b)" />

        {/* Lines */}
        <path d={lineA} fill="none" stroke={COLOR_A} strokeWidth={2} />
        <path d={lineB} fill="none" stroke={COLOR_B} strokeWidth={2} />

        {/* Y axis */}
        {[0, 0.25, 0.5, 0.75, 1].map(f => (
          <text key={f} x={MARGIN.left - 6} y={yScale(f * maxVal) + 4} textAnchor="end" fontSize={11} fill="#94a3b8">{Math.round(f * maxVal)}</text>
        ))}

        {/* X axis */}
        {chartData.xLabels.map((label, i) => {
          const show = n <= 8 || i % Math.ceil(n / 8) === 0 || i === n - 1
          if (!show) return null
          return <text key={i} x={xScale(i)} y={CHART_H - 6} textAnchor="middle" fontSize={11} fill="#94a3b8">{label}</text>
        })}

        {/* Hover */}
        {hoverIdx !== null && (
          <>
            <line x1={xScale(hoverIdx)} x2={xScale(hoverIdx)} y1={MARGIN.top} y2={MARGIN.top + INNER_H} stroke="#cbd5e1" strokeDasharray="4 2" />
            <circle cx={xScale(hoverIdx)} cy={ptsA[hoverIdx][1]} r={4} fill={COLOR_A} stroke="white" strokeWidth={2} />
            <circle cx={xScale(hoverIdx)} cy={ptsB[hoverIdx][1]} r={4} fill={COLOR_B} stroke="white" strokeWidth={2} />
            <g transform={`translate(${Math.min(xScale(hoverIdx) + 8, CHART_W - 140)}, ${MARGIN.top})`}>
              <rect x={0} y={0} width={130} height={48} rx={6} fill="white" stroke="#e2e8f0" />
              <text x={8} y={16} fontSize={11} fill="#64748b">{chartData.xLabels[hoverIdx]}</text>
              <text x={8} y={30} fontSize={11} fill={COLOR_A} fontWeight="bold">{nameA}: {chartData.mentionsA[hoverIdx]}</text>
              <text x={8} y={42} fontSize={11} fill={COLOR_B} fontWeight="bold">{nameB}: {chartData.mentionsB[hoverIdx]}</text>
            </g>
          </>
        )}
      </svg>

      {/* Legend */}
      <div className="flex items-center gap-4 mt-1 justify-center">
        <span className="flex items-center gap-1.5 text-xs text-slate-500">
          <span className="inline-block w-3 h-0.5 rounded" style={{ backgroundColor: COLOR_A }} />
          {nameA}
        </span>
        <span className="flex items-center gap-1.5 text-xs text-slate-500">
          <span className="inline-block w-3 h-0.5 rounded" style={{ backgroundColor: COLOR_B }} />
          {nameB}
        </span>
      </div>
    </div>
  )
}
