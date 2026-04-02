import Anthropic from '@anthropic-ai/sdk'
import { NextRequest } from 'next/server'

const DEFAULT_CV = `
Alex Johnson
alex.johnson@email.com | +1 (555) 123-4567 | linkedin.com/in/alexjohnson | github.com/alexjohnson

SUMMARY
Full-stack software engineer with 5+ years of experience building scalable web applications and APIs.
Proven track record of delivering high-quality software in fast-paced environments. Strong communicator
who enjoys collaborating cross-functionally with product, design, and data teams.

EXPERIENCE

Senior Software Engineer | Acme Corp | Jan 2022 – Present
- Led a team of 4 engineers to redesign the company's core API, reducing average response time by 40%
- Architected and shipped a real-time notification system serving 200k daily active users
- Mentored 3 junior engineers through code reviews, pair programming, and weekly 1:1s
- Championed adoption of TypeScript across the frontend codebase, eliminating a class of runtime errors

Software Engineer | Startup XYZ | Jun 2019 – Dec 2021
- Built and maintained a React/Next.js dashboard used by 500+ enterprise customers
- Designed a PostgreSQL schema and REST API for a new billing module, handling $2M+ in monthly revenue
- Integrated third-party services (Stripe, SendGrid, Twilio) and wrote comprehensive unit/integration tests
- Reduced CI pipeline duration by 35% through parallelisation and caching improvements

EDUCATION
B.Sc. Computer Science | State University | 2015 – 2019

SKILLS
Languages: TypeScript, JavaScript, Python, SQL
Frontend: React, Next.js, Tailwind CSS
Backend: Node.js, Express, FastAPI, PostgreSQL, Redis
Tools: Git, Docker, AWS (EC2, S3, Lambda), Vercel, GitHub Actions
`.trim()

export async function POST(req: NextRequest) {
  try {
    const { jobDescription, company = '', role = '' } = await req.json()

    if (!jobDescription?.trim()) {
      return new Response('Job description is required', { status: 400 })
    }

    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

    const anthropicStream = client.messages.stream({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      system:
        'You are an expert career coach who writes compelling, tailored cover letters. Write in a professional but warm tone. Be specific — reference details from the job description. Keep it to 3–4 paragraphs. Do not include a subject line or date.',
      messages: [
        {
          role: 'user',
          content: `Write a cover letter for the following role.

ROLE: ${role} at ${company}

JOB DESCRIPTION:
${jobDescription}

MY CV:
${DEFAULT_CV}

Address it to "Dear Hiring Manager," and sign off with "Best regards,\nAlex Johnson".`,
        },
      ],
    })

    const encoder = new TextEncoder()
    const { readable, writable } = new TransformStream()
    const writer = writable.getWriter()

    ;(async () => {
      try {
        console.log('[cover-letter] starting anthropic stream')
        for await (const event of anthropicStream) {
          if (
            event.type === 'content_block_delta' &&
            event.delta.type === 'text_delta'
          ) {
            await writer.write(encoder.encode(event.delta.text))
          }
        }
        console.log('[cover-letter] stream complete')
      } catch (err) {
        console.error('[cover-letter] stream error:', err)
      } finally {
        writer.close().catch(() => {})
      }
    })()

    return new Response(readable, {
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    })
  } catch (err) {
    console.error('Cover letter route error:', err)
    return new Response(
      (err as Error).message || 'Internal server error',
      { status: 500 },
    )
  }
}
