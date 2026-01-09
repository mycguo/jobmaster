/**
 * Timeline events API endpoint
 */

import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { ApplicationsDB } from "@/lib/db/applications"
import { resolveSessionUserId } from "@/lib/user-ids"

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

    const body = await req.json()
    const { eventType, date, notes } = body

    if (!eventType || !date) {
      return NextResponse.json(
        { error: "Missing required fields: eventType and date" },
        { status: 400 }
      )
    }

    const userId = resolveSessionUserId(session)
    const db = new ApplicationsDB(userId)

    const success = await db.addTimelineEvent(id, eventType, date, notes)

    if (!success) {
      return NextResponse.json(
        { error: "Application not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Error adding timeline event:", error)
    return NextResponse.json(
      { error: error.message || "Failed to add timeline event" },
      { status: 500 }
    )
  }
}
