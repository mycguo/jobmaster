/**
 * AI/ML related types
 */

export interface JobMatchAnalysis {
  matchScore: number
  overallScore: number
  matchingSkills: string[]
  missingSkills: string[]
  recommendation: string
  strengths?: string[]
  areasForImprovement?: string[]
}

export interface ParsedJobDetails {
  company: string
  role: string
  description?: string
  location?: string
  salaryRange?: string
  applyUrl?: string
  requirements?: {
    required_skills: string[]
    preferred_skills: string[]
    years_experience?: string
    role_level?: string
  }
}

export interface UserProfile {
  skills: string[]
  experience_years: number
  education: string[]
  previous_roles: string[]
  certifications?: string[]
  interests?: string[]
}

export interface ChatMessage {
  role: "user" | "assistant" | "system"
  content: string
  timestamp?: string
}

