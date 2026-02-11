/**
 * Demo Mode — intercepts all /api/* fetch calls with rich mock data.
 * Import this file in main.tsx to activate: import './demo'
 * Delete the import to disable.
 */

import type {
  EntitySummary,
  EntityDetail,
  EntityDetailStats,
  EntityObservation,
  AspectSummary,
  MentionItem,
  LinkItem,
  InboxFact,
  DashboardResponse,
} from './types'

// ────────────────────────────────────────────
// 1. Entities (32 items across 7 types)
// ────────────────────────────────────────────

const ENTITIES: EntitySummary[] = [
  // Brands (8)
  { id: 'b001', canonical_name: '鬍子茶', type: 'brand', sub_type: 'tea_chain', mention_count: 89, aspect_count: 12, avg_sentiment: 0.72 },
  { id: 'b002', canonical_name: '茶湯會', type: 'brand', sub_type: 'tea_chain', mention_count: 67, aspect_count: 9, avg_sentiment: 0.65 },
  { id: 'b003', canonical_name: '迷客夏', type: 'brand', sub_type: 'tea_chain', mention_count: 54, aspect_count: 8, avg_sentiment: 0.78 },
  { id: 'b004', canonical_name: '春水堂', type: 'brand', sub_type: 'tea_chain', mention_count: 45, aspect_count: 7, avg_sentiment: 0.81 },
  { id: 'b005', canonical_name: 'CoCo都可', type: 'brand', sub_type: 'tea_chain', mention_count: 38, aspect_count: 6, avg_sentiment: 0.59 },
  { id: 'b006', canonical_name: '鮮茶道', type: 'brand', sub_type: 'tea_chain', mention_count: 32, aspect_count: 5, avg_sentiment: 0.71 },
  { id: 'b007', canonical_name: '大苑子', type: 'brand', sub_type: 'juice_chain', mention_count: 28, aspect_count: 5, avg_sentiment: 0.83 },
  { id: 'b008', canonical_name: '清心福全', type: 'brand', sub_type: 'tea_chain', mention_count: 22, aspect_count: 4, avg_sentiment: 0.67 },
  // Products (7)
  { id: 'p001', canonical_name: '木瓜牛奶', type: 'product', sub_type: 'beverage', mention_count: 42, aspect_count: 6, avg_sentiment: 0.31 },
  { id: 'p002', canonical_name: '珍珠奶茶', type: 'product', sub_type: 'beverage', mention_count: 76, aspect_count: 10, avg_sentiment: 0.74 },
  { id: 'p003', canonical_name: '芋泥鮮奶', type: 'product', sub_type: 'beverage', mention_count: 35, aspect_count: 5, avg_sentiment: 0.82 },
  { id: 'p004', canonical_name: '黑糖鮮奶', type: 'product', sub_type: 'beverage', mention_count: 29, aspect_count: 4, avg_sentiment: 0.69 },
  { id: 'p005', canonical_name: '抹茶拿鐵', type: 'product', sub_type: 'beverage', mention_count: 24, aspect_count: 4, avg_sentiment: 0.75 },
  { id: 'p006', canonical_name: '鐵觀音拿鐵', type: 'product', sub_type: 'beverage', mention_count: 18, aspect_count: 3, avg_sentiment: 0.68 },
  { id: 'p007', canonical_name: '楊枝甘露', type: 'product', sub_type: 'dessert', mention_count: 15, aspect_count: 3, avg_sentiment: 0.88 },
  // Places (5)
  { id: 'l001', canonical_name: 'Epoch新竹店', type: 'place', sub_type: 'venue', mention_count: 31, aspect_count: 5, avg_sentiment: 0.73 },
  { id: 'l002', canonical_name: '信義A13', type: 'place', sub_type: 'mall', mention_count: 25, aspect_count: 4, avg_sentiment: 0.79 },
  { id: 'l003', canonical_name: '西門旗艦店', type: 'place', sub_type: 'store', mention_count: 19, aspect_count: 3, avg_sentiment: 0.66 },
  { id: 'l004', canonical_name: '台中草悟道店', type: 'place', sub_type: 'store', mention_count: 14, aspect_count: 3, avg_sentiment: 0.71 },
  { id: 'l005', canonical_name: '板橋大遠百', type: 'place', sub_type: 'mall', mention_count: 11, aspect_count: 2, avg_sentiment: 0.77 },
  // Persons (5)
  { id: 'k001', canonical_name: 'Carol凱若', type: 'person', sub_type: 'kol', mention_count: 36, aspect_count: 5, avg_sentiment: 0.58 },
  { id: 'k002', canonical_name: '阿翰po影片', type: 'person', sub_type: 'kol', mention_count: 28, aspect_count: 4, avg_sentiment: 0.85 },
  { id: 'k003', canonical_name: '蔡阿嘎', type: 'person', sub_type: 'kol', mention_count: 22, aspect_count: 3, avg_sentiment: 0.72 },
  { id: 'k004', canonical_name: '千千進食中', type: 'person', sub_type: 'kol', mention_count: 19, aspect_count: 3, avg_sentiment: 0.91 },
  { id: 'k005', canonical_name: '古娃娃', type: 'person', sub_type: 'kol', mention_count: 15, aspect_count: 2, avg_sentiment: 0.78 },
  // Works (3)
  { id: 'w001', canonical_name: '黑曜光護髮', type: 'work', sub_type: 'product', mention_count: 20, aspect_count: 4, avg_sentiment: 0.45 },
  { id: 'w002', canonical_name: '想見你', type: 'work', sub_type: 'drama', mention_count: 16, aspect_count: 3, avg_sentiment: 0.92 },
  { id: 'w003', canonical_name: '華燈初上', type: 'work', sub_type: 'drama', mention_count: 12, aspect_count: 2, avg_sentiment: 0.79 },
  // Events (2)
  { id: 'e001', canonical_name: '台北茶飲節', type: 'event', sub_type: 'festival', mention_count: 18, aspect_count: 3, avg_sentiment: 0.84 },
  { id: 'e002', canonical_name: '夏季新品發表會', type: 'event', sub_type: 'launch', mention_count: 13, aspect_count: 2, avg_sentiment: 0.76 },
  // Organizations (2)
  { id: 'o001', canonical_name: '2006hairsalon', type: 'organization', sub_type: 'salon', mention_count: 17, aspect_count: 3, avg_sentiment: 0.62 },
  { id: 'o002', canonical_name: 'Bonsoy Australia', type: 'organization', sub_type: 'brand', mention_count: 8, aspect_count: 2, avg_sentiment: 0.55 },
]

