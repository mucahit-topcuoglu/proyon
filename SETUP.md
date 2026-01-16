# 🚧 Supabase Setup Required

This project requires Supabase client to be installed.

## Quick Setup:

1. Install Supabase:
```bash
npm install @supabase/supabase-js
```

2. Create `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
GEMINI_API_KEY=your-gemini-api-key
```

3. Run database migration:
- Copy `supabase/migrations/20251218000001_initial_schema.sql`
- Paste in Supabase Dashboard → SQL Editor
- Run the migration

4. Restart dev server:
```bash
npm run dev
```

## Current Status:

✅ Dashboard components created
✅ AI engines ready (generateRoadmap, analyzeIssue)
✅ Database schema designed
⏳ Awaiting Supabase credentials

## What's Working Without Supabase:

- Homepage
- Design system
- UI components

## What Needs Supabase:

- Project dashboard (`/dashboard/projects/[id]`)
- AI roadmap generation (saves to database)
- Mentor chat (message history)
- User authentication

---

**Next:** Get Supabase credentials and install the client!
