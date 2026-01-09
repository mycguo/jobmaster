/**
 * Resume tailoring helpers (ported from pages/resume.py)
 */

import { ChatGoogleGenerativeAI } from "@langchain/google-genai"

interface TailorParams {
  resumeText: string
  jobDescription: string
  companyName?: string
}

export interface TailorResult {
  tailoredText: string
  insights: string
}

const MODEL_NAME = "gemini-2.5-flash"

export async function tailorResumeWithAI(
  params: TailorParams
): Promise<TailorResult> {
  if (!process.env.GOOGLE_API_KEY) {
    throw new Error("GOOGLE_API_KEY is not configured")
  }

  const { resumeText, jobDescription, companyName } = params
  const model = new ChatGoogleGenerativeAI({
    modelName: MODEL_NAME,
    temperature: 0.0,
    apiKey: process.env.GOOGLE_API_KEY,
  })

  const tailoringPrompt = `You are an expert resume writer. Tailor the following resume to match the job description below.

IMPORTANT INSTRUCTIONS:
1. ALWAYS START with the candidate's full name and contact information (email, phone, location, LinkedIn, etc.) - this is MANDATORY
2. Keep the same overall structure and format
3. Emphasize relevant experience and skills that match the job requirements
4. Add or highlight keywords from the job description
5. Quantify achievements where possible
6. Keep it concise and impactful
7. Maintain professional tone
8. Do NOT fabricate experience or skills
9. Only reframe and emphasize what's already in the resume
10. Return ONLY the tailored resume text - no introductory text, no explanations, no prefixes

ORIGINAL RESUME:
${resumeText}

JOB DESCRIPTION:
${jobDescription}

COMPANY: ${companyName || "Not specified"}

CRITICAL: Your response must begin with the candidate's name and contact information. Return ONLY the tailored resume text. Do not include any introductory text, explanations, or prefixes.`

  const tailoringResponse = await model.invoke(tailoringPrompt)
  const tailoredRaw = extractContent(tailoringResponse)
  const tailoredText = cleanResumeText(tailoredRaw, companyName)

  const insightsPrompt = `Based on the resume and job description, provide a brief analysis of the tailoring.

Include:
1. Top 3-5 keywords/skills from the job description that were emphasized
2. A brief note about what was changed (2-3 sentences)

Format your response as a concise paragraph with the following structure:

**KEYWORDS:** keyword1, keyword2, keyword3, keyword4, keyword5

**CHANGES:** The resume's summary was rewritten to directly address the job description's emphasis on [specific aspects]. Bullet points under experience were rephrased to highlight achievements in [relevant areas], using language from the job description. Quantifiable results related to [specific metrics] were also added.

Keep it concise and use this exact formatting.`

  const insightsResponse = await model.invoke(insightsPrompt)
  const insightsRaw = extractContent(insightsResponse)
  const insights = formatInsights(insightsRaw)

  return {
    tailoredText,
    insights,
  }
}

function extractContent(response: any): string {
  if (!response) {
    return ""
  }

  if (typeof response.content === "string") {
    return response.content
  }

  if (Array.isArray(response.content)) {
    return response.content
      .map((part: any) => {
        if (typeof part === "string") return part
        if (part?.text) return part.text
        if (typeof part?.toString === "function") return part.toString()
        return ""
      })
      .join("\n")
  }

  if (response?.text) {
    return response.text
  }

  return response.toString?.() || ""
}

function cleanResumeText(text: string, companyName?: string): string {
  if (!text) {
    return ""
  }

  let cleaned = text.trim()

  const introPatterns = [
    /^Here is the tailored resume[^:]*:/i,
    /^Here's the tailored resume[^:]*:/i,
    /^Below is the tailored resume[^:]*:/i,
    /^The tailored resume[^:]*:/i,
    /^Tailored resume[^:]*:/i,
    /^Resume[^:]*:/i,
    /^---+\s*$/im,
    /^=+\s*$/im,
  ]

  introPatterns.forEach((pattern) => {
    cleaned = cleaned.replace(pattern, "")
  })

  cleaned = cleaned.replace(/^-+\s*/gm, "").replace(/^=+\s*/gm, "")
  cleaned = cleaned.trim()

  const lines = cleaned.split("\n")
  let startIndex = 0

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim()
    const lower = line.toLowerCase()
    if (!line) {
      startIndex = i + 1
      continue
    }

    const looksLikeExplanation =
      line.length > 100 &&
      [
        "tailored",
        "emphasizing",
        "highlighting",
        "rewritten",
        "here is",
        "here's",
        "below is",
        "the resume",
      ].some((phrase) => lower.includes(phrase))

    if (looksLikeExplanation) {
      startIndex = i + 1
    } else {
      break
    }
  }

  if (startIndex > 0) {
    cleaned = lines.slice(startIndex).join("\n")
  }

  return cleaned.trim()
}

function formatInsights(insights: string): string {
  if (!insights) {
    return ""
  }

  return insights
    .replace(/#\s+/g, "")
    .replace(/##\s+/g, "")
    .replace(/###\s+/g, "")
    .replace(/KEYWORDS:/gi, "**Keywords:**")
    .replace(/CHANGES:/gi, "\n\n**Changes:**")
    .trim()
}

