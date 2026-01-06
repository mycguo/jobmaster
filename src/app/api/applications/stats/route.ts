/**
 * Application statistics API
 */

import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { ApplicationsDB } from "@/lib/db/applications"

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const db = new ApplicationsDB(session.user.id)
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

