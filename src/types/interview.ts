/**
 * Interview preparation data types
 */

export type InterviewQuestionType =
  | "behavioral"
  | "technical"
  | "system-design"
  | "case-study"

export type InterviewQuestionDifficulty = "easy" | "medium" | "hard"

export interface StarAnswer {
  situation?: string
  task?: string
  action?: string
  result?: string
}

export interface InterviewQuestionRecord {
  id: string
  question: string
  type: InterviewQuestionType
  category: string
  difficulty: InterviewQuestionDifficulty
  answerFull: string
  answerStar?: StarAnswer | null
  notes?: string
  tags: string[]
  companies: string[]
  lastPracticed?: string | null
  practiceCount: number
  confidenceLevel: number
  importance: number
  createdAt: string
  updatedAt: string
}

export interface CreateInterviewQuestionInput {
  id?: string
  question: string
  type: InterviewQuestionType
  category: string
  difficulty: InterviewQuestionDifficulty
  answerFull: string
  answerStar?: StarAnswer | null
  notes?: string
  tags?: string[]
  companies?: string[]
  confidenceLevel?: number
  importance?: number
  lastPracticed?: string | null
  practiceCount?: number
  createdAt?: string
  updatedAt?: string
}

export interface UpdateInterviewQuestionInput {
  question?: string
  type?: InterviewQuestionType
  category?: string
  difficulty?: InterviewQuestionDifficulty
  answerFull?: string
  answerStar?: StarAnswer | null
  notes?: string
  tags?: string[]
  companies?: string[]
  confidenceLevel?: number
  importance?: number
  lastPracticed?: string | null
  practiceCount?: number
}

export interface InterviewQuestionFilters {
  type?: InterviewQuestionType
  category?: string
  difficulty?: InterviewQuestionDifficulty
  tag?: string
  company?: string
}

export interface InterviewQuestionStats {
  totalQuestions: number
  behavioralCount: number
  technicalCount: number
  systemDesignCount: number
  caseStudyCount: number
}
