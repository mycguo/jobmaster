/**
 * Application statistics API
 */

import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { ApplicationsDB } from "@/lib/db/applications"
import { resolveSessionUserId } from "@/lib/user-ids"

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Use email as user ID (matches what Chrome extension sends)
    const userId = resolveSessionUserId(session)
    console.log(
      `[ApplicationsAPI][STATS] email=${session.user.email || "unknown"} provider=${session.user.provider || "unknown"} resolvedUserId=${userId}`
    )
    const db = new ApplicationsDB(userId)
    const stats = await db.getStats()

    return NextResponse.json({ stats })
  } catch (error: any) {
    console.error("Error fetching stats:", error)
    return NextResponse.json(
      { error: error.message || "Failed to fetch statistics" },
      { status: 500 }
    )
  }
}