// ────────────────────────────────────────────
// 2. Signals / Inbox Facts (20 items)
// ────────────────────────────────────────────

function isoDate(daysAgo: number): string {
  const d = new Date('2026-02-07T08:00:00Z')
  d.setDate(d.getDate() - daysAgo)
  return d.toISOString()
}

const SIGNALS: InboxFact[] = [
  // Critical (3)
  { id: 1, object_id: 'p001', entity_name: '木瓜牛奶', entity_type: 'product', fact_type: 'alert', severity: 'critical', title: '商品聲量驟降 -58.8%', description: '木瓜牛奶近一週提及量從 24 降至 10，跌幅超過警戒線。多則負評指出口感變化與品質不穩。', is_read: false, created_at: isoDate(0), period_start: '2026-02-03', period_type: 'week' },
  { id: 2, object_id: 'b001', entity_name: '鬍子茶', entity_type: 'brand', fact_type: 'alert', severity: 'critical', title: '競品茶湯會聲量急升 +900%', description: '茶湯會近週提及量暴增至 45 則，已超越鬍子茶同期表現，可能對品牌市場地位構成威脅。', is_read: false, created_at: isoDate(0), period_start: '2026-02-03', period_type: 'week' },
  { id: 3, object_id: 'w001', entity_name: '黑曜光護髮', entity_type: 'work', fact_type: 'risk_signal', severity: 'critical', title: '情感翻轉: 效果面向由正轉負', description: '「效果」面向情感分數從 0.72 驟降至 0.28，多位用戶反映使用後髮質受損，需立即關注。', is_read: false, created_at: isoDate(1), period_start: '2026-02-03', period_type: 'week' },
  // Warning (6)
  { id: 4, object_id: 'o001', entity_name: '2006hairsalon', entity_type: 'organization', fact_type: 'risk_signal', severity: 'warning', title: '創辦人 Carol凱若 聲量下滑 -21%', description: 'Carol凱若 作為品牌核心代言人，個人聲量持續下降恐連帶影響沙龍品牌形象與信任度。', is_read: false, created_at: isoDate(1), period_start: '2026-02-03', period_type: 'week' },
  { id: 5, object_id: 'b002', entity_name: '茶湯會', entity_type: 'brand', fact_type: 'trend', severity: 'warning', title: '新面向大量出現 (+3 個)', description: '本週新發現「季節限定」「外送包裝」「會員制度」三個面向，消費者關注範圍正在擴大。', is_read: false, created_at: isoDate(1), period_start: '2026-02-03', period_type: 'week' },
  { id: 6, object_id: 'o002', entity_name: 'Bonsoy Australia', entity_type: 'organization', fact_type: 'alert', severity: 'warning', title: '連續 2 週零提及 (沉默警報)', description: '品牌已連續兩週無社群討論，市場存在感急速下降，需重新評估行銷策略。', is_read: false, created_at: isoDate(2), period_start: '2026-02-03', period_type: 'week' },
  { id: 7, object_id: 'b005', entity_name: 'CoCo都可', entity_type: 'brand', fact_type: 'risk_signal', severity: 'warning', title: '情感分數連續低於警戒線 (0.59)', description: '品牌整體情感分數連續 3 週低於 0.6，負面評價集中在等候時間與服務態度。', is_read: false, created_at: isoDate(2), period_start: '2026-02-03', period_type: 'week' },
  { id: 8, object_id: 'k001', entity_name: 'Carol凱若', entity_type: 'person', fact_type: 'trend', severity: 'warning', title: '負面聲量佔比上升至 35%', description: '近期業配內容引發部分粉絲反感，品牌合作效益正在遞減，建議觀察後續趨勢。', is_read: false, created_at: isoDate(2), period_start: '2026-02-03', period_type: 'week' },
  { id: 9, object_id: 'l003', entity_name: '西門旗艦店', entity_type: 'place', fact_type: 'risk_signal', severity: 'warning', title: '服務負評增加 +40%', description: '「服務態度」和「等候時間」面向負面提及增加，多位顧客反映假日人手不足問題。', is_read: false, created_at: isoDate(3), period_start: '2026-02-03', period_type: 'week' },
  // Info (8)
  { id: 10, object_id: 'b003', entity_name: '迷客夏', entity_type: 'brand', fact_type: 'trend', severity: 'info', title: '穩定正面成長 +12%', description: '品牌聲量穩定上升，芋頭系列持續獲得正面評價，品牌形象健康。', is_read: false, created_at: isoDate(3), period_start: '2026-02-03', period_type: 'week' },
  { id: 11, object_id: 'p002', entity_name: '珍珠奶茶', entity_type: 'product', fact_type: 'trend', severity: 'info', title: '連續 4 週聲量穩居第一', description: '珍珠奶茶穩定維持最高討論度，正面情感佔比達 74%，為市場常青品類。', is_read: true, created_at: isoDate(4), period_start: '2026-02-03', period_type: 'week' },
  { id: 12, object_id: 'e001', entity_name: '台北茶飲節', entity_type: 'event', fact_type: 'trend', severity: 'info', title: '活動倒數帶動品牌討論', description: '茶飲節相關討論帶動多個品牌聲量同步提升，預計活動期間將出現聲量高峰。', is_read: true, created_at: isoDate(4), period_start: '2026-02-03', period_type: 'week' },
  { id: 13, object_id: 'b004', entity_name: '春水堂', entity_type: 'brand', fact_type: 'trend', severity: 'info', title: '文化形象持續強化', description: '「珍珠奶茶發源地」敘事帶動品牌正面形象，觀光客相關提及增加 18%。', is_read: true, created_at: isoDate(5), period_start: '2026-01-27', period_type: 'week' },
  { id: 14, object_id: 'p003', entity_name: '芋泥鮮奶', entity_type: 'product', fact_type: 'trend', severity: 'info', title: '新品帶動討論量 +25%', description: '迷客夏新推出的芋泥鮮奶系列獲得高度關注，多位 KOL 自發分享。', is_read: true, created_at: isoDate(5), period_start: '2026-01-27', period_type: 'week' },
  { id: 15, object_id: 'k002', entity_name: '阿翰po影片', entity_type: 'person', fact_type: 'trend', severity: 'info', title: '業配內容好評如潮', description: '阿翰為茶飲品牌拍攝的搞笑短影音獲 50 萬觀看，品牌關聯度極高。', is_read: true, created_at: isoDate(5), period_start: '2026-01-27', period_type: 'week' },
  { id: 16, object_id: 'k004', entity_name: '千千進食中', entity_type: 'person', fact_type: 'trend', severity: 'info', title: '正面形象穩定 (0.91)', description: '千千的美食評測持續維持高正面比例，觀眾信任度極佳。', is_read: true, created_at: isoDate(6), period_start: '2026-01-27', period_type: 'week' },
  { id: 17, object_id: 'p005', entity_name: '抹茶拿鐵', entity_type: 'product', fact_type: 'trend', severity: 'info', title: '冬季限定款表現亮眼', description: '抹茶拿鐵冬季限定引發日系風潮，「抹茶控」社群自發傳播力高。', is_read: true, created_at: isoDate(6), period_start: '2026-01-27', period_type: 'week' },
  // Insights (3)
  { id: 18, object_id: 'b001', entity_name: '鬍子茶', entity_type: 'brand', fact_type: 'insight', severity: 'info', title: '鬍子茶本週面臨雙重壓力', description: '核心商品木瓜牛奶聲量驟降 (-58.8%)，同時競品茶湯會社群聲量暴漲。建議立即檢視木瓜牛奶品質並觀察茶湯會行銷策略，以擬定應對方案。品牌整體情感仍維持正面 (0.72)，但需警惕趨勢轉變。', is_read: false, created_at: isoDate(0), period_start: '2026-02-03', period_type: 'week' },
  { id: 19, object_id: 'b002', entity_name: '茶湯會', entity_type: 'brand', fact_type: 'insight', severity: 'info', title: '茶湯會社群聲量迎來爆發期', description: '本週聲量較上週暴增 900%，主要來自季節限定新品話題。三個全新面向同步出現，顯示品牌正從「產品」向「體驗」維度擴展。建議密切追蹤消費者對會員制度的反應，這可能成為長期競爭優勢。', is_read: false, created_at: isoDate(0), period_start: '2026-02-03', period_type: 'week' },
  { id: 20, object_id: 'k001', entity_name: 'Carol凱若', entity_type: 'person', fact_type: 'insight', severity: 'info', title: 'Carol凱若品牌價值面臨轉折', description: '身為 2006hairsalon 核心代言人，近期聲量下滑 21% 且負面佔比升至 35%。主因為業配頻率過高引發粉絲反感。建議品牌端暫緩新業配，讓創作者回歸原生內容以修復信任度。', is_read: false, created_at: isoDate(1), period_start: '2026-02-03', period_type: 'week' },
]

