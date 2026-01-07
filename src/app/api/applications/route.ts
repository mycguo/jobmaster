/**
 * Applications CRUD API
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

    const { searchParams } = new URL(req.url)
    const status = searchParams.get("status") || undefined
    const company = searchParams.get("company") || undefined

    const userId = resolveSessionUserId(session)
    console.log(
      `[ApplicationsAPI][GET] email=${session.user.email || "unknown"} provider=${session.user.provider || "unknown"} resolvedUserId=${userId}`
    )

    const db = new ApplicationsDB(userId)
    const applications = await db.listApplications({ status, company })

    return NextResponse.json({ applications })
  } catch (error: any) {
    console.error("Error fetching applications:", error)
    return NextResponse.json(
      { error: error.message || "Failed to fetch applications" },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()

    const userId = resolveSessionUserId(session)
    console.log(
      `[ApplicationsAPI][POST] email=${session.user.email || "unknown"} provider=${session.user.provider || "unknown"} resolvedUserId=${userId}`
    )

    const db = new ApplicationsDB(userId)
    const application = await db.createApplication(body)

    return NextResponse.json({ application }, { status: 201 })
  } catch (error: any) {
    console.error("Error creating application:", error)

    if (error.message.includes("already exists")) {
      return NextResponse.json({ error: error.message }, { status: 409 })
    }

    return NextResponse.json(
      { error: error.message || "Failed to create application" },
      { status: 500 }
    )
  }
}
