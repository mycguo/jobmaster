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
  const model = getModel(0.1) // Match Python's temperature

  // Use larger content window like Python (32000 chars)
  const contentPreview = pageContent.substring(0, 32000)

  // Log preview for debugging
  console.log('[Job Parser] Processing content, length:', pageContent.length)
  console.log('[Job Parser] First 300 chars:', contentPreview.substring(0, 300))

  // Use the same prompt approach as the Python version
  const prompt = `You are a structured data extraction assistant specialized in job postings.
Extract the job application details from the provided job page content. LinkedIn pages often contain multiple jobs in a list; focus on the primary or currently selected job details.
Look carefully for 'company' and 'role' (job title) symbols or text in headers or side panels.
Return ONLY valid JSON with the following keys: company, role, location, description, salary_range, required_skills, preferred_skills, years_experience, role_level.
If a field is missing, set it to null.

Job URL: ${jobUrl || "unknown"}

Job Page Content:
${contentPreview}

JSON:`

  let response: any
  try {
    response = await model.invoke(prompt)
    let content = response.content as string

    // DEBUG: Write AI response to file
    try {
      const fs = require('fs');
      const debugPath = require('path').join(process.cwd(), 'debug_ai_response.txt');
      fs.writeFileSync(debugPath, `--- ${new Date().toISOString()} ---\nPROMPT:\n${prompt}\n\nRESPONSE:\n${content}\n\n`);
    } catch (err) {
      console.error('Failed to write debug file:', err);
    }

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

    // Log what AI extracted
    console.log('[Job Parser] AI extracted:', {
      company: parsed.company,
      role: parsed.role,
      location: parsed.location
    })

    // Clean values like Python version
    const cleanValue = (val: any): string | undefined => {
      if (val === null || val === undefined || val === "" ||
          (Array.isArray(val) && val.length === 0) ||
          (typeof val === "object" && Object.keys(val).length === 0)) {
        return undefined
      }
      return String(val).trim()
    }

    const company = cleanValue(parsed.company)
    const role = cleanValue(parsed.role)

    // Basic validation - just ensure we have company and role
    if (!company || !role) {
      console.error('[Job Parser] Missing required fields:', { company, role })
      throw new Error("Failed to extract company or role from job content")
    }

    console.log('[Job Parser] ✓ Validation passed')

    // Return cleaned values matching Python structure
    return {
      company: company,
      role: role,
      description: cleanValue(parsed.description),
      location: cleanValue(parsed.location),
      salaryRange: cleanValue(parsed.salary_range),
      applyUrl: jobUrl,
      requirements: parsed.required_skills || parsed.preferred_skills || parsed.years_experience || parsed.role_level
        ? {
            required_skills: Array.isArray(parsed.required_skills) ? parsed.required_skills : [],
            preferred_skills: Array.isArray(parsed.preferred_skills) ? parsed.preferred_skills : [],
            years_experience: cleanValue(parsed.years_experience),
            role_level: cleanValue(parsed.role_level),
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

