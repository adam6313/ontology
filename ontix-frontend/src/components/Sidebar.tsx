import { useState, useEffect, useRef, useCallback } from 'react'
import { useWatchlist } from '../hooks/useWatchlist'
import type { ApiResponse } from '../types'

interface NavItem {
  icon: string
  label: string
  hash: string
}

const navItems: NavItem[] = [
  { icon: 'monitoring', label: 'Overview', hash: '' },
  { icon: 'search', label: 'Search', hash: 'search' },
  { icon: 'hub', label: 'Graph', hash: 'graph' },
  { icon: 'compare_arrows', label: 'Compare', hash: 'compare' },
  { icon: 'inbox', label: 'Inbox', hash: 'inbox' },
]

export function Sidebar() {
  const watchlist = useWatchlist()
  const [collapsed, setCollapsed] = useState(() => {
    return localStorage.getItem('sidebar-collapsed') === 'true'
  })
  const [currentPage, setCurrentPage] = useState(() => {
    const hash = window.location.hash.slice(1).split('?')[0]
    return hash.split('/')[0] || ''
  })

  useEffect(() => {
    localStorage.setItem('sidebar-collapsed', String(collapsed))
  }, [collapsed])

  // Unread inbox count
  const [unreadCount, setUnreadCount] = useState(0)
  const intervalRef = useRef<number | undefined>(undefined)

  const fetchUnread = useCallback(() => {
    fetch('/api/inbox/count')
      .then(r => r.json())
      .then((res: ApiResponse<{ unread: number }>) => {
        setUnreadCount(res.data?.unread ?? 0)
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    fetchUnread()
    intervalRef.current = window.setInterval(fetchUnread, 30000)
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [fetchUnread])

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.slice(1).split('?')[0]
      setCurrentPage(hash.split('/')[0] || '')
    }
    window.addEventListener('hashchange', handleHashChange)
    return () => window.removeEventListener('hashchange', handleHashChange)
  }, [])

  return (
    <aside
      className={`bg-surface-light border-r border-gray-100 flex flex-col justify-between shrink-0 transition-all duration-300 ease-in-out ${
        collapsed ? 'w-[72px]' : 'w-64'
      }`}
    >
      <div className="flex flex-col p-3 gap-6">
        {/* Brand */}
        <div className={`flex items-center gap-3 ${collapsed ? 'justify-center px-0' : 'px-2'}`}>
          <svg
            width="40"
            height="40"
            viewBox="0 0 200 200"
            xmlns="http://www.w3.org/2000/svg"
            className="shrink-0 rounded-[8px]"
            style={{ boxShadow: '0 10px 20px rgba(42, 157, 143, 0.35)' }}
          >
            <rect x="0" y="0" width="200" height="200" rx="40" ry="40" fill="#2A9D8F"/>
            <circle cx="125" cy="75" r="40" fill="white"/>
            <circle cx="55" cy="115" r="28" fill="white"/>
            <circle cx="108" cy="135" r="18" fill="white"/>
          </svg>
          {!collapsed && (
            <div className="flex flex-col overflow-hidden">
              <h1 className="text-lg font-bold leading-none tracking-tight">Ontix</h1>
              <span className="text-xs text-secondary font-medium">Analytics AI</span>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex flex-col gap-1">
          {navItems.map((item) => {
            const isActive = currentPage === item.hash
            const showBadge = item.hash === 'inbox' && unreadCount > 0
            return (
              <a
                key={item.label}
                href={`#${item.hash}`}
                title={collapsed ? item.label : undefined}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium transition-colors ${
                  collapsed ? 'justify-center' : ''
                } ${
                  isActive
                    ? 'bg-primary/15 text-primary'
                    : 'text-slate-600 hover:bg-[#f0f5f4]'
                }`}
              >
                <span className="relative shrink-0">
                  <span
                    className="material-symbols-outlined"
                    style={isActive ? { fontVariationSettings: "'FILL' 1" } : undefined}
                  >
                    {item.icon}
                  </span>
                  {showBadge && collapsed && (
                    <span className="absolute -top-1 -right-1 size-2.5 bg-rose-500 rounded-full" />
                  )}
                </span>
                {!collapsed && (
                  <>
                    <span className="truncate">{item.label}</span>
                    {showBadge && (
                      <span className="ml-auto bg-rose-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center leading-none">
                        {unreadCount > 99 ? '99+' : unreadCount}
                      </span>
                    )}
                  </>
                )}
              </a>
            )
          })}
        </nav>

        {/* Watchlist shortcut */}
        {watchlist.count > 0 && (
          <div className="px-3 mt-2 pt-2 border-t border-gray-100">
            <a
              href="#"
              onClick={e => {
                e.preventDefault()
                window.location.hash = ''
                window.dispatchEvent(new CustomEvent('watchlist-activate'))
              }}
              title={collapsed ? `Watchlist (${watchlist.count})` : undefined}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-amber-700 hover:bg-amber-50 transition-colors ${
                collapsed ? 'justify-center' : ''
              }`}
            >
              <span className="relative shrink-0">
                <span className="material-symbols-outlined text-amber-500" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                {collapsed && (
                  <span className="absolute -top-1.5 -right-2 bg-amber-500 text-white text-[9px] font-bold px-1 py-0.5 rounded-full min-w-[16px] text-center leading-none">
                    {watchlist.count}
                  </span>
                )}
              </span>
              {!collapsed && (
                <>
                  <span className="truncate">Watchlist</span>
                  <span className="ml-auto bg-amber-100 text-amber-700 text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center leading-none">
                    {watchlist.count}
                  </span>
                </>
              )}
            </a>
          </div>
        )}
      </div>

      <div className="flex flex-col">
        {/* Collapse Toggle */}
        <div className={`px-3 pb-2 ${collapsed ? 'flex justify-center' : ''}`}>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="flex items-center justify-center size-9 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-[#f0f5f4] transition-colors"
            title={collapsed ? 'Expand' : 'Collapse'}
          >
            <span
              className="material-symbols-outlined transition-transform duration-300"
              style={{ transform: collapsed ? 'rotate(180deg)' : 'rotate(0deg)' }}
            >
              chevron_left
            </span>
          </button>
        </div>

        {/* User Profile */}
        <div className="p-3 border-t border-gray-100">
          <div
            className={`flex items-center gap-3 p-2 rounded-xl hover:bg-[#f0f5f4] cursor-pointer transition-colors ${
              collapsed ? 'justify-center' : ''
            }`}
            title={collapsed ? 'Admin User' : undefined}
          >
            <div className="size-9 rounded-full bg-gradient-to-br from-primary to-secondary shrink-0"></div>
            {!collapsed && (
              <div className="flex flex-col overflow-hidden">
                <p className="text-sm font-semibold truncate">Admin User</p>
                <p className="text-xs text-secondary truncate">Product Lead</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </aside>
  )
}
