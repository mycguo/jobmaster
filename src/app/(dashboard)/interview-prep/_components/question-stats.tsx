import Link from "next/link"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import type { InterviewQuestionStats } from "@/types/interview"

interface QuestionStatsProps {
  stats: InterviewQuestionStats
  basePath: string
}

const FILTER_MAP: Record<string, string | null> = {
  "Total Questions": null,
  Behavioral: "behavioral",
  Technical: "technical",
  "System Design": "system-design",
}

export function QuestionStats({ stats, basePath }: QuestionStatsProps) {
  const metrics = [
    {
      label: "Total Questions",
      value: stats.totalQuestions,
      description: "Saved in your question bank",
    },
    {
      label: "Behavioral",
      value: stats.behavioralCount,
      description: "Stories & leadership",
    },
    {
      label: "Technical",
      value: stats.technicalCount,
      description: "Coding & problem solving",
    },
    {
      label: "System Design",
      value: stats.systemDesignCount,
      description: "Architecture + scalability",
    },
  ]

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
      {metrics.map((metric) => {
        const filterValue = FILTER_MAP[metric.label]
        const href = {
          pathname: basePath,
          query: filterValue ? { type: filterValue } : {},
        }

        return (
          <Link
            key={metric.label}
            href={{ ...href, hash: "question-workspace" }}
            scroll
            className="block"
          >
            <Card className="h-full cursor-pointer transition hover:border-indigo-400 hover:shadow-md">
              <CardHeader className="pb-2">
                <CardDescription>{metric.label}</CardDescription>
                <CardTitle className="text-3xl">{metric.value}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{metric.description}</p>
              </CardContent>
            </Card>
          </Link>
        )
      })}
    </div>
  )
}
