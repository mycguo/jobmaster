/**
 * Delete application button with confirmation
 */

"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"

interface DeleteButtonProps {
  applicationId: string
  companyName: string
}

export function DeleteButton({ applicationId, companyName }: DeleteButtonProps) {
  const router = useRouter()
  const [isDeleting, setIsDeleting] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const handleDelete = async () => {
    setIsDeleting(true)

    try {
      const response = await fetch(`/api/applications/${applicationId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete application")
      }

      // Redirect to applications list
      router.push("/applications")
      router.refresh()
    } catch (error) {
      console.error("Error deleting application:", error)
      alert("Failed to delete application. Please try again.")
      setIsDeleting(false)
      setShowConfirm(false)
    }
  }

  if (showConfirm) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-md mx-4 shadow-xl">
          <h3 className="text-lg font-bold mb-2">Delete Application</h3>
          <p className="text-gray-600 mb-6">
            Are you sure you want to delete the application for{" "}
            <strong>{companyName}</strong>? This action cannot be undone.
          </p>
          <div className="flex gap-3 justify-end">
            <Button
              variant="outline"
              onClick={() => setShowConfirm(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <Button variant="outline" onClick={() => setShowConfirm(true)}>
      🗑️ Delete
    </Button>
  )
}
