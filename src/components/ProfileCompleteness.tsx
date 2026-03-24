'use client'

interface Props {
  richness: number // 0-100
  memoCount: number
}

export default function ProfileCompleteness({ richness, memoCount }: Props) {
  const segments = 10
  const filled = Math.round((richness / 100) * segments)

  const getMessage = () => {
    if (richness >= 90) return "Your profile is strong — intros will be specific and compelling."
    if (richness >= 70) return "Good foundation. Record 1-2 more answers to level up."
    if (richness >= 50) return `Record ${Math.max(1, 4 - memoCount)} more answers to improve your intros.`
    return "Your profile needs more depth. Answer a few more questions to get better matches."
  }

  return (
    <div className="rounded-xl bg-white border border-stone-200 p-5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-stone-500">Profile completeness</span>
        <span className="text-sm font-bold text-stone-900">{richness}%</span>
      </div>
      <div className="mt-2 flex gap-1">
        {Array.from({ length: segments }).map((_, i) => (
          <div
            key={i}
            className={`h-2 flex-1 rounded-full transition-all ${
              i < filled ? 'bg-stone-900' : 'bg-stone-100'
            }`}
          />
        ))}
      </div>
      <p className="mt-2 text-xs text-stone-400">{getMessage()}</p>
    </div>
  )
}
