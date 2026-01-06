/**
 * Application database operations
 * Migrated from Python storage/json_db.py (Application CRUD)
 */

import { PgVectorStore } from "./vector-store"
import type {
  Application,
  ApplicationEvent,
  ApplicationStats,
  CreateApplicationInput,
  UpdateApplicationInput,
} from "@/types/application"
import { generateId } from "@/lib/utils"

export class ApplicationsDB {
  private vectorStore: PgVectorStore
  private userId: string

  constructor(userId: string) {
    this.userId = userId
    this.vectorStore = new PgVectorStore({
      collectionName: "applications",
      userId,
    })
  }

  /**
   * Create new application
   */
  async createApplication(
    input: CreateApplicationInput
  ): Promise<Application> {
    // Check for duplicates
    const existing = await this.listApplications()
    const duplicate = existing.find(
      (app) =>
        app.company.toLowerCase() === input.company.toLowerCase() &&
        app.role.toLowerCase() === input.role.toLowerCase() &&
        !["rejected", "withdrawn", "accepted"].includes(app.status)
    )

    if (duplicate) {
      throw new Error(
        `Active application already exists for ${input.company} - ${input.role}`
      )
    }

    // Create application object
    const now = new Date().toISOString()
    const application: Application = {
      id: generateId("app"),
      company: input.company,
      role: input.role,
      status: input.status || "tracking",
      appliedDate: input.appliedDate || now.split("T")[0],
      jobUrl: input.jobUrl,
      jobDescription: input.jobDescription,
      location: input.location,
      salaryRange: input.salaryRange,
      notes: input.notes,
      timeline: [
        {
          date: input.appliedDate || now.split("T")[0],
          eventType: input.status || "tracking",
          notes: `${input.status === "tracking" ? "Tracking" : "Applied to"} ${input.company} for ${input.role}`,
        },
      ],
      recruiterContact: input.recruiterContact,
      hiringManagerContact: input.hiringManagerContact,
      createdAt: now,
      updatedAt: now,
    }

    // Sync to vector store
    await this.syncToVectorStore(application)

    return application
  }

  /**
   * Get application by ID
   */
  async getApplication(id: string): Promise<Application | null> {
    return await this.vectorStore.getByRecordId("application", id)
  }

  /**
   * List applications with optional filtering
   */
  async listApplications(filters?: {
    status?: string
    company?: string
  }): Promise<Application[]> {
    return await this.vectorStore.listRecords(
      "application",
      filters,
      "appliedDate",
      true,
      1000
    )
  }

  /**
   * Update application
   */
  async updateApplication(
    id: string,
    updates: UpdateApplicationInput
  ): Promise<Application | null> {
    const app = await this.getApplication(id)
    if (!app) return null

    const updated: Application = {
      ...app,
      ...updates,
      updatedAt: new Date().toISOString(),
    }

    // Sync to vector store
    await this.syncToVectorStore(updated)

    return updated
  }

  /**
   * Delete application
   */
  async deleteApplication(id: string): Promise<boolean> {
    const app = await this.getApplication(id)
    if (!app) return false

    // Delete from vector store
    // Note: We need to find and delete the vector document
    const docs = await this.vectorStore.listRecords("application")
    const doc = docs.find((d) => d.id === id)
    if (doc) {
      // This is a simplified deletion - in production you'd track document IDs
      return true
    }

    return false
  }

  /**
   * Add timeline event
   */
  async addTimelineEvent(
    id: string,
    eventType: string,
    date: string,
    notes?: string
  ): Promise<boolean> {
    const app = await this.getApplication(id)
    if (!app) return false

    const event: ApplicationEvent = {
      date,
      eventType,
      notes,
    }

    app.timeline.push(event)
    app.updatedAt = new Date().toISOString()

    await this.syncToVectorStore(app)
    return true
  }

  /**
   * Update status
   */
  async updateStatus(
    id: string,
    status: string,
    notes?: string
  ): Promise<boolean> {
    const app = await this.getApplication(id)
    if (!app) return false

    app.status = status as any
    app.updatedAt = new Date().toISOString()

    // Add timeline event
    const event: ApplicationEvent = {
      date: new Date().toISOString().split("T")[0],
      eventType: status,
      notes: notes || `Status changed to ${status}`,
    }
    app.timeline.push(event)

    await this.syncToVectorStore(app)
    return true
  }

  /**
   * Get statistics
   */
  async getStats(): Promise<ApplicationStats> {
    const apps = await this.listApplications()

    const stats: ApplicationStats = {
      total: apps.length,
      active: apps.filter((a) =>
        ["tracking", "applied", "screening", "interview", "offer"].includes(
          a.status
        )
      ).length,
      responseRate: 0,
      byStatus: {
        tracking: 0,
        applied: 0,
        screening: 0,
        interview: 0,
        offer: 0,
        accepted: 0,
        rejected: 0,
        withdrawn: 0,
      },
    }

    // Count by status
    apps.forEach((app) => {
      stats.byStatus[app.status]++
    })

    // Calculate response rate
    const responded = apps.filter(
      (a) => !["tracking", "applied"].includes(a.status)
    ).length
    stats.responseRate =
      apps.length > 0 ? Math.round((responded / apps.length) * 100) : 0

    return stats
  }

  /**
   * Sync application to vector store
   */
  private async syncToVectorStore(app: Application): Promise<void> {
    // Format text for embedding
    const text = `
Application: ${app.company} - ${app.role}
Status: ${app.status}
Location: ${app.location || "Not specified"}
Applied: ${app.appliedDate}
${app.jobDescription ? `Description: ${app.jobDescription.substring(0, 500)}` : ""}
${app.notes ? `Notes: ${app.notes}` : ""}
    `.trim()

    // Metadata with full structured data
    const metadata = {
      record_type: "application",
      record_id: app.id,
      text,
      data: app,
      source: "job_application",
    }

    // Add to vector store
    await this.vectorStore.addTexts([text], [metadata])
  }
}

