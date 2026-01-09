/**
 * Resume data types (mirrors Python models/resume.py)
 */

export interface ResumeRecord {
  id: string
  name: string
  version: string
  fullText: string
  originalFilename?: string | null
  fileType?: string | null
  filePath?: string | null
  sections: Record<string, unknown>
  skills: string[]
  experienceYears?: number | null
  education: string[]
  certifications: string[]
  isMaster: boolean
  parentId?: string | null
  tailoredForJob?: string | null
  tailoredForCompany?: string | null
  tailoringNotes?: string | null
  isActive: boolean
  lastUsed?: string | null
  applicationsCount: number
  successRate: number
  createdAt: string
  updatedAt: string
}

export interface ResumeStats {
  totalResumes: number
  masterResumes: number
  tailoredResumes: number
  activeResumes: number
  averageSuccessRate: number
  mostUsedResume?: string | null
  totalApplications: number
}

export interface ResumeFilters {
  isMaster?: boolean
  isActive?: boolean
  tailoredForCompany?: string
}

export interface CreateResumeInput {
  name: string
  fullText: string
  isMaster?: boolean
  isActive?: boolean
  parentId?: string | null
  tailoredForCompany?: string
  tailoredForJob?: string
  tailoringNotes?: string
  skills?: string[]
  originalFilename?: string | null
  fileType?: string | null
  sections?: Record<string, unknown>
  experienceYears?: number | null
  education?: string[]
  certifications?: string[]
}
