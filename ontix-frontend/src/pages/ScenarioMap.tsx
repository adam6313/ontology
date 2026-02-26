import { useState, useEffect, useMemo } from 'react'
import { Sidebar } from '../components/Sidebar'
import type { ApiResponse, EntitySummary, GraphData, GraphEdge, InboxFact } from '../types'
import { TYPE_BADGE } from '../constants'
import { DEMO_ID } from '../demo-context'

const CARD = 'bg-surface-light rounded-2xl border border-border-light shadow-sm'

// Scenario → sub-needs → product mapping
interface ScenarioNeed {
  label: string
  icon: string
  productId: string | null
  productName: string | null
}

interface ScenarioData {
  id: string
  name: string
  icon: string
  mentionCount: number
  sentiment: number
  needs: ScenarioNeed[]
  covered: boolean
  opportunity: InboxFact | null
}

// --- TWM scenario data ---
const TWM_SCENARIO_NEEDS: Record<string, ScenarioNeed[]> = {
  s001: [
    { label: '上網需求', icon: 'wifi', productId: 'p002', productName: '出國漫遊日租 $219/日' },
    { label: '通話需求', icon: 'call', productId: 'p006', productName: '國際通話加值包' },
    { label: '導航翻譯', icon: 'translate', productId: null, productName: null },
    { label: '打卡分享', icon: 'share', productId: 'p001', productName: '5G $1399 不限速吃到飽' },
  ],
  s002: [
    { label: '影音串流', icon: 'live_tv', productId: 'p003', productName: 'myVideo 影音隨看' },
    { label: '高速上網', icon: 'speed', productId: 'p004', productName: '光纖寬頻 1G' },
    { label: '多裝置共享', icon: 'devices', productId: 'p005', productName: '家庭共享方案' },
  ],
  s003: [
    { label: '行動串流', icon: 'headphones', productId: 'p001', productName: '5G $1399 不限速吃到飽' },
    { label: '離線下載', icon: 'download', productId: null, productName: null },
    { label: '低延遲遊戲', icon: 'sports_esports', productId: 'p001', productName: '5G $1399 不限速吃到飽' },
  ],
  s004: [
    { label: '視訊會議', icon: 'video_call', productId: 'p004', productName: '光纖寬頻 1G' },
    { label: '行動備援', icon: 'cell_tower', productId: 'p001', productName: '5G $1399 不限速吃到飽' },
    { label: 'VPN 穩定', icon: 'vpn_lock', productId: null, productName: null },
  ],
  s005: [
    { label: '即時監控', icon: 'videocam', productId: 'p008', productName: 'IoT 居家監控方案' },
    { label: '雲端儲存', icon: 'cloud', productId: null, productName: null },
    { label: '遠端餵食', icon: 'pets', productId: null, productName: null },
  ],
  s006: [
    { label: '低月租上網', icon: 'school', productId: 'p009', productName: '4G $499 輕速吃到飽' },
    { label: '流量共享', icon: 'group', productId: 'p005', productName: '家庭共享方案' },
    { label: '串流影音', icon: 'movie', productId: 'p003', productName: 'myVideo 影音隨看' },
  ],
  s007: [
    { label: '穩定上網', icon: 'wifi', productId: 'p004', productName: '光纖寬頻 1G' },
    { label: '兒童內容過濾', icon: 'family_restroom', productId: null, productName: null },
    { label: '線上課程串流', icon: 'cast_for_education', productId: 'p003', productName: 'myVideo 影音隨看' },
    { label: '家長監控', icon: 'shield', productId: null, productName: null },
  ],
  s008: [
    { label: '高速上行頻寬', icon: 'upload', productId: null, productName: null },
    { label: '固定 IP', icon: 'dns', productId: null, productName: null },
    { label: '行動直播', icon: 'videocam', productId: 'p001', productName: '5G $1399 不限速吃到飽' },
  ],
  s009: [
    { label: '大字體介面', icon: 'text_increase', productId: null, productName: null },
    { label: '詐騙防護', icon: 'security', productId: null, productName: null },
    { label: '視訊通話', icon: 'video_call', productId: 'p005', productName: '家庭共享方案' },
    { label: '低月租方案', icon: 'savings', productId: null, productName: null },
  ],
  s010: [
    { label: '山區收訊', icon: 'cell_tower', productId: null, productName: null },
    { label: '行動 WiFi', icon: 'wifi_tethering', productId: 'p001', productName: '5G $1399 不限速吃到飽' },
    { label: '緊急通訊', icon: 'sos', productId: null, productName: null },
  ],
}

