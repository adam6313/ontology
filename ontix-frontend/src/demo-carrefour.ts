/**
 * Demo Mode — intercepts all /api/* fetch calls with rich mock data.
 * Import this file in main.tsx to activate: import './demo'
 * Delete the import to disable.
 *
 * Domain: Carrefour Taiwan (家樂福) brand equity & renaming analysis
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
// Helpers
// ────────────────────────────────────────────

function isoDate(daysAgo: number): string {
  const d = new Date('2026-02-11')
  d.setDate(d.getDate() - daysAgo)
  return d.toISOString()
}

function weekDate(weeksAgo: number): string {
  const d = new Date('2026-02-09')
  d.setDate(d.getDate() - weeksAgo * 7)
  return d.toISOString().split('T')[0]
}

// ────────────────────────────────────────────
// 1. Entities (55 items across 8 types)
// ────────────────────────────────────────────

const ENTITIES: EntitySummary[] = [
  // ── Brands (8) ──
  // 家樂福：統一集團 2022/7 斥資 NT$290 億收購 60% 股權，2023 年完成交割（統一 70%/統一超 30%）
  // 2025/12/19 終止與法國家樂福品牌授權，2026/1/28 公司更名「康達盛通」，消費者品牌名 TBD
  // 全台 ~386 店（量販 63 + 超市 302 + Mia C'bon 21），營收約 NT$800 億，市佔 14.9%
  { id: 'b001', canonical_name: '家樂福', type: 'brand', sub_type: 'hypermarket', mention_count: 1842, aspect_count: 14, avg_sentiment: 0.58 },
  // 全聯：市佔 41.3%，超過 1,100 店，2024 營收 NT$1,900億+
  { id: 'b002', canonical_name: '全聯福利中心', type: 'brand', sub_type: 'supermarket', mention_count: 986, aspect_count: 12, avg_sentiment: 0.71 },
  // 好市多：市佔 26.6%，全台 14 店，會員制量販
  { id: 'b003', canonical_name: '好市多 Costco', type: 'brand', sub_type: 'warehouse', mention_count: 724, aspect_count: 10, avg_sentiment: 0.79 },
  // 大潤發：被全聯收購，逐步改裝為「大全聯」
  { id: 'b004', canonical_name: '大潤發', type: 'brand', sub_type: 'hypermarket', mention_count: 308, aspect_count: 8, avg_sentiment: 0.46 },
  // 統一集團（母公司）
  { id: 'b005', canonical_name: '統一企業集團', type: 'brand', sub_type: 'conglomerate', mention_count: 396, aspect_count: 7, avg_sentiment: 0.65 },
  // 全家便利商店（生鮮競爭者）
  { id: 'b006', canonical_name: '全家便利商店', type: 'brand', sub_type: 'cvs', mention_count: 162, aspect_count: 5, avg_sentiment: 0.73 },
  // 美廉社
  { id: 'b007', canonical_name: '美廉社', type: 'brand', sub_type: 'discount_store', mention_count: 88, aspect_count: 4, avg_sentiment: 0.61 },
  // Mia C'bon（家樂福旗下精品超市）
  { id: 'b008', canonical_name: "Mia C'bon", type: 'brand', sub_type: 'premium_super', mention_count: 144, aspect_count: 5, avg_sentiment: 0.68 },

  // ── Products / Content Topics (16) ──
  { id: 'p001', canonical_name: '法式烘焙（法棍/可頌）', type: 'product', sub_type: 'bakery', mention_count: 918, aspect_count: 8, avg_sentiment: 0.82 },
  { id: 'p002', canonical_name: '家樂福自有品牌', type: 'product', sub_type: 'private_label', mention_count: 456, aspect_count: 9, avg_sentiment: 0.64 },
  { id: 'p003', canonical_name: '紅藜烤雞', type: 'product', sub_type: 'deli', mention_count: 634, aspect_count: 6, avg_sentiment: 0.85 },
  { id: 'p004', canonical_name: '生鮮蔬果區', type: 'product', sub_type: 'fresh', mention_count: 428, aspect_count: 7, avg_sentiment: 0.52 },
  { id: 'p005', canonical_name: '家樂福線上購物', type: 'product', sub_type: 'ecommerce', mention_count: 512, aspect_count: 8, avg_sentiment: 0.38 },
  { id: 'p006', canonical_name: '家樂福 APP', type: 'product', sub_type: 'app', mention_count: 386, aspect_count: 6, avg_sentiment: 0.41 },
  { id: 'p007', canonical_name: '法國進口商品專區', type: 'product', sub_type: 'import', mention_count: 294, aspect_count: 5, avg_sentiment: 0.77 },
  { id: 'p008', canonical_name: '家樂福聯名信用卡', type: 'product', sub_type: 'finance', mention_count: 272, aspect_count: 6, avg_sentiment: 0.55 },
  { id: 'p009', canonical_name: '量販促銷 DM', type: 'product', sub_type: 'promotion', mention_count: 298, aspect_count: 5, avg_sentiment: 0.63 },
  { id: 'p010', canonical_name: '冷凍食品專區', type: 'product', sub_type: 'frozen', mention_count: 168, aspect_count: 5, avg_sentiment: 0.66 },
  { id: 'p011', canonical_name: '家電 3C 區', type: 'product', sub_type: 'electronics', mention_count: 154, aspect_count: 5, avg_sentiment: 0.58 },
  { id: 'p012', canonical_name: '有機/健康食品區', type: 'product', sub_type: 'organic', mention_count: 148, aspect_count: 4, avg_sentiment: 0.72 },
  { id: 'p013', canonical_name: '嬰幼兒用品區', type: 'product', sub_type: 'baby', mention_count: 142, aspect_count: 4, avg_sentiment: 0.60 },
  { id: 'p014', canonical_name: '寵物用品區', type: 'product', sub_type: 'pet', mention_count: 136, aspect_count: 4, avg_sentiment: 0.67 },
  { id: 'p015', canonical_name: '酒類專區', type: 'product', sub_type: 'wine', mention_count: 252, aspect_count: 5, avg_sentiment: 0.74 },
  { id: 'p016', canonical_name: '熟食便當區', type: 'product', sub_type: 'deli', mention_count: 264, aspect_count: 5, avg_sentiment: 0.59 },

  // ── Scenarios (8) ──
  { id: 's001', canonical_name: '品牌更名轉型', type: 'scenario', sub_type: 'rebrand', mention_count: 886, aspect_count: 7, avg_sentiment: 0.42 },
  { id: 's002', canonical_name: '週末量販採購', type: 'scenario', sub_type: 'shopping', mention_count: 542, aspect_count: 6, avg_sentiment: 0.68 },
  { id: 's003', canonical_name: '線上買菜到府', type: 'scenario', sub_type: 'delivery', mention_count: 418, aspect_count: 7, avg_sentiment: 0.44 },
  { id: 's004', canonical_name: '烘焙甜點巡禮', type: 'scenario', sub_type: 'foodie', mention_count: 396, aspect_count: 5, avg_sentiment: 0.81 },
  { id: 's005', canonical_name: '會員點數經濟', type: 'scenario', sub_type: 'loyalty', mention_count: 388, aspect_count: 6, avg_sentiment: 0.53 },
  { id: 's006', canonical_name: '進口食材挖寶', type: 'scenario', sub_type: 'gourmet', mention_count: 274, aspect_count: 5, avg_sentiment: 0.76 },
  { id: 's007', canonical_name: '年節禮盒採購', type: 'scenario', sub_type: 'seasonal', mention_count: 282, aspect_count: 5, avg_sentiment: 0.70 },
  { id: 's008', canonical_name: '小家庭日常補貨', type: 'scenario', sub_type: 'routine', mention_count: 266, aspect_count: 5, avg_sentiment: 0.62 },

  // ── Places (6) ──
  { id: 'l001', canonical_name: '家樂福內湖量販店', type: 'place', sub_type: 'hypermarket', mention_count: 246, aspect_count: 6, avg_sentiment: 0.58 },
  { id: 'l002', canonical_name: '家樂福桂林店', type: 'place', sub_type: 'hypermarket', mention_count: 252, aspect_count: 6, avg_sentiment: 0.54 },
  { id: 'l003', canonical_name: '家樂福中原店', type: 'place', sub_type: 'hypermarket', mention_count: 138, aspect_count: 5, avg_sentiment: 0.62 },
  { id: 'l004', canonical_name: '家樂福新店店', type: 'place', sub_type: 'supermarket', mention_count: 132, aspect_count: 5, avg_sentiment: 0.55 },
  { id: 'l005', canonical_name: '家樂福高雄鼎山店', type: 'place', sub_type: 'hypermarket', mention_count: 128, aspect_count: 5, avg_sentiment: 0.60 },
  { id: 'l006', canonical_name: '家樂福台中文心店', type: 'place', sub_type: 'hypermarket', mention_count: 134, aspect_count: 5, avg_sentiment: 0.57 },

  // ── Persons / KOLs (7) ──
  { id: 'k001', canonical_name: '486先生', type: 'person', sub_type: 'kol_deal', mention_count: 258, aspect_count: 5, avg_sentiment: 0.72 },
  { id: 'k002', canonical_name: '好市多好物老實說', type: 'person', sub_type: 'kol_review', mention_count: 244, aspect_count: 4, avg_sentiment: 0.75 },
  { id: 'k003', canonical_name: '家樂福烘焙社團', type: 'person', sub_type: 'community', mention_count: 382, aspect_count: 5, avg_sentiment: 0.84 },
  { id: 'k004', canonical_name: '主婦聯盟', type: 'person', sub_type: 'ngo', mention_count: 132, aspect_count: 4, avg_sentiment: 0.56 },
  { id: 'k005', canonical_name: '美食公社', type: 'person', sub_type: 'community', mention_count: 248, aspect_count: 4, avg_sentiment: 0.71 },
  { id: 'k006', canonical_name: 'PTT 省錢版', type: 'person', sub_type: 'forum', mention_count: 366, aspect_count: 5, avg_sentiment: 0.52 },
  { id: 'k007', canonical_name: '愛料理社群', type: 'person', sub_type: 'community', mention_count: 236, aspect_count: 4, avg_sentiment: 0.78 },

  // ── Events (6) ──
  { id: 'e001', canonical_name: '統一集團完成收購', type: 'event', sub_type: 'acquisition', mention_count: 556, aspect_count: 7, avg_sentiment: 0.48 },
  { id: 'e002', canonical_name: '品牌授權到期（2025/12）', type: 'event', sub_type: 'license', mention_count: 428, aspect_count: 6, avg_sentiment: 0.38 },
  { id: 'e003', canonical_name: '公司更名為康達盛通', type: 'event', sub_type: 'rename', mention_count: 412, aspect_count: 6, avg_sentiment: 0.35 },
  { id: 'e004', canonical_name: '家樂福年度烘焙祭', type: 'event', sub_type: 'campaign', mention_count: 276, aspect_count: 5, avg_sentiment: 0.83 },
  { id: 'e005', canonical_name: '門市縮減潮', type: 'event', sub_type: 'closure', mention_count: 394, aspect_count: 6, avg_sentiment: 0.32 },
  { id: 'e006', canonical_name: 'OPENPOINT 整合', type: 'event', sub_type: 'integration', mention_count: 268, aspect_count: 5, avg_sentiment: 0.50 },

  // ── Organizations (4) ──
  { id: 'o001', canonical_name: '公平交易委員會', type: 'organization', sub_type: 'regulator', mention_count: 128, aspect_count: 4, avg_sentiment: 0.55 },
  { id: 'o002', canonical_name: '消費者基金會', type: 'organization', sub_type: 'ngo', mention_count: 122, aspect_count: 3, avg_sentiment: 0.50 },
  { id: 'o003', canonical_name: '經濟部商業發展署', type: 'organization', sub_type: 'gov', mention_count: 68, aspect_count: 3, avg_sentiment: 0.58 },
  { id: 'o004', canonical_name: '台灣連鎖暨加盟協會', type: 'organization', sub_type: 'association', mention_count: 64, aspect_count: 3, avg_sentiment: 0.62 },
]

// ────────────────────────────────────────────
// 2. Signals / Inbox Facts
// ────────────────────────────────────────────

const SIGNALS: InboxFact[] = [
  // ── Alerts (critical) ──
  { id: 1, object_id: 'b001', entity_name: '家樂福', entity_type: 'brand', fact_type: 'alert', severity: 'critical', title: '品牌授權終止，消費者認知混亂', description: '2025/12/19 統一宣布終止與法國家樂福品牌授權合約，2026/1/28 臨時股東會決議公司更名「康達盛通」。羅智先透露已初選數個候選品牌名，2026 年中全台近 400 家門市將換招牌。PTT/Dcard 大量「家樂福要消失了嗎」討論，Google Trends「家樂福改名」搜尋量 +580%。', is_read: false, created_at: isoDate(0), period_start: '2026-02-09', period_type: 'week' },
  { id: 2, object_id: 'e005', entity_name: '門市縮減潮', entity_type: 'event', fact_type: 'alert', severity: 'critical', title: '2025 關 9 店 + Mia C\'bon 2 月再關 4 店，社群恐慌蔓延', description: '2025年關閉 9 間門市（4量販+3超市+2 Mia C\'bon）。2026/2 Mia C\'bon 再關 4 間（林森店2/22、美麗華2/23、中和環球+高雄漢神2/28），全台僅剩16家。20年老店高雄漢神也收掉。PTT「家樂福撐不住了嗎」「又要關了」負面帖文破200則。', is_read: false, created_at: isoDate(1), period_start: '2026-02-09', period_type: 'week' },
  { id: 3, object_id: 'p005', entity_name: '家樂福線上購物', entity_type: 'product', fact_type: 'alert', severity: 'critical', title: '線上購物平台當機 2 次，負評暴增', description: '家樂福線上購物近兩週連續當機 2 次（2/3 及 2/7），到貨延遲、商品缺貨問題嚴重。Google Play 評分從 3.2 降至 2.8，一星評價 +120 則。Dcard 「家樂福 app 爛到爆」熱門文超過 5 萬觀看。', is_read: false, created_at: isoDate(2), period_start: '2026-02-09', period_type: 'week' },

  // ── Risk Signals (warning) ──
  { id: 10, object_id: 'b001', entity_name: '家樂福', entity_type: 'brand', fact_type: 'risk_signal', severity: 'warning', title: '員工爆料統一接手後管理混亂', description: 'Dcard 職場版出現多篇員工爆料：「統一來的主管什麼都不懂」「SOP 全部砍掉重來」「老員工被逼走」。雖然真實性待驗證但已被轉貼至多個社群。', is_read: false, created_at: isoDate(3), period_start: '2026-02-09', period_type: 'week' },
  { id: 11, object_id: 's005', entity_name: '會員點數經濟', entity_type: 'scenario', fact_type: 'risk_signal', severity: 'warning', title: '家樂福好康卡 → OPENPOINT 轉換引發不滿', description: '2025/9/16 起家樂福會員消費改累積 OPENPOINT 點數，回饋率僅 0.33%（VIP 0.5%），舊點數無法轉換只能折抵。PTT「折抵點數會影響回饋導購計算，損失20%以上」「只有500多點只能折一元」。全面停發實體會員卡改用APP，年長客群反彈。', is_read: false, created_at: isoDate(2), period_start: '2026-02-09', period_type: 'week' },
  { id: 12, object_id: 'p002', entity_name: '家樂福自有品牌', entity_type: 'product', fact_type: 'risk_signal', severity: 'warning', title: '自有品牌去 Carrefour 標後辨識度歸零', description: '家樂福自有品牌（Carrefour Bio、Carrefour Classic）去除法文標誌後，消費者反映「看不出跟其他雜牌有什麼差」「少了 Carrefour 就是一般貨」。品牌溢價能力恐下降。', is_read: false, created_at: isoDate(4), period_start: '2026-02-02', period_type: 'week' },
  { id: 13, object_id: 'b002', entity_name: '全聯福利中心', entity_type: 'brand', fact_type: 'risk_signal', severity: 'warning', title: '全聯加速展店直接搶食家樂福商圈', description: '全聯 2026 年展店目標 80 家，其中 12 家位於家樂福關店商圈半徑 1 公里內。大全聯改裝完成的門市生鮮品項已達家樂福 80% 水準。', is_read: false, created_at: isoDate(5), period_start: '2026-02-02', period_type: 'week' },
  { id: 14, object_id: 'p004', entity_name: '生鮮蔬果區', entity_type: 'product', fact_type: 'risk_signal', severity: 'warning', title: '生鮮品質不穩定客訴增加', description: '近期 Google 評論出現大量「菜都爛的」「水果買回去隔天就壞」「感覺品管變差了」。疑似供應鏈調整期間品質控制鬆散。', is_read: false, created_at: isoDate(6), period_start: '2026-02-02', period_type: 'week' },
  { id: 15, object_id: 'e003', entity_name: '公司更名為康達盛通', entity_type: 'event', fact_type: 'risk_signal', severity: 'warning', title: '「康達盛通」名稱遭網友嘲諷', description: 'PTT 八卦版「康達盛通是什麼鬼名字」「聽起來像詐騙集團」「完全沒有量販店的感覺」。網友自製迷因圖廣傳，對未來品牌命名造成壓力。', is_read: false, created_at: isoDate(3), period_start: '2026-02-09', period_type: 'week' },
  { id: 16, object_id: 'p008', entity_name: '家樂福聯名信用卡', entity_type: 'product', fact_type: 'risk_signal', severity: 'warning', title: '玉山家樂福聯名卡合約到期，權益大幅縮水', description: '玉山家樂福聯名卡合約 2025/8/30 到期，換發玉山 Unicard（次年年費$3,000）。週三品牌日從8折改惡為88折。PTT creditcard 版「被降等」「直接剪卡」聲量暴增。2026/1/1 起舊卡無法使用。', is_read: true, created_at: isoDate(8), period_start: '2026-01-26', period_type: 'week' },

  // ── Trends (info) ──
  { id: 20, object_id: 'p001', entity_name: '法式烘焙（法棍/可頌）', entity_type: 'product', fact_type: 'trend', severity: 'info', title: '烘焙區聲量逆勢成長 +45%', description: '即使品牌動盪，家樂福烘焙區（尤其法棍、可頌、蝴蝶酥）討論聲量逆勢成長。「去家樂福就是為了麵包」成為消費者共識。IG #家樂福麵包 累計 12 萬則。', is_read: true, created_at: isoDate(5), period_start: '2026-02-02', period_type: 'week' },
  { id: 21, object_id: 'p003', entity_name: '紅藜烤雞', entity_type: 'product', fact_type: 'trend', severity: 'info', title: '紅藜烤雞持續稱霸熟食區', description: '家樂福紅藜烤雞($269)持續為社群熱議品項。「CP 值之王」「每次去必買」。月銷量約 8 萬隻，為熟食區營收主力。', is_read: true, created_at: isoDate(7), period_start: '2026-01-26', period_type: 'week' },
  { id: 22, object_id: 'b003', entity_name: '好市多 Costco', entity_type: 'brand', fact_type: 'trend', severity: 'info', title: '好市多北高雄店開幕引爆話題', description: '好市多北高雄店 2026/1 開幕，首日人潮破 3 萬。社群「好市多 vs 家樂福」比較文大量出現。家樂福在南部的優勢市場開始受到擠壓。', is_read: true, created_at: isoDate(10), period_start: '2026-01-19', period_type: 'week' },
  { id: 23, object_id: 'p007', entity_name: '法國進口商品專區', entity_type: 'product', fact_type: 'trend', severity: 'info', title: '法國進口商品為差異化關鍵', description: '家樂福獨家代理的法國起司、紅酒、巧克力在美食社群聲量持續穩定。「這些東西別的地方買不到」「改名也不能少了進口貨」是主要消費者心聲。', is_read: true, created_at: isoDate(8), period_start: '2026-01-26', period_type: 'week' },
  { id: 24, object_id: 's002', entity_name: '週末量販採購', entity_type: 'scenario', fact_type: 'trend', severity: 'info', title: '週末量販採購仍為主力場景', description: '家庭客週末量販採購仍為核心消費場景。停車場容量、試吃活動、DM 特價是三大決策因子。家樂福在量販體驗上仍優於全聯。', is_read: true, created_at: isoDate(9), period_start: '2026-01-26', period_type: 'week' },
  { id: 25, object_id: 'p015', entity_name: '酒類專區', entity_type: 'product', fact_type: 'trend', severity: 'info', title: '紅酒節活動帶動酒類討論', description: '家樂福年度紅酒節累計引進 500 支酒款，PTT Wine 版「今年家樂福紅酒哪支最值得買」討論熱烈。平均客單價 $1,200。', is_read: true, created_at: isoDate(12), period_start: '2026-01-12', period_type: 'week' },
  { id: 26, object_id: 'e006', entity_name: 'OPENPOINT 整合', entity_type: 'event', fact_type: 'trend', severity: 'info', title: 'OPENPOINT 整合帶動跨通路消費', description: '家樂福併入 OPENPOINT 生態圈後，7-ELEVEN、家樂福、星巴克可互相累點。部分消費者反映「去家樂福的動力增加了」。', is_read: true, created_at: isoDate(7), period_start: '2026-01-26', period_type: 'week' },
  { id: 27, object_id: 'b004', entity_name: '大潤發', entity_type: 'brand', fact_type: 'trend', severity: 'info', title: '大全聯改裝店型初步獲好評', description: '已完成改裝的大全聯門市在生鮮、熟食方面獲得消費者好評，但「賣場感」降低也引發部分老客戶不滿。', is_read: true, created_at: isoDate(11), period_start: '2026-01-19', period_type: 'week' },

  // ── Insights ──
  { id: 30, object_id: 'b001', entity_name: '家樂福', entity_type: 'brand', fact_type: 'insight', severity: 'info', title: '品牌資產盤點：烘焙+進口+烤雞為核心三支柱', description: '跨平台聲量分析顯示，消費者對家樂福的正面連結集中在三大領域：法式烘焙（聲量佔比 28%）、法國進口商品（18%）、紅藜烤雞（16%）。這三項是更名後必須保留的品牌資產。量販空間體驗（12%）和 DM 促銷（8%）次之。', is_read: false, created_at: isoDate(0), period_start: '2026-02-09', period_type: 'week' },
  { id: 31, object_id: 'b001', entity_name: '家樂福', entity_type: 'brand', fact_type: 'insight', severity: 'info', title: '消費者最擔心更名後失去「法國感」', description: '情感分析發現「法國」「法式」「歐洲進口」是家樂福正面情感的最大驅動因子。消費者核心恐懼不是換招牌，而是「還能不能買到法國貨」「麵包師傅會不會被換掉」。新品牌名建議保留法系元素。', is_read: false, created_at: isoDate(0), period_start: '2026-02-09', period_type: 'week' },
  { id: 32, object_id: 's001', entity_name: '品牌更名轉型', entity_type: 'scenario', fact_type: 'insight', severity: 'info', title: '更名時間窗口：3-6 個月內需完成品牌切換', description: '社群情緒分析顯示，消費者對「不確定狀態」的容忍度約 3-6 個月。超過此期限，品牌混亂將造成不可逆的客戶流失。建議最遲 2026/6 前公佈新品牌名並啟動全面換裝。', is_read: false, created_at: isoDate(1), period_start: '2026-02-09', period_type: 'week' },
  { id: 33, object_id: 'b002', entity_name: '全聯福利中心', entity_type: 'brand', fact_type: 'insight', severity: 'info', title: '全聯「大全聯」策略正在複製家樂福優勢', description: '全聯透過大全聯門市逐步補齊量販品項（生鮮、進口、家電），同時維持全聯的低價形象。其目標明確是接收家樂福外溢客群。家樂福需在「量販體驗」和「法式差異化」兩條路線擇一強化。', is_read: false, created_at: isoDate(2), period_start: '2026-02-09', period_type: 'week' },
  { id: 34, object_id: 'p005', entity_name: '家樂福線上購物', entity_type: 'product', fact_type: 'insight', severity: 'info', title: '線上購物體驗是最大弱項', description: '家樂福線上購物 NPS 為 -28，遠低於 PXGo(+12) 和 Costco Online(+22)。主要痛點：配送延遲（38%）、缺貨不通知（25%）、APP 閃退（18%）、客服無回應（12%）。統一應優先投入數位基礎建設。', is_read: false, created_at: isoDate(1), period_start: '2026-02-09', period_type: 'week' },
  { id: 35, object_id: 'p001', entity_name: '法式烘焙（法棍/可頌）', entity_type: 'product', fact_type: 'insight', severity: 'info', title: '烘焙是唯一不受品牌動盪影響的品項', description: '在所有品項中，烘焙區是唯一在品牌危機期間聲量和情感同時正向成長的品項。消費者「不管叫什麼名字都會去買麵包」的心態表明烘焙已建立獨立品牌力。', is_read: false, created_at: isoDate(2), period_start: '2026-02-09', period_type: 'week' },

  // ── Opportunities ──
  { id: 40, object_id: 'b001', entity_name: '家樂福', entity_type: 'brand', fact_type: 'opportunity', severity: 'info', title: '更名可作為品牌升級契機', description: '消費者調查顯示 42% 的人認為「如果新品牌做得好，改名也沒關係」。更名不只是風險，也是擺脫「量販老店」形象、重新定位為「法式生活提案」的機會。', is_read: false, created_at: isoDate(0), period_start: '2026-02-09', period_type: 'week' },
  { id: 41, object_id: 's004', entity_name: '烘焙甜點巡禮', entity_type: 'scenario', fact_type: 'opportunity', severity: 'info', title: '烘焙可獨立為子品牌經營', description: '家樂福烘焙的品牌認知已強到可以獨立。建議將烘焙區升級為獨立子品牌（如「Le Four」），設立街邊店型態，脫離量販場景拓展客群。IG 烘焙社群意願調查 78% 表示會去。', is_read: false, created_at: isoDate(1), period_start: '2026-02-09', period_type: 'week' },
  { id: 42, object_id: 'e006', entity_name: 'OPENPOINT 整合', entity_type: 'event', fact_type: 'opportunity', severity: 'info', title: 'OPENPOINT 生態圈可帶動跨通路導流', description: '統一集團旗下 7-ELEVEN(6,700店)+星巴克(550店)+家樂福(386店) 的 OPENPOINT 聯合生態圈覆蓋全台最廣。若整合得宜，家樂福可從便利商店客群中導流大型採購需求。', is_read: false, created_at: isoDate(2), period_start: '2026-02-09', period_type: 'week' },
  { id: 43, object_id: 'p004', entity_name: '生鮮蔬果區', entity_type: 'product', fact_type: 'opportunity', severity: 'info', title: '冷鏈物流升級可扭轉生鮮口碑', description: '統一集團擁有全台最完整的冷鏈物流體系。若將統一的冷鏈標準導入家樂福門市，可根本解決生鮮品質問題，從弱項變成強項。消費者「希望家樂福菜能像 Costco 一樣新鮮」的聲音很多。', is_read: false, created_at: isoDate(3), period_start: '2026-02-09', period_type: 'week' },
  { id: 44, object_id: 's003', entity_name: '線上買菜到府', entity_type: 'scenario', fact_type: 'opportunity', severity: 'info', title: '整合 7-ELEVEN 物流做最後一哩', description: '家樂福線上配送痛點是「最後一哩」。統一集團旗下黑貓宅急便 + 7-ELEVEN 店配可以解決。建議推出「家樂福 x 7-ELEVEN 取貨」模式，利用 6,700 個取貨點。', is_read: false, created_at: isoDate(2), period_start: '2026-02-09', period_type: 'week' },
]

// ────────────────────────────────────────────
// 3. Dashboard
// ────────────────────────────────────────────

const DASHBOARD: DashboardResponse = {
  stats: { total_posts: 12840, avg_sentiment: 0.58, total_sources: 22, period_label: 'Last 7 days' },
  entity_highlights: {
    most_mentioned: ENTITIES.slice().sort((a, b) => b.mention_count - a.mention_count).slice(0, 5),
    most_positive: ENTITIES.slice().sort((a, b) => b.avg_sentiment - a.avg_sentiment).slice(0, 5),
    most_negative: ENTITIES.slice().sort((a, b) => a.avg_sentiment - b.avg_sentiment).slice(0, 5),
  },
}

// ────────────────────────────────────────────
// 4. Observations (24 weeks per entity)
// ────────────────────────────────────────────

// ── 24-week observation patterns: [mentions_per_week, sentiment*100]
// index 0 = most recent week (2026/2/9), index 23 = oldest (2025/8/25)
// Key events in this 24-week window:
//   Week 22 (~9/1):  玉山聯名卡 8/30 到期
//   Week 20 (~9/16): OPENPOINT 整合上線
//   Week 8  (~12/19): 統一宣布終止品牌授權 ← 超級大事件
//   Week 5  (~1/5):  品牌名內部票選啟動
//   Week 4  (~1/12): 大全聯青埔店 12月開幕餘波
//   Week 3  (~1/28): 康達盛通更名公告
//   Week 1  (~2/3):  Mia C'bon 關4店 + 線上購物當機
const OBS_PATTERNS: Record<string, number[][]> = {
  // ── b001 家樂福: 平穩→OPENPOINT小波→12/19大爆發→康達盛通再爆→Mia關店餘波
  b001: [[98,52],[126,48],[148,46],[82,55],[96,54],[68,58],[118,50],[142,50],[168,48],[42,66],[36,68],[34,70],[30,71],[32,71],[34,70],[36,69],[38,68],[42,66],[48,64],[62,62],[86,58],[38,70],[34,71],[32,72]],
  // ── b002 全聯: 穩定基底，12月大全聯青埔店開幕有一波，其餘微幅成長
  b002: [[42,72],[40,71],[38,72],[48,74],[52,73],[44,72],[36,71],[34,72],[38,73],[32,72],[30,71],[28,72],[26,72],[28,71],[30,72],[32,71],[34,72],[30,71],[36,70],[28,71],[26,70],[24,71],[22,70],[20,71]],
  // ── b003 好市多: 很穩定，高雄新店消息(~week 6-4)有小幅上升
  b003: [[28,80],[26,79],[28,80],[34,81],[38,80],[36,79],[30,78],[28,80],[26,79],[24,78],[22,79],[20,80],[22,79],[20,78],[18,79],[20,80],[18,79],[16,78],[18,79],[16,80],[14,79],[14,78],[12,79],[12,80]],
  // ── b004 大潤發: 大全聯更名(~week 20, 8月)有一波，之後逐步消退
  b004: [[8,46],[10,47],[12,46],[16,48],[14,47],[12,46],[10,45],[10,44],[8,44],[8,43],[8,42],[10,42],[12,43],[14,44],[16,45],[18,46],[22,47],[24,48],[28,46],[32,44],[18,42],[14,41],[10,40],[8,40]],
  // ── p001 法式烘焙: 穩定高情感，12月品牌危機後反而微升（消費者討論「不管改名都要買麵包」）
  p001: [[46,83],[44,82],[48,84],[42,83],[40,82],[38,83],[42,84],[44,83],[46,82],[38,81],[36,82],[34,81],[32,80],[30,81],[28,80],[26,81],[24,80],[22,80],[24,81],[22,80],[20,79],[18,80],[16,79],[14,78]],
  // ── p002 自有品牌: 原本低調穩定→12/19品牌授權終止後暴增（去Carrefour標議題）→情感急降
  p002: [[22,58],[24,56],[28,54],[18,60],[16,62],[14,64],[20,56],[26,52],[32,50],[12,68],[10,70],[8,72],[8,72],[6,71],[6,70],[8,68],[6,68],[8,66],[10,64],[6,66],[6,68],[4,70],[4,72],[4,72]],
  // ── p003 紅藜烤雞: 平穩高情感，偶爾PTT烤雞大戰文帶一波小高峰
  p003: [[24,86],[22,84],[26,85],[20,86],[22,84],[18,85],[28,86],[20,84],[32,82],[18,86],[16,85],[24,84],[14,86],[12,85],[14,84],[16,86],[12,85],[10,84],[14,86],[10,85],[8,84],[8,86],[6,85],[6,84]],
  // ── p004 生鮮蔬果: 原本OK→統一調整供應商後持續惡化（情感下滑曲線）
  p004: [[26,44],[24,46],[22,48],[20,50],[18,52],[16,54],[14,56],[12,58],[14,60],[12,62],[10,64],[10,66],[10,68],[8,70],[8,72],[8,72],[6,72],[6,71],[8,70],[6,70],[6,68],[4,68],[4,66],[4,66]],
  // ── p005 線上購物: 低基底→week 1 當機事件暴增（2/3 及 2/7 兩次當機）→情感崩盤
  p005: [[58,28],[42,32],[18,42],[14,44],[16,42],[12,46],[14,48],[16,50],[22,44],[10,54],[8,56],[8,58],[6,58],[8,56],[6,56],[6,54],[8,52],[6,52],[10,48],[6,50],[6,52],[4,54],[4,56],[4,56]],
  // ── p008 聯名卡: week22(卡到期)大爆→OPENPOINT上線又一波→12月品牌新聞又帶一波
  p008: [[8,44],[10,42],[12,44],[10,46],[8,48],[8,50],[14,42],[18,40],[22,38],[6,56],[4,58],[4,60],[6,58],[4,60],[4,62],[6,60],[8,58],[10,54],[14,48],[18,44],[26,40],[22,38],[14,42],[8,52]],
  // ── s001 品牌更名: 12/19之前幾乎為零→大爆發→康達盛通再爆→持續高聲量
  s001: [[62,40],[78,38],[96,36],[52,42],[58,40],[46,44],[82,38],[94,36],[108,34],[8,58],[4,60],[2,62],[2,62],[0,64],[0,64],[2,62],[4,58],[6,54],[8,50],[0,60],[0,60],[0,60],[0,60],[0,60]],
  // ── s002 週末量販: 非常穩定，小幅波動（週末vs平日節奏），年底微升（年貨）
  s002: [[22,68],[24,69],[22,68],[26,70],[24,69],[28,72],[26,70],[24,68],[22,67],[20,68],[18,69],[20,68],[22,67],[20,68],[18,69],[16,68],[18,67],[16,68],[18,69],[16,68],[14,67],[14,68],[12,67],[12,66]],
  // ── s004 烘焙甜點: 穩定高情感，偶爾有社群分享文帶波動
  s004: [[18,82],[16,80],[20,84],[14,82],[16,80],[18,82],[14,83],[16,81],[18,83],[12,82],[14,80],[12,82],[16,84],[10,82],[12,80],[10,82],[8,81],[10,80],[8,82],[8,80],[6,81],[6,80],[4,81],[4,80]],
  // ── s003 線上買菜: 基底穩定偏負→week 1 當機暴增→情感最近很差
  s003: [[34,34],[28,38],[18,42],[14,44],[16,42],[12,46],[14,48],[16,50],[20,44],[10,52],[12,50],[10,52],[8,54],[10,52],[8,54],[8,52],[10,50],[8,50],[12,46],[8,48],[8,50],[6,52],[6,54],[6,54]],
  // ── s005 會員點數: week20 OPENPOINT上線暴增→逐漸消退→12月品牌新聞又帶一波
  s005: [[14,46],[16,44],[18,42],[12,48],[10,50],[10,52],[16,44],[18,42],[22,40],[8,56],[6,58],[6,60],[4,60],[4,58],[6,56],[8,54],[10,52],[14,48],[20,44],[28,40],[38,36],[18,42],[12,48],[8,52]],
  // ── e001 收購: 24週前就已是舊聞，但12月品牌授權終止後被重新提起
  e001: [[18,50],[20,48],[22,46],[16,52],[14,54],[12,56],[26,48],[32,46],[42,44],[8,60],[6,62],[6,64],[4,64],[4,64],[4,62],[6,58],[4,60],[6,56],[8,54],[4,58],[4,60],[2,62],[2,64],[2,64]],
  // ── e005 門市縮減: 持續有關店消息→week1 Mia C'bon 4店大波→之前零星
  e005: [[42,28],[38,30],[18,34],[14,36],[12,38],[10,40],[16,32],[22,30],[28,28],[8,42],[6,44],[10,38],[8,40],[6,42],[4,44],[4,44],[6,38],[8,36],[12,32],[4,40],[4,42],[2,44],[2,44],[2,46]],
  // ── e006 OPENPOINT: week20大爆發→快速消退→12月品牌新聞小回升
  e006: [[8,50],[10,48],[12,46],[8,52],[6,54],[6,54],[10,48],[12,46],[14,44],[4,56],[4,56],[2,56],[2,56],[2,54],[4,52],[6,50],[8,48],[14,44],[22,42],[32,38],[42,34],[8,46],[4,50],[2,52]],
  // ── p006 APP: week1當機暴增，平時低迷
  p006: [[38,32],[28,36],[14,42],[12,44],[10,46],[10,44],[12,42],[14,40],[18,38],[8,48],[6,50],[6,48],[8,46],[6,48],[6,46],[8,44],[6,44],[8,42],[12,38],[6,42],[6,44],[4,46],[4,48],[4,48]],
  // ── p007 法國進口: 穩定→12月品牌新聞後微升（消費者擔心進口線斷裂）
  p007: [[14,76],[12,78],[16,76],[12,78],[10,76],[10,78],[14,74],[16,72],[18,70],[8,78],[8,80],[6,80],[6,80],[6,78],[4,78],[4,78],[4,76],[6,76],[8,74],[4,76],[4,78],[4,78],[2,78],[2,78]],
  // ── p009 DM: 穩定，年底略升（年貨DM），最近微降（品項減少議題）
  p009: [[10,60],[12,62],[10,62],[14,64],[12,62],[16,66],[14,64],[12,62],[14,60],[10,64],[8,64],[10,66],[8,64],[8,64],[8,62],[8,62],[6,64],[6,64],[8,62],[6,62],[6,64],[4,64],[4,62],[4,62]],
  // ── s006 進口食材: 穩定偏高，12月品牌新聞後微升
  s006: [[12,76],[10,74],[14,76],[10,78],[10,76],[8,76],[12,74],[14,72],[16,70],[8,78],[6,78],[6,78],[6,78],[4,76],[4,76],[4,76],[6,74],[4,76],[6,74],[4,76],[4,76],[2,76],[2,76],[2,76]],
  // ── s007 年節禮盒: 明顯季節性——年底大爆發（農曆新年採購潮），平時幾乎沒討論
  s007: [[8,70],[28,74],[42,76],[38,74],[32,72],[18,70],[8,68],[4,68],[4,66],[2,66],[2,66],[2,66],[2,64],[2,64],[2,64],[2,64],[2,64],[2,64],[4,66],[2,64],[2,64],[2,64],[2,62],[2,62]],
  // ── s008 小家庭日常: 極度穩定，幾乎不波動
  s008: [[12,62],[10,62],[12,64],[10,62],[12,62],[10,62],[10,64],[12,62],[10,62],[10,62],[8,62],[10,64],[8,62],[8,62],[8,64],[8,62],[8,62],[6,62],[8,64],[6,62],[6,62],[6,62],[4,62],[4,62]],
  // ── b005 統一: 隨子公司事件波動——OPENPOINT(w20)、品牌授權終止(w8)、康達盛通(w3)
  b005: [[16,64],[18,62],[28,58],[14,66],[16,64],[12,66],[22,60],[26,58],[32,56],[8,68],[6,68],[6,68],[4,68],[6,66],[6,66],[8,64],[10,62],[12,60],[16,58],[22,54],[14,60],[8,64],[6,66],[4,66]],
  // ── b008 Mia C'bon: 平時極低→week1 關4店大爆發→之前偶爾有關店消息
  b008: [[22,42],[18,46],[6,58],[4,60],[4,62],[4,62],[6,56],[8,52],[10,48],[2,66],[2,66],[2,66],[2,66],[2,64],[2,64],[2,64],[2,62],[4,58],[6,54],[2,62],[2,64],[2,64],[2,64],[2,64]],
  // ── e002 品牌授權到期: week8(12/19)大爆→之前少量傳聞→之後被s001取代
  e002: [[12,40],[14,38],[18,36],[16,38],[14,40],[16,42],[32,36],[42,34],[56,32],[4,52],[2,54],[4,50],[6,48],[8,46],[10,44],[12,42],[8,46],[6,48],[4,50],[2,52],[2,54],[2,56],[0,58],[0,58]],
  // ── e003 康達盛通: week3(1/28)爆發→之前為零→之後持續嘲諷
  e003: [[28,32],[32,30],[38,28],[56,26],[42,30],[14,36],[4,40],[2,44],[2,46],[0,50],[0,50],[0,50],[0,50],[0,50],[0,50],[0,50],[0,50],[0,50],[0,50],[0,50],[0,50],[0,50],[0,50],[0,50]],
  // ── e004 烘焙祭: 活動期間(約week 14-10)爆發，其餘極低
  e004: [[4,82],[4,82],[4,82],[4,82],[4,82],[6,82],[8,82],[8,84],[10,84],[16,84],[28,86],[36,84],[32,82],[22,84],[8,82],[4,82],[4,80],[2,80],[2,80],[2,80],[2,80],[2,80],[2,78],[2,78]],
  // ── k003 烘焙社團: 穩定高情感，小幅波動隨烘焙話題
  k003: [[18,84],[16,82],[20,86],[14,84],[16,82],[14,84],[16,82],[18,84],[16,82],[14,84],[12,82],[14,84],[12,82],[10,84],[10,82],[8,84],[8,82],[6,84],[8,82],[6,84],[6,82],[4,84],[4,82],[4,82]],
  // ── k006 PTT省錢版: 隨大事件波動——OPENPOINT(w20)+品牌授權(w8)帶動精算文
  k006: [[16,50],[14,52],[18,48],[12,54],[10,52],[10,54],[18,46],[22,44],[26,42],[8,56],[6,56],[6,56],[4,56],[4,54],[6,52],[8,50],[10,48],[12,46],[16,44],[22,40],[28,38],[8,48],[6,50],[4,52]],
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
      return { period_start: weekDate(i), period_type: 'week', mention_count: mentions, avg_sentiment: sentiment, positive_count: pos, negative_count: neg, neutral_count: neu, mixed_count: mix }
    })
  }
  return Array.from({ length: 24 }, (_, i) => {
    const wave = Math.sin(i * 0.6) * 0.15
    const mentions = Math.max(1, Math.round(baseMentions / 12 * (1 + wave + (11 - i) * 0.02)))
    const sentiment = Math.min(0.98, Math.max(0.1, baseSentiment + wave * 0.3))
    const pos = Math.round(mentions * sentiment)
    const neg = Math.round(mentions * (1 - sentiment) * 0.6)
    const neu = Math.max(0, mentions - pos - neg - 1)
    return { period_start: weekDate(i), period_type: 'week', mention_count: mentions, avg_sentiment: Math.round(sentiment * 100) / 100, positive_count: pos, negative_count: neg, neutral_count: Math.max(0, neu), mixed_count: Math.max(0, mentions - pos - neg - Math.max(0, neu)) }
  })
}

// ────────────────────────────────────────────
// 5. Entity Detail Generators
// ────────────────────────────────────────────

const ASPECT_POOL: Record<string, string[]> = {
  brand:        ['價格', '品質', '品牌形象', '門市環境', '服務態度', '商品多樣性', '促銷活動', '停車便利', '結帳速度', '會員回饋', '生鮮品質', '熟食品質'],
  product:      ['品質', '價格', 'CP值', '新鮮度', '口味', '包裝', '份量', '穩定度', '種類', '產地'],
  scenario:     ['便利性', '價格敏感', '品質要求', '時間效率', '體驗感', '多樣性'],
  place:        ['停車', '動線', '乾淨度', '服務態度', '結帳速度', '商品齊全', '試吃', '營業時間'],
  person:       ['可信度', '內容品質', '影響力', '互動', '專業度'],
  event:        ['影響範圍', '消費者反應', '媒體曝光', '持續時間'],
  organization: ['政策影響', '監管力度', '公平性', '透明度'],
}

const ENTITY_ASPECTS: Record<string, [string, number][]> = {
  b001: [['烘焙品質', 0.28], ['法國進口商品', 0.22], ['紅藜烤雞', 0.25], ['量販空間體驗', 0.10], ['品牌更名焦慮', -0.28], ['生鮮品質', -0.15], ['線上購物體驗', -0.30], ['會員系統轉換', -0.20], ['DM 促銷', 0.08], ['門市服務', 0.02], ['停車便利', 0.06], ['結帳速度', -0.08], ['關店恐慌', -0.25], ['員工穩定度', -0.18]],
  b002: [['價格便宜', 0.22], ['門市密度', 0.18], ['PXGo 線上購', 0.12], ['生鮮品質', 0.08], ['自有品牌', 0.15], ['大全聯轉型', 0.10], ['停車不便', -0.12], ['賣場擁擠', -0.08], ['熟食品質', 0.05], ['小資首選', 0.20], ['聯名行銷', 0.15], ['咖啡寄杯', 0.18]],
  b003: [['商品品質', 0.25], ['獨家商品', 0.22], ['試吃大方', 0.20], ['會員制', 0.15], ['量體大', 0.10], ['停車方便', 0.12], ['價格偏高', -0.05], ['排隊結帳', -0.10], ['年費爭議', -0.02], ['退貨友善', 0.18]],
  b004: [['更名混亂', -0.22], ['商品縮減', -0.18], ['員工流失', -0.15], ['改裝陣痛', -0.12], ['價格調整', -0.10], ['品牌消失', -0.20], ['全聯化', -0.08], ['量販感消失', -0.14]],
  p001: [['法棍口感', 0.30], ['可頌層次', 0.25], ['蝴蝶酥', 0.22], ['現烤時段', 0.18], ['價格合理', 0.15], ['師傅專業', 0.20], ['品項穩定度', 0.08], ['排隊值得', 0.12]],
  p002: [['法國原裝進口', 0.20], ['品質可信', 0.15], ['價格偏高', -0.08], ['Carrefour 標', -0.22], ['與一般品牌差異', 0.10], ['品項齊全度', 0.05], ['更名後辨識', -0.25], ['有機認證', 0.12], ['包裝設計', 0.08]],
  p003: [['CP 值', 0.28], ['份量', 0.22], ['口味', 0.25], ['配菜', 0.15], ['紅藜健康', 0.18], ['熱度', 0.08]],
  p004: [['新鮮度', -0.18], ['品項多樣', 0.08], ['價格', 0.05], ['有機選擇', 0.10], ['產地標示', -0.05], ['供應穩定', -0.12], ['包裝', -0.08]],
  p005: [['配送速度', -0.28], ['APP 穩定度', -0.25], ['缺貨問題', -0.22], ['客服回應', -0.20], ['介面設計', -0.15], ['退貨流程', -0.12], ['價格透明', -0.08], ['促銷通知', 0.05]],
  s001: [['品牌認知', -0.25], ['新名稱接受度', -0.28], ['商品延續性', -0.15], ['員工信心', -0.20], ['法式元素保留', 0.08], ['統一資源', 0.10], ['時間壓力', -0.22]],
  s002: [['停車空間', 0.12], ['試吃體驗', 0.18], ['DM 特價', 0.15], ['賣場動線', 0.08], ['結帳排隊', -0.10], ['品項齊全', 0.10]],
  s003: [['配送時效', -0.25], ['生鮮品質', -0.18], ['APP 體驗', -0.22], ['缺貨率', -0.20], ['取貨便利', -0.08], ['退貨容易', -0.12], ['價格', 0.05]],
  e001: [['收購價格', 0.05], ['員工權益', -0.15], ['品牌延續', -0.20], ['統一資源', 0.12], ['市場壟斷', -0.10], ['消費者選擇', -0.08], ['產業整合', 0.05]],
  e005: [['社區影響', -0.25], ['員工安置', -0.20], ['替代選擇', -0.15], ['品牌信心', -0.28], ['商圈影響', -0.18], ['消費者恐慌', -0.22]],
}

function generateAspects(type: string, count: number, baseSentiment: number, entityId?: string): AspectSummary[] {
  const entityAspects = entityId ? ENTITY_ASPECTS[entityId] : undefined
  if (entityAspects) {
    return entityAspects.slice(0, count).map(([aspect, mod], i) => {
      const total = Math.max(2, Math.round(20 - i * 1.8 + Math.sin(i * 1.7) * 4))
      const sentiment = Math.min(0.98, Math.max(0.05, baseSentiment + mod))
      const pos = Math.round(total * sentiment)
      const neg = Math.round(total * (1 - sentiment) * 0.7)
      return { aspect, total, avg_sentiment: Math.round(sentiment * 100) / 100, positive_count: pos, negative_count: neg, neutral_count: Math.max(0, total - pos - neg) }
    })
  }
  const pool = ASPECT_POOL[type] ?? ASPECT_POOL.brand
  return pool.slice(0, count).map((aspect, i) => {
    const total = Math.max(2, Math.round(20 - i * 2.5 + Math.sin(i) * 3))
    const sentiment = Math.min(0.98, Math.max(0.1, baseSentiment + (Math.cos(i * 1.3) * 0.25)))
    const pos = Math.round(total * sentiment)
    const neg = Math.round(total * (1 - sentiment) * 0.7)
    return { aspect, total, avg_sentiment: Math.round(sentiment * 100) / 100, positive_count: pos, negative_count: neg, neutral_count: Math.max(0, total - pos - neg) }
  })
}

// ── Realistic mention templates based on real PTT/Dcard/News research ──
// {name} = entity canonical name, {alias} = random alias, {price} = random realistic price
const MENTION_POOL: Record<string, string[]> = {
  brand: [
    // PTT — 日常購物、特價、比價
    '今天去{name}補貨 衛生紙$199/12包 洗衣精買一送一 推車塞滿花了$2800 比上個月多了$400 物價真的在漲',
    '每次去{name}都預算爆表 明明只是要買牛奶跟雞蛋 出來推車是滿的 烘焙區跟零食區根本黑洞',
    '{name}週三品牌日88折 我都固定週三去掃貨 衛生紙洗衣精沐浴乳一次補齊 一個月省好幾百',
    '有人發現{name}最近DM特價品項越來越少嗎 以前翻DM可以圈二十幾個 現在十個都不到 唉',
    '剛從{name}回來 停車場繞了20分鐘才找到位子 結帳又排了15分鐘 假日去量販真的需要心理準備',
    '推 {name}蝴蝶酥一包才89 送人自用兩相宜 我同事每次都叫我幫帶 已經變成我的副業了',
    '{name}的可頌$50真的不輸吳寶春 我法國朋友吃了也說讚 這CP值根本佛心',
    '比較了一下 {name}的進口起司比city\'super便宜20-30趴 品項也多 法國Comté一塊$289 外面至少$400',
    '每次經過{name}烘焙區就被香味勾走 法棍$55出爐3小時內真的有水準 可頌也必買',
    '{name}自助結帳越來越好用了 比排人工快很多 就是條碼偶爾刷不到會卡住',
    '噓 {name}那個app介面是誰設計的 找個商品要滑半天 分類邏輯不通 搜尋也搜不到 比PXGo差太多',
    '覺得{name}線上購物爛到不行 上次訂了三天沒到貨 打客服沒人接 最後自己跑去門市買 氣死',
    '{name}冷凍白蝦最近品質不行 以前很飽滿 最近買到兩次都偏小 是供應商換了嗎',
    '逛{name}最爽的就是量販空間感 推車可以舒服的走 比全聯寬敞太多 逛起來像在國外超市',
    '帶我媽去{name} 她一進烘焙區就走不出來 最後扛了兩袋麵包出來 每次都這樣',
    '{name}紅酒節太猛了 500多款酒 法國義大利西班牙都有 試喝了三圈買了六瓶 我太太問我是不是有病',
    '說個冷知識 {name}全台386間店 量販63＋超市302＋Mia 21 營收800億 你猜市佔多少？才14.9趴',
    '今天在{name}試吃區吃到飽 起司火腿紅酒都有 小孩吃得超開心 這才是量販的魅力啊',
    '上班前繞去{name}超市買便當跟咖啡 $99便當配$45美式 比外面隨便吃一餐便宜多了',
    '{name}生鮮區最近好像在改裝 動線整個亂掉 找不到平常買的東西 問員工他也不確定',
    '有沒有人跟我一樣 每週固定去{name}採購的 我都週三去刷品牌日 週末人太多受不了',
    '{name}的法國進口巧克力區是寶藏 Valrhona一片$89 外面專櫃賣$150 買五送一更划算',
    '推{name}的冷凍水餃 高麗菜豬肉40入$159 煮一鍋全家吃到飽 懶人救星',
    '去{name}就是為了法國進口起司跟紅酒 這些東西全聯跟好市多都沒有 真的獨一無二',
    // Dcard — 日常分享
    '分享一下我在{name}的戰利品～可頌蝴蝶酥法棍都買了 加上牛奶跟雞蛋 $387 幸福感爆棚🥐',
    '天啊{name}的紅藜烤雞真的好好吃 我室友每次都要我帶一隻回來 現在每週都去搶 根本例行公事了',
    '有人用過{name}的線上購物嗎？想省時間不出門但看評價好像很爛 有沒有人分享經驗～',
    '剛搬到新家 發現走路5分鐘就有{name}超市 牛奶雞蛋都比全聯便宜一點 小資族的福音✨',
    '{name}的蝴蝶酥帶去公司分享 同事全部淪陷 現在每個禮拜都有人託我買 我真的變代購了🤣',
    '週末跟男友去{name}逛 本來只要買泡麵 結果他在3C區不走了 我在零食區也走不出來 最後花了$3500',
    // News — 產業、營收
    '{name}年度紅酒節今日開跑，引進逾500款法國、義大利、西班牙等產地葡萄酒。業者表示，今年特別增加小農酒莊比例，主打「產地直送」概念。',
    '據統計，{name}烘焙區年營收突破數十億元，其中法棍、可頌、蝴蝶酥為三大暢銷品項。業者透露，中央工廠採用法國進口麵粉。',
    '零售通路進入淡季，{name}推出會員日滿$1500送$100折價券活動，帶動來客數成長8%。量販業者分析，折價券回流率約六成。',
    // Google 評論
    '⭐⭐ {name}最近生鮮品質很差 買的蘋果切開裡面爛的 跟店員反映還被態度很差的對待 失望',
    '⭐⭐⭐⭐⭐ {name}烘焙區大推！法棍出爐時間去就對了 可頌層次分明 蝴蝶酥香脆 價格便宜 唯一會讓我特地跑來的理由',
    '⭐⭐⭐ {name}整體還可以 停車方便但最近收銀員人手不足 排隊排很久 生鮮也不如以前新鮮',
    '⭐ {name}線上購物真的爛 訂了等三天不到 客服打不通 最後自己去門市買 以後不會再用了',
    '⭐⭐⭐⭐ 從小逛{name}長大的 現在帶小孩來 烘焙區和進口食品還是很棒 老牌量販就是讚',
    // Mobile01
    '分析一下{name}跟全聯的差異：停車（{name}大勝）、價格（全聯略勝）、進口商品（{name}大勝）、線上體驗（全聯大勝）',
    '請問{name}的冷凍牛排品質如何？看到DM上安格斯肋眼$399/片 想問有沒有人買過',
    // Facebook
    '今天去{name}買了好多菜 茄子一袋$29 高麗菜$35 番茄$45 比傳統市場便宜又乾淨 大推！',
    '{name}的DM這禮拜有衛生紙跟洗衣精特價喔！量販就是要看DM買才划算～品項蠻多的😊',
    '帶孫子去{name}逛 他在試吃區吃到不想走 最後買了一堆零食回來 量販店就是小孩的天堂❤️',
  ],
  product: [
    // PTT — 商品討論、評價、比價
    '每次去家樂福就是為了買{name} 不買我活不下去 一個禮拜沒吃就覺得人生少了什麼',
    '{name}最近品質有變欸 上次口感跟之前差很多 是換供應商了嗎？有沒有八卦',
    '推一個{name} CP值屌打一堆名店 花不到300塊全家吃到飽 週末去搶都值得',
    '靠北{name}偷偷漲了$20 以為我不會發現嗎 之前特價$199現在$219 心情差',
    '說真的 家樂福的{name}在量販通路裡面真的頂的 全聯好市多都比不上 不接受反駁',
    '身為兩個小孩的媽 {name}是我每週固定補貨清單第一名 便宜新鮮份量大 家庭主婦必備',
    '老公又從家樂福扛了一箱{name}回來 說什麼特價不買對不起自己 好吧真的不錯',
    '有人發現{name}品項最近一直在縮嗎？之前至少有20幾種 現在剩不到15種',
    '今天去家樂福搶到{name}最後一組特價 差點跟前面阿姨打起來 她推車直接插隊 但我手速比較快哈哈',
    '{name}出爐的前30分鐘一定要到 晚了就只剩歪掉的或被翻過的 烘焙區大媽戰力太強',
    '大推家樂福{name} 我法國同學吃了都說接近巴黎水準 一條$55在法國都買不到',
    '踩雷...{name}這批品質真的爛 不知道是不是放太久 口感完全不對 希望只是個案',
    '幫{name}打call 帶去公司分享同事全部淪陷 現在每個禮拜都有人託我買 我變成代購了',
    '我家冰箱永遠有家樂福的{name} 小孩超愛 比外面麵包店便宜一半以上 品質穩定',
    '{name}在全聯買不到 好市多也沒有 這就是我去家樂福的理由 獨家就是香',
    '上次買{name}回家配紅酒 一個人的晚餐也可以很有儀式感 花不到$500就很開心',
    // Dcard
    '分享我的{name}開箱～天啊真的超好吃 外酥內軟 配一杯咖啡就是完美的早餐 而且才銅板價🥐☕',
    '第一次買{name} 被驚艷到了！跟朋友說他們都不信量販店能做出這種品質 下次帶他們去',
    '{name}買回來隔天就不行了 所以一定要當天吃完 唯一的缺點 但也代表沒加防腐劑吧',
    '有沒有人跟我一樣 每次去家樂福都直衝烘焙區搶{name}～其他東西都是順便買的🤣',
    '被閨蜜帶去家樂福買{name} 從此愛上 每週都去報到 錢包在哭但嘴巴在笑',
    // Google 評論
    '⭐⭐⭐⭐⭐ {name}是家樂福必買！每次都要搶 品質穩定價格實惠 量販店裡的隱藏冠軍',
    '⭐⭐ {name}這次踩雷 不知道是不是個案 吃起來味道不對 以前不會這樣',
    '⭐⭐⭐⭐ {name}整體很推 就是有時候會缺貨 尤其假日下午去幾乎都搶光',
    // News
    '家樂福旗下暢銷商品{name}年銷售額突破新高，據業者透露，單品年營收已突破億元大關，是量販通路少見的明星單品。',
    '量販通路生鮮即食市場持續成長，{name}為家樂福營收主力品項之一。業者表示，消費者對即食商品的品質要求日益提升。',
    // IG
    '今日戰利品🛒 家樂福的{name}真的每次都要帶 放在IG被問了無數次在哪買 #家樂福 #量販好物 #銅板美食',
    '週末的小確幸就是一杯拿鐵配家樂福的{name}☕🥐 平價又美味 幸福感拉滿 #家樂福烘焙 #brunch',
  ],
  scenario: [
    // PTT — 週末量販採購
    '週末{name}去家樂福根本戰場 停車場繞了25分鐘 進去推車塞在走道動不了 但DM特價真的便宜 只能忍',
    '{name}就是要全家出動 小孩在試吃區吃到飽 老婆在生鮮挑菜 我在烘焙區搶法棍 完美分工',
    '每次{name}都預算爆炸 說好只買必需品 結果推車裝滿 烘焙區跟零食區根本黑洞',
    '上禮拜{name}遇到衛生紙特價12包$199 直接搬三組 推車差點推不動 省下來的錢夠吃一頓',
    // Dcard — 線上買菜
    '有人用過家樂福線上買菜嗎？{name}體驗好差 訂了三天才到 少了兩樣東西 客服打不通～',
    '本來想說{name}很方便不用出門 結果送來的蔬菜軟掉了 冷鏈是不是沒做好',
    '比較了一下{name}幾個平台 PXGo比家樂福穩太多 家樂福app光是搜尋功能就很難用',
    '{name}配送時段超難預約 每次都顯示已滿 好不容易約到又延遲 體驗需要改善～',
    // Dcard — 烘焙甜點
    '被閨蜜帶去{name}直接愛上家樂福烘焙區～可頌$50蝴蝶酥$89法棍$55 全買一輪不到200 太幸福了',
    '分享{name}路線：下午2點到→直衝烘焙區→法棍剛出爐→搶2條→順便拿可頌→結帳→完美～🥖✨',
    '每次{name}都在烘焙區待最久 光看師傅揉麵團就療癒 然後不小心買太多',
    // PTT — 年節採購
    '過年{name}去家樂福最划算 禮盒種類多 法國進口的選擇送客戶比全聯有面子',
    '今年{name}打算去家樂福掃年貨 禮盒組合包看起來不錯 烤雞+法棍+紅酒 一組$899',
    '中秋{name}家樂福烤肉用品超齊全 從木炭到醬料到肉品一站買完 不用跑傳統市場',
    // Dcard — 日常補貨
    '身為小資族{name}地點選擇超重要 家附近有家樂福超市走路5分鐘 牛奶雞蛋都比全聯便宜一點',
    '每個月固定去家樂福{name}一次 列好清單快速掃完 最怕烘焙區讓我失控加購',
    '租屋族{name}分享 冷凍水餃配青菜就是一餐 家樂福冷凍區品項比全聯多很多',
    // PTT — 比價精算
    '認真比較{name}三大量販：家樂福進口強空間大、好市多品質穩大包裝、全聯便宜又近 結論是都要去',
    '個人觀察 {name}：停車（家樂福＞全聯）、價格（全聯略勝）、進口商品（家樂福大勝）、線上體驗（全聯大勝）',
    // News
    '據統計，量販通路在{name}扮演重要角色。家樂福表示，節慶前兩週來客數平均成長25%，禮盒與生鮮品項為主要銷售動能。',
    // Facebook
    '每週{name}都去家樂福 今天買了好多蔬菜水果 茄子一袋才$29 番茄$45 量販真的比市場便宜又方便❤️',
  ],
  person: [
    '{name}推的那款法國紅酒我也去家樂福買了 Château Saint-Pierre 一瓶才$399 真的蠻順口 推推',
    '{name}最新一期團購又秒殺了 這次是家樂福年貨組合包 烤雞＋法棍＋進口巧克力 $599太划算',
    '看了{name}那篇量販烘焙評比才知道家樂福法棍有多強 從此每週去搶 確實不蓋的',
    '追蹤{name}三年了 推薦的量販好物幾乎沒踩過雷 這次推的冷凍白蝦也是 解凍後又大又彈',
    '{name}的省錢攻略真的實用 教你怎麼看DM算單價比較 我照著做一個月省了快兩千',
    '覺得{name}的商品評測很客觀 不像一些網紅拿了錢就說好話 真的會說缺點 家樂福app那篇就罵很兇',
    '{name}那篇法棍評測看了口水流到不行 照著出爐時間表去搶 果然現烤的完全不一樣🤤',
    '推{name}！每次家樂福有什麼新品都第一時間報 法國松露薯片就是看他介紹才知道的',
    '{name}直播開箱家樂福紅酒節酒款 專業度真的高 看完直接殺去搬了四瓶 老婆差點翻臉',
    '{name}在社團分享的可頌食譜我試了 但還是比不上家樂福現烤的 算了 花$50去買比較快',
    '{name}昨天發了一篇家樂福冷凍食品評比 CP值之王是高麗菜水餃40入$159 他推的都蠻準的',
    '{name}教的量販省錢術：1.週三品牌日 2.對照DM算單價 3.大包裝不一定便宜 4.烘焙區出爐才買 學到了',
    '{name}的家樂福必買清單我全照買了 法棍$55 蝴蝶酥$89 進口巧克力$89 Comté起司$289 全部讚',
  ],
  place: [
    '推{name}的烘焙區 那個香味一走進去就受不了 今天搶到剛出爐的法棍兩條 排了15分鐘但值得',
    '去{name}結帳排超久 前面阿姨還在慢慢數零錢 自助結帳機兩台壞一台 人手不足感覺很明顯',
    '{name}假日停車場爆滿 繞了三層樓才找到位子 建議9點開門前就到 不然停外面再走進來也行',
    '今天在{name}的試吃區大豐收 法國起司、火腿、紅酒都有 吃完直接買了兩塊起司 根本衝動消費',
    '{name}最近好像在改裝 二樓動線整個亂掉 找不到平常買的東西 問員工他自己也不確定移到哪了',
    '{name}的生鮮區確實比一般超市大很多 蔬菜水果魚肉都有 比較麻煩的是結帳排隊 尤其假日',
    '⭐⭐⭐⭐ {name}停車方便 量販空間寬敞 商品種類多 烘焙區是一大亮點 缺點是假日人太多 員工有時態度普通',
    '每次來{name}都要去烘焙區報到 然後去進口食品區挖寶 法國巧克力跟松露系列是我的最愛',
    '{name}附近剛開了一間全聯 我比較了一下 全聯日常用品便宜但生鮮和進口品項差太多 各有優劣',
    '帶小朋友來{name} 他們最愛試吃區 我最愛烘焙區 爸爸最愛3C區 全家各取所需 完美',
    '⭐⭐ {name}的生鮮品質最近真的下滑 上次買的牛肉變色了 蔬菜也不新鮮 希望只是暫時的',
    '{name}最近的員工態度比以前好了 結帳時還會主動幫忙裝袋 之前完全不理人 是換了管理方式嗎',
    '推推{name} 這間的冷凍食品區比其他分店大 進口冰淇淋種類超多 每次都失控多買兩盒',
    '{name}的自助結帳終於修好了 現在有四台 速度快很多 假日去比較不用排那麼久了',
    '上次在{name}遇到紅酒節特賣 法國酒一區一區試喝 喝完買了八瓶 我太太說我有病',
  ],
  event: [
    '趁著{name}特賣衝去家樂福掃了一堆 結帳排了半小時 但省下來的錢值得 推車差點推不動',
    '{name}第一天就去排了 法國紅酒區人山人海 試喝了五六種 最後買了三瓶 假日去量販就是這樣',
    '{name}今年引進的酒款比去年多 多了好幾款小農莊的 價格也很甜 法國直送的品質確實不一樣',
    '{name}的時候家樂福人潮爆滿 停車場排到馬路上 推車塞在走道上動不了 但特價真的便宜 只能忍',
    '每年{name}都是家樂福最熱鬧的時候 禮盒區超多選擇 法國進口的送客戶特別有面子',
    '{name}搶到限量的法國松露禮盒$999 朋友說外面要賣$1800 只有家樂福有這個價格',
    '帶小孩去{name} 他們在試吃區吃到不想走 買了一堆零食跟餅乾 家長的錢包在淌血',
    '{name}開始了 家樂福DM這禮拜超多特價品 衛生紙洗衣精全部囤起來 一年一度的機會',
    '{name}最後一天了 趕快去掃最後的特價品 冷凍肉品區被搬光了 只剩一些乏人問津的品項',
    '據統計，{name}期間家樂福來客數較平日成長45%，營收較去年同期成長12%。業者表示，法國進口商品及烘焙品項為主要銷售動能。',
    '{name}帶動量販通路整體業績。業者指出，消費者越來越重視購物體驗，單純的價格戰已不足以吸引人潮，差異化商品才是關鍵。',
    '朋友揪去{name} 本來只是湊人數 結果我買最多 冷凍區和零食區太誘人了 回家被老婆唸了一頓',
  ],
  organization: [
    '看了{name}的報告才知道台灣量販業前三大市佔加起來83趴 市場集中度越來越高',
    '{name}出來的數據很有參考價值 量販通路市佔從十年前的分散到現在高度集中',
    '{name}最新的零售市場分析報告 家樂福在進口食品市佔率還是最高 這塊護城河很深',
    '根據{name}的調查 消費者對量販通路的滿意度 家樂福在空間感跟商品多樣性上排名第一',
    '{name}有在追蹤量販通路的客訴數據嗎？希望公開透明 讓消費者有更好的選擇依據',
    '{name}對台灣零售產業的分析很到位 尤其是冷鏈物流和數位轉型那一段 建議量販業者都看看',
  ],
}

// ── Entity-specific mention pools (override type-based when available) ──
// These contain hyper-specific content based on real PTT/Dcard/News research
const ENTITY_MENTION_POOL: Record<string, string[]> = {
  // ═══════════════════════════════════════════
  // b001: 家樂福 — 核心品牌，最多討論
  // ═══════════════════════════════════════════
  b001: [
    // PTT — 日常購物（佔大多數）
    '今天去家樂福 又被烘焙區的香味勾走 推車多了兩袋麵包 這招百試百靈 每次都中',
    '家樂福最大的賣點就是量販空間感 推車可以舒服走 逛起來像國外超市 全聯那擁擠感不行',
    '自助結帳這點家樂福做得不錯 比全聯人工收銀快很多 四台同時運作假日也不太用排',
    '家樂福DM特價確實便宜 但精算的話 大部分日常用品全聯更便宜 家樂福贏在品項多和空間好',
    '去家樂福就是一個體驗 小孩去試吃區 老婆在生鮮 我在酒類區 逛完吃個熟食便當 完美週末',
    '週三去家樂福掃貨了 品牌日88折 衛生紙洗衣精沐浴乳一次補齊 算一算省了$300多',
    '家樂福冷凍區的白蝦$349/600g 解凍後Q彈飽滿 比傳統市場便宜而且品質穩定 固定回購',
    '今天在家樂福買到法國進口的Comté起司$289 city\'super同一款要$420 價差太大了',
    '每次去家樂福結帳都破$3000 明明只是要買牛奶雞蛋 烘焙區零食區就是控制不住 尤其帶小孩',
    '家樂福的停車場假日爆滿 繞了三層才找到位子 建議9點開門前就到 不然得停外面走進來',
    '推一下家樂福的法國紅酒區 Château Saint-Pierre $399 很順口 同事聚餐帶了兩瓶 大家都說讚',
    '家樂福試吃區今天有法國起司跟火腿 吃了三圈不好意思 結果直接買了兩塊起司$580 衝動消費代表',
    '上班前繞去家樂福超市買咖啡$45加三明治$55 比便利商店便宜 而且品質好很多 每天都這樣',
    '家樂福 vs 全聯 vs 好市多 我的結論：日常去全聯、囤貨去好市多、想要「逛」的感覺去家樂福',
    '噓 家樂福app介面到底是誰設計的 找商品要滑半天 搜尋也搜不到 PXGo屌打好幾條街',
    '家樂福線上購物訂了三天沒到 打客服等40分鐘沒人接 最後自己去門市買 以後不用了',
    '我家冰箱永遠有家樂福的法棍跟可頌 小孩早餐指定要吃 一條$55比外面麵包店便宜一半',
    '說個冷知識 家樂福全台386間店 量販63＋超市302＋Mia 21 營收800億 市佔14.9趴',
    '有人算過嗎 統一掌控7-11(6700店)+星巴克(550店)+家樂福(386店) OPENPOINT生態圈其實超猛',
    // PTT — 少量改名相關（約25%）
    '家樂福三大支柱：烘焙、進口商品、紅藜烤雞 只要這三個不動 叫什麼名字我都ok',
    '最怕的就是改名後法國供應鏈斷了 Carrefour獨家代理的起司紅酒巧克力全台只有家樂福有',
    '家樂福年營收700-800億 市佔14.9趴 排第三 全聯41.3趴好市多26.6趴 差距蠻大',
    '統一花了301億買家樂福 但品牌是品牌 只要烘焙跟進口不動 其他慢慢來也行',
    '2026年中近400家門市要換招牌 量販63間+超市302間 工程超大 到時候應該蠻壯觀',
    // Dcard — 日常分享
    '分享一下從大學就在旁邊的家樂福買東西 畢業搬走後最懷念的竟然是烘焙區的味道 有人懂嗎～',
    '家樂福的蝴蝶酥帶去辦公室 同事瘋狂敲碗 現在每週都幫帶 $89一包送禮自用兩相宜🥐',
    '比較了一下家樂福跟好市多的烤雞 家樂福紅藜烤雞$269肉質比較紮實 好市多$289大但偏柴',
    '剛發現家樂福超市牛奶比全聯便宜$3 雞蛋也便宜$5 每天買下來一個月也省不少～',
    '天啊今天去家樂福看到法國進口松露薯片$159 試吃了一片就被圈粉 直接買了三包',
    // News
    '全台前三大量販通路市佔合計達82.8%，創歷史新高。全聯集團41.3%居冠，好市多26.6%次之，家樂福14.9%排名第三。',
    '家樂福烘焙區年營收突破數十億元。業者表示，法棍、可頌、蝴蝶酥為三大暢銷品項，採用法國進口麵粉製作，是全台量販通路中營業表現最亮眼的部門。',
    '據統計，家樂福紅酒節為台灣最大量販紅酒銷售活動，年引進逾500款酒，帶動家樂福進口食品銷售較平日成長35%。',
    // Google 評論
    '⭐⭐⭐ 去了二十年了 烘焙區永遠是亮點 生鮮最近沒以前好 停車方便空間大 整體還是不錯',
    '⭐⭐⭐⭐⭐ 帶小孩來最適合的量販店 試吃大方空間大 烘焙區麵包是全台最強 唯一的量販愛店',
    '⭐⭐ 線上訂貨等了四天才收到 客服聯繫不上 生鮮送到不新鮮 只剩烘焙區值得跑一趟',
    // Facebook
    '今天去家樂福買了好多菜 茄子$29高麗菜$35番茄$45 比市場便宜 而且停車方便不用曬太陽❤️',
    '家樂福這禮拜DM有好多特價品 衛生紙跟洗衣精都很划算 大家快去搶😊',
    '帶孫子去家樂福 他在試吃區吃到不想走 最後買了一堆餅乾零食 量販就是小孩的天堂',
  ],

  // ═══════════════════════════════════════════
  // p001: 法式烘焙 — 最強品牌資產
  // ═══════════════════════════════════════════
  p001: [
    // PTT hypermall — 專業討論
    '家樂福法棍歐包勝過90趴的麵包店 一條才$55 這CP值沒人能打 我每週至少去搶兩條',
    '長法棍若出爐3小時內 是有法國普通超市麵包的水準 但放超過就變硬了 所以要抓好出爐時間',
    '家樂福的麵團都是中央工廠做好的 分店理應沒有區別 主要是出爐太久變難吃 現場出爐的才是真理',
    '可頌跟半熟麵包烤箱時間有抓好都很好吃 重點是要找剛出爐的 放櫃檯超過2小時品質就會下降',
    '法國麵包系列不會太油 很對一些消費者的胃口 比起超商或全聯那些化學添加的 這裡的成分單純多了',
    '推薦品項：歐式麵包、長法棍、圓法棍、大蒜麵包條、牛奶酥棒 全部銅板價 品質不輸專門店',
    '家樂福烘焙區是唯一不受改名風暴影響的品項 消費者「不管叫什麼名字都會去買麵包」心態很明確',
    '我法國朋友吃了家樂福法棍說有七八成水準 而且只要$55 比巴黎街角麵包店便宜三倍',
    // Dcard — 開箱分享
    '家樂福烘焙區開箱來了～大奶酥菠蘿$65 奶酥內餡超級多用安佳奶油很香🤤 白脫球麵包$39有卡士達醬超軟～',
    '分享我的家樂福烘焙區攻略：下午2點到→直衝長法棍（剛出爐）→順便拿可頌$50→蝴蝶酥$89→收工 總花費不到$200✨',
    '花生Q心菠蘿$45 裡面的花生是花生粉加奶油的固體超好吃 份量給很多～每次去都會買兩個🥐',
    '冷凍迷你可頌一袋$139有5入 從生麵團加熱烤完超香 平均一個不到$28 比便利商店划算太多了～',
    '第一次被朋友帶去家樂福烘焙區 完全被圈粉 以前都不知道量販店的麵包可以這麼好吃 而且超便宜',
    '每次去家樂福 我的購物車有一半都是烘焙區的戰利品 法棍、可頌、蝴蝶酥、起司法國麵包 全部必買',
    // IG
    '家樂福烘焙區的法棍太絕了🥖外酥內軟 配奶油直接起飛 一條才55元 #家樂福 #家樂福麵包 #法棍 #carrefour #銅板美食 #烘焙控',
    '週末的小確幸 家樂福現烤可頌配黑咖啡☕ CP值最高的法式早餐就是這個了 #可頌 #家樂福烘焙 #brunch',
    '蝴蝶酥一包$89送禮自用都棒！同事瘋狂敲碗叫我代購 已經變成每週例行任務了😂 #蝴蝶酥 #家樂福必買',
    // News
    '家樂福烘焙區被網友封為量販通路最強烘焙。該區年營收突破新台幣數十億元，其中法棍、可頌、蝴蝶酥為三大暢銷品項。業者透露，中央工廠採用法國進口麵粉，配方由法籍顧問團隊開發。',
    '社群數據顯示，IG「#家樂福麵包」標籤累計超過12萬則貼文。在品牌危機期間，烘焙區是唯一正面聲量逆勢成長的品項，年增45%。',
    // Google
    '⭐⭐⭐⭐⭐ 法棍$55可頌$50蝴蝶酥$89 全部都是專門店水準量販店價格 唯一會讓我特地跑來的理由 師傅太強了',
    '⭐⭐⭐⭐ 品質很棒但要注意出爐時間 放太久會變硬 建議查好各店出爐時刻表 現烤的跟放半天的差很多',
  ],

  // ═══════════════════════════════════════════
  // p003: 紅藜烤雞 — 超級兩極評價
  // ═══════════════════════════════════════════
  p003: [
    // PTT — 正面
    '推 家樂福烤雞大勝好市多 烤雞肉質比較紮實 醃製更入味 而且不用會員卡就能買',
    '紅藜蔬菜烤雞$269 出爐3小時內的真的好吃 外皮脆內多汁 CP值之王 每次去都要搶',
    '美式烤雞$298 用產銷履歷肉雞 每日新鮮現烤絕不隔夜 這點做得比好市多好',
    '家樂福烤雞兩大優勢：不用會員卡、肉質更紮實 婆媽們大推 假日下午三點出爐排隊搶購',
    '推推推 烤雞配法棍 一餐不到$400 四口之家吃到飽 這CP值在外面餐廳根本不可能',
    '我家是每週固定去家樂福搬烤雞的 小孩超愛 雞腿肉紮實不會太乾 配紅藜很健康的感覺',
    // PTT — 負面（真實兩極評價）
    '噓 紅藜烤雞超雷 那個紅藜味道讓人退避三舍 買了一口整隻倒掉 想到都噁心',
    '最近買到的烤雞品質不穩定 有時候很乾 有時候味道怪怪的 不知道是不是換了供應商',
    '說實話烤雞放超過出爐2小時就不行了 很多人買到的是放很久的所以才會覺得難吃',
    '家樂福烤雞的醬料好像改了 以前比較鹹香 現在偏淡 不太一樣了',
    // Dcard
    '室友每次都要我去家樂福帶一隻烤雞回來 $269四個人分CP值超高 雞腿肉真的很嫩～配生菜超讚',
    '本來要買好市多烤雞但剛好路過家樂福 試了紅藜烤雞被圈粉 紅藜吃起來有穀物的香氣很特別🍗',
    '有人跟我一樣覺得家樂福烤雞比好市多好吃嗎 而且不用辦會員 價差也不大 從此轉投家樂福了',
    // Google
    '⭐⭐⭐⭐⭐ 紅藜烤雞是來家樂福的首要目的 每次去都要搶 建議出爐時間到就去排 晚了就沒了',
    '⭐⭐ 烤雞品質不穩定 有次買到的非常乾 紅藜味道也太重了 不太習慣 但出爐立刻買的確實不錯',
    '⭐⭐⭐⭐ 美式烤雞$298大推 皮脆肉嫩 一家四口的晚餐花不到五百 搭個法棍完美',
    // News
    '家樂福自製美式烤雞年銷量約8萬隻，為熟食區營收主力。使用產銷履歷肉雞，搭配獨特醃料每日新鮮現烤，是社群討論度最高的量販熟食單品。',
  ],

  // ═══════════════════════════════════════════
  // p005: 線上購物 — 最大弱項
  // ═══════════════════════════════════════════
  p005: [
    // PTT e-shopping — 負面為主
    '家樂福線上購物真的好難用 介面爛、搜尋功能差、分類邏輯不通 比PXGo差了一個世紀',
    '上次訂了三天才到貨 而且少了兩樣東西 打客服完全沒人接 等了40分鐘放棄 最後自己去門市買',
    '家樂福app又閃退了 放進購物車就crash 到底花了多少錢做這個app 能不能請統一的資訊部接手',
    '線上訂的生鮮送到都軟掉了 冷鏈是不是沒做好 夏天這樣根本不行 生鮮品質無法保證',
    '家速配說60分鐘送達 結果等了兩個半小時 而且漏了一半的東西 這叫什麼快速配送',
    '認真比較了一下 PXGo介面好用配送穩定 好市多Online品質保證 家樂福...算了不說了',
    '噓 家樂福線上商城號稱商品5萬件要衝15萬件 品項多有什麼用 基本的配送和APP穩定都做不好',
    // PTT — 少數正面
    '推一個優點 家樂福線上配送不分溫層 低溫常溫同價 這點比一般網購划算 但就是到貨太慢',
    '家速配在320家門市有導入 下單1小時內送達 以生鮮為主 偶爾急用的話還行 但品項少了點',
    '到店取貨這功能蠻方便的 不用逛直接去櫃台領 適合只買特定東西的人',
    // Dcard
    '有人用過家樂福線上買菜嗎？體驗真的蠻差的 訂的東西一半缺貨一半延遲 客服打不通 心累～',
    '本來想說下雨天用家樂福線上訂菜多方便 結果app閃退三次 好不容易送出訂單等了四天 菜都黃了',
    '比較了一下線上買菜平台：全聯PXGo > 家樂福 >>>>>> 其他 家樂福app的UI真的需要全面重做',
    // Google Play / App 評價
    '⭐ 史上最爛的購物app 閃退是日常 搜尋功能形同虛設 客服永遠忙線中 一星不能再多',
    '⭐⭐ 配送不分溫層這點不錯但app品質太差了 每次更新都會出新bug 購物車常常清空 已經放棄三次了',
    '⭐ 訂了兩次 兩次都少東西 投訴沒回音 退貨流程超複雜 以後只去門市買 線上就算了',
    // News
    '家樂福線上購物自2015年上線以來，累計物流訂單突破1,200萬件。2024年推出升級版虛拟賣場，目前已合作超過220家廠商，商品數接近5萬件，年底目標達15萬件。',
    '家速配自組車隊覆蓋全台320家門市中逾300家，提供近萬件商品下單後最快1小時送達服務。但消費者反映配送延遲率偏高，NPS遠低於競品。',
  ],

  // ═══════════════════════════════════════════
  // s001: 品牌更名轉型 — 核心議題
  // ═══════════════════════════════════════════
  s001: [
    // PTT Gossiping — 嘲諷風
    '康達盛通是什麼鬼名字啦哈哈哈 聽起來像是做報關的公司 拜託消費者品牌名千萬不要用這個',
    '笑死 我朋友聽到家樂福要改名 問我是不是要倒了 品牌改名=品牌消失 消費者就是這樣想的',
    '羅智先說天花板級品牌名很難找 那你改啊 建議不如叫「統一超級市場」算了 反正大家都知道是統一的',
    '有人說叫「大統一」 但這名字2005年被食品醜聞搞臭了 統一應該不敢用 哈哈哈',
    '認真建議 新品牌名保留法系元素 像Le Marché(市場)或Le Bon(好的) 至少消費者還會聯想到法國',
    '家樂福要改名這件事 我覺得最慘的是那些IG上#家樂福麵包的12萬則貼文 改名之後全變歷史',
    // PTT — 理性分析
    '改名時間壓力很大 消費者對不確定狀態的容忍度大概3-6個月 超過就會不可逆流失 統一要快',
    '42趴消費者對改名持開放態度 前提是「新品牌做得好」 所以品牌名選擇和上市campaign超重要',
    '品牌轉型其實也是機會 可以擺脫「量販老店」形象 重新定位為「法式生活提案」 但執行力要很強',
    '預計2026年中換招牌 現在2月了 只剩4個月 品牌名都還沒公佈 這效率真的令人擔憂',
    // Dcard
    '天啊家樂福要改名了 我大學四年旁邊的家樂福陪我度過多少深夜 突然好感傷 真的會改成什麼名字啊～',
    '有沒有人跟我一樣 對家樂福改名這件事有種說不出的焦慮 不是擔心名字 是擔心那些好吃的東西會不會跟著消失',
    '認真問 如果家樂福改名後法國進口商品真的消失了 大家會改去哪裡買？好市多嗎？',
    // News
    '家樂福品牌轉型被視為2026年台灣零售業最大議題。品牌顧問分析，改名成功的關鍵在於保留消費者與「法國」「品質」的正面連結，同時利用統一集團資源建立新的品牌認知。',
    '統一集團董事長羅智先接受專訪時坦言，授權金是因素之一但非主因，真正的考量是「溝通成本」：與法方相隔萬里，台灣端提出的想法法方不一定理解，來回溝通困難且耗時。',
    '據了解，統一已委託品牌顧問公司進行消費者調研，初步選定數個候選名稱。內部人士透露，新品牌名將於元旦假期後啟動票選，最快2026年第二季對外公佈。',
    // Facebook
    '家樂福要改名了喔 我們家去家樂福已經二十幾年了 不管改什麼名字 拜託那個烤雞和麵包不要變就好🙏',
    '媽媽今天問我家樂福是不是要倒了 我解釋半天說只是改名 她說改名就是倒了的意思 唉 品牌認知真的很難改',
  ],

  // ═══════════════════════════════════════════
  // p008: 聯名信用卡 — 改惡議題
  // ═══════════════════════════════════════════
  p008: [
    // PTT creditcard — 精算風
    '幹 玉山家樂福聯名卡合約8/30到期 換發Unicard次年年費$3000 週三品牌日從8折改惡成88折 這叫升級？',
    '算了一下 舊卡家樂福消費3趴回饋 新卡Unicard只剩加碼通路才有 日常消費回饋直接砍半 不如剪卡',
    '2026/1/1起舊卡無法使用 但新卡到9/30前五大通路加碼3趴 之後呢？之後就是普卡水準了吧',
    '玉山聯名卡開放申請到2025/6/30 趕末班車的快去 但說實話這張卡的價值已經大不如前了',
    '週三品牌日8折→88折 看起來差8趴 但算上基本回饋縮水 實際損失超過15趴 精算仔表示不可接受',
    '建議直接改用中信LINE Pay卡或富邦J卡 這兩張在家樂福的實質回饋其實已經超越新版聯名卡了',
    '有人成功換發Unicard了嗎？聽說首年免年費 但看那些條件 覺得根本是為了讓你換卡後再慢慢砍福利',
    // Dcard
    '剛畢業辦的第一張信用卡就是家樂福聯名卡 現在要被換掉了 有點感傷 但回饋縮水成這樣也留不住人～',
    '家樂福聯名卡到期後改辦什麼卡比較划算？求推薦量販回饋好的信用卡 年費最好免費🙏',
    // News
    '玉山銀行與家樂福聯名卡合約2025年8月30日到期，持卡人將換發玉山Unicard。銀行表示，過渡期間於指定五大通路消費可享最高7.5%回饋。但信用卡社群反映，長期權益相較舊卡明顯縮水。',
  ],

  // ═══════════════════════════════════════════
  // e005: 門市縮減潮
  // ═══════════════════════════════════════════
  e005: [
    // PTT Gossiping
    '家樂福明明生意超好為何一家接著一家關？ 去年關了9間 今年Mia C\'bon又要收4間 到底怎麼了',
    '統一入主家樂福後門市數不增反減 說好的整合綜效呢 結果只看到一直在關店',
    '家樂福經營21年的台中清海店熄燈了 租約到期不續租 附近居民說以後買菜要多跑好遠',
    '2025年關9間：4量販+3超市+2 Mia 然後2026/2 Mia再收4間 這速度真的會讓人覺得要倒了',
    'Mia C\'bon林森店2/22、美麗華2/23、中和環球+高雄漢神2/28 連20年老店都不留 全台只剩16家',
    '高雄漢神本館的Mia C\'bon都要關了 那間開了20年欸 績優店也撐不住 到底是策略調整還是真的不賺',
    '羅智先說不急著展店 要思考讓消費者更有理由走進來 說得好聽 消費者的理由就是家旁邊有啊 你關了要怎麼走進來',
    // Dcard
    '天啊 我家附近的家樂福超市要關了 以後買菜只能去全聯了 但全聯真的沒有進口食品和烘焙區啊～',
    '看到家樂福一直關店真的很難過 小時候最期待的就是週末跟爸媽去逛家樂福 現在連店都要消失了',
    // News
    '家樂福旗下頂級超市Mia C\'bon 2月一口氣關閉4間門市，含營業長達20年的高雄漢神本館店。關店後全台Mia C\'bon僅剩16家。市場分析，統一正加速門市瘦身，不具效益的據點優先退場。',
    '家樂福關店拚大象轉身。零售專家指出，統一面臨的最大挑戰是在門市縮減的同時維持品牌信心。消費者將關店與品牌消失連結，每一次關店都在加深「家樂福要倒了」的印象。',
  ],

  // ═══════════════════════════════════════════
  // e006: OPENPOINT 整合
  // ═══════════════════════════════════════════
  e006: [
    // PTT hypermall — 精算
    '9/16起家樂福消費改累積OPENPOINT 回饋率0.33趴 VIP 0.5趴 算一下消費1056元才3.48點 1點折1元 嗯...',
    '舊的家樂福點數不能轉換成OPENPOINT 只能折抵消費 而且折抵還會影響回饋計算 損失超過20趴',
    '好處是7-11/星巴克/康是美/Mister Donut都能共用OPENPOINT 生態圈確實大 但回饋太薄了',
    '全面停發實體會員卡改用APP 我媽根本不會用 家樂福這樣做等於放棄年長客群啊',
    '有人算過嗎 舊好康卡每消費$1=1點 300點折$1 等於0.33趴 跟新制一樣 但舊制可以累積折抵感覺比較爽',
    // Dcard
    '幫整理OPENPOINT整合Q&A：新點數9/16開始累積→舊點數可併用折抵→實體卡停發→VIP制度不變→可跨通路使用 大概這樣～',
    '說實話整合OPENPOINT之後跨通路這點蠻吸引人的 7-11集點去家樂福用 星巴克集點去康是美用 嗯有點心動',
    // News
    '家樂福會員系統9月16日全面整合至OPENPOINT平台。消費者可於統一超商7-ELEVEN、康是美、星巴克等通路共享點數。業者預估，跨通路點數經濟將帶動家樂福營收成長5-8%。',
  ],

  // ═══════════════════════════════════════════
  // b002: 全聯 — 主要競爭者
  // ═══════════════════════════════════════════
  b002: [
    '全聯現在超過1200店 加上大全聯21間 市佔41.3趴 完全是量販超市霸主 家樂福只有14.9趴根本比不上',
    '大全聯青埔店12/10試營運 號稱次世代量販店 1500坪賣場5萬種商品 還有IKEA 目標年營收10億',
    '全聯董座林敏雄說大全聯終極目標比全聯更低價 但品項要跟量販一樣多 這不就是在挖家樂福牆角嗎',
    '睽違15年全聯再展量販新店 上次是2010年大潤發頭份店 可見全聯對量販這塊多認真',
    '推全聯的PXGo 線上買菜真的比家樂福穩太多了 配送快UI好用 家樂福app可以去PXGo取經一下',
    '全聯最大問題就是停車 量販格局家樂福完勝 但日常採買便利性全聯大贏 各有各的客群',
    '大潤發改名大全聯之後 品項確實有在補強 生鮮已經到家樂福的八成水準了 進口品項還在慢慢加',
    '大全聯目前20間量販+1間食集 跟家樂福63間量販比差距還大 但全聯的策略是精品化不是拼數量',
    // News
    '全聯福利中心2024年營收突破2,100億元，加計大全聯合計市佔達41.3%，穩居台灣超市量販龍頭。全聯總門市數目標突破1,200店。',
    '大全聯青埔店為全聯次世代量販旗艦店，匯集5萬種商品、地下1樓1,500坪賣場、1樓1,400坪美食街，2至5樓為全台最大IKEA商場約9,000坪。年營收目標10億元。',
  ],

  // ═══════════════════════════════════════════
  // s005: 會員點數經濟
  // ═══════════════════════════════════════════
  s005: [
    '家樂福好康卡用了五年 累積一萬多點 結果不能轉OPENPOINT 只能折抵消費 而且折抵還會影響導購計算',
    '0.33趴回饋是認真的嗎 消費$1000才3.3點 3點折$3 這比路邊攤集點還不如',
    'VIP 0.5趴稍微好一點 但跟原本的好康卡差太多了 有人算過降了多少嗎',
    '全面停發實體會員卡 我阿嬤每次去家樂福都拿好康卡 現在叫她用APP？她連智慧型手機都不太會用',
    '在LINE禮物買家樂福即享券可以拿5趴LINE Points回饋 搭配其他折扣最高可到13趴 比直接刷卡划算多了',
    '有人買到最新的即享券嗎 標示「本券無法存入家樂福錢包中使用」 又改了一條規則 越來越麻煩',
    '說個讓人心情更差的 折抵點數會影響回饋及導購計算 等於用點數折抵反而損失20趴以上 設計這規則的人是天才',
    '整合OPENPOINT之後唯一的好處就是去7-11也能累 但7-11本身的OPENPOINT回饋就很低 疊加效果有限',
    '推算了一下 以前好康卡每月在家樂福花$5000 可以累$16折抵 新制只有$16.5 看似差不多但少了很多加碼活動',
    '認真覺得統一是在溫水煮青蛙 先整合 然後慢慢砍福利 消費者等到發現的時候已經來不及了',
  ],

  // ═══════════════════════════════════════════
  // b008: Mia C'bon — 高端超市收縮
  // ═══════════════════════════════════════════
  b008: [
    'Mia C\'bon高雄漢神店要關了 那間開20年了欸 我小時候還是JASONS的時候就在逛了 真的很不捨',
    '一口氣關4間Mia C\'bon 林森、美麗華、中和環球、高雄漢神 2月底全收 全台只剩16家 還能撐多久？',
    '說實話Mia C\'bon的定位一直很尷尬 比百貨超市粗糙 比家樂福超市貴 不上不下的',
    'Mia C\'bon前身是JASONS Market Place 後來又變頂好 現在又要跟著家樂福改名 這品牌也太命苦了',
    '2025年已經關了2間Mia C\'bon 2026/2再關4間 照這速度下去全台16家可能撐不過今年',
    '⭐⭐⭐ Mia C\'bon的進口商品確實不錯 但價格比家樂福量販高太多 同樣的法國起司貴了30趴 不太值得',
    '統一接手後Mia C\'bon明顯在加速退場 績優店也不留 感覺是要全部整合進新品牌體系',
  ],

  // ═══════════════════════════════════════════
  // e003: 康達盛通 — 嘲諷議題
  // ═══════════════════════════════════════════
  e003: [
    '康達盛通生活事業股份有限公司 這名字唸完舌頭都打結了 真的有人覺得這可以當品牌名嗎',
    '笑死 康達盛通聽起來像做物流的 或是一間報關行 完全沒有量販超市的感覺',
    '統一說康達盛通只是法人名稱不是品牌名 但傷害已經造成了 消費者會記住的是「家樂福變成那個奇怪的名字」',
    '羅智先自己都承認家樂福是天花板級品牌名 那你到底為什麼要改 授權金省下來了但品牌價值呢',
    '聽說統一內部已經在票選新品牌名了 元旦後啟動 拜託找個有sense的 不要再搞出第二個康達盛通',
    '網友自製「康達盛通」迷因圖到處轉傳 這種負面印象一旦形成很難消除 公關部應該很頭痛',
    '認真建議新品牌名保留法系元素 Le Marché、Le Bon、La Vie 隨便一個都比康達盛通好一百倍',
    '據了解，「康達盛通」取自康莊大道、通達盛世之意。但網友並不領情，社群輿論持續以嘲諷態度看待此名稱。',
    '品牌顧問分析，公司名稱與消費者品牌名脫鉤是正確策略。但在資訊傳播快速的時代，任何名稱的曝光都會影響消費者認知。',
  ],

  // ═══════════════════════════════════════════
  // b003: 好市多 — 主要競爭者
  // ═══════════════════════════════════════════
  b003: [
    '好市多高雄新店快開了 1010個汽車位+400機車位 外牆Logo已經掛上去了 南部家樂福要小心了',
    '好市多14家店營收就破千億 平均單店營收是家樂福的好幾倍 會員制模式黏著度真的強',
    '好市多台中評估開第3店 土地開發部總監說台中開6家都沒問題 這擴張速度家樂福跟得上嗎',
    '台南第2家好市多預計2028年 位置在南台南副都心 2.3公頃三層樓 又是一個搶家樂福客群的',
    '好市多vs家樂福烤雞永遠都能吵 結論就是好市多便宜但要會員卡 家樂福肉質紮實免會員',
    '推好市多的退貨政策 無條件退貨太爽 家樂福這點差很多 退貨流程超複雜又刁難',
    '好市多的獨家商品是最大優勢 科克蘭那些自有品牌品質屌打一般超市 家樂福的Carrefour牌也不錯但改名後就...',
    '好市多年費$1350換來的會員體驗確實值得 試吃大方退貨友善商品品質高 家樂福免費但體驗就差了些',
    '2026會計年度好市多規劃5家門市遷址，其中包括台灣高雄店。新店型將提供更大賣場面積和更完善的停車設施。',
  ],

  // ═══════════════════════════════════════════
  // p002: 自有品牌
  // ═══════════════════════════════════════════
  p002: [
    '家樂福自有品牌1997年推出到現在快30年了 Carrefour Bio有機系列品質真的好 但去掉Carrefour字我真的會猶豫',
    '少了Carrefour三個字 自有品牌跟全聯自有品牌有什麼差別？消費者買的就是那個法國品牌的信任感',
    '推Carrefour Bio有機巧克力$89 品質不輸專櫃的 但改名後這個系列還能繼續賣嗎？法國那邊願意供貨嗎',
    '自有品牌的包裝設計其實蠻好看的 法式風格質感在架上很有辨識度 去掉法文後真的會變路人牌',
    '家樂福Classic系列的衛生紙和清潔用品CP值高 但說實話消費者買這些本來就不太看品牌 影響較小',
    '最擔心的是有機認證系列 Carrefour Bio是法國原裝進口 品牌授權終止後供應鏈能不能維持是大問號',
    '品牌授權終止後，家樂福自有品牌商品的標籤與包裝須全面調整。業界估計，此項工程涉及數千個SKU，成本可觀。',
  ],

  // ═══════════════════════════════════════════
  // p004: 生鮮蔬果區
  // ═══════════════════════════════════════════
  p004: [
    '最近在家樂福買的蔬菜品質真的不行 葉子都黃了 之前不會這樣的 是換了供應商嗎',
    '⭐⭐ 生鮮區品質最近下滑明顯 蘋果切開裡面爛的 番茄軟掉了 肉類也不夠新鮮 希望只是暫時的',
    '家樂福生鮮區的品項確實比全聯多很多 但品質不穩定是致命傷 有時候很棒有時候很慘',
    '水果買回去隔天就壞了 之前在家樂福買從來不會這樣 統一接手後供應鏈是不是在調整？品管鬆了吧',
    '希望統一趕快把冷鏈標準導入家樂福 統一的冷鏈物流體系是全台最完整的 沒理由生鮮做不好',
    '好市多的生鮮品質屌打家樂福 雖然量大但品質穩定 家樂福這點真的要好好學',
    '推家樂福的有機蔬菜區 品項比全聯多 但一般蔬菜區的品質最近真的有退步 兩極化明顯',
  ],

  // ═══════════════════════════════════════════
  // p007: 法國進口商品
  // ═══════════════════════════════════════════
  p007: [
    '家樂福法國進口商品超過200種 全台最齊全 那些Carrefour獨家代理的起司紅酒巧克力 別的地方真的買不到',
    '最怕改名後法國供應鏈斷了 Carrefour Bio有機系列 法國松露系列 這些都是家樂福跟法國母公司的關係才有的',
    '法國進口的 Comté 起司、Bonne Maman 果醬、Valrhona 巧克力 每次去都要帶 改名真的別影響這些',
    '家樂福紅酒節每年引進500支以上酒款 是台灣最大的紅酒零售通路之一 PTT Wine版每年都在討論',
    '改名後 Carrefour Bio有機產品能不能繼續賣是最大問題 這條法國進口線斷了 差異化直接歸零',
    '我去家樂福80趴的原因是法國進口區 起司區逛一圈就能花$2000 全台真的只有家樂福有這個規模',
    '推薦：法國 Président 起司片 $129、Carrefour Bio 有機巧克力 $89、法國松露薯片 $159 全部必買',
    // News
    '家樂福獨家代理的法國食品品項超過200種，是全台進口食品最齊全的量販通路。品牌授權終止後，部分法國供應商已表示願意繼續合作，但Carrefour自有品牌進口線的延續仍存在不確定性。',
  ],
}

// Seeded random for reproducible mention generation
function seededRand(seed: number): () => number {
  let s = seed
  return () => { s = (s * 16807 + 0) % 2147483647; return (s - 1) / 2147483646 }
}

const PTT_AUTHORS = ['PTT鄉民','推文王','省錢版常客','八卦版肥宅','量販達人','烘焙控PTT','精打細算姐','鍵盤美食家','資深卡友','退休阿北','BuyTogether','Lifeismoney常客','全聯難民','批踢踢路人','消費者自救會']
const DCARD_AUTHORS = ['匿名','量販少女','小資女日記','甜點控🍰','烘焙新手','大學生日常','租屋族','Dcard路人','麵包狂人','咖啡配可頌','省錢寶寶','閃退受害者']
const FB_AUTHORS = ['陳媽媽','王太太','林阿姨','張先生','李奶奶','黃小姐','家樂福愛好者','快樂主婦','好市多轉過來的','週末量販客']
const IG_AUTHORS = ['foodie_tw','bread_lover_tw','taipei_eats','carrefour_fan','daily_grocery','bakery_hunter','wine_collector_tw','market_explorer']
const GOOGLE_AUTHORS = ['Google用戶','在地嚮導','Lv.5嚮導','一般消費者','路過的客人','常客','會員','鄰居']
const NEWS_AUTHORS = ['數位時代','中時新聞網','ETtoday','聯合報','工商時報','自由時報','TVBS新聞','鏡週刊','風傳媒','商業周刊']
const M01_AUTHORS = ['Mobile01會員','01達人','3C版友','生活版常客','量販觀察員']

const PLATFORM_AUTHORS: Record<string, string[]> = {
  PTT: PTT_AUTHORS, Dcard: DCARD_AUTHORS, Facebook: FB_AUTHORS, IG: IG_AUTHORS,
  'Google評論': GOOGLE_AUTHORS, '新聞媒體': NEWS_AUTHORS, Mobile01: M01_AUTHORS, 'LINE社群': FB_AUTHORS, YouTube: IG_AUTHORS,
}

const SENTIMENTS: Array<{ label: string; score: number }> = [
  { label: 'positive', score: 0.82 }, { label: 'positive', score: 0.88 }, { label: 'positive', score: 0.78 },
  { label: 'positive', score: 0.91 }, { label: 'positive', score: 0.72 }, { label: 'positive', score: 0.75 },
  { label: 'positive', score: 0.85 }, { label: 'positive', score: 0.69 },
  { label: 'negative', score: 0.25 }, { label: 'negative', score: 0.18 }, { label: 'negative', score: 0.22 },
  { label: 'negative', score: 0.28 }, { label: 'negative', score: 0.15 }, { label: 'negative', score: 0.32 },
  { label: 'neutral', score: 0.48 }, { label: 'neutral', score: 0.52 }, { label: 'neutral', score: 0.50 },
  { label: 'mixed', score: 0.45 }, { label: 'mixed', score: 0.42 }, { label: 'mixed', score: 0.55 },
]

function detectPlatform(tpl: string): string {
  if (tpl.startsWith('⭐')) return 'Google評論'
  if (tpl.includes('#') && (tpl.includes('🛒') || tpl.includes('☕') || tpl.includes('✨'))) return 'IG'
  if (tpl.includes('據了解') || tpl.includes('業者') || tpl.includes('業界') || tpl.includes('據統計') || tpl.includes('根據市調') || tpl.includes('通路觀察')) return '新聞媒體'
  if (tpl.includes('～') || tpl.includes('閨蜜') || tpl.includes('室友')) return 'Dcard'
  if (tpl.includes('請問各位大大') || tpl.includes('個人觀察') || tpl.includes('分析一下')) return 'Mobile01'
  if (tpl.includes('小朋友') || tpl.includes('DM這禮拜') || tpl.includes('❤️')) return 'Facebook'
  return 'PTT'
}

function guessSentimentFromContent(tpl: string): { label: string; score: number } {
  const posWords = ['推','讚','好吃','強','愛','幸福','不錯','大推','值得','完美','CP值','屌打','好買','必買','大方','親切']
  const negWords = ['爛','差','爆','壞','失望','氣','閃退','雷','糟','亂','差','縮水','砍','改惡','瞎','崩潰','恐慌','難用','打不通']
  const posCount = posWords.filter(w => tpl.includes(w)).length
  const negCount = negWords.filter(w => tpl.includes(w)).length
  if (posCount > negCount + 1) return { label: 'positive', score: 0.72 + Math.min(posCount * 0.04, 0.2) }
  if (negCount > posCount + 1) return { label: 'negative', score: 0.15 + Math.min(negCount * 0.03, 0.18) }
  if (posCount > 0 && negCount > 0) return { label: 'mixed', score: 0.42 + (posCount - negCount) * 0.05 }
  if (posCount > negCount) return { label: 'positive', score: 0.68 + posCount * 0.04 }
  if (negCount > posCount) return { label: 'negative', score: 0.25 + negCount * 0.02 }
  return { label: 'neutral', score: 0.50 }
}

function generateMentions(name: string, type: string, count: number, entityId?: string): MentionItem[] {
  const entityPool = entityId ? ENTITY_MENTION_POOL[entityId] : undefined
  const typePool = MENTION_POOL[type] ?? MENTION_POOL.brand
  // Merge: entity-specific first, then type-based for variety
  const pool = entityPool ? [...entityPool, ...typePool] : typePool
  const aliases = entityId ? (ALIAS_MAP[entityId] ?? []) : []
  const allNames = [name, ...aliases]
  const rand = seededRand(entityId ? entityId.charCodeAt(0) * 1000 + entityId.charCodeAt(entityId.length - 1) : name.length * 137)
  const results: MentionItem[] = []
  const totalToGenerate = Math.max(count, Math.min(pool.length, 30))

  for (let i = 0; i < totalToGenerate; i++) {
    const tplIdx = i % pool.length
    const tpl = pool[tplIdx]
    // Pick name or alias randomly (30% chance to use alias if available)
    const usedName = aliases.length > 0 && rand() < 0.3
      ? allNames[1 + Math.floor(rand() * aliases.length)]
      : name
    const content = tpl.replace(/\{name\}/g, usedName)
    const platform = detectPlatform(tpl)
    const authorPool = PLATFORM_AUTHORS[platform] ?? PTT_AUTHORS
    const author = authorPool[Math.floor(rand() * authorPool.length)]
    const sentiment = guessSentimentFromContent(tpl)
    const daysAgo = Math.floor(rand() * 90) // spread over 90 days

    results.push({
      post_id: 10000 + (entityId ? entityId.charCodeAt(1) * 100 : 0) + i,
      content,
      sentiment: sentiment.label,
      sentiment_score: Math.round(sentiment.score * 100) / 100,
      mention_text: usedName,
      author_name: author,
      platform,
      created_at: isoDate(daysAgo),
    })
  }
  return results
}

// ── Relationships between entities ──
const LINK_MAP: Record<string, LinkItem[]> = {
  b001: [
    { direction: 'outgoing', linked_id: 'p001', linked_name: '法式烘焙（法棍/可頌）', linked_type: 'product', link_type: 'produces', created_at: isoDate(60) },
    { direction: 'outgoing', linked_id: 'p002', linked_name: '家樂福自有品牌', linked_type: 'product', link_type: 'produces', created_at: isoDate(60) },
    { direction: 'outgoing', linked_id: 'p003', linked_name: '紅藜烤雞', linked_type: 'product', link_type: 'produces', created_at: isoDate(60) },
    { direction: 'outgoing', linked_id: 'p004', linked_name: '生鮮蔬果區', linked_type: 'product', link_type: 'produces', created_at: isoDate(60) },
    { direction: 'outgoing', linked_id: 'p005', linked_name: '家樂福線上購物', linked_type: 'product', link_type: 'produces', created_at: isoDate(60) },
    { direction: 'outgoing', linked_id: 'p006', linked_name: '家樂福 APP', linked_type: 'product', link_type: 'produces', created_at: isoDate(60) },
    { direction: 'outgoing', linked_id: 'p007', linked_name: '法國進口商品專區', linked_type: 'product', link_type: 'produces', created_at: isoDate(60) },
    { direction: 'outgoing', linked_id: 'p008', linked_name: '家樂福聯名信用卡', linked_type: 'product', link_type: 'produces', created_at: isoDate(45) },
    { direction: 'outgoing', linked_id: 'l001', linked_name: '家樂福內湖量販店', linked_type: 'place', link_type: 'located_at', created_at: isoDate(60) },
    { direction: 'outgoing', linked_id: 'l002', linked_name: '家樂福桂林店', linked_type: 'place', link_type: 'located_at', created_at: isoDate(60) },
    { direction: 'incoming', linked_id: 'b002', linked_name: '全聯福利中心', linked_type: 'brand', link_type: 'competes_with', created_at: isoDate(30) },
    { direction: 'incoming', linked_id: 'b003', linked_name: '好市多 Costco', linked_type: 'brand', link_type: 'competes_with', created_at: isoDate(30) },
    { direction: 'incoming', linked_id: 'b005', linked_name: '統一企業集團', linked_type: 'brand', link_type: 'acquired_by', created_at: isoDate(60) },
  ],
  b002: [
    { direction: 'outgoing', linked_id: 'b001', linked_name: '家樂福', linked_type: 'brand', link_type: 'competes_with', created_at: isoDate(30) },
    { direction: 'outgoing', linked_id: 'b003', linked_name: '好市多 Costco', linked_type: 'brand', link_type: 'competes_with', created_at: isoDate(30) },
    { direction: 'outgoing', linked_id: 'b004', linked_name: '大潤發', linked_type: 'brand', link_type: 'acquired', created_at: isoDate(60) },
  ],
  b005: [
    { direction: 'outgoing', linked_id: 'b001', linked_name: '家樂福', linked_type: 'brand', link_type: 'acquired', created_at: isoDate(60) },
    { direction: 'outgoing', linked_id: 'e001', linked_name: '統一集團完成收購', linked_type: 'event', link_type: 'involves', created_at: isoDate(60) },
    { direction: 'outgoing', linked_id: 'e006', linked_name: 'OPENPOINT 整合', linked_type: 'event', link_type: 'involves', created_at: isoDate(30) },
  ],
  s001: [
    { direction: 'outgoing', linked_id: 'b001', linked_name: '家樂福', linked_type: 'brand', link_type: 'impacts', created_at: isoDate(10) },
    { direction: 'outgoing', linked_id: 'e002', linked_name: '品牌授權到期（2025/12）', linked_type: 'event', link_type: 'triggers', created_at: isoDate(10) },
    { direction: 'outgoing', linked_id: 'e003', linked_name: '公司更名為康達盛通', linked_type: 'event', link_type: 'triggers', created_at: isoDate(5) },
  ],
  s002: [
    { direction: 'outgoing', linked_id: 'p001', linked_name: '法式烘焙（法棍/可頌）', linked_type: 'product', link_type: 'needs', created_at: isoDate(10) },
    { direction: 'outgoing', linked_id: 'p003', linked_name: '紅藜烤雞', linked_type: 'product', link_type: 'needs', created_at: isoDate(10) },
    { direction: 'outgoing', linked_id: 'p009', linked_name: '量販促銷 DM', linked_type: 'product', link_type: 'needs', created_at: isoDate(8) },
  ],
  s004: [
    { direction: 'outgoing', linked_id: 'p001', linked_name: '法式烘焙（法棍/可頌）', linked_type: 'product', link_type: 'needs', created_at: isoDate(10) },
    { direction: 'outgoing', linked_id: 'b001', linked_name: '家樂福', linked_type: 'brand', link_type: 'involves', created_at: isoDate(8) },
  ],
  s005: [
    { direction: 'outgoing', linked_id: 'e006', linked_name: 'OPENPOINT 整合', linked_type: 'event', link_type: 'involves', created_at: isoDate(10) },
    { direction: 'outgoing', linked_id: 'p008', linked_name: '家樂福聯名信用卡', linked_type: 'product', link_type: 'involves', created_at: isoDate(8) },
  ],
  s003: [
    { direction: 'outgoing', linked_id: 'p005', linked_name: '家樂福線上購物', linked_type: 'product', link_type: 'needs', created_at: isoDate(10) },
    { direction: 'outgoing', linked_id: 'p006', linked_name: '家樂福 APP', linked_type: 'product', link_type: 'needs', created_at: isoDate(10) },
    { direction: 'outgoing', linked_id: 'p004', linked_name: '生鮮蔬果區', linked_type: 'product', link_type: 'needs', created_at: isoDate(8) },
  ],
  s006: [
    { direction: 'outgoing', linked_id: 'p007', linked_name: '法國進口商品專區', linked_type: 'product', link_type: 'needs', created_at: isoDate(10) },
    { direction: 'outgoing', linked_id: 'p015', linked_name: '酒類專區', linked_type: 'product', link_type: 'needs', created_at: isoDate(8) },
    { direction: 'outgoing', linked_id: 'p012', linked_name: '有機/健康食品區', linked_type: 'product', link_type: 'needs', created_at: isoDate(6) },
  ],
  s007: [
    { direction: 'outgoing', linked_id: 'p007', linked_name: '法國進口商品專區', linked_type: 'product', link_type: 'needs', created_at: isoDate(10) },
    { direction: 'outgoing', linked_id: 'p015', linked_name: '酒類專區', linked_type: 'product', link_type: 'needs', created_at: isoDate(8) },
    { direction: 'outgoing', linked_id: 'p003', linked_name: '紅藜烤雞', linked_type: 'product', link_type: 'needs', created_at: isoDate(8) },
    { direction: 'outgoing', linked_id: 'p004', linked_name: '生鮮蔬果區', linked_type: 'product', link_type: 'needs', created_at: isoDate(6) },
  ],
  s008: [
    { direction: 'outgoing', linked_id: 'p009', linked_name: '量販促銷 DM', linked_type: 'product', link_type: 'needs', created_at: isoDate(10) },
    { direction: 'outgoing', linked_id: 'p010', linked_name: '冷凍食品專區', linked_type: 'product', link_type: 'needs', created_at: isoDate(8) },
    { direction: 'outgoing', linked_id: 'p013', linked_name: '嬰幼兒用品區', linked_type: 'product', link_type: 'needs', created_at: isoDate(6) },
    { direction: 'outgoing', linked_id: 'p014', linked_name: '寵物用品區', linked_type: 'product', link_type: 'needs', created_at: isoDate(6) },
    { direction: 'outgoing', linked_id: 'p005', linked_name: '家樂福線上購物', linked_type: 'product', link_type: 'needs', created_at: isoDate(5) },
  ],
  k003: [
    { direction: 'outgoing', linked_id: 'p001', linked_name: '法式烘焙（法棍/可頌）', linked_type: 'product', link_type: 'discusses', created_at: isoDate(5) },
    { direction: 'outgoing', linked_id: 'b001', linked_name: '家樂福', linked_type: 'brand', link_type: 'discusses', created_at: isoDate(3) },
  ],
  k006: [
    { direction: 'outgoing', linked_id: 'b001', linked_name: '家樂福', linked_type: 'brand', link_type: 'discusses', created_at: isoDate(4) },
    { direction: 'outgoing', linked_id: 'b002', linked_name: '全聯福利中心', linked_type: 'brand', link_type: 'discusses', created_at: isoDate(4) },
    { direction: 'outgoing', linked_id: 'b003', linked_name: '好市多 Costco', linked_type: 'brand', link_type: 'discusses', created_at: isoDate(3) },
  ],
  e001: [
    { direction: 'outgoing', linked_id: 'b001', linked_name: '家樂福', linked_type: 'brand', link_type: 'involves', created_at: isoDate(60) },
    { direction: 'outgoing', linked_id: 'b005', linked_name: '統一企業集團', linked_type: 'brand', link_type: 'involves', created_at: isoDate(60) },
  ],
  e002: [
    { direction: 'outgoing', linked_id: 'b001', linked_name: '家樂福', linked_type: 'brand', link_type: 'involves', created_at: isoDate(30) },
    { direction: 'outgoing', linked_id: 's001', linked_name: '品牌更名轉型', linked_type: 'scenario', link_type: 'triggers', created_at: isoDate(20) },
  ],
  e003: [
    { direction: 'outgoing', linked_id: 'b001', linked_name: '家樂福', linked_type: 'brand', link_type: 'involves', created_at: isoDate(15) },
    { direction: 'outgoing', linked_id: 'b005', linked_name: '統一企業集團', linked_type: 'brand', link_type: 'involves', created_at: isoDate(15) },
  ],
  e004: [
    { direction: 'outgoing', linked_id: 'p001', linked_name: '法式烘焙（法棍/可頌）', linked_type: 'product', link_type: 'involves', created_at: isoDate(10) },
    { direction: 'outgoing', linked_id: 'b001', linked_name: '家樂福', linked_type: 'brand', link_type: 'involves', created_at: isoDate(10) },
  ],
  e005: [
    { direction: 'outgoing', linked_id: 'b001', linked_name: '家樂福', linked_type: 'brand', link_type: 'involves', created_at: isoDate(10) },
    { direction: 'outgoing', linked_id: 'l002', linked_name: '家樂福桂林店', linked_type: 'place', link_type: 'involves', created_at: isoDate(5) },
  ],
  e006: [
    { direction: 'outgoing', linked_id: 'b001', linked_name: '家樂福', linked_type: 'brand', link_type: 'involves', created_at: isoDate(20) },
    { direction: 'outgoing', linked_id: 'b005', linked_name: '統一企業集團', linked_type: 'brand', link_type: 'involves', created_at: isoDate(20) },
    { direction: 'outgoing', linked_id: 's005', linked_name: '會員點數經濟', linked_type: 'scenario', link_type: 'involves', created_at: isoDate(15) },
  ],
}

const ALIAS_MAP: Record<string, string[]> = {
  b001: ['Carrefour', '家福', '家樂福量販店', '家樂福超市', 'Carrefour Taiwan', '嘉福', '家樂福量販', '家福公司', '康達盛通'],
  b002: ['全聯', 'PX Mart', 'PXMart', '全聯社'],
  b003: ['Costco', '好市多', 'COSTCO', '好事多'],
  b004: ['RT-Mart', '大潤發量販', '大全聯'],
  b005: ['統一', 'Uni-President', '統一集團', '統一企業'],
  b008: ['Mia', "Mia C'bon"],
  p001: ['法棍', '可頌', '蝴蝶酥', '家樂福麵包', '烘焙區', '長法棍', '圓法棍', '歐式麵包', '大蒜麵包條', '牛奶酥棒'],
  p002: ['Carrefour Bio', 'Carrefour Classic', '家樂福牌', '自有品牌', '家樂福有機'],
  p003: ['烤雞', '紅藜雞', 'Carrefour 烤雞', '美式烤雞', '烤全雞', '紅藜蔬菜烤雞'],
  p005: ['家樂福網購', '線上購物', 'Carrefour Online', '家速配', '家樂福線上商城'],
  p007: ['法國貨', '進口專區', '法國起司', '法國紅酒', '法國進口', '歐洲進口'],
  e001: ['統一收購', '家樂福被買', '收購案'],
  e002: ['品牌到期', '授權到期', 'Carrefour 授權'],
  e003: ['康達盛通', '改名', '更名', '康達盛通生活事業'],
  e006: ['OPENPOINT', 'OP點數', '統一點數', 'OPEN POINT'],
  k003: ['烘焙社團', '家樂福麵包社'],
  k006: ['省錢版', 'Lifeismoney'],
  s001: ['更名', '改名', '品牌轉型', 'rebrand'],
}

function buildEntityDetail(entityId: string): EntityDetail | null {
  const entity = ENTITIES.find(e => e.id === entityId)
  if (!entity) return null

  const aspects = generateAspects(entity.type, entity.aspect_count, entity.avg_sentiment, entityId)
  const mentions = generateMentions(entity.canonical_name, entity.type, Math.min(30, entity.mention_count), entityId)
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
    sub_type: entity.sub_type ?? '',
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
// 6. AI Summary & Chat Generators
// ────────────────────────────────────────────

import type { EntityAISummary } from './types'

const AI_SUMMARY_MAP: Record<string, { headline: string; body: string; reasoning: { signal: string; reasoning: string; conclusion: string }[]; actions: { trigger: string; action: string; target: string }[] }> = {
  b001: {
    headline: '家樂福品牌資產集中在烘焙、進口、烤雞三支柱，更名是最大風險也是轉型機會',
    body: '家樂福（386 店/營收約 NT$800億/市佔 14.9%）正面臨品牌史上最大轉折：Carrefour 品牌授權 2025/12 到期，公司已更名為康達盛通，消費者品牌名尚未公佈。社群聲量因更名議題暴增 +180%，但情感分數從 0.74 降至 0.58。跨平台分析顯示品牌正面連結集中在法式烘焙（28%）、法國進口商品（18%）、紅藜烤雞（16%）。這三項是更名後必須保留的核心資產。線上購物 NPS -28 為最大弱項，門市縮減引發消費者恐慌。',
    reasoning: [
      { signal: '品牌更名搜尋量 +580%', reasoning: '消費者大量搜尋「家樂福改名」「家樂福還在嗎」，反映品牌認知正在動搖', conclusion: '需在 3 個月內公佈新品牌名並啟動全面溝通' },
      { signal: '烘焙區聲量逆勢 +45%', reasoning: '烘焙是唯一不受品牌動盪影響的品項，已建立獨立品牌力', conclusion: '烘焙應作為新品牌的核心識別元素' },
      { signal: '門市縮減 6 家，社群恐慌蔓延', reasoning: '消費者將關店與品牌消失連結，負面情緒擴散', conclusion: '關店訊息需搭配「新品牌升級」正面敘事對沖' },
    ],
    actions: [
      { trigger: '品牌命名', action: '新品牌名建議保留法系元素（如 Le Marché），3 月前內部定案', target: '品牌策略部' },
      { trigger: '烘焙子品牌', action: '評估將烘焙區獨立為子品牌，拓展街邊店型態', target: '產品開發部' },
      { trigger: '線上體驗', action: '整合統一冷鏈+黑貓配送+7-ELEVEN取貨，6月前上線新版電商', target: '數位部門' },
    ],
  },
  b002: {
    headline: '全聯以「大全聯」策略直接搶食家樂福市場',
    body: '全聯福利中心市佔 41.3%、超過 1,100 店，2026 年展店目標 80 家。其中 12 家位於家樂福關店商圈。透過大潤發改裝為「大全聯」補齊量販品項（生鮮、進口、家電），同時維持全聯低價形象。PXGo 線上購表現穩定（NPS +12）。全聯的策略明確：接收家樂福外溢客群。',
    reasoning: [
      { signal: '大全聯門市生鮮品項達家樂福 80%', reasoning: '全聯正在複製家樂福的量販優勢', conclusion: '家樂福需在「法式差異化」上拉開距離' },
      { signal: '12 家新店位於家樂福關店商圈', reasoning: '全聯精準鎖定家樂福流失客群', conclusion: '家樂福保留店需強化體驗差異' },
    ],
    actions: [
      { trigger: '競爭回應', action: '盤點家樂福獨有品項（法國進口、烘焙）全聯無法複製的項目', target: '商品部' },
    ],
  },
  s001: {
    headline: '品牌更名是 2026 零售業最大議題，3-6 個月內需完成切換',
    body: '品牌更名轉型聲量高居所有情境之首（186 則），但情感分數僅 0.42，為全部情境最低。核心焦慮：新名字會不會很醜？法國商品還有嗎？點數怎麼辦？門市會繼續關嗎？42% 消費者表示「如果新品牌做得好，改名也沒關係」——這是機會窗口。但社群情緒分析顯示消費者對不確定狀態的容忍度約 3-6 個月，超過則造成不可逆客戶流失。',
    reasoning: [
      { signal: '「康達盛通」遭網友嘲諷', reasoning: '公司名被當成品牌名來討論，消費者對新名字的期待值很高', conclusion: '新消費者品牌名必須正面、有辨識度，避免「康達盛通」的失誤' },
      { signal: '42% 消費者對更名持開放態度', reasoning: '存在正面轉化空間', conclusion: '更名公佈時需搭配大規模品牌campaign' },
    ],
    actions: [
      { trigger: '時間壓力', action: '最遲 2026/6 前公佈新品牌名並啟動全面換裝', target: '品牌策略部' },
      { trigger: '消費者溝通', action: '發起「我們不會消失，只會更好」系列內容預熱', target: '行銷部' },
    ],
  },
  p001: {
    headline: '法式烘焙是家樂福最強品牌資產，不受更名風暴影響',
    body: '法式烘焙區（法棍/可頌/蝴蝶酥）聲量 218 則、情感 0.82，為所有品項中最高。在品牌危機期間唯一正向成長的品項。IG #家樂福麵包 累計 12 萬則。消費者「不管叫什麼名字都會去買麵包」心態表明烘焙已建立獨立品牌力。烘焙師傅的留任是關鍵——社群最大恐懼是「師傅被換掉」。',
    reasoning: [
      { signal: '烘焙聲量 +45% 且情感最高', reasoning: '烘焙品牌力已獨立於家樂福母品牌之外', conclusion: '可獨立為子品牌經營' },
      { signal: '消費者最怕「師傅被換」', reasoning: '烘焙品質的靈魂在於人才', conclusion: '優先穩定烘焙團隊，以此作為更名後的品質保證' },
    ],
    actions: [
      { trigger: '子品牌', action: '評估烘焙獨立品牌可行性，街邊店+量販店雙軌', target: '產品開發部' },
      { trigger: '人才留任', action: '烘焙師傅特別留任方案（加薪+品牌共創）', target: '人資部' },
    ],
  },
  p005: {
    headline: '線上購物是最大弱項，NPS -28 遠低於競品',
    body: '家樂福線上購物 NPS -28（PXGo +12, Costco Online +22）。近兩週連續當機 2 次，Google Play 評分降至 2.8。主要痛點：配送延遲 38%、缺貨不通知 25%、APP 閃退 18%、客服無回應 12%。但統一集團擁有黑貓宅急便+7-ELEVEN 6,700 個取貨點+完整冷鏈，有條件根本翻轉線上體驗。',
    reasoning: [
      { signal: 'APP 當機 2 次/兩週', reasoning: '基礎設施不穩定，投入不足', conclusion: '需優先進行技術債清理和基礎架構升級' },
      { signal: '統一集團冷鏈+物流資源', reasoning: '集團資源可根本解決配送問題', conclusion: '整合集團物流是最有效率的解法' },
    ],
    actions: [
      { trigger: '技術升級', action: 'APP 全面重構，優先解決閃退和當機問題', target: '技術部' },
      { trigger: '物流整合', action: '導入黑貓宅急便 + 7-ELEVEN 店取模式', target: '物流部' },
    ],
  },
  p003: {
    headline: '紅藜烤雞為熟食區營收主力，但品質穩定度是隱憂',
    body: '紅藜烤雞/美式烤雞為家樂福社群討論度最高的熟食單品，年銷量約 8 萬隻。PTT 上「家樂福烤雞大勝好市多」為經典討論串，肉質紮實、醃製入味、不需會員卡為三大賣點。紅藜蔬菜烤雞 $269、美式烤雞 $298，使用產銷履歷肉雞每日新鮮現烤。但評價兩極——出爐 2 小時內品質優異，超過則大幅下滑，部分消費者強烈負評「紅藜味道噁心」「放太久又乾又柴」。',
    reasoning: [
      { signal: '評價極度兩極化', reasoning: '品質差異主要來自購買時間（出爐時段 vs 放置太久），而非商品本身', conclusion: '需導入出爐時段資訊透明化（如即時 APP 通知）' },
      { signal: '與好市多烤雞的比較持續為熱門話題', reasoning: '家樂福烤雞在非會員通路中具有獨特競爭優勢', conclusion: '更名後應強化「不需會員卡的優質烤雞」定位' },
    ],
    actions: [
      { trigger: '品質控管', action: '導入出爐時段 APP 通知，超過 3 小時下架', target: '門市營運部' },
      { trigger: '行銷強化', action: '烤雞+法棍套餐組合包，強化「家樂福晚餐提案」場景', target: '行銷部' },
    ],
  },
  p008: {
    headline: '玉山聯名卡合約到期換發 Unicard，卡友大量流失風險',
    body: '玉山家樂福聯名卡合約 2025/8/30 到期，持卡人換發玉山 Unicard（次年年費 $3,000）。核心改惡：週三品牌日從 8 折降為 88 折、基本回饋縮水、加油優惠取消。PTT creditcard 版「被降等」「直接剪卡」聲量暴增。2026/1/1 起舊卡無法使用。過渡期至 9/30 五大通路加碼 3%，最高 7.5%，但長期權益明顯縮水。',
    reasoning: [
      { signal: '週三品牌日 8 折→88 折', reasoning: '對忠誠卡友而言是「改惡」的象徵性事件，情感衝擊大於實際金額差異', conclusion: '需要以新的獨家權益（如優先搶購、會員日）彌補回饋縮水' },
      { signal: 'Unicard 年費 $3,000 vs 舊卡 $800', reasoning: '年費提高 3.75 倍但回饋下降，價值感大幅縮水', conclusion: '考慮推出低年費版本或首兩年免年費維持轉換率' },
    ],
    actions: [
      { trigger: '卡友留存', action: '新卡前兩年免年費＋家樂福專屬 5% 回饋 campaign', target: '財務合作部' },
      { trigger: '替代方案', action: '評估與中信合作推出統一集團聯名卡（涵蓋 7-11/星巴克/家樂福）', target: '策略部' },
    ],
  },
  b003: {
    headline: '好市多為家樂福最具威脅的競爭者，南部市場擴張中',
    body: '好市多台灣 14 家賣場營收逾千億元、市佔 26.6%（年增 1.7 個百分點）。高雄新店即將開幕（1,010 汽車位+400 機車位），直接進入家樂福南部優勢市場。台中評估開第 3 店（龍井交流道），好市多土地開發部總監稱台中「開 6 家都沒問題」。台南第 2 店預計 2028 年。社群「好市多 vs 家樂福」比較文持續為熱門話題。',
    reasoning: [
      { signal: '高雄新店進入家樂福南部市場', reasoning: '家樂福在南部原有較強優勢，好市多進入將直接搶食客群', conclusion: '家樂福南部門市需強化差異化（進口商品、烘焙、熟食）' },
      { signal: '好市多市佔年增 1.7 個百分點', reasoning: '好市多成長速度快於家樂福，且其會員制模式黏著度高', conclusion: '家樂福需在非會員制的便利性和獨特品項上建立護城河' },
    ],
    actions: [
      { trigger: '南部防守', action: '高雄、台南門市強化法式進口商品和烘焙差異化', target: '南區營運部' },
    ],
  },
  e001: {
    headline: '統一斥資 290 億收購完成，但品牌整合進度落後預期',
    body: '2022/7/19 統一宣布斥資 290 億收購台灣家樂福 60% 股權（另有報導總交易價 301-311 億），2023/6/30 完成交割。統一持股 70%、統一超商 30%，家樂福成為百分之百台資企業。然而收購至今超過兩年，品牌整合仍在初期階段——門市數不增反減、線上系統未整合、新品牌名尚未定案。天下雜誌「統一花 290 億買的家樂福，為何大虧？」引發業界關注。',
    reasoning: [
      { signal: '收購兩年後仍大虧', reasoning: '量販業毛利低、固定成本高，加上品牌轉型期投入大', conclusion: '短期虧損可預期，但需明確展示整合綜效時間表' },
      { signal: '統一掌控全通路（超商+超市+量販）', reasoning: 'OPENPOINT 生態圈是最大整合武器', conclusion: '加速推動跨通路導流，讓 7-11 客群導入家樂福' },
    ],
    actions: [
      { trigger: '整合提速', action: '公佈品牌整合三年路線圖，讓投資人和消費者看到方向', target: '策略部' },
    ],
  },
  e003: {
    headline: '「康達盛通」名稱遭嘲諷，品牌命名壓力巨大',
    body: '2026/1/28 臨時股東會決議公司更名「康達盛通生活事業股份有限公司」，消息曝光後立刻成為社群熱議。PTT 八卦版「康達盛通是什麼鬼名字」「聽起來像詐騙集團」「完全沒有量販店感覺」。網友自製迷因圖廣傳。統一澄清這僅為法人名稱、非品牌名稱，但傷害已造成。羅智先坦言家樂福是「天花板級」品牌名，暗示找到更好的名字極具挑戰。',
    reasoning: [
      { signal: '「康達盛通」引發大量嘲諷', reasoning: '消費者將法人名稱誤讀為品牌名稱，反映出對品牌更名的高度敏感', conclusion: '新品牌名公佈前需做充分的消費者測試和pre-launch溝通' },
      { signal: '羅智先稱家樂福為天花板級品牌名', reasoning: '承認新名字很難超越舊名字的品牌價值', conclusion: '新品牌名不需「超越」家樂福，但需「保留」其法式品質的核心聯想' },
    ],
    actions: [
      { trigger: '品牌命名', action: '委託專業品牌顧問進行消費者盲測，確保新名字不重蹈覆轍', target: '品牌策略部' },
      { trigger: '輿論管理', action: '在品牌名公佈前預先釋放「品質承諾」訊息降低焦慮', target: '公關部' },
    ],
  },
  e005: {
    headline: '門市持續縮減，消費者將關店與品牌消失直接連結',
    body: '2025 年關閉 9 間門市（4 量販 + 3 超市 + 2 Mia C\'bon）。2026/2 Mia C\'bon 再關 4 間（林森店 2/22、美麗華 2/23、中和環球 + 高雄漢神本館 2/28），包含營業 20 年的高雄漢神老店。關店後全台 Mia C\'bon 僅剩 16 家。量販大墩店也將 2 月底結束營業。每一次關店公告都在社群引發「家樂福要倒了嗎」的恐慌。羅智先表示不急著展店，要思考讓消費者更有理由走進來。',
    reasoning: [
      { signal: '20 年績優店（漢神）也關閉', reasoning: '連績優店都不保留，消費者判斷為全面撤退而非策略調整', conclusion: '需公開說明關店邏輯和保留門市的強化計畫' },
      { signal: '消費者將關店＝品牌消失', reasoning: '在品牌更名的同時又大量關店，雙重負面訊號疊加', conclusion: '短期內暫緩關店節奏，或至少每關一家同時公佈一家升級店' },
    ],
    actions: [
      { trigger: '止血', action: '暫緩 2026 Q2 計劃關閉的門市，避免與品牌更名撞期', target: '營運部' },
      { trigger: '正面敘事', action: '推出「旗艦店升級計畫」，宣佈 3 家門市改裝為新品牌示範店', target: '展店部' },
    ],
  },
  e006: {
    headline: 'OPENPOINT 整合為最大戰略武器，但回饋縮水引發反彈',
    body: '2025/9/16 家樂福會員消費改為累積 OPENPOINT 點數，回饋率 0.33%（VIP 0.5%），1 點折 1 元。舊點數無法轉換，只能折抵消費。全面停發實體會員卡改用 APP。正面：可與 7-ELEVEN（6,700 店）、康是美、星巴克、Mister Donut 共享點數，生態圈覆蓋全台最廣。負面：回饋率過低（折抵還影響導購計算損失 20%+）、年長客群不會用 APP、實體卡取消引發反彈。',
    reasoning: [
      { signal: '0.33% 回饋率低於市場預期', reasoning: '消費者比較的是「感覺」而非絕對值——舊制 1 元 1 點心理感受好', conclusion: '建議推出加碼活動（如新會員首月 3 倍點數）提升轉換感受' },
      { signal: '跨通路點數經濟潛力大', reasoning: '7-11 6,700 店 + 星巴克 550 店 + 家樂福 386 店覆蓋全台', conclusion: '長期價值高於短期回饋數字，但需透過marketing讓消費者「感受到」' },
    ],
    actions: [
      { trigger: '回饋感提升', action: '推出「OPENPOINT 三倍點數週」等限時加碼活動', target: '會員經營部' },
      { trigger: '年長客群', action: '門市設置專人協助 APP 安裝和使用教學', target: '門市營運部' },
    ],
  },
  s003: {
    headline: '線上買菜到府是成長最快的消費場景，但家樂福體驗遠落後競品',
    body: '線上買菜到府場景聲量 418 則、情感僅 0.44，為所有消費場景中體驗最差。家樂福線上購物 NPS -28，PXGo +12、Costco Online +22。家速配覆蓋 300+ 門市但延遲率偏高。統一集團優勢：黑貓宅急便完整冷鏈 + 7-ELEVEN 6,700 個取貨點，有條件從根本翻轉體驗。2015 年上線累計訂單 1,200 萬件，年增率 10%+ 顯示需求確實存在。',
    reasoning: [
      { signal: 'NPS -28 遠低於 PXGo (+12)', reasoning: '全聯 PXGo 已建立線上買菜的標竿體驗', conclusion: '家樂福需大幅投資數位基礎建設才能追上' },
      { signal: '7-ELEVEN 6,700 個取貨點', reasoning: '統一集團最強武器是「最後一哩」物流網絡', conclusion: '推出「家樂福 x 7-ELEVEN 取貨」模式可立即解決配送痛點' },
    ],
    actions: [
      { trigger: '短期止血', action: 'APP 全面重構（3 個月內解決閃退和當機）', target: '技術部' },
      { trigger: '中期翻轉', action: '導入 7-ELEVEN 店配和黑貓冷鏈，6 月前上線', target: '物流部' },
    ],
  },
  b008: {
    headline: 'Mia C\'bon 高端超市持續收縮，定位尷尬',
    body: 'Mia C\'bon 前身為 JASONS Market Place，2022 年併購頂好超市後推出。2026/2 一口氣關 4 間門市（林森、美麗華、中和環球、高雄漢神），關店後全台僅剩 16 家。含營業 20 年的高雄漢神老店。定位在「高端超市」和「家樂福超市」之間尷尬——既不如百貨超市精緻，又比一般家樂福貴。統一接手後明顯加速退場。',
    reasoning: [
      { signal: '績優 20 年老店也關閉', reasoning: 'Mia C\'bon 並非「關不好的店」，而是整體策略調整', conclusion: '統一可能計劃將 Mia C\'bon 完全併入新品牌體系' },
    ],
    actions: [
      { trigger: '定位重整', action: '評估 Mia C\'bon 是否併入新品牌或轉型為獨立高端品牌', target: '策略部' },
    ],
  },
  p002: {
    headline: '自有品牌去 Carrefour 標後面臨辨識度歸零風險',
    body: '家樂福自有品牌 1997 年推出，含 Carrefour Bio 有機系列、Carrefour Classic 經典系列等。品牌授權終止後須配合更名調整標籤與包裝。消費者反映「少了 Carrefour 就看不出跟其他雜牌有什麼差」。自有品牌的溢價能力高度仰賴 Carrefour 品牌背書，去除法文標識後辨識度恐歸零。法國進口的 Carrefour Bio 有機產品線能否繼續販售也存在疑問。',
    reasoning: [
      { signal: '「少了 Carrefour 就是一般貨」', reasoning: '自有品牌的價值不在品質差異（品質確實好），而在品牌信任', conclusion: '新自有品牌名需同樣傳遞「品質保證」訊息' },
      { signal: 'Carrefour Bio 有機系列前途未明', reasoning: '法國進口有機線是與法方授權直接相關的', conclusion: '需與法方協商 Bio 系列的獨立供應協議' },
    ],
    actions: [
      { trigger: '自有品牌重建', action: '設計新的自有品牌視覺系統，保留品質認證和法式元素', target: '商品部' },
      { trigger: '供應鏈確保', action: '與法方協商 Carrefour Bio 系列獨立供貨合約', target: '採購部' },
    ],
  },
  p004: {
    headline: '生鮮品質下滑為最大客訴來源，但統一冷鏈可根本解決',
    body: '生鮮蔬果區聲量 428 則、情感 0.52，近期持續惡化。Google 評論大量「菜都爛的」「水果隔天就壞」「品管變差」。疑似供應鏈調整期間品質控制鬆散。但統一集團擁有全台最完整的冷鏈物流體系（黑貓宅急便），若導入統一冷鏈標準，可從弱項變成強項。消費者「希望家樂福菜能像 Costco 一樣新鮮」的聲音很多。',
    reasoning: [
      { signal: '品質下滑與供應鏈調整同步', reasoning: '統一接手後調整供應商，過渡期品管出現空窗', conclusion: '加速完成供應商整合，導入統一集團品管標準' },
    ],
    actions: [
      { trigger: '品管升級', action: '導入統一冷鏈物流標準至所有門市生鮮區', target: '供應鏈管理部' },
      { trigger: '產地直送', action: '與全台農會合作「產地直送」計畫，縮短供應鏈', target: '採購部' },
    ],
  },
  s005: {
    headline: '會員點數經濟轉型痛苦，回饋縮水是核心不滿',
    body: '家樂福好康卡→OPENPOINT 轉換為消費者抱怨最集中的議題之一。核心痛點：舊點數無法轉換只能折抵、0.33% 回饋率感受極低、折抵點數影響導購計算損失 20%+、實體卡停發對年長客群不友善。PTT Lifeismoney 版精算文大量出現，研究即享券搭配 LINE Points 等替代方案（最高可達 13% 回饋），顯示消費者正在積極「自救」而非接受新制。',
    reasoning: [
      { signal: '消費者自行研發替代回饋方案', reasoning: '即享券+LINE Points 回饋可達 13%，遠超官方 0.33%', conclusion: '消費者不缺忠誠度，缺的是合理的回饋感受' },
    ],
    actions: [
      { trigger: '回饋提升', action: '新品牌上市搭配 OPENPOINT 10 倍點數活動（限時 3 個月）', target: '會員經營部' },
      { trigger: '年長友善', action: '保留紙本集點卡 6 個月過渡期，搭配門市教學', target: '門市營運部' },
    ],
  },
}

function generateAISummary(entity: EntitySummary, entitySignals: InboxFact[]): EntityAISummary {
  const mapped = AI_SUMMARY_MAP[entity.id]
  if (mapped) {
    return { headline: mapped.headline, reasoning_chain: mapped.reasoning, body: mapped.body, actions: mapped.actions, generated_at: new Date().toISOString() }
  }
  const sentLabel = entity.avg_sentiment >= 0.7 ? '正面' : entity.avg_sentiment >= 0.5 ? '中性偏正' : '偏負面'
  const criticals = entitySignals.filter(s => s.severity === 'critical')
  const warnings = entitySignals.filter(s => s.severity === 'warning')
  const reasoning = entitySignals.slice(0, 3).map(s => ({
    signal: s.title,
    reasoning: `此信號反映 ${entity.canonical_name} 在「${s.title.split(' ')[0]}」面向的變化趨勢`,
    conclusion: s.severity === 'critical' ? '需立即關注' : s.severity === 'warning' ? '建議持續監測' : '目前趨勢穩定',
  }))
  const actions = criticals.length > 0
    ? [{ trigger: criticals[0].title, action: '立即啟動應急處理流程', target: '相關團隊' }]
    : warnings.length > 0
    ? [{ trigger: warnings[0].title, action: '安排專人追蹤分析', target: '分析團隊' }]
    : [{ trigger: '常規監測', action: '維持現有監測頻率', target: '數據團隊' }]
  return {
    headline: `${entity.canonical_name} 聲量分析：${entity.mention_count} 則提及，整體情感${sentLabel}`,
    reasoning_chain: reasoning,
    body: `${entity.canonical_name}（${entity.type}）在過去 4 週共有 ${entity.mention_count} 則提及，涵蓋 ${entity.aspect_count} 個面向，整體情感分數 ${Math.round(entity.avg_sentiment * 100)}%。${criticals.length > 0 ? `目前有 ${criticals.length} 個嚴重警示需要立即處理。` : ''}${warnings.length > 0 ? `另有 ${warnings.length} 個警告信號值得關注。` : '整體表現穩定。'}`,
    actions,
    generated_at: new Date().toISOString(),
  }
}

function generateChatReply(entity: EntitySummary, userMsg: string): string {
  const entitySignals = SIGNALS.filter(s => s.object_id === entity.id)
  const links = LINK_MAP[entity.id] ?? []
  const summary = AI_SUMMARY_MAP[entity.id]
  const sentPct = Math.round(entity.avg_sentiment * 100)
  const sentLabel = entity.avg_sentiment >= 0.7 ? '正面' : entity.avg_sentiment >= 0.5 ? '中性偏正' : '偏負面'

  const relatedProducts = links.filter(l => l.linked_type === 'product').map(l => l.linked_name)
  const relatedScenarios = links.filter(l => l.linked_type === 'scenario').map(l => l.linked_name)
  const relatedBrands = links.filter(l => l.linked_type === 'brand').map(l => l.linked_name)
  const criticals = entitySignals.filter(s => s.severity === 'critical')
  const warnings = entitySignals.filter(s => s.severity === 'warning')
  const opportunities = entitySignals.filter(s => s.fact_type === 'opportunity')

  const sections: string[] = []
  sections.push(`針對你的問題，以下是 **${entity.canonical_name}** 的分析：\n`)
  sections.push(`目前累計 ${entity.mention_count} 則提及、情感分數 ${sentPct}%（${sentLabel}）、${entity.aspect_count} 個討論面向。`)

  if (entitySignals.length > 0) {
    const userWords = userMsg.replace(/[?？！!。，、]/g, '').split(/\s+/).filter(w => w.length >= 2)
    let relevantSignals = entitySignals.filter(s => userWords.some(w => s.title.includes(w) || s.description.includes(w)))
    if (relevantSignals.length === 0) relevantSignals = entitySignals.slice(0, 3)
    sections.push(`\n**相關信號：**\n${relevantSignals.slice(0, 4).map(s => {
      const icon = s.severity === 'critical' ? '🔴' : s.severity === 'warning' ? '🟡' : '🔵'
      return `${icon} ${s.title}：${s.description.slice(0, 80)}${s.description.length > 80 ? '...' : ''}`
    }).join('\n')}`)
  }

  const relParts: string[] = []
  if (relatedProducts.length > 0) relParts.push(`相關產品：${relatedProducts.slice(0, 4).join('、')}`)
  if (relatedScenarios.length > 0) relParts.push(`關聯情境：${relatedScenarios.slice(0, 4).join('、')}`)
  if (relatedBrands.length > 0) relParts.push(`關聯品牌：${relatedBrands.slice(0, 3).join('、')}`)
  if (relParts.length > 0) sections.push(`\n**關係圖譜：**\n${relParts.map(p => `• ${p}`).join('\n')}`)

  if (criticals.length > 0 || warnings.length > 0 || opportunities.length > 0) {
    const riskParts: string[] = []
    if (criticals.length > 0) riskParts.push(`⚠️ ${criticals.length} 則嚴重警示：${criticals.map(c => c.title).join('、')}`)
    if (warnings.length > 0) riskParts.push(`🟡 ${warnings.length} 則中度警示持續監測中`)
    if (opportunities.length > 0) riskParts.push(`💡 ${opportunities.length} 個潛在機會：${opportunities.map(o => o.title).join('、')}`)
    sections.push(`\n**風險與機會：**\n${riskParts.join('\n')}`)
  }

  if (summary) {
    const relevantReasoning = summary.reasoning.find(r =>
      userMsg.split('').some(c => r.signal.includes(c) || r.conclusion.includes(c))
    ) || summary.reasoning[0]
    if (relevantReasoning) {
      sections.push(`\n**洞察推論：**\n📊 信號「${relevantReasoning.signal}」→ ${relevantReasoning.reasoning} → **${relevantReasoning.conclusion}**`)
    }
    if (summary.actions.length > 0) {
      sections.push(`\n**建議行動：**\n${summary.actions.map(a => `• **${a.trigger}**：${a.action}（→ ${a.target}）`).join('\n')}`)
    }
  }

  if (entity.type === 'brand' || entity.type === 'product' || entity.type === 'scenario') {
    sections.push(`\n**市場背景：**\n台灣零售量販市場格局：全聯 41.3%（1,100+店）、好市多 26.6%（14 店/會員制）、家樂福 14.9%（386 店/含 Mia C'bon 21 店）。統一集團 2024/12 完成收購（約 NT$290億），品牌授權 2025/12 到期，公司 2026/1 更名為康達盛通，消費者新品牌名 TBD。核心資產：法式烘焙（聲量佔比 28%）、法國進口商品（18%）、紅藜烤雞（16%）。全聯以「大全聯」策略搶食家樂福客群。`)
  }

  return sections.join('\n')
}

// ────────────────────────────────────────────
// 7. Route Handler
// ────────────────────────────────────────────

function json(data: unknown): Response {
  return new Response(JSON.stringify(data), { status: 200, headers: { 'Content-Type': 'application/json' } })
}

function sseStream(text: string): Response {
  const encoder = new TextEncoder()
  const chunks: string[] = []
  for (let i = 0; i < text.length; i += 20) chunks.push(text.slice(i, i + 20))
  let idx = 0
  const stream = new ReadableStream({
    start(controller) {
      function push() {
        if (idx < chunks.length) {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content: chunks[idx] })}\n\n`))
          idx++
          setTimeout(push, 30 + Math.random() * 40)
        } else {
          controller.enqueue(encoder.encode('data: [DONE]\n\n'))
          controller.close()
        }
      }
      setTimeout(push, 600 + Math.random() * 400)
    },
  })
  return new Response(stream, { status: 200, headers: { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache' } })
}

function enrichEntity(e: EntitySummary): EntitySummary {
  const pattern = OBS_PATTERNS[e.id]
  if (pattern && pattern.length >= 2) {
    const sparkline = pattern.map(p => p[0]).reverse()
    const curr = pattern[0][0]
    const prev = pattern[1][0]
    const mention_delta = prev > 0 ? Math.round(((curr - prev) / prev) * 100) : 0
    return { ...e, sparkline, mention_delta }
  }
  const base = Math.max(1, Math.round(e.mention_count / 24))
  const sparkline = Array.from({ length: 12 }, (_, i) => {
    const wave = Math.sin(i * 0.6) * 0.15
    return Math.max(0, Math.round(base * (1 + wave + (11 - i) * 0.02)))
  })
  return { ...e, sparkline, mention_delta: 0 }
}

function handleApi(url: string, init?: RequestInit): Response | null {
  const parsed = new URL(url, 'http://localhost')
  const path = parsed.pathname
  const params = parsed.searchParams

  if (init?.method === 'PATCH') return json({ success: true })

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
    const enriched = list.map(enrichEntity)
    const sorted = enriched.slice().sort((a, b) => {
      const aVal = (a as unknown as Record<string, unknown>)[sort] as number ?? 0
      const bVal = (b as unknown as Record<string, unknown>)[sort] as number ?? 0
      return order === 'desc' ? bVal - aVal : aVal - bVal
    })
    const result = sorted.slice(0, limit)
    return json({ data: result, pagination: { offset: 0, limit, total: sorted.length, has_more: sorted.length > limit } })
  }

  if (path === '/api/dashboard') return json(DASHBOARD)

  if (path === '/api/inbox/count') {
    const unread = SIGNALS.filter(s => !s.is_read).length
    return json({ count: unread, data: { unread } })
  }

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

  const obsMatch = path.match(/^\/api\/entities\/([^/]+)\/observations$/)
  if (obsMatch) {
    const id = obsMatch[1]
    const entity = ENTITIES.find(e => e.id === id)
    if (!entity) return json({ data: [] })
    const obs = generateObservations(id, entity.mention_count, entity.avg_sentiment)
    const limit = Number(params.get('limit') ?? 24)
    return json({ data: obs.slice(0, limit), pagination: { offset: 0, limit, total: obs.length, has_more: false } })
  }

  const summaryMatch = path.match(/^\/api\/entities\/([^/]+)\/summary$/)
  if (summaryMatch) {
    const id = summaryMatch[1]
    const entity = ENTITIES.find(e => e.id === id)
    if (!entity) return json({ data: null })
    const entitySignals = SIGNALS.filter(s => s.object_id === id)
    return json({ data: generateAISummary(entity, entitySignals) })
  }

  const chatMatch = path.match(/^\/api\/entities\/([^/]+)\/chat$/)
  if (chatMatch) {
    const id = chatMatch[1]
    const entity = ENTITIES.find(e => e.id === id)
    if (!entity) return sseStream('找不到該實體的資料。')
    let body: { question?: string; messages?: { role: string; content: string }[] } = {}
    try { body = init?.body ? JSON.parse(init.body as string) : {} } catch {}
    const lastMsg = body.question || (body.messages?.filter(m => m.role === 'user').pop()?.content ?? '')
    return sseStream(generateChatReply(entity, lastMsg))
  }

  const factsMatch = path.match(/^\/api\/entities\/([^/]+)\/facts$/)
  if (factsMatch) {
    const id = factsMatch[1]
    return json({ data: SIGNALS.filter(s => s.object_id === id), pagination: { offset: 0, limit: 10, total: SIGNALS.filter(s => s.object_id === id).length, has_more: false } })
  }

  const detailMatch = path.match(/^\/api\/entities\/([^/]+)$/)
  if (detailMatch) {
    const id = detailMatch[1]
    const detail = buildEntityDetail(id)
    if (!detail) return json({ data: null })
    return json({ data: detail })
  }

  if (path === '/api/entity-types') {
    const typeCounts = new Map<string, number>()
    for (const e of ENTITIES) typeCounts.set(e.type, (typeCounts.get(e.type) ?? 0) + 1)
    const types = Array.from(typeCounts.entries()).map(([name, count]) => ({ name, display_name: name, entity_count: count }))
    return json({ data: types })
  }

  if (path === '/api/graph') {
    const edges = Object.entries(LINK_MAP).flatMap(([sourceId, links]) =>
      links.filter(l => l.direction === 'outgoing').map(l => ({ source_id: sourceId, target_id: l.linked_id, link_type: l.link_type }))
    )
    return json({ data: { nodes: ENTITIES, edges } })
  }

  return null
}

// ────────────────────────────────────────────
// 8. Global Fetch Interceptor
// ────────────────────────────────────────────

const _originalFetch = window.fetch.bind(window)
const _summaryCache = new Set<string>()

window.fetch = ((input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
  const url = typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url
  if (url.startsWith('/api/')) {
    const mock = handleApi(url, init)
    if (mock) {
      const isChat = url.includes('/chat')
      if (isChat) return Promise.resolve(mock)

      const smMatch = url.match(/\/entities\/([^/]+)\/summary/)
      if (smMatch) {
        const eid = smMatch[1]
        if (_summaryCache.has(eid)) return new Promise(resolve => setTimeout(() => resolve(mock), 80 + Math.random() * 80))
        _summaryCache.add(eid)
        return new Promise(resolve => setTimeout(() => resolve(mock), 3000 + Math.random() * 2000))
      }

      return new Promise(resolve => setTimeout(() => resolve(mock), 80 + Math.random() * 120))
    }
  }
  return _originalFetch(input, init)
}) as typeof window.fetch
