# NoTrace 🔐

> Burn-after-read. No accounts. No logs.

A secure, ephemeral secret-sharing app built with **Next.js 14**, **Supabase**, and deployed on **Vercel**.

---

## Stack

| Layer    | Tech                          |
|----------|-------------------------------|
| Frontend | Next.js 14 (App Router)       |
| Backend  | Next.js API Routes            |
| Database | Supabase (PostgreSQL)         |
| Hosting  | Vercel                        |
| Styling  | Tailwind CSS + JetBrains Mono |

---

## Features

- 🔥 Burn-after-read — secrets destroyed after one view
- 🔒 Optional password protection (SHA-256 hashed)
- ⏱ Link expiry: 5 min / 1 hr / 24 hrs / Never
- 📊 Admin dashboard with stats
- 🚫 No accounts, no tracking, no logs
- 📋 Copy link / Share / QR support

---

## Setup Guide

### 1. Clone & Install

```bash
git clone https://github.com/YOUR_USERNAME/notrace.git
cd notrace
npm install
```

### 2. Set up Supabase

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Open the **SQL Editor** in your project dashboard
3. Copy and run the entire contents of `supabase-schema.sql`
4. Go to **Project Settings → API** and copy:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` key → `SUPABASE_SERVICE_ROLE_KEY`

### 3. Configure Environment Variables

```bash
cp .env.local.example .env.local
```

Edit `.env.local` and fill in your values:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
ADMIN_SECRET_KEY=choose-a-strong-secret
```

### 4. Run Locally

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

---

## Deploy to Vercel

### Option A — Vercel CLI

```bash
npm install -g vercel
vercel
```

Follow the prompts, then add your environment variables:

```bash
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel env add SUPABASE_SERVICE_ROLE_KEY
vercel env add ADMIN_SECRET_KEY
```

### Option B — GitHub + Vercel Dashboard

1. Push this repo to GitHub
2. Go to [vercel.com](https://vercel.com) → **New Project** → Import your GitHub repo
3. In **Environment Variables**, add all 4 keys from your `.env.local`
4. Click **Deploy** ✅

---

## Admin Dashboard

Visit `/admin` on your deployed site. Enter your `ADMIN_SECRET_KEY` to view:
- Total secrets created
- Total secrets read
- Active secrets (unread)
- Destroyed secrets

---

## Project Structure

```
├── app/
│   ├── layout.tsx           # Root layout
│   ├── page.tsx             # Compose page
│   ├── s/[id]/page.tsx      # Secret read page
│   ├── admin/page.tsx       # Admin dashboard
│   └── api/
│       ├── create/route.ts  # POST — create secret
│       ├── read/route.ts    # GET peek / POST reveal
│       └── admin/route.ts   # GET stats
├── components/
│   ├── ComposeView.tsx      # Secret creation UI
│   ├── ReadView.tsx         # Secret reveal UI
│   ├── AdminView.tsx        # Admin dashboard UI
│   ├── Header.tsx
│   └── Footer.tsx
├── lib/
│   ├── supabase.ts          # Supabase client
│   └── utils.ts             # Helpers
├── types/index.ts
└── supabase-schema.sql      # Run this in Supabase SQL editor
```

---

## Security Notes

- All secrets stored as plain text in Supabase (encrypt at rest via Supabase's built-in encryption)
- Passwords hashed with SHA-256 client-side before storage
- Service role key never exposed to the browser
- RLS enabled — all DB access goes through server-side API routes only
- Secrets marked `is_read = true` immediately on first access

---

## License

MIT
