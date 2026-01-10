/**
 * Application detail page
 */

import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { ApplicationsDB } from "@/lib/db/applications"
import { resolveSessionUserId } from "@/lib/user-ids"
import { notFound, redirect } from "next/navigation"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { STATUS_DISPLAY, STATUS_EMOJI } from "@/types/application"
import { TimelineSection } from "@/components/applications/timeline-section"
import { DeleteButton } from "@/components/applications/delete-button"
import { AnalyzeButton } from "@/components/applications/analyze-button"
import { ContactSection } from "@/components/applications/contact-section"

export default async function ApplicationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    redirect("/login")
  }

  const userId = resolveSessionUserId(session)
  console.log(
    `[ApplicationDetailPage] Using userId="${userId}" for provider=${session.user.provider || "unknown"}`
  )

  const db = new ApplicationsDB(userId)
  const application = await db.getApplication(id)

  if (!application) {
    notFound()
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            {STATUS_EMOJI[application.status]} {application.company}
          </h1>
          <p className="text-xl text-gray-600 mt-1">{application.role}</p>
        </div>
        <Button variant="outline" asChild>
          <Link href="/applications">← Back to List</Link>
        </Button>
      </div>

      {/* Main Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>📋 Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <span className="font-medium">Status:</span>{" "}
              <span
                className={`px-2 py-1 rounded text-sm ${
                  application.status === "offer" ||
                  application.status === "accepted"
                    ? "bg-green-100 text-green-800"
                    : application.status === "interview"
                      ? "bg-blue-100 text-blue-800"
                      : "bg-gray-100 text-gray-800"
                }`}
              >
                {STATUS_DISPLAY[application.status]}
              </span>
            </div>
            <div>
              <span className="font-medium">Applied Date:</span>{" "}
              {application.appliedDate}
            </div>
            {application.location && (
              <div>
                <span className="font-medium">Location:</span>{" "}
                {application.location}
              </div>
            )}
            {application.salaryRange && (
              <div>
                <span className="font-medium">Salary Range:</span>{" "}
                {application.salaryRange}
              </div>
            )}
            {application.jobUrl && (
              <div>
                <span className="font-medium">Job URL:</span>{" "}
                <a
                  href={application.jobUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  View Posting →
                </a>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>📊 Match Score</CardTitle>
          </CardHeader>
          <CardContent>
            {application.matchScore ? (
              <div className="space-y-3">
                <div className="text-4xl font-bold">
                  {Math.round(application.matchScore * 100)}%
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${
                      application.matchScore >= 0.8
                        ? "bg-green-500"
                        : application.matchScore >= 0.6
                          ? "bg-blue-500"
                          : "bg-yellow-500"
                    }`}
                    style={{ width: `${application.matchScore * 100}%` }}
                  />
                </div>
                <p className="text-sm text-gray-600">
                  {application.matchScore >= 0.8
                    ? "🎯 Excellent match!"
                    : application.matchScore >= 0.6
                      ? "👍 Good match"
                      : "⚠️ Moderate match"}
                </p>
                <AnalyzeButton applicationId={application.id} hasExistingScore={true} />
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-gray-600 mb-4">Not analyzed yet</p>
                <AnalyzeButton applicationId={application.id} />
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Contacts and Job Description */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Contacts */}
        <div className="space-y-6">
          {/* Recruiter Contact */}
          <ContactSection
            applicationId={application.id}
            title="Recruiter Contact"
            icon="👤"
            contact={application.recruiterContact}
            contactType="recruiter"
          />

          {/* Hiring Manager Contact */}
          <ContactSection
            applicationId={application.id}
            title="Hiring Manager Contact"
            icon="💼"
            contact={application.hiringManagerContact}
            contactType="hiringManager"
          />
        </div>

        {/* Job Description */}
        {application.jobDescription && (
          <Card>
            <CardHeader>
              <CardTitle>📝 Job Description</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="max-h-80 overflow-y-auto whitespace-pre-wrap text-sm text-gray-700">
                {application.jobDescription}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Timeline */}
      <TimelineSection application={application} />

      {/* Notes */}
      {application.notes && (
        <Card>
          <CardHeader>
            <CardTitle>📝 Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap text-gray-700">
              {application.notes}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <div className="flex gap-4">
        <Button asChild>
          <Link href={`/applications/${id}/edit`}>✏️ Edit</Link>
        </Button>
        <DeleteButton applicationId={application.id} companyName={application.company} />
      </div>
    </div>
  )
}
