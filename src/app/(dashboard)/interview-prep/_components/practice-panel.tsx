"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import type { InterviewQuestionRecord } from "@/types/interview"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

interface PracticePanelProps {
  questions: InterviewQuestionRecord[]
}

export function PracticePanel({ questions }: PracticePanelProps) {
  const router = useRouter()
  const [typeFilter, setTypeFilter] = useState("all")
  const [difficultyFilter, setDifficultyFilter] = useState("all")
  const [currentQuestion, setCurrentQuestion] = useState<InterviewQuestionRecord | null>(
    questions[0] || null
  )
  const [revealed, setRevealed] = useState(false)
  const [practiceLoading, setPracticeLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  const filteredQuestions = useMemo(() => {
    return questions.filter((question) => {
      if (typeFilter !== "all" && question.type !== typeFilter) return false
      if (difficultyFilter !== "all" && question.difficulty !== difficultyFilter)
        return false
      return true
    })
  }, [questions, typeFilter, difficultyFilter])

  useEffect(() => {
    if (filteredQuestions.length === 0) {
      setCurrentQuestion(null)
      return
    }
    if (!currentQuestion || !filteredQuestions.some((q) => q.id === currentQuestion.id)) {
      setCurrentQuestion(filteredQuestions[0])
      setRevealed(false)
    }
  }, [filteredQuestions, currentQuestion])

  const showRandomQuestion = () => {
    if (filteredQuestions.length === 0) return
    const randomIndex = Math.floor(Math.random() * filteredQuestions.length)
    setCurrentQuestion(filteredQuestions[randomIndex])
    setRevealed(false)
    setMessage(null)
  }

  const markPracticed = async (confidenceDelta: number) => {
    if (!currentQuestion) return
    setPracticeLoading(true)
    setMessage(null)
    const newConfidence = Math.max(
      1,
      Math.min(5, currentQuestion.confidenceLevel + confidenceDelta)
    )

    try {
      const response = await fetch(`/api/interview-questions/${currentQuestion.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "practice", confidenceLevel: newConfidence }),
      })

      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        throw new Error(data.error || "Failed to record practice session")
      }

      setMessage("Nice! Logged to your practice history.")
      router.refresh()
    } catch (error: any) {
      setMessage(error.message || "Unable to mark practice")
    } finally {
      setPracticeLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>🧠 Practice Mode</CardTitle>
        <CardDescription>
          Drill questions randomly, reveal the answer, and log your reps.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="text-sm font-medium">Question Type</label>
            <select
              value={typeFilter}
              onChange={(event) => setTypeFilter(event.target.value)}
              className="mt-1 w-full rounded-md border border-gray-200 px-3 py-2"
            >
              <option value="all">All types</option>
              <option value="behavioral">Behavioral</option>
              <option value="technical">Technical</option>
              <option value="system-design">System Design</option>
              <option value="case-study">Case Study</option>
            </select>
          </div>
          <div>
            <label className="text-sm font-medium">Difficulty</label>
            <select
              value={difficultyFilter}
              onChange={(event) => setDifficultyFilter(event.target.value)}
              className="mt-1 w-full rounded-md border border-gray-200 px-3 py-2"
            >
              <option value="all">All difficulties</option>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>
        </div>

        {currentQuestion ? (
          <div className="space-y-3 rounded-lg border border-gray-200 p-4">
            <p className="text-xs uppercase tracking-wide text-gray-500">
              {currentQuestion.type.replace("-", " ")} · {currentQuestion.difficulty}
            </p>
            <h3 className="text-lg font-semibold">{currentQuestion.question}</h3>
            <Button variant="outline" onClick={() => setRevealed((prev) => !prev)}>
              {revealed ? "Hide Answer" : "Reveal Answer"}
            </Button>
            {revealed && (
              <p className="whitespace-pre-line rounded-md bg-gray-50 p-3 text-sm">
                {currentQuestion.answerFull}
              </p>
            )}

            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                onClick={() => markPracticed(1)}
                disabled={practiceLoading}
              >
                👍 Went well
              </Button>
              <Button
                variant="outline"
                onClick={() => markPracticed(-1)}
                disabled={practiceLoading}
              >
                👎 Needs work
              </Button>
              <Button onClick={showRandomQuestion} variant="ghost">
                Next Question
              </Button>
            </div>
            {message && (
              <p className="text-sm text-indigo-600">{message}</p>
            )}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            No questions match the selected filters. Add a new one or adjust the dropdowns.
          </p>
        )}
      </CardContent>
    </Card>
  )
}

