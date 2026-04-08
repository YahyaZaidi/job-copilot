'use client'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { StatusBadge } from '@/components/status-badge'
import { FileText, ExternalLink, Trash2, Sparkles } from 'lucide-react'
import { differenceInCalendarDays } from 'date-fns'
import { AddApplicationDialog } from '@/components/add-application-dialog'
import type { ApplicationStatus, JobApplication } from '@/lib/types'

interface ApplicationsTableProps {
  applications: JobApplication[]
  onUpdateStatus: (id: string, status: ApplicationStatus) => void
  onDelete: (id: string) => void
  onOpenPanel?: (application: JobApplication) => void
  onAdd: (application: Omit<JobApplication, 'id'>) => void
}

function isStale(app: JobApplication): boolean {
  if (app.status !== 'applied') return false
  return differenceInCalendarDays(new Date(), new Date(app.dateApplied)) >= 14
}

export function ApplicationsTable({ applications, onUpdateStatus, onDelete, onOpenPanel, onAdd }: ApplicationsTableProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  if (applications.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border p-16 text-center">
        <div className="mx-auto mb-4 size-12 rounded-xl bg-primary/10 flex items-center justify-center">
          <FileText className="size-6 text-primary" />
        </div>
        <h3 className="font-semibold text-lg mb-1">Start your job hunt</h3>
        <p className="text-sm text-muted-foreground mb-6 max-w-xs mx-auto">
          Add your first application to get started. Every great career move begins with one application.
        </p>
        <AddApplicationDialog onAdd={onAdd} />
      </div>
    )
  }

  return (
    <>
      <div className="rounded-lg border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>Company</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Date Applied</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Notes</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {applications.map((application) => (
              <TableRow key={application.id}>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2 flex-wrap">
                    {application.company}
                    {application.jobUrl && (
                      <a
                        href={application.jobUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-muted-foreground hover:text-foreground"
                      >
                        <ExternalLink className="size-3.5" />
                      </a>
                    )}
                    {isStale(application) && (
                      <span className="inline-flex items-center rounded-md border border-destructive/30 bg-destructive/10 px-1.5 py-0.5 text-xs font-medium text-destructive">
                        Chase up
                      </span>
                    )}
                  </div>
                </TableCell>
                <TableCell>{application.role}</TableCell>
                <TableCell className="text-muted-foreground">
                  {formatDate(application.dateApplied)}
                </TableCell>
                <TableCell>
                  <Select
                    value={application.status}
                    onValueChange={(value) => onUpdateStatus(application.id, value as ApplicationStatus)}
                  >
                    <SelectTrigger className="w-[130px] h-8 border-0 bg-transparent p-0 hover:bg-transparent focus:ring-0">
                      <SelectValue>
                        <StatusBadge status={application.status} />
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="applied">Applied</SelectItem>
                      <SelectItem value="interview">Interview</SelectItem>
                      <SelectItem value="offer">Offer</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                      <SelectItem value="ghosted">Ghosted</SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell className="max-w-[200px] truncate text-muted-foreground">
                  {application.notes || '—'}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    {onOpenPanel && (
                      <Button
                        size="icon-sm"
                        variant="ghost"
                        onClick={() => onOpenPanel(application)}
                        className="text-muted-foreground hover:text-foreground"
                        title="Generate cover letter / CV tips"
                      >
                        <Sparkles className="size-4" />
                      </Button>
                    )}
                    <Button
                      size="icon-sm"
                      variant="ghost"
                      onClick={() => onDelete(application.id)}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  )
}
