import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          role: 'admin' | 'editor' | 'viewer'
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          role?: 'admin' | 'editor' | 'viewer'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          role?: 'admin' | 'editor' | 'viewer'
          created_at?: string
          updated_at?: string
        }
      }
      sites: {
        Row: {
          id: string
          user_id: string
          webflow_site_id: string
          name: string
          domain: string
          is_active: boolean
          last_crawl: string | null
          health_score: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          webflow_site_id: string
          name: string
          domain: string
          is_active?: boolean
          last_crawl?: string | null
          health_score?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          webflow_site_id?: string
          name?: string
          domain?: string
          is_active?: boolean
          last_crawl?: string | null
          health_score?: number | null
          created_at?: string
          updated_at?: string
        }
      }
      seo_issues: {
        Row: {
          id: string
          site_id: string
          page_url: string
          issue_type: string
          severity: 'low' | 'medium' | 'high' | 'critical'
          description: string
          suggested_fix: string | null
          is_fixed: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          site_id: string
          page_url: string
          issue_type: string
          severity: 'low' | 'medium' | 'high' | 'critical'
          description: string
          suggested_fix?: string | null
          is_fixed?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          site_id?: string
          page_url?: string
          issue_type?: string
          severity?: 'low' | 'medium' | 'high' | 'critical'
          description?: string
          suggested_fix?: string | null
          is_fixed?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      webflow_tokens: {
        Row: {
          id: string
          user_id: string
          access_token: string
          refresh_token: string | null
          expires_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          access_token: string
          refresh_token?: string | null
          expires_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          access_token?: string
          refresh_token?: string | null
          expires_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}