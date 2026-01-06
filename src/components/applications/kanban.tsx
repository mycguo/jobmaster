/**
 * Kanban board for applications
 */

"use client"

import { Application, STATUS_DISPLAY } from "@/types/application"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"

interface KanbanProps {
  applications: Application[]
}

const STATUS_COLORS = {
  tracking: "bg-purple-50 border-purple-200",
  applied: "bg-blue-50 border-blue-200",
  screening: "bg-yellow-50 border-yellow-200",
  interview: "bg-cyan-50 border-cyan-200",
  offer: "bg-green-50 border-green-200",
  accepted: "bg-emerald-50 border-emerald-200",
  rejected: "bg-gray-50 border-gray-200",
  withdrawn: "bg-gray-50 border-gray-300",
}

export function ApplicationKanban({ applications }: KanbanProps) {
  // Group by status
  const columns = [
    { status: "tracking", label: "📌 Tracking", apps: [] as Application[] },
    { status: "applied", label: "📩 Applied", apps: [] as Application[] },
    { status: "screening", label: "📧 Screening", apps: [] as Application[] },
    { status: "interview", label: "🎤 Interview", apps: [] as Application[] },
    { status: "offer", label: "🎁 Offer", apps: [] as Application[] },
  ]

  applications.forEach((app) => {
    const column = columns.find((c) => c.status === app.status)
    if (column) {
      column.apps.push(app)
    }
  })

  const archivedApps = applications.filter((a) =>
    ["rejected", "withdrawn", "accepted"].includes(a.status)
  )

  return (
    <div className="space-y-8">
      {/* Kanban Columns */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {columns.map((column) => (
          <div key={column.status} className="space-y-4">
            {/* Column Header */}
            <div>
              <h3 className="font-semibold text-lg">{column.label}</h3>
              <p className="text-sm text-gray-600">
                {column.apps.length} application{column.apps.length !== 1 ? "s" : ""}
              </p>
              <hr className="mt-2" />
            </div>

            {/* Application Cards */}
            <div className="space-y-3">
              {column.apps.map((app) => (
                <Link key={app.id} href={`/applications/${app.id}`}>
                  <Card
                    className={`cursor-pointer hover:shadow-md transition-shadow ${
                      STATUS_COLORS[app.status as keyof typeof STATUS_COLORS]
                    }`}
                  >
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">{app.company}</CardTitle>
                      <CardDescription className="text-sm">
                        {app.role}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-xs text-gray-600">
                        📅 {app.appliedDate}
                      </p>
                      {app.location && (
                        <p className="text-xs text-gray-600 mt-1">
                          📍 {app.location}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Archived Applications */}
      {archivedApps.length > 0 && (
        <details className="mt-8">
          <summary className="cursor-pointer font-semibold text-lg mb-4">
            📦 Archived Applications ({archivedApps.length})
          </summary>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {archivedApps.map((app) => (
              <Link key={app.id} href={`/applications/${app.id}`}>
                <Card className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">{app.company}</CardTitle>
                    <CardDescription className="text-sm">
                      {app.role}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xs text-gray-600">
                      Status: {STATUS_DISPLAY[app.status]}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </details>
      )}
    </div>
  )
}

