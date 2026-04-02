import { cn } from '@/lib/utils'
import type { ApplicationStatus } from '@/lib/types'

const statusConfig: Record<ApplicationStatus, { label: string; className: string }> = {
  applied: {
    label: 'Applied',
    className: 'bg-zinc-500/20 text-zinc-400 border-zinc-500/30',
  },
  interview: {
    label: 'Interview',
    className: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  },
  offer: {
    label: 'Offer',
    className: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  },
  rejected: {
    label: 'Rejected',
    className: 'bg-red-500/20 text-red-400 border-red-500/30',
  },
  ghosted: {
    label: 'Ghosted',
    className: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  },
}

interface StatusBadgeProps {
  status: ApplicationStatus
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusConfig[status]
  
  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border',
        config.className
      )}
    >
      {config.label}
    </span>
  )
}
