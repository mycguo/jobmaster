/**
 * Tailor resume endpoint
 */

import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { ResumesDB } from "@/lib/db/resumes"
import { resolveSessionUserId } from "@/lib/user-ids"
import { tailorResumeWithAI } from "@/lib/ai/resume-tailor"

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    if (!body?.resumeId || !body?.jobDescription || !body?.companyName) {
      return NextResponse.json(
        { error: "resumeId, companyName, and jobDescription are required" },
        { status: 400 }
      )
    }

    const userId = resolveSessionUserId(session)
    const db = new ResumesDB(userId)
    const baseResume = await db.getResume(body.resumeId)

    if (!baseResume) {
      return NextResponse.json(
        { error: "Resume not found" },
        { status: 404 }
      )
    }

    const tailorResult = await tailorResumeWithAI({
      resumeText: baseResume.fullText,
      jobDescription: body.jobDescription,
      companyName: body.companyName,
    })

    const tailoredName = body.jobTitle
      ? `${body.companyName} - ${body.jobTitle}`
      : `${body.companyName} Resume`

    const tailoredResume = await db.createResume({
      name: tailoredName,
      fullText: tailorResult.tailoredText,
      isMaster: false,
      parentId: baseResume.id,
      tailoredForCompany: body.companyName,
      tailoringNotes: body.notes || tailorResult.insights,
    })

    return NextResponse.json({
      resume: tailoredResume,
      insights: tailorResult.insights,
    })
  } catch (error: any) {
    console.error("Error tailoring resume:", error)
    return NextResponse.json(
      { error: error.message || "Failed to tailor resume" },
      { status: 500 }
    )
  }
}

