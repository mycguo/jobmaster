/**
 * Middleware for protected routes
 */

export { default } from "next-auth/middleware"

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/applications/:path*",
    "/resume/:path*",
    "/interview-prep/:path*",
    "/interviews/:path*",
    "/companies/:path*",
    "/questions/:path*",
  ],
}

