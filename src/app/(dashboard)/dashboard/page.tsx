/**
 * Dashboard page - Main analytics and overview
 * Migrated from Streamlit pages/dashboard.py
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

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return <div>Unauthorized</div>
  }

  const userId = resolveSessionUserId(session)
  console.log(
    `[Dashboard] Using userId="${userId}" for provider=${session.user.provider || "unknown"}`
  )

  // Fetch applications
  const db = new ApplicationsDB(userId)
  const applications = await db.listApplications()
  const stats = await db.getStats()

  // Calculate metrics
  const totalApps = applications.length
  const activeApps = applications.filter((a) =>
    ["tracking", "applied", "screening", "interview", "offer"].includes(
      a.status
    )
  ).length
  const offers = applications.filter((a) =>
    ["offer", "accepted"].includes(a.status)
  ).length
  const interviewRate =
    totalApps > 0
      ? Math.round(
          (applications.filter((a) =>
            ["interview", "offer", "accepted"].includes(a.status)
          ).length /
            totalApps) *
            100
        )
      : 0

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div>
        <h1 className="text-3xl font-bold">
          Welcome back, {session.user?.name?.split(" ")[0] || "there"}! 👋
        </h1>
        <p className="text-gray-600 mt-2">
          Here&apos;s an overview of your job search progress
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Total Applications</CardDescription>
            <CardTitle className="text-4xl">{totalApps}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-gray-600">
              {totalApps === 0 && "Start tracking your applications"}
              {totalApps > 0 && `Keep going! ${activeApps} active`}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Active Applications</CardDescription>
            <CardTitle className="text-4xl">{activeApps}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-gray-600">
              In progress applications
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Response Rate</CardDescription>
            <CardTitle className="text-4xl">{stats.responseRate}%</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-gray-600">
              {stats.responseRate > 50 ? "Great job!" : "Keep applying!"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Interview Rate</CardDescription>
            <CardTitle className="text-4xl">{interviewRate}%</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-gray-600">
              {offers > 0 ? `${offers} offer(s) received!` : "Applications reaching interviews"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>📝 Applications</CardTitle>
            <CardDescription>Manage your job applications</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" asChild>
              <Link href="/applications">View Applications</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>📅 Interviews</CardTitle>
            <CardDescription>Track your interview schedule</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" asChild>
              <Link href="/interviews">View Schedule</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>🎯 Interview Prep</CardTitle>
            <CardDescription>Prepare with questions and concepts</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" asChild>
              <Link href="/interview-prep">Start Preparing</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      {totalApps > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>📋 Recent Activity</CardTitle>
            <CardDescription>Your latest applications</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {applications.slice(0, 5).map((app, index) => (
                <Link
                  key={`${app.id}-${index}`}
                  href={`/applications/${app.id}`}
                  className="flex items-center justify-between py-3 border-b last:border-0 hover:bg-gray-50 -mx-6 px-6 transition-colors cursor-pointer"
                >
                  <div>
                    <div className="font-medium">
                      {app.company} - {app.role}
                    </div>
                    <div className="text-sm text-gray-600">
                      Applied: {app.appliedDate}
                    </div>
                  </div>
                  <div className="text-sm">
                    <span
                      className={`px-3 py-1 rounded-full ${
                        app.status === "offer" || app.status === "accepted"
                          ? "bg-green-100 text-green-800"
                          : app.status === "interview"
                            ? "bg-blue-100 text-blue-800"
                            : app.status === "rejected"
                              ? "bg-red-100 text-red-800"
                              : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {app.status}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
            <div className="mt-4">
              <Button variant="outline" className="w-full" asChild>
                <Link href="/applications">View All Applications</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>🚀 Get Started</CardTitle>
            <CardDescription>
              Start tracking your job applications
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-600">
              Add your first application to start tracking your job search
              progress. You can:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-600">
              <li>Add applications manually</li>
              <li>Use the Chrome extension on LinkedIn</li>
              <li>Import from other sources</li>
            </ul>
            <Button className="w-full" asChild>
              <Link href="/applications">Add Your First Application</Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
