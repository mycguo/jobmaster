"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

const QUESTION_TYPES = [
  { value: "behavioral", label: "Behavioral" },
  { value: "technical", label: "Technical" },
  { value: "system-design", label: "System Design" },
  { value: "case-study", label: "Case Study" },
]

const DIFFICULTIES = [
  { value: "easy", label: "Easy" },
  { value: "medium", label: "Medium" },
  { value: "hard", label: "Hard" },
]

export function AddQuestionForm() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setLoading(true)
    setSuccessMessage(null)
    setErrorMessage(null)

    const formData = new FormData(event.currentTarget)
    const tags = (formData.get("tags") as string)
      ?.split(",")
      .map((tag) => tag.trim())
      .filter(Boolean)
    const companies = (formData.get("companies") as string)
      ?.split(",")
      .map((company) => company.trim())
      .filter(Boolean)

    const payload = {
      question: formData.get("question"),
      category: formData.get("category"),
      type: formData.get("type"),
      difficulty: formData.get("difficulty"),
      answerFull: formData.get("answerFull"),
      notes: formData.get("notes") || undefined,
      tags,
      companies,
      confidenceLevel: Number(formData.get("confidenceLevel")) || 3,
      importance: Number(formData.get("importance")) || 5,
    }

    try {
      const response = await fetch("/api/interview-questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        throw new Error(data.error || "Failed to save question")
      }

      event.currentTarget.reset()
      setSuccessMessage("Question added to your bank! 🎉")
      router.refresh()
    } catch (error: any) {
      setErrorMessage(error.message || "Failed to add question")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>➕ Add Interview Question</CardTitle>
        <CardDescription>
          Capture behavioral stories, technical prompts, or system design scenarios in one place.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Question *</label>
            <textarea
              name="question"
              required
              rows={3}
              className="w-full rounded-md border border-gray-300 px-3 py-2"
              placeholder="Describe the interview question..."
            />
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div>
              <label className="text-sm font-medium">Type *</label>
              <select
                name="type"
                required
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
                defaultValue="behavioral"
              >
                {QUESTION_TYPES.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-medium">Category *</label>
              <input
                name="category"
                required
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
                placeholder="e.g., Leadership, Algorithms"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Difficulty *</label>
              <select
                name="difficulty"
                required
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
                defaultValue="medium"
              >
                {DIFFICULTIES.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Model Answer *</label>
            <textarea
              name="answerFull"
              required
              rows={6}
              className="w-full rounded-md border border-gray-300 px-3 py-2"
              placeholder="Write the story or step-by-step answer you'll deliver."
            />
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm font-medium">Tags</label>
              <input
                name="tags"
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
                placeholder="leadership, metrics, debugging"
              />
              <p className="mt-1 text-xs text-muted-foreground">
                Separate with commas to group similar questions.
              </p>
            </div>

            <div>
              <label className="text-sm font-medium">Companies</label>
              <input
                name="companies"
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
                placeholder="Amazon, Stripe"
              />
              <p className="mt-1 text-xs text-muted-foreground">
                Helps filter by company-specific prep.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm font-medium">Confidence (1-5)</label>
              <input
                name="confidenceLevel"
                type="number"
                min={1}
                max={5}
                defaultValue={3}
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Importance (1-10)</label>
              <input
                name="importance"
                type="number"
                min={1}
                max={10}
                defaultValue={5}
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Notes</label>
            <textarea
              name="notes"
              rows={3}
              className="w-full rounded-md border border-gray-300 px-3 py-2"
              placeholder="Context, interviewer reactions, or reminders."
            />
          </div>

          {successMessage && (
            <p className="text-sm text-green-600">{successMessage}</p>
          )}
          {errorMessage && (
            <p className="text-sm text-red-600">{errorMessage}</p>
          )}

          <Button type="submit" disabled={loading}>
            {loading ? "Saving..." : "Save Question"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

