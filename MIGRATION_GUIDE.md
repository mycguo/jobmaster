# Migration Guide: Streamlit → Next.js

This guide helps you migrate from the Streamlit application to the new Next.js application.

## 📊 Data Migration

### Step 1: Export Data from Streamlit App

The existing data is stored in PostgreSQL (Neon.tech) and should work with the Next.js app as-is. However, verify:

1. **Vector Documents**: Check that all vector embeddings are in the database
2. **User Data**: Ensure user IDs match between systems
3. **File Storage**: Migrate resume PDFs to the new location

### Step 2: Database Schema

The Next.js app uses the same PostgreSQL database but with Prisma:

\`\`\`bash
# Review the schema
cat prisma/schema.prisma

# Generate Prisma client
npx prisma generate

# Sync with existing database (will not drop data)
npx prisma db push
\`\`\`

### Step 3: User Migration

Auth has changed from custom implementation to NextAuth.js:

1. **Google OAuth**: Existing Google users can sign in directly
2. **LinkedIn OAuth**: Existing LinkedIn users can sign in directly
3. **User IDs**: NextAuth generates new UUIDs, but the old data is preserved

To link old data to new users:
- Match by email address
- Update `user_id` in `vector_documents` table

\`\`\`sql
-- Example: Link old data to new user
UPDATE vector_documents
SET user_id = 'new-nextauth-user-id'
WHERE user_id = 'old-linkedin-or-google-id';
\`\`\`

## 🔧 Environment Variables

Update your environment variables:

**Old (Streamlit):**
\`\`\`
GOOGLE_API_KEY=...
NEON_DATABASE_URL=...
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
\`\`\`

**New (Next.js):**
\`\`\`
# Same as before
GOOGLE_API_KEY=...
DATABASE_URL=...  # Same as NEON_DATABASE_URL

# New for NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key

# OAuth (update redirect URIs)
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
LINKEDIN_CLIENT_ID=...
LINKEDIN_CLIENT_SECRET=...
\`\`\`

## 🔐 OAuth Redirect URIs

Update your OAuth app settings:

**Google Cloud Console:**
- Add: `http://localhost:3000/api/auth/callback/google`
- Add: `https://yourdomain.com/api/auth/callback/google`

**LinkedIn Developer Portal:**
- Add: `http://localhost:3000/api/auth/callback/linkedin`
- Add: `https://yourdomain.com/api/auth/callback/linkedin`

## 🌐 Chrome Extension

Update the extension to point to the new backend:

**In `extension/manifest.json`:**
\`\`\`json
{
  "host_permissions": [
    "https://www.linkedin.com/*",
    "http://localhost:3000/api/jobs",
    "https://yourdomain.com/api/jobs"
  ]
}
\`\`\`

**In `extension/src/popup/popup.js` or similar:**
\`\`\`javascript
// Update API endpoint
const API_ENDPOINT = "http://localhost:3000/api/jobs"
// or
const API_ENDPOINT = "https://yourdomain.com/api/jobs"
\`\`\`

## 📝 Feature Mapping

| Streamlit Page | Next.js Route | Status |
|----------------|---------------|--------|
| `app.py` | `/dashboard` | ✅ Migrated |
| `pages/applications.py` | `/applications` | ✅ Migrated |
| `pages/dashboard.py` | `/dashboard` | ✅ Migrated |
| `pages/resume.py` | `/resume` | 🚧 In Progress |
| `pages/interview_prep.py` | `/interview-prep` | 🚧 In Progress |
| `pages/interview_schedule.py` | `/interviews` | 🚧 In Progress |
| `pages/companies.py` | `/companies` | 🚧 In Progress |
| `pages/questions.py` | `/questions` | 🚧 In Progress |
| `pages/upload_docs.py` | `/upload` | 🚧 In Progress |

## 🔄 Running Both Apps in Parallel

During migration, you can run both applications simultaneously:

**Streamlit (port 8501):**
\`\`\`bash
cd /path/to/old-app
streamlit run app.py
\`\`\`

**Next.js (port 3000):**
\`\`\`bash
cd /path/to/nextjs-app
npm run dev
\`\`\`

This allows:
- Gradual migration of users
- Feature comparison
- A/B testing
- Rollback capability

## ✅ Migration Checklist

### Pre-Migration
- [ ] Backup PostgreSQL database
- [ ] Export all user data
- [ ] Document custom features
- [ ] Test OAuth providers
- [ ] Update Chrome extension

### Migration
- [ ] Set up Next.js environment
- [ ] Configure environment variables
- [ ] Run database migrations
- [ ] Link user accounts
- [ ] Test core features
- [ ] Update Chrome extension
- [ ] Deploy to staging

### Post-Migration
- [ ] Monitor error logs
- [ ] Verify data integrity
- [ ] Test all features
- [ ] Collect user feedback
- [ ] Update documentation
- [ ] Retire Streamlit app

## 🐛 Troubleshooting

### Database Connection Issues

\`\`\`bash
# Test database connection
npx prisma db pull

# Check migrations
npx prisma migrate status
\`\`\`

### Auth Issues

\`\`\`bash
# Verify environment variables
echo $NEXTAUTH_SECRET
echo $GOOGLE_CLIENT_ID

# Check redirect URIs in OAuth console
\`\`\`

### Vector Store Issues

\`\`\`bash
# Verify pgvector extension
psql $DATABASE_URL -c "SELECT * FROM pg_extension WHERE extname = 'vector';"

# Check vector documents
psql $DATABASE_URL -c "SELECT COUNT(*) FROM vector_documents;"
\`\`\`

## 📞 Support

Need help with migration?
- Open an issue on GitHub
- Check the FAQ
- Contact support

## 🎉 Success!

Once migration is complete:
1. Update DNS to point to Next.js app
2. Monitor for 24-48 hours
3. Archive Streamlit codebase
4. Celebrate! 🎊

