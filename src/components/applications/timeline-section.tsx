/**
 * Timeline section component with add event functionality
 */

"use client"

import { useState } from "react"
import type { Application } from "@/types/application"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import Link from "next/link"

interface TimelineSectionProps {
  application: Application
}

export function TimelineSection({ application }: TimelineSectionProps) {
  const router = useRouter()
  const [isAdding, setIsAdding] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [formData, setFormData] = useState({
    eventType: "interview",
    date: new Date().toISOString().split("T")[0],
    time: "",
    interviewer: "",
    notes: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Format notes with time and interviewer
      let notes = ""
      if (formData.time) {
        // Convert 24-hour time to 12-hour format with AM/PM
        const [hours, minutes] = formData.time.split(':')
        const hour = parseInt(hours)
        const ampm = hour >= 12 ? 'PM' : 'AM'
        const hour12 = hour % 12 || 12
        const formattedTime = `${hour12}:${minutes} ${ampm}`
        notes += `Time: ${formattedTime}\n`
      }
      if (formData.interviewer) {
        notes += `Interviewer: ${formData.interviewer}\n`
      }
      if (formData.notes) {
        notes += formData.notes
      }

      const response = await fetch(`/api/applications/${application.id}/events`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventType: formData.eventType,
          date: formData.date,
          notes: notes.trim() || undefined,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to add event")
      }

      // Reset form and show success message
      setFormData({
        eventType: "interview",
        date: new Date().toISOString().split("T")[0],
        time: "",
        interviewer: "",
        notes: "",
      })
      setIsAdding(false)
      setShowSuccess(true)

      // Refresh the page to show new event
      router.refresh()

      // Hide success message after 5 seconds
      setTimeout(() => setShowSuccess(false), 5000)
    } catch (error) {
      console.error("Error adding event:", error)
      alert("Failed to add event. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>📅 Timeline</CardTitle>
            <CardDescription>Application history and events</CardDescription>
          </div>
          <Button
            onClick={() => setIsAdding(!isAdding)}
            variant={isAdding ? "outline" : "default"}
          >
            {isAdding ? "Cancel" : "+ Add Event"}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Success Message */}
        {showSuccess && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-green-800 font-medium">✅ Event added successfully!</p>
                <p className="text-sm text-green-700 mt-1">
                  View all your interviews on the{" "}
                  <Link href="/interviews" className="underline font-medium hover:text-green-900">
                    Interview Schedule
                  </Link>{" "}
                  page.
                </p>
              </div>
              <button
                onClick={() => setShowSuccess(false)}
                className="text-green-600 hover:text-green-800"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {/* Add Event Form */}
        {isAdding && (
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="pt-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Event Type *
                    </label>
                    <select
                      value={formData.eventType}
                      onChange={(e) =>
                        setFormData({ ...formData, eventType: e.target.value })
                      }
                      className="w-full px-3 py-2 border rounded-md"
                      required
                    >
                      <option value="interview">Interview</option>
                      <option value="screening">Screening</option>
                      <option value="technical">Technical Interview</option>
                      <option value="behavioral">Behavioral Interview</option>
                      <option value="onsite">Onsite Interview</option>
                      <option value="phone">Phone Screen</option>
                      <option value="video">Video Interview</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Date *
                    </label>
                    <input
                      type="date"
                      value={formData.date}
                      onChange={(e) =>
                        setFormData({ ...formData, date: e.target.value })
                      }
                      className="w-full px-3 py-2 border rounded-md"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Time (Optional)
                    </label>
                    <input
                      type="time"
                      value={formData.time}
                      onChange={(e) =>
                        setFormData({ ...formData, time: e.target.value })
                      }
                      className="w-full px-3 py-2 border rounded-md"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Interviewer (Optional)
                    </label>
                    <input
                      type="text"
                      value={formData.interviewer}
                      onChange={(e) =>
                        setFormData({ ...formData, interviewer: e.target.value })
                      }
                      placeholder="e.g., John Smith"
                      className="w-full px-3 py-2 border rounded-md"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Additional Notes (Optional)
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) =>
                      setFormData({ ...formData, notes: e.target.value })
                    }
                    placeholder="Any additional details about the interview..."
                    className="w-full px-3 py-2 border rounded-md"
                    rows={3}
                  />
                </div>

                <div className="flex gap-2">
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Adding..." : "Add Event"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsAdding(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Timeline Events */}
        <div className="space-y-4">
          {application.timeline.length === 0 ? (
            <p className="text-gray-500 text-center py-4">
              No events yet. Add your first event above!
            </p>
          ) : (
            application.timeline.map((event, idx) => (
              <div key={idx} className="flex items-start space-x-4 pb-4 border-b last:border-b-0">
                <div className="text-sm text-gray-600 w-28 flex-shrink-0">
                  {event.date}
                </div>
                <div className="flex-1">
                  <div className="font-medium capitalize">{event.eventType}</div>
                  {event.notes && (
                    <p className="text-sm text-gray-600 whitespace-pre-wrap mt-1">
                      {event.notes}
                    </p>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}