const TWM_SCENARIO_ICONS: Record<string, string> = {
  s001: 'flight_takeoff',
  s002: 'weekend',
  s003: 'commute',
  s004: 'home_work',
  s005: 'pets',
  s006: 'school',
  s007: 'family_restroom',
  s008: 'live_tv',
  s009: 'elderly',
  s010: 'forest',
}

// --- Carrefour scenario data ---
const CARREFOUR_SCENARIO_NEEDS: Record<string, ScenarioNeed[]> = {
  s001: [
    { label: '消費者品牌名', icon: 'branding_watermark', productId: null, productName: null },
    { label: '法國供應鏈延續', icon: 'local_shipping', productId: 'p007', productName: '法國進口商品專區' },
    { label: '自有品牌重塑', icon: 'label', productId: 'p002', productName: '家樂福自有品牌' },
    { label: '消費者溝通管道', icon: 'campaign', productId: 'p006', productName: '家樂福 APP' },
    { label: '品牌轉型行銷', icon: 'trending_up', productId: null, productName: null },
  ],
  s002: [
    { label: '生鮮蔬果選購', icon: 'nutrition', productId: 'p004', productName: '生鮮蔬果區' },
    { label: '烘焙麵包體驗', icon: 'bakery_dining', productId: 'p001', productName: '法式烘焙（法棍/可頌）' },
    { label: '熟食即食', icon: 'restaurant', productId: 'p003', productName: '紅藜烤雞' },
    { label: 'DM 促銷優惠', icon: 'sell', productId: 'p009', productName: '量販促銷 DM' },
    { label: '家電日用補貨', icon: 'devices', productId: 'p011', productName: '家電 3C 區' },
  ],
  s003: [
    { label: '線上下單平台', icon: 'shopping_cart', productId: 'p005', productName: '家樂福線上購物' },
    { label: 'APP 操作體驗', icon: 'smartphone', productId: 'p006', productName: '家樂福 APP' },
    { label: '生鮮冷鏈配送', icon: 'ac_unit', productId: null, productName: null },
    { label: '社區取貨點', icon: 'storefront', productId: null, productName: null },
  ],
  s004: [
    { label: '法棍 / 可頌 / 蝴蝶酥', icon: 'bakery_dining', productId: 'p001', productName: '法式烘焙（法棍/可頌）' },
    { label: '紅藜烤雞搭配', icon: 'lunch_dining', productId: 'p003', productName: '紅藜烤雞' },
    { label: '法國進口巧克力', icon: 'cake', productId: 'p007', productName: '法國進口商品專區' },
    { label: '有機甜品', icon: 'eco', productId: 'p012', productName: '有機/健康食品區' },
  ],
  s005: [
    { label: 'OPENPOINT 累點', icon: 'loyalty', productId: 'p008', productName: '家樂福聯名信用卡' },
    { label: '跨通路點數使用', icon: 'store', productId: null, productName: null },
    { label: '促銷折抵', icon: 'redeem', productId: 'p009', productName: '量販促銷 DM' },
    { label: '會員 APP 管理', icon: 'smartphone', productId: 'p006', productName: '家樂福 APP' },
  ],
  s006: [
    { label: '法國起司 / 火腿', icon: 'restaurant', productId: 'p007', productName: '法國進口商品專區' },
    { label: '紅酒選購', icon: 'wine_bar', productId: 'p015', productName: '酒類專區' },
    { label: '有機健康食材', icon: 'eco', productId: 'p012', productName: '有機/健康食品區' },
    { label: '異國調味料', icon: 'soup_kitchen', productId: null, productName: null },
  ],
  s007: [
    { label: '法國進口禮盒', icon: 'redeem', productId: 'p007', productName: '法國進口商品專區' },
    { label: '紅酒禮盒', icon: 'wine_bar', productId: 'p015', productName: '酒類專區' },
    { label: '年菜食材（烤雞）', icon: 'lunch_dining', productId: 'p003', productName: '紅藜烤雞' },
    { label: '生鮮年貨', icon: 'nutrition', productId: 'p004', productName: '生鮮蔬果區' },
  ],
  s008: [
    { label: '日用品囤貨', icon: 'shopping_cart', productId: 'p009', productName: '量販促銷 DM' },
    { label: '冷凍食品', icon: 'ac_unit', productId: 'p010', productName: '冷凍食品專區' },
    { label: '嬰幼兒用品', icon: 'child_care', productId: 'p013', productName: '嬰幼兒用品區' },
    { label: '寵物用品', icon: 'pets', productId: 'p014', productName: '寵物用品區' },
    { label: '線上訂購到府', icon: 'local_shipping', productId: 'p005', productName: '家樂福線上購物' },
  ],
}

