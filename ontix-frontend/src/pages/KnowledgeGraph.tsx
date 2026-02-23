import { useState, useEffect, useMemo, useRef, useCallback } from 'react'
import { Sidebar } from '../components/Sidebar'
import type { ApiResponse, GraphData, EntitySummary, GraphEdge } from '../types'
import { TYPE_BADGE } from '../constants'

const GRAPH_W = 1000
const GRAPH_H = 700

// --- Type icon mapping (Material Symbols) ---
const TYPE_ICON: Record<string, string> = {
  brand: 'storefront', product: 'inventory_2', place: 'location_on',
  person: 'person', work: 'movie', event: 'event', organization: 'corporate_fare',
  content_topic: 'tag', scenario: 'explore',
}

const NODE_BORDER: Record<string, string> = {
  brand: '#3b82f6', product: '#a855f7', place: '#10b981',
  person: '#f97316', work: '#ec4899', event: '#eab308', organization: '#14b8a6',
  content_topic: '#6366f1', scenario: '#06b6d4',
}

const TYPE_LABELS: Record<string, string> = {
  brand: 'Brand', product: 'Product', place: 'Place', person: 'Person',
  work: 'Work', event: 'Event', organization: 'Organization', content_topic: 'Topic',
  scenario: 'Scenario',
}

const LEGEND = [
  { color: '#10b981', label: 'Produces', dash: false },
  { color: '#ef4444', label: 'Competes', dash: true },
  { color: '#3b82f6', label: 'Location', dash: false },
  { color: '#f97316', label: 'Endorses', dash: false },
  { color: '#a855f7', label: 'Founded', dash: false },
  { color: '#06b6d4', label: 'Needs', dash: false },
]

function edgeStyle(linkType: string) {
  if (['produces', 'produced_by'].includes(linkType)) return { color: '#10b981', dash: '' }
  if (linkType === 'competes_with') return { color: '#ef4444', dash: '6 4' }
  if (linkType === 'located_at') return { color: '#3b82f6', dash: '' }
  if (['endorsed_by', 'endorses'].includes(linkType)) return { color: '#f97316', dash: '' }
  if (['founded', 'founded_by'].includes(linkType)) return { color: '#a855f7', dash: '' }
  if (['discusses', 'discussed_by'].includes(linkType)) return { color: '#6366f1', dash: '4 2' }
  if (['relevant_to', 'has_relevant_topic'].includes(linkType)) return { color: '#8b5cf6', dash: '' }
  if (['needs', 'needed_by'].includes(linkType)) return { color: '#06b6d4', dash: '' }
  if (['involves', 'involved_in'].includes(linkType)) return { color: '#f59e0b', dash: '4 2' }
  return { color: '#94a3b8', dash: '3 3' }
}

function nodeRadius(mentions: number, max: number): number {
  return 24 + (mentions / max) * 36
}

// --- Force-directed layout ---

