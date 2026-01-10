/**
 * Contact section with add/edit functionality
 */

"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import type { ContactLink } from "@/types/application"

interface ContactSectionProps {
  applicationId: string
  title: string
  icon: string
  contact?: ContactLink
  contactType: "recruiter" | "hiringManager"
}

export function ContactSection({
  applicationId,
  title,
  icon,
  contact,
  contactType,
}: ContactSectionProps) {
  const router = useRouter()
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [formData, setFormData] = useState({
    name: contact?.name || "",
    email: contact?.email || "",
    url: contact?.url || "",
    notes: contact?.notes || "",
  })

  const hasContact =
    contact?.name || contact?.email || contact?.url || contact?.notes

  const handleSave = async () => {
    setIsSaving(true)

    try {
      // Build the contact object
      const contactData =
        formData.name || formData.email || formData.url || formData.notes
          ? {
              name: formData.name || undefined,
              email: formData.email || undefined,
              url: formData.url || undefined,
              notes: formData.notes || undefined,
            }
          : undefined

      const updatePayload =
        contactType === "recruiter"
          ? { recruiterContact: contactData }
          : { hiringManagerContact: contactData }

      const response = await fetch(`/api/applications/${applicationId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatePayload),
      })

      if (!response.ok) {
        throw new Error("Failed to update contact")
      }

      setIsEditing(false)
      router.refresh()
    } catch (error) {
      console.error("Error updating contact:", error)
      alert("Failed to update contact. Please try again.")
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    // Reset form to original values
    setFormData({
      name: contact?.name || "",
      email: contact?.email || "",
      url: contact?.url || "",
      notes: contact?.notes || "",
    })
    setIsEditing(false)
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>
            {icon} {title}
          </CardTitle>
          {!isEditing && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsEditing(true)}
            >
              {hasContact ? "✏️ Edit" : "+ Add"}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {isEditing ? (
          // Edit form
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium mb-1">Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="e.g., Jane Smith"
                className="w-full px-3 py-2 border rounded-md text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                placeholder="contact@company.com"
                className="w-full px-3 py-2 border rounded-md text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                LinkedIn URL
              </label>
              <input
                type="url"
                value={formData.url}
                onChange={(e) =>
                  setFormData({ ...formData, url: e.target.value })
                }
                placeholder="https://linkedin.com/in/..."
                className="w-full px-3 py-2 border rounded-md text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Notes</label>
              <textarea
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
                placeholder="Additional notes..."
                className="w-full px-3 py-2 border rounded-md text-sm"
                rows={3}
              />
            </div>

            <div className="flex gap-2 pt-2">
              <Button size="sm" onClick={handleSave} disabled={isSaving}>
                {isSaving ? "Saving..." : "Save"}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={handleCancel}
                disabled={isSaving}
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : hasContact ? (
          // Display contact info
          <div className="space-y-2">
            {contact?.name && (
              <div>
                <span className="font-medium">Name:</span> {contact.name}
              </div>
            )}
            {contact?.email && (
              <div>
                <span className="font-medium">Email:</span>{" "}
                <a
                  href={`mailto:${contact.email}`}
                  className="text-blue-600 hover:underline"
                >
                  {contact.email}
                </a>
              </div>
            )}
            {contact?.url && (
              <div>
                <span className="font-medium">LinkedIn:</span>{" "}
                <a
                  href={contact.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  View Profile →
                </a>
              </div>
            )}
            {contact?.notes && (
              <div>
                <span className="font-medium">Notes:</span>
                <p className="text-sm text-gray-600 mt-1 whitespace-pre-wrap">
                  {contact.notes}
                </p>
              </div>
            )}
          </div>
        ) : (
          // No contact info
          <p className="text-gray-500 text-sm">No contact information</p>
        )}
      </CardContent>
    </Card>
  )
}
