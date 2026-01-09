"use client"

import { useRouter } from "next/navigation"
import { useId, useRef, useState } from "react"
import type { ResumeRecord } from "@/types/resume"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface ResumeFormsProps {
  masterResumes: ResumeRecord[]
}

export function ResumeForms({ masterResumes }: ResumeFormsProps) {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const fileInputId = useId()

  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [fileName, setFileName] = useState("")
  const [fileIsMaster, setFileIsMaster] = useState(true)
  const [fileCompany, setFileCompany] = useState("")
  const [fileNotes, setFileNotes] = useState("")
  const [fileUploadMessage, setFileUploadMessage] = useState<string | null>(null)
  const [fileUploadError, setFileUploadError] = useState<string | null>(null)
  const [fileUploadLoading, setFileUploadLoading] = useState(false)

  const [textUploadMessage, setTextUploadMessage] = useState<string | null>(null)
  const [textUploadError, setTextUploadError] = useState<string | null>(null)
  const [textUploadLoading, setTextUploadLoading] = useState(false)

  const [tailorLoading, setTailorLoading] = useState(false)
  const [tailorError, setTailorError] = useState<string | null>(null)
  const [tailorResult, setTailorResult] = useState<{
    text: string
    insights: string
    name: string
  } | null>(null)

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      setFileName((prev) => prev || file.name.replace(/\.[^.]+$/, ""))
    }
  }

  const clearSelectedFile = () => {
    setSelectedFile(null)
    setFileName("")
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleFileUpload = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setFileUploadMessage(null)
    setFileUploadError(null)

    if (!selectedFile) {
      setFileUploadError("Please select a resume file to upload")
      return
    }

    if (!fileName.trim()) {
      setFileUploadError("Resume name is required")
      return
    }

    setFileUploadLoading(true)

    try {
      const formData = new FormData()
      formData.append("file", selectedFile)
      formData.set("name", fileName.trim())
      formData.set("isMaster", String(fileIsMaster))
      if (fileCompany.trim()) {
        formData.set("company", fileCompany.trim())
      }
      if (fileNotes.trim()) {
        formData.set("notes", fileNotes.trim())
      }

      const response = await fetch("/api/resumes/upload", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        const data = await parseResponse(response)
        throw new Error(data.error || "Failed to upload resume")
      }

      clearSelectedFile()
      setFileCompany("")
      setFileNotes("")
      setFileUploadMessage("Resume uploaded successfully! Refreshing list...")
      router.refresh()
    } catch (error: any) {
      setFileUploadError(error.message || "Failed to upload resume")
    } finally {
      setFileUploadLoading(false)
    }
  }

  const handleTextUpload = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setTextUploadMessage(null)
    setTextUploadError(null)
    setTextUploadLoading(true)

    const form = event.currentTarget
    const formData = new FormData(form)
    const name = (formData.get("resumeName") as string)?.trim()
    const text = (formData.get("resumeText") as string)?.trim()
    if (!name || !text) {
      setTextUploadError("Please provide both a name and resume content")
      setTextUploadLoading(false)
      return
    }

    const payload = {
      name,
      fullText: text,
      isMaster: formData.get("isMaster") === "on",
      tailoredForCompany: (formData.get("company") as string)?.trim() || undefined,
      tailoringNotes: (formData.get("notes") as string)?.trim() || undefined,
    }

    try {
      const response = await fetch("/api/resumes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const data = await parseResponse(response)
        throw new Error(data.error || "Failed to upload resume")
      }

      form.reset()
      setTextUploadMessage("Resume saved! Refreshing list...")
      router.refresh()
    } catch (error: any) {
      setTextUploadError(error.message || "Failed to upload resume")
    } finally {
      setTextUploadLoading(false)
    }
  }

  const handleTailor = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setTailorError(null)
    setTailorResult(null)
    setTailorLoading(true)

    const form = event.currentTarget
    const formData = new FormData(form)
    const resumeId = formData.get("baseResume") as string
    const jobDescription = (formData.get("jobDescription") as string)?.trim()
    const companyName = (formData.get("targetCompany") as string)?.trim()
    const notes = (formData.get("tailorNotes") as string)?.trim()

    if (!resumeId || !jobDescription || !companyName) {
      setTailorError("Please select a master resume, company, and job description")
      setTailorLoading(false)
      return
    }

    try {
      const response = await fetch("/api/resumes/tailor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resumeId,
          jobDescription,
          companyName,
          notes,
        }),
      })

      if (!response.ok) {
        const data = await parseResponse(response)
        throw new Error(data.error || "Failed to tailor resume")
      }

      const data = await response.json()
      form.reset()
      setTailorResult({
        text: data.resume.fullText,
        insights: data.insights,
        name: data.resume.name,
      })

      router.refresh()
    } catch (error: any) {
      setTailorError(error.message || "Failed to tailor resume")
    } finally {
      setTailorLoading(false)
    }
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <Card id="upload-resume">
        <CardHeader>
          <CardTitle>📤 Upload Resume</CardTitle>
          <CardDescription>
            Upload a PDF, DOCX, or TXT resume, or paste the content manually.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          <section>
            <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
              Upload file
            </h3>
            <form onSubmit={handleFileUpload} className="mt-3 space-y-4">
              <input
                id={fileInputId}
                type="file"
                accept=".pdf,.docx,.txt"
                ref={fileInputRef}
                className="hidden"
                onChange={handleFileChange}
              />

              <label
                htmlFor={fileInputId}
                onDragOver={(event) => event.preventDefault()}
                onDrop={(event) => {
                  event.preventDefault()
                  const file = event.dataTransfer.files?.[0]
                  if (file) {
                    setSelectedFile(file)
                    setFileName((prev) => prev || file.name.replace(/\.[^.]+$/, ""))
                  }
                }}
                className={cn(
                  "flex min-h-[140px] cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 text-center transition",
                  selectedFile
                    ? "border-indigo-500 bg-indigo-50"
                    : "border-gray-300 hover:border-indigo-400"
                )}
              >
                {selectedFile ? (
                  <div>
                    <p className="font-medium">{selectedFile.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {(selectedFile.size / 1024).toFixed(1)} KB
                    </p>
                    <button
                      type="button"
                      onClick={clearSelectedFile}
                      className="mt-2 text-xs font-semibold text-indigo-600 hover:underline"
                    >
                      Remove file
                    </button>
                  </div>
                ) : (
                  <div>
                    <p className="font-medium">Drag & drop your resume</p>
                    <p className="text-sm text-muted-foreground">
                      or click to browse (PDF, DOCX, TXT)
                    </p>
                  </div>
                )}
              </label>

              <div>
                <label className="text-sm font-medium">Resume Name *</label>
                <input
                  name="fileName"
                  type="text"
                  value={fileName}
                  onChange={(event) => setFileName(event.target.value)}
                  className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
                  placeholder="e.g., Backend Engineer Master Resume"
                  required
                />
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    name="fileIsMaster"
                    type="checkbox"
                    checked={fileIsMaster}
                    onChange={(event) => setFileIsMaster(event.target.checked)}
                  />
                  Save as master template
                </label>

                <input
                  name="fileCompany"
                  value={fileCompany}
                  onChange={(event) => setFileCompany(event.target.value)}
                  placeholder="Tailored for company (optional)"
                  className="rounded-md border border-gray-300 px-3 py-2"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Notes</label>
                <textarea
                  name="fileNotes"
                  value={fileNotes}
                  onChange={(event) => setFileNotes(event.target.value)}
                  rows={3}
                  className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
                  placeholder="Anything you'd like to remember about this version..."
                />
              </div>

              {fileUploadMessage && (
                <p className="text-sm text-green-600">{fileUploadMessage}</p>
              )}
              {fileUploadError && (
                <p className="text-sm text-red-600">{fileUploadError}</p>
              )}

              <Button type="submit" disabled={fileUploadLoading}>
                {fileUploadLoading ? "Uploading..." : "Upload Resume"}
              </Button>
            </form>
          </section>

          <div className="relative flex items-center justify-center">
            <span className="absolute inset-x-0 h-px bg-gray-200" aria-hidden="true" />
            <span className="relative bg-white px-3 text-xs font-semibold uppercase text-gray-500">
              or
            </span>
          </div>

          <section>
            <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
              Paste resume text
            </h3>
            <form onSubmit={handleTextUpload} className="mt-3 space-y-4">
              <div>
                <label className="text-sm font-medium">Resume Name *</label>
                <input
                  name="resumeName"
                  type="text"
                  className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
                  placeholder="e.g., Software Engineer Master Resume"
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium">Resume Content *</label>
                <textarea
                  name="resumeText"
                  rows={8}
                  className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
                  placeholder="Paste your resume text here..."
                  required
                />
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" name="isMaster" defaultChecked />
                  Save as master template
                </label>

                <input
                  type="text"
                  name="company"
                  placeholder="Tailored for company (optional)"
                  className="rounded-md border border-gray-300 px-3 py-2"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Notes</label>
                <textarea
                  name="notes"
                  rows={3}
                  className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
                  placeholder="Anything you'd like to remember about this version..."
                />
              </div>

              {textUploadMessage && (
                <p className="text-sm text-green-600">{textUploadMessage}</p>
              )}
              {textUploadError && (
                <p className="text-sm text-red-600">{textUploadError}</p>
              )}

              <Button type="submit" disabled={textUploadLoading}>
                {textUploadLoading ? "Saving..." : "Save Pasted Resume"}
              </Button>
            </form>
          </section>
        </CardContent>
      </Card>

      <Card id="tailor-resume">
        <CardHeader>
          <CardTitle>🎯 Tailor with AI</CardTitle>
          <CardDescription>
            Select a master resume and paste a job description to create a tailored version
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {masterResumes.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Upload a master resume first to enable tailoring.
            </p>
          ) : (
            <form onSubmit={handleTailor} className="space-y-4">
              <div>
                <label className="text-sm font-medium">Master Resume *</label>
                <select
                  name="baseResume"
                  className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
                  required
                  defaultValue=""
                >
                  <option value="" disabled>
                    Select a resume
                  </option>
                  {masterResumes.map((resume) => (
                    <option key={resume.id} value={resume.id}>
                      {resume.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="text-sm font-medium">Company *</label>
                  <input
                    name="targetCompany"
                    type="text"
                    className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
                    placeholder="e.g., Google"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Notes</label>
                  <input
                    name="tailorNotes"
                    type="text"
                    className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
                    placeholder="Focus on systems design, etc."
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Job Description *</label>
                <textarea
                  name="jobDescription"
                  rows={6}
                  className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
                  placeholder="Paste the job description here"
                  required
                />
              </div>

              {tailorError && (
                <p className="text-sm text-red-600">{tailorError}</p>
              )}

              <Button type="submit" disabled={tailorLoading}>
                {tailorLoading ? "Tailoring..." : "Generate Tailored Resume"}
              </Button>
            </form>
          )}

          {tailorResult && (
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
              <h3 className="font-semibold">Tailored Resume Preview</h3>
              <p className="text-sm text-muted-foreground">
                Saved as <span className="font-medium">{tailorResult.name}</span>
              </p>
              {tailorResult.insights && (
                <details className="mt-3">
                  <summary className="cursor-pointer text-sm font-medium">
                    View tailoring insights
                  </summary>
                  <p className="mt-2 whitespace-pre-line text-sm">
                    {tailorResult.insights}
                  </p>
                </details>
              )}
              <pre className="mt-4 max-h-64 overflow-y-auto whitespace-pre-wrap rounded-md border border-gray-200 bg-white p-3 text-sm">
                {tailorResult.text}
              </pre>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

async function parseResponse(response: Response): Promise<any> {
  const text = await response.text()
  try {
    return JSON.parse(text)
  } catch {
    return { error: text || response.statusText }
  }
}