// ────────────────────────────────────────────
// 3. Dashboard
// ────────────────────────────────────────────

const DASHBOARD: DashboardResponse = {
  stats: { total_posts: 1247, avg_sentiment: 0.68, total_sources: 12, period_label: 'Last 7 days' },
  entity_highlights: {
    most_mentioned: ENTITIES.slice().sort((a, b) => b.mention_count - a.mention_count).slice(0, 5),
    most_positive: ENTITIES.slice().sort((a, b) => b.avg_sentiment - a.avg_sentiment).slice(0, 5),
    most_negative: ENTITIES.slice().sort((a, b) => a.avg_sentiment - b.avg_sentiment).slice(0, 5),
  },
}

// ────────────────────────────────────────────
// 4. Observations (12 weeks per entity)
// ────────────────────────────────────────────

function weekDate(weeksAgo: number): string {
  const d = new Date('2026-02-03') // current week start
  d.setDate(d.getDate() - weeksAgo * 7)
  return d.toISOString().split('T')[0]
}

// Named patterns for key entities
const OBS_PATTERNS: Record<string, number[][]> = {
  // [mention_count, sentiment * 100] per week, index 0 = newest (DESC)
  b001: [[15,72],[14,74],[16,73],[13,75],[12,76],[14,78],[13,77],[11,79],[10,80],[9,78],[8,76],[7,74]], // stable high
  b002: [[45,65],[38,63],[25,61],[12,60],[8,58],[5,57],[4,56],[5,55],[3,54],[4,55],[3,53],[2,52]],     // explosive growth
  p001: [[10,31],[14,38],[18,42],[22,48],[24,55],[26,58],[28,62],[27,65],[25,68],[24,70],[22,72],[20,74]], // sharp decline
  p002: [[18,74],[17,75],[19,73],[16,76],[18,74],[20,72],[17,75],[19,73],[16,76],[18,74],[15,73],[14,72]], // stable king
  b003: [[14,78],[13,76],[12,77],[11,75],[10,74],[9,73],[8,72],[8,71],[7,70],[6,69],[5,68],[5,67]],     // steady growth
  o002: [[0,55],[0,55],[2,54],[3,56],[4,58],[5,60],[6,62],[5,61],[7,63],[6,64],[8,65],[7,63]],          // declining to zero
  k001: [[8,58],[10,62],[11,65],[12,68],[13,70],[14,72],[14,74],[13,75],[12,76],[11,78],[10,79],[9,80]], // declining
  w001: [[5,45],[6,48],[7,52],[8,55],[9,60],[10,65],[10,68],[9,72],[8,75],[7,78],[6,80],[5,82]],        // sentiment flip
}

