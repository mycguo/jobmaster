/**
 * Interview schedule page (placeholder)
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function InterviewsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">📅 Interview Schedule</h1>
      <Card>
        <CardHeader>
          <CardTitle>Coming Soon</CardTitle>
          <CardDescription>Interview scheduling features will be available soon</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">Features to be implemented:</p>
          <ul className="list-disc list-inside mt-2 space-y-1 text-gray-600">
            <li>Calendar view of interviews</li>
            <li>Interview reminders</li>
            <li>Preparation checklists</li>
            <li>Interview notes</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}

