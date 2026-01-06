/**
 * Application data types
 * Migrated from Python models/application.py
 */

export type ApplicationStatus =
  | "tracking"
  | "applied"
  | "screening"
  | "interview"
  | "offer"
  | "accepted"
  | "rejected"
  | "withdrawn"

export interface ContactLink {
  name?: string
  url?: string
  email?: string
  notes?: string
}

export interface ApplicationEvent {
  date: string
  eventType: string
  notes?: string
}

export interface JobRequirements {
  required_skills: string[]
  preferred_skills: string[]
  years_experience?: string
  role_level?: string
  description?: string
}

export interface Application {
  id: string
  company: string
  role: string
  status: ApplicationStatus
  appliedDate: string
  jobUrl?: string
  jobDescription?: string
  location?: string
  salaryRange?: string
  matchScore?: number
  notes?: string
  coverLetter?: string
  timeline: ApplicationEvent[]
  jobRequirements?: JobRequirements
  recruiterContact?: ContactLink
  hiringManagerContact?: ContactLink
  createdAt: string
  updatedAt: string
}

export interface CreateApplicationInput {
  company: string
  role: string
  status?: ApplicationStatus
  appliedDate?: string
  jobUrl?: string
  jobDescription?: string
  location?: string
  salaryRange?: string
  notes?: string
  recruiterContact?: ContactLink
  hiringManagerContact?: ContactLink
}

export interface UpdateApplicationInput {
  company?: string
  role?: string
  status?: ApplicationStatus
  appliedDate?: string
  jobUrl?: string
  jobDescription?: string
  location?: string
  salaryRange?: string
  matchScore?: number
  notes?: string
  coverLetter?: string
  jobRequirements?: JobRequirements
  recruiterContact?: ContactLink
  hiringManagerContact?: ContactLink
}

export interface ApplicationStats {
  total: number
  active: number
  responseRate: number
  byStatus: Record<ApplicationStatus, number>
}

export const STATUS_EMOJI: Record<ApplicationStatus, string> = {
  tracking: "📌",
  applied: "📝",
  screening: "🟡",
  interview: "📅",
  offer: "🎉",
  accepted: "✅",
  rejected: "❌",
  withdrawn: "🚫",
}

export const STATUS_DISPLAY: Record<ApplicationStatus, string> = {
  tracking: "Tracking",
  applied: "Applied",
  screening: "Screening",
  interview: "Interview",
  offer: "Offer",
  accepted: "Accepted",
  rejected: "Rejected",
  withdrawn: "Withdrawn",
}