function generateObservations(entityId: string, baseMentions: number, baseSentiment: number): EntityObservation[] {
  const pattern = OBS_PATTERNS[entityId]
  if (pattern) {
    return pattern.map((p, i) => {
      const mentions = p[0]
      const sentiment = p[1] / 100
      const pos = Math.round(mentions * sentiment)
      const neg = Math.round(mentions * (1 - sentiment) * 0.6)
      const neu = Math.max(0, mentions - pos - neg - Math.round(mentions * 0.05))
      const mix = Math.max(0, mentions - pos - neg - neu)
      return {
        period_start: weekDate(i),
        period_type: 'week',
        mention_count: mentions,
        avg_sentiment: sentiment,
        positive_count: pos,
        negative_count: neg,
        neutral_count: neu,
        mixed_count: mix,
      }
    })
  }

  // Generic pattern: gentle wave around base values
  return Array.from({ length: 12 }, (_, i) => {
    const wave = Math.sin(i * 0.6) * 0.15
    const mentions = Math.max(1, Math.round(baseMentions / 12 * (1 + wave + (11 - i) * 0.02)))
    const sentiment = Math.min(0.98, Math.max(0.1, baseSentiment + wave * 0.3))
    const pos = Math.round(mentions * sentiment)
    const neg = Math.round(mentions * (1 - sentiment) * 0.6)
    const neu = Math.max(0, mentions - pos - neg - 1)
    return {
      period_start: weekDate(i),
      period_type: 'week',
      mention_count: mentions,
      avg_sentiment: Math.round(sentiment * 100) / 100,
      positive_count: pos,
      negative_count: neg,
      neutral_count: Math.max(0, neu),
      mixed_count: Math.max(0, mentions - pos - neg - Math.max(0, neu)),
    }
  })
}

