/**
 * NextAuth type declarations
 */

import { DefaultSession } from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      provider?: string
      vectorUserId?: string
    } & DefaultSession["user"]
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    provider?: string
    vectorUserId?: string
  }
}
