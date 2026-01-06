/**
 * Dashboard layout with navigation
 */

import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/login")
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-8">
              <Link href="/dashboard" className="flex items-center space-x-2">
                <span className="text-2xl">🎯</span>
                <span className="text-xl font-bold">Job Search Agent</span>
              </Link>

              <nav className="hidden md:flex space-x-6">
                <Link
                  href="/dashboard"
                  className="text-gray-600 hover:text-gray-900"
                >
                  Dashboard
                </Link>
                <Link
                  href="/applications"
                  className="text-gray-600 hover:text-gray-900"
                >
                  Applications
                </Link>
                <Link
                  href="/resume"
                  className="text-gray-600 hover:text-gray-900"
                >
                  Resume
                </Link>
                <Link
                  href="/interview-prep"
                  className="text-gray-600 hover:text-gray-900"
                >
                  Interview Prep
                </Link>
                <Link
                  href="/interviews"
                  className="text-gray-600 hover:text-gray-900"
                >
                  Schedule
                </Link>
              </nav>
            </div>

            <div className="flex items-center space-x-4">
              <div className="hidden md:block text-sm text-gray-600">
                {session.user?.name || session.user?.email}
              </div>
              <Button variant="outline" asChild>
                <Link href="/api/auth/signout">Log Out</Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">{children}</main>
    </div>
  )
}

