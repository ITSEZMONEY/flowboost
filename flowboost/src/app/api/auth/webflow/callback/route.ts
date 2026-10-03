import { NextRequest, NextResponse } from 'next/server'
import { exchangeCodeForToken, saveWebflowToken, WebflowAPI } from '@/lib/webflow'
import { supabase } from '@/lib/supabase'

const STATE_COOKIE = 'webflow_oauth_state'

export async function GET(request: NextRequest) {
  // The state cookie is single-use: every response from this handler clears it.
  const redirectTo = (url: URL) => {
    const response = NextResponse.redirect(url)
    response.cookies.delete(STATE_COOKIE)
    return response
  }

  const searchParams = request.nextUrl.searchParams
  const code = searchParams.get('code')
  const state = searchParams.get('state')
  const error = searchParams.get('error')

  const storedState = request.cookies.get(STATE_COOKIE)?.value

  if (error) {
    return redirectTo(
      new URL(`/dashboard?error=${encodeURIComponent('Webflow authorization failed')}`, request.url)
    )
  }

  if (!code) {
    return redirectTo(
      new URL(`/dashboard?error=${encodeURIComponent('No authorization code received')}`, request.url)
    )
  }

  if (!state || !storedState || state !== storedState) {
    return redirectTo(
      new URL(`/dashboard?error=${encodeURIComponent('Invalid state parameter (CSRF protection)')}`, request.url)
    )
  }

  try {
    // Get the current user (you'll need to implement proper session management)
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      return redirectTo(
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

    return redirectTo(
      new URL('/dashboard?success=Webflow connected successfully', request.url)
    )
  } catch (error) {
    console.error('Error in Webflow callback:', error)
    return redirectTo(
      new URL(`/dashboard?error=${encodeURIComponent('Failed to connect Webflow')}`, request.url)
    )
  }
}