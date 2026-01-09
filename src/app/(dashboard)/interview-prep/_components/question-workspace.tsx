"use client"

import { useEffect, useMemo, useState } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import type { InterviewQuestionRecord } from "@/types/interview"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { cn, formatDate } from "@/lib/utils"

interface QuestionWorkspaceProps {
  questions: InterviewQuestionRecord[]
}

const TYPE_FILTERS = [
  { label: "All", value: "all" },
  { label: "Behavioral", value: "behavioral" },
  { label: "Technical", value: "technical" },
  { label: "System Design", value: "system-design" },
  { label: "Case Study", value: "case-study" },
]

const VALID_TYPES = TYPE_FILTERS.map((filter) => filter.value)

const DIFFICULTY_FILTERS = [
  { label: "All", value: "all" },
  { label: "Easy", value: "easy" },
  { label: "Medium", value: "medium" },
  { label: "Hard", value: "hard" },
]

export function QuestionWorkspace({ questions }: QuestionWorkspaceProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const [items, setItems] = useState<InterviewQuestionRecord[]>(questions)
  const [selectedId, setSelectedId] = useState<string | null>(
    questions[0]?.id || null
  )
  const [search, setSearch] = useState("")
  const [typeFilter, setTypeFilter] = useState("all")
  const [difficultyFilter, setDifficultyFilter] = useState("all")
  const [practiceLoading, setPracticeLoading] = useState(false)
  const [practiceConfidence, setPracticeConfidence] = useState(3)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    setItems(questions)
    if (!selectedId && questions[0]) {
      setSelectedId(questions[0].id)
    }
  }, [questions, selectedId])

  useEffect(() => {
    const paramType = searchParams.get("type") || "all"
    if (VALID_TYPES.includes(paramType) && paramType !== typeFilter) {
      setTypeFilter(paramType)
    }
  }, [searchParams, typeFilter])

  const selectedQuestion = items.find((question) => question.id === selectedId) || null

  useEffect(() => {
    if (selectedQuestion) {
      setPracticeConfidence(selectedQuestion.confidenceLevel)
    }
  }, [selectedQuestion])

  const filteredQuestions = useMemo(() => {
    return items.filter((question) => {
      if (
        typeFilter !== "all" &&
        question.type.toLowerCase() !== typeFilter.toLowerCase()
      ) {
        return false
      }

      if (
        difficultyFilter !== "all" &&
        question.difficulty.toLowerCase() !== difficultyFilter.toLowerCase()
      ) {
        return false
      }

      if (!search.trim()) {
        return true
      }

      const haystack = [
        question.question,
        question.answerFull,
        question.notes || "",
        ...(question.tags || []),
        ...(question.companies || []),
      ]
        .join(" ")
        .toLowerCase()

      return haystack.includes(search.toLowerCase())
    })
  }, [items, typeFilter, difficultyFilter, search])

  const handlePractice = async () => {
    if (!selectedQuestion) return
    setPracticeLoading(true)
    setErrorMessage(null)

    try {
      const response = await fetch(`/api/interview-questions/${selectedQuestion.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "practice",
          confidenceLevel: practiceConfidence,
        }),
      })

      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        throw new Error(data.error || "Failed to update practice status")
      }

      const data = await response.json()
      if (data?.question) {
        setItems((prev) =>
          prev.map((item) => (item.id === data.question.id ? data.question : item))
        )
      }
      router.refresh()
    } catch (error: any) {
      setErrorMessage(error.message || "Unable to mark practiced")
    } finally {
      setPracticeLoading(false)
    }
  }

  const handleTypeChange = (value: string) => {
    if (!VALID_TYPES.includes(value)) return
    setTypeFilter(value)
    const params = new URLSearchParams(searchParams.toString())
    if (value === "all") {
      params.delete("type")
    } else {
      params.set("type", value)
    }
    const queryString = params.toString()
    router.replace(
      queryString
        ? `${pathname}?${queryString}#question-workspace`
        : `${pathname}#question-workspace`,
      { scroll: false }
    )
  }

  return (
    <div id="question-workspace" className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap gap-2">
          {TYPE_FILTERS.map((filter) => (
            <button
              key={filter.value}
              onClick={() => handleTypeChange(filter.value)}
              className={cn(
                "rounded-full border px-4 py-1 text-sm",
                typeFilter === filter.value
                  ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                  : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
              )}
            >
              {filter.label}
            </button>
          ))}
        </div>

        <div className="flex flex-col gap-2 md:flex-row md:items-center">
          <select
            value={difficultyFilter}
            onChange={(event) => setDifficultyFilter(event.target.value)}
            className="rounded-md border border-gray-200 px-3 py-2 text-sm"
          >
            {DIFFICULTY_FILTERS.map((filter) => (
              <option key={filter.value} value={filter.value}>
                {filter.label} Difficulty
              </option>
            ))}
          </select>
          <input
            type="search"
            placeholder="Search by keyword, tag, or company"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="w-full rounded-md border border-gray-200 px-3 py-2"
          />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[360px,1fr]">
        <div className="space-y-3">
          {filteredQuestions.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No questions match the filters yet. Try adding one above.
            </p>
          ) : (
            filteredQuestions.map((question) => (
              <button
                key={question.id}
                onClick={() => setSelectedId(question.id)}
                className={cn(
                  "w-full rounded-lg border p-4 text-left transition",
                  selectedId === question.id
                    ? "border-indigo-500 bg-indigo-50 shadow-sm"
                    : "border-gray-200 bg-white hover:border-indigo-300"
                )}
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold leading-tight">
                    {question.question}
                  </h3>
                  <span className="text-xs text-gray-500">
                    {question.importance >= 8 ? "🔥" : "⭐"} {question.importance}/10
                  </span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {question.type.replace("-", " ").toUpperCase()} · {question.category} · {question.difficulty}
                </p>
                <div className="mt-2 flex flex-wrap gap-2 text-xs text-gray-600">
                  {question.tags.slice(0, 3).map((tag) => (
                    <span key={tag} className="rounded-full bg-gray-100 px-2 py-0.5">
                      #{tag}
                    </span>
                  ))}
                </div>
              </button>
            ))
          )}
        </div>

        <div>
          {selectedQuestion ? (
            <Card>
              <CardHeader>
                <CardDescription>
                  {selectedQuestion.type.replace("-", " ")} · {selectedQuestion.category}
                </CardDescription>
                <CardTitle>{selectedQuestion.question}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
                    Model Answer
                  </h3>
                  <p className="mt-2 whitespace-pre-line text-gray-800">
                    {selectedQuestion.answerFull}
                  </p>
                </div>

                {selectedQuestion.notes && (
                  <div>
                    <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
                      Notes
                    </h3>
                    <p className="mt-2 text-gray-700">{selectedQuestion.notes}</p>
                  </div>
                )}

                <div className="flex flex-wrap gap-2 text-xs text-gray-600">
                  {selectedQuestion.tags.map((tag) => (
                    <span key={tag} className="rounded-full bg-gray-100 px-3 py-1">
                      #{tag}
                    </span>
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Practice Count</p>
                    <p className="text-lg font-semibold">
                      {selectedQuestion.practiceCount}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Last Practiced</p>
                    <p className="text-lg font-semibold">
                      {selectedQuestion.lastPracticed
                        ? formatDate(selectedQuestion.lastPracticed)
                        : "Never"}
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Confidence (1-5)</label>
                  <input
                    type="number"
                    min={1}
                    max={5}
                    value={practiceConfidence}
                    onChange={(event) =>
                      setPracticeConfidence(Number(event.target.value))
                    }
                    className="w-24 rounded-md border border-gray-300 px-3 py-2"
                  />
                </div>

                {errorMessage && (
                  <p className="text-sm text-red-600">{errorMessage}</p>
                )}

                <Button onClick={handlePractice} disabled={practiceLoading}>
                  {practiceLoading ? "Saving..." : "Mark Practiced"}
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="py-12 text-center text-sm text-muted-foreground">
                Select a question to view details.
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
