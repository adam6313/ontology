import { useState, useRef, useEffect, useCallback, type RefObject } from 'react'
import type { ChatMessage } from '../../types'

/** Renders inline markup: **bold**, !!red!!, [[name|id]] entity links */
function InlineMarkup({ text }: { text: string }) {
  const parts = text.split(/(\*\*[^*]+\*\*|!![^!]+!!|\[\[[^\]]+\]\])/)
  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <span key={i} className="font-semibold">{part.slice(2, -2)}</span>
        }
        if (part.startsWith('!!') && part.endsWith('!!')) {
          return <mark key={i} className="bg-red-100/80 text-red-700 font-semibold px-0.5 rounded-sm">{part.slice(2, -2)}</mark>
        }
        if (part.startsWith('[[') && part.endsWith(']]')) {
          const inner = part.slice(2, -2)
          const sep = inner.indexOf('|')
          if (sep !== -1) {
            const name = inner.slice(0, sep)
            const id = inner.slice(sep + 1)
            return (
              <a key={i} href={`#entities/${id}`} className="text-blue-600 font-semibold hover:underline hover:text-blue-800 transition-colors">
                {name}
              </a>
            )
          }
          return <span key={i} className="text-primary font-semibold">{inner}</span>
        }
        return <span key={i}>{part}</span>
      })}
    </>
  )
}

