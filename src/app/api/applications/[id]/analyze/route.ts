/**
 * Run AI analysis on application to calculate match score
 */

import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { ApplicationsDB } from "@/lib/db/applications"
import { ResumesDB } from "@/lib/db/resumes"
import { resolveSessionUserId } from "@/lib/user-ids"
import { analyzeJobMatch } from "@/lib/ai/job-match"

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = resolveSessionUserId(session)
    console.log(
      `[AnalyzeAPI][POST:${id}] email=${session.user.email || "unknown"} provider=${session.user.provider || "unknown"} resolvedUserId=${userId}`
    )

    // Get the application
    const appDb = new ApplicationsDB(userId)
    const application = await appDb.getApplication(id)

    if (!application) {
      return NextResponse.json(
        { error: "Application not found" },
        { status: 404 }
      )
    }

    // Check if job description exists
    if (!application.jobDescription) {
      return NextResponse.json(
        { error: "Job description is required for analysis" },
        { status: 400 }
      )
    }

    // Get user's master resume
    const resumeDb = new ResumesDB(userId)
    const masterResumes = await resumeDb.getMasterResumes()

    if (masterResumes.length === 0) {
      return NextResponse.json(
        {
          error:
            "No master resume found. Please upload your resume before running analysis.",
        },
        { status: 400 }
      )
    }

    // Use the first active master resume
    const resume = masterResumes.find((r) => r.isActive) || masterResumes[0]

    console.log(
      `[AnalyzeAPI] Analyzing match for ${application.company} - ${application.role} using resume: ${resume.name}`
    )

    // Run AI analysis
    const analysis = await analyzeJobMatch(application, resume)

    console.log(
      `[AnalyzeAPI] Match score: ${Math.round(analysis.matchScore * 100)}%`
    )

    // Update application with match score
    await appDb.updateApplication(id, {
      matchScore: analysis.matchScore,
    })

    return NextResponse.json({
      success: true,
      matchScore: analysis.matchScore,
      analysis: {
        strengths: analysis.strengths,
        gaps: analysis.gaps,
        recommendations: analysis.recommendations,
      },
    })
  } catch (error: any) {
    console.error("Error analyzing application:", error)
    return NextResponse.json(
      { error: error.message || "Failed to analyze application" },
      { status: 500 }
    )
  }
}
