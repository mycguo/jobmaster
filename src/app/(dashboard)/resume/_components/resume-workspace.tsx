"use client"

import { useEffect, useMemo, useState } from "react"
import type { ResumeRecord } from "@/types/resume"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { cn, formatDate, getDaysSince } from "@/lib/utils"

interface ResumeWorkspaceProps {
  resumes: ResumeRecord[]
}

type FilterOption = "all" | "master" | "tailored" | "active"

export function ResumeWorkspace({ resumes }: ResumeWorkspaceProps) {
  const [filter, setFilter] = useState<FilterOption>("all")
  const [search, setSearch] = useState("")
  const [selectedId, setSelectedId] = useState<string | null>(
    resumes[0]?.id || null
  )
  const [copied, setCopied] = useState(false)

  const filteredResumes = useMemo(() => {
    return resumes
      .filter((resume) => {
        if (filter === "master") return resume.isMaster
        if (filter === "tailored") return !resume.isMaster
        if (filter === "active") return resume.isActive
        return true
      })
      .filter((resume) => {
        if (!search.trim()) return true
        const term = search.toLowerCase()
        return (
          resume.name.toLowerCase().includes(term) ||
          (resume.tailoredForCompany || "")
            .toLowerCase()
            .includes(term)
        )
      })
  }, [resumes, filter, search])

  const selected = useMemo(() => {
    if (!selectedId) return null
    return resumes.find((resume) => resume.id === selectedId) || null
  }, [resumes, selectedId])

  useEffect(() => {
    if (filteredResumes.length === 0) {
      setSelectedId(null)
      return
    }

    const existsInFilter = filteredResumes.some(
      (resume) => resume.id === selectedId
    )
    if (!existsInFilter) {
      setSelectedId(filteredResumes[0].id)
    }
  }, [filteredResumes, selectedId])

  useEffect(() => {
    if (!copied) return
    const timer = setTimeout(() => setCopied(false), 2000)
    return () => clearTimeout(timer)
  }, [copied])

  const handleCopy = async () => {
    if (!selected?.fullText) return
    try {
      await navigator.clipboard.writeText(selected.fullText)
      setCopied(true)
    } catch (error) {
      console.error("Failed to copy resume", error)
    }
  }

  const handleDownload = () => {
    if (!selected?.fullText) return
    const blob = new Blob([selected.fullText], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    const safeName = selected.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
    link.href = url
    link.download = `${safeName || "resume"}.txt`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap gap-2">
          {FILTER_OPTIONS.map((option) => (
            <button
              key={option.value}
              onClick={() => setFilter(option.value)}
              className={cn(
                "rounded-full border px-4 py-1 text-sm",
                filter === option.value
                  ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                  : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
              )}
            >
              {option.label}
            </button>
          ))}
        </div>

        <input
          type="search"
          placeholder="Search by name or company"
          className="w-full lg:w-64 rounded-md border border-gray-200 px-3 py-2"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[320px,1fr]">
        <aside className="space-y-3">
          {filteredResumes.length === 0 && (
            <Card>
              <CardContent className="py-6">
                <p className="text-sm text-muted-foreground">
                  No resumes match the selected filters.
                </p>
              </CardContent>
            </Card>
          )}

          {filteredResumes.map((resume) => (
            <button
              key={resume.id}
              onClick={() => setSelectedId(resume.id)}
              className={cn(
                "w-full rounded-lg border p-4 text-left transition",
                "hover:border-indigo-400 hover:shadow-sm",
                selectedId === resume.id
                  ? "border-indigo-500 bg-indigo-50"
                  : "border-gray-200 bg-white"
              )}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-semibold">
                    {getResumeEmoji(resume)} {resume.name}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {resume.isMaster
                      ? "Master Template"
                      : `Tailored${resume.tailoredForCompany ? ` • ${resume.tailoredForCompany}` : ""}`}
                  </p>
                </div>
                {resume.isActive && (
                  <span className="rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700">
                    Active
                  </span>
                )}
              </div>
              <div className="mt-2 flex flex-wrap gap-3 text-xs text-gray-600">
                <span>v{resume.version}</span>
                <span>
                  {resume.applicationsCount} application
                  {resume.applicationsCount === 1 ? "" : "s"}
                </span>
                <span>Success {resume.successRate?.toFixed(0) || 0}%</span>
                <span>{formatDate(resume.createdAt)}</span>
              </div>
            </button>
          ))}
        </aside>

        <section>
          {!selected && (
            <Card>
              <CardContent className="py-10">
                <p className="text-center text-muted-foreground">
                  Select a resume to view details
                </p>
              </CardContent>
            </Card>
          )}

          {selected && (
            <Card>
              <CardHeader>
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div>
                    <CardDescription>
                      {selected.isMaster ? "Master Template" : "Tailored Resume"}
                    </CardDescription>
                    <CardTitle className="text-3xl">
                      {getResumeEmoji(selected)} {selected.name}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Version {selected.version} • Created {formatDate(selected.createdAt)}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {selected.isActive ? (
                      <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                        Active
                      </span>
                    ) : (
                      <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600">
                        Inactive
                      </span>
                    )}
                    {!selected.isMaster && selected.tailoredForCompany && (
                      <span className="rounded-full bg-indigo-100 px-3 py-1 text-xs font-semibold text-indigo-700">
                        Tailored for {selected.tailoredForCompany}
                      </span>
                    )}
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-8">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                  <Metric label="Applications" value={selected.applicationsCount} />
                  <Metric
                    label="Success Rate"
                    value={`${selected.successRate?.toFixed(1) || 0}%`}
                  />
                  <Metric
                    label="Last Used"
                    value={
                      selected.lastUsed
                        ? `${formatDate(selected.lastUsed)} (${getDaysSince(selected.lastUsed)}d ago)`
                        : "Never"
                    }
                  />
                  <Metric
                    label="Age"
                    value={`${getDaysSince(selected.createdAt)} days`}
                  />
                </div>

                {selected.skills?.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
                      Detected Skills
                    </h3>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {selected.skills.map((skill) => (
                        <span
                          key={skill}
                          className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {!selected.isMaster && (
                  <div>
                    <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
                      Tailoring Notes
                    </h3>
                    <p className="mt-2 text-sm text-gray-700">
                      {selected.tailoringNotes || "No notes recorded"}
                    </p>
                  </div>
                )}

                <div className="flex flex-wrap gap-3">
                  <Button onClick={handleCopy} variant="outline">
                    {copied ? "Copied!" : "Copy Text"}
                  </Button>
                  <Button onClick={handleDownload}>Download .txt</Button>
                  <Button asChild variant="ghost">
                    <a href="#tailor-resume">Tailor This Resume</a>
                  </Button>
                </div>

                <div>
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
                    Full Content
                  </h3>
                  <pre className="mt-3 max-h-[480px] overflow-y-auto whitespace-pre-wrap rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm">
                    {selected.fullText || "No content available"}
                  </pre>
                </div>
              </CardContent>
            </Card>
          )}
        </section>
      </div>
    </div>
  )
}

const FILTER_OPTIONS: { label: string; value: FilterOption }[] = [
  { label: "All", value: "all" },
  { label: "Master", value: "master" },
  { label: "Tailored", value: "tailored" },
  { label: "Active", value: "active" },
]

function Metric({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-md border border-gray-100 bg-gray-50 p-4">
      <p className="text-xs font-medium uppercase text-gray-500">{label}</p>
      <p className="mt-1 text-lg font-semibold text-gray-900">{value}</p>
    </div>
  )
}

function getResumeEmoji(resume: ResumeRecord): string {
  if (!resume.isActive) return "⚫"
  if (resume.isMaster) return "⭐"
  if (resume.tailoredForCompany) return "🎯"
  return "📄"
}

