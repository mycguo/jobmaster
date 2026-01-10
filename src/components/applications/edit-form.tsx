/**
 * Application edit form component
 */

"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import type { Application, ApplicationStatus } from "@/types/application"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { STATUS_DISPLAY } from "@/types/application"

interface EditFormProps {
  application: Application
}

export function EditForm({ application }: EditFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    company: application.company,
    role: application.role,
    status: application.status,
    appliedDate: application.appliedDate,
    location: application.location || "",
    salaryRange: application.salaryRange || "",
    jobUrl: application.jobUrl || "",
    jobDescription: application.jobDescription || "",
    notes: application.notes || "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await fetch(`/api/applications/${application.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          company: formData.company,
          role: formData.role,
          status: formData.status,
          appliedDate: formData.appliedDate,
          location: formData.location || undefined,
          salaryRange: formData.salaryRange || undefined,
          jobUrl: formData.jobUrl || undefined,
          jobDescription: formData.jobDescription || undefined,
          notes: formData.notes || undefined,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to update application")
      }

      // Redirect back to detail page
      router.push(`/applications/${application.id}`)
      router.refresh()
    } catch (error) {
      console.error("Error updating application:", error)
      alert("Failed to update application. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const statusOptions: ApplicationStatus[] = [
    "tracking",
    "applied",
    "screening",
    "interview",
    "offer",
    "accepted",
    "rejected",
    "withdrawn",
  ]

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>📋 Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Company *
              </label>
              <input
                type="text"
                value={formData.company}
                onChange={(e) =>
                  setFormData({ ...formData, company: e.target.value })
                }
                className="w-full px-3 py-2 border rounded-md"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Role *
              </label>
              <input
                type="text"
                value={formData.role}
                onChange={(e) =>
                  setFormData({ ...formData, role: e.target.value })
                }
                className="w-full px-3 py-2 border rounded-md"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Status *
              </label>
              <select
                value={formData.status}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    status: e.target.value as ApplicationStatus,
                  })
                }
                className="w-full px-3 py-2 border rounded-md"
                required
              >
                {statusOptions.map((status) => (
                  <option key={status} value={status}>
                    {STATUS_DISPLAY[status]}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Applied Date *
              </label>
              <input
                type="date"
                value={formData.appliedDate}
                onChange={(e) =>
                  setFormData({ ...formData, appliedDate: e.target.value })
                }
                className="w-full px-3 py-2 border rounded-md"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Location
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) =>
                  setFormData({ ...formData, location: e.target.value })
                }
                placeholder="e.g., San Francisco, CA"
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Salary Range
              </label>
              <input
                type="text"
                value={formData.salaryRange}
                onChange={(e) =>
                  setFormData({ ...formData, salaryRange: e.target.value })
                }
                placeholder="e.g., $100k - $150k"
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Job URL
            </label>
            <input
              type="url"
              value={formData.jobUrl}
              onChange={(e) =>
                setFormData({ ...formData, jobUrl: e.target.value })
              }
              placeholder="https://..."
              className="w-full px-3 py-2 border rounded-md"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>📝 Job Description</CardTitle>
        </CardHeader>
        <CardContent>
          <textarea
            value={formData.jobDescription}
            onChange={(e) =>
              setFormData({ ...formData, jobDescription: e.target.value })
            }
            placeholder="Paste the job description here..."
            className="w-full px-3 py-2 border rounded-md"
            rows={10}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>📝 Notes</CardTitle>
        </CardHeader>
        <CardContent>
          <textarea
            value={formData.notes}
            onChange={(e) =>
              setFormData({ ...formData, notes: e.target.value })
            }
            placeholder="Add any notes about this application..."
            className="w-full px-3 py-2 border rounded-md"
            rows={5}
          />
        </CardContent>
      </Card>

      <div className="flex gap-4">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : "💾 Save Changes"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push(`/applications/${application.id}`)}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
      </div>
    </form>
  )
}
