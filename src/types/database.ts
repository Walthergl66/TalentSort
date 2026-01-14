// types/database.ts

export type UserRole = 'company' | 'candidate'

export type Profile = {
  id: string
  email: string
  full_name: string
  company_name?: string | null
  phone?: string | null
  role: UserRole
  avatar_url?: string | null
  location?: string | null
  created_at: string
  updated_at: string
}

export type JobVacancy = {
  id: string
  company_id: string
  title: string
  description: string
  requirements: string
  skills_required: string[]
  experience_years_min: number
  experience_years_max?: number | null
  salary_min?: number | null
  salary_max?: number | null
  location: string
  employment_type: 'full-time' | 'part-time' | 'contract' | 'freelance'
  status: 'open' | 'closed' | 'draft'
  applications_count: number
  created_at: string
  updated_at: string
  closes_at?: string | null
}

export type CandidateCV = {
  id: string
  user_id: string
  file_name: string
  file_path: string
  file_size: number
  file_type: string
  cv_text: string
  candidate_name: string
  candidate_email: string
  candidate_phone?: string | null
  candidate_location?: string | null
  experience_years?: number | null
  skills: string[]
  education_level?: string | null
  current_position?: string | null
  summary?: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export type JobApplication = {
  id: string
  job_id: string
  candidate_id: string
  cv_id: string
  status: 'pending' | 'reviewing' | 'shortlisted' | 'rejected' | 'accepted'
  ai_score?: number | null
  match_percentage?: number | null
  ai_analysis?: AIAnalysisResult | null
  cover_letter?: string | null
  notes?: string | null
  reviewed_at?: string | null
  reviewed_by?: string | null
  created_at: string
  updated_at: string
}

export type AIAnalysisResult = {
  score: number
  match_percentage: number
  strengths: string[]
  weaknesses: string[]
  recommendation: string
  skills_match: {
    required: string[]
    found: string[]
    missing: string[]
  }
  experience_analysis: {
    years: number
    relevance: string
  }
}

export type ApplicationWithDetails = JobApplication & {
  candidate: Profile
  cv: CandidateCV
  job: JobVacancy
}
