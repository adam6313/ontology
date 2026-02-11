import { useRef, useEffect, useCallback, useState } from 'react'
import {
  forceSimulation,
  forceLink,
  forceManyBody,
  forceCenter,
  forceCollide,
  type SimulationNodeDatum,
  type SimulationLinkDatum,
} from 'd3-force'
import type { GraphData, EntitySummary } from '../../types'

// --- Types ---

interface SimNode extends SimulationNodeDatum, EntitySummary {
  x: number
  y: number
  vx: number
  vy: number
}

interface SimLink extends SimulationLinkDatum<SimNode> {
  source: SimNode
  target: SimNode
  link_type: string
}

interface TooltipInfo {
  x: number
  y: number
  node: EntitySummary
}

interface EntityGraphProps {
  data: GraphData
  selectedTypes: string[]
  className?: string
}

// --- Constants ---

const TYPE_COLORS: Record<string, string> = {
  brand: '#3b82f6',
  product: '#a855f7',
  place: '#10b981',
  person: '#f97316',
  work: '#ec4899',
  event: '#eab308',
  organization: '#14b8a6',
}

const DEFAULT_COLOR = '#64748b'

// --- Component ---

export function EntityGraph({ data, selectedTypes, className }: EntityGraphProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const simRef = useRef<ReturnType<typeof forceSimulation<SimNode>> | null>(null)
  const nodesRef = useRef<SimNode[]>([])
  const linksRef = useRef<SimLink[]>([])
  const rafRef = useRef<number | undefined>(undefined)
  const dragRef = useRef<{ node: SimNode; startX: number; startY: number; dragged: boolean } | null>(null)
  const hoveredRef = useRef<SimNode | null>(null)
  const tickRef = useRef(0)

  const [tooltip, setTooltip] = useState<TooltipInfo | null>(null)

  const nodeRadius = useCallback((n: EntitySummary, maxMention: number) => {
    if (maxMention <= 0) return 8
    return 8 + Math.sqrt(n.mention_count / maxMention) * 24
  }, [])

  // Set up simulation when data changes
  useEffect(() => {
    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container) return

    const rect = container.getBoundingClientRect()
    const w = rect.width
    const h = 500
    const dpr = window.devicePixelRatio || 1
    canvas.width = w * dpr
    canvas.height = h * dpr
    canvas.style.width = `${w}px`
    canvas.style.height = `${h}px`

    // Filter nodes by type
    const filteredNodes = selectedTypes.length === 0
      ? data.nodes
      : data.nodes.filter(n => selectedTypes.includes(n.type))

    const nodeIdSet = new Set(filteredNodes.map(n => n.id))

    const simNodes: SimNode[] = filteredNodes.map(n => ({
      ...n,
      x: w / 2 + (Math.random() - 0.5) * w * 0.6,
      y: h / 2 + (Math.random() - 0.5) * h * 0.6,
      vx: 0,
      vy: 0,
    }))

    const nodeMap = new Map(simNodes.map(n => [n.id, n]))

    const simLinks: SimLink[] = data.edges
      .filter(e => nodeIdSet.has(e.source_id) && nodeIdSet.has(e.target_id))
      .map(e => ({
        source: nodeMap.get(e.source_id)!,
        target: nodeMap.get(e.target_id)!,
        link_type: e.link_type,
      }))

    nodesRef.current = simNodes
    linksRef.current = simLinks

    if (simRef.current) simRef.current.stop()

    const maxMention = simNodes.length > 0
      ? Math.max(...simNodes.map(n => n.mention_count))
      : 1

    const sim = forceSimulation(simNodes)
      .force('link', forceLink(simLinks)
        .id((d) => (d as SimNode).id)
        .distance(80)
        .strength(0.3))
      .force('charge', forceManyBody().strength(-120).distanceMax(300))
      .force('center', forceCenter(w / 2, h / 2))
      .force('collide', forceCollide<SimNode>()
        .radius(d => nodeRadius(d, maxMention) + 4)
        .strength(0.7))
      .alphaDecay(0.02)
      .velocityDecay(0.3)
      .on('tick', () => { /* render loop handles drawing */ })

    simRef.current = sim

    const ctx = canvas.getContext('2d')!
    tickRef.current = 0

    const render = () => {
      tickRef.current++
      const t = tickRef.current

      ctx.save()
      ctx.scale(dpr, dpr)

      // Transparent — let the glass card CSS show through
      ctx.clearRect(0, 0, w, h)

      // Draw edges — use source node color, subtle
      const breathAlpha = 0.18 + Math.sin(t * 0.03) * 0.06
      ctx.lineWidth = 1
      for (const link of linksRef.current) {
        const s = link.source
        const tg = link.target
        const color = TYPE_COLORS[s.type] || DEFAULT_COLOR
        ctx.beginPath()
        ctx.moveTo(s.x, s.y)
        ctx.lineTo(tg.x, tg.y)
        ctx.strokeStyle = hexAlpha(color, breathAlpha)
        ctx.stroke()
      }

      // Draw nodes
      const hovered = hoveredRef.current
      for (const node of nodesRef.current) {
        const r = nodeRadius(node, maxMention)
        const color = TYPE_COLORS[node.type] || DEFAULT_COLOR
        const isHovered = hovered?.id === node.id
        const drawR = isHovered ? r * 1.3 : r

        // Soft drop shadow
        ctx.save()
        ctx.shadowColor = hexAlpha(color, 0.25)
        ctx.shadowBlur = isHovered ? 24 : 12
        ctx.shadowOffsetY = 2
        ctx.beginPath()
        ctx.arc(node.x, node.y, drawR, 0, Math.PI * 2)
        ctx.fillStyle = color
        ctx.fill()
        ctx.restore()

        // Glass highlight
        const innerGrad = ctx.createRadialGradient(
          node.x - drawR * 0.3, node.y - drawR * 0.3, 0,
          node.x, node.y, drawR,
        )
        innerGrad.addColorStop(0, 'rgba(255, 255, 255, 0.45)')
        innerGrad.addColorStop(0.5, 'rgba(255, 255, 255, 0.08)')
        innerGrad.addColorStop(1, 'rgba(0, 0, 0, 0.04)')
        ctx.beginPath()
        ctx.arc(node.x, node.y, drawR, 0, Math.PI * 2)
        ctx.fillStyle = innerGrad
        ctx.fill()

        // Label (only for larger nodes)
        if (drawR > 14) {
          ctx.fillStyle = 'rgba(255, 255, 255, 0.95)'
          ctx.font = `600 ${Math.max(10, drawR / 2.5)}px -apple-system, "SF Pro Text", sans-serif`
          ctx.textAlign = 'center'
          ctx.textBaseline = 'middle'
          const label = node.canonical_name.length > 6 ? node.canonical_name.slice(0, 5) + '\u2026' : node.canonical_name
          ctx.fillText(label, node.x, node.y)
        }
      }

      ctx.restore()
      rafRef.current = requestAnimationFrame(render)
    }

    rafRef.current = requestAnimationFrame(render)

    return () => {
      sim.stop()
      if (rafRef.current !== undefined) cancelAnimationFrame(rafRef.current)
    }
  }, [data, selectedTypes, nodeRadius])

  // Resize observer
  useEffect(() => {
    const container = containerRef.current
    const canvas = canvasRef.current
    if (!container || !canvas) return

    const obs = new ResizeObserver(entries => {
      for (const entry of entries) {
        const w = entry.contentRect.width
        const h = 500
        const dpr = window.devicePixelRatio || 1
        canvas.width = w * dpr
        canvas.height = h * dpr
        canvas.style.width = `${w}px`
        canvas.style.height = `${h}px`
        const sim = simRef.current
        if (sim) {
          sim.force('center', forceCenter(w / 2, h / 2))
          sim.alpha(0.3).restart()
        }
      }
    })
    obs.observe(container)
    return () => obs.disconnect()
  }, [])

  // --- Mouse interactions ---

  const findNodeAt = useCallback((mx: number, my: number): SimNode | null => {
    const maxMention = nodesRef.current.length > 0
      ? Math.max(...nodesRef.current.map(n => n.mention_count))
      : 1
    for (let i = nodesRef.current.length - 1; i >= 0; i--) {
      const node = nodesRef.current[i]
      const r = nodeRadius(node, maxMention)
      const dx = mx - node.x
      const dy = my - node.y
      if (dx * dx + dy * dy < r * r) return node
    }
    return null
  }, [nodeRadius])

  const getMousePos = useCallback((e: React.MouseEvent<HTMLCanvasElement>): { x: number; y: number } => {
    const canvas = canvasRef.current!
    const rect = canvas.getBoundingClientRect()
    return { x: e.clientX - rect.left, y: e.clientY - rect.top }
  }, [])

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const { x, y } = getMousePos(e)
    const canvas = canvasRef.current!

    if (dragRef.current) {
      const d = dragRef.current
      const dx = x - d.startX
      const dy = y - d.startY
      if (dx * dx + dy * dy > 9) d.dragged = true
      d.node.fx = x
      d.node.fy = y
      simRef.current?.alpha(0.3).restart()
      return
    }

    const node = findNodeAt(x, y)
    hoveredRef.current = node
    canvas.style.cursor = node ? 'pointer' : 'default'

    if (node) {
      const containerRect = containerRef.current!.getBoundingClientRect()
      const canvasRect = canvas.getBoundingClientRect()
      setTooltip({
        x: canvasRect.left - containerRect.left + x,
        y: canvasRect.top - containerRect.top + y,
        node,
      })
    } else {
      setTooltip(null)
    }
  }, [findNodeAt, getMousePos])

  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const { x, y } = getMousePos(e)
    const node = findNodeAt(x, y)
    if (node) {
      dragRef.current = { node, startX: x, startY: y, dragged: false }
      node.fx = x
      node.fy = y
      simRef.current?.alphaTarget(0.3).restart()
    }
  }, [findNodeAt, getMousePos])

  const handleMouseUp = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const drag = dragRef.current
    if (!drag) return

    drag.node.fx = null
    drag.node.fy = null
    simRef.current?.alphaTarget(0)

    // Click = mousedown + mouseup without significant movement
    if (!drag.dragged) {
      const { x, y } = getMousePos(e)
      const node = findNodeAt(x, y)
      if (node) window.location.hash = `entities/${node.id}`
    }

    dragRef.current = null
  }, [findNodeAt, getMousePos])

  const handleMouseLeave = useCallback(() => {
    hoveredRef.current = null
    setTooltip(null)
    if (dragRef.current) {
      dragRef.current.node.fx = null
      dragRef.current.node.fy = null
      dragRef.current = null
      simRef.current?.alphaTarget(0)
    }
  }, [])

  const sentimentLabel = (s: number) => {
    if (s >= 0.7) return 'text-emerald-600'
    if (s >= 0.4) return 'text-amber-600'
    return 'text-rose-600'
  }

  if (data.nodes.length === 0) {
    return <p className={`text-sm text-slate-400 py-8 text-center ${className ?? ''}`}>No entities yet.</p>
  }

  return (
    <div
      ref={containerRef}
      className={`relative rounded-2xl overflow-hidden bg-white/60 backdrop-blur-xl backdrop-saturate-[180%] border border-white/50 shadow-[0_8px_32px_rgba(0,0,0,0.06),inset_0_1px_0_rgba(255,255,255,0.7)] ${className ?? ''}`}
    >
      <h3 className="text-sm font-semibold text-slate-700 px-5 pt-5">Entity Map</h3>

      <canvas
        ref={canvasRef}
        style={{ display: 'block', height: 500 }}
        onMouseMove={handleMouseMove}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
      />

      {/* HTML Tooltip */}
      {tooltip && (
        <div
          className="absolute pointer-events-none z-10 px-3 py-2 rounded-xl bg-white/80 backdrop-blur-md border border-white/50 shadow-lg text-xs text-slate-700"
          style={{
            left: tooltip.x + 16,
            top: tooltip.y - 8,
            transform: 'translateY(-100%)',
          }}
        >
          <div className="font-semibold text-sm mb-1 text-slate-800">{tooltip.node.canonical_name}</div>
          <div className="flex items-center gap-2 text-slate-500">
            <span
              className="inline-block size-2 rounded-full"
              style={{ backgroundColor: TYPE_COLORS[tooltip.node.type] || DEFAULT_COLOR }}
            />
            {tooltip.node.type}
            {tooltip.node.sub_type && <span className="text-slate-400">/ {tooltip.node.sub_type}</span>}
          </div>
          <div className="mt-1 text-slate-500">
            {tooltip.node.mention_count} mentions
            <span className="mx-1.5">|</span>
            <span className={sentimentLabel(tooltip.node.avg_sentiment)}>
              {tooltip.node.avg_sentiment.toFixed(2)}
            </span>
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="flex items-center justify-center gap-4 py-3 px-5 text-xs text-slate-400 border-t border-slate-200/50">
        {Object.entries(TYPE_COLORS).map(([type, color]) => (
          <span key={type} className="flex items-center gap-1.5">
            <span className="inline-block size-2.5 rounded-full" style={{ backgroundColor: color }} />
            {type}
          </span>
        ))}
        <span className="text-slate-300">|</span>
        <span>size = mentions</span>
        <span className="text-slate-300">|</span>
        <span>lines = relations</span>
      </div>
    </div>
  )
}

/** Convert hex color + alpha to rgba string */
function hexAlpha(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}
