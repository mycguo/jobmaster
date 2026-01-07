/**
 * Job parsing with AI
 * Migrated from Python ai/job_parser.py
 */

import { getModel } from "./chains"
import type { ParsedJobDetails } from "@/types/ai"

/**
 * Extract job details from raw content using AI
 */
export async function extractJobDetails(
  pageContent: string,
  jobUrl?: string
): Promise<ParsedJobDetails> {
  const model = getModel(0.0)

  const contentPreview = pageContent.substring(0, 8000)

  const prompt = `You are a precise job posting parser. Extract job information from the text below.

${jobUrl ? `URL: ${jobUrl}\n\n` : ""}Job Posting Text:
${contentPreview}

Extract the following information. Look carefully - the company name and job title are ALWAYS present in a job posting.
Do NOT return null for company or role - extract them even if you have to infer from context.

Return ONLY a JSON object with NO markdown formatting, NO explanations, NO additional text:
{
  "company": "exact company name (REQUIRED - extract from text)",
  "role": "exact job title (REQUIRED - extract from text)",
  "description": "brief summary of the role",
  "location": "work location if mentioned",
  "salary_range": "salary/compensation if mentioned",
  "required_skills": ["skill1", "skill2"],
  "preferred_skills": ["skill1"],
  "years_experience": "years required",
  "role_level": "seniority level"
}`

  let response: any
  try {
    response = await model.invoke(prompt)
    let content = response.content as string

    // Try to extract JSON from various formats
    let jsonContent = content.trim()

    // Remove markdown code blocks
    if (jsonContent.includes("```json")) {
      jsonContent = jsonContent.split("```json")[1].split("```")[0].trim()
    } else if (jsonContent.includes("```")) {
      jsonContent = jsonContent.split("```")[1].split("```")[0].trim()
    }

    // Try to find JSON object if model added text
    const jsonMatch = jsonContent.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      jsonContent = jsonMatch[0]
    }

    const parsed = JSON.parse(jsonContent)

    // Validate required fields
    if (!parsed.company || !parsed.role) {
      throw new Error("Missing required fields: company or role")
    }

    return {
      company: parsed.company,
      role: parsed.role,
      description: parsed.description,
      location: parsed.location,
      salaryRange: parsed.salary_range,
      applyUrl: jobUrl,
      requirements: parsed.required_skills
        ? {
            required_skills: parsed.required_skills || [],
            preferred_skills: parsed.preferred_skills || [],
            years_experience: parsed.years_experience,
            role_level: parsed.role_level,
          }
        : undefined,
    }
  } catch (error) {
    console.error("Error parsing job details:", error)
    console.error("Content length:", pageContent.length)
    console.error("Content preview (first 500 chars):", pageContent.substring(0, 500))
    if (response?.content) {
      console.error("Raw AI response:", response.content.toString().substring(0, 500))
    }
    throw new Error(
      "Failed to extract job details. The page content may not contain a valid job posting."
    )
  }
}

