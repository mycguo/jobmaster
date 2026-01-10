/**
 * AI Analysis button component
 */

"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"

interface AnalyzeButtonProps {
  applicationId: string
  hasExistingScore?: boolean
}

interface AnalysisResult {
  matchScore: number
  analysis: {
    strengths: string[]
    gaps: string[]
    recommendations: string[]
  }
}

export function AnalyzeButton({ applicationId, hasExistingScore = false }: AnalyzeButtonProps) {
  const router = useRouter()
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleAnalyze = async () => {
    setIsAnalyzing(true)
    setError(null)
    setResult(null)

    try {
      const response = await fetch(`/api/applications/${applicationId}/analyze`, {
        method: "POST",
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to analyze application")
      }

      setResult(data)

      // Refresh the page to show new match score
      setTimeout(() => {
        router.refresh()
      }, 2000)
    } catch (error: any) {
      console.error("Error analyzing application:", error)
      setError(error.message || "Failed to analyze application")
    } finally {
      setIsAnalyzing(false)
    }
  }

  return (
    <div className="space-y-4">
      {!result && !error && (
        <Button
          onClick={handleAnalyze}
          disabled={isAnalyzing}
          variant={hasExistingScore ? "outline" : "default"}
          size={hasExistingScore ? "sm" : "default"}
        >
          {isAnalyzing
            ? "Analyzing..."
            : hasExistingScore
              ? "🔄 Re-analyze"
              : "Run AI Analysis"}
        </Button>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800 font-medium">❌ Analysis Failed</p>
          <p className="text-sm text-red-700 mt-1">{error}</p>
          <Button
            variant="outline"
            size="sm"
            onClick={handleAnalyze}
            className="mt-3"
          >
            Try Again
          </Button>
        </div>
      )}

      {result && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 space-y-3">
          <div>
            <p className="text-green-800 font-medium">
              ✅ Analysis Complete!
            </p>
            <p className="text-sm text-green-700 mt-1">
              Match Score: {Math.round(result.matchScore * 100)}%
            </p>
          </div>

          {result.analysis.strengths.length > 0 && (
            <div>
              <p className="font-medium text-sm text-gray-900 mb-1">
                💪 Key Strengths:
              </p>
              <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                {result.analysis.strengths.map((strength, idx) => (
                  <li key={idx}>{strength}</li>
                ))}
              </ul>
            </div>
          )}

          {result.analysis.gaps.length > 0 && (
            <div>
              <p className="font-medium text-sm text-gray-900 mb-1">
                ⚠️ Gaps to Address:
              </p>
              <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                {result.analysis.gaps.map((gap, idx) => (
                  <li key={idx}>{gap}</li>
                ))}
              </ul>
            </div>
          )}

          {result.analysis.recommendations.length > 0 && (
            <div>
              <p className="font-medium text-sm text-gray-900 mb-1">
                💡 Recommendations:
              </p>
              <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                {result.analysis.recommendations.map((rec, idx) => (
                  <li key={idx}>{rec}</li>
                ))}
              </ul>
            </div>
          )}

          <p className="text-xs text-gray-600 mt-3">
            Page will refresh shortly to show your match score...
          </p>
        </div>
      )}
    </div>
  )
}
