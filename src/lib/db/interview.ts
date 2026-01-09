import { PgVectorStore } from "./vector-store"
import {
  CreateInterviewQuestionInput,
  InterviewQuestionFilters,
  InterviewQuestionRecord,
  UpdateInterviewQuestionInput,
} from "@/types/interview"
import { generateId } from "@/lib/utils"

function normalizeQuestionRecord(data: any): InterviewQuestionRecord | null {
  if (!data) {
    return null
  }

  const get = (key: string, fallback?: any) =>
    data[key] ?? data[key.replace(/_(\w)/g, (_, c) => c.toUpperCase())] ?? fallback

  return {
    id: data.id,
    question: get("question", ""),
    type: get("type", "behavioral"),
    category: get("category", "general"),
    difficulty: get("difficulty", "medium"),
    answerFull: get("answer_full", ""),
    answerStar: get("answer_star"),
    notes: get("notes", ""),
    tags: get("tags", []) || [],
    companies: get("companies", []) || [],
    lastPracticed: get("last_practiced"),
    practiceCount: get("practice_count", 0),
    confidenceLevel: get("confidence_level", 3),
    importance: get("importance", 5),
    createdAt: get("created_at", new Date().toISOString()),
    updatedAt: get("updated_at", new Date().toISOString()),
  }
}

function buildQuestionPayload(
  record: InterviewQuestionRecord
): Record<string, any> {
  return {
    id: record.id,
    question: record.question,
    type: record.type,
    category: record.category,
    difficulty: record.difficulty,
    answer_full: record.answerFull,
    answer_star: record.answerStar,
    notes: record.notes || "",
    tags: record.tags || [],
    companies: record.companies || [],
    last_practiced: record.lastPracticed || null,
    practice_count: record.practiceCount ?? 0,
    confidence_level: record.confidenceLevel ?? 3,
    importance: record.importance ?? 5,
    created_at: record.createdAt,
    updated_at: record.updatedAt,
  }
}

function buildQuestionText(record: InterviewQuestionRecord): string {
  const badges = [record.type, record.category, record.difficulty]
    .filter(Boolean)
    .join(" | ")

  const tags = record.tags?.length ? `Tags: ${record.tags.join(", ")}` : ""
  const companies = record.companies?.length
    ? `Companies: ${record.companies.join(", ")}`
    : ""

  return [
    `Question: ${record.question}`,
    badges,
    `Answer: ${record.answerFull}`,
    tags,
    companies,
    record.notes ? `Notes: ${record.notes}` : "",
  ]
    .filter(Boolean)
    .join("\n")
}

function buildMetadata(payload: Record<string, any>) {
  return {
    record_type: "question",
    record_id: payload.id,
    data: payload,
    text: buildQuestionText(normalizeQuestionRecord(payload)!),
    source: "interview_question",
    question_id: payload.id,
    type: payload.type,
    category: payload.category,
    difficulty: payload.difficulty,
    timestamp: payload.updated_at,
  }
}

function applyFilters(
  questions: InterviewQuestionRecord[],
  filters?: InterviewQuestionFilters
) {
  if (!filters) return questions
  return questions.filter((question) => {
    if (filters.type && question.type !== filters.type) return false
    if (filters.category && question.category !== filters.category) return false
    if (filters.difficulty && question.difficulty !== filters.difficulty)
      return false
    if (
      filters.tag &&
      !(question.tags || []).map((tag) => tag.toLowerCase()).includes(filters.tag.toLowerCase())
    )
      return false
    if (
      filters.company &&
      !(question.companies || [])
        .map((company) => company.toLowerCase())
        .includes(filters.company.toLowerCase())
    )
      return false
    return true
  })
}

export class InterviewPrepDB {
  private vectorStore: PgVectorStore

  constructor(private readonly userId: string) {
    this.vectorStore = new PgVectorStore({
      collectionName: "interview_prep",
      userId,
    })
  }

  async listQuestions(
    filters?: InterviewQuestionFilters
  ): Promise<InterviewQuestionRecord[]> {
    const vectorFilters: Record<string, any> = {}
    if (filters?.type) vectorFilters["type"] = filters.type
    if (filters?.category) vectorFilters["category"] = filters.category
    if (filters?.difficulty) vectorFilters["difficulty"] = filters.difficulty

    const docs = await this.vectorStore.listRecords(
      "question",
      Object.keys(vectorFilters).length ? vectorFilters : undefined,
      "created_at",
      true,
      1000
    )

    const normalized = docs
      .map((doc) => normalizeQuestionRecord(doc))
      .filter((doc): doc is InterviewQuestionRecord => Boolean(doc))

    return applyFilters(normalized, filters)
  }

  async getQuestion(id: string): Promise<InterviewQuestionRecord | null> {
    const record = await this.vectorStore.getByRecordId("question", id)
    return normalizeQuestionRecord(record)
  }

  async createQuestion(
    input: CreateInterviewQuestionInput
  ): Promise<InterviewQuestionRecord> {
    const now = new Date().toISOString()
    const record: InterviewQuestionRecord = {
      id: input.id || generateId("iq"),
      question: input.question,
      type: input.type,
      category: input.category,
      difficulty: input.difficulty,
      answerFull: input.answerFull,
      answerStar: input.answerStar ?? null,
      notes: input.notes || "",
      tags: input.tags || [],
      companies: input.companies || [],
      lastPracticed: input.lastPracticed ?? null,
      practiceCount: input.practiceCount ?? 0,
      confidenceLevel: input.confidenceLevel ?? 3,
      importance: input.importance ?? 5,
      createdAt: input.createdAt ?? now,
      updatedAt: input.updatedAt ?? now,
    }

    const payload = buildQuestionPayload(record)
    await this.vectorStore.upsertRecord(
      buildQuestionText(record),
      buildMetadata(payload)
    )

    return record
  }

  async updateQuestion(
    id: string,
    updates: UpdateInterviewQuestionInput
  ): Promise<InterviewQuestionRecord | null> {
    const existing = await this.getQuestion(id)
    if (!existing) return null

    const updated: InterviewQuestionRecord = {
      ...existing,
      ...updates,
      tags: updates.tags ?? existing.tags,
      companies: updates.companies ?? existing.companies,
      answerStar:
        updates.answerStar === undefined ? existing.answerStar : updates.answerStar,
      lastPracticed:
        updates.lastPracticed === undefined
          ? existing.lastPracticed
          : updates.lastPracticed,
      practiceCount:
        updates.practiceCount === undefined
          ? existing.practiceCount
          : updates.practiceCount,
      confidenceLevel:
        updates.confidenceLevel === undefined
          ? existing.confidenceLevel
          : updates.confidenceLevel,
      importance:
        updates.importance === undefined ? existing.importance : updates.importance,
      updatedAt: new Date().toISOString(),
    }

    const payload = buildQuestionPayload(updated)
    await this.vectorStore.upsertRecord(
      buildQuestionText(updated),
      buildMetadata(payload)
    )

    return updated
  }

  async deleteQuestion(id: string): Promise<boolean> {
    const deleted = await this.vectorStore.deleteByMetadata({
      record_type: "question",
      record_id: id,
    })
    return deleted > 0
  }
}
