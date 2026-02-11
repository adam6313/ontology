import { useRef, useState, useEffect } from 'react'
import type { EventMarker } from '../../hooks/useEventMarkers'

interface EventMarkerOverlayProps {
  markers: EventMarker[]
  xDates: string[]
  margin: { left: number; right: number; top: number; bottom: number }
  onRemove: (id: string) => void
}

export function EventMarkerOverlay({ markers, xDates, margin, onRemove }: EventMarkerOverlayProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [width, setWidth] = useState(0)
  const [height, setHeight] = useState(0)

  useEffect(() => {
    if (!containerRef.current) return
    const ro = new ResizeObserver(entries => {
      const rect = entries[0].contentRect
      setWidth(rect.width)
      setHeight(rect.height)
    })
    ro.observe(containerRef.current)
    return () => ro.disconnect()
  }, [])

  if (markers.length === 0 || xDates.length < 2) return null

  const plotWidth = width - margin.left - margin.right
  const pointCount = xDates.length

  return (
    <div ref={containerRef} className="absolute inset-0 pointer-events-none">
      <svg width={width} height={height} className="absolute inset-0">
        {markers.map(m => {
          const dateIndex = xDates.indexOf(m.date)
          if (dateIndex < 0) return null
          const x = margin.left + (dateIndex / (pointCount - 1)) * plotWidth
          return (
            <g key={m.id}>
              <line
                x1={x} y1={margin.top} x2={x} y2={height - margin.bottom}
                stroke="#f59e0b" strokeWidth={1.5} strokeDasharray="4 3" opacity={0.7}
              />
              <foreignObject
                x={x - 50} y={2} width={100} height={24}
                className="pointer-events-auto overflow-visible"
              >
                <button
                  onClick={() => onRemove(m.id)}
                  className="mx-auto block max-w-full px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-semibold truncate hover:bg-amber-200 transition-colors border border-amber-200"
                  title={`Remove: ${m.label}`}
                >
                  {m.label}
                </button>
              </foreignObject>
            </g>
          )
        })}
      </svg>
    </div>
  )
}
