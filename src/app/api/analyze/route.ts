import { NextRequest, NextResponse } from 'next/server'

const N8N_WEBHOOK_URL = 'https://n8n.irizpro.com/webhook/analyze-content'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { url, targetKeyword, secondaryKeywords, geoLocation } = body

    if (!url?.trim() || !targetKeyword?.trim()) {
      return NextResponse.json(
        { error: 'Content URL and Target Keyword are required.' },
        { status: 400 }
      )
    }

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 120_000) // 2 min

    let n8nResponse: Response
    try {
      n8nResponse = await fetch(N8N_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          inputs: {
            'content.url': url.trim(),
            targetKeyword: targetKeyword.trim(),
            secondaryKeywords: secondaryKeywords?.trim() || '',
            geoLocation: geoLocation?.trim() || 'IN',
          },
          user: { id: 'demo-user', email: 'demo@example.com' },
          credentials: {},
        }),
        signal: controller.signal,
      })
    } finally {
      clearTimeout(timeoutId)
    }

    const contentType = n8nResponse.headers.get('content-type') || ''
    if (!n8nResponse.ok) {
      const text = await n8nResponse.text()
      console.error('n8n error response:', text)
      return NextResponse.json(
        { error: `Analysis service returned an error (${n8nResponse.status}). Please try again.` },
        { status: 502 }
      )
    }

    if (!contentType.includes('application/json')) {
      const text = await n8nResponse.text()
      // Try to parse anyway — n8n sometimes returns JSON with wrong content-type
      try {
        const data = JSON.parse(text)
        return NextResponse.json(data)
      } catch {
        return NextResponse.json(
          { error: 'Unexpected response format from analysis service.' },
          { status: 502 }
        )
      }
    }

    const data = await n8nResponse.json()
    return NextResponse.json(data)
  } catch (err: any) {
    if (err.name === 'AbortError') {
      return NextResponse.json(
        { error: 'Analysis timed out after 2 minutes. Please try again with a simpler URL.' },
        { status: 408 }
      )
    }
    console.error('Analyze route error:', err)
    return NextResponse.json(
      { error: err.message || 'Failed to run analysis. Please try again.' },
      { status: 500 }
    )
  }
}
