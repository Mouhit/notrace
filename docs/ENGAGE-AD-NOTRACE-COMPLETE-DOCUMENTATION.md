# NoTrace - Complete Documentation

**Product by:** Engage Ad
**Owner:** Mohit
**Location:** Lucknow, Uttar Pradesh, India
**Email:** mouhitkanaujia@gmail.com
**Phone:** +91 9369524385
**GST:** 09GVRPK4451F2Z3

**Last Updated:** May 30, 2026
**Project:** NoTrace - Burn-after-read secret sharing app

---

## TABLE OF CONTENTS

1. [Project Overview](#project-overview)
2. [Architecture](#architecture)
3. [API Contracts](#api-contracts)
4. [Current Tasks](#current-tasks)
5. [Decisions & Constraints](#decisions--constraints)
6. [Setup & Development Guide](#setup--development-guide)
7. [Database Migrations](#database-migrations)
8. [Security Checklist](#security-checklist)
9. [Subscription Model](#subscription-model)

---

---

# PROJECT OVERVIEW

## What is NoTrace?

NoTrace is a **burn-after-read secret sharing application** by Engage Ad. Users can send encrypted messages that self-destruct after being read, with zero-knowledge encryption ensuring complete privacy.

**Live URL:** notrace.co.in
**Owner:** Engage Ad, Lucknow, India

---

## Company Information

**Engage Ad**
- **Founded:** 2016
- **Type:** MSME Digital/AI Agency
- **Location:** Lucknow, Uttar Pradesh, India
- **GST:** 09GVRPK4451F2Z3
- **Founder/CEO:** Mohit
- **Email:** mouhitkanaujia@gmail.com
- **Phone:** +91 9369524385

---

## Core Promise

**"Send secrets that self-destruct. End-to-end encrypted. Zero-knowledge. No accounts. No logs."**

---

## Key Features

1. **Burn After Read** - Message automatically deleted after recipient reads it
2. **AES-256-GCM Encryption** - Browser-side encryption, server never sees plaintext
3. **Password Protection** - Optional password for additional security
4. **QR Code Generation** - Generate QR codes to share secrets
5. **Collections/Folders** - Organize secrets into folders/collections
6. **15+ Language Support** - Multi-language UI
7. **Social Proof Counter** - Track secrets sent (manual increment, hidden from users initially)
8. **Testimonials Section** - Users can submit reviews/testimonials
9. **Responsive Design** - Mobile-first, very mobile friendly

---

## Technology Stack

- **Frontend:** Next.js 14
- **Styling:** Tailwind CSS
- **Database:** Supabase (PostgreSQL)
- **Deployment:** Vercel
- **Authentication:** Anonymous (no login required for free)
- **Encryption:** AES-256-GCM (browser-side)

---

## Design Philosophy

- **Corporate tone** - Professional, trustworthy
- **Balanced messaging** - Not too casual, not too serious
- **Dark & Light modes** - Support both themes
- **Mobile-first** - Optimized for mobile devices
- **Simple text logo** - "NoTrace" as brand

---

## User Journey

```
User A (Sender)
├─ Goes to notrace.co.in
├─ Creates secret message
├─ Sets optional password
├─ Gets shareable link
├─ Shares link (email, chat, QR code)
└─ Message auto-deletes when User B reads it

User B (Recipient)
├─ Receives link from User A
├─ Opens link
├─ Enters password (if required)
├─ Reads message
├─ Message burns from database
└─ Link becomes inaccessible
```

---

## Monetization Model

**5 Pricing Tiers:**

1. **Free Tier** - Limited features, basic functionality
2. **Trial ($1.99/month)** - More features
3. **Pro ($4.99/month)** - Standard features
4. **Business ($9.99/month)** - Team access, unlimited
5. **Enterprise ($19.99/month)** - Custom features, unlimited

---

## Contact & Support

**For support or inquiries:**
- Email: mouhitkanaujia@gmail.com
- Phone: +91 9369524385
- Company: Engage Ad
- Website: notrace.co.in

---

## What We Are NOT Building

- ❌ P2P Chat (removed, too complex)
- ❌ User accounts required for free (anonymous only)
- ❌ Blog on main landing page (separate)
- ❌ Mandatory testimonials (all optional)
- ❌ Newsletter signup (not necessary)
- ❌ Social proof counter visible (hidden, manual increment)

---

## Current Status

**Fresh start from scratch**

- Previous P2P chat implementation removed
- Building clean, focused NoTrace app
- Landing page as main entry point
- Separate /app for main functionality

---

## Brand Colors

- **Primary:** #00e5a0 (green - trust, security)
- **Dark Mode:** #0f172a (dark slate)
- **Light Mode:** #f8fafc (light slate)
- **Text (dark):** #e2e8f0
- **Text (light):** #1e293b

---

---

# ARCHITECTURE

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    USER BROWSER                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Landing Page (/)        Main App (/app)                   │
│  ├─ Hero                 ├─ Create secret                  │
│  ├─ Features             ├─ Read secret                    │
│  ├─ Pricing              ├─ Collections                    │
│  ├─ How it works         └─ User settings                  │
│  ├─ Testimonials                                           │
│  └─ FAQ                  Encryption/Decryption (Client)    │
│                          ├─ AES-256-GCM encrypt            │
│                          ├─ Generate keys                  │
│                          └─ Decrypt locally                │
└─────────────────────────────────────────────────────────────┘
                              ↑↓
                    NEXT.JS API ROUTES
                          /api/*
                              ↑↓
┌─────────────────────────────────────────────────────────────┐
│                  SUPABASE (Backend)                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  PostgreSQL Database                                       │
│  ├─ secrets (encrypted blobs)                              │
│  ├─ collections                                            │
│  ├─ testimonials                                           │
│  ├─ users (for paid users)                                 │
│  ├─ subscriptions (payment history)                        │
│  └─ usage_stats                                            │
│                                                             │
│  Auth: Email/password (paid users only)                    │
│  Storage: File uploads (if needed)                         │
└─────────────────────────────────────────────────────────────┘
                              ↑↓
                    VERCEL DEPLOYMENT
```

---

## Project Structure

```
notrace/
├─ app/
│  ├─ page.tsx                    # Landing page (/)
│  ├─ layout.tsx                  # Root layout
│  ├─ globals.css                 # Global styles
│  ├─ app/
│  │  └─ page.tsx                 # Main app (/app)
│  └─ api/
│     ├─ secrets/
│     │  ├─ create/route.ts
│     │  ├─ read/route.ts
│     │  ├─ delete/route.ts
│     │  └─ list/route.ts
│     ├─ collections/
│     │  ├─ create/route.ts
│     │  ├─ update/route.ts
│     │  └─ list/route.ts
│     ├─ testimonials/
│     │  ├─ submit/route.ts
│     │  └─ list/route.ts
│     ├─ auth/
│     │  ├─ signup/route.ts
│     │  ├─ login/route.ts
│     │  └─ logout/route.ts
│     ├─ payment/
│     │  ├─ create-subscription/route.ts
│     │  └─ webhook/route.ts
│     ├─ user/
│     │  ├─ profile/route.ts
│     │  └─ usage/route.ts
│     └─ stats/
│        └─ increment/route.ts
├─ components/
│  ├─ landing/
│  │  ├─ Hero.tsx
│  │  ├─ Features.tsx
│  │  ├─ Pricing.tsx
│  │  ├─ HowItWorks.tsx
│  │  ├─ Testimonials.tsx
│  │  ├─ FAQ.tsx
│  │  └─ CTA.tsx
│  ├─ app/
│  │  ├─ CreateSecret.tsx
│  │  ├─ ReadSecret.tsx
│  │  ├─ Collections.tsx
│  │  └─ Settings.tsx
│  ├─ shared/
│  │  ├─ Header.tsx
│  │  ├─ Footer.tsx
│  │  ├─ ThemeToggle.tsx
│  │  └─ LanguageSwitcher.tsx
│  └─ modals/
│     ├─ TestimonialModal.tsx
│     └─ ShareModal.tsx
├─ lib/
│  ├─ crypto.ts
│  ├─ supabase.ts
│  ├─ language.ts
│  ├─ theme.ts
│  └─ utils.ts
├─ types/
│  └─ index.ts
├─ public/
│  ├─ logo.png
│  ├─ og-image.png
│  └─ favicon.ico
└─ docs/
   └─ (all markdown files)
```

---

## Database Schema

### `secrets` Table
```sql
CREATE TABLE secrets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  encrypted_blob TEXT NOT NULL,
  password_hash VARCHAR(255),
  collection_id UUID,
  expires_at TIMESTAMP NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMP,
  created_by_tier VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### `collections` Table
```sql
CREATE TABLE collections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### `users` Table (for paid users)
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  subscription_tier VARCHAR(50) DEFAULT 'free',
  subscription_status VARCHAR(50) DEFAULT 'active',
  subscription_start_at TIMESTAMP,
  subscription_end_at TIMESTAMP,
  razorpay_subscription_id VARCHAR(255),
  secrets_created_today INT DEFAULT 0,
  last_secret_reset_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### `testimonials` Table
```sql
CREATE TABLE testimonials (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255),
  title VARCHAR(255),
  company VARCHAR(255),
  message TEXT NOT NULL,
  rating INT,
  email VARCHAR(255),
  avatar_url VARCHAR(500),
  approved BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### `subscriptions` Table
```sql
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id),
  tier VARCHAR(50) NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',
  razorpay_order_id VARCHAR(255),
  razorpay_payment_id VARCHAR(255),
  status VARCHAR(50) DEFAULT 'completed',
  period_start TIMESTAMP,
  period_end TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### `usage_stats` Table
```sql
CREATE TABLE usage_stats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  secrets_sent_count INT DEFAULT 0,
  updated_at TIMESTAMP DEFAULT NOW()
);
```

---

## Encryption Flow

### Create Secret
```
1. User types message in browser
2. Browser generates:
   ├─ Random encryption key
   ├─ Random salt
   └─ Message ID (UUID)
3. Browser encrypts: AES-256-GCM(message, key, salt)
4. Browser sends to server: {id, encrypted_blob, password_hash}
5. Server stores encrypted blob in database
6. Browser generates link: /secret?id=X#key=Y
7. User shares link
```

### Read Secret
```
1. User B opens link with id=X#key=Y
2. Browser extracts:
   ├─ ID from URL query
   └─ Key from URL fragment (#)
3. Browser requests: GET /api/secrets/read?id=X
4. Server returns: {encrypted_blob}
5. Browser decrypts: AES-256-GCM(blob, key)
6. Browser displays plaintext
7. Browser notifies: POST /api/secrets/read-confirm?id=X
8. Server marks is_read=true, deletes message
9. Link becomes inaccessible
```

---

## Key Design Decisions

1. **No User Accounts (Free)** - Anonymous, no login
2. **Email Login (Paid)** - Only paid users need accounts
3. **Browser-side Encryption** - Key never sent to server
4. **Delete on Read** - Message deleted immediately after reading
5. **Optional Password** - Additional security layer
6. **Stateless Design** - No session management for free users
7. **Mobile-first** - Responsive from ground up
8. **Dark & Light modes** - Theme support
9. **Multi-language** - 15+ languages supported

---

## Security Guarantees

- ✅ Server never has encryption key
- ✅ Server never has plaintext message
- ✅ Message deleted after reading
- ✅ No user tracking (free users)
- ✅ No logs of messages
- ✅ HTTPS only
- ✅ CORS properly configured

---

---

# API CONTRACTS

All API endpoints return JSON.

---

## Secrets API

### Create Secret

**POST** `/api/secrets/create`

**Request:**
```json
{
  "encrypted_blob": "string (AES-256-GCM encrypted)",
  "password_hash": "string (optional, SHA256 hash)",
  "collection_id": "uuid (optional)",
  "expires_in_minutes": "number (5, 30, 60, 1440, 10080)"
}
```

**Response (200):**
```json
{
  "success": true,
  "id": "uuid",
  "link": "notrace.co.in/secret?id=abc123#key=xyz789"
}
```

---

### Read Secret

**GET** `/api/secrets/read?id=UUID`

**Response (200):**
```json
{
  "success": true,
  "encrypted_blob": "string",
  "requires_password": boolean
}
```

**Response (410):**
```json
{
  "success": false,
  "error": "Secret not found or already read"
}
```

---

### Confirm Read & Delete

**POST** `/api/secrets/read-confirm`

**Request:**
```json
{
  "id": "uuid"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Secret deleted"
}
```

---

### List Secrets

**GET** `/api/secrets/list?collection_id=UUID`

**Response (200):**
```json
{
  "success": true,
  "secrets": [
    {
      "id": "uuid",
      "created_at": "timestamp",
      "expires_at": "timestamp",
      "is_read": boolean
    }
  ]
}
```

---

## Collections API

### Create Collection

**POST** `/api/collections/create`

**Request:**
```json
{
  "name": "string",
  "description": "string (optional)"
}
```

**Response (200):**
```json
{
  "success": true,
  "id": "uuid"
}
```

---

### List Collections

**GET** `/api/collections/list`

**Response (200):**
```json
{
  "success": true,
  "collections": [
    {
      "id": "uuid",
      "name": "string",
      "description": "string",
      "created_at": "timestamp"
    }
  ]
}
```

---

## Testimonials API

### Submit Testimonial

**POST** `/api/testimonials/submit`

**Request:**
```json
{
  "name": "string (optional)",
  "title": "string (optional)",
  "company": "string (optional)",
  "message": "string (required)",
  "rating": "number 1-5 (optional)",
  "email": "string (optional)"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Testimonial submitted. Will appear after review."
}
```

---

### List Approved Testimonials

**GET** `/api/testimonials/list`

**Response (200):**
```json
{
  "success": true,
  "testimonials": [
    {
      "id": "uuid",
      "name": "string",
      "title": "string",
      "company": "string",
      "message": "string",
      "rating": "number",
      "avatar_url": "string",
      "created_at": "timestamp"
    }
  ]
}
```

---

## Auth API (Paid Users)

### Sign Up

**POST** `/api/auth/signup`

**Request:**
```json
{
  "email": "string",
  "password": "string",
  "tier": "string (trial/pro/business/enterprise)"
}
```

**Response (200):**
```json
{
  "success": true,
  "user_id": "uuid",
  "token": "jwt_token"
}
```

---

### Login

**POST** `/api/auth/login`

**Request:**
```json
{
  "email": "string",
  "password": "string"
}
```

**Response (200):**
```json
{
  "success": true,
  "token": "jwt_token",
  "user": {
    "id": "uuid",
    "email": "string",
    "tier": "string"
  }
}
```

---

## Payment API

### Create Subscription

**POST** `/api/payment/create-subscription`

**Request:**
```json
{
  "tier": "string (trial/pro/business/enterprise)",
  "email": "string"
}
```

**Response (200):**
```json
{
  "success": true,
  "razorpay_order_id": "string",
  "amount": "number"
}
```

---

### Webhook

**POST** `/api/payment/webhook`

Razorpay webhook for payment confirmation. Creates user account on successful payment.

---

## User API (Paid Users)

### Get Profile

**GET** `/api/user/profile`

**Response (200):**
```json
{
  "success": true,
  "user": {
    "id": "uuid",
    "email": "string",
    "tier": "string",
    "secrets_created_today": "number",
    "subscription_end_at": "timestamp"
  }
}
```

---

### Get Usage

**GET** `/api/user/usage`

**Response (200):**
```json
{
  "success": true,
  "tier": "string",
  "daily_limit": "number",
  "used_today": "number",
  "remaining": "number",
  "max_expiry_days": "number"
}
```

---

## Error Responses

All errors follow this format:

```json
{
  "success": false,
  "error": "Error message",
  "status": "number"
}
```

### Common Status Codes

- **200** - OK
- **400** - Bad Request
- **401** - Unauthorized
- **404** - Not Found
- **410** - Gone (Secret deleted/expired)
- **500** - Server Error

---

---

# CURRENT TASKS

## Phase 1: Fresh Start from Scratch

**Status:** Planning complete, ready to build

### Task 1.1: Project Setup ✋ PENDING
- [ ] Create Next.js 14 project
- [ ] Install Tailwind CSS
- [ ] Configure Supabase client
- [ ] Setup environment variables
- [ ] Configure TypeScript
- [ ] Setup project structure

### Task 1.2: Database Setup ✋ PENDING
- [ ] Create Supabase project
- [ ] Create `secrets` table
- [ ] Create `collections` table
- [ ] Create `testimonials` table
- [ ] Create `usage_stats` table
- [ ] Setup proper indexes
- [ ] Setup auto-delete triggers (expired secrets)

### Task 1.3: Core Encryption Library ✋ PENDING
- [ ] Implement AES-256-GCM encryption
- [ ] Implement key generation
- [ ] Implement salt generation
- [ ] Password hashing (SHA256)
- [ ] Create crypto utilities (lib/crypto.ts)

### Task 1.4: Landing Page ✋ PENDING
- [ ] Header with nav (sticky)
- [ ] Hero section
- [ ] Problem section
- [ ] Solution section
- [ ] Features section (9 features)
- [ ] Pricing section (5 tiers)
- [ ] Use cases section
- [ ] Testimonials section with submit modal
- [ ] FAQ section (accordion)
- [ ] CTA section (bottom)
- [ ] Footer
- [ ] Dark/Light mode toggle
- [ ] Mobile responsive (very mobile friendly)

### Task 1.5: API Endpoints ✋ PENDING
- [ ] POST `/api/secrets/create` - Create secret
- [ ] GET `/api/secrets/read` - Read secret
- [ ] POST `/api/secrets/read-confirm` - Delete after read
- [ ] GET `/api/secrets/list` - List user's secrets
- [ ] POST `/api/collections/create` - Create collection
- [ ] GET `/api/collections/list` - List collections
- [ ] PUT `/api/collections/update` - Update collection
- [ ] POST `/api/testimonials/submit` - Submit testimonial
- [ ] GET `/api/testimonials/list` - Get approved testimonials
- [ ] POST `/api/stats/increment` - Increment counter (admin)

### Task 1.6: Main App (/app) ✋ PENDING
- [ ] Create Secret component (form + encryption)
- [ ] Read Secret component (decrypt + display)
- [ ] Collections management
- [ ] Secret sharing (copy link, QR code)
- [ ] Settings page
- [ ] Language switcher
- [ ] Theme toggle

### Task 1.7: Additional Features ✋ PENDING
- [ ] Auto-delete expired secrets (cron/scheduled task)
- [ ] Generate QR codes
- [ ] Copy to clipboard
- [ ] Share to WhatsApp/Email/etc.
- [ ] Responsive design across all breakpoints

### Task 1.8: Testing & Deployment ✋ PENDING
- [ ] Test all API endpoints
- [ ] Test encryption/decryption
- [ ] Test mobile responsiveness
- [ ] Setup Vercel deployment
- [ ] Configure custom domain (notrace.co.in)
- [ ] Setup SSL certificate
- [ ] Performance optimization

---

## Phase 2: Monetization (After Phase 1)

**Status:** Not started

- [ ] Implement user authentication
- [ ] Implement Razorpay integration
- [ ] Setup subscription tiers
- [ ] Implement usage limits (free vs paid)
- [ ] Add analytics

---

## Phase 3: Polish & Additional Features (After Phase 2)

**Status:** Not started

- [ ] Anti-screenshot detection
- [ ] One-time token system (advanced security)
- [ ] Scheduled messages
- [ ] Message analytics for sender
- [ ] Custom expiry times
- [ ] Bulk operations

---

## Current Focus

**Building from scratch:** Starting with project setup and database.

**Do NOT build:**
- P2P Chat ❌
- User authentication (login) for FREE users ❌
- Unnecessary features ❌

**Must build:**
- Landing page (all sections)
- Core encryption
- Secret create/read functionality
- Collections
- Testimonials

---

---

# DECISIONS & CONSTRAINTS

## Decided Features (FINAL)

### ✅ WILL BUILD
1. Burn-after-read secrets
2. AES-256-GCM encryption (browser-side)
3. Password protection (optional)
4. QR code generation
5. Collections/folders
6. 15+ language support
7. Social proof counter (hidden, manual increment)
8. Testimonials (user-submitted, all fields optional)
9. Responsive design (very mobile friendly)
10. Dark & Light modes
11. Razorpay payments (Phase 2)
12. 5 pricing tiers (Phase 2)

### ❌ WILL NOT BUILD
1. P2P Chat (removed, too complex)
2. User authentication/login for FREE users (anonymous only)
3. Blog section on landing page (separate later)
4. Real-time collaboration
5. File uploads (text only)
6. Message history/logs (by design)
7. Message editing
8. User accounts (free tier)

---

## Technical Decisions

### Database
- **Provider:** Supabase (PostgreSQL)
- **Reason:** Managed, reliable, good free tier
- **Tables:** secrets, collections, testimonials, usage_stats, users, subscriptions
- **Auto-delete:** Triggered on read or via cron (expired)

### Encryption
- **Algorithm:** AES-256-GCM
- **Location:** Browser-side only
- **Key Storage:** URL fragment (#), NOT sent to server
- **Password:** Optional SHA256 hash (not used for encryption key)

### Frontend
- **Framework:** Next.js 14
- **Styling:** Tailwind CSS
- **Deployment:** Vercel
- **Design:** Mobile-first, Corporate tone

### API Design
- **Style:** REST (JSON responses)
- **Authentication:** None for free users, JWT for paid
- **Response Format:** Consistent {success, data/error}
- **Rate Limiting:** None for now (add later if needed)

---

## Design Decisions

### Tone
- **Corporate** - Professional, trustworthy
- **Balanced** - Not too casual, not too serious
- **Not playful** - This is security-critical

### Colors
- **Primary:** #00e5a0 (green)
- **Dark background:** #0f172a
- **Light background:** #f8fafc
- **Both themes:** Required

### Mobile Strategy
- **Mobile-first approach** - Design for mobile, scale up
- **Touch-friendly** - 48px+ touch targets
- **Fast loading** - Optimize images, minimize JS
- **No horizontal scroll** - Full viewport width only

### Landing Page Structure
1. Header (sticky, responsive)
2. Hero section
3. Problem statement
4. Solution explanation
5. Features showcase
6. Pricing tiers (5 options)
7. Use cases
8. Testimonials (user-submitted, all optional)
9. FAQ (accordion)
10. CTA section
11. Footer

---

## Security Decisions

### Zero-Knowledge
- Server stores only encrypted blobs
- Server never has encryption key
- Server never has plaintext message
- Server never tracks free users
- Server never logs messages

### Deletion Strategy
- Delete immediately on read (POST to /read-confirm)
- Auto-delete on expiry (via scheduled job/cron)
- No recovery possible (intentional)

### Password
- Optional, not required
- Hashed (SHA256), never stored plaintext
- Does not encrypt message (encryption key is in URL)
- Extra UX consideration only

### URL Fragment (#)
- Encryption key in URL fragment
- Fragment not sent to server
- Fragment not sent in HTTP headers
- Only available in browser locally

---

## Testimonials Strategy

### User Submission
- **All fields optional:** Name, title, company, message, rating, email
- **Approval required:** Admin reviews before showing
- **No spam:** Moderate manually
- **Modal form:** Users can submit from landing page

### Display
- **Original posts:** Show real submissions
- **Carousel or grid:** TBD during development
- **No fake testimonials:** Only real user submissions

---

## Monetization Strategy (Phase 2)

### Pricing Model
1. **Free:** 5 secrets/day, 1 day expiry, 1 collection
2. **Trial ($1.99):** 20 secrets/day, 15 days expiry, 2 collections
3. **Pro ($4.99/mo):** 50 secrets/day, 30 days expiry, 10 collections
4. **Business ($9.99/mo):** Unlimited, 90 days expiry, unlimited collections, team (5), API
5. **Enterprise ($19.99/mo):** Everything unlimited, SSO, custom domain, white-label

### Payment Provider
- **Razorpay** (already configured)
- Supports India + International

### User Model
- **Free users:** Anonymous, no account
- **Paid users:** Email login, account required
- **Team access:** Separate permissions per member (Business+)
- **API access:** Full for Business+

---

## Development Constraints

### MVP (Phase 1)
- Landing page + basic create/read
- No monetization
- No complex features
- Focus: Core functionality working perfectly

### No Scope Creep
- Don't add P2P chat again
- Don't require login for free users
- Don't store plaintext
- Don't over-engineer

### Code Quality
- Simple, readable code
- Proper error handling
- Type safety (TypeScript)
- Security-first approach

---

## Deployment & DevOps

### Hosting
- **Frontend:** Vercel (Next.js optimized)
- **Database:** Supabase (PostgreSQL managed)
- **Domain:** notrace.co.in (custom)
- **SSL:** Auto via Vercel

### Environment Setup
- `.env.local` - Local development
- `.env.production` - Production (Vercel)
- Never commit secrets
- Use Vercel dashboard for secrets

### Scheduled Jobs
- Auto-delete expired secrets (runs hourly)
- Could use: Supabase functions, cron job, or Vercel cron

---

## Backward Compatibility

- **Fresh start:** No old code to maintain
- **No migrations needed:** New database
- **No deprecations:** Everything new

---

## Future Considerations (NOT NOW)

- [ ] Anti-screenshot detection (Phase 3)
- [ ] One-time token system (Phase 3)
- [ ] Scheduled messages (Phase 3)
- [ ] Analytics (Phase 3)
- [ ] Blog (separate project)
- [ ] Mobile app (future)
- [ ] API rate limiting (when needed)
- [ ] Advanced security features

---

## Decisions Summary

**This project will:**
- ✅ Be simple and focused
- ✅ Be secure by design
- ✅ Be mobile-first
- ✅ Be zero-knowledge
- ✅ Be anonymous (free tier)
- ✅ Delete messages immediately
- ✅ Support testimonials (user-submitted)
- ✅ Not require login (free)
- ✅ Not do P2P chat
- ✅ Not over-engineer

---

---

# SETUP & DEVELOPMENT GUIDE

## Initial Project Setup

### Prerequisites
- Node.js 18+ (npm or yarn)
- Git
- Code editor (VS Code recommended)
- Supabase account
- Vercel account (for deployment)

---

## Step 1: Create Next.js Project

```bash
npx create-next-app@latest notrace --typescript --tailwind --app
cd notrace
```

**During setup, answer:**
- TypeScript? → Yes
- ESLint? → Yes
- Tailwind? → Yes
- App Router? → Yes
- src/ directory? → No
- Import alias? → Yes (@/*)

---

## Step 2: Install Dependencies

```bash
npm install

# Encryption & crypto
npm install crypto-js
npm install tweetnacl tweetnacl-util

# Supabase
npm install @supabase/supabase-js

# Utilities
npm install qrcode.react
npm install uuid

# UI Components
npm install clsx

# Date handling
npm install date-fns

# Language support
npm install next-i18next i18next

# Copy to clipboard
npm install react-hot-toast

# Icons
npm install lucide-react
```

---

## Step 3: Environment Setup

Create `.env.local`:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Razorpay (Phase 2)
NEXT_PUBLIC_RAZORPAY_KEY_ID=your_razorpay_key

# Admin (for counter increment)
ADMIN_SECRET_KEY=your_secret_admin_key

# Domain
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Contact
NEXT_PUBLIC_SUPPORT_EMAIL=mouhitkanaujia@gmail.com
NEXT_PUBLIC_SUPPORT_PHONE=+91 9369524385
NEXT_PUBLIC_COMPANY_NAME=Engage Ad
```

---

## Step 4: Supabase Setup

1. Create Supabase project
2. Go to SQL Editor
3. Run migrations (see Database Migrations section)
4. Create tables: secrets, collections, testimonials, usage_stats
5. Get URL and anon key → add to `.env.local`

---

## Step 5: Project Structure

Create these directories:

```bash
mkdir -p app/api/secrets
mkdir -p app/api/collections
mkdir -p app/api/testimonials
mkdir -p app/api/stats
mkdir -p app/api/auth
mkdir -p app/api/payment
mkdir -p app/api/user
mkdir -p components/landing
mkdir -p components/app
mkdir -p components/shared
mkdir -p components/modals
mkdir -p lib
mkdir -p types
mkdir -p public
mkdir -p docs
```

---

## Step 6: Git Setup

```bash
git init
git add .
git commit -m "Initial commit: Next.js + Tailwind setup by Engage Ad"
git remote add origin <your-repo>
git push -u origin main
```

---

## Development Workflow

### Start Development Server

```bash
npm run dev
```

Server runs at `http://localhost:3000`

### Build for Production

```bash
npm run build
npm run start
```

### Type Checking

```bash
npm run type-check
```

### Linting

```bash
npm run lint
```

---

## File Naming Conventions

- **Components:** PascalCase (e.g., `Hero.tsx`, `CreateSecret.tsx`)
- **Utilities:** camelCase (e.g., `crypto.ts`, `supabase.ts`)
- **Styles:** With component (e.g., `Hero.module.css` or Tailwind)
- **Routes:** kebab-case (e.g., `/api/secrets/create`)

---

## Development Tips

### Hot Reload
Changes to files automatically reload in browser (Next.js feature)

### TypeScript
- Strict mode enabled
- Create interfaces in `types/index.ts`
- Never use `any` type

### Styling
- Use Tailwind CSS only
- No CSS files (unless absolutely necessary)
- Dark mode: `dark:` prefix

### Testing Locally
```bash
# Test encryption
npm run dev
# Go to http://localhost:3000/app
# Create a secret, read it back
# Verify encryption works

# Test API
curl -X POST http://localhost:3000/api/secrets/create \
  -H "Content-Type: application/json" \
  -d '{"encrypted_blob":"test","expires_in_minutes":30}'
```

---

## Common Issues & Solutions

### Port 3000 Already in Use
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or use different port
npm run dev -- -p 3001
```

### Supabase Connection Error
- Check `.env.local` has correct URL & key
- Verify Supabase project is active
- Check network connection

### Build Errors
```bash
# Clear build cache
rm -rf .next
npm run build
```

### Module Not Found
```bash
# Clear node_modules
rm -rf node_modules
npm install
```

---

## Deployment to Vercel

### First Time Setup

1. Push code to GitHub
2. Go to vercel.com
3. Import your repository
4. Add environment variables:
   - NEXT_PUBLIC_SUPABASE_URL
   - NEXT_PUBLIC_SUPABASE_ANON_KEY
   - NEXT_PUBLIC_RAZORPAY_KEY_ID (Phase 2)
   - ADMIN_SECRET_KEY
   - NEXT_PUBLIC_SUPPORT_EMAIL
   - NEXT_PUBLIC_SUPPORT_PHONE
   - NEXT_PUBLIC_COMPANY_NAME
5. Deploy!

### Custom Domain

1. In Vercel dashboard → Settings
2. Go to Domains
3. Add custom domain: notrace.co.in
4. Update DNS settings (instructions from Vercel)
5. SSL auto-configured

---

## Development Checklist

Before each coding session:

- [ ] Pull latest from GitHub
- [ ] `npm install` (if dependencies changed)
- [ ] Check `.env.local` is correct
- [ ] Run `npm run dev`
- [ ] Open `http://localhost:3000`
- [ ] Verify landing page loads
- [ ] Check console for errors

---

---

# DATABASE MIGRATIONS

Run this in Supabase SQL Editor:

```sql
-- Create secrets table
CREATE TABLE secrets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  encrypted_blob TEXT NOT NULL,
  password_hash VARCHAR(255),
  collection_id UUID,
  expires_at TIMESTAMP NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMP,
  created_by_tier VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for secrets
CREATE INDEX idx_secrets_expires_at ON secrets(expires_at);
CREATE INDEX idx_secrets_collection_id ON secrets(collection_id);
CREATE INDEX idx_secrets_created_at ON secrets(created_at DESC);

-- Create collections table
CREATE TABLE collections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for collections
CREATE INDEX idx_collections_created_at ON collections(created_at DESC);

-- Create users table (for paid users only)
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  subscription_tier VARCHAR(50) DEFAULT 'free',
  subscription_status VARCHAR(50) DEFAULT 'active',
  subscription_start_at TIMESTAMP,
  subscription_end_at TIMESTAMP,
  razorpay_subscription_id VARCHAR(255),
  secrets_created_today INT DEFAULT 0,
  last_secret_reset_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create testimonials table
CREATE TABLE testimonials (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255),
  title VARCHAR(255),
  company VARCHAR(255),
  message TEXT NOT NULL,
  rating INT,
  email VARCHAR(255),
  avatar_url VARCHAR(500),
  approved BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for testimonials
CREATE INDEX idx_testimonials_approved ON testimonials(approved);
CREATE INDEX idx_testimonials_created_at ON testimonials(created_at DESC);

-- Create subscriptions table
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id),
  tier VARCHAR(50) NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',
  razorpay_order_id VARCHAR(255),
  razorpay_payment_id VARCHAR(255),
  status VARCHAR(50) DEFAULT 'completed',
  period_start TIMESTAMP,
  period_end TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create usage_stats table
CREATE TABLE usage_stats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  secrets_sent_count INT DEFAULT 0,
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for usage_stats
CREATE INDEX idx_usage_stats_updated_at ON usage_stats(updated_at DESC);

-- Initialize usage_stats with default row
INSERT INTO usage_stats (id, secrets_sent_count) 
VALUES (uuid_generate_v4(), 0)
ON CONFLICT DO NOTHING;

-- Create function to auto-delete expired secrets
CREATE OR REPLACE FUNCTION delete_expired_secrets()
RETURNS void AS $$
BEGIN
  DELETE FROM secrets WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_secrets_updated_at
BEFORE UPDATE ON secrets
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_collections_updated_at
BEFORE UPDATE ON collections
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_testimonials_updated_at
BEFORE UPDATE ON testimonials
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_usage_stats_updated_at
BEFORE UPDATE ON usage_stats
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

-- Enable Row Level Security
ALTER TABLE secrets ENABLE ROW LEVEL SECURITY;
ALTER TABLE collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Create policies (allow all for now - can add restrictions later)
CREATE POLICY "Enable all operations for secrets" ON secrets
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Enable all operations for collections" ON collections
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Enable all operations for testimonials" ON testimonials
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Enable all operations for usage_stats" ON usage_stats
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Enable all operations for users" ON users
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Enable all operations for subscriptions" ON subscriptions
  FOR ALL USING (true) WITH CHECK (true);

-- Create view for stats
CREATE OR REPLACE VIEW public.stats_summary AS
SELECT 
  (SELECT COUNT(*) FROM secrets) as total_secrets,
  (SELECT COUNT(*) FROM secrets WHERE is_read = false) as unread_secrets,
  (SELECT COUNT(*) FROM collections) as total_collections,
  (SELECT COUNT(*) FROM testimonials WHERE approved = true) as approved_testimonials,
  (SELECT secrets_sent_count FROM usage_stats LIMIT 1) as total_secrets_sent;
```

---

---

# SECURITY CHECKLIST

Before going live, verify all security requirements.

---

## Code Security

- [ ] **No plaintext storage** - All messages encrypted before sending to server
- [ ] **Encryption key in URL fragment (#)** - Never sent to server in headers
- [ ] **No sensitive data in logs** - Never log encrypted messages or keys
- [ ] **HTTPS only** - All connections encrypted
- [ ] **CORS configured** - Only allow requests from notrace.co.in
- [ ] **No sensitive data in error messages** - Don't expose internal details
- [ ] **Input validation** - Validate all API inputs
- [ ] **SQL injection prevention** - Use parameterized queries (Supabase does this)
- [ ] **XSS prevention** - Sanitize all user inputs
- [ ] **CSRF tokens** (if forms exist) - Verify on POST/PUT/DELETE
- [ ] **No hardcoded secrets** - All secrets in environment variables
- [ ] **No exposed API keys** - Use `NEXT_PUBLIC_*` only for public keys

---

## Database Security

- [ ] **Row Level Security (RLS)** - Configured (can add restrictions later)
- [ ] **Encryption at rest** - Supabase encrypts by default
- [ ] **Backups enabled** - Regular backups configured
- [ ] **No plaintext passwords** - Always hash (SHA256)
- [ ] **Foreign key constraints** - Setup relationships properly
- [ ] **Proper indexes** - Performance optimized
- [ ] **Auto-delete triggers** - Expired secrets cleaned up
- [ ] **No sensitive data in logs** - Database doesn't log messages

---

## API Security

- [ ] **Rate limiting** (optional now, add if needed)
- [ ] **Request validation** - Check payload before processing
- [ ] **Response validation** - Don't leak sensitive data
- [ ] **Error handling** - Generic error messages to users
- [ ] **Admin endpoints protected** - Verify admin_key for special operations
- [ ] **CORS headers** - Restrict to notrace.co.in
- [ ] **Content-Type validation** - Expect JSON
- [ ] **Request size limits** - Prevent memory exhaustion

---

## Encryption Security

- [ ] **AES-256-GCM** - Industry standard
- [ ] **Random IV/nonce** - Generated for each message
- [ ] **Random key** - Cryptographically random
- [ ] **No key reuse** - New key per message
- [ ] **Proper key derivation** - If password needed (PBKDF2)
- [ ] **Authentication tag** - GCM provides built-in auth
- [ ] **No ECB mode** - Never use (only GCM)
- [ ] **Secure random generator** - `crypto.getRandomValues()`

---

## Frontend Security

- [ ] **No console.log secrets** - Remove debug logging
- [ ] **No localStorage secrets** - Keep key only in memory
- [ ] **CSP headers** - Content Security Policy configured
- [ ] **X-Frame-Options** - Prevent clickjacking
- [ ] **X-Content-Type-Options** - Prevent MIME sniffing
- [ ] **Strict-Transport-Security** - Force HTTPS
- [ ] **No eval()** - Never use eval
- [ ] **Third-party scripts** - Minimize trusted sources
- [ ] **Dependency scanning** - Check for vulnerabilities (`npm audit`)

---

## Deployment Security

- [ ] **Environment variables** - Configured in Vercel
- [ ] **No secrets in git** - Use `.env.local`, not committed
- [ ] **GitHub private** - Repository is private (if needed)
- [ ] **Vercel protection** - Password protect preview deploys
- [ ] **SSL certificate** - Auto via Vercel (Let's Encrypt)
- [ ] **Domain protection** - DNSSEC enabled (optional)
- [ ] **Monitoring** - Log access and errors
- [ ] **Backup strategy** - Database backup plan

---

## Privacy Compliance

- [ ] **Privacy policy** - Clear, accurate
- [ ] **Terms of service** - Legal agreements
- [ ] **GDPR compliant** (if serving EU) - Data handling policy
- [ ] **No user tracking** - No analytics tracking users
- [ ] **No cookies** - Minimal/no cookie usage
- [ ] **No data retention** - Delete after reading
- [ ] **No third-party sharing** - Data never shared
- [ ] **Transparency** - Clear about what we collect (nothing for free users)
- [ ] **Contact info** - Support email and phone visible
- [ ] **Company attribution** - Engage Ad mentioned in terms/footer

---

## Testing Security

Before launch:

- [ ] **Test encryption** - Create secret, verify encrypted blob in DB
- [ ] **Test deletion** - Verify deleted after read
- [ ] **Test URL encoding** - Verify special chars handled
- [ ] **Test password** - Verify password protection works
- [ ] **Test expiry** - Verify auto-delete on expiry
- [ ] **Test API** - Use curl to test endpoints
- [ ] **Test HTTPS only** - Can't access via HTTP
- [ ] **Test CORS** - Block requests from other domains
- [ ] **Penetration testing** (optional) - Hire security firm for serious project

---

## Monitoring & Incident Response

- [ ] **Error monitoring** - Setup Sentry or similar
- [ ] **Access logs** - Monitor for suspicious activity
- [ ] **Performance monitoring** - Track response times
- [ ] **Uptime monitoring** - Alert on downtime
- [ ] **Security headers** - Verify with Mozilla Observatory
- [ ] **SSL scan** - Verify certificate quality
- [ ] **Incident plan** - Know what to do if breached
- [ ] **Contact info** - How to report security issues

---

## Documentation

- [ ] **Security policy** - SECURITY.md file
- [ ] **Encryption details** - How it works documented
- [ ] **API documentation** - Clear API contracts
- [ ] **Deployment guide** - Clear instructions
- [ ] **Incident response** - Clear procedures

---

## Regular Maintenance

**Monthly:**
- [ ] Review access logs
- [ ] Check for new vulnerabilities (`npm audit`)
- [ ] Test backups
- [ ] Review usage patterns

**Quarterly:**
- [ ] Security review
- [ ] Penetration testing (if applicable)
- [ ] Update dependencies
- [ ] Review privacy policy

**Yearly:**
- [ ] Full security audit
- [ ] Update security practices
- [ ] Review compliance requirements
- [ ] Plan improvements

---

## Pre-Launch Checklist

Before going live:

- [ ] All security items checked above
- [ ] Privacy policy published (mentions Engage Ad)
- [ ] Terms of service published (mentions Engage Ad)
- [ ] SSL certificate valid
- [ ] Database backups working
- [ ] Error monitoring configured
- [ ] HTTPS only enforced
- [ ] Admin panel protected
- [ ] Rate limiting (if needed)
- [ ] Performance optimized
- [ ] Mobile tested
- [ ] All browsers tested
- [ ] Contact info visible (email & phone)

---

---

# SUBSCRIPTION MODEL

## Overview

**Anonymous for free users. Email login for paid users.**

Paid users get login access + premium features tracked via email.

---

## Pricing Tiers

### Tier 1: FREE (Forever)
**Cost:** $0
**Access:** Anonymous (no email required)

**Limits:**
- Secrets per day: **5**
- Max message length: **Unlimited**
- Max expiry time: **1 day**
- Collections: **1**
- Tracking window: **None** (anonymous)

**Features:**
- Burn-after-read secrets
- Password protection
- QR code generation
- Dark/Light mode
- 15+ languages
- Support: mouhitkanaujia@gmail.com

---

### Tier 2: TRIAL ($1.99)
**Cost:** $1.99 USD/month
**Duration:** Monthly subscription (recurring)
**Access:** Email login required

**Limits:**
- Secrets per day: **20**
- Max message length: **Unlimited**
- Max expiry time: **15 days**
- Collections: **2**
- Tracking window: **Yes** (email-based)

**Additional Features:**
- Usage dashboard (secrets remaining today)
- Subscription management (view/cancel)
- Email receipts
- Account settings
- Support: mouhitkanaujia@gmail.com

---

### Tier 3: PRO ($4.99)
**Cost:** $4.99 USD/month
**Duration:** Monthly subscription (auto-renew)
**Access:** Email login required

**Limits:**
- Secrets per day: **50**
- Max message length: **Unlimited**
- Max expiry time: **30 days**
- Collections: **10**
- Tracking window: **Yes** (email-based)

**Additional Features:**
- Everything in TRIAL +
- Priority support (email)
- Advanced statistics (when created, when read, etc.)
- Custom expiry times
- Bulk operations (delete multiple at once)
- Support: mouhitkanaujia@gmail.com

---

### Tier 4: BUSINESS ($9.99)
**Cost:** $9.99 USD/month
**Duration:** Monthly subscription (auto-renew)
**Access:** Email login required

**Limits:**
- Secrets per day: **Unlimited**
- Max message length: **Unlimited**
- Max expiry time: **90 days**
- Collections: **Unlimited**
- Tracking window: **Yes** (email-based)

**Team Features:**
- Team members: **Up to 5 people**
- Each member has **separate access control**
- Admin can invite/remove members
- Each member has own quota (secrets/day limit applies per user)
- Team collections: **Shared between invited members**
- Member roles: **Admin / Editor / Viewer**
  - Admin: Manage team, invite/remove members, delete any secret
  - Editor: Create/edit/delete own secrets, view shared
  - Viewer: Read-only access to shared collections

**API Features:**
- API access: **Full - All operations**
  - POST /api/secrets/create
  - GET /api/secrets/read
  - GET /api/secrets/list
  - DELETE /api/secrets/delete
  - Collections CRUD
  - Full read/write access
- Rate limit: **1000 requests/day**
- API keys: **1 key per account**

**Additional Features:**
- Advanced analytics (per-user stats)
- Audit logs (who did what, when)
- Priority support (24-hour email response)
- Monthly usage reports
- Custom expiry times (up to 90 days)
- Bulk operations
- Support: mouhitkanaujia@gmail.com

---

### Tier 5: ENTERPRISE ($19.99)
**Cost:** $19.99 USD/month
**Duration:** Monthly subscription (auto-renew)
**Access:** Email login required + custom setup

**Limits:**
- Secrets per day: **Unlimited**
- Max message length: **Unlimited**
- Max expiry time: **1 year**
- Collections: **Unlimited**
- Tracking window: **Yes** (email-based)

**Team Features:**
- Team members: **Unlimited**
- Each member has **separate access control**
- Advanced role-based access control (RBAC)
- Granular permissions per collection
- Member roles: **Owner / Admin / Manager / Editor / Viewer**
  - Owner: Full control, billing, SSO setup
  - Admin: Manage users, secrets, collections
  - Manager: Team analytics, reporting
  - Editor: Create/edit/delete own and assigned secrets
  - Viewer: Read-only access

**API Features:**
- API access: **Unlimited - All operations**
  - Create/read/update/delete secrets
  - Full collections management
  - User/team management
  - Team management endpoints
- Rate limit: **Unlimited**
- API keys: **Unlimited keys**
- Webhooks: **Yes (secret created/read/deleted events)**
- API documentation: **Full OpenAPI spec**

**Authentication Features:**
- SSO: **SAML 2.0 + Google OAuth**
  - SAML 2.0 for enterprise single sign-on
  - Google OAuth for quick integration
  - Auto-provision users on first login
  - Auto-deprovision on SAML removal

**Branding Features:**
- Custom domain: **notrace.yourcompany.com**
- Custom subdomain: **secrets.yourcompany.co.in**
- Custom logo: **In header & emails**
- Custom colors: **Match brand colors**
- White-label: **Yes (reseller option)**
  - Use own domain
  - Branded UI
  - Your payment method (optional)

**Additional Features:**
- Advanced analytics & reporting
- Detailed audit logs (all actions tracked)
- Compliance: **HIPAA / SOC2 ready**
- 99.9% uptime SLA guarantee
- 24/7 dedicated support (phone + email)
- Quarterly business reviews
- Custom feature development (scope TBD)
- Data residency options (on request)
- Primary support: mouhitkanaujia@gmail.com / +91 9369524385

**Contact Sales For:**
- Custom integrations
- Volume discounts
- Annual payment discounts
- Feature customization
- Email: mouhitkanaujia@gmail.com
- Phone: +91 9369524385

---

## TIER COMPARISON TABLE

| Feature | FREE | TRIAL | PRO | BUSINESS | ENTERPRISE |
|---------|------|-------|-----|----------|------------|
| **Cost** | $0 | $1.99/mo | $4.99/mo | $9.99/mo | $19.99/mo |
| **Secrets/Day** | 5 | 20 | 50 | ∞ | ∞ |
| **Max Expiry** | 1 day | 15 days | 30 days | 90 days | 1 year |
| **Collections** | 1 | 2 | 10 | ∞ | ∞ |
| **Login Required** | ❌ | ✅ | ✅ | ✅ | ✅ |
| **Team Members** | ❌ | ❌ | ❌ | 5 | ∞ |
| **Separate Access** | - | - | - | ✅ | ✅ |
| **API Access** | ❌ | ❌ | ❌ | ✅ Full | ✅ Unlimited |
| **SSO** | ❌ | ❌ | ❌ | ❌ | ✅ SAML2/OAuth |
| **Custom Domain** | ❌ | ❌ | ❌ | ❌ | ✅ |
| **White Label** | ❌ | ❌ | ❌ | ❌ | ✅ |
| **Webhooks** | ❌ | ❌ | ❌ | ❌ | ✅ |
| **Audit Logs** | ❌ | ❌ | ❌ | ✅ | ✅ |
| **Support** | Email | Email | Email | 24h Email | 24/7 Phone+Email |
| **SLA** | - | - | - | - | 99.9% |

---

## Support Contact Information

**All Tiers:**
- Email: mouhitkanaujia@gmail.com
- Phone: +91 9369524385
- Company: Engage Ad
- Location: Lucknow, Uttar Pradesh, India

---

## User Journey

### Free User
```
1. Visit notrace.co.in
2. Click "Try Now"
3. Go to /app (no email)
4. Create secret (anonymous)
5. After 5 secrets → Can't create more today
6. See: "Upgrade to Trial/Pro for more"
7. Optionally click upgrade
8. If upgrade: Enter email → Payment → Login
```

---

### Paid User
```
1. Visit notrace.co.in
2. Click "Pricing" or "Try Pro"
3. Choose tier (Trial/Pro/Business/Enterprise)
4. Enter email
5. Go to Razorpay payment
6. Pay
7. Redirect back: /subscribe/success?email=...
8. Set password
9. Account created, logged in
10. Full access to tier features
```

---

## Important Notes

1. **No free trial** - Trial IS the paid tier ($1.99)
2. **Email required for paid** - Only paid users need email/login
3. **Free stays anonymous** - Free users never need account
4. **Daily limits reset** - At midnight UTC
5. **Expiry capped per tier** - Server enforces, not browser
6. **Razorpay handles billing** - We don't store card details
7. **Team members have separate quotas** - Each member's limit applies independently
8. **Support always available** - Email/phone provided in all tiers

---

## Phase Implementation

**Phase 1 (Now):** Landing page + core features (FREE only)
**Phase 2a (Payments):** User authentication + Razorpay integration
**Phase 2b (Limits):** Enforce daily/expiry limits, usage dashboard
**Phase 2c (Advanced):** Team features, API access, analytics

---

---

## SUMMARY

You now have complete documentation for NoTrace by Engage Ad:

✅ Project Overview (with company info)
✅ Architecture & Structure
✅ API Contracts
✅ Development Tasks
✅ Design Decisions
✅ Setup Guide (with Engage Ad details)
✅ Database Schema
✅ Security Checklist (with company contact)
✅ Subscription Model (with support info)

**Everything you need to build from scratch, no hallucinations!**

**Ready to code Phase 1?** 🚀

