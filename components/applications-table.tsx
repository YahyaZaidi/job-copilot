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
import { FileText, ExternalLink, Trash2 } from 'lucide-react'
import type { ApplicationStatus, JobApplication } from '@/lib/types'

interface ApplicationsTableProps {
  applications: JobApplication[]
  onUpdateStatus: (id: string, status: ApplicationStatus) => void
  onDelete: (id: string) => void
}

export function ApplicationsTable({ applications, onUpdateStatus, onDelete }: ApplicationsTableProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  if (applications.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border p-12 text-center">
        <FileText className="size-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="font-medium mb-2">No applications yet</h3>
        <p className="text-sm text-muted-foreground">
          Add your first job application to start tracking your job search.
        </p>
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
                  <div className="flex items-center gap-2">
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
                  <Button
                    size="icon-sm"
                    variant="ghost"
                    onClick={() => onDelete(application.id)}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  )
}
