/**
 * Interview prep page (placeholder)
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function InterviewPrepPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">🎯 Interview Preparation</h1>
      <Card>
        <CardHeader>
          <CardTitle>Coming Soon</CardTitle>
          <CardDescription>Interview preparation features will be available soon</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">Features to be implemented:</p>
          <ul className="list-disc list-inside mt-2 space-y-1 text-gray-600">
            <li>Interview question bank</li>
            <li>Practice sessions</li>
            <li>Technical concepts library</li>
            <li>Company research notes</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}