// ────────────────────────────────────────────
// 5. Entity Detail Generators
// ────────────────────────────────────────────

const ASPECT_POOL: Record<string, string[]> = {
  brand:        ['口味', '服務態度', '價格', '環境', 'CP值', '包裝設計', '外送品質', '排隊等候', '新品', '品牌形象', '甜度選擇', '食材'],
  product:      ['口感', '甜度', '價格', '份量', '外觀', '食材品質', '配料', '溫度', '濃度', '創意', '拍照打卡', '回購率'],
  place:        ['環境', '服務', '交通便利', '裝潢', '座位', '停車', '氛圍', '清潔', '空調', '音樂'],
  person:       ['內容品質', '真實性', '互動', '業配', '表達力', '專業度', '顏值', '人設', '頻率'],
  work:         ['效果', '成分', '持久度', '價格', '包裝', '氣味', '使用感', '安全性'],
  event:        ['活動內容', '組織安排', '場地', '價格', '體驗', '排隊', '紀念品'],
  organization: ['服務品質', '技術', '環境', '價格', '預約方便', '專業度', '衛生'],
}

function generateAspects(type: string, count: number, baseSentiment: number): AspectSummary[] {
  const pool = ASPECT_POOL[type] ?? ASPECT_POOL.brand
  return pool.slice(0, count).map((aspect, i) => {
    const total = Math.max(2, Math.round(20 - i * 2.5 + Math.sin(i) * 3))
    const sentiment = Math.min(0.98, Math.max(0.1, baseSentiment + (Math.cos(i * 1.3) * 0.25)))
    const pos = Math.round(total * sentiment)
    const neg = Math.round(total * (1 - sentiment) * 0.7)
    return { aspect, total, avg_sentiment: Math.round(sentiment * 100) / 100, positive_count: pos, negative_count: neg, neutral_count: Math.max(0, total - pos - neg) }
  })
}

