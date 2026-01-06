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
  const model = getModel(0.1)

  const prompt = `Extract job details from this job posting in JSON format.

Job Content:
${pageContent.substring(0, 5000)}

${jobUrl ? `Job URL: ${jobUrl}` : ""}

Extract these fields:
- company: Company name (required)
- role: Job title/role (required)
- description: Brief job description (1-2 sentences)
- location: Location if mentioned
- salary_range: Salary if mentioned
- required_skills: Array of required skills
- preferred_skills: Array of preferred skills
- years_experience: Years of experience required
- role_level: Job level (e.g., Junior, Mid, Senior, Staff, Principal)

Return ONLY valid JSON with these exact keys. Be precise and concise.
Example: {"company": "Google", "role": "ML Engineer", "description": "...", "location": "Remote", ...}`

  try {
    const response = await model.invoke(prompt)
    let content = response.content as string

    // Extract JSON from response
    if (content.includes("```json")) {
      content = content.split("```json")[1].split("```")[0].trim()
    } else if (content.includes("```")) {
      content = content.split("```")[1].split("```")[0].trim()
    }

    const parsed = JSON.parse(content)

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
    throw new Error("Failed to extract job details from content")
  }
}

