/**
 * Interview Schedule View Component
 * Client component for displaying and managing interview schedule
 */

"use client"

import { useState } from "react"
import Link from "next/link"
import type { Application } from "@/types/application"
import type { Interview, InterviewCategory } from "@/lib/interviews"
import {
  getAllInterviews,
  groupInterviewsByDate,
  formatInterviewTime,
  formatInterviewType,
  formatDate,
} from "@/lib/interviews"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface ScheduleViewProps {
  applications: Application[]
}

export function ScheduleView({ applications }: ScheduleViewProps) {
  const interviews = getAllInterviews(applications)
  const grouped = groupInterviewsByDate(interviews)

  // Calculate stats
  const totalInterviews = interviews.length
  const upcoming7Days =
    (grouped["Today"]?.length || 0) +
    (grouped["Tomorrow"]?.length || 0) +
    (grouped["This Week"]?.length || 0)
  const thisWeek = grouped["This Week"]?.length || 0
  const past = grouped["Past"]?.length || 0

  const displayOrder: InterviewCategory[] = ["Today", "Tomorrow", "This Week", "This Month", "Upcoming", "Other"]

  if (totalInterviews === 0) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>🎯 No Interviews Scheduled</CardTitle>
            <CardDescription>
              Add interview events to your applications to see them here
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-600">How to add interviews:</p>
            <ol className="list-decimal list-inside space-y-2 text-gray-600">
              <li>Go to the <strong>Applications</strong> page</li>
              <li>Click on an application to view details</li>
              <li>Go to the <strong>Timeline</strong> tab</li>
              <li>Add a timeline event with type &quot;interview&quot; or &quot;screening&quot;</li>
              <li>Include date and time in the notes</li>
            </ol>
            <div className="pt-4">
              <Link href="/applications">
                <Button>Go to Applications</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Interviews</CardDescription>
            <CardTitle className="text-3xl">{totalInterviews}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Upcoming (7 days)</CardDescription>
            <CardTitle className="text-3xl">{upcoming7Days}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>This Week</CardDescription>
            <CardTitle className="text-3xl">{thisWeek}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Past</CardDescription>
            <CardTitle className="text-3xl">{past}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Interview sections */}
      <div className="space-y-8">
        {displayOrder.map((category) => {
          const categoryInterviews = grouped[category]
          if (!categoryInterviews || categoryInterviews.length === 0) {
            return null
          }

          return (
            <div key={category} className="space-y-4">
              <h2 className="text-2xl font-bold">📅 {category}</h2>
              <div className="grid gap-4">
                {categoryInterviews.map((interview, idx) => {
                  const interviewType = formatInterviewType(interview)
                  return (
                    <InterviewCard
                      key={`${interview.applicationId}-${interview.date}-${idx}`}
                      interview={interview}
                      interviewType={interviewType}
                    />
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>

      {/* Past interviews in collapsible section */}
      {grouped["Past"] && grouped["Past"].length > 0 && (
        <details className="space-y-4">
          <summary className="cursor-pointer text-xl font-bold">
            📦 Archived Interviews ({grouped["Past"].length} interviews)
          </summary>
          <div className="grid gap-4 mt-4">
            {grouped["Past"].map((interview, idx) => {
              const interviewType = formatInterviewType(interview)
              return (
                <InterviewCard
                  key={`past-${interview.applicationId}-${interview.date}-${idx}`}
                  interview={interview}
                  interviewType={interviewType}
                />
              )
            })}
          </div>
        </details>
      )}

      {/* Quick actions */}
      <div className="flex gap-4 pt-4">
        <Link href="/applications" className="flex-1">
          <Button variant="outline" className="w-full">
            📝 Go to Applications
          </Button>
        </Link>
        <Link href="/interview-prep" className="flex-1">
          <Button variant="outline" className="w-full">
            🎯 Go to Interview Prep
          </Button>
        </Link>
      </div>
    </div>
  )
}

interface InterviewCardProps {
  interview: Interview
  interviewType: { emoji: string; label: string }
}

function InterviewCard({ interview, interviewType }: InterviewCardProps) {
  const dateDisplay = formatDate(interview.date)
  const timeDisplay = formatInterviewTime(interview)

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <h3 className="text-lg font-bold">{interview.company}</h3>
            <p className="text-sm text-gray-600">{interview.role}</p>
          </div>

          <div>
            <p className="text-sm font-medium text-gray-500">Date & Time</p>
            <p className="text-sm">📅 {dateDisplay}</p>
            <p className="text-sm">🕐 {timeDisplay}</p>
          </div>

          <div>
            <p className="text-sm font-medium text-gray-500">Type</p>
            <p className="text-sm">
              {interviewType.emoji} {interviewType.label}
            </p>
            {interview.interviewer && (
              <p className="text-sm text-gray-600">👤 {interview.interviewer}</p>
            )}
          </div>

          <div className="flex items-center justify-end">
            <Link href={`/applications/${interview.applicationId}`}>
              <Button size="sm">View App</Button>
            </Link>
          </div>
        </div>

        {interview.notes && (
          <details className="mt-4">
            <summary className="cursor-pointer text-sm font-medium text-gray-500">
              📝 Notes
            </summary>
            <p className="text-sm text-gray-600 mt-2 whitespace-pre-wrap">
              {interview.notes}
            </p>
          </details>
        )}
      </CardContent>
    </Card>
  )
}
