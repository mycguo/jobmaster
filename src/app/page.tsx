/**
 * Home page
 */

import Link from "next/link"
import Image from "next/image"
import buyMeACoffeeQR from "@/../assets/buymeacoffee_qr.png"
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
    <div className="min-h-screen bg-[#FDFBF7]">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <nav className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-[#0f3f2e]">
            <span className="text-2xl">🎯</span>
            <span className="text-xl font-bold">Job Search Agent</span>
          </div>
          <div className="space-x-4">
            <Button variant="ghost" asChild>
              <Link href="/how-it-works">How it Works</Link>
            </Button>
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
        <h1 className="text-5xl font-bold tracking-tight mb-6 text-[#0f3f2e]">
          Your AI-Powered <br />
          <span className="text-[#1d684e]">Career Companion</span>
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
            <Link href="/how-it-works">How it Works</Link>
          </Button>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="container mx-auto px-4 py-20">
        <h2 className="text-3xl font-bold text-center mb-12">
          Everything You Need to Land Your Dream Job
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          {/* Card 1: Pink Theme */}
          <Card className="bg-[#FFF5F9] border-[#FCC8DF] hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="text-[#9D174D]">📝 Application Tracking</CardTitle>
              <CardDescription className="text-[#BE185D]">
                Manage all your applications in one place
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-[#831843]">
                <li>• Visual Kanban board</li>
                <li>• Status tracking</li>
                <li>• Timeline events</li>
                <li>• Chrome extension integration</li>
              </ul>
            </CardContent>
          </Card>

          {/* Card 2: Purple Theme */}
          <Card className="bg-[#EEF2FF] border-[#C7D2FE] hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="text-[#4338CA]">🤖 AI-Powered Analysis</CardTitle>
              <CardDescription className="text-[#4F46E5]">
                Get intelligent insights on every job
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-[#3730A3]">
                <li>• Job match scoring</li>
                <li>• Requirements extraction</li>
                <li>• Cover letter generation</li>
                <li>• Skill gap analysis</li>
              </ul>
            </CardContent>
          </Card>

          {/* Card 3: Pink Theme */}
          <Card className="bg-[#FFF5F9] border-[#FCC8DF] hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="text-[#9D174D]">📊 Analytics & Insights</CardTitle>
              <CardDescription className="text-[#BE185D]">
                Track your progress with detailed metrics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-[#831843]">
                <li>• Response rates</li>
                <li>• Interview conversion</li>
                <li>• Application timeline</li>
                <li>• Success metrics</li>
              </ul>
            </CardContent>
          </Card>

          {/* Card 4: Purple Theme */}
          <Card className="bg-[#EEF2FF] border-[#C7D2FE] hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="text-[#4338CA]">🎤 Interview Prep</CardTitle>
              <CardDescription className="text-[#4F46E5]">
                Build your interview question bank
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-[#3730A3]">
                <li>• Question library</li>
                <li>• Practice sessions</li>
                <li>• Company research</li>
                <li>• Technical concepts</li>
              </ul>
            </CardContent>
          </Card>

          {/* Card 5: Pink Theme */}
          <Card className="bg-[#FFF5F9] border-[#FCC8DF] hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="text-[#9D174D]">📄 Resume Management</CardTitle>
              <CardDescription className="text-[#BE185D]">
                Organize and version your resumes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-[#831843]">
                <li>• Multiple versions</li>
                <li>• Tailored resumes</li>
                <li>• Quick access</li>
                <li>• Version history</li>
              </ul>
            </CardContent>
          </Card>

          {/* Card 6: Purple Theme */}
          <Card className="bg-[#EEF2FF] border-[#C7D2FE] hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="text-[#4338CA]">🔌 Browser Extension</CardTitle>
              <CardDescription className="text-[#4F46E5]">
                Save jobs directly from LinkedIn
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-[#3730A3]">
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
            <CardTitle className="text-3xl">Support Development</CardTitle>
            <CardDescription className="text-lg">
              Help us keep the servers running and the features coming
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="pt-4 text-center space-y-3">
              <p className="text-sm font-semibold text-[#0f3f2e]">
                <span className="opacity-70">Support </span>
                <span className="text-[#1d684e]">development</span>
                <span className="opacity-70"> &amp; </span>
                <span className="text-[#1d684e]">hosting</span>
              </p>
              <div className="flex justify-center">
                <Image
                  src={buyMeACoffeeQR}
                  alt="Buy Me a Coffee QR"
                  width={150}
                  height={150}
                  className="rounded-md border"
                  priority
                />
              </div>
              <Link
                href={`https://www.buymeacoffee.com/${process.env.BUYMEACOFFEE_USERNAME || "yourusername"}`}
                className="inline-flex items-center justify-center rounded-md border border-yellow-400 bg-yellow-300/80 px-4 py-2 text-sm font-semibold text-yellow-900 hover:bg-yellow-300"
                target="_blank"
                rel="noopener noreferrer"
              >
                ☕ Buy Me a Coffee
              </Link>
            </div>
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

