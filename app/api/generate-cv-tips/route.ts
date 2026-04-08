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
      model: 'claude-sonnet-4-6',
      max_tokens: 1024,
      system:
        'You are an expert career coach. Given a job description and a candidate\'s CV, return exactly 5 specific, actionable tips on how to tweak the CV for this specific role. Each tip MUST follow this exact format on its own line: "Update [section] to mention [specific thing] because this role requires [reason]". Return only the 5 tips, one per line, with no bullet points, numbering, introduction, or conclusion.',
      messages: [
        {
          role: 'user',
          content: `ROLE: ${role} at ${company}

JOB DESCRIPTION:
${jobDescription}

MY CV:
${DEFAULT_CV}

Give me exactly 5 CV tips in the specified format.`,
        },
      ],
    })

    const encoder = new TextEncoder()
    const { readable, writable } = new TransformStream()
    const writer = writable.getWriter()

    ;(async () => {
      try {
        console.log('[cv-tips] starting anthropic stream')
        for await (const event of anthropicStream) {
          if (
            event.type === 'content_block_delta' &&
            event.delta.type === 'text_delta'
          ) {
            await writer.write(encoder.encode(event.delta.text))
          }
        }
        console.log('[cv-tips] stream complete')
      } catch (err) {
        console.error('[cv-tips] stream error:', err)
        try {
          await writer.write(encoder.encode(`\n\n[Error: ${(err as Error).message}]`))
        } catch {}
      } finally {
        writer.close().catch(() => {})
      }
    })()

    return new Response(readable, {
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    })
  } catch (err) {
    console.error('CV tips route error:', err)
    return new Response(
      (err as Error).message || 'Internal server error',
      { status: 500 },
    )
  }
}
