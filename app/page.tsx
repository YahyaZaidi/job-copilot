'use client'

import { useState } from 'react'
import { differenceInCalendarDays } from 'date-fns'
import { StatsCards } from '@/components/stats-cards'
import { ApplicationsTable } from '@/components/applications-table'
import { AddApplicationDialog } from '@/components/add-application-dialog'
import { CoverLetterPanel } from '@/components/cover-letter-panel'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Sparkles, AlertCircle } from 'lucide-react'
import type { ApplicationStatus, JobApplication } from '@/lib/types'

const GOAL = 20


function isStale(app: JobApplication): boolean {
  if (app.status !== 'applied') return false
  return differenceInCalendarDays(new Date(), new Date(app.dateApplied)) >= 14
}

export default function Home() {
  const [applications, setApplications] = useState<JobApplication[]>([])
  const [coverLetterOpen, setCoverLetterOpen] = useState(false)
  const [selectedApplication, setSelectedApplication] = useState<JobApplication | null>(null)

  const staleApplications = applications.filter(isStale)

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

  const handleSaveCvTips = (id: string, tips: string[]) => {
    setApplications((prev) =>
      prev.map((app) => (app.id === id ? { ...app, cvTips: tips } : app))
    )
  }

  const handleOpenPanel = (application: JobApplication) => {
    setSelectedApplication(application)
    setCoverLetterOpen(true)
  }

  const handlePanelOpenChange = (open: boolean) => {
    setCoverLetterOpen(open)
    if (!open) setSelectedApplication(null)
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 py-8 md:py-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              <span className="text-foreground">Job</span>
              <span className="text-primary">Track</span>
            </h1>
            <p className="text-sm text-muted-foreground">Track your job applications</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => { setSelectedApplication(null); setCoverLetterOpen(true) }}>
              <Sparkles className="size-4" />
              Generate Cover Letter
            </Button>
            <AddApplicationDialog onAdd={handleAddApplication} />
          </div>
        </div>

        {/* Needs Attention */}
        {staleApplications.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-3">
              <AlertCircle className="size-4 text-destructive" />
              <h2 className="text-sm font-medium text-destructive">Needs attention</h2>
              <span className="text-xs text-muted-foreground">
                {staleApplications.length} {staleApplications.length === 1 ? 'application' : 'applications'} awaiting follow-up
              </span>
            </div>
            <div className="space-y-2">
              {staleApplications.map((app) => {
                const days = differenceInCalendarDays(new Date(), new Date(app.dateApplied))
                return (
                  <div
                    key={app.id}
                    className="flex items-center justify-between rounded-lg border border-destructive/20 bg-destructive/5 px-4 py-3"
                  >
                    <div className="flex items-center gap-2 text-sm">
                      <span className="font-medium">{app.company}</span>
                      <span className="text-muted-foreground">·</span>
                      <span className="text-muted-foreground">{app.role}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-muted-foreground">Applied {days} days ago</span>
                      <span className="inline-flex items-center rounded-md border border-destructive/30 bg-destructive/10 px-1.5 py-0.5 text-xs font-medium text-destructive">
                        Chase up
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Stats Cards */}
        <div className="mb-4">
          <StatsCards applications={applications} />
        </div>

        {/* Goal Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-1.5">
            <p className="text-xs text-muted-foreground">{GOAL} applications goal</p>
            <p className="text-xs text-muted-foreground">
              {applications.length} / {GOAL}
            </p>
          </div>
          <Progress value={Math.min((applications.length / GOAL) * 100, 100)} className="h-1.5" />
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
            onOpenPanel={handleOpenPanel}
            onAdd={handleAddApplication}
          />
        </div>
      </div>

      <CoverLetterPanel
        open={coverLetterOpen}
        onOpenChange={handlePanelOpenChange}
        application={selectedApplication}
        onSaveCvTips={handleSaveCvTips}
      />
    </main>
  )
}