const MENTION_POOL: Record<string, string[]> = {
  brand: [
    '今天去了{name}，環境很舒服，飲料也好喝！推薦給大家～ #奶茶控',
    '{name}新出的季節限定好好喝～每次路過都忍不住買一杯 🧋',
    '覺得{name}最近品質有點下降耶...上次點的飲料甜度跟以前不同',
    '跟朋友聚會選了{name}，座位很寬敞，適合聊天',
    '第一次來{name}，店員態度很好！被推薦的招牌果然好喝',
    '{name}排隊排好久...但喝到覺得值得等😤',
    '最近{name}在做買一送一！衝啊！',
    '朋友從日本來說{name}比他們那邊的手搖好喝太多了',
  ],
  product: [
    '{name}真的是夏天必喝！每次都點大杯 🥤',
    '不知道是不是我的錯覺，{name}最近的味道變了...',
    '推薦微糖的{name}，甜度剛好又清爽',
    '{name}好好喝但熱量好高啊...算了不管了',
    '辦公室團購{name}，同事都說讚！',
    '{name}搭配珍珠真的絕配，Q彈有嚼勁',
    '點了{name}但等了快 20 分鐘才拿到...🙄',
  ],
  person: [
    '{name}最近的影片好好笑 XDDD 笑到停不下來',
    '覺得{name}的業配有點多耶...希望多拍原創內容',
    '{name}推薦的那家店真的好吃！信任度 UP',
    '追蹤{name}好幾年了，內容品質一直很穩定',
    '{name}今天的直播好有互動感，回了好多留言',
    '有人覺得{name}最近變了嗎...少了以前那種感覺',
  ],
  place: [
    '{name}的裝潢好美！很適合拍照打卡 📸',
    '去了{name}，位置有點難找但環境不錯',
    '{name}假日人好多，等了半小時才有位子',
    '{name}的空調開太強了...帶件外套去比較好',
    '推薦{name}的二樓座位，看出去的景色很棒',
  ],
  work: [
    '用了{name}兩週了，感覺效果還不錯 👍',
    '{name}聞起來很香但效果普通，有點失望',
    '朋友推薦{name}，用完頭髮真的變滑順了！',
    '{name}的成分很天然，敏感肌也可以用',
    '之前很愛{name}但最近用完頭皮有點癢...不確定是不是換配方了',
  ],
  event: [
    '{name}好好玩！試喝了好多品牌，收穫滿滿',
    '剛從{name}回來，人超多但氛圍很讚',
    '{name}的排隊動線設計有待加強...等太久了',
  ],
  organization: [
    '在{name}弄了頭髮，技術真的很好！很滿意',
    '{name}的價格偏高但服務品質確實不錯',
    '預約了{name}但臨時被改時間，有點不太高興',
  ],
}

function generateMentions(name: string, type: string, count: number): MentionItem[] {
  const pool = MENTION_POOL[type] ?? MENTION_POOL.brand
  const sentiments: Array<{ label: string; score: number }> = [
    { label: 'positive', score: 0.85 },
    { label: 'positive', score: 0.78 },
    { label: 'neutral', score: 0.52 },
    { label: 'negative', score: 0.22 },
    { label: 'positive', score: 0.91 },
    { label: 'neutral', score: 0.48 },
    { label: 'negative', score: 0.15 },
    { label: 'positive', score: 0.82 },
  ]
  return pool.slice(0, count).map((tpl, i) => ({
    post_id: 1000 + i,
    content: tpl.replace('{name}', name),
    sentiment: sentiments[i % sentiments.length].label,
    sentiment_score: sentiments[i % sentiments.length].score,
    mention_text: name,
    created_at: isoDate(i),
  }))
}

