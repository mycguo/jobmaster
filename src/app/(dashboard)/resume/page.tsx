import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { resolveSessionUserId } from "@/lib/user-ids"
import { ResumesDB } from "@/lib/db/resumes"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ResumeStatsGrid } from "./_components/stats-grid"
import { ResumeWorkspace } from "./_components/resume-workspace"
import { ResumeForms } from "./_components/resume-forms"

export default async function ResumePage() {
  const session = await getServerSession(authOptions)
  if (!session) {
    redirect("/login")
  }

  const userId = resolveSessionUserId(session)
  const db = new ResumesDB(userId)
  const [resumes, stats] = await Promise.all([
    db.listResumes(),
    db.getStats(),
  ])

  const masterResumes = resumes.filter((resume) => resume.isMaster)

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-3xl font-bold">📄 Resume Management</h1>
        <p className="mt-2 text-gray-600">
          Upload master templates, tailor role-specific versions, and keep
          everything organized in one workspace.
        </p>
      </div>

      <ResumeStatsGrid stats={stats} />

      <Card className="bg-white" aria-label="Resume quick actions">
        <CardHeader className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <CardTitle className="text-xl">Quick Actions</CardTitle>
            <CardDescription>
              Upload a master resume or tailor a version for a specific role.
            </CardDescription>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button asChild>
              <a href="#upload-resume">📤 Upload Resume</a>
            </Button>
            <Button variant="outline" asChild>
              <a href="#tailor-resume">🎯 Tailor Resume</a>
            </Button>
          </div>
        </CardHeader>
      </Card>

      <ResumeForms masterResumes={masterResumes} />

      {resumes.length > 0 && <ResumeWorkspace resumes={resumes} />}
    </div>
  )
}
