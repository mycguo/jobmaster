/**
 * Resume creation endpoint
 */

import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { ResumesDB } from "@/lib/db/resumes"
import { resolveSessionUserId } from "@/lib/user-ids"

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    if (!body?.name || !body?.fullText) {
      return NextResponse.json(
        { error: "Name and fullText are required" },
        { status: 400 }
      )
    }

    const userId = resolveSessionUserId(session)
    const db = new ResumesDB(userId)

    const resume = await db.createResume({
      name: body.name,
      fullText: body.fullText,
      isMaster: body.isMaster,
      tailoredForCompany: body.tailoredForCompany,
      tailoringNotes: body.tailoringNotes,
    })

    return NextResponse.json({ resume }, { status: 201 })
  } catch (error: any) {
    console.error("Error creating resume:", error)
    return NextResponse.json(
      { error: error.message || "Failed to create resume" },
      { status: 500 }
    )
  }
}

