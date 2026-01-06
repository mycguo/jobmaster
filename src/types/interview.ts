/**
 * Interview-related data types
 */

export interface InterviewQuestion {
  id: string
  question: string
  category: string
  difficulty?: "easy" | "medium" | "hard"
  answer?: string
  tags?: string[]
  company?: string
  createdAt: string
  updatedAt: string
}

export interface TechnicalConcept {
  id: string
  concept: string
  category: string
  description: string
  examples?: string[]
  resources?: string[]
  createdAt: string
  updatedAt: string
}

export interface PracticeSession {
  id: string
  date: string
  duration?: number
  questions: string[]
  notes?: string
  rating?: number
  createdAt: string
}

export interface Company {
  id: string
  name: string
  description?: string
  industry?: string
  size?: string
  location?: string
  website?: string
  notes?: string
  interviewProcess?: string
  createdAt: string
  updatedAt: string
}

export interface InterviewSchedule {
  id: string
  applicationId: string
  company: string
  role: string
  date: string
  time?: string
  type?: string
  interviewer?: string
  notes?: string
}

