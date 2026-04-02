'use client'

import { useState, useEffect } from 'react'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Spinner } from '@/components/ui/spinner'
import { Copy, Check, Sparkles } from 'lucide-react'
import type { JobApplication } from '@/lib/types'

interface CoverLetterPanelProps {
  application: JobApplication | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CoverLetterPanel({ application, open, onOpenChange }: CoverLetterPanelProps) {
  const [coverLetter, setCoverLetter] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (open && application) {
      setCoverLetter('')
      setIsGenerating(false)
    }
  }, [open, application])

  const generateCoverLetter = async () => {
    if (!application) return
    
    setIsGenerating(true)
    
    // Simulate AI generation with a realistic delay
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    const generatedLetter = `Dear Hiring Manager,

I am writing to express my strong interest in the ${application.role} position at ${application.company}. With my background and passion for this field, I am confident that I would be a valuable addition to your team.

Throughout my career, I have developed expertise in key areas relevant to this role. I am particularly drawn to ${application.company} because of your commitment to innovation and excellence in the industry.

I am excited about the opportunity to contribute to your team and help drive success at ${application.company}. I would welcome the chance to discuss how my skills and experience align with your needs.

Thank you for considering my application. I look forward to the possibility of contributing to your team.

Best regards,
[Your Name]`

    setCoverLetter(generatedLetter)
    setIsGenerating(false)
  }

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(coverLetter)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Generate Cover Letter</SheetTitle>
          <SheetDescription>
            {application ? (
              <>For {application.role} at {application.company}</>
            ) : (
              'Select an application to generate a cover letter'
            )}
          </SheetDescription>
        </SheetHeader>
        
        <div className="mt-6 space-y-4">
          {!coverLetter && !isGenerating && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="p-4 rounded-full bg-secondary mb-4">
                <Sparkles className="size-8 text-muted-foreground" />
              </div>
              <h3 className="font-medium mb-2">Ready to Generate</h3>
              <p className="text-sm text-muted-foreground mb-6 max-w-[280px]">
                Click the button below to generate a personalized cover letter for this position.
              </p>
              <Button onClick={generateCoverLetter}>
                <Sparkles className="size-4" />
                Generate Cover Letter
              </Button>
            </div>
          )}

          {isGenerating && (
            <div className="flex flex-col items-center justify-center py-12">
              <Spinner className="size-8 mb-4" />
              <p className="text-sm text-muted-foreground">Generating your cover letter...</p>
            </div>
          )}

          {coverLetter && !isGenerating && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">Your Cover Letter</p>
                <Button size="sm" variant="outline" onClick={copyToClipboard}>
                  {copied ? (
                    <>
                      <Check className="size-4" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="size-4" />
                      Copy
                    </>
                  )}
                </Button>
              </div>
              <Textarea
                value={coverLetter}
                onChange={(e) => setCoverLetter(e.target.value)}
                className="min-h-[400px] font-mono text-sm"
              />
              <Button variant="outline" onClick={generateCoverLetter} className="w-full">
                <Sparkles className="size-4" />
                Regenerate
              </Button>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
