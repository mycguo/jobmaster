# Job Search Agent - Next.js

> AI-powered job search management application built with Next.js 14

## 🚀 Features

- **Application Tracking**: Manage job applications with a visual Kanban board
- **AI-Powered Analysis**: Job matching, requirements extraction, cover letter generation
- **Interview Prep**: Question bank, practice sessions, company research
- **Resume Management**: Version control for your resumes
- **Analytics**: Track response rates, interview conversion, and more
- **Chrome Extension**: Save jobs directly from LinkedIn
- **OAuth Authentication**: Google and LinkedIn login

## 🛠️ Tech Stack

- **Frontend**: Next.js 14 (App Router), React 18, TypeScript
- **Styling**: Tailwind CSS, Radix UI
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL + pgvector (Neon.tech)
- **ORM**: Prisma
- **Auth**: NextAuth.js v5
- **AI/ML**: LangChain.js, Google Gemini

## 📋 Prerequisites

- Node.js 18+ 
- PostgreSQL with pgvector extension (or Neon.tech account)
- Google API Key (for Gemini AI)
- OAuth credentials (Google and/or LinkedIn)

## 🏗️ Setup

### 1. Install Dependencies

\`\`\`bash
npm install
\`\`\`

### 2. Environment Variables

Copy `.env.example` to `.env` and fill in your values:

\`\`\`bash
cp .env.example .env
\`\`\`

Required variables:
- `DATABASE_URL`: PostgreSQL connection string
- `NEXTAUTH_SECRET`: Generate with `openssl rand -base64 32`
- `GOOGLE_API_KEY`: For AI features
- `GOOGLE_CLIENT_ID` & `GOOGLE_CLIENT_SECRET`: For OAuth
- `LINKEDIN_CLIENT_ID` & `LINKEDIN_CLIENT_SECRET`: For LinkedIn OAuth

### 3. Database Setup

\`\`\`bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev

# (Optional) Open Prisma Studio
npx prisma studio
\`\`\`

### 4. Run Development Server

\`\`\`bash
npm run dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

\`\`\`
nextjs-app/
├── prisma/
│   └── schema.prisma          # Database schema
├── src/
│   ├── app/                   # Next.js App Router
│   │   ├── (auth)/           # Auth routes
│   │   ├── (dashboard)/      # Protected routes
│   │   ├── api/              # API routes
│   │   │   ├── auth/         # NextAuth
│   │   │   ├── jobs/         # Chrome extension endpoint
│   │   │   ├── applications/ # Application CRUD
│   │   │   └── ai/           # AI features
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/            # React components
│   │   ├── ui/               # UI primitives
│   │   └── ...
│   ├── lib/                   # Core logic
│   │   ├── db/               # Database layer
│   │   ├── ai/               # AI/ML functions
│   │   ├── auth.ts           # NextAuth config
│   │   └── utils.ts
│   └── types/                 # TypeScript types
└── extension/                 # Chrome extension (unchanged)
\`\`\`

## 🔌 Chrome Extension

The Chrome extension is located in the `/extension` directory and works with both the Streamlit and Next.js backends.

To use with Next.js:
1. Update `extension/manifest.json` host permissions to include your Next.js URL
2. The `/api/jobs` endpoint maintains compatibility with the existing extension

## 🧪 Testing

\`\`\`bash
# Run tests
npm test

# Watch mode
npm run test:watch
\`\`\`

## 📦 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy!

### Database

Keep using Neon.tech for PostgreSQL + pgvector:
- Automatic connection pooling for serverless
- Built-in pgvector support
- Free tier available

## 🔄 Migration from Streamlit

See [MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md) for detailed migration instructions.

## 📝 API Documentation

### Chrome Extension Endpoint

\`\`\`
POST /api/jobs
Content-Type: application/json

{
  "job_url": "https://...",
  "page_content": "...",
  "user_id": "user@example.com",
  "notes": "Optional notes",
  "status": "tracking"
}
\`\`\`

### Application APIs

- `GET /api/applications` - List applications
- `POST /api/applications` - Create application
- `GET /api/applications/[id]` - Get application
- `PATCH /api/applications/[id]` - Update application
- `DELETE /api/applications/[id]` - Delete application
- `GET /api/applications/stats` - Get statistics

### AI APIs

- `POST /api/ai/match` - Analyze job match
- `POST /api/ai/cover-letter` - Generate cover letter

## 🤝 Contributing

Contributions are welcome! Please read our contributing guidelines first.

## 📄 License

MIT

## 💬 Support

For issues and questions, please open a GitHub issue or contact support.

## 🙏 Acknowledgments

- Original Streamlit application by [Your Name]
- Built with Next.js, React, and LangChain
- Powered by Google Gemini AI

