import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import type { ResumeStats } from "@/types/resume"

interface StatsGridProps {
  stats: ResumeStats
}

export function ResumeStatsGrid({ stats }: StatsGridProps) {
  const metrics = [
    {
      label: "Total Resumes",
      value: stats.totalResumes,
      description: "All resumes in your library",
    },
    {
      label: "Master Templates",
      value: stats.masterResumes,
      description: "Base resumes ready to tailor",
    },
    {
      label: "Tailored Versions",
      value: stats.tailoredResumes,
      description: "Company-specific versions",
    },
    {
      label: "Active",
      value: stats.activeResumes,
      description: "Marked as ready to use",
    },
    {
      label: "Avg. Success Rate",
      value: `${stats.averageSuccessRate.toFixed(1)}%`,
      description: "Interview rate across resumes",
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
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

      <Card className="md:col-span-2 lg:col-span-1">
        <CardHeader className="pb-2">
          <CardDescription>Most Used Resume</CardDescription>
          <CardTitle className="text-xl">
            {stats.mostUsedResume || "No data yet"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            {stats.totalApplications} tracked applications
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

