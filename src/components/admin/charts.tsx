"use client"

import { useMemo } from 'react'

interface ChartData {
  label: string
  value: number
  color: string
}

interface BarChartProps {
  data: ChartData[]
  title: string
  height?: number
}

export function BarChart({ data, title, height = 200 }: BarChartProps) {
  const maxValue = useMemo(() => Math.max(...data.map(d => d.value)), [data])

  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-4">
      <h3 className="text-lg font-semibold text-white mb-4">{title}</h3>
      <div className="space-y-3" style={{ height: `${height}px` }}>
        {data.map((item, index) => (
          <div key={index} className="flex items-center gap-3">
            <div className="w-24 text-sm text-neutral-400 truncate">
              {item.label}
            </div>
            <div className="flex-1 bg-neutral-800 rounded-full h-6 relative overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500 ease-out"
                style={{
                  width: `${maxValue > 0 ? (item.value / maxValue) * 100 : 0}%`,
                  backgroundColor: item.color
                }}
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xs font-medium text-white">
                  {item.value}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

interface PieChartProps {
  data: ChartData[]
  title: string
  size?: number
}

export function PieChart({ data, title, size = 200 }: PieChartProps) {
  const total = useMemo(() => data.reduce((sum, item) => sum + item.value, 0), [data])

  const segments = useMemo(() => {
    let currentAngle = 0
    return data.map((item, index) => {
      const percentage = total > 0 ? (item.value / total) * 100 : 0
      const angle = (percentage / 100) * 360
      const startAngle = currentAngle
      currentAngle += angle

      return {
        ...item,
        percentage,
        startAngle,
        endAngle: currentAngle
      }
    })
  }, [data, total])

  const createPath = (startAngle: number, endAngle: number) => {
    const radius = size / 2 - 20
    const centerX = size / 2
    const centerY = size / 2

    const startAngleRad = (startAngle * Math.PI) / 180
    const endAngleRad = (endAngle * Math.PI) / 180

    const x1 = centerX + radius * Math.cos(startAngleRad)
    const y1 = centerY + radius * Math.sin(startAngleRad)
    const x2 = centerX + radius * Math.cos(endAngleRad)
    const y2 = centerY + radius * Math.sin(endAngleRad)

    const largeArcFlag = endAngle - startAngle > 180 ? 1 : 0

    return `M ${centerX} ${centerY} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`
  }

  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-4">
      <h3 className="text-lg font-semibold text-white mb-4">{title}</h3>
      <div className="flex flex-col md:flex-row items-center gap-4">
        <div className="relative" style={{ width: size, height: size }}>
          <svg width={size} height={size} className="transform -rotate-90">
            {segments.map((segment, index) => (
              <path
                key={index}
                d={createPath(segment.startAngle, segment.endAngle)}
                fill={segment.color}
                stroke="rgb(38, 38, 38)"
                strokeWidth="2"
              />
            ))}
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-2xl font-bold text-white">{total}</div>
              <div className="text-xs text-neutral-400">Total</div>
            </div>
          </div>
        </div>

        <div className="flex-1 space-y-2">
          {segments.map((segment, index) => (
            <div key={index} className="flex items-center gap-3">
              <div
                className="w-4 h-4 rounded"
                style={{ backgroundColor: segment.color }}
              />
              <div className="flex-1">
                <div className="text-sm text-white">{segment.label}</div>
                <div className="text-xs text-neutral-400">
                  {segment.value} ({segment.percentage.toFixed(1)}%)
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

interface LineChartProps {
  data: Array<{ label: string; value: number }>
  title: string
  height?: number
  color?: string
}

export function LineChart({ data, title, height = 200, color = '#ff6b35' }: LineChartProps) {
  const maxValue = useMemo(() => Math.max(...data.map(d => d.value)), [data])
  const minValue = useMemo(() => Math.min(...data.map(d => d.value)), [data])

  const points = useMemo(() => {
    return data.map((point, index) => {
      const x = (index / (data.length - 1)) * 100
      const y = maxValue > minValue
        ? 100 - ((point.value - minValue) / (maxValue - minValue)) * 100
        : 50
      return `${x},${y}`
    }).join(' ')
  }, [data, maxValue, minValue])

  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-4">
      <h3 className="text-lg font-semibold text-white mb-4">{title}</h3>
      <div className="relative" style={{ height: `${height}px` }}>
        <svg
          width="100%"
          height="100%"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          className="overflow-visible"
        >
          {/* Grid lines */}
          <defs>
            <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
              <path d="M 10 0 L 0 0 0 10" fill="none" stroke="rgb(64, 64, 64)" strokeWidth="0.5"/>
            </pattern>
          </defs>
          <rect width="100" height="100" fill="url(#grid)" />

          {/* Line */}
          <polyline
            fill="none"
            stroke={color}
            strokeWidth="2"
            points={points}
          />

          {/* Points */}
          {data.map((point, index) => {
            const x = (index / (data.length - 1)) * 100
            const y = maxValue > minValue
              ? 100 - ((point.value - minValue) / (maxValue - minValue)) * 100
              : 50
            return (
              <circle
                key={index}
                cx={x}
                cy={y}
                r="2"
                fill={color}
                stroke="white"
                strokeWidth="1"
              />
            )
          })}
        </svg>

        {/* Y-axis labels */}
        <div className="absolute left-0 top-0 bottom-0 flex flex-col justify-between text-xs text-neutral-500 -ml-8">
          <span>{maxValue}</span>
          <span>{minValue}</span>
        </div>

        {/* X-axis labels */}
        <div className="absolute bottom-0 left-0 right-0 flex justify-between text-xs text-neutral-500 -mb-6">
          {data.map((point, index) => (
            <span key={index} className="truncate max-w-16">
              {point.label}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}