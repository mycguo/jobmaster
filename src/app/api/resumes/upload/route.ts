/**
 * Resume file upload endpoint
 */

import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { ResumesDB } from "@/lib/db/resumes"
import { resolveSessionUserId } from "@/lib/user-ids"
import { extractTextFromFile } from "@/lib/resume-parser"

export const runtime = "nodejs"

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const formData = await req.formData()
    const file = formData.get("file")
    const name = (formData.get("name") as string)?.trim()

    if (!file || typeof file === "string") {
      return NextResponse.json(
        { error: "Resume file is required" },
        { status: 400 }
      )
    }

    if (!name) {
      return NextResponse.json(
        { error: "Resume name is required" },
        { status: 400 }
      )
    }

    const { text, fileType } = await extractTextFromFile(file as File)

    const userId = resolveSessionUserId(session)
    const db = new ResumesDB(userId)

    const resume = await db.createResume({
      name,
      fullText: text,
      isMaster: (formData.get("isMaster") as string) === "true",
      tailoredForCompany: (formData.get("company") as string) || undefined,
      tailoringNotes: (formData.get("notes") as string) || undefined,
      originalFilename: (file as File).name,
      fileType,
    })

    return NextResponse.json({ resume }, { status: 201 })
  } catch (error: any) {
    console.error("Error uploading resume:", error)
    return NextResponse.json(
      { error: error.message || "Failed to upload resume" },
      { status: 500 }
    )
  }
}

