# Getting Started with Job Search Agent (Next.js)

Welcome! This guide will help you get the Next.js version of Job Search Agent up and running.

## ✅ What's Been Built

The foundation of the Next.js application is complete! Here's what's ready:

### ✨ Core Infrastructure (100%)
- ✅ Next.js 14 with App Router
- ✅ TypeScript configuration
- ✅ Tailwind CSS + Radix UI
- ✅ Prisma ORM setup
- ✅ PostgreSQL + pgvector integration

### 🔐 Authentication (100%)
- ✅ NextAuth.js v5 configured
- ✅ Google OAuth provider
- ✅ LinkedIn OAuth provider
- ✅ Protected routes middleware
- ✅ Login page with styled OAuth buttons

### 🤖 AI/ML Layer (100%)
- ✅ LangChain.js integration
- ✅ Google Gemini embeddings
- ✅ Job parser (extract details from text)
- ✅ Job matcher (calculate match scores)
- ✅ Cover letter generator
- ✅ Chat chains for Q&A

### 🔌 API Routes (100%)
- ✅ `/api/jobs` - Chrome extension endpoint
- ✅ `/api/applications` - Full CRUD
- ✅ `/api/applications/[id]` - Single application operations
- ✅ `/api/applications/stats` - Analytics
- ✅ `/api/ai/match` - Job matching
- ✅ `/api/ai/cover-letter` - Cover letter generation

### 💾 Database Layer (100%)
- ✅ Vector store implementation
- ✅ Applications database operations
- ✅ User isolation
- ✅ Full CRUD operations
- ✅ Statistics and analytics

### 🎨 UI Foundation (50%)
- ✅ Landing page
- ✅ Login page
- ✅ Base layout
- ✅ Button and Card components
- ⏳ Dashboard (pending)
- ⏳ Applications page (pending)
- ⏳ Other pages (pending)

## 🚀 Quick Start

### 1. Install Dependencies

\`\`\`bash
cd nextjs-app
npm install
\`\`\`

### 2. Set Up Environment Variables

\`\`\`bash
cp .env.example .env
\`\`\`

Edit `.env` and add:

\`\`\`env
# Database (use your existing Neon.tech connection)
DATABASE_URL="postgresql://..."

# NextAuth (generate secret with: openssl rand -base64 32)
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-generated-secret"

# Google API Key (for AI features)
GOOGLE_API_KEY="your-google-api-key"

# OAuth (update redirect URIs in consoles)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

LINKEDIN_CLIENT_ID="your-linkedin-client-id"
LINKEDIN_CLIENT_SECRET="your-linkedin-client-secret"
\`\`\`

### 3. Set Up Database

\`\`\`bash
# Generate Prisma client
npx prisma generate

# Push schema to database (won't drop existing data)
npx prisma db push

# (Optional) Open Prisma Studio to view data
npx prisma studio
\`\`\`

### 4. Update OAuth Redirect URIs

**Google Cloud Console:**
1. Go to APIs & Services → Credentials
2. Edit your OAuth 2.0 Client
3. Add authorized redirect URI:
   - `http://localhost:3000/api/auth/callback/google`
   - `https://yourdomain.com/api/auth/callback/google`

**LinkedIn Developer Portal:**
1. Go to your app settings
2. Add authorized redirect URL:
   - `http://localhost:3000/api/auth/callback/linkedin`
   - `https://yourdomain.com/api/auth/callback/linkedin`

### 5. Run Development Server

