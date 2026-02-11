import type { MentionItem } from '../../types'

// Highlight color by sentiment (matches ref: bg-primary/20 for positive, bg-red-100 for negative)
const HIGHLIGHT: Record<string, string> = {
  positive: 'bg-primary/20 text-primary px-1 rounded font-semibold',
  negative: 'bg-red-100 text-red-600 px-1 rounded font-semibold',
  neutral: 'bg-slate-100 text-slate-700 px-1 rounded font-semibold',
  mixed: 'bg-amber-100 text-amber-700 px-1 rounded font-semibold',
}

// Sentiment tag pill (matches ref green/rose/gray/orange scheme)
const SENTIMENT_TAG: Record<string, { label: string; style: string; icon: string }> = {
  positive: { label: 'Positive', style: 'bg-green-50 border-green-100 text-green-700', icon: 'sentiment_satisfied' },
  negative: { label: 'Negative', style: 'bg-rose-50 border-rose-100 text-rose-700', icon: 'sentiment_dissatisfied' },
  neutral: { label: 'Neutral', style: 'bg-gray-100 border-gray-200 text-gray-700', icon: 'sentiment_neutral' },
  mixed: { label: 'Mixed', style: 'bg-orange-50 border-orange-100 text-orange-700', icon: 'sentiment_neutral' },
}

// Platform icon config (matches ref: IG gradient, TT black w/ music_note, FB blue)
const PLATFORM_STYLE: Record<string, { bg: string; label: string; displayName: string; urlBase: string }> = {
  instagram: { bg: 'bg-gradient-to-tr from-yellow-400 to-red-500', label: 'IG', displayName: 'Instagram', urlBase: 'https://instagram.com/p/' },
  youtube: { bg: 'bg-red-500', label: 'YT', displayName: 'YouTube', urlBase: 'https://youtube.com/watch?v=' },
  tiktok: { bg: 'bg-black', label: 'TT', displayName: 'TikTok', urlBase: 'https://tiktok.com/@user/video/' },
  facebook: { bg: 'bg-blue-500', label: 'f', displayName: 'Facebook', urlBase: 'https://facebook.com/post/' },
  twitter: { bg: 'bg-sky-500', label: 'X', displayName: 'Twitter', urlBase: 'https://x.com/i/status/' },
  threads: { bg: 'bg-black', label: 'TH', displayName: 'Threads', urlBase: 'https://threads.net/p/' },
  ptt: { bg: 'bg-indigo-700', label: 'P', displayName: 'PTT', urlBase: 'https://www.ptt.cc/bbs/Gossiping/' },
  dcard: { bg: 'bg-sky-400', label: 'D', displayName: 'Dcard', urlBase: 'https://www.dcard.tw/f/trending/p/' },
}

// Avatar background colors (deterministic by name)
const AVATAR_COLORS = [
  'bg-blue-500', 'bg-emerald-500', 'bg-violet-500', 'bg-rose-500',
  'bg-amber-500', 'bg-teal-500', 'bg-indigo-500', 'bg-pink-500',
]

// AI content-tag rules (keyword → tag)
const TAG_RULES: Array<{ keywords: string[]; label: string; style: string; icon: string }> = [
  { keywords: ['推薦', '好喝', '讚', '好吃', '值得', '必喝'], label: '推薦', style: 'bg-blue-50 text-blue-700 border-blue-100', icon: 'thumb_up' },
  { keywords: ['業配', '合作', '代言'], label: '業配', style: 'bg-orange-50 text-orange-700 border-orange-100', icon: 'handshake' },
  { keywords: ['新品', '限定', '新出', '新推出'], label: '新品', style: 'bg-purple-50 text-purple-700 border-purple-100', icon: 'new_releases' },
  { keywords: ['排隊', '等了', '等候'], label: '等候時間', style: 'bg-gray-100 text-gray-700 border-gray-200', icon: 'schedule' },
  { keywords: ['拍照', '打卡', '裝潢'], label: '環境體驗', style: 'bg-pink-50 text-pink-700 border-pink-100', icon: 'photo_camera' },
  { keywords: ['團購', '買一送一', '優惠'], label: '促銷', style: 'bg-teal-50 text-teal-700 border-teal-100', icon: 'local_offer' },
]