/** Renders full text with lists, bullets, and inline markup */
function HighlightedText({ text }: { text: string }) {
  const lines = text.split('\n')
  const elements: React.ReactNode[] = []
  let i = 0

  while (i < lines.length) {
    const line = lines[i]
    const numberedMatch = line.match(/^(\d+)\.\s+(.+)/)
    const bulletMatch = line.match(/^[-•]\s+(.+)/)

    if (numberedMatch) {
      // Collect numbered list block
      const items: { num: string; content: string; subs: string[] }[] = []
      while (i < lines.length) {
        const nm = lines[i].match(/^(\d+)\.\s+(.+)/)
        if (nm) {
          items.push({ num: nm[1], content: nm[2], subs: [] })
          i++
          // Collect sub-bullets under this numbered item
          while (i < lines.length) {
            const sm = lines[i].match(/^\s+[-•]\s+(.+)/)
            if (sm) {
              items[items.length - 1].subs.push(sm[1])
              i++
            } else break
          }
        } else break
      }
      elements.push(
        <ol key={`ol-${i}`} className="my-1.5 space-y-1.5">
          {items.map((item, j) => (
            <li key={j} className="flex gap-2">
              <span className="text-slate-500 font-semibold shrink-0">{item.num}.</span>
              <div className="min-w-0">
                <InlineMarkup text={item.content} />
                {item.subs.length > 0 && (
                  <ul className="mt-1 space-y-0.5 ml-1">
                    {item.subs.map((sub, k) => (
                      <li key={k} className="flex gap-1.5">
                        <span className="text-slate-400 shrink-0">·</span>
                        <span><InlineMarkup text={sub} /></span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </li>
          ))}
        </ol>
      )
    } else if (bulletMatch) {
      // Collect top-level bullet list
      const bullets: string[] = []
      while (i < lines.length) {
        const bm = lines[i].match(/^[-•]\s+(.+)/)
        if (bm) {
          bullets.push(bm[1])
          i++
        } else break
      }
      elements.push(
        <ul key={`ul-${i}`} className="my-1.5 space-y-0.5 ml-1">
          {bullets.map((b, j) => (
            <li key={j} className="flex gap-1.5">
              <span className="text-slate-400 shrink-0">·</span>
              <span><InlineMarkup text={b} /></span>
            </li>
          ))}
        </ul>
      )
    } else {
      // Plain text line
      if (line.trim()) {
        elements.push(<span key={`p-${i}`}><InlineMarkup text={line} /></span>)
      }
      if (!line.trim() && i > 0 && i < lines.length - 1) {
        elements.push(<span key={`br-${i}`} className="block h-1" />)
      }
      i++
    }
  }

  return <>{elements}</>
}

/** Hook: chat state + streaming logic */
export function useEntityChat(entityId: string, period: string) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [streaming, setStreaming] = useState(false)
  const sessionIdRef = useRef(crypto.randomUUID())

  // Reset on entity change
  useEffect(() => {
    setMessages([])
    setInput('')
    sessionIdRef.current = crypto.randomUUID()
  }, [entityId])

  const sendMessage = useCallback(async () => {
    const question = input.trim()
    if (!question || streaming) return

    setInput('')
    setStreaming(true)
    setMessages(prev => [...prev, { role: 'user', content: question }, { role: 'assistant', content: '' }])

    try {
      const resp = await fetch(`/api/entities/${entityId}/chat?period=${period}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question, session_id: sessionIdRef.current }),
      })

      if (!resp.ok || !resp.body) {
        setMessages(prev => {
          const u = [...prev]
          u[u.length - 1] = { role: 'assistant', content: 'Failed to get response.' }
          return u
        })
        return
      }

      const reader = resp.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() || ''
        for (const line of lines) {
          if (!line.startsWith('data: ')) continue
          const data = line.slice(6)
          if (data === '[DONE]') continue
          try {
            const parsed = JSON.parse(data)
            if (parsed.content) {
              setMessages(prev => {
                const u = [...prev]
                u[u.length - 1] = { ...u[u.length - 1], content: u[u.length - 1].content + parsed.content }
                return u
              })
            }
          } catch { /* skip */ }
        }
      }
    } catch {
      setMessages(prev => {
        const u = [...prev]
        if (u.length > 0 && u[u.length - 1].role === 'assistant' && !u[u.length - 1].content) {
          u[u.length - 1] = { role: 'assistant', content: 'Connection error.' }
        }
        return u
      })
    } finally {
      setStreaming(false)
    }
  }, [input, streaming, entityId, period])

  return { messages, input, setInput, streaming, sendMessage }
}

/** Chat messages — render inside summary scroll area */
export function AIChatMessages({ messages, scrollContainerRef }: {
  messages: ChatMessage[]
  scrollContainerRef?: RefObject<HTMLDivElement | null>
}) {
  useEffect(() => {
    if (scrollContainerRef?.current) {
      scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight
    }
  }, [messages, scrollContainerRef])

  if (messages.length === 0) return null

  return (
    <div className="mt-4 pt-4 border-t border-white/20 space-y-3">
      {messages.map((msg, i) => (
        <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
          <div className={`${msg.role === 'user' ? 'max-w-[80%] text-right' : 'max-w-full'}`}>
            {msg.role === 'assistant' && (
              <span className="text-[11px] font-semibold tracking-wider text-purple-500/70">
                Ontix
              </span>
            )}
            <div className={`text-sm leading-relaxed mt-0.5 ${
              msg.role === 'user'
                ? 'text-slate-800 font-medium'
                : 'text-slate-700'
            }`}>
              {msg.role === 'assistant' ? (
                msg.content ? (
                  <HighlightedText text={msg.content} />
                ) : (
                  <span className="inline-flex items-center gap-1.5 text-slate-400 text-xs">
                    <span className="material-symbols-outlined animate-spin text-[13px]">progress_activity</span>
                    Thinking...
                  </span>
                )
              ) : (
                msg.content
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

/** Chat input — render pinned at bottom */
export function AIChatInput({ input, setInput, streaming, sendMessage, hasMessages }: {
  input: string
  setInput: (v: string) => void
  streaming: boolean
  sendMessage: () => void
  hasMessages: boolean
}) {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <div className={`relative flex items-center rounded-xl ${streaming ? 'ai-rainbow-border-soft' : 'border-2 border-white/40'}`}>
      <input
        type="text"
        value={input}
        onChange={e => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={hasMessages ? 'Ask another question...' : 'Ask about this analysis...'}
        disabled={streaming}
        className="peer w-full bg-white/60 backdrop-blur-sm rounded-[10px] pl-11 pr-10 py-4 text-sm text-slate-700 placeholder:text-slate-400/50 focus:outline-none focus:bg-white/80 disabled:opacity-50 transition-all focus:ring-1 focus:ring-purple-300/40"
      />
      <span className="absolute left-3 material-symbols-outlined text-[16px] text-purple-400/70 peer-focus:text-purple-500 pointer-events-none z-10 transition-colors">
        auto_awesome
      </span>
      <button
        onClick={sendMessage}
        disabled={!input.trim() || streaming}
        className="absolute right-1.5 size-7 rounded-lg bg-purple-500/80 hover:bg-purple-500 disabled:bg-transparent disabled:shadow-none text-white disabled:text-slate-300/50 flex items-center justify-center transition-all z-10"
      >
        <span className="material-symbols-outlined text-[15px]">
          {streaming ? 'more_horiz' : 'arrow_upward'}
        </span>
      </button>
    </div>
  )
}
