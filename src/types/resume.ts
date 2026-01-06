/**
 * Resume data types
 */

export interface Resume {
  id: string
  name: string
  fileName: string
  filePath: string
  fileSize: number
  uploadDate: string
  lastModified: string
  isDefault: boolean
  versions: ResumeVersion[]
}

export interface ResumeVersion {
  id: string
  resumeId: string
  versionNumber: number
  fileName: string
  filePath: string
  notes?: string
  createdAt: string
}

export interface CreateResumeInput {
  name: string
  fileName: string
  file: File
  isDefault?: boolean
}

