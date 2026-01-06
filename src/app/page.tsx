/**
 * Home page
 */

import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <nav className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-2xl">🎯</span>
            <span className="text-xl font-bold">Job Search Agent</span>
          </div>
          <div className="space-x-4">
            <Button variant="ghost" asChild>
              <Link href="/login">Log In</Link>
            </Button>
            <Button asChild>
              <Link href="/login">Get Started</Link>
            </Button>
          </div>
        </nav>
      </header>

      {/* Hero */}
      <section className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-5xl font-bold tracking-tight mb-6">
          Your AI-Powered <br />
          <span className="text-blue-600">Career Companion</span>
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          Track applications, prepare for interviews, and manage your entire
          job search with intelligent AI assistance.
        </p>
        <div className="space-x-4">
          <Button size="lg" asChild>
            <Link href="/login">Start Free</Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="#features">Learn More</Link>
          </Button>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="container mx-auto px-4 py-20">
        <h2 className="text-3xl font-bold text-center mb-12">
          Everything You Need to Land Your Dream Job
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          <Card>
            <CardHeader>
              <CardTitle>📝 Application Tracking</CardTitle>
              <CardDescription>
                Manage all your applications in one place
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Visual Kanban board</li>
                <li>• Status tracking</li>
                <li>• Timeline events</li>
                <li>• Chrome extension integration</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>🤖 AI-Powered Analysis</CardTitle>
              <CardDescription>
                Get intelligent insights on every job
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Job match scoring</li>
                <li>• Requirements extraction</li>
                <li>• Cover letter generation</li>
                <li>• Skill gap analysis</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>📊 Analytics & Insights</CardTitle>
              <CardDescription>
                Track your progress with detailed metrics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Response rates</li>
                <li>• Interview conversion</li>
                <li>• Application timeline</li>
                <li>• Success metrics</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>🎤 Interview Prep</CardTitle>
              <CardDescription>
                Build your interview question bank
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Question library</li>
                <li>• Practice sessions</li>
                <li>• Company research</li>
                <li>• Technical concepts</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>📄 Resume Management</CardTitle>
              <CardDescription>
                Organize and version your resumes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Multiple versions</li>
                <li>• Tailored resumes</li>
                <li>• Quick access</li>
                <li>• Version history</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>🔌 Browser Extension</CardTitle>
              <CardDescription>
                Save jobs directly from LinkedIn
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• One-click save</li>
                <li>• Auto-extract details</li>
                <li>• Instant sync</li>
                <li>• Works on LinkedIn</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-4 py-20 text-center">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="text-3xl">Ready to Get Started?</CardTitle>
            <CardDescription className="text-lg">
              Join thousands of job seekers using AI to land their dream jobs
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button size="lg" asChild>
              <Link href="/login">Start Your Job Search</Link>
            </Button>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container mx-auto px-4 text-center text-sm text-gray-600">
          <p>© 2024 Job Search Agent. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}

