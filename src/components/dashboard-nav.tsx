/**
 * Dashboard navigation with active state highlighting
 */

"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

const navItems = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/applications", label: "Applications" },
  { href: "/interviews", label: "Schedule" },
  { href: "/resume", label: "Resume" },
  { href: "/interview-prep", label: "Interview Prep" },
]

export function DashboardNav() {
  const pathname = usePathname()

  const isActive = (href: string) => {
    if (href === "/dashboard") {
      return pathname === "/dashboard"
    }
    return pathname.startsWith(href)
  }

  return (
    <nav className="hidden md:flex space-x-6">
      {navItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={`transition-colors ${
            isActive(item.href)
              ? "text-blue-600 font-semibold border-b-2 border-blue-600 pb-1"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  )
}
