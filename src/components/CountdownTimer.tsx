'use client'

import { useState, useEffect } from 'react'

interface CountdownTimerProps {
  targetTime: string
  label?: string
}

export default function CountdownTimer({ targetTime, label = 'Next intro arrives in' }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState('')

  useEffect(() => {
    function update() {
      const now = new Date().getTime()
      const target = new Date(targetTime).getTime()
      const diff = target - now

      if (diff <= 0) {
        setTimeLeft('any moment now')
        return
      }

      const hours = Math.floor(diff / (1000 * 60 * 60))
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

      if (hours > 0) {
        setTimeLeft(`${hours}h ${minutes}m`)
      } else {
        const seconds = Math.floor((diff % (1000 * 60)) / 1000)
        setTimeLeft(`${minutes}m ${seconds}s`)
      }
    }

    update()
    const interval = setInterval(update, 1000)
    return () => clearInterval(interval)
  }, [targetTime])

  return (
    <div className="text-center">
      <p className="text-xs text-stone-400">{label}</p>
      <p className="mt-1 text-2xl font-bold tabular-nums text-stone-900">{timeLeft}</p>
    </div>
  )
}
