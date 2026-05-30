# NoTrace - Phase 1 Setup Guide

By Engage Ad | mouhitkanaujia@gmail.com | +91 9369524385

## Quick Start

### Step 1: Clone & Install

```bash
# Clone the repository
cd notrace

# Install dependencies
npm install
```

### Step 2: Configure Environment

```bash
# Edit .env.local with your Supabase credentials
nano .env.local

# Required values:
# - NEXT_PUBLIC_SUPABASE_URL
# - NEXT_PUBLIC_SUPABASE_ANON_KEY
```

### Step 3: Database Setup

1. Create Supabase project at supabase.com
2. Go to SQL Editor
3. Copy SQL from `docs/ENGAGE-AD-NOTRACE-COMPLETE-DOCUMENTATION.md` → DATABASE MIGRATIONS section
4. Run all SQL migrations

### Step 4: Run Development Server

```bash
npm run dev
```

Visit http://localhost:3000

---

## File Structure

```
notrace/
├── app/                    # Next.js app directory
│   ├── page.tsx            # Landing page (/)
│   ├── layout.tsx          # Root layout
│   ├── globals.css         # Global styles
│   └── api/                # API routes (to be created)
├── components/             # React components (to be created)
├── lib/
│   ├── crypto.ts          # ✅ Encryption utilities
│   └── supabase.ts        # ✅ Database client
├── types/
│   └── index.ts           # ✅ TypeScript types
├── public/                 # Static files
├── docs/
│   ├── ENGAGE-AD-NOTRACE-COMPLETE-DOCUMENTATION.md
│   └── PHASE-1-IMPLEMENTATION-GUIDE.md
├── package.json           # ✅ Dependencies
├── tsconfig.json          # ✅ TypeScript config
├── next.config.js         # ✅ Next.js config
├── tailwind.config.ts     # ✅ Tailwind config
└── .env.local             # ✅ Environment variables
```

---

## Next Phase (Task 1.3-1.8)

After setup, implement:

1. **API Routes** - Create secret, read secret, testimonials
2. **Landing Page** - Hero, features, pricing, FAQ
3. **App Component** - Create/read secrets, collections
4. **Additional Features** - QR codes, share buttons

See `docs/PHASE-1-IMPLEMENTATION-GUIDE.md` for detailed tasks.

---

## Useful Commands

```bash
# Development
npm run dev              # Start dev server
npm run build           # Build for production
npm run start           # Start production server
npm run lint            # Run ESLint
npm run type-check      # TypeScript check

# Database
# See Supabase dashboard for SQL Editor

# Deployment
vercel                  # Deploy to Vercel
```

---

## Support

**Email:** mouhitkanaujia@gmail.com  
**Phone:** +91 9369524385  
**Company:** Engage Ad

