/**
 * Helper utilities for generating consistent user identifiers
 */

import type { Session } from "next-auth"

export function sanitizeUserIdentifier(identifier?: string | null): string {
  if (!identifier) {
    return "default_user"
  }

  const sanitized = identifier
    .replace(/[^a-zA-Z0-9_-]/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_+|_+$/g, "")

  return sanitized || "default_user"
}

export function formatLinkedInUserId(identifier?: string | null): string {
  const sanitized = sanitizeUserIdentifier(identifier || "linkedin_user")
  return sanitized.startsWith("linkedin_")
    ? sanitized
    : `linkedin_${sanitized}`
}

export function buildVectorUserId(params: {
  provider?: string | null
  email?: string | null
  fallback?: string | null
}): string {
  const provider = params.provider?.toLowerCase()
  const { email, fallback } = params

  if (provider === "linkedin") {
    if (email) {
      return formatLinkedInUserId(email)
    }
    return formatLinkedInUserId(fallback)
  }

  return email || fallback || "default_user"
}

export function resolveSessionUserId(session: Session | null): string {
  if (!session?.user) {
    return "default_user"
  }

  const user = session.user as Session["user"] & {
    vectorUserId?: string | null
  }

  return (
    user.vectorUserId ||
    user.email ||
    user.id ||
    "default_user"
  )
}

export function normalizeExtensionUserId(
  rawId?: string | null,
  options?: { provider?: string | null; jobUrl?: string | null }
): string {
  const trimmed = rawId?.trim()
  const base = trimmed ? sanitizeUserIdentifier(trimmed) : "default_user"

  if (base.startsWith("linkedin_")) {
    return base
  }

  const provider = options?.provider?.toLowerCase()
  const jobUrl = options?.jobUrl?.toLowerCase() || ""
  const isLinkedInContext =
    provider === "linkedin" || jobUrl.includes("linkedin.com")

  if (isLinkedInContext) {
    return formatLinkedInUserId(trimmed || base)
  }

  return base
}
