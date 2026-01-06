/**
 * AI Job Matching API
 */

import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import {
  extractRequirements,
  calculateMatchScore,
  getDefaultUserProfile,
} from "@/lib/ai/job-matcher"

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { jobDescription, userProfile } = await req.json()

    if (!jobDescription) {
      return NextResponse.json(
        { error: "Job description is required" },
        { status: 400 }
      )
    }

    // Extract requirements
    const requirements = await extractRequirements(jobDescription)

    // Calculate match score
    const profile = userProfile || getDefaultUserProfile()
    const analysis = await calculateMatchScore(requirements, profile)

    return NextResponse.json({
      requirements,
      analysis,
    })
  } catch (error: any) {
    console.error("Error in AI match:", error)
    return NextResponse.json(
      { error: error.message || "Failed to analyze job match" },
      { status: 500 }
    )
  }
}

