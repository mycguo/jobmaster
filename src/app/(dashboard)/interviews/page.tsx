/**
 * Interview Schedule Page
 * Migrated from Streamlit pages/interview_schedule.py
 */

import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { ApplicationsDB } from "@/lib/db/applications"
import { resolveSessionUserId } from "@/lib/user-ids"
import { ScheduleView } from "@/components/interviews/schedule-view"

export default async function InterviewsPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return <div>Unauthorized</div>
  }

  // Fetch applications
  const userId = resolveSessionUserId(session)
  const db = new ApplicationsDB(userId)
  const applications = await db.listApplications()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">📅 Interview Schedule</h1>
        <p className="text-gray-600 mt-1">
          View all your scheduled interviews organized by time
        </p>
      </div>

      {/* Schedule View */}
      <ScheduleView applications={applications} />
    </div>
  )
}

