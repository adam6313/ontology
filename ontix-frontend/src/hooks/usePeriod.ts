import { useState, useCallback, useMemo } from 'react'

export type PeriodKey = '' | '1w' | '4w' | '12w'

const PERIOD_LABELS: Record<PeriodKey, string> = {
  '': 'All Time',
  '1w': '1 Week',
  '4w': '4 Weeks',
  '12w': '12 Weeks',
}

function readPeriodFromHash(): PeriodKey {
  const match = window.location.hash.match(/[?&]period=([^&]*)/)
  const val = match ? match[1] : ''
  return val === '1w' || val === '4w' || val === '12w' ? val : ''
}

function writePeriodToHash(period: PeriodKey) {
  const hash = window.location.hash
  const base = hash.replace(/[?&]period=[^&]*/g, '')
  if (period) {
    const sep = base.includes('?') ? '&' : '?'
    window.location.hash = base + sep + 'period=' + period
  } else {
    window.location.hash = base
  }
}

export function usePeriod() {
  const [period, setPeriodState] = useState<PeriodKey>(readPeriodFromHash)

  const setPeriod = useCallback((p: PeriodKey) => {
    setPeriodState(p)
    writePeriodToHash(p)
  }, [])

  const periodLabel = useMemo(() => PERIOD_LABELS[period], [period])

  return { period, setPeriod, periodLabel }
}
