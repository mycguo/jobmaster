"use client"

import Link from "next/link"

type Logo = {
  label: string
  render: () => JSX.Element
}

const logos: Logo[] = [
  {
    label: "ADP",
    render: () => (
      <svg viewBox="0 0 48 32" className="h-12 w-12">
        <rect width="48" height="32" rx="10" fill="#fff" />
        <text
          x="24"
          y="21"
          fontFamily="Inter, sans-serif"
          fontWeight={700}
          fontSize="16"
          textAnchor="middle"
          fill="#E60028"
        >
          ADP
        </text>
      </svg>
    ),
  },
  {
    label: "Jira",
    render: () => (
      <svg viewBox="0 0 48 32" className="h-12 w-12">
        <rect width="48" height="32" rx="10" fill="#0052CC" />
        <path
          d="M24 8L35 16L24 24L13 16L24 8Z"
          fill="#fff"
          opacity="0.9"
        />
      </svg>
    ),
  },
  {
    label: "Google",
    render: () => (
      <svg viewBox="0 0 48 32" className="h-12 w-12">
        <rect width="48" height="32" rx="10" fill="#fff" />
        <circle cx="24" cy="16" r="9" fill="none" stroke="#4285f4" strokeWidth="4" />
        <path d="M24 7a9 9 0 0 1 9 9" stroke="#34a853" strokeWidth="4" fill="none" />
        <path d="M15 16a9 9 0 0 1 9-9" stroke="#fbbc05" strokeWidth="4" fill="none" />
        <path d="M24 25a9 9 0 0 1-9-9" stroke="#ea4335" strokeWidth="4" fill="none" />
      </svg>
    ),
  },
  {
    label: "Microsoft Teams",
    render: () => (
      <svg viewBox="0 0 48 32" className="h-12 w-12">
        <rect width="48" height="32" rx="10" fill="#5936CE" />
        <rect x="14" y="9" width="20" height="16" rx="4" fill="#fff" opacity="0.9" />
        <text
          x="24"
          y="21"
          fontFamily="Inter, sans-serif"
          fontWeight={700}
          fontSize="12"
          textAnchor="middle"
          fill="#5936CE"
        >
          T
        </text>
      </svg>
    ),
  },
  {
    label: "Gusto",
    render: () => (
      <svg viewBox="0 0 48 32" className="h-12 w-12">
        <rect width="48" height="32" rx="10" fill="#FF6F58" />
        <text
          x="24"
          y="21"
          fontFamily="Inter, sans-serif"
          fontWeight={700}
          fontSize="16"
          textAnchor="middle"
          fill="#fff"
        >
          g
        </text>
      </svg>
    ),
  },
  {
    label: "Slack",
    render: () => (
      <svg viewBox="0 0 48 32" className="h-12 w-12">
        <rect width="48" height="32" rx="10" fill="#4A154B" />
        <g transform="translate(24 16)">
          <rect x="-2" y="-7" width="4" height="14" rx="2" fill="#ECB22E" />
          <rect x="-7" y="-2" width="14" height="4" rx="2" fill="#36C5F0" />
          <rect x="-2" y="-7" width="4" height="14" rx="2" transform="rotate(90)" fill="#2EB67D" />
          <rect x="-7" y="-2" width="14" height="4" rx="2" transform="rotate(90)" fill="#E01E5A" />
        </g>
      </svg>
    ),
  },
  {
    label: "Notion",
    render: () => (
      <svg viewBox="0 0 48 32" className="h-12 w-12">
        <rect width="48" height="32" rx="10" fill="#fff" />
        <rect
          x="10"
          y="8"
          width="28"
          height="16"
          rx="4"
          stroke="#111"
          strokeWidth="2"
          fill="#fff"
        />
        <text
          x="24"
          y="22"
          fontFamily="Space Grotesk, Inter, sans-serif"
          fontWeight={700}
          fontSize="16"
          textAnchor="middle"
          fill="#111"
        >
          N
        </text>
      </svg>
    ),
  },
  {
    label: "HiBob",
    render: () => (
      <svg viewBox="0 0 48 32" className="h-12 w-12">
        <rect width="48" height="32" rx="10" fill="#FF8B73" />
        <circle cx="24" cy="16" r="7" fill="#fff" />
        <text
          x="24"
          y="20"
          fontFamily="Inter, sans-serif"
          fontWeight={700}
          fontSize="10"
          textAnchor="middle"
          fill="#FF8B73"
        >
          bob
        </text>
      </svg>
    ),
  },
  {
    label: "Salesforce",
    render: () => (
      <svg viewBox="0 0 48 32" className="h-12 w-12">
        <rect width="48" height="32" rx="10" fill="#00A1E0" />
        <path
          d="M17 16c0-4 3-7 7-7s7 3 7 7c0 4-3 7-7 7s-7-3-7-7z"
          fill="#fff"
          opacity="0.95"
        />
      </svg>
    ),
  },
  {
    label: "Workday",
    render: () => (
      <svg viewBox="0 0 48 32" className="h-12 w-12">
        <rect width="48" height="32" rx="10" fill="#1F3C88" />
        <path
          d="M12 20a12 12 0 0 1 24 0"
          stroke="#F9B233"
          strokeWidth="4"
          strokeLinecap="round"
          fill="none"
        />
      </svg>
    ),
  },
]

export function IntegrationBanner() {
  return (
    <div className="relative overflow-hidden rounded-3xl bg-[#F8F9F5] p-8 shadow-lg">
      <div className="absolute inset-0 grid grid-cols-6 gap-4 opacity-60">
        {Array.from({ length: 36 }).map((_, index) => (
          <div
            key={index}
            className="rounded-2xl bg-white/70 border border-white/30"
          ></div>
        ))}
      </div>

      <div className="relative z-10 flex flex-wrap justify-center gap-3 mb-8">
        {logos.map((logo) => (
          <div
            key={logo.label}
            className="flex h-16 w-16 items-center justify-center rounded-2xl border border-white/60 bg-white/90 shadow-sm"
            title={logo.label}
          >
            {logo.render()}
          </div>
        ))}
      </div>

      <div className="relative z-10 mx-auto max-w-xl text-center space-y-4">
        <h2 className="text-3xl font-semibold text-[#0f3f2e]">
          Seamless in tracking all phases of your job applications
        </h2>
        <p className="text-base text-[#22543d]">
          Capture leads from the LinkedIn extension, keep every stage in sync, and
          stay aligned across your entire job search workflow.
        </p>
        <Link
          href="/how-it-works"
          className="inline-flex items-center justify-center rounded-full bg-[#0f3f2e] px-6 py-3 text-sm font-semibold text-white shadow-lg"
        >
          See how it works
        </Link>
      </div>
    </div>
  )
}
