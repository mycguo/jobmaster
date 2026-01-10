/**
 * Job matching AI analysis
 */

import { getModel } from "./chains"
import type { Application } from "@/types/application"
import type { ResumeRecord } from "@/types/resume"

export interface JobMatchResult {
  matchScore: number // 0-1
  strengths: string[]
  gaps: string[]
  recommendations: string[]
}

/**
 * Analyze how well a resume matches a job posting
 */
export async function analyzeJobMatch(
  application: Application,
  resume: ResumeRecord
): Promise<JobMatchResult> {
  const model = getModel(0.2) // Slightly higher temperature for analysis

  const prompt = `You are an expert career counselor and recruiter. Analyze how well this resume matches the job posting.

JOB POSTING:
Company: ${application.company}
Role: ${application.role}
${application.location ? `Location: ${application.location}` : ""}
${application.salaryRange ? `Salary: ${application.salaryRange}` : ""}

Job Description:
${application.jobDescription || "No description provided"}

${
  application.jobRequirements
    ? `
Requirements:
- Required Skills: ${application.jobRequirements.required_skills?.join(", ") || "Not specified"}
- Preferred Skills: ${application.jobRequirements.preferred_skills?.join(", ") || "Not specified"}
- Experience: ${application.jobRequirements.years_experience || "Not specified"}
- Level: ${application.jobRequirements.role_level || "Not specified"}
`
    : ""
}

CANDIDATE RESUME:
Name: ${resume.name}
${resume.experienceYears ? `Years of Experience: ${resume.experienceYears}` : ""}
${resume.skills.length > 0 ? `Skills: ${resume.skills.join(", ")}` : ""}
${resume.education.length > 0 ? `Education: ${resume.education.join(", ")}` : ""}
${resume.certifications.length > 0 ? `Certifications: ${resume.certifications.join(", ")}` : ""}

Resume Content:
${resume.fullText}

ANALYSIS REQUIRED:
1. Calculate an overall match score from 0 to 100 (as a percentage)
2. Identify the candidate's key strengths for this role (3-5 points)
3. Identify any gaps or missing qualifications (2-4 points)
4. Provide recommendations for the candidate (2-3 points)

Return your analysis as ONLY valid JSON with this exact structure:
{
  "matchScore": <number 0-100>,
  "strengths": ["strength 1", "strength 2", ...],
  "gaps": ["gap 1", "gap 2", ...],
  "recommendations": ["recommendation 1", "recommendation 2", ...]
}

JSON:`

  try {
    const response = await model.invoke(prompt)
    let content = response.content as string

    // Extract JSON from response
    let jsonContent = content.trim()

    // Remove markdown code blocks
    if (jsonContent.includes("```json")) {
      jsonContent = jsonContent.split("```json")[1].split("```")[0].trim()
    } else if (jsonContent.includes("```")) {
      jsonContent = jsonContent.split("```")[1].split("```")[0].trim()
    }

    // Try to find JSON object
    const jsonMatch = jsonContent.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      jsonContent = jsonMatch[0]
    }

    const parsed = JSON.parse(jsonContent)

    console.log("[Job Match] AI analysis completed:", {
      matchScore: parsed.matchScore,
      strengthsCount: parsed.strengths?.length,
      gapsCount: parsed.gaps?.length,
    })

    // Validate and normalize the response
    const matchScore = Math.max(0, Math.min(100, Number(parsed.matchScore) || 0))

    return {
      matchScore: matchScore / 100, // Convert to 0-1 scale
      strengths: Array.isArray(parsed.strengths) ? parsed.strengths : [],
      gaps: Array.isArray(parsed.gaps) ? parsed.gaps : [],
      recommendations: Array.isArray(parsed.recommendations)
        ? parsed.recommendations
        : [],
    }
  } catch (error) {
    console.error("Error analyzing job match:", error)
    throw new Error("Failed to analyze job match. Please try again.")
  }
}
