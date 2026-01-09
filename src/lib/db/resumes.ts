/**
 * Resume database operations backed by pgvector metadata
 */

import { PgVectorStore } from "./vector-store"
import type {
  CreateResumeInput,
  ResumeFilters,
  ResumeRecord,
  ResumeStats,
} from "@/types/resume"
import { generateId } from "@/lib/utils"

function normalizeResumeRecord(data: any): ResumeRecord | null {
  if (!data) {
    return null
  }

  return {
    id: data.id,
    name: data.name || "Untitled Resume",
    version: data.version || "1.0",
    fullText: data.full_text || "",
    originalFilename: data.original_filename,
    fileType: data.file_type,
    filePath: data.file_path,
    sections: data.sections || {},
    skills: Array.isArray(data.skills) ? data.skills : [],
    experienceYears: data.experience_years,
    education: Array.isArray(data.education) ? data.education : [],
    certifications: Array.isArray(data.certifications)
      ? data.certifications
      : [],
    isMaster: Boolean(data.is_master ?? true),
    parentId: data.parent_id,
    tailoredForJob: data.tailored_for_job,
    tailoredForCompany: data.tailored_for_company,
    tailoringNotes: data.tailoring_notes,
    isActive: Boolean(data.is_active ?? true),
    lastUsed: data.last_used,
    applicationsCount: data.applications_count || 0,
    successRate: data.success_rate || 0,
    createdAt: data.created_at || new Date().toISOString(),
    updatedAt: data.updated_at || new Date().toISOString(),
  }
}

function buildVectorFilters(filters?: ResumeFilters): Record<string, any> {
  if (!filters) {
    return {}
  }

  const payload: Record<string, any> = {}

  if (typeof filters.isMaster === "boolean") {
    payload["is_master"] = filters.isMaster
  }

  if (typeof filters.isActive === "boolean") {
    payload["is_active"] = filters.isActive
  }

  if (filters.tailoredForCompany) {
    payload["tailored_for_company"] = filters.tailoredForCompany
  }

  return payload
}

export class ResumesDB {
  private vectorStore: PgVectorStore

  constructor(private readonly userId: string) {
    this.vectorStore = new PgVectorStore({
      collectionName: "resumes",
      userId,
    })
  }

  async createResume(input: CreateResumeInput): Promise<ResumeRecord> {
    const now = new Date().toISOString()
    const resumeId = generateId("res")

    const autoSkills = detectSkills(input.fullText)
    const mergedSkills = Array.from(
      new Set([...(input.skills || []), ...autoSkills])
    )

    const payload = {
      id: resumeId,
      name: input.name,
      version: "1.0",
      full_text: input.fullText,
      original_filename: input.originalFilename,
      file_type: input.fileType || "txt",
      file_path: null,
      sections: input.sections || {},
      skills: mergedSkills,
      experience_years: input.experienceYears,
      education: input.education || [],
      certifications: input.certifications || [],
      is_master: input.isMaster ?? true,
      parent_id: input.parentId,
      tailored_for_job: input.tailoredForJob,
      tailored_for_company: input.tailoredForCompany,
      tailoring_notes: input.tailoringNotes,
      is_active: input.isActive ?? true,
      last_used: null,
      applications_count: 0,
      success_rate: 0,
      created_at: now,
      updated_at: now,
    }

    const summaryText = `Resume: ${payload.name}\nType: ${
      payload.is_master ? "Master" : "Tailored"
    }\n\n${payload.full_text}`

    await this.vectorStore.addTexts([summaryText], [
      {
        record_type: "resume",
        record_id: payload.id,
        data: payload,
        text: summaryText,
        source: "resume",
        resume_id: payload.id,
        name: payload.name,
        is_master: payload.is_master,
        tailored_for_company: payload.tailored_for_company,
        type: "resume",
        timestamp: now,
      },
    ])

    return normalizeResumeRecord(payload)!
  }

  async listResumes(filters?: ResumeFilters): Promise<ResumeRecord[]> {
    const rawFilters = buildVectorFilters(filters)
    const records = await this.vectorStore.listRecords(
      "resume",
      Object.keys(rawFilters).length ? rawFilters : undefined,
      "created_at",
      true
    )

    return records
      .map((record) => normalizeResumeRecord(record))
      .filter((record): record is ResumeRecord => Boolean(record))
  }

  async getResume(id: string): Promise<ResumeRecord | null> {
    const record = await this.vectorStore.getByRecordId("resume", id)
    return normalizeResumeRecord(record)
  }

  async getMasterResumes(): Promise<ResumeRecord[]> {
    return this.listResumes({ isMaster: true })
  }

  async getTailoredResumes(): Promise<ResumeRecord[]> {
    return this.listResumes({ isMaster: false })
  }

  async getStats(): Promise<ResumeStats> {
    const resumes = await this.listResumes()
    const totalResumes = resumes.length
    const masterResumes = resumes.filter((r) => r.isMaster).length
    const tailoredResumes = resumes.filter((r) => !r.isMaster).length
    const activeResumes = resumes.filter((r) => r.isActive).length
    const totalApplications = resumes.reduce(
      (sum, resume) => sum + (resume.applicationsCount || 0),
      0
    )
    const averageSuccessRate =
      totalResumes > 0
        ? resumes.reduce((sum, resume) => sum + (resume.successRate || 0), 0) /
          totalResumes
        : 0

    const mostUsedResume = resumes.reduce<{
      name: string | null
      count: number
    }>(
      (acc, resume) => {
        if (resume.applicationsCount > acc.count) {
          return {
            name: resume.name,
            count: resume.applicationsCount,
          }
        }
        return acc
      },
      { name: null, count: 0 }
    )

    return {
      totalResumes,
      masterResumes,
      tailoredResumes,
      activeResumes,
      averageSuccessRate,
      mostUsedResume: mostUsedResume.name,
      totalApplications,
    }
  }
}

const KNOWN_SKILLS = [
  "python",
  "javascript",
  "typescript",
  "java",
  "c++",
  "c#",
  "go",
  "golang",
  "rust",
  "react",
  "node",
  "node.js",
  "nodejs",
  "aws",
  "gcp",
  "azure",
  "docker",
  "kubernetes",
  "sql",
  "postgres",
  "mysql",
  "graphql",
  "rest",
  "ml",
  "machine learning",
  "ai",
  "data science",
  "nlp",
]

function detectSkills(text: string): string[] {
  const lower = text.toLowerCase()
  const detected = KNOWN_SKILLS.filter((skill) => lower.includes(skill))
  return detected.map((skill) => skill.replace(/\b\w/g, (c) => c.toUpperCase()))
}
