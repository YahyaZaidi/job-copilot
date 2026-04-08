'use client'

import { useState, useEffect, useRef } from 'react'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Spinner } from '@/components/ui/spinner'
import { Copy, Check, Sparkles, Save } from 'lucide-react'
import type { JobApplication } from '@/lib/types'

interface CoverLetterPanelProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  application?: JobApplication | null
  onSaveCvTips?: (id: string, tips: string[]) => void
}

export function CoverLetterPanel({ open, onOpenChange, application, onSaveCvTips }: CoverLetterPanelProps) {
  const [jobDescription, setJobDescription] = useState('')

  const [coverLetter, setCoverLetter] = useState('')
  const [isGeneratingLetter, setIsGeneratingLetter] = useState(false)
  const [copiedLetter, setCopiedLetter] = useState(false)
  const [letterError, setLetterError] = useState<string | null>(null)
  const abortLetterRef = useRef<AbortController | null>(null)

  const [cvTipsText, setCvTipsText] = useState('')
  const [isGeneratingTips, setIsGeneratingTips] = useState(false)
  const [tipsSaved, setTipsSaved] = useState(false)
  const [tipsError, setTipsError] = useState<string | null>(null)
  const abortTipsRef = useRef<AbortController | null>(null)

  useEffect(() => {
    if (open) {
      setJobDescription('')
      setCoverLetter('')
      setLetterError(null)
      setTipsError(null)
      // Pre-populate existing tips if application has them
      setCvTipsText(application?.cvTips?.join('\n') ?? '')
      setTipsSaved(false)
    } else {
      abortLetterRef.current?.abort()
      abortTipsRef.current?.abort()
    }
  }, [open, application])

  const generateCoverLetter = async () => {
    if (!jobDescription.trim()) return

    abortLetterRef.current?.abort()
    const controller = new AbortController()
    abortLetterRef.current = controller

    setIsGeneratingLetter(true)
    setCoverLetter('')
    setLetterError(null)

    try {
      const res = await fetch('/api/generate-cover-letter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobDescription,
          company: application?.company ?? '',
          role: application?.role ?? '',
        }),
        signal: controller.signal,
      })

      if (!res.ok) {
        const text = await res.text()
        throw new Error(text || `Request failed (${res.status})`)
      }

      const reader = res.body!.getReader()
      const decoder = new TextDecoder()

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        setCoverLetter((prev) => prev + decoder.decode(value, { stream: true }))
      }
    } catch (err) {
      if ((err as Error).name !== 'AbortError') {
        setLetterError((err as Error).message || 'Something went wrong. Please try again.')
      }
    } finally {
      setIsGeneratingLetter(false)
    }
  }

  const generateCvTips = async () => {
    if (!jobDescription.trim()) return

    abortTipsRef.current?.abort()
    const controller = new AbortController()
    abortTipsRef.current = controller

    setIsGeneratingTips(true)
    setCvTipsText('')
    setTipsError(null)
    setTipsSaved(false)

    try {
      const res = await fetch('/api/generate-cv-tips', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobDescription,
          company: application?.company ?? '',
          role: application?.role ?? '',
        }),
        signal: controller.signal,
      })

      if (!res.ok) {
        const text = await res.text()
        throw new Error(text || `Request failed (${res.status})`)
      }

      const reader = res.body!.getReader()
      const decoder = new TextDecoder()

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        setCvTipsText((prev) => prev + decoder.decode(value, { stream: true }))
      }
    } catch (err) {
      if ((err as Error).name !== 'AbortError') {
        setTipsError((err as Error).message || 'Something went wrong. Please try again.')
      }
    } finally {
      setIsGeneratingTips(false)
    }
  }

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(coverLetter)
    setCopiedLetter(true)
    setTimeout(() => setCopiedLetter(false), 2000)
  }

  const saveCvTips = () => {
    if (!application || !onSaveCvTips) return
    const tips = cvTipsText
      .split('\n')
      .map((t) => t.trim())
      .filter(Boolean)
    onSaveCvTips(application.id, tips)
    setTipsSaved(true)
    setTimeout(() => setTipsSaved(false), 2000)
  }

  const canGenerate = !!jobDescription.trim()

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-lg overflow-y-auto flex flex-col gap-6">
        <SheetHeader>
          <SheetTitle>
            {application ? `${application.company} – ${application.role}` : 'AI Tools'}
          </SheetTitle>
          <SheetDescription>
            Paste a job description to generate a cover letter or get CV tailoring tips.
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-2">
          <Label htmlFor="job-description">Job Description</Label>
          <Textarea
            id="job-description"
            placeholder="Paste the job description here…"
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            className="min-h-[160px] text-sm resize-none"
          />
        </div>

        <Tabs defaultValue="cover-letter" className="flex flex-col gap-4">
          <TabsList className="w-full">
            <TabsTrigger value="cover-letter" className="flex-1">Cover Letter</TabsTrigger>
            <TabsTrigger value="cv-tips" className="flex-1">CV Tips</TabsTrigger>
          </TabsList>

          {/* Cover Letter Tab */}
          <TabsContent value="cover-letter" className="flex flex-col gap-4 mt-0">
            <Button onClick={generateCoverLetter} disabled={!canGenerate || isGeneratingLetter}>
              {isGeneratingLetter ? (
                <>
                  <Spinner className="size-4" />
                  Generating…
                </>
              ) : (
                <>
                  <Sparkles className="size-4" />
                  {coverLetter ? 'Regenerate' : 'Generate Cover Letter'}
                </>
              )}
            </Button>

            {letterError && (
              <p className="text-sm text-destructive">{letterError}</p>
            )}

            {(coverLetter || isGeneratingLetter) && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Cover Letter</Label>
                  {coverLetter && !isGeneratingLetter && (
                    <Button size="sm" variant="outline" onClick={copyToClipboard}>
                      {copiedLetter ? (
                        <><Check className="size-4" />Copied!</>
                      ) : (
                        <><Copy className="size-4" />Copy</>
                      )}
                    </Button>
                  )}
                </div>
                <Textarea
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                  className="min-h-[380px] text-sm font-mono"
                  placeholder={isGeneratingLetter ? 'Writing your cover letter…' : ''}
                />
              </div>
            )}
          </TabsContent>

          {/* CV Tips Tab */}
          <TabsContent value="cv-tips" className="flex flex-col gap-4 mt-0">
            <Button onClick={generateCvTips} disabled={!canGenerate || isGeneratingTips}>
              {isGeneratingTips ? (
                <>
                  <Spinner className="size-4" />
                  Generating…
                </>
              ) : (
                <>
                  <Sparkles className="size-4" />
                  {cvTipsText ? 'Regenerate Tips' : 'Generate CV Tips'}
                </>
              )}
            </Button>

            {tipsError && (
              <p className="text-sm text-destructive">{tipsError}</p>
            )}

            {(cvTipsText || isGeneratingTips) && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>CV Tips</Label>
                  {cvTipsText && !isGeneratingTips && application && onSaveCvTips && (
                    <Button size="sm" variant="outline" onClick={saveCvTips}>
                      {tipsSaved ? (
                        <><Check className="size-4" />Saved!</>
                      ) : (
                        <><Save className="size-4" />Save</>
                      )}
                    </Button>
                  )}
                </div>
                {isGeneratingTips && !cvTipsText ? (
                  <p className="text-sm text-muted-foreground">Generating tips…</p>
                ) : (
                  <ul className="space-y-3">
                    {cvTipsText
                      .split('\n')
                      .map((t) => t.trim())
                      .filter(Boolean)
                      .map((tip, i) => (
                        <li key={i} className="flex gap-2.5 text-sm leading-relaxed">
                          <span className="mt-0.5 shrink-0 size-5 rounded-full bg-secondary flex items-center justify-center text-xs font-medium text-muted-foreground">
                            {i + 1}
                          </span>
                          <span>{tip}</span>
                        </li>
                      ))}
                  </ul>
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  )
}