const CARREFOUR_SCENARIO_ICONS: Record<string, string> = {
  s001: 'autorenew',
  s002: 'shopping_cart',
  s003: 'local_shipping',
  s004: 'bakery_dining',
  s005: 'loyalty',
  s006: 'language',
  s007: 'redeem',
  s008: 'family_restroom',
}

// --- Select based on DEMO_ID ---
const SCENARIO_NEEDS = DEMO_ID === 'carrefour' ? CARREFOUR_SCENARIO_NEEDS : TWM_SCENARIO_NEEDS
const SCENARIO_ICONS = DEMO_ID === 'carrefour' ? CARREFOUR_SCENARIO_ICONS : TWM_SCENARIO_ICONS

// Force layout for scenario graph
const GRAPH_W = 900
const GRAPH_H = 600

function scenarioForceLayout(
  scenarios: EntitySummary[],
  products: EntitySummary[],
  edges: GraphEdge[]
): Map<string, { x: number; y: number }> {
  const cx = GRAPH_W / 2, cy = GRAPH_H / 2
  const posMap = new Map<string, { id: string; x: number; y: number; vx: number; vy: number }>()

  // Scenarios on left, products on right
  scenarios.forEach((n, i) => {
    const y = (i / Math.max(1, scenarios.length - 1)) * (GRAPH_H - 160) + 80
    posMap.set(n.id, { id: n.id, x: cx - 200, y, vx: 0, vy: 0 })
  })
  products.forEach((n, i) => {
    const y = (i / Math.max(1, products.length - 1)) * (GRAPH_H - 160) + 80
    posMap.set(n.id, { id: n.id, x: cx + 200, y, vx: 0, vy: 0 })
  })

  const arr = Array.from(posMap.values())

  for (let iter = 0; iter < 80; iter++) {
    const alpha = 1 - iter / 80
    // Repulsion
    for (let i = 0; i < arr.length; i++) {
      for (let j = i + 1; j < arr.length; j++) {
        const a = arr[i], b = arr[j]
        const dx = a.x - b.x, dy = a.y - b.y
        const dist = Math.max(10, Math.sqrt(dx * dx + dy * dy))
        const f = (2000 * alpha) / (dist * dist)
        const fx = (dx / dist) * f, fy = (dy / dist) * f
        a.vx += fx; a.vy += fy; b.vx -= fx; b.vy -= fy
      }
    }
    // Attraction along edges
    for (const e of edges) {
      const a = posMap.get(e.source_id), b = posMap.get(e.target_id)
      if (!a || !b) continue
      const dx = b.x - a.x, dy = b.y - a.y
      const dist = Math.max(1, Math.sqrt(dx * dx + dy * dy))
      const f = (dist - 180) * 0.01 * alpha
      const fx = (dx / dist) * f, fy = (dy / dist) * f
      a.vx += fx; a.vy += fy; b.vx -= fx; b.vy -= fy
    }
    // Centering
    for (const p of arr) {
      p.vx += (cx - p.x) * 0.002 * alpha
      p.vy += (cy - p.y) * 0.002 * alpha
      p.x += p.vx; p.y += p.vy
      p.vx *= 0.5; p.vy *= 0.5
      p.x = Math.max(60, Math.min(GRAPH_W - 60, p.x))
      p.y = Math.max(60, Math.min(GRAPH_H - 60, p.y))
    }
  }

  const result = new Map<string, { x: number; y: number }>()
  for (const p of arr) result.set(p.id, { x: p.x, y: p.y })
  return result
}

