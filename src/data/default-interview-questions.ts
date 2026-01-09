import fs from "fs"
import path from "path"
import type { CreateInterviewQuestionInput, StarAnswer } from "@/types/interview"

let cachedDefaults: CreateInterviewQuestionInput[] | null = null

function toCamelCaseKey(key: string): string {
  return key.replace(/_([a-z])/g, (_, char) => char.toUpperCase())
}

function normalizeStarAnswer(raw: any): StarAnswer | null {
  if (!raw || typeof raw !== "object") return null
  return {
    situation: raw.situation ?? raw.Situation,
    task: raw.task ?? raw.Task,
    action: raw.action ?? raw.Action,
    result: raw.result ?? raw.Result,
  }
}

function normalizeQuestion(raw: any): CreateInterviewQuestionInput {
  return {
    id: raw.id,
    question: raw.question || raw.prompt || "",
    type: (raw.type || "behavioral").toLowerCase(),
    category: raw.category || "General",
    difficulty: (raw.difficulty || "medium").toLowerCase(),
    answerFull: raw.answer_full || raw.answerFull || "",
    answerStar: normalizeStarAnswer(raw.answer_star || raw.answerStar),
    notes: raw.notes || "",
    tags: Array.isArray(raw.tags) ? raw.tags : [],
    companies: Array.isArray(raw.companies) ? raw.companies : [],
    confidenceLevel:
      typeof raw.confidence_level === "number"
        ? raw.confidence_level
        : typeof raw.confidenceLevel === "number"
        ? raw.confidenceLevel
        : 3,
    importance: typeof raw.importance === "number" ? raw.importance : 5,
    lastPracticed: raw.last_practiced || raw.lastPracticed || null,
    practiceCount:
      typeof raw.practice_count === "number"
        ? raw.practice_count
        : typeof raw.practiceCount === "number"
        ? raw.practiceCount
        : 0,
    createdAt: raw.created_at || raw.createdAt,
    updatedAt: raw.updated_at || raw.updatedAt,
  }
}

export function getDefaultInterviewQuestions(): CreateInterviewQuestionInput[] {
  if (cachedDefaults) {
    return cachedDefaults
  }

  const filePath = path.join(process.cwd(), "interview_data", "questions.json")
  try {
    const fileContent = fs.readFileSync(filePath, "utf-8")
    const raw = JSON.parse(fileContent)
    cachedDefaults = Array.isArray(raw)
      ? raw.map(normalizeQuestion).filter((question) => question.question)
      : []
  } catch (error) {
    console.error("Failed to load default interview questions:", error)
    cachedDefaults = []
  }

  return cachedDefaults
}

