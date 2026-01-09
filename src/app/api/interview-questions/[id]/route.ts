import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { resolveSessionUserId } from "@/lib/user-ids"
import { InterviewPrepDB } from "@/lib/db/interview"

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = resolveSessionUserId(session)
    const db = new InterviewPrepDB(userId)
    const question = await db.getQuestion(id)
    if (!question) {
      return NextResponse.json({ error: "Not found" }, { status: 404 })
    }

    return NextResponse.json({ question })
  } catch (error: any) {
    console.error("Error fetching interview question:", error)
    return NextResponse.json(
      { error: error.message || "Failed to fetch question" },
      { status: 500 }
    )
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const userId = resolveSessionUserId(session)
    const db = new InterviewPrepDB(userId)

    let updates = body

    if (body?.action === "practice") {
      const existing = await db.getQuestion(id)
      if (!existing) {
        return NextResponse.json({ error: "Not found" }, { status: 404 })
      }
      updates = {
        practiceCount: existing.practiceCount + 1,
        lastPracticed: new Date().toISOString(),
        confidenceLevel:
          typeof body.confidenceLevel === "number"
            ? body.confidenceLevel
            : existing.confidenceLevel,
      }
    }

    const question = await db.updateQuestion(id, updates)
    if (!question) {
      return NextResponse.json({ error: "Not found" }, { status: 404 })
    }

    return NextResponse.json({ question })
  } catch (error: any) {
    console.error("Error updating interview question:", error)
    return NextResponse.json(
      { error: error.message || "Failed to update question" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = resolveSessionUserId(session)
    const db = new InterviewPrepDB(userId)
    const deleted = await db.deleteQuestion(id)
    if (!deleted) {
      return NextResponse.json({ error: "Not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Error deleting interview question:", error)
    return NextResponse.json(
      { error: error.message || "Failed to delete question" },
      { status: 500 }
    )
  }
}
