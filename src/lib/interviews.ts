/**
 * Interview parsing and management utilities
 * Migrated from Streamlit pages/interview_schedule.py
 */

import type { Application, ApplicationEvent } from "@/types/application"

export interface Interview {
  date: string
  time?: string
  type: string
  interviewer?: string
  notes?: string
  applicationId: string
  company: string
  role: string
  event: ApplicationEvent
  eventIndex: number
}

export type InterviewCategory = "Today" | "Tomorrow" | "This Week" | "This Month" | "Upcoming" | "Past" | "Other"

const INTERVIEW_KEYWORDS = ['interview', 'screening', 'phone_screen', 'technical', 'behavioral', 'onsite']

/**
 * Parse interview information from a timeline event
 */
export function parseInterviewFromEvent(
  event: ApplicationEvent,
  app: Application,
  eventIndex: number
): Interview | null {
  // Check if this is an interview-related event
  const eventTypeLower = event.eventType.toLowerCase()
  if (!INTERVIEW_KEYWORDS.some(keyword => eventTypeLower.includes(keyword))) {
    return null
  }

  // Parse date
  const interviewDate = event.date

  // Try to extract time from notes
  const timeMatch = event.notes?.match(/(\d{1,2}:\d{2}\s*(?:AM|PM|am|pm))|(\d{1,2}:\d{2})|at\s+(\d{1,2}:\d{2}\s*(?:AM|PM|am|pm))/)
  const interviewTime = timeMatch ? timeMatch[0].replace('at ', '').trim() : undefined

  // Try to extract interview type
  const typeKeywords: Record<string, string> = {
    'phone': 'phone',
    'video': 'video',
    'technical': 'technical',
    'behavioral': 'behavioral',
    'onsite': 'onsite',
    'virtual': 'video',
    'screen': 'screening'
  }

  const notesLower = (event.notes || "").toLowerCase()
  let interviewType = eventTypeLower

  for (const [keyword, itype] of Object.entries(typeKeywords)) {
    if (notesLower.includes(keyword)) {
      interviewType = itype
      break
    }
  }

  // Try to extract interviewer name
  const interviewerMatch = event.notes?.match(/(?:with|interviewer|by)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/)
  const interviewer = interviewerMatch ? interviewerMatch[1] : undefined

  return {
    date: interviewDate,
    time: interviewTime,
    type: interviewType,
    interviewer,
    notes: event.notes,
    applicationId: app.id,
    company: app.company,
    role: app.role,
    event,
    eventIndex
  }
}

/**
 * Get all interviews from all applications
 */
export function getAllInterviews(applications: Application[]): Interview[] {
  const interviews: Interview[] = []

  for (const app of applications) {
    app.timeline.forEach((event, index) => {
      const interview = parseInterviewFromEvent(event, app, index)
      if (interview) {
        interviews.push(interview)
      }
    })
  }

  // Sort by date and time
  interviews.sort((a, b) => {
    const dateA = parseDatetime(a.date, a.time)
    const dateB = parseDatetime(b.date, b.time)
    return dateA.getTime() - dateB.getTime()
  })

  return interviews
}

/**
 * Parse date and time into a Date object
 */
function parseDatetime(dateStr: string, timeStr?: string): Date {
  try {
    const date = new Date(dateStr)

    if (timeStr) {
      try {
        // Try different time formats
        const timeMatch = timeStr.match(/(\d{1,2}):(\d{2})\s*(AM|PM|am|pm)?/)
        if (timeMatch) {
          let hours = parseInt(timeMatch[1])
          const minutes = parseInt(timeMatch[2])
          const meridiem = timeMatch[3]?.toUpperCase()

          if (meridiem) {
            if (meridiem === 'PM' && hours !== 12) hours += 12
            if (meridiem === 'AM' && hours === 12) hours = 0
          }

          date.setHours(hours, minutes, 0, 0)
        }
      } catch {
        // Ignore time parsing errors
      }
    }

    return date
  } catch {
    return new Date(0) // Fallback to epoch
  }
}

/**
 * Group interviews by date category
 */
export function groupInterviewsByDate(interviews: Interview[]): Record<InterviewCategory, Interview[]> {
  const grouped: Record<string, Interview[]> = {}
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  const weekFromNow = new Date(today)
  weekFromNow.setDate(weekFromNow.getDate() + 7)

  const monthFromNow = new Date(today)
  monthFromNow.setDate(monthFromNow.getDate() + 30)

  for (const interview of interviews) {
    try {
      const interviewDate = new Date(interview.date)
      interviewDate.setHours(0, 0, 0, 0)

      let category: InterviewCategory

      if (interviewDate < today) {
        category = "Past"
      } else if (interviewDate.getTime() === today.getTime()) {
        category = "Today"
      } else if (interviewDate.getTime() === tomorrow.getTime()) {
        category = "Tomorrow"
      } else if (interviewDate <= weekFromNow) {
        category = "This Week"
      } else if (interviewDate <= monthFromNow) {
        category = "This Month"
      } else {
        category = "Upcoming"
      }

      if (!grouped[category]) {
        grouped[category] = []
      }
      grouped[category].push(interview)
    } catch {
      // Invalid date format
      if (!grouped["Other"]) {
        grouped["Other"] = []
      }
      grouped["Other"].push(interview)
    }
  }

  return grouped as Record<InterviewCategory, Interview[]>
}

/**
 * Format interview time for display
 */
export function formatInterviewTime(interview: Interview): string {
  return interview.time || "Time TBD"
}

/**
 * Format interview type with emoji
 */
export function formatInterviewType(interview: Interview): { emoji: string, label: string } {
  const typeEmojis: Record<string, string> = {
    'phone': '📞',
    'video': '📹',
    'technical': '💻',
    'behavioral': '🗣️',
    'onsite': '🏢',
    'screening': '🔍'
  }

  const emoji = typeEmojis[interview.type.toLowerCase()] || '💼'
  const label = interview.type.charAt(0).toUpperCase() + interview.type.slice(1)

  return { emoji, label }
}

/**
 * Format date for display
 */
export function formatDate(dateStr: string): string {
  try {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  } catch {
    return dateStr
  }
}
