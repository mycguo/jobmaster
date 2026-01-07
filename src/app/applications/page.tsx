/**
 * Applications page - Kanban board view
 * Migrated from Streamlit pages/applications.py
 */

import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { ApplicationsDB } from "@/lib/db/applications"
import { resolveSessionUserId } from "@/lib/user-ids"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ApplicationKanban } from "@/components/applications/kanban"
import { AddApplicationDialog } from "@/components/applications/add-application-dialog"

export default async function ApplicationsPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return <div>Unauthorized</div>
  }

  // Fetch applications
  const userId = resolveSessionUserId(session)
  console.log(
    `[ApplicationsPage] Using userId="${userId}" for provider=${session.user.provider || "unknown"}`
  )

  const db = new ApplicationsDB(userId)
  const applications = await db.listApplications()
  const stats = await db.getStats()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Job Applications</h1>
          <p className="text-gray-600 mt-1">
            Manage all your job applications in one place
          </p>
        </div>
        <AddApplicationDialog />
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 md:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total</CardDescription>
            <CardTitle>{stats.total}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Active</CardDescription>
            <CardTitle>{stats.active}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Response Rate</CardDescription>
            <CardTitle>{stats.responseRate}%</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Interviews</CardDescription>
            <CardTitle>{stats.byStatus.interview}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Offers</CardDescription>
            <CardTitle>
              {stats.byStatus.offer + stats.byStatus.accepted}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Kanban Board */}
      {applications.length > 0 ? (
        <ApplicationKanban applications={applications} />
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>🚀 No Applications Yet</CardTitle>
            <CardDescription>
              Start tracking your job search by adding your first application
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-600">You can add applications by:</p>
            <ul className="list-disc list-inside space-y-2 text-gray-600">
              <li>Using the &ldquo;Add Application&rdquo; button above</li>
              <li>Installing our Chrome extension for LinkedIn</li>
              <li>Chatting with the AI assistant</li>
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
