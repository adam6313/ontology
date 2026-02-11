interface SparklineProps {
  data: number[]
  width?: number
  height?: number
  color?: string
  showArea?: boolean
}

function monotonePath(points: [number, number][]): string {
  if (points.length < 2) return ''
  const n = points.length
  // Compute tangents (Fritsch-Carlson)
  const m: number[] = new Array(n)
  for (let i = 0; i < n - 1; i++) {
    m[i] = (points[i + 1][1] - points[i][1]) / (points[i + 1][0] - points[i][0])
  }
  m[n - 1] = m[n - 2]
  const tangents: number[] = new Array(n)
  tangents[0] = m[0]
  tangents[n - 1] = m[n - 2]
  for (let i = 1; i < n - 1; i++) {
    if (m[i - 1] * m[i] <= 0) tangents[i] = 0
    else tangents[i] = (m[i - 1] + m[i]) / 2
  }

  let d = `M${points[0][0]},${points[0][1]}`
  for (let i = 0; i < n - 1; i++) {
    const dx = (points[i + 1][0] - points[i][0]) / 3
    d += `C${points[i][0] + dx},${points[i][1] + tangents[i] * dx} ${points[i + 1][0] - dx},${points[i + 1][1] - tangents[i + 1] * dx} ${points[i + 1][0]},${points[i + 1][1]}`
  }
  return d
}

export function Sparkline({ data, width = 120, height = 32, color = '#00a38d', showArea = true }: SparklineProps) {
  if (data.length < 2) return null

  const pad = 1
  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min || 1

  const points: [number, number][] = data.map((v, i) => [
    pad + (i / (data.length - 1)) * (width - pad * 2),
    pad + (1 - (v - min) / range) * (height - pad * 2),
  ])

  const linePath = monotonePath(points)
  const areaPath = `${linePath}L${points[points.length - 1][0]},${height}L${points[0][0]},${height}Z`

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      <defs>
        <linearGradient id={`sg-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.15} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </linearGradient>
      </defs>
      {showArea && <path d={areaPath} fill={`url(#sg-${color.replace('#', '')})`} />}
      <path d={linePath} fill="none" stroke={color} strokeWidth={1.5} />
    </svg>
  )
}
