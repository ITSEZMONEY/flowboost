import { NextRequest, NextResponse } from 'next/server'
import { getWebflowAuthUrl } from '@/lib/webflow'

export async function GET(request: NextRequest) {
  try {
    const authUrl = await getWebflowAuthUrl()
    return NextResponse.redirect(authUrl)
  } catch (error) {
    console.error('Error generating Webflow auth URL:', error)
    return NextResponse.json(
      { error: 'Failed to generate auth URL' },
      { status: 500 }
    )
  }
}