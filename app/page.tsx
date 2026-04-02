'use client'

import { useState } from 'react'
import { StatsCards } from '@/components/stats-cards'
import { ApplicationsTable } from '@/components/applications-table'
import { AddApplicationDialog } from '@/components/add-application-dialog'
import { Briefcase } from 'lucide-react'
import type { ApplicationStatus, JobApplication } from '@/lib/types'

// Sample data for demonstration
const initialApplications: JobApplication[] = [
  {
    id: '1',
    company: 'Vercel',
    role: 'Senior Frontend Engineer',
    dateApplied: '2026-03-28',
    status: 'interview',
    notes: 'Second round scheduled for next week',
    jobUrl: 'https://vercel.com/careers',
  },
  {
    id: '2',
    company: 'Stripe',
    role: 'Full Stack Developer',
    dateApplied: '2026-03-25',
    status: 'applied',
    notes: 'Applied through referral',
    jobUrl: 'https://stripe.com/jobs',
  },
  {
    id: '3',
    company: 'Notion',
    role: 'Product Engineer',
    dateApplied: '2026-03-20',
    status: 'offer',
    notes: 'Received offer! Negotiating salary',
  },
  {
    id: '4',
    company: 'Linear',
    role: 'Software Engineer',
    dateApplied: '2026-03-15',
    status: 'rejected',
    notes: 'Position filled internally',
  },
  {
    id: '5',
    company: 'Figma',
    role: 'Frontend Developer',
    dateApplied: '2026-03-10',
    status: 'ghosted',
    notes: 'No response after 3 weeks',
  },
]

export default function Home() {
  const [applications, setApplications] = useState<JobApplication[]>(initialApplications)

  const handleAddApplication = (newApp: Omit<JobApplication, 'id'>) => {
    const application: JobApplication = {
      ...newApp,
      id: Date.now().toString(),
    }
    setApplications((prev) => [application, ...prev])
  }

  const handleUpdateStatus = (id: string, status: ApplicationStatus) => {
    setApplications((prev) =>
      prev.map((app) => (app.id === id ? { ...app, status } : app))
    )
  }

  const handleDelete = (id: string) => {
    setApplications((prev) => prev.filter((app) => app.id !== id))
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 py-8 md:py-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-secondary">
              <Briefcase className="size-6 text-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">JobTrack</h1>
              <p className="text-sm text-muted-foreground">Track your job applications</p>
            </div>
          </div>
          <AddApplicationDialog onAdd={handleAddApplication} />
        </div>

        {/* Stats Cards */}
        <div className="mb-8">
          <StatsCards applications={applications} />
        </div>

        {/* Applications Table */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium">Applications</h2>
            <p className="text-sm text-muted-foreground">
              {applications.length} {applications.length === 1 ? 'application' : 'applications'}
            </p>
          </div>
          <ApplicationsTable
            applications={applications}
            onUpdateStatus={handleUpdateStatus}
            onDelete={handleDelete}
          />
        </div>
      </div>
    </main>
  )
}
