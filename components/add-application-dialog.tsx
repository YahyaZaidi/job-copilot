'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Plus } from 'lucide-react'
import type { ApplicationStatus, JobApplication } from '@/lib/types'

interface AddApplicationDialogProps {
  onAdd: (application: Omit<JobApplication, 'id'>) => void
}

export function AddApplicationDialog({ onAdd }: AddApplicationDialogProps) {
  const [open, setOpen] = useState(false)
  const [jobUrl, setJobUrl] = useState('')
  const [company, setCompany] = useState('')
  const [role, setRole] = useState('')
  const [dateApplied, setDateApplied] = useState(new Date().toISOString().split('T')[0])
  const [status, setStatus] = useState<ApplicationStatus>('applied')
  const [notes, setNotes] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    onAdd({
      company,
      role,
      dateApplied,
      status,
      notes,
      jobUrl: jobUrl || undefined,
    })

    // Reset form
    setJobUrl('')
    setCompany('')
    setRole('')
    setDateApplied(new Date().toISOString().split('T')[0])
    setStatus('applied')
    setNotes('')
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="size-4" />
          Add Application
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add New Application</DialogTitle>
            <DialogDescription>
              Add a new job application to track. You can paste a job URL or enter details manually.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="job-url">Job URL (optional)</Label>
              <Input
                id="job-url"
                placeholder="https://company.com/careers/job-title"
                value={jobUrl}
                onChange={(e) => setJobUrl(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="company">Company *</Label>
                <Input
                  id="company"
                  placeholder="Company name"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="role">Role *</Label>
                <Input
                  id="role"
                  placeholder="Job title"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="date-applied">Date Applied</Label>
                <Input
                  id="date-applied"
                  type="date"
                  value={dateApplied}
                  onChange={(e) => setDateApplied(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="status">Status</Label>
                <Select value={status} onValueChange={(value) => setStatus(value as ApplicationStatus)}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="applied">Applied</SelectItem>
                    <SelectItem value="interview">Interview</SelectItem>
                    <SelectItem value="offer">Offer</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                    <SelectItem value="ghosted">Ghosted</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                placeholder="Add any notes about this application..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="min-h-[80px]"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Add Application</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
