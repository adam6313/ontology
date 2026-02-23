import { useState, useEffect, useRef } from 'react'
import { Pulse } from './pages/Pulse'
import { EntityProfile } from './pages/EntityProfile'
import { Inbox } from './pages/Inbox'
import { SemanticSearch } from './pages/SemanticSearch'
import { KnowledgeGraph } from './pages/KnowledgeGraph'
import { ComparePage } from './pages/ComparePage'
import { ScenarioMap } from './pages/ScenarioMap'

interface RouteState {
  page: string
  id?: string
  query?: Record<string, string>
}

function getHashParams(): RouteState {
  const hash = window.location.hash.slice(1)
  const [pathPart, queryPart] = hash.split('?')
  const segments = pathPart.split('/')
  const query: Record<string, string> = {}
  if (queryPart) {
    for (const pair of queryPart.split('&')) {
      const [k, v] = pair.split('=')
      if (k) query[decodeURIComponent(k)] = decodeURIComponent(v ?? '')
    }
  }
  return {
    page: segments[0] || '',
    id: segments[1],
    query,
  }
}

function App() {
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [displayRoute, setDisplayRoute] = useState(() => getHashParams())
  const timeoutRef = useRef<number | undefined>(undefined)

  useEffect(() => {
    const handleHashChange = () => {
      const newRoute = getHashParams()
      setIsTransitioning(true)
      timeoutRef.current = window.setTimeout(() => {
        setDisplayRoute(newRoute)
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            setIsTransitioning(false)
          })
        })
      }, 150)
    }

    window.addEventListener('hashchange', handleHashChange)
    return () => {
      window.removeEventListener('hashchange', handleHashChange)
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [])

  const renderPage = () => {
    if (displayRoute.page === 'entities' && displayRoute.id) {
      return <EntityProfile entityId={displayRoute.id} />
    }
    if (displayRoute.page === 'inbox') {
      return <Inbox />
    }
    if (displayRoute.page === 'search') {
      return <SemanticSearch />
    }
    if (displayRoute.page === 'graph') {
      return <KnowledgeGraph />
    }
    if (displayRoute.page === 'compare') {
      return <ComparePage entityIdA={displayRoute.query?.a} entityIdB={displayRoute.query?.b} />
    }
    if (displayRoute.page === 'scenarios') {
      return <ScenarioMap />
    }
    return <Pulse />
  }

  return (
    <div
      className={`transition-all duration-300 ease-out ${
        isTransitioning
          ? 'opacity-0 scale-[0.98] translate-y-2'
          : 'opacity-100 scale-100 translate-y-0'
      }`}
    >
      {renderPage()}
    </div>
  )
}

export default App