\`\`\`bash
npm run dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000)

## 🧪 Test the Application

### Test Authentication
1. Go to http://localhost:3000
2. Click "Get Started" or "Log In"
3. Sign in with Google or LinkedIn
4. Should redirect to /dashboard

### Test API (Chrome Extension Endpoint)

\`\`\`bash
curl -X POST http://localhost:3000/api/jobs \\
  -H "Content-Type: application/json" \\
  -d '{
    "job_url": "https://example.com/job",
    "page_content": "Software Engineer at Google. Requirements: Python, React...",
    "user_id": "test@example.com"
  }'
\`\`\`

Expected response:
\`\`\`json
{
  "success": true,
  "application_id": "app_abc123",
  "company": "Google",
  "role": "Software Engineer",
  "parsed_job": { ... }
}
\`\`\`

### Test Database

\`\`\`bash
# Open Prisma Studio
npx prisma studio

# Check vector documents
psql $DATABASE_URL -c "SELECT COUNT(*) FROM vector_documents;"
\`\`\`

## 📋 Next Steps

Now that the foundation is ready, here's what to build next:

### Phase 7: Core Pages (High Priority)
1. **Dashboard Page** (`/dashboard`)
   - Key metrics (total apps, active, response rate)
   - Charts (funnel, timeline, status distribution)
   - Recent activity
   - Action items

2. **Applications Page** (`/applications`)
   - Kanban board view
   - Application cards
   - Create/edit forms
   - Detail view with tabs

3. **Application Detail**
   - Full application info
   - AI analysis tab
   - Timeline view
   - Edit capabilities

### Phase 8: Remaining Pages (Medium Priority)
- Resume management
- Interview prep
- Interview schedule
- Companies
- Questions
- Upload documents

### Phase 9: Testing & Migration (High Priority)
- Write unit tests
- Create data migration scripts
- Test with real data
- User acceptance testing

### Phase 10: Deployment (Medium Priority)
- Deploy to Vercel
- Configure production database
- Set up monitoring
- Update Chrome extension

## 🔧 Development Tips

### Hot Reload
Next.js automatically reloads when you save files. No need to restart the server.

### TypeScript
The app is fully typed. VS Code will show errors immediately.

### Prisma Studio
Great for viewing/editing database records:
\`\`\`bash
npx prisma studio
\`\`\`

### Debugging
Use Chrome DevTools and VS Code debugger. Add breakpoints in your code.

### Database Changes
After modifying \`prisma/schema.prisma\`:
\`\`\`bash
npx prisma generate  # Regenerate client
npx prisma db push   # Update database
\`\`\`

## 🐛 Troubleshooting

### "Module not found" errors
\`\`\`bash
rm -rf node_modules .next
npm install
\`\`\`

### Database connection errors
- Verify `DATABASE_URL` in `.env`
- Check if PostgreSQL is running
- Ensure pgvector extension is installed

### OAuth errors
- Verify redirect URIs are correct
- Check client ID and secret
- Ensure NEXTAUTH_URL matches your domain

### TypeScript errors
\`\`\`bash
npx tsc --noEmit  # Check for errors
\`\`\`

## 📚 Helpful Commands

\`\`\`bash
# Development
npm run dev              # Start dev server
npm run build            # Build for production
npm run start            # Start production server
npm run lint             # Run ESLint

# Database
npx prisma studio        # Visual database editor
npx prisma generate      # Regenerate Prisma client
npx prisma db push       # Push schema changes
npx prisma migrate dev   # Create migration

# Testing
npm test                 # Run tests
npm run test:watch       # Watch mode
\`\`\`

## 🎯 Project Structure Guide

\`\`\`
src/
├── app/                   # Next.js App Router
│   ├── api/              # API routes (backend)
│   ├── (auth)/           # Auth pages (login)
│   ├── (dashboard)/      # Protected pages
│   └── layout.tsx        # Root layout
│
├── components/           # React components
│   ├── ui/              # Reusable UI components
│   └── ...              # Feature components
│
├── lib/                  # Core business logic
│   ├── db/              # Database operations
│   ├── ai/              # AI/ML functions
│   ├── auth.ts          # Auth configuration
│   └── utils.ts         # Utilities
│
└── types/               # TypeScript types
\`\`\`

## 💡 Tips for Building Pages

1. **Start with the layout**
   - Use the dashboard layout as a template
   - Add navigation and user menu

2. **Create the UI first**
   - Build static version with mock data
   - Add styles and responsiveness
   - Test on different screen sizes

3. **Add data fetching**
   - Use React Server Components for data
   - Use Client Components for interactivity
   - Handle loading and error states

4. **Connect to API**
   - Test API endpoints first
   - Add proper error handling
   - Show feedback to users

## 🤝 Need Help?

- Check [IMPLEMENTATION_STATUS.md](./IMPLEMENTATION_STATUS.md) for progress
- Read [MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md) for migration details
- See [README.md](./README.md) for full documentation
- Open an issue on GitHub

## 🎉 You're Ready!

The foundation is solid. Start with the dashboard page and applications page, then work through the remaining features. Good luck! 🚀

