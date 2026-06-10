import React from 'react'

interface SparklineProps {
  values: number[]
  color?: string
}

export function Sparkline({ values, color = '#B8601F' }: SparklineProps) {
  if (values.length === 0) {
    return null
  }

  const width = 100 // percentage, will use viewBox for scaling
  const height = 48
  const padding = 4
  const plotWidth = width - padding * 2
  const plotHeight = height - padding * 2

  // Find min and max for normalization
  const min = Math.min(...values)
  const max = Math.max(...values)
  const range = max - min || 1 // Avoid division by zero

  // Normalize values to fit in the plot area
  const points = values.map((val, index) => {
    const x = padding + (index / Math.max(values.length - 1, 1)) * plotWidth
    const normalizedVal = (val - min) / range
    const y = height - padding - normalizedVal * plotHeight
    return `${x},${y}`
  })

  const polylinePoints = points.join(' ')

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      width="100%"
      height={height}
      style={{ display: 'block', marginTop: '8px' }}
      preserveAspectRatio="none"
    >
      <polyline
        points={polylinePoints}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  )
}