function forceLayout(nodes: EntitySummary[], edges: GraphEdge[]): Map<string, { x: number; y: number }> {
  const cx = GRAPH_W / 2, cy = GRAPH_H / 2
  const connected = new Set<string>()
  for (const e of edges) { connected.add(e.source_id); connected.add(e.target_id) }

  const cNodes = nodes.filter(n => connected.has(n.id))
  const uNodes = nodes.filter(n => !connected.has(n.id))

  const posMap = new Map<string, { id: string; x: number; y: number; vx: number; vy: number }>()
  cNodes.forEach((n, i) => {
    const a = (i / Math.max(1, cNodes.length)) * Math.PI * 2
    const r = Math.min(GRAPH_W, GRAPH_H) * 0.25
    posMap.set(n.id, { id: n.id, x: cx + Math.cos(a) * r, y: cy + Math.sin(a) * r, vx: 0, vy: 0 })
  })

  const arr = Array.from(posMap.values())

  for (let iter = 0; iter < 120; iter++) {
    const alpha = 1 - iter / 120

    for (let i = 0; i < arr.length; i++) {
      for (let j = i + 1; j < arr.length; j++) {
        const a = arr[i], b = arr[j]
        const dx = a.x - b.x, dy = a.y - b.y
        const dist = Math.max(10, Math.sqrt(dx * dx + dy * dy))
        const f = (3000 * alpha) / (dist * dist)
        const fx = (dx / dist) * f, fy = (dy / dist) * f
        a.vx += fx; a.vy += fy; b.vx -= fx; b.vy -= fy
      }
    }

    for (const e of edges) {
      const a = posMap.get(e.source_id), b = posMap.get(e.target_id)
      if (!a || !b) continue
      const dx = b.x - a.x, dy = b.y - a.y
      const dist = Math.max(1, Math.sqrt(dx * dx + dy * dy))
      const f = (dist - 140) * 0.015 * alpha
      const fx = (dx / dist) * f, fy = (dy / dist) * f
      a.vx += fx; a.vy += fy; b.vx -= fx; b.vy -= fy
    }

    for (const p of arr) {
      p.vx += (cx - p.x) * 0.003 * alpha
      p.vy += (cy - p.y) * 0.003 * alpha
      p.x += p.vx; p.y += p.vy
      p.vx *= 0.6; p.vy *= 0.6
      p.x = Math.max(70, Math.min(GRAPH_W - 70, p.x))
      p.y = Math.max(70, Math.min(GRAPH_H - 70, p.y))
    }
  }

  const result = new Map<string, { x: number; y: number }>()
  for (const p of arr) result.set(p.id, { x: p.x, y: p.y })

  uNodes.forEach((n, i) => {
    const a = (i / Math.max(1, uNodes.length)) * Math.PI * 2 + 0.3
    const r = Math.min(GRAPH_W, GRAPH_H) * 0.42
    result.set(n.id, { x: cx + Math.cos(a) * r, y: cy + Math.sin(a) * r })
  })

  return result
}

// --- Quadratic bezier path ---
function bezierEdge(x1: number, y1: number, x2: number, y2: number): string {
  const mx = (x1 + x2) / 2
  const my = (y1 + y2) / 2
  // offset control point perpendicular to the line
  const dx = x2 - x1, dy = y2 - y1
  const len = Math.sqrt(dx * dx + dy * dy)
  const offset = Math.min(30, len * 0.12)
  const nx = -dy / (len || 1), ny = dx / (len || 1)
  const cx = mx + nx * offset
  const cy = my + ny * offset
  return `M ${x1} ${y1} Q ${cx} ${cy} ${x2} ${y2}`
}

// --- Delta trend helper ---
function deltaInfo(delta: number | null | undefined): { icon: string; color: string; label: string } {
  if (delta == null || delta === 0) return { icon: 'trending_flat', color: '#94a3b8', label: '—' }
  if (delta > 0) return { icon: 'trending_up', color: '#10b981', label: `+${delta}` }
  return { icon: 'trending_down', color: '#ef4444', label: `${delta}` }
}

// --- Component ---

