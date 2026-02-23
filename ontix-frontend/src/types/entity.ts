// Unified API response envelope
export interface ApiResponse<T> {
  data: T
  pagination?: PaginationMeta
}

export interface PaginationMeta {
  offset: number
  limit: number
  total: number
  has_more: boolean
}

// Entity list summary (from /api/entities)
export interface EntitySummary {
  id: string
  canonical_name: string
  type: string
  sub_type?: string
  mention_count: number
  aspect_count: number
  avg_sentiment: number
  mention_delta?: number | null
  sparkline?: number[]
}

// Entity detail stats
export interface EntityDetailStats {
  mention_count: number
  aspect_count: number
  avg_sentiment: number
  positive_count: number
  negative_count: number
  neutral_count: number
  mixed_count: number
}

// Entity detail (from /api/entities/:id)
export interface EntityDetail {
  id: string
  canonical_name: string
  type: string
  sub_type: string
  status: string
  properties?: Record<string, unknown>
  created_at: string
  aliases: string[]
  stats: EntityDetailStats
  top_aspects?: AspectSummary[]
  links?: LinkItem[]
  recent_mentions?: MentionItem[]
}

// Topic distribution item (KOL → topics via 'discusses' relation)
export interface TopicDistributionItem {
  topic_id: string
  topic_name: string
  category: string
  mention_count: number
  percentage: number
}

// Discusser item (Topic → who discusses it)
export interface DiscusserItem {
  entity_id: string
  entity_name: string
  entity_type: string
  mention_count: number
  avg_sentiment: number
}

// Aspect summary (from /api/entities/:id/aspects)
export interface AspectSummary {
  aspect: string
  total: number
  avg_sentiment: number
  positive_count: number
  negative_count: number
  neutral_count: number
}

// Mention item (from /api/entities/:id/mentions)
export interface MentionItem {
  post_id: number
  content: string
  sentiment: string
  sentiment_score: number
  mention_text: string
  author_name: string
  platform: string
  created_at: string
  source_url?: string // future: real URL from crawler
}

// Link item (from /api/entities/:id/links)
export interface LinkItem {
  direction: 'outgoing' | 'incoming'
  linked_id: string
  linked_name: string
  linked_type: string
  link_type: string
  created_at: string
}

// Entity type count (from /api/entity-types)
export interface EntityTypeItem {
  name: string
  display_name: string
  entity_count: number
}

// Inbox fact (from /api/inbox)
export interface InboxFact {
  id: number
  object_id: string
  entity_name: string
  entity_type: string
  fact_type: 'alert' | 'risk_signal' | 'trend' | 'insight' | 'opportunity'
  severity: 'info' | 'warning' | 'critical'
  title: string
  description: string
  evidence?: Record<string, unknown>
  period_start?: string
  period_type?: string
  is_read: boolean
  created_at: string
}

// Entity grid item (EntitySummary + signals)
export interface EntityGridItem extends EntitySummary {
  signals: InboxFact[]
  signalCount: number
  topSignal: InboxFact | null
}

// Observation trend data point (from /api/entities/:id/observations)
export interface EntityObservation {
  period_start: string
  period_type: string
  mention_count: number
  avg_sentiment: number
  positive_count: number
  negative_count: number
  neutral_count: number
  mixed_count: number
}

// Graph API types (from /api/graph — nodes reuse EntitySummary)
export interface GraphEdge {
  source_id: string
  target_id: string
  link_type: string
}

export interface GraphData {
  nodes: EntitySummary[]
  edges: GraphEdge[]
}

// KOL attribution item (from /api/entities/:id/kol-attribution)
export interface KOLAttribution {
  kol_id: string
  kol_name: string
  kol_type: string
  relation_type: string
  co_mention_count: number
  avg_sentiment: number
  contribution_pct: number
  sparkline: number[]
}

// AI Insight Summary (from /api/entities/:id/summary)
export interface ReasoningStep {
  signal: string
  reasoning: string
  conclusion: string
}

export interface ActionItem {
  trigger: string
  action: string
  target: string
}

export interface EntityAISummary {
  headline: string
  reasoning_chain: ReasoningStep[]
  body: string
  actions: ActionItem[]
  generated_at: string
}

// AI Follow-up Chat
export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

// Dashboard API response (direct object, not envelope)
export interface DashboardStats {
  total_posts: number
  avg_sentiment: number
  total_sources: number
  period_label: string
}

export interface DashboardEntityHighlight {
  id: string
  canonical_name: string
  type: string
  mention_count: number
  avg_sentiment: number
}

export interface DashboardResponse {
  stats: DashboardStats
  entity_highlights: {
    most_mentioned: DashboardEntityHighlight[]
    most_positive: DashboardEntityHighlight[]
    most_negative: DashboardEntityHighlight[]
  }
}
