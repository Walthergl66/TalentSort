// lib/supabase.ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce'
  }
})

// Tipos TypeScript
export type Profile = {
  id: string
  email: string
  full_name: string | null
  company_name: string | null
  phone: string | null
  role: 'recruiter' | 'admin' | 'manager'
  subscription_tier: 'free' | 'pro' | 'enterprise'
  created_at: string
  updated_at: string
}

export type CandidateCV = {
  id: string
  user_id: string
  file_name: string
  file_path: string
  file_size: number | null
  file_type: string
  candidate_name: string | null
  candidate_email: string | null
  candidate_phone: string | null
  candidate_location: string | null
  experience_years: number
  skills: string[]
  education_level: string | null
  education_details: any
  position_applied: string | null
  current_position: string | null
  summary: string | null
  ai_score: number
  relevance_score: number
  skill_match_percentage: number
  status: 'pending' | 'processed' | 'reviewed' | 'rejected' | 'shortlisted'
  tags: string[]
  extracted_data: any
  processing_errors: string[]
  created_at: string
  updated_at: string
}