import { NextRequest, NextResponse } from 'next/server'
import { exchangeCodeForToken, saveWebflowToken, WebflowAPI } from '@/lib/webflow'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const code = searchParams.get('code')
  const error = searchParams.get('error')

  if (error) {
    return NextResponse.redirect(
      new URL(`/dashboard?error=${encodeURIComponent('Webflow authorization failed')}`, request.url)
    )
  }

  if (!code) {
    return NextResponse.redirect(
      new URL(`/dashboard?error=${encodeURIComponent('No authorization code received')}`, request.url)
    )
  }

  try {
    // Get the current user (you'll need to implement proper session management)
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.redirect(
        new URL('/login?error=Please login first', request.url)
      )
    }

    // Exchange code for token
    const tokenData = await exchangeCodeForToken(code)

    // Save token to database
    await saveWebflowToken(user.id, tokenData)

    // Fetch and save user's Webflow sites
    const webflowAPI = new WebflowAPI(tokenData.access_token)
    const sites = await webflowAPI.getSites()

    // Save sites to database
    for (const site of sites) {
      await supabase.from('sites').upsert({
        user_id: user.id,
        webflow_site_id: site.id,
        name: site.name,
        domain: site.domain,
        is_active: true,
      })
    }

    return NextResponse.redirect(
      new URL('/dashboard?success=Webflow connected successfully', request.url)
    )
  } catch (error) {
    console.error('Error in Webflow callback:', error)
    return NextResponse.redirect(
      new URL(`/dashboard?error=${encodeURIComponent('Failed to connect Webflow')}`, request.url)
    )
  }
}