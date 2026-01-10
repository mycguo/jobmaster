/**
 * Application edit page
 */

import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { ApplicationsDB } from "@/lib/db/applications"
import { resolveSessionUserId } from "@/lib/user-ids"
import { notFound, redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { EditForm } from "@/components/applications/edit-form"

export default async function ApplicationEditPage({
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
          <h1 className="text-3xl font-bold">✏️ Edit Application</h1>
          <p className="text-gray-600 mt-1">
            {application.company} - {application.role}
          </p>
        </div>
        <Button variant="outline" asChild>
          <Link href={`/applications/${id}`}>← Back to Details</Link>
        </Button>
      </div>

      {/* Edit Form */}
      <EditForm application={application} />
    </div>
  )
}