// Relationships between entities
const LINK_MAP: Record<string, LinkItem[]> = {
  b001: [
    { direction: 'outgoing', linked_id: 'p001', linked_name: '木瓜牛奶', linked_type: 'product', link_type: 'produces', created_at: isoDate(60) },
    { direction: 'outgoing', linked_id: 'p002', linked_name: '珍珠奶茶', linked_type: 'product', link_type: 'produces', created_at: isoDate(60) },
    { direction: 'outgoing', linked_id: 'l001', linked_name: 'Epoch新竹店', linked_type: 'place', link_type: 'located_at', created_at: isoDate(60) },
    { direction: 'incoming', linked_id: 'b002', linked_name: '茶湯會', linked_type: 'brand', link_type: 'competes_with', created_at: isoDate(30) },
  ],
  b002: [
    { direction: 'incoming', linked_id: 'b001', linked_name: '鬍子茶', linked_type: 'brand', link_type: 'competes_with', created_at: isoDate(30) },
    { direction: 'outgoing', linked_id: 'l003', linked_name: '西門旗艦店', linked_type: 'place', link_type: 'located_at', created_at: isoDate(45) },
    { direction: 'outgoing', linked_id: 'k002', linked_name: '阿翰po影片', linked_type: 'person', link_type: 'endorsed_by', created_at: isoDate(10) },
  ],
  p001: [
    { direction: 'incoming', linked_id: 'b001', linked_name: '鬍子茶', linked_type: 'brand', link_type: 'produced_by', created_at: isoDate(60) },
    { direction: 'incoming', linked_id: 'k004', linked_name: '千千進食中', linked_type: 'person', link_type: 'mentioned_by', created_at: isoDate(5) },
  ],
  k001: [
    { direction: 'outgoing', linked_id: 'o001', linked_name: '2006hairsalon', linked_type: 'organization', link_type: 'founded', created_at: isoDate(90) },
    { direction: 'outgoing', linked_id: 'w001', linked_name: '黑曜光護髮', linked_type: 'work', link_type: 'endorses', created_at: isoDate(20) },
  ],
  o001: [
    { direction: 'incoming', linked_id: 'k001', linked_name: 'Carol凱若', linked_type: 'person', link_type: 'founded_by', created_at: isoDate(90) },
  ],
  b003: [
    { direction: 'outgoing', linked_id: 'p003', linked_name: '芋泥鮮奶', linked_type: 'product', link_type: 'produces', created_at: isoDate(30) },
    { direction: 'incoming', linked_id: 'b001', linked_name: '鬍子茶', linked_type: 'brand', link_type: 'competes_with', created_at: isoDate(45) },
  ],
  w001: [
    { direction: 'incoming', linked_id: 'k001', linked_name: 'Carol凱若', linked_type: 'person', link_type: 'endorsed_by', created_at: isoDate(20) },
    { direction: 'incoming', linked_id: 'o001', linked_name: '2006hairsalon', linked_type: 'organization', link_type: 'produced_by', created_at: isoDate(30) },
  ],
}

const ALIAS_MAP: Record<string, string[]> = {
  b001: ['Huzi Tea', '鬍茶'],
  b002: ['TP Tea'],
  b003: ['Milksha'],
  b004: ['Chun Shui Tang'],
  b005: ['CoCo'],
  k001: ['Carol', '凱若'],
  k003: ['阿嘎'],
  p002: ['Boba Tea', '波霸奶茶'],
}

function buildEntityDetail(entityId: string): EntityDetail | null {
  const entity = ENTITIES.find(e => e.id === entityId)
  if (!entity) return null

  const aspects = generateAspects(entity.type, entity.aspect_count, entity.avg_sentiment)
  const mentions = generateMentions(entity.canonical_name, entity.type, Math.min(8, entity.mention_count))
  const links = LINK_MAP[entityId] ?? []

  const totalMentions = entity.mention_count
  const pos = Math.round(totalMentions * entity.avg_sentiment)
  const neg = Math.round(totalMentions * (1 - entity.avg_sentiment) * 0.6)
  const neu = Math.round(totalMentions * (1 - entity.avg_sentiment) * 0.3)
  const mix = Math.max(0, totalMentions - pos - neg - neu)

  const stats: EntityDetailStats = {
    mention_count: totalMentions,
    aspect_count: entity.aspect_count,
    avg_sentiment: entity.avg_sentiment,
    positive_count: pos,
    negative_count: neg,
    neutral_count: neu,
    mixed_count: mix,
  }

  return {
    id: entity.id,
    canonical_name: entity.canonical_name,
    type: entity.type,
    sub_type: entity.sub_type,
    status: 'active',
    created_at: isoDate(90),
    aliases: ALIAS_MAP[entityId] ?? [],
    stats,
    top_aspects: aspects,
    links,
    recent_mentions: mentions,
  }
}

// ────────────────────────────────────────────
// 6. Route Handler
// ────────────────────────────────────────────

function json(data: unknown): Response {
  return new Response(JSON.stringify(data), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })
}

