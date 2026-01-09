import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { resolveSessionUserId } from "@/lib/user-ids"
import { InterviewPrepDB } from "@/lib/db/interview"
import { QuestionStats } from "./_components/question-stats"
import { AddQuestionForm } from "./_components/add-question-form"
import { PracticePanel } from "./_components/practice-panel"
import { QuestionWorkspace } from "./_components/question-workspace"
import type { InterviewQuestionRecord, InterviewQuestionStats } from "@/types/interview"
import { getDefaultInterviewQuestions } from "@/data/default-interview-questions"

function buildStats(questions: InterviewQuestionRecord[]): InterviewQuestionStats {
  const totalQuestions = questions.length

  const countByType = (type: string) =>
    questions.filter((question) => question.type === type).length

  return {
    totalQuestions,
    behavioralCount: countByType("behavioral"),
    technicalCount: countByType("technical"),
    systemDesignCount: countByType("system-design"),
    caseStudyCount: countByType("case-study"),
  }
}

export default async function InterviewPrepPage() {
  const session = await getServerSession(authOptions)
  if (!session) {
    redirect("/login")
  }

  const userId = resolveSessionUserId(session)
  const db = new InterviewPrepDB(userId)
  let questions = await db.listQuestions()

  if (questions.length === 0) {
    const defaults = getDefaultInterviewQuestions()
    for (const question of defaults) {
      try {
        await db.createQuestion(question)
      } catch (error) {
        console.error("Failed to seed interview question", question.id, error)
      }
    }
    questions = await db.listQuestions()
  }

  const stats = buildStats(questions)

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-3xl font-bold">🎯 Interview Preparation</h1>
        <p className="mt-2 text-gray-600">
          Manage your question bank, capture perfect answers, and run focused practice sessions.
        </p>
      </div>

      <QuestionStats stats={stats} />

      <div className="grid gap-6 lg:grid-cols-2">
        <AddQuestionForm />
        <PracticePanel questions={questions} />
      </div>

      <QuestionWorkspace questions={questions} />
    </div>
  )
}
