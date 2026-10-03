import { NextRequest, NextResponse } from 'next/server'
import { getWebflowAuthUrl } from '@/lib/webflow'

export async function GET(request: NextRequest) {
  try {
    const state = crypto.randomUUID()
    const authUrl = await getWebflowAuthUrl(state)
    const response = NextResponse.redirect(authUrl)
    response.cookies.set('webflow_oauth_state', state, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 60 * 10, // 10 minutes
    })
    return response
  } catch (error) {
    console.error('Error generating Webflow auth URL:', error)
    return NextResponse.json(
      { error: 'Failed to generate auth URL' },
      { status: 500 }
    )
  }
}