function handleApi(url: string, init?: RequestInit): Response | null {
  const parsed = new URL(url, 'http://localhost')
  const path = parsed.pathname
  const params = parsed.searchParams

  // PATCH endpoints (mark read / dismiss)
  if (init?.method === 'PATCH') {
    return json({ success: true })
  }

  // GET /api/entities?...
  if (path === '/api/entities') {
    const q = params.get('q')?.toLowerCase()
    const limit = Number(params.get('limit') ?? 200)
    let list = ENTITIES
    if (q) {
      list = ENTITIES.filter(e =>
        e.canonical_name.toLowerCase().includes(q) ||
        (ALIAS_MAP[e.id] ?? []).some(a => a.toLowerCase().includes(q)) ||
        e.type.includes(q)
      )
    }
    const sort = params.get('sort') ?? 'mention_count'
    const order = params.get('order') ?? 'desc'
    const sorted = list.slice().sort((a, b) => {
      const aVal = (a as Record<string, unknown>)[sort] as number ?? 0
      const bVal = (b as Record<string, unknown>)[sort] as number ?? 0
      return order === 'desc' ? bVal - aVal : aVal - bVal
    })
    const result = sorted.slice(0, limit)
    return json({ data: result, pagination: { offset: 0, limit, total: sorted.length, has_more: sorted.length > limit } })
  }

  // GET /api/dashboard
  if (path === '/api/dashboard') {
    return json(DASHBOARD)
  }

  // GET /api/inbox/count
  if (path === '/api/inbox/count') {
    const unread = SIGNALS.filter(s => !s.is_read).length
    return json({ count: unread, data: { unread } })
  }

  // GET /api/inbox
  if (path === '/api/inbox') {
    const severity = params.get('severity')
    const factType = params.get('fact_type')
    const offset = Number(params.get('offset') ?? 0)
    const limit = Number(params.get('limit') ?? 30)
    let list = SIGNALS
    if (severity) list = list.filter(s => s.severity === severity)
    if (factType) list = list.filter(s => s.fact_type === factType)
    const page = list.slice(offset, offset + limit)
    return json({ data: page, pagination: { offset, limit, total: list.length, has_more: offset + limit < list.length } })
  }

  // GET /api/entities/:id/observations
  const obsMatch = path.match(/^\/api\/entities\/([^/]+)\/observations$/)
  if (obsMatch) {
    const id = obsMatch[1]
    const entity = ENTITIES.find(e => e.id === id)
    if (!entity) return json({ data: [] })
    const obs = generateObservations(id, entity.mention_count, entity.avg_sentiment)
    const limit = Number(params.get('limit') ?? 12)
    return json({ data: obs.slice(0, limit), pagination: { offset: 0, limit, total: obs.length, has_more: false } })
  }

  // GET /api/entities/:id/facts
  const factsMatch = path.match(/^\/api\/entities\/([^/]+)\/facts$/)
  if (factsMatch) {
    const id = factsMatch[1]
    const entityFacts = SIGNALS.filter(s => s.object_id === id)
    return json({ data: entityFacts, pagination: { offset: 0, limit: 10, total: entityFacts.length, has_more: false } })
  }

  // GET /api/entities/:id (detail)
  const detailMatch = path.match(/^\/api\/entities\/([^/]+)$/)
  if (detailMatch) {
    const id = detailMatch[1]
    const detail = buildEntityDetail(id)
    if (!detail) return json({ data: null })
    return json({ data: detail })
  }

  // GET /api/entity-types
  if (path === '/api/entity-types') {
    const typeCounts = new Map<string, number>()
    for (const e of ENTITIES) {
      typeCounts.set(e.type, (typeCounts.get(e.type) ?? 0) + 1)
    }
    const types = Array.from(typeCounts.entries()).map(([name, count]) => ({
      name,
      display_name: name,
      entity_count: count,
    }))
    return json({ data: types })
  }

  // GET /api/graph
  if (path === '/api/graph') {
    const edges = Object.entries(LINK_MAP).flatMap(([sourceId, links]) =>
      links.filter(l => l.direction === 'outgoing').map(l => ({
        source_id: sourceId,
        target_id: l.linked_id,
        link_type: l.link_type,
      }))
    )
    return json({ data: { nodes: ENTITIES, edges } })
  }

  return null
}

// ────────────────────────────────────────────
// 7. Global Fetch Interceptor
// ────────────────────────────────────────────

const _originalFetch = window.fetch.bind(window)

window.fetch = ((input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
  const url = typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url
  if (url.startsWith('/api/')) {
    const mock = handleApi(url, init)
    if (mock) {
      return new Promise(resolve => setTimeout(() => resolve(mock), 80 + Math.random() * 120))
    }
  }
  return _originalFetch(input, init)
}) as typeof window.fetch
