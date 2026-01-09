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
}

export function QuestionStats({ stats }: QuestionStatsProps) {
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
      {metrics.map((metric) => (
        <Card key={metric.label}>
          <CardHeader className="pb-2">
            <CardDescription>{metric.label}</CardDescription>
            <CardTitle className="text-3xl">{metric.value}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">{metric.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
