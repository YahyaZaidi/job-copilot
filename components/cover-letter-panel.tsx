'use client'

import { useState, useEffect, useRef } from 'react'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Spinner } from '@/components/ui/spinner'
import { Copy, Check, Sparkles } from 'lucide-react'
interface CoverLetterPanelProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CoverLetterPanel({ open, onOpenChange }: CoverLetterPanelProps) {
  const [jobDescription, setJobDescription] = useState('')
  const [coverLetter, setCoverLetter] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const abortRef = useRef<AbortController | null>(null)

  useEffect(() => {
    if (open) {
      setJobDescription('')
      setCoverLetter('')
      setError(null)
    } else {
      abortRef.current?.abort()
    }
  }, [open])

  const generateCoverLetter = async () => {
    if (!jobDescription.trim()) return

    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller

    setIsGenerating(true)
    setCoverLetter('')
    setError(null)

    try {
      const res = await fetch('/api/generate-cover-letter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobDescription }),
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
        setError((err as Error).message || 'Something went wrong. Please try again.')
      }
    } finally {
      setIsGenerating(false)
    }
  }

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(coverLetter)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const canGenerate = !!jobDescription.trim() && !isGenerating

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-lg overflow-y-auto flex flex-col gap-6">
        <SheetHeader>
          <SheetTitle>Generate Cover Letter</SheetTitle>
          <SheetDescription>
            Paste a job description and generate a tailored cover letter.
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

        <Button onClick={generateCoverLetter} disabled={!canGenerate}>
          {isGenerating ? (
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

        {error && (
          <p className="text-sm text-destructive">{error}</p>
        )}

        {(coverLetter || isGenerating) && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Cover Letter</Label>
              {coverLetter && !isGenerating && (
                <Button size="sm" variant="outline" onClick={copyToClipboard}>
                  {copied ? (
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
              placeholder={isGenerating ? 'Writing your cover letter…' : ''}
            />
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}
