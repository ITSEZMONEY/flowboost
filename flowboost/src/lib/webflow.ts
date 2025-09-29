import { supabase } from './supabase'

export interface WebflowSite {
  id: string
  name: string
  shortName: string
  domain: string
  homepage: string
  workspaceId: string
  createdOn: string
  lastUpdated: string
}

export interface WebflowAuthResponse {
  access_token: string
  refresh_token?: string
  expires_in?: number
  token_type: string
  scope: string
}

export class WebflowAPI {
  private accessToken: string

  constructor(accessToken: string) {
    this.accessToken = accessToken
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const response = await fetch(`https://api.webflow.com/v2${endpoint}`, {
      ...options,
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...options.headers,
      },
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Webflow API error: ${response.status} ${error}`)
    }

    return response.json()
  }

  async getSites(): Promise<WebflowSite[]> {
    const data = await this.request('/sites')
    return data.sites || []
  }

  async getSite(siteId: string): Promise<WebflowSite> {
    const data = await this.request(`/sites/${siteId}`)
    return data
  }

  async updatePageSEO(siteId: string, pageId: string, seoData: any) {
    return this.request(`/sites/${siteId}/pages/${pageId}`, {
      method: 'PATCH',
      body: JSON.stringify({
        seo: seoData
      })
    })
  }

  async getPages(siteId: string, limit = 100, offset = 0) {
    const params = new URLSearchParams({
      limit: limit.toString(),
      offset: offset.toString()
    })

    return this.request(`/sites/${siteId}/pages?${params}`)
  }
}

export async function getWebflowAuthUrl(): Promise<string> {
  const clientId = process.env.WEBFLOW_CLIENT_ID!
  const redirectUri = process.env.WEBFLOW_REDIRECT_URI!

  const params = new URLSearchParams({
    response_type: 'code',
    client_id: clientId,
    redirect_uri: redirectUri,
    scope: 'sites:read sites:write pages:read pages:write',
    state: crypto.randomUUID(), // Add CSRF protection
  })

  return `https://webflow.com/oauth/authorize?${params}`
}

export async function exchangeCodeForToken(code: string): Promise<WebflowAuthResponse> {
  const response = await fetch('https://api.webflow.com/oauth/access_token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      client_id: process.env.WEBFLOW_CLIENT_ID!,
      client_secret: process.env.WEBFLOW_CLIENT_SECRET!,
      code,
      grant_type: 'authorization_code',
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Failed to exchange code for token: ${error}`)
  }

  return response.json()
}

export async function saveWebflowToken(userId: string, tokenData: WebflowAuthResponse) {
  const expiresAt = tokenData.expires_in
    ? new Date(Date.now() + tokenData.expires_in * 1000).toISOString()
    : null

  const { error } = await supabase
    .from('webflow_tokens')
    .upsert({
      user_id: userId,
      access_token: tokenData.access_token,
      refresh_token: tokenData.refresh_token || null,
      expires_at: expiresAt,
    })

  if (error) {
    throw new Error(`Failed to save Webflow token: ${error.message}`)
  }
}

export async function getWebflowToken(userId: string): Promise<string | null> {
  const { data, error } = await supabase
    .from('webflow_tokens')
    .select('access_token, expires_at')
    .eq('user_id', userId)
    .single()

  if (error || !data) {
    return null
  }

  // Check if token is expired
  if (data.expires_at && new Date(data.expires_at) < new Date()) {
    return null
  }

  return data.access_token
}