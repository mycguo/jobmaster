/**
 * New application form page
 */

"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function NewApplicationPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const data = {
      company: formData.get("company"),
      role: formData.get("role"),
      status: formData.get("status") || "tracking",
      appliedDate: formData.get("appliedDate"),
      location: formData.get("location"),
      salaryRange: formData.get("salaryRange"),
      jobUrl: formData.get("jobUrl"),
      jobDescription: formData.get("jobDescription"),
      notes: formData.get("notes"),
    }

    try {
      const res = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      if (res.ok) {
        router.push("/applications")
      } else {
        alert("Failed to create application")
      }
    } catch (error) {
      alert("Error creating application")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>➕ Add New Application</CardTitle>
          <CardDescription>
            Track a new job application or opportunity
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Company *
                </label>
                <input
                  name="company"
                  type="text"
                  required
                  className="w-full px-3 py-2 border rounded-md"
                  placeholder="e.g., Google"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Role *
                </label>
                <input
                  name="role"
                  type="text"
                  required
                  className="w-full px-3 py-2 border rounded-md"
                  placeholder="e.g., Senior Software Engineer"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Status</label>
                <select
                  name="status"
                  className="w-full px-3 py-2 border rounded-md"
                >
                  <option value="tracking">Tracking</option>
                  <option value="applied">Applied</option>
                  <option value="screening">Screening</option>
                  <option value="interview">Interview</option>
                  <option value="offer">Offer</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Applied Date
                </label>
                <input
                  name="appliedDate"
                  type="date"
                  defaultValue={new Date().toISOString().split("T")[0]}
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Location
                </label>
                <input
                  name="location"
                  type="text"
                  className="w-full px-3 py-2 border rounded-md"
                  placeholder="e.g., Remote or San Francisco, CA"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Salary Range
                </label>
                <input
                  name="salaryRange"
                  type="text"
                  className="w-full px-3 py-2 border rounded-md"
                  placeholder="e.g., $150k-$200k"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Job URL</label>
              <input
                name="jobUrl"
                type="url"
                className="w-full px-3 py-2 border rounded-md"
                placeholder="https://..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Job Description
              </label>
              <textarea
                name="jobDescription"
                rows={6}
                className="w-full px-3 py-2 border rounded-md"
                placeholder="Paste the job description here..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Notes</label>
              <textarea
                name="notes"
                rows={3}
                className="w-full px-3 py-2 border rounded-md"
                placeholder="Any additional notes..."
              />
            </div>

            <div className="flex gap-4">
              <Button type="submit" disabled={loading}>
                {loading ? "Creating..." : "Create Application"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

