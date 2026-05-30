# NoTrace - Burn-after-read Secret Sharing App

Built by **Engage Ad** | Lucknow, Uttar Pradesh, India

## Overview

NoTrace is a secure, zero-knowledge secret sharing application. Users can send encrypted messages that self-destruct after being read.

**Website:** notrace.co.in  
**Email:** mouhitkanaujia@gmail.com  
**Phone:** +91 9369524385

## Features

- 🔐 **AES-256-GCM Encryption** - End-to-end encrypted, browser-side
- 🔥 **Burn After Read** - Messages auto-delete after viewing
- 🔑 **Zero-Knowledge** - Server never sees plaintext
- 📱 **Mobile-First** - Responsive on all devices
- 🌍 **15+ Languages** - Multi-language support
- 🎨 **Dark/Light Modes** - Both themes supported

## Tech Stack

- **Frontend:** Next.js 14, React 18, Tailwind CSS
- **Database:** Supabase (PostgreSQL)
- **Deployment:** Vercel
- **Encryption:** Web Crypto API (AES-256-GCM)

## Getting Started

### Prerequisites

- Node.js 18+
- Supabase account
- Vercel account (for deployment)

### Installation

```bash
# Clone repository
git clone <your-repo>
cd notrace

# Install dependencies
npm install

# Setup environment variables
cp .env.local.example .env.local
# Edit .env.local with your credentials

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

### Environment Variables

```bash
NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
NEXT_PUBLIC_SUPPORT_EMAIL=mouhitkanaujia@gmail.com
NEXT_PUBLIC_SUPPORT_PHONE=+91 9369524385
NEXT_PUBLIC_COMPANY_NAME=Engage Ad
```

## Database Setup

Run migrations in Supabase SQL Editor:

See `docs/ENGAGE-AD-NOTRACE-COMPLETE-DOCUMENTATION.md` for SQL migrations.

## Build & Deploy

```bash
# Build for production
npm run build

# Start production server
npm start
```

Deploy to Vercel:

```bash
vercel
```

## Documentation

- `docs/ENGAGE-AD-NOTRACE-COMPLETE-DOCUMENTATION.md` - Complete specification
- `docs/PHASE-1-IMPLEMENTATION-GUIDE.md` - Development guide

## Support

**Email:** mouhitkanaujia@gmail.com  
**Phone:** +91 9369524385  
**Company:** Engage Ad, Lucknow, Uttar Pradesh, India

## License

All rights reserved © Engage Ad 2026