export function ScenarioMap() {
  const [entities, setEntities] = useState<EntitySummary[]>([])
  const [signals, setSignals] = useState<InboxFact[]>([])
  const [graphData, setGraphData] = useState<GraphData | null>(null)
  const [loading, setLoading] = useState(true)
  const [expandedScenario, setExpandedScenario] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'cards' | 'graph'>('cards')

  useEffect(() => {
    Promise.all([
      fetch('/api/entities?limit=200').then(r => r.json()),
      fetch('/api/inbox?limit=50').then(r => r.json()),
      fetch('/api/graph').then(r => r.json()),
    ])
      .then(([entRes, inboxRes, graphRes]: [ApiResponse<EntitySummary[]>, ApiResponse<InboxFact[]>, ApiResponse<GraphData>]) => {
        setEntities(entRes.data ?? [])
        setSignals(inboxRes.data ?? [])
        setGraphData(graphRes.data ?? null)
      })
      .finally(() => setLoading(false))
  }, [])

  const scenarios = useMemo(() => entities.filter(e => e.type === 'scenario'), [entities])
  const products = useMemo(() => entities.filter(e => e.type === 'product'), [entities])

  const opportunityMap = useMemo(() => {
    const map = new Map<string, InboxFact>()
    for (const s of signals) {
      if (s.fact_type === 'opportunity') {
        map.set(s.object_id, s)
      }
    }
    return map
  }, [signals])

  const scenarioData = useMemo<ScenarioData[]>(() => {
    return scenarios.map(s => {
      const needs = SCENARIO_NEEDS[s.id] ?? []
      const coveredNeeds = needs.filter(n => n.productId !== null)
      const covered = coveredNeeds.length === needs.length && needs.length > 0
      return {
        id: s.id,
        name: s.canonical_name,
        icon: SCENARIO_ICONS[s.id] ?? 'explore',
        mentionCount: s.mention_count,
        sentiment: s.avg_sentiment,
        needs,
        covered,
        opportunity: opportunityMap.get(s.id) ?? null,
      }
    }).sort((a, b) => b.mentionCount - a.mentionCount)
  }, [scenarios, opportunityMap])

  // Graph data for visualization
  const graphPositions = useMemo(() => {
    if (!graphData) return new Map<string, { x: number; y: number }>()
    const scenarioNodes = graphData.nodes.filter(n => n.type === 'scenario')
    const productNodes = graphData.nodes.filter(n => n.type === 'product')
    const relevantEdges = graphData.edges.filter(e =>
      scenarioNodes.some(n => n.id === e.source_id) || productNodes.some(n => n.id === e.source_id)
    )
    return scenarioForceLayout(scenarioNodes, productNodes, relevantEdges)
  }, [graphData])

  const scenarioEdges = useMemo(() => {
    if (!graphData) return []
    return graphData.edges.filter(e => {
      const sNode = graphData.nodes.find(n => n.id === e.source_id)
      return sNode?.type === 'scenario'
    })
  }, [graphData])

  const totalUncovered = useMemo(() =>
    scenarioData.reduce((sum, s) => sum + s.needs.filter(n => n.productId === null).length, 0),
  [scenarioData])

  const totalOpportunities = useMemo(() =>
    signals.filter(s => s.fact_type === 'opportunity').length,
  [signals])

  if (loading) {
    return (
      <div className="h-screen flex overflow-hidden">
        <Sidebar />
        <main className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <div className="size-16 rounded-full border-2 border-primary/20" />
              <div className="absolute inset-0 size-16 rounded-full border-2 border-primary border-t-transparent animate-spin" />
            </div>
            <p className="text-sm text-slate-500">Loading scenario map...</p>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="h-screen flex overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-6xl mx-auto px-8 py-8 flex flex-col gap-6">
          {/* Header */}
          <div className="flex items-end justify-between">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">explore</span>
                Scenario Explorer
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                {DEMO_ID === 'carrefour' ? 'Consumer life scenarios mapped to Carrefour products' : 'Consumer life scenarios mapped to Taiwan Mobile products'}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setViewMode('cards')}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-1.5 ${
                  viewMode === 'cards' ? 'bg-primary text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">grid_view</span>
                Cards
              </button>
              <button
                onClick={() => setViewMode('graph')}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-1.5 ${
                  viewMode === 'graph' ? 'bg-primary text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">hub</span>
                Graph
              </button>
            </div>
          </div>

          {/* Summary stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className={`${CARD} p-5 flex items-center gap-4`}>
              <div className="bg-cyan-50 p-3 rounded-full text-cyan-600 shrink-0">
                <span className="material-symbols-outlined">explore</span>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Scenarios</p>
                <p className="text-2xl font-light text-slate-900">{scenarioData.length}</p>
              </div>
            </div>
            <div className={`${CARD} p-5 flex items-center gap-4`}>
              <div className="bg-emerald-50 p-3 rounded-full text-emerald-600 shrink-0">
                <span className="material-symbols-outlined">check_circle</span>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Covered</p>
                <p className="text-2xl font-light text-emerald-600">{scenarioData.filter(s => s.covered).length}</p>
              </div>
            </div>
            <div className={`${CARD} p-5 flex items-center gap-4`}>
              <div className="bg-red-50 p-3 rounded-full text-red-600 shrink-0">
                <span className="material-symbols-outlined">error_outline</span>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Gaps</p>
                <p className="text-2xl font-light text-red-600">{totalUncovered}</p>
              </div>
            </div>
            <div className={`${CARD} p-5 flex items-center gap-4`}>
              <div className="bg-amber-50 p-3 rounded-full text-amber-600 shrink-0">
                <span className="material-symbols-outlined">lightbulb</span>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Opportunities</p>
                <p className="text-2xl font-light text-amber-600">{totalOpportunities}</p>
              </div>
            </div>
          </div>

          {viewMode === 'cards' ? (
            /* Card View */
            <div className="flex flex-col gap-4">
              {scenarioData.map((scenario, i) => {
                const isExpanded = expandedScenario === scenario.id
                const uncoveredCount = scenario.needs.filter(n => n.productId === null).length
                const sentColor = scenario.sentiment >= 0.7 ? 'text-emerald-600' : scenario.sentiment >= 0.4 ? 'text-amber-600' : 'text-red-600'

                return (
                  <div
                    key={scenario.id}
                    className={`${CARD} overflow-hidden transition-all hover:shadow-md`}
                    style={{ animation: `cardIn 400ms ease-out ${i * 80}ms both` }}
                  >
                    {/* Scenario header */}
                    <button
                      onClick={() => setExpandedScenario(isExpanded ? null : scenario.id)}
                      className="w-full px-6 py-5 flex items-center gap-4 text-left hover:bg-slate-50/50 transition-colors"
                    >
                      <div className={`size-12 rounded-xl flex items-center justify-center shrink-0 ${
                        scenario.covered ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-500'
                      }`}>
                        <span className="material-symbols-outlined text-[24px]">{scenario.icon}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg font-bold text-slate-900">{scenario.name}</h3>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${TYPE_BADGE.scenario}`}>
                            scenario
                          </span>
                          {scenario.covered ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700">
                              covered
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-700">
                              {uncoveredCount} gap{uncoveredCount > 1 ? 's' : ''}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-slate-500 mt-0.5">
                          {scenario.mentionCount} mentions · Sentiment <span className={`font-semibold ${sentColor}`}>{Math.round(scenario.sentiment * 100)}%</span>
                        </p>
                      </div>
                      <span className={`material-symbols-outlined text-slate-400 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}>
                        expand_more
                      </span>
                    </button>

                    {/* Expanded needs */}
                    {isExpanded && (
                      <div className="border-t border-slate-100 px-6 py-4 animate-[fadeSlideIn_200ms_ease-out]">
                        <div className="flex flex-col gap-3">
                          {scenario.needs.map((need, j) => (
                            <div key={j} className="flex items-center gap-3">
                              <span className="material-symbols-outlined text-[18px] text-slate-400">{need.icon}</span>
                              <span className="text-sm font-medium text-slate-700 w-40 shrink-0">{need.label}</span>
                              <div className="flex-1 h-px bg-slate-200 mx-2" />
                              {need.productId ? (
                                <a
                                  href={`#entities/${need.productId}`}
                                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 text-sm font-medium hover:bg-emerald-100 transition-colors"
                                >
                                  <span className="material-symbols-outlined text-[16px]">check_circle</span>
                                  {need.productName}
                                </a>
                              ) : (
                                <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-50 text-red-600 text-sm font-medium">
                                  <span className="material-symbols-outlined text-[16px]">error_outline</span>
                                  uncovered
                                </span>
                              )}
                            </div>
                          ))}
                        </div>

                        {/* Opportunity signal if exists */}
                        {scenario.opportunity && (
                          <div className="mt-4 p-4 rounded-xl bg-gradient-to-r from-amber-50 to-white border border-amber-100">
                            <div className="flex items-start gap-2">
                              <span className="material-symbols-outlined text-amber-500 text-[20px] mt-0.5">lightbulb</span>
                              <div>
                                <h4 className="text-sm font-bold text-amber-800">{scenario.opportunity.title}</h4>
                                <p className="text-sm text-amber-700 mt-1">{scenario.opportunity.description}</p>
                              </div>
                            </div>
                          </div>
                        )}

                        <div className="mt-4 flex gap-2">
                          <a
                            href={`#entities/${scenario.id}`}
                            className="text-sm text-primary font-medium hover:text-primary-dark transition-colors flex items-center gap-1"
                          >
                            View scenario profile
                            <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                          </a>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          ) : (
            /* Graph View */
            <div className={`${CARD} overflow-hidden`} style={{ height: GRAPH_H + 40 }}>
              <div className="relative" style={{ width: '100%', height: GRAPH_H }}>
                <svg viewBox={`0 0 ${GRAPH_W} ${GRAPH_H}`} className="absolute inset-0 w-full h-full">
                  {/* Edges */}
                  {scenarioEdges.map((e, i) => {
                    const from = graphPositions.get(e.source_id)
                    const to = graphPositions.get(e.target_id)
                    if (!from || !to) return null
                    return (
                      <line
                        key={i}
                        x1={from.x} y1={from.y}
                        x2={to.x} y2={to.y}
                        stroke="#06b6d4"
                        strokeWidth={2}
                        opacity={0.4}
                      />
                    )
                  })}

                  {/* Scenario nodes */}
                  {scenarios.map(node => {
                    const pos = graphPositions.get(node.id)
                    if (!pos) return null
                    const hasOpportunity = opportunityMap.has(node.id)
                    const needsList = SCENARIO_NEEDS[node.id] ?? []
                    const isCovered = needsList.every(n => n.productId !== null) && needsList.length > 0
                    return (
                      <g key={node.id}>
                        <circle
                          cx={pos.x} cy={pos.y} r={32}
                          fill={isCovered ? '#ecfdf5' : '#fef2f2'}
                          stroke={isCovered ? '#10b981' : '#ef4444'}
                          strokeWidth={2.5}
                        />
                        {hasOpportunity && (
                          <circle
                            cx={pos.x + 24} cy={pos.y - 24} r={8}
                            fill="#f59e0b"
                            stroke="#fff"
                            strokeWidth={2}
                          />
                        )}
                        <text
                          x={pos.x} y={pos.y + 46}
                          textAnchor="middle"
                          className="text-[11px] font-semibold fill-slate-700"
                        >
                          {node.canonical_name}
                        </text>
                      </g>
                    )
                  })}

                  {/* Product nodes */}
                  {products.map(node => {
                    const pos = graphPositions.get(node.id)
                    if (!pos) return null
                    return (
                      <g key={node.id}>
                        <circle
                          cx={pos.x} cy={pos.y} r={24}
                          fill="#f5f3ff"
                          stroke="#a855f7"
                          strokeWidth={2}
                        />
                        <text
                          x={pos.x} y={pos.y + 38}
                          textAnchor="middle"
                          className="text-[10px] font-medium fill-slate-600"
                        >
                          {node.canonical_name.length > 10 ? node.canonical_name.slice(0, 10) + '...' : node.canonical_name}
                        </text>
                      </g>
                    )
                  })}
                </svg>

                {/* Legend */}
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-xl border border-slate-200/60 shadow-sm p-4">
                  <h4 className="text-[10px] font-bold text-slate-500 mb-2 uppercase tracking-wider">Legend</h4>
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                      <div className="size-4 rounded-full border-2 border-emerald-500 bg-emerald-50" />
                      <span className="text-[11px] text-slate-600">Covered Scenario</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="size-4 rounded-full border-2 border-red-500 bg-red-50" />
                      <span className="text-[11px] text-slate-600">Gap Scenario</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="size-4 rounded-full border-2 border-purple-500 bg-purple-50" />
                      <span className="text-[11px] text-slate-600">Product</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="size-3 rounded-full bg-amber-400" />
                      <span className="text-[11px] text-slate-600">Opportunity</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <svg width="24" height="2"><line x1="0" y1="1" x2="24" y2="1" stroke="#06b6d4" strokeWidth="2" /></svg>
                      <span className="text-[11px] text-slate-600">Needs</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Opportunities section */}
          {totalOpportunities > 0 && (
            <section>
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-4">
                <span className="material-symbols-outlined text-amber-500">lightbulb</span>
                Opportunity Signals
              </h3>
              <div className="flex flex-col gap-3">
                {signals.filter(s => s.fact_type === 'opportunity').map((sig, i) => (
                  <div
                    key={sig.id}
                    className={`${CARD} p-5 border-l-4 border-l-amber-400 bg-gradient-to-r from-amber-50/40 to-white hover:-translate-y-0.5 hover:shadow-md transition-all`}
                    style={{ animation: `cardIn 400ms ease-out ${i * 80}ms both` }}
                  >
                    <div className="flex items-start gap-3">
                      <span className="material-symbols-outlined text-amber-500 text-xl mt-0.5">lightbulb</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-700">opportunity</span>
                          <h4 className="font-semibold text-slate-900 text-sm">{sig.title}</h4>
                        </div>
                        <p className="text-sm text-slate-600">{sig.description}</p>
                        <div className="flex items-center gap-3 mt-3 text-xs text-slate-400">
                          <a href={`#entities/${sig.object_id}`} className="text-primary hover:underline font-medium">
                            {sig.entity_name}
                          </a>
                          <span>{sig.entity_type}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </main>
    </div>
  )
}