export function KnowledgeGraph() {
  const [graphData, setGraphData] = useState<GraphData | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedNode, setSelectedNode] = useState<string | null>(null)
  const [hoveredNode, setHoveredNode] = useState<string | null>(null)
  const [typeFilter, setTypeFilter] = useState('')
  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [positions, setPositions] = useState(() => new Map<string, { x: number; y: number }>())

  // Drag state refs (canvas pan + node drag)
  const isPanning = useRef(false)
  const panStart = useRef({ x: 0, y: 0 })
  const panOrigin = useRef({ x: 0, y: 0 })
  const draggingNode = useRef<string | null>(null)
  const dragStartPos = useRef({ x: 0, y: 0 })
  const dragNodeOrigin = useRef({ x: 0, y: 0 })
  const didDrag = useRef(false)
  const DRAG_THRESHOLD = 4

  // Canvas pan handlers
  const onPointerDown = useCallback((e: React.PointerEvent) => {
    if ((e.target as HTMLElement).closest('[data-node]')) return
    isPanning.current = true
    panStart.current = { x: e.clientX, y: e.clientY }
    panOrigin.current = { ...pan }
    ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
  }, [pan])

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (isPanning.current) {
      const dx = e.clientX - panStart.current.x
      const dy = e.clientY - panStart.current.y
      setPan({ x: panOrigin.current.x + dx, y: panOrigin.current.y + dy })
      return
    }
    if (draggingNode.current) {
      const dx = (e.clientX - dragStartPos.current.x) / zoom
      const dy = (e.clientY - dragStartPos.current.y) / zoom
      if (!didDrag.current && Math.abs(dx) + Math.abs(dy) > DRAG_THRESHOLD) {
        didDrag.current = true
      }
      if (didDrag.current) {
        const nx = Math.max(30, Math.min(GRAPH_W - 30, dragNodeOrigin.current.x + dx))
        const ny = Math.max(30, Math.min(GRAPH_H - 30, dragNodeOrigin.current.y + dy))
        setPositions(prev => {
          const next = new Map(prev)
          next.set(draggingNode.current!, { x: nx, y: ny })
          return next
        })
      }
    }
  }, [zoom])

  const onPointerUp = useCallback(() => {
    isPanning.current = false
    draggingNode.current = null
  }, [])

  const onNodePointerDown = useCallback((e: React.PointerEvent, nodeId: string) => {
    e.stopPropagation()
    const pos = positions.get(nodeId)
    if (!pos) return
    draggingNode.current = nodeId
    dragStartPos.current = { x: e.clientX, y: e.clientY }
    dragNodeOrigin.current = { ...pos }
    didDrag.current = false
    ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
  }, [positions])

  useEffect(() => {
    fetch('/api/graph')
      .then(r => r.json())
      .then((res: ApiResponse<GraphData>) => setGraphData(res.data ?? null))
      .finally(() => setLoading(false))
  }, [])

  // Compute layout once when graphData loads
  useEffect(() => {
    if (!graphData) return
    setPositions(forceLayout(graphData.nodes, graphData.edges))
  }, [graphData])

  const maxMentions = useMemo(() => {
    if (!graphData) return 1
    return Math.max(...graphData.nodes.map(n => n.mention_count), 1)
  }, [graphData])

  const connectedIds = useMemo(() => {
    if (!graphData) return new Set<string>()
    const s = new Set<string>()
    for (const e of graphData.edges) { s.add(e.source_id); s.add(e.target_id) }
    return s
  }, [graphData])

  const neighborIds = useMemo(() => {
    if (!hoveredNode || !graphData) return new Set<string>()
    const s = new Set<string>([hoveredNode])
    for (const e of graphData.edges) {
      if (e.source_id === hoveredNode) s.add(e.target_id)
      if (e.target_id === hoveredNode) s.add(e.source_id)
    }
    return s
  }, [hoveredNode, graphData])

  const mostConnectedId = useMemo(() => {
    if (!graphData) return null
    const deg = new Map<string, number>()
    for (const e of graphData.edges) {
      deg.set(e.source_id, (deg.get(e.source_id) ?? 0) + 1)
      deg.set(e.target_id, (deg.get(e.target_id) ?? 0) + 1)
    }
    let best: string | null = null, bestD = 0
    for (const [id, d] of deg) { if (d > bestD) { bestD = d; best = id } }
    return best
  }, [graphData])

  const selectedEntity = useMemo(() => {
    if (!selectedNode || !graphData) return null
    return graphData.nodes.find(n => n.id === selectedNode) ?? null
  }, [selectedNode, graphData])

  const selectedConnections = useMemo(() => {
    if (!selectedNode || !graphData) return []
    const conns: Array<{ other: EntitySummary; linkType: string; direction: string }> = []
    for (const e of graphData.edges) {
      if (e.source_id !== selectedNode && e.target_id !== selectedNode) continue
      const isSource = e.source_id === selectedNode
      const otherId = isSource ? e.target_id : e.source_id
      const other = graphData.nodes.find(n => n.id === otherId)
      if (other) conns.push({ other, linkType: e.link_type, direction: isSource ? 'out' : 'in' })
    }
    return conns
  }, [selectedNode, graphData])

  const typeCounts = useMemo(() => {
    if (!graphData) return new Map<string, number>()
    const m = new Map<string, number>()
    for (const n of graphData.nodes) m.set(n.type, (m.get(n.type) ?? 0) + 1)
    return m
  }, [graphData])

  // Aspect count for hovered entity
  const hoveredAspectCount = useMemo(() => {
    if (!hoveredNode || !graphData) return 0
    const node = graphData.nodes.find(n => n.id === hoveredNode)
    return node?.aspect_count ?? 0
  }, [hoveredNode, graphData])

  function nOpacity(node: EntitySummary): number {
    if (typeFilter && node.type !== typeFilter) return 0.1
    if (hoveredNode && !neighborIds.has(node.id)) return 0.15
    return 1
  }

  function eOpacity(edge: GraphEdge): number {
    if (typeFilter) {
      const sn = graphData?.nodes.find(n => n.id === edge.source_id)
      const tn = graphData?.nodes.find(n => n.id === edge.target_id)
      if (sn?.type !== typeFilter && tn?.type !== typeFilter) return 0.05
    }
    if (hoveredNode) {
      return (edge.source_id === hoveredNode || edge.target_id === hoveredNode) ? 1 : 0.08
    }
    return 0.6
  }

  return (
    <div className="h-screen flex overflow-hidden">
      <Sidebar />
      <main className="flex-1 relative overflow-hidden bg-slate-50">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-full gap-4">
            <div className="relative">
              <div className="size-16 rounded-full border-2 border-primary/20" />
              <div className="absolute inset-0 size-16 rounded-full border-2 border-primary border-t-transparent animate-spin" />
              <div className="absolute inset-2 size-12 rounded-full border-2 border-primary/15 border-b-transparent animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }} />
            </div>
            <p className="text-sm text-slate-500">Loading knowledge graph...</p>
          </div>
        ) : (
          <>
            {/* Graph viewport */}
            <div
              className="absolute inset-0 flex items-center justify-center"
              style={{ cursor: isPanning.current ? 'grabbing' : 'grab' }}
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
              onPointerCancel={onPointerUp}
            >
              <div
                className="relative"
                style={{ width: GRAPH_W, height: GRAPH_H, transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`, transition: isPanning.current ? 'none' : 'transform 200ms' }}
              >
                {/* SVG Edges — quadratic bezier */}
                <svg viewBox={`0 0 ${GRAPH_W} ${GRAPH_H}`} className="absolute inset-0 w-full h-full pointer-events-none">
                  {graphData?.edges.map((e, i) => {
                    const from = positions.get(e.source_id), to = positions.get(e.target_id)
                    if (!from || !to) return null
                    const s = edgeStyle(e.link_type)
                    const isHover = hoveredNode && (e.source_id === hoveredNode || e.target_id === hoveredNode)
                    return (
                      <path
                        key={i}
                        d={bezierEdge(from.x, from.y, to.x, to.y)}
                        fill="none"
                        stroke={s.color}
                        strokeWidth={isHover ? 3 : 1.5}
                        strokeDasharray={s.dash}
                        opacity={eOpacity(e)}
                        style={{ transition: 'opacity 300ms, stroke-width 200ms' }}
                      />
                    )
                  })}
                </svg>

                {/* Nodes — white bg + colored border + icon */}
                {graphData?.nodes.map(node => {
                  const pos = positions.get(node.id)
                  if (!pos) return null
                  const isConn = connectedIds.has(node.id)
                  const r = isConn ? nodeRadius(node.mention_count, maxMentions) : 16
                  const isSel = node.id === selectedNode
                  const isHov = node.id === hoveredNode
                  const border = NODE_BORDER[node.type] ?? '#94a3b8'
                  const isCentral = node.id === mostConnectedId
                  const iconSize = r > 28 ? Math.round(r * 0.65) : 14
                  const opacity = nOpacity(node)
                  const delta = deltaInfo(node.mention_delta)

                  return (
                    <div
                      key={node.id}
                      className="absolute flex flex-col items-center"
                      style={{
                        left: pos.x - r, top: pos.y - r - 10,
                        width: r * 2,
                        zIndex: isHov ? 20 : isSel ? 15 : 10,
                        opacity,
                        transition: 'opacity 300ms',
                      }}
                    >
                      {/* Ripple ping for central node */}
                      {isCentral && (
                        <div
                          className="absolute rounded-full"
                          style={{
                            width: r * 2, height: r * 2,
                            top: 10,
                            border: `2px solid ${border}`,
                            animation: 'ripplePing 2.5s ease-out infinite',
                          }}
                        />
                      )}
                      {/* Circle */}
                      <div
                        data-node
                        className={`rounded-full flex items-center justify-center cursor-grab active:cursor-grabbing select-none shrink-0 ${
                          isCentral ? 'animate-[floatDelayed_5s_ease-in-out_infinite]' : ''
                        }`}
                        style={{
                          width: r * 2, height: r * 2,
                          background: '#ffffff',
                          border: `${isSel || isHov ? 3 : 2}px solid ${border}`,
                          boxShadow: isCentral
                            ? `0 0 20px ${border}55`
                            : (isSel || isHov) ? `0 0 20px ${border}45` : '0 1px 3px rgba(0,0,0,0.08)',
                          transform: isHov ? 'scale(1.12)' : isSel ? 'scale(1.06)' : 'scale(1)',
                          transition: 'transform 200ms, box-shadow 200ms, border-width 200ms',
                          touchAction: 'none',
                        }}
                        onPointerDown={(e) => onNodePointerDown(e, node.id)}
                        onPointerUp={() => {
                          if (!didDrag.current) setSelectedNode(isSel ? null : node.id)
                          draggingNode.current = null
                        }}
                        onMouseEnter={() => setHoveredNode(node.id)}
                        onMouseLeave={() => setHoveredNode(null)}
                      >
                        <span
                          className="material-symbols-outlined"
                          style={{ fontSize: iconSize, color: border }}
                        >
                          {TYPE_ICON[node.type] ?? 'circle'}
                        </span>
                      </div>
                      {/* Delta badge (top-right) */}
                      {isConn && r > 24 && node.mention_delta != null && node.mention_delta !== 0 && (
                        <div
                          className="absolute flex items-center gap-0.5 rounded-full px-1 py-0.5 pointer-events-none"
                          style={{
                            top: 4, right: -6,
                            background: '#fff',
                            border: `1.5px solid ${delta.color}`,
                            fontSize: 9, fontWeight: 700, color: delta.color,
                            lineHeight: 1,
                          }}
                        >
                          <span className="material-symbols-outlined" style={{ fontSize: 11, color: delta.color }}>{delta.icon}</span>
                          <span>{delta.label}</span>
                        </div>
                      )}
                      {/* Name label below node */}
                      {isConn && (
                        <span
                          className="mt-1 text-center leading-tight max-w-[80px] truncate pointer-events-none"
                          style={{ fontSize: r > 32 ? 11 : 9, color: '#475569', fontWeight: 600 }}
                        >
                          {node.canonical_name}
                        </span>
                      )}
                    </div>
                  )
                })}

                {/* Hover detail card */}
                {hoveredNode && !selectedNode && (() => {
                  const node = graphData?.nodes.find(n => n.id === hoveredNode)
                  const pos = positions.get(hoveredNode)
                  if (!node || !pos) return null
                  const r = connectedIds.has(node.id) ? nodeRadius(node.mention_count, maxMentions) : 16
                  const sentScore = Math.round(node.avg_sentiment * 100)
                  const sentColor = node.avg_sentiment >= 0.7 ? '#10b981' : node.avg_sentiment >= 0.4 ? '#eab308' : '#ef4444'
                  const neighborCount = neighborIds.size - 1
                  const hDelta = deltaInfo(node.mention_delta)
                  return (
                    <div
                      className="absolute z-30 w-[280px] rounded-2xl border border-white/60 pointer-events-none"
                      style={{
                        left: pos.x + r + 14,
                        top: pos.y - 40,
                        background: 'rgba(255,255,255,0.92)',
                        backdropFilter: 'blur(20px)',
                        boxShadow: '0 8px 32px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.6)',
                        animation: 'fadeSlideIn 200ms ease-out',
                      }}
                    >
                      <div className="p-4">
                        {/* Header */}
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2 min-w-0">
                            <span
                              className="material-symbols-outlined shrink-0"
                              style={{ fontSize: 18, color: NODE_BORDER[node.type] ?? '#94a3b8' }}
                            >
                              {TYPE_ICON[node.type] ?? 'circle'}
                            </span>
                            <span className="text-sm font-bold text-slate-900 truncate">{node.canonical_name}</span>
                            <span className={`px-1.5 py-0.5 rounded text-[9px] font-semibold border shrink-0 ${TYPE_BADGE[node.type] ?? 'bg-gray-100 text-gray-600 border-gray-200'}`}>
                              {TYPE_LABELS[node.type] ?? node.type}
                            </span>
                          </div>
                          <span className="text-xl font-light tabular-nums shrink-0" style={{ color: sentColor }}>
                            {sentScore}
                          </span>
                        </div>

                        {/* Stats row */}
                        <div className="flex gap-4 mb-3">
                          <div className="flex items-center gap-1.5 text-xs text-slate-500">
                            <span className="material-symbols-outlined text-[14px]">chat_bubble</span>
                            <span className="tabular-nums font-medium text-slate-700">{node.mention_count}</span>
                            <span>mentions</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-xs text-slate-500">
                            <span className="material-symbols-outlined text-[14px]">category</span>
                            <span className="tabular-nums font-medium text-slate-700">{hoveredAspectCount}</span>
                            <span>aspects</span>
                          </div>
                          {node.mention_delta != null && (
                            <div className="flex items-center gap-1 text-xs" style={{ color: hDelta.color }}>
                              <span className="material-symbols-outlined text-[14px]">{hDelta.icon}</span>
                              <span className="tabular-nums font-semibold">{hDelta.label}</span>
                            </div>
                          )}
                        </div>

                        {/* Sentiment bar */}
                        <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden mb-3">
                          <div
                            className="h-full rounded-full transition-all"
                            style={{ width: `${sentScore}%`, background: sentColor }}
                          />
                        </div>

                        {/* Links count */}
                        {neighborCount > 0 && (
                          <div className="flex items-center gap-1.5 text-xs text-slate-400">
                            <span className="material-symbols-outlined text-[13px]">link</span>
                            <span>{neighborCount} connection{neighborCount > 1 ? 's' : ''}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })()}
              </div>
            </div>

            {/* Floating: Title + Filters (glass style) */}
            <div className="absolute top-6 left-6 right-6 z-30 flex items-start justify-between pointer-events-none">
              <div className="pointer-events-auto">
                <h2 className="text-2xl font-bold text-slate-900 mb-1">Knowledge Graph</h2>
                <p className="text-sm text-slate-500 mb-3">Entity relationships and connections.</p>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setTypeFilter('')}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                      !typeFilter
                        ? 'bg-primary text-white shadow-sm'
                        : 'bg-white/90 backdrop-blur-sm text-slate-600 border border-slate-200/80 shadow-sm hover:bg-white'
                    }`}
                  >All ({graphData?.nodes.length ?? 0})</button>
                  {['brand', 'product', 'scenario', 'place', 'person', 'work', 'event', 'organization', 'content_topic'].filter(t => typeCounts.has(t)).map(t => (
                    <button
                      key={t}
                      onClick={() => setTypeFilter(typeFilter === t ? '' : t)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                        typeFilter === t
                          ? 'bg-primary text-white shadow-sm'
                          : 'bg-white/90 backdrop-blur-sm text-slate-600 border border-slate-200/80 shadow-sm hover:bg-white'
                      }`}
                    >{TYPE_LABELS[t]} ({typeCounts.get(t)})</button>
                  ))}
                </div>
              </div>

              {/* Legend */}
              <div className="bg-white/90 backdrop-blur-sm rounded-xl border border-slate-200/60 shadow-sm p-4 pointer-events-auto">
                <h4 className="text-[10px] font-bold text-slate-500 mb-2 uppercase tracking-wider">Legend</h4>
                <div className="flex flex-col gap-1.5">
                  {LEGEND.map(item => (
                    <div key={item.label} className="flex items-center gap-2">
                      <svg width="24" height="2">
                        <line x1="0" y1="1" x2="24" y2="1" stroke={item.color} strokeWidth="2" strokeDasharray={item.dash ? '4 3' : ''} />
                      </svg>
                      <span className="text-[11px] text-slate-600">{item.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Zoom controls — circular buttons */}
            <div className="absolute bottom-6 left-6 z-30 flex flex-col gap-2">
              <button
                onClick={() => setZoom(z => Math.min(2, z + 0.15))}
                className="w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm border border-slate-200/80 shadow-sm flex items-center justify-center hover:bg-white transition-all text-slate-600"
              >
                <span className="material-symbols-outlined text-[18px]">add</span>
              </button>
              <button
                onClick={() => setZoom(z => Math.max(0.4, z - 0.15))}
                className="w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm border border-slate-200/80 shadow-sm flex items-center justify-center hover:bg-white transition-all text-slate-600"
              >
                <span className="material-symbols-outlined text-[18px]">remove</span>
              </button>
              <button
                onClick={() => { setZoom(1); setPan({ x: 0, y: 0 }); setTypeFilter(''); setSelectedNode(null); setHoveredNode(null) }}
                className="w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm border border-slate-200/80 shadow-sm flex items-center justify-center hover:bg-white transition-all text-slate-600"
              >
                <span className="material-symbols-outlined text-[18px]">center_focus_strong</span>
              </button>
            </div>

            {/* Entity count */}
            <div className="absolute bottom-6 right-6 z-30 bg-white/80 backdrop-blur-sm rounded-lg px-3 py-1.5 text-xs text-slate-500 border border-slate-200/60">
              {connectedIds.size} connected · {(graphData?.nodes.length ?? 0) - connectedIds.size} peripheral · {graphData?.edges.length ?? 0} edges
            </div>

            {/* Selected node detail card (glass) */}
            {selectedEntity && (
              <div
                className="absolute top-20 right-6 z-30 w-80 rounded-2xl border border-white/60 overflow-hidden animate-[fadeSlideIn_200ms_ease-out]"
                style={{
                  background: 'rgba(255,255,255,0.92)',
                  backdropFilter: 'blur(20px)',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.6)',
                }}
              >
                <div className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <span className={`px-2 py-0.5 rounded-lg text-[10px] font-semibold border ${TYPE_BADGE[selectedEntity.type] ?? 'bg-gray-100 text-gray-600 border-gray-200'}`}>
                        {selectedEntity.type}
                      </span>
                      <h3 className="text-lg font-bold text-slate-900 mt-1.5">{selectedEntity.canonical_name}</h3>
                    </div>
                    <button onClick={() => setSelectedNode(null)} className="text-slate-400 hover:text-slate-600 transition-colors">
                      <span className="material-symbols-outlined text-[20px]">close</span>
                    </button>
                  </div>

                  <div className="flex gap-6 mb-4">
                    <div>
                      <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Mentions</p>
                      <p className="text-xl font-light text-slate-900 tabular-nums">{selectedEntity.mention_count}</p>
                    </div>
                    <div>
                      <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Sentiment</p>
                      <p className={`text-xl font-light tabular-nums ${
                        selectedEntity.avg_sentiment >= 0.7 ? 'text-emerald-600' : selectedEntity.avg_sentiment >= 0.4 ? 'text-amber-600' : 'text-red-600'
                      }`}>{Math.round(selectedEntity.avg_sentiment * 100)}</p>
                    </div>
                  </div>

                  <div className="h-2 rounded-full bg-slate-100 overflow-hidden mb-5">
                    <div
                      className={`h-full rounded-full ${
                        selectedEntity.avg_sentiment >= 0.7 ? 'bg-emerald-400' : selectedEntity.avg_sentiment >= 0.4 ? 'bg-amber-400' : 'bg-red-400'
                      }`}
                      style={{ width: `${Math.round(selectedEntity.avg_sentiment * 100)}%` }}
                    />
                  </div>

                  {selectedConnections.length > 0 && (
                    <div>
                      <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Connections</h4>
                      <div className="flex flex-col gap-0.5">
                        {selectedConnections.map((c, i) => {
                          const dotColor = NODE_BORDER[c.other.type] ?? '#94a3b8'
                          return (
                            <button
                              key={i}
                              onClick={() => setSelectedNode(c.other.id)}
                              className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-white/60 text-left transition-colors"
                            >
                              <span
                                className="w-2 h-2 rounded-full shrink-0"
                                style={{ background: dotColor }}
                              />
                              <span className="text-sm font-medium text-slate-700 truncate">{c.other.canonical_name}</span>
                              <span className="ml-auto text-[9px] text-slate-400">{c.linkType.replace(/_/g, ' ')}</span>
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  )}
                </div>
                <div className="border-t border-slate-100/60 p-4">
                  <a
                    href={`#entities/${selectedEntity.id}`}
                    className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary-dark transition-colors"
                  >
                    View Full Profile
                    <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                  </a>
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  )
}
