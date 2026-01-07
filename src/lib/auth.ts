/**
 * NextAuth.js configuration
 * Migrated from Python storage/auth_utils.py
 */

import { NextAuthOptions } from "next-auth"
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import GoogleProvider from "next-auth/providers/google"
import LinkedInProvider from "next-auth/providers/linkedin"
import { prisma } from "@/lib/prisma"
import { buildVectorUserId } from "@/lib/user-ids"

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
        },
      },
    }),
    LinkedInProvider({
      clientId: process.env.LINKEDIN_CLIENT_ID!,
      clientSecret: process.env.LINKEDIN_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: "profile email openid",
        },
      },
      wellKnown: "https://www.linkedin.com/oauth/.well-known/openid-configuration",
      profile(profile) {
        return {
          id: profile.sub,
          name: profile.name || `${profile.given_name || ""} ${profile.family_name || ""}`.trim(),
          email: profile.email,
          image: profile.picture,
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      if (account?.provider) {
        token.provider = account.provider
      }

      const provider = (token.provider as string | undefined) || account?.provider
      const email = user?.email || (token.email as string | undefined)
      const fallbackId = (user as any)?.id || token.sub || token.id

      token.vectorUserId = buildVectorUserId({
        provider,
        email,
        fallback: fallbackId,
      })

      return token
    },
    async session({ session, token, user }) {
      if (!session.user) {
        return session
      }

      const adapterUser = user as typeof user & {
        provider?: string | null
        vectorUserId?: string | null
      }

      const resolvedId = token?.sub || adapterUser?.id || session.user.id
      if (resolvedId) {
        session.user.id = resolvedId
      }

      let provider =
        (token?.provider as string | undefined) ||
        adapterUser?.provider ||
        session.user.provider

      let vectorUserId =
        (token?.vectorUserId as string | undefined) ||
        adapterUser?.vectorUserId ||
        session.user.vectorUserId

      if (!provider || !vectorUserId) {
        const account = resolvedId
          ? await prisma.account.findFirst({
              where: { userId: resolvedId },
              select: { provider: true },
            })
          : null

        provider = provider || account?.provider || null
        vectorUserId =
          vectorUserId ||
          buildVectorUserId({
            provider,
            email: session.user.email,
            fallback: resolvedId,
          })
      }

      session.user.provider = provider || null
      session.user.vectorUserId =
        vectorUserId || session.user.email || session.user.id

      return session
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: {
    strategy: "database",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  debug: process.env.NODE_ENV === "development",
}
