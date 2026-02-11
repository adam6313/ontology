import { useState, useRef } from 'react'
import { useEventMarkers } from '../../hooks/useEventMarkers'
import { EventMarkerOverlay } from './EventMarkerOverlay'
import { EventMarkerForm } from './EventMarkerForm'
import type { EntityObservation } from '../../types'

interface TrendChartProps {
  observations: EntityObservation[]
  entityId?: string
}

const MARGIN = { left: 48, right: 48, top: 16, bottom: 32 }
const CHART_W = 600
const CHART_H = 220
const INNER_W = CHART_W - MARGIN.left - MARGIN.right
const INNER_H = CHART_H - MARGIN.top - MARGIN.bottom
const MENTION_COLOR = '#00a38d'
const SENTIMENT_COLOR = '#8b5cf6'

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

function niceScale(max: number, ticks: number): number[] {
  if (max <= 0) return [0]
  const step = Math.ceil(max / ticks / Math.pow(10, Math.floor(Math.log10(max / ticks)))) * Math.pow(10, Math.floor(Math.log10(max / ticks)))
  const result: number[] = []
  for (let v = 0; v <= max + step * 0.5; v += step) result.push(Math.round(v))
  return result
}

export function TrendChart({ observations, entityId }: TrendChartProps) {
  const { markers, addMarker, removeMarker } = useEventMarkers(entityId)
  const [hoverIdx, setHoverIdx] = useState<number | null>(null)
  const svgRef = useRef<SVGSVGElement>(null)

  if (observations.length < 2) return null

  // observations already arrives in chronological order (oldest first)
  const data = observations
  const xLabels = data.map(d => formatDate(d.period_start))
  const mentions = data.map(d => d.mention_count)
  const sentiment = data.map(d => Math.round(d.avg_sentiment * 100))

  const maxMention = Math.max(...mentions, 1)
  const mentionTicks = niceScale(maxMention, 4)
  const mentionMax = mentionTicks[mentionTicks.length - 1]

  const latest = data[data.length - 1].mention_count
  const prev = data[data.length - 2].mention_count
  const delta = prev > 0 ? Math.round(((latest - prev) / prev) * 100) : (latest > 0 ? 100 : 0)

  const xScale = (i: number) => MARGIN.left + (i / (data.length - 1)) * INNER_W
  const yMention = (v: number) => MARGIN.top + (1 - v / mentionMax) * INNER_H
  const ySentiment = (v: number) => MARGIN.top + (1 - v / 100) * INNER_H

  const mentionPts: [number, number][] = mentions.map((v, i) => [xScale(i), yMention(v)])
  const sentimentPts: [number, number][] = sentiment.map((v, i) => [xScale(i), ySentiment(v)])

  const mentionLine = monotonePath(mentionPts)
  const mentionArea = `${mentionLine}L${mentionPts[mentionPts.length - 1][0]},${MARGIN.top + INNER_H}L${mentionPts[0][0]},${MARGIN.top + INNER_H}Z`
  const sentimentLine = monotonePath(sentimentPts)

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!svgRef.current) return
    const rect = svgRef.current.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * CHART_W
    const idx = Math.round(((x - MARGIN.left) / INNER_W) * (data.length - 1))
    setHoverIdx(Math.max(0, Math.min(data.length - 1, idx)))
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2.5">
          <span className="material-symbols-outlined text-primary text-[20px]">show_chart</span>
          Mention Trend
        </h3>
        <div className="flex items-center gap-3">
          {delta !== 0 && (
            <span className={`text-xs font-bold flex items-center gap-0.5 px-2 py-0.5 rounded-full ${
              delta > 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
            }`}>
              <span className="material-symbols-outlined text-[14px]">
                {delta > 0 ? 'trending_up' : 'trending_down'}
              </span>
              {delta > 0 ? '+' : ''}{delta}%
            </span>
          )}
          <span className="text-sm text-gray-400">Last {data.length} weeks</span>
        </div>
      </div>

      <div className="relative">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${CHART_W} ${CHART_H}`}
          className="w-full"
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setHoverIdx(null)}
        >
          {/* Grid lines */}
          {mentionTicks.map(v => (
            <line key={v} x1={MARGIN.left} x2={CHART_W - MARGIN.right} y1={yMention(v)} y2={yMention(v)} stroke="#f1f5f9" />
          ))}

          {/* Area fill */}
          <defs>
            <linearGradient id="mention-grad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={MENTION_COLOR} stopOpacity={0.12} />
              <stop offset="100%" stopColor={MENTION_COLOR} stopOpacity={0} />
            </linearGradient>
          </defs>
          <path d={mentionArea} fill="url(#mention-grad)" />

          {/* Lines */}
          <path d={mentionLine} fill="none" stroke={MENTION_COLOR} strokeWidth={2} />
          <path d={sentimentLine} fill="none" stroke={SENTIMENT_COLOR} strokeWidth={2} />

          {/* Left Y axis (mentions) */}
          {mentionTicks.map(v => (
            <text key={v} x={MARGIN.left - 6} y={yMention(v) + 4} textAnchor="end" fontSize={11} fill="#94a3b8">{v}</text>
          ))}

          {/* Right Y axis (sentiment) */}
          {[0, 25, 50, 75, 100].map(v => (
            <text key={v} x={CHART_W - MARGIN.right + 6} y={ySentiment(v) + 4} textAnchor="start" fontSize={11} fill="#94a3b8">{v}%</text>
          ))}

          {/* X axis */}
          {xLabels.map((label, i) => {
            const show = data.length <= 8 || i % Math.ceil(data.length / 8) === 0 || i === data.length - 1
            if (!show) return null
            return (
              <text key={i} x={xScale(i)} y={CHART_H - 6} textAnchor="middle" fontSize={11} fill="#94a3b8">{label}</text>
            )
          })}

          {/* Hover crosshair + tooltip */}
          {hoverIdx !== null && (
            <>
              <line x1={xScale(hoverIdx)} x2={xScale(hoverIdx)} y1={MARGIN.top} y2={MARGIN.top + INNER_H} stroke="#cbd5e1" strokeDasharray="4 2" />
              <circle cx={xScale(hoverIdx)} cy={mentionPts[hoverIdx][1]} r={4} fill={MENTION_COLOR} stroke="white" strokeWidth={2} />
              <circle cx={xScale(hoverIdx)} cy={sentimentPts[hoverIdx][1]} r={4} fill={SENTIMENT_COLOR} stroke="white" strokeWidth={2} />
              <g transform={`translate(${Math.min(xScale(hoverIdx) + 8, CHART_W - 130)}, ${Math.max(MARGIN.top, mentionPts[hoverIdx][1] - 44)})`}>
                <rect x={0} y={0} width={120} height={44} rx={6} fill="white" stroke="#e2e8f0" />
                <text x={8} y={16} fontSize={11} fill="#64748b">{xLabels[hoverIdx]}</text>
                <text x={8} y={30} fontSize={11} fill={MENTION_COLOR} fontWeight="bold">{mentions[hoverIdx]} mentions</text>
                <text x={8} y={40} fontSize={10} fill={SENTIMENT_COLOR}>{sentiment[hoverIdx]}% sentiment</text>
              </g>
            </>
          )}
        </svg>

        {/* Legend */}
        <div className="flex items-center gap-4 mt-1 justify-center">
          <span className="flex items-center gap-1.5 text-xs text-slate-500">
            <span className="inline-block w-3 h-0.5 rounded" style={{ backgroundColor: MENTION_COLOR }} />
            Mentions
          </span>
          <span className="flex items-center gap-1.5 text-xs text-slate-500">
            <span className="inline-block w-3 h-0.5 rounded" style={{ backgroundColor: SENTIMENT_COLOR }} />
            Sentiment %
          </span>
        </div>

        {markers.length > 0 && (
          <EventMarkerOverlay
            markers={markers}
            xDates={xLabels}
            margin={MARGIN}
            onRemove={removeMarker}
          />
        )}
      </div>

      {entityId && (
        <EventMarkerForm
          xDates={xLabels}
          markers={markers}
          onAdd={addMarker}
          onRemove={removeMarker}
        />
      )}
    </div>
  )
}
