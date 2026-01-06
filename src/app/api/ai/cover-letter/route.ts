/**
 * AI Cover Letter Generation API
 */

import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import {
  generateCoverLetter,
  getDefaultUserProfile,
} from "@/lib/ai/job-matcher"

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const {
      company,
      role,
      jobRequirements,
      jobDescription,
      userProfile,
    } = await req.json()

    if (!company || !role || !jobDescription) {
      return NextResponse.json(
        { error: "Company, role, and job description are required" },
        { status: 400 }
      )
    }

    const profile = userProfile || getDefaultUserProfile()
    const coverLetter = await generateCoverLetter(
      company,
      role,
      jobRequirements || {},
      profile,
      jobDescription
    )

    return NextResponse.json({ coverLetter })
  } catch (error: any) {
    console.error("Error generating cover letter:", error)
    return NextResponse.json(
      { error: error.message || "Failed to generate cover letter" },
      { status: 500 }
    )
  }
}