function deriveContentTags(content: string): Array<{ label: string; style: string; icon: string }> {
  const tags: Array<{ label: string; style: string; icon: string }> = []
  for (const rule of TAG_RULES) {
    if (rule.keywords.some(kw => content.includes(kw))) {
      tags.push({ label: rule.label, style: rule.style, icon: rule.icon })
    }
  }
  return tags.slice(0, 2)
}

function highlightMention(content: string, mentionText: string, sentiment: string) {
  if (!mentionText) return content
  const idx = content.indexOf(mentionText)
  if (idx === -1) return content
  const cls = HIGHLIGHT[sentiment] ?? HIGHLIGHT.neutral
  return (
    <>
      {content.slice(0, idx)}
      <mark className={cls}>{mentionText}</mark>
      {content.slice(idx + mentionText.length)}
    </>
  )
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const hours = Math.floor(diff / 3600000)
  if (hours < 1) return 'Just now'
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d ago`
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function getInitials(name: string): string {
  if (!name) return '?'
  if (/[\u4e00-\u9fff\u3400-\u4dbf]/.test(name)) return name.charAt(0)
  const parts = name.split(/[\s_]+/).filter(Boolean)
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase()
  return name.charAt(0).toUpperCase()
}

function avatarColor(name: string): string {
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash)
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length]
}

interface MentionCardProps {
  mention: MentionItem
}

function getSourceUrl(mention: MentionItem): string {
  if (mention.source_url) return mention.source_url
  const platform = PLATFORM_STYLE[mention.platform]
  const base = platform?.urlBase ?? 'https://example.com/post/'
  return `${base}${mention.post_id}`
}

export function MentionCard({ mention }: MentionCardProps) {
  const sentTag = SENTIMENT_TAG[mention.sentiment] ?? SENTIMENT_TAG.neutral
  const contentTags = deriveContentTags(mention.content)
  const authorName = mention.author_name || 'Anonymous'
  const platform = PLATFORM_STYLE[mention.platform] ?? { bg: 'bg-slate-400', label: '?', displayName: 'Unknown', urlBase: '' }
  const sourceUrl = getSourceUrl(mention)

  return (
    <article className="bg-surface-light rounded-xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
      {/* Header: Avatar + Author + Time + Actions */}
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-3">
          <div className={`size-10 rounded-full ${avatarColor(authorName)} flex items-center justify-center text-white text-sm font-bold shrink-0 border border-gray-100`}>
            {getInitials(authorName)}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <p className="text-sm font-bold text-[#101817]">{authorName}</p>
            </div>
            <p className="text-xs text-gray-500 flex items-center gap-1">
              <span className={`size-3 rounded-full ${platform.bg} flex items-center justify-center text-[8px] text-white font-bold`}>
                {platform.label}
              </span>
              {platform.displayName} • {timeAgo(mention.created_at)}
            </p>
          </div>
        </div>
        <a
          href={sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-slate-300 hover:text-primary transition-colors shrink-0"
          title="View original post"
        >
          <span className="material-symbols-outlined text-[11px]">arrow_outward</span>
        </a>
      </div>

      {/* Content with highlighted mention */}
      <p className="text-[#101817] text-sm leading-relaxed mb-4">
        {highlightMention(mention.content, mention.mention_text, mention.sentiment)}
      </p>

      {/* AI Tag pills + source link */}
      <div className="flex flex-wrap items-center gap-2">
        <div className={`flex items-center gap-0.5 px-1.5 py-px rounded-full text-[9px] font-medium border cursor-default ${sentTag.style}`}>
          <span className="material-symbols-outlined text-[14px] scale-50 -mx-1">{sentTag.icon}</span>
          {sentTag.label}
        </div>
        <div className="flex items-center gap-0.5 px-1.5 py-px rounded-full text-[9px] font-medium bg-purple-50 text-purple-700 border border-purple-100 cursor-default">
          <span className="material-symbols-outlined text-[14px] scale-50 -mx-1">label</span>
          {mention.mention_text}
        </div>
        {contentTags.map(tag => (
          <div key={tag.label} className={`flex items-center gap-0.5 px-1.5 py-px rounded-full text-[9px] font-medium border cursor-default ${tag.style}`}>
            <span className="material-symbols-outlined text-[14px] scale-50 -mx-1">{tag.icon}</span>
            {tag.label}
          </div>
        ))}
      </div>
    </article>
  )
}
