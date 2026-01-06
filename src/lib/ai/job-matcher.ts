/**
 * Job matching and analysis
 * Migrated from Python ai/job_matcher.py
 */

import { getModel } from "./chains"
import type {
  JobMatchAnalysis,
  JobRequirements,
  UserProfile,
} from "@/types/ai"

/**
 * Extract requirements from job description
 */
export async function extractRequirements(
  jobDescription: string
): Promise<JobRequirements> {
  const model = getModel(0.1)

  const prompt = `Extract job requirements from this description in JSON format.

Job Description:
${jobDescription.substring(0, 3000)}

Extract:
- required_skills: Array of required skills
- preferred_skills: Array of preferred/nice-to-have skills
- years_experience: Years of experience required
- role_level: Job level (Junior/Mid/Senior/Staff/Principal)

Return ONLY valid JSON.
Example: {"required_skills": ["Python", "AWS"], "preferred_skills": ["Docker"], "years_experience": "3-5", "role_level": "Senior"}`

  try {
    const response = await model.invoke(prompt)
    let content = response.content as string

    // Extract JSON
    if (content.includes("```json")) {
      content = content.split("```json")[1].split("```")[0].trim()
    } else if (content.includes("```")) {
      content = content.split("```")[1].split("```")[0].trim()
    }

    return JSON.parse(content)
  } catch (error) {
    console.error("Error extracting requirements:", error)
    return {
      required_skills: [],
      preferred_skills: [],
    }
  }
}

/**
 * Calculate match score between job and user profile
 */
export async function calculateMatchScore(
  jobRequirements: JobRequirements,
  userProfile: UserProfile
): Promise<JobMatchAnalysis> {
  const model = getModel(0.1)

  const prompt = `Analyze the match between job requirements and user profile.

Job Requirements:
${JSON.stringify(jobRequirements, null, 2)}

User Profile:
${JSON.stringify(userProfile, null, 2)}

Provide:
1. match_score: Number between 0-1 (0.85 = 85% match)
2. overall_score: Number between 0-100
3. matching_skills: Array of skills user has that match requirements
4. missing_skills: Array of required skills user lacks
5. recommendation: Short recommendation (Apply/Consider/Skip)
6. strengths: Array of user's strengths for this role
7. areas_for_improvement: Array of areas to improve

Return ONLY valid JSON with these exact keys.`

  try {
    const response = await model.invoke(prompt)
    let content = response.content as string

    // Extract JSON
    if (content.includes("```json")) {
      content = content.split("```json")[1].split("```")[0].trim()
    } else if (content.includes("```")) {
      content = content.split("```")[1].split("```")[0].trim()
    }

    const analysis = JSON.parse(content)

    return {
      matchScore: analysis.match_score || 0,
      overallScore: analysis.overall_score || 0,
      matchingSkills: analysis.matching_skills || [],
      missingSkills: analysis.missing_skills || [],
      recommendation: analysis.recommendation || "Review manually",
      strengths: analysis.strengths,
      areasForImprovement: analysis.areas_for_improvement,
    }
  } catch (error) {
    console.error("Error calculating match score:", error)
    return {
      matchScore: 0,
      overallScore: 0,
      matchingSkills: [],
      missingSkills: [],
      recommendation: "Error analyzing match",
    }
  }
}

/**
 * Generate cover letter
 */
export async function generateCoverLetter(
  company: string,
  role: string,
  jobRequirements: JobRequirements,
  userProfile: UserProfile,
  jobDescription: string
): Promise<string> {
  const model = getModel(0.3) // Higher temperature for creative writing

  const prompt = `Generate a professional cover letter.

Company: ${company}
Role: ${role}

Job Requirements:
${JSON.stringify(jobRequirements, null, 2)}

User Profile:
${JSON.stringify(userProfile, null, 2)}

Job Description:
${jobDescription.substring(0, 1000)}

Write a concise, professional cover letter (3-4 paragraphs):
1. Opening: Express interest in the role
2. Body: Highlight relevant skills and experience
3. Closing: Express enthusiasm and call to action

Keep it under 300 words. Be specific about matching skills.`

  try {
    const response = await model.invoke(prompt)
    return response.content as string
  } catch (error) {
    console.error("Error generating cover letter:", error)
    throw new Error("Failed to generate cover letter")
  }
}

/**
 * Get default user profile (placeholder - should come from database)
 */
export function getDefaultUserProfile(): UserProfile {
  return {
    skills: ["JavaScript", "TypeScript", "React", "Node.js", "Python"],
    experience_years: 5,
    education: ["Bachelor's in Computer Science"],
    previous_roles: ["Software Engineer", "Full Stack Developer"],
    certifications: [],
    interests: ["Web Development", "AI/ML", "Cloud Computing"],
  }
}

