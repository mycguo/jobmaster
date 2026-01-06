/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // Skip type checking during build (Next.js 15 has issues with generated types)
    // Run `npx tsc --noEmit` separately to check types
    ignoreBuildErrors: true,
  },
  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:3000'],
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
      },
    ],
  },
}

module.exports = nextConfig

