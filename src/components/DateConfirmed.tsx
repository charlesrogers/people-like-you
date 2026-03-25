'use client'

import type { PlannedDateInfo } from '@/lib/types'

interface Props {
  date: PlannedDateInfo
}

export default function DateConfirmed({ date }: Props) {
  const plannedDate = new Date(date.planned_at)
  const dateStr = plannedDate.toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  })
  const timeStr = plannedDate.toLocaleTimeString(undefined, {
    hour: 'numeric',
    minute: '2-digit',
  })

  return (
    <div className="rounded-xl border border-primary/20 bg-primary/5 shadow-sm p-8 text-center space-y-6">
      <div>
        <p className="text-[11px] uppercase tracking-wider text-primary font-medium">
          It&apos;s a date
        </p>
        <h2 className="text-[20px] font-bold mt-2">
          You&apos;re meeting {date.partner_name}
        </h2>
      </div>

      {/* Venue card */}
      <div className="rounded-xl border bg-card p-5 text-left space-y-2">
        <p className="text-[15px] font-semibold">{date.venue_name}</p>
        {date.venue_address && (
          <p className="text-[12px] text-muted-foreground">{date.venue_address}</p>
        )}
        <div className="flex items-center gap-4 pt-1">
          <div>
            <p className="text-[11px] text-muted-foreground">When</p>
            <p className="text-[13px] font-medium">{dateStr}</p>
            <p className="text-[12px] text-muted-foreground">{timeStr}</p>
          </div>
        </div>
      </div>

      {/* Phone number */}
      <div className="rounded-xl border bg-card p-5 space-y-2">
        <p className="text-[13px] font-medium">
          {date.partner_name}&apos;s number
        </p>
        <a
          href={`sms:${date.partner_phone}`}
          className="inline-block text-[15px] font-semibold text-primary"
        >
          {date.partner_phone}
        </a>
        <p className="text-[11px] text-muted-foreground">
          Text them to sort out the details
        </p>
      </div>

      <p className="text-[12px] text-muted-foreground">
        The rest is up to you two. Have fun!
      </p>
    </div>
  )
}
