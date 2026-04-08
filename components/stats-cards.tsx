'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Briefcase, Calendar, TrendingUp, Clock } from 'lucide-react'
import type { JobApplication } from '@/lib/types'

interface StatsCardsProps {
  applications: JobApplication[]
}

export function StatsCards({ applications }: StatsCardsProps) {
  const totalApplications = applications.length
  const interviews = applications.filter(app => app.status === 'interview' || app.status === 'offer').length
  const responses = applications.filter(app => app.status !== 'applied' && app.status !== 'ghosted').length
  const responseRate = totalApplications > 0 ? Math.round((responses / totalApplications) * 100) : 0
  const awaitingResponse = applications.filter(app => app.status === 'applied').length

  const stats = [
    {
      label: 'Total Applications',
      value: totalApplications,
      icon: Briefcase,
      description: 'Applications sent',
    },
    {
      label: 'Interviews',
      value: interviews,
      icon: Calendar,
      description: 'Interview stage or beyond',
    },
    {
      label: 'Awaiting Response',
      value: awaitingResponse,
      icon: Clock,
      description: 'Still in applied status',
    },
    {
      label: 'Response Rate',
      value: `${responseRate}%`,
      icon: TrendingUp,
      description: 'Received a response',
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.label} className="border-border/50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <p className="text-3xl font-semibold tracking-tight mt-1">{stat.value}</p>
                <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
              </div>
              <div className="p-3 rounded-lg bg-secondary">
                <stat.icon className="size-5 text-muted-foreground" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
