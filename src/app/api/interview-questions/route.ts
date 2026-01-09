import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { resolveSessionUserId } from "@/lib/user-ids"
import { InterviewPrepDB } from "@/lib/db/interview"

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = resolveSessionUserId(session)
    const db = new InterviewPrepDB(userId)

    const { searchParams } = new URL(req.url)
    const filters = {
      type: searchParams.get("type") || undefined,
      category: searchParams.get("category") || undefined,
      difficulty: searchParams.get("difficulty") || undefined,
      tag: searchParams.get("tag") || undefined,
      company: searchParams.get("company") || undefined,
    }

    const questions = await db.listQuestions(filters)
    return NextResponse.json({ questions })
  } catch (error: any) {
    console.error("Error fetching interview questions:", error)
    return NextResponse.json(
      { error: error.message || "Failed to fetch questions" },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const requiredFields = ["question", "type", "category", "difficulty", "answerFull"]
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        )
      }
    }

    const userId = resolveSessionUserId(session)
    const db = new InterviewPrepDB(userId)
    const question = await db.createQuestion({
      question: body.question,
      type: body.type,
      category: body.category,
      difficulty: body.difficulty,
      answerFull: body.answerFull,
      answerStar: body.answerStar,
      notes: body.notes,
      tags: body.tags,
      companies: body.companies,
      confidenceLevel: body.confidenceLevel,
      importance: body.importance,
    })

    return NextResponse.json({ question }, { status: 201 })
  } catch (error: any) {
    console.error("Error creating interview question:", error)
    return NextResponse.json(
      { error: error.message || "Failed to create question" },
      { status: 500 }
    )
  }
}

