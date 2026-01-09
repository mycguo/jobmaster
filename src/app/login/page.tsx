/**
 * Login page
 */

"use client"

import { signIn } from "next-auth/react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import Link from "next/link"
import Image from "next/image"
import buyMeACoffeeQR from "@/../assets/buymeacoffee_qr.png"
import { IntegrationBanner } from "@/components/login/integration-banner"

const buyMeACoffeeUsername = process.env.BUYMEACOFFEE_USERNAME || "yourusername"

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F8F9F5] to-white px-6 py-12">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-8">
        <div className="text-center space-y-2">
          <div className="mx-auto text-5xl">🎯</div>
          <h1 className="text-3xl font-semibold text-[#0f3f2e]">Welcome Back</h1>
          <p className="text-[#22543d]">Sign in to access your Job Search Agent</p>
        </div>

        <IntegrationBanner />

        <Card className="w-full" id="sign-in">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Choose how you’d like to sign in</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
          <Button
            className="w-full bg-[#0077B5] hover:bg-[#006396]"
            size="lg"
            onClick={() => signIn("linkedin", { callbackUrl: "/dashboard" })}
          >
            <svg className="mr-2 h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
            </svg>
            Continue with LinkedIn
          </Button>
          <p className="text-sm text-center text-gray-600">
            Recommended: LinkedIn login syncs with the Chrome extension so job posts you save are pushed into your dashboard automatically.
          </p>

          <div className="text-center text-xs uppercase tracking-wide text-gray-400">
            or use Google (no extension sync)
          </div>

          <Button
            className="w-full"
            variant="outline"
            size="lg"
            onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
          >
            <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Continue with Google
          </Button>
          <p className="text-xs text-center text-gray-500">
            Google login works great as a fallback
          </p>

          <div className="pt-4 border-t text-center space-y-3">
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
              href={`https://www.buymeacoffee.com/${buyMeACoffeeUsername}`}
              className="inline-flex items-center justify-center rounded-md border border-yellow-400 bg-yellow-300/80 px-4 py-2 text-sm font-semibold text-yellow-900 hover:bg-yellow-300"
              target="_blank"
              rel="noopener noreferrer"
            >
              ☕ Buy Me a Coffee
            </Link>
          </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
