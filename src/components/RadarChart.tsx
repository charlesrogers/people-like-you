'use client'

import { useEffect, useRef } from 'react'

const DIMENSIONS = [
  { id: 'explorer', emoji: '\u{1F9ED}', label: 'Explorer' },
  { id: 'connector', emoji: '\u{1F49C}', label: 'Connector' },
  { id: 'builder', emoji: '\u2B50', label: 'Builder' },
  { id: 'nurturer', emoji: '\u{1F3E0}', label: 'Nurturer' },
  { id: 'wildcard', emoji: '\u26A1', label: 'Wildcard' },
] as const

export type DimensionScores = Record<string, number> // dimension id -> 0-100

interface RadarChartProps {
  you: DimensionScores
  them: DimensionScores
  size?: number
  themLabel?: string
}

export default function RadarChart({ you, them, size = 220, themLabel = 'Them' }: RadarChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')!

    const dpr = window.devicePixelRatio || 1
    canvas.width = size * dpr
    canvas.height = size * dpr
    canvas.style.width = size + 'px'
    canvas.style.height = size + 'px'
    ctx.scale(dpr, dpr)

    const cx = size / 2
    const cy = size / 2
    const radius = size * 0.36
    const axes = DIMENSIONS.length
    const angleStep = (Math.PI * 2) / axes
    const startAngle = -Math.PI / 2

    // Clear
    ctx.clearRect(0, 0, size, size)

    // Grid rings
    ctx.strokeStyle = 'rgba(120,113,108,0.08)'
    ctx.lineWidth = 1
    for (let ring = 1; ring <= 4; ring++) {
      ctx.beginPath()
      for (let i = 0; i <= axes; i++) {
        const angle = startAngle + i * angleStep
        const r = (ring / 4) * radius
        const x = cx + Math.cos(angle) * r
        const y = cy + Math.sin(angle) * r
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)
      }
      ctx.closePath()
      ctx.stroke()
    }

    // Axis lines
    ctx.strokeStyle = 'rgba(120,113,108,0.12)'
    for (let i = 0; i < axes; i++) {
      const angle = startAngle + i * angleStep
      ctx.beginPath()
      ctx.moveTo(cx, cy)
      ctx.lineTo(cx + Math.cos(angle) * radius, cy + Math.sin(angle) * radius)
      ctx.stroke()
    }

    // Draw polygon helper
    function drawPoly(dims: DimensionScores, fillColor: string, strokeColor: string) {
      ctx.beginPath()
      DIMENSIONS.forEach((dim, i) => {
        const val = (dims[dim.id] || 0) / 100
        const angle = startAngle + i * angleStep
        const x = cx + Math.cos(angle) * radius * val
        const y = cy + Math.sin(angle) * radius * val
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)
      })
      ctx.closePath()
      ctx.fillStyle = fillColor
      ctx.fill()
      ctx.strokeStyle = strokeColor
      ctx.lineWidth = 2
      ctx.stroke()
    }

    // You (gray, behind)
    drawPoly(you, 'rgba(168,162,158,0.15)', 'rgba(120,113,108,0.5)')
    // Them (purple, on top)
    drawPoly(them, 'rgba(99,60,200,0.18)', 'rgba(99,60,200,0.8)')

    // Axis labels
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.font = '600 11px Inter, system-ui, sans-serif'
    ctx.fillStyle = '#57534e'
    const labelPad = 20
    DIMENSIONS.forEach((dim, i) => {
      const angle = startAngle + i * angleStep
      const lx = cx + Math.cos(angle) * (radius + labelPad)
      const ly = cy + Math.sin(angle) * (radius + labelPad)
      ctx.fillText(dim.emoji + ' ' + dim.label, lx, ly)
    })
  }, [you, them, size])

  return (
    <div className="flex flex-col items-center gap-2">
      <canvas ref={canvasRef} />
      <div className="flex gap-3">
        <span className="inline-flex items-center gap-1.5 text-[10px] font-medium text-stone-400">
          <span className="inline-block w-2.5 h-2.5 rounded-full bg-stone-300/60 border border-stone-300" /> You
        </span>
        <span className="inline-flex items-center gap-1.5 text-[10px] font-medium text-stone-400">
          <span className="inline-block w-2.5 h-2.5 rounded-full bg-purple-400/30 border border-purple-400/60" /> {themLabel}
        </span>
      </div>
    </div>
  )
}

export function getDimensionInsight(you: DimensionScores, them: DimensionScores): string | null {
  let best: { dim: typeof DIMENSIONS[number]; delta: number } | null = null
  let bestDelta = 0

  DIMENSIONS.forEach(dim => {
    const delta = (them[dim.id] || 0) - (you[dim.id] || 0)
    if (Math.abs(delta) > bestDelta) {
      bestDelta = Math.abs(delta)
      best = { dim, delta }
    }
  })

  if (!best) return null
  const { dim, delta } = best as { dim: typeof DIMENSIONS[number]; delta: number }
  if (delta > 15) return `Their ${dim.emoji} ${dim.label} energy could expand your world`
  if (delta < -15) return `You bring ${dim.emoji} ${dim.label} energy they're drawn to`
  return null
}
