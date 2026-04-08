export type ApplicationStatus = 'applied' | 'interview' | 'offer' | 'rejected' | 'ghosted'

export interface JobApplication {
  id: string
  company: string
  role: string
  dateApplied: string
  status: ApplicationStatus
  notes: string
  jobUrl?: string
  cvTips?: string[]
}
