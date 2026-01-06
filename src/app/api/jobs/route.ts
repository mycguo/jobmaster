/**
 * Jobs API endpoint for Chrome extension
 * Migrated from Python api/jobs_api.py
 */

import { NextRequest, NextResponse } from "next/server"
import { extractJobDetails } from "@/lib/ai/job-parser"
import { ApplicationsDB } from "@/lib/db/applications"

export const dynamic = "force-dynamic"

// Enable CORS for Chrome extension
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
}

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders })
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { job_url, jobUrl, page_content, pageContent, user_id, userId, notes, status } = body

    // Extract values (support both snake_case and camelCase)
    const finalJobUrl = job_url || jobUrl
    const finalPageContent = page_content || pageContent
    const finalUserId = user_id || userId || process.env.JOB_SEARCH_API_USER_ID

    // Validate inputs
    if (!finalPageContent) {
      return NextResponse.json(
        {
          success: false,
          error: "page_content is required",
        },
        { status: 400, headers: corsHeaders }
      )
    }

    if (!finalUserId) {
      return NextResponse.json(
        {
          success: false,
          error:
            "User ID not configured. Please set your email in extension settings.",
        },
        { status: 401, headers: corsHeaders }
      )
    }

    // Parse job details with AI
    const parsed = await extractJobDetails(finalPageContent, finalJobUrl)

    if (!parsed.company || !parsed.role) {
      return NextResponse.json(
        {
          success: false,
          error: "Failed to extract company or role from job content",
        },
        { status: 422, headers: corsHeaders }
      )
    }

    // Create application
    const db = new ApplicationsDB(finalUserId)
    const application = await db.createApplication({
      company: parsed.company,
      role: parsed.role,
      jobUrl: finalJobUrl || parsed.applyUrl,
      jobDescription: parsed.description,
      location: parsed.location,
      salaryRange: parsed.salaryRange,
      notes: notes?.trim() || undefined,
      status: (status || "tracking").toLowerCase() as any,
    })

    return NextResponse.json(
      {
        success: true,
        application_id: application.id,
        company: application.company,
        role: application.role,
        parsed_job: parsed,
      },
      { headers: corsHeaders }
    )
  } catch (error: any) {
    console.error("Error in /api/jobs:", error)

    // Handle duplicate error
    if (error.message.includes("already exists")) {
      return NextResponse.json(
        {
          success: false,
          error: error.message,
        },
        { status: 409, headers: corsHeaders }
      )
    }

    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to create application",
      },
      { status: 500, headers: corsHeaders }
    )
  }
}

