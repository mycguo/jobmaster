/**
 * Single application CRUD operations
 */

import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { ApplicationsDB } from "@/lib/db/applications"
import { resolveSessionUserId } from "@/lib/user-ids"

export async function GET(
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
      `[ApplicationsAPI][GET:${id}] email=${session.user.email || "unknown"} provider=${session.user.provider || "unknown"} resolvedUserId=${userId}`
    )

    const db = new ApplicationsDB(userId)
    const application = await db.getApplication(id)

    if (!application) {
      return NextResponse.json(
        { error: "Application not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({ application })
  } catch (error: any) {
    console.error("Error fetching application:", error)
    return NextResponse.json(
      { error: error.message || "Failed to fetch application" },
      { status: 500 }
    )
  }
}

export async function PATCH(
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

    const userId = resolveSessionUserId(session)
    console.log(
      `[ApplicationsAPI][PATCH:${id}] email=${session.user.email || "unknown"} provider=${session.user.provider || "unknown"} resolvedUserId=${userId}`
    )

    const db = new ApplicationsDB(userId)
    const application = await db.updateApplication(id, body)

    if (!application) {
      return NextResponse.json(
        { error: "Application not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({ application })
  } catch (error: any) {
    console.error("Error updating application:", error)
    return NextResponse.json(
      { error: error.message || "Failed to update application" },
      { status: 500 }
    )
  }
}

export async function DELETE(
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
      `[ApplicationsAPI][DELETE:${id}] email=${session.user.email || "unknown"} provider=${session.user.provider || "unknown"} resolvedUserId=${userId}`
    )

    const db = new ApplicationsDB(userId)
    const success = await db.deleteApplication(id)

    if (!success) {
      return NextResponse.json(
        { error: "Application not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Error deleting application:", error)
    return NextResponse.json(
      { error: error.message || "Failed to delete application" },
      { status: 500 }
    )
  }
}
