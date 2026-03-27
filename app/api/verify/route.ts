// app/api/verify/route.ts
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { token, mediaId } = await request.json()

    if (!token || !mediaId) {
      return NextResponse.json(
        { error: 'Token and mediaId are required' },
        { status: 400 }
      )
    }

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

    // Call the real Express backend to verify access
    const response = await fetch(`${apiUrl}/purchases/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        access_token: token,
        media_id: mediaId
      })
    })

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to verify access with backend' },
        { status: response.status }
      )
    }

    const data = await response.json()

    // The Express backend might return JSON structure like:
    // { success: true, access_granted: boolean, reason: string, remaining_plays: number, expires_at: string }
    if (data.success && data.access_granted !== undefined) {
      // Proxy the attributes expected by frontend
      return NextResponse.json({
        access_granted: data.access_granted,
        reason: data.reason,
        remaining_plays: data.remaining_plays,
        expires_at: data.expires_at
      })
    }

    return NextResponse.json({
      access_granted: false,
      reason: 'Invalid response from backend'
    })

  } catch (error) {
    console.error('Verify error:', error)
    return NextResponse.json(
      { error: 'Failed to verify access' },
      { status: 500 }
    )
  }
}