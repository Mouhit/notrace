# Phase 1 Implementation Guide - NoTrace by Engage Ad

**Status:** Ready to Code
**Phase:** 1 - Landing Page + Core Features
**Time Estimate:** 40-50 hours

---

## Overview

Phase 1 focuses on building the foundation of NoTrace:
- ✅ Landing page (all sections)
- ✅ Core encryption (AES-256-GCM)
- ✅ Secret create/read functionality
- ✅ Collections management
- ✅ Testimonials submission

**NO monetization, NO user accounts (free tier only)**

---

## Tasks Breakdown

### Task 1.1: Project Setup ✅ DONE

**Files Created:**
- `PHASE-1-SETUP.sh` - Automated setup script
- `.env.local` template - Environment configuration

**What to do:**
```bash
cd /path/to/notrace
chmod +x PHASE-1-SETUP.sh
./PHASE-1-SETUP.sh

# Or manually:
npx create-next-app@latest notrace --typescript --tailwind --app
npm install [all dependencies]
npm run dev
```

---

### Task 1.2: Core Libraries ✅ DONE

**Files Created:**
- `lib/crypto.ts` - AES-256-GCM encryption utilities
- `lib/supabase.ts` - Supabase client functions
- `types/index.ts` - TypeScript interfaces

**Functions Available:**
```typescript
// Encryption
generateEncryptionKey()
encryptMessage(message, key)
decryptMessage(encryptedBase64, nonceBase64, key)
hashPassword(password)
verifyPassword(password, hash)

// Database
createSecret(encryptedBlob, password?, collectionId?, expiresInMinutes?)
readSecret(secretId)
markSecretAsReadAndDelete(secretId)
getSecrets(userId?, collectionId?)
createCollection(name, description?)
getCollections()
submitTestimonial(message, name?, title?, company?, rating?, email?)
getApprovedTestimonials()
```

---

### Task 1.3: API Routes (TO DO)

**Routes to Create:**

1. **POST** `/api/secrets/create`
   - Input: `{encrypted_blob, password_hash?, collection_id?, expires_in_minutes}`
   - Output: `{success, id, link}`
   - Security: Validate input, no plaintext storage

2. **GET** `/api/secrets/read`
   - Query: `?id=UUID`
   - Output: `{success, encrypted_blob, requires_password}`
   - Security: Check expiry, check if read, don't delete yet

3. **POST** `/api/secrets/read-confirm`
   - Input: `{id}`
   - Output: `{success, message}`
   - Action: DELETE from database

4. **POST** `/api/collections/create`
   - Input: `{name, description?}`
   - Output: `{success, id}`

5. **GET** `/api/collections/list`
   - Output: `{success, collections: []}`

6. **POST** `/api/testimonials/submit`
   - Input: `{name?, title?, company?, message, rating?, email?}`
   - Output: `{success, message}`
   - Note: All fields optional, requires approval

7. **GET** `/api/testimonials/list`
   - Output: `{success, testimonials: []}`
   - Filter: Only `approved: true`

---

### Task 1.4: Landing Page Components (TO DO)

**Components to Create:**

1. **Header.tsx**
   - Sticky navigation
   - Logo + brand name
   - Nav links: How it Works, Pricing, FAQ
   - CTA: "Try Now" button
   - Theme toggle (dark/light)

2. **Hero.tsx**
   - Headline: "Send Secrets That Self-Destruct"
   - Subheading: Encryption, zero-knowledge promise
   - CTA buttons: "Try Now" | "Learn More"
   - Hero visual

3. **Problem.tsx**
   - "Why You Need NoTrace"
   - 3 pain points (email forwarded, Slack searchable, WhatsApp stored)
   - Visual comparison

4. **Solution.tsx**
   - "How NoTrace Works"
   - 4-step process: Create → Share → Read → Burn
   - Animated/visual flow

5. **Features.tsx**
   - 9 feature cards
   - Icon + title + description for each
   - Grid layout (3 columns on desktop)

6. **Pricing.tsx**
   - 5 tier cards (Free, Trial, Pro, Business, Enterprise)
   - Comparison table
   - CTA buttons for each tier

7. **UseCases.tsx**
   - "Who Uses NoTrace?"
   - Cards for different personas
   - Real-world scenarios

8. **Testimonials.tsx**
   - Display approved testimonials
   - "Share Your Story" button
   - Modal form for submission
   - Carousel or grid layout

9. **FAQ.tsx**
   - Accordion component
   - 10-15 common questions
   - Collapsible answers

10. **CTA.tsx**
    - Bottom call-to-action section
    - Headline + description
    - "Get Started Free" button

11. **Footer.tsx**
    - Company info (Engage Ad)
    - Contact: email, phone
    - Links: Privacy, Terms, FAQ
    - Social media (optional)

---

### Task 1.5: Main App Components (TO DO)

**Components to Create:**

1. **CreateSecret.tsx**
   - Text input for message
   - Optional password input
   - Expiry time selector (1h, 24h, 7d, 30d)
   - Optional collection selector
   - Submit button
   - Encrypt locally, send to API

2. **SecretCreatedModal.tsx**
   - Show generated link
   - Copy to clipboard button
   - QR code display
   - Share to WhatsApp/Email/Telegram buttons
   - Close button

3. **ReadSecret.tsx**
   - Decrypt message locally
   - Optional password form
   - Display plaintext
   - Auto-mark as read after 2 seconds
   - Delete button
   - Auto-delete on page unload

4. **Collections.tsx**
   - Create new collection
   - List of collections
   - Secrets in each collection
   - Delete collection

5. **Settings.tsx**
   - Language switcher
   - Theme toggle
   - About section
   - Contact info (Engage Ad)

---

### Task 1.6: Authentication Layer (TO DO - PHASE 2)

**NOT in Phase 1** - free users are anonymous

Will be added in Phase 2 for paid tiers

---

### Task 1.7: Additional Features (TO DO)

1. **QR Code Generation**
   - Use: `qrcode.react`
   - Generate from share link

2. **Copy to Clipboard**
   - Use: `react-hot-toast`
   - Show feedback

3. **Share Buttons**
   - WhatsApp share
   - Email share
   - Telegram share

4. **Theme Toggle**
   - Dark/light mode
   - Persist in localStorage

5. **Language Support**
   - Use: `next-i18next`
   - Support 15+ languages

6. **Auto-delete Expired Secrets**
   - Cron job (Vercel scheduled functions)
   - Runs hourly
   - Deletes secrets where `expires_at < NOW()`

---

## File Structure After Phase 1

```
notrace/
├─ app/
│  ├─ page.tsx                     # Landing page
│  ├─ layout.tsx                   # Root layout
│  ├─ app/
│  │  └─ page.tsx                  # /app main app
│  ├─ globals.css                  # Global styles
│  └─ api/
│     ├─ secrets/
│     │  ├─ create/route.ts
│     │  ├─ read/route.ts
│     │  └─ read-confirm/route.ts
│     ├─ collections/
│     │  ├─ create/route.ts
│     │  └─ list/route.ts
│     └─ testimonials/
│        ├─ submit/route.ts
│        └─ list/route.ts
├─ components/
│  ├─ landing/
│  │  ├─ Header.tsx
│  │  ├─ Hero.tsx
│  │  ├─ Problem.tsx
│  │  ├─ Solution.tsx
│  │  ├─ Features.tsx
│  │  ├─ Pricing.tsx
│  │  ├─ UseCases.tsx
│  │  ├─ Testimonials.tsx
│  │  ├─ FAQ.tsx
│  │  ├─ CTA.tsx
│  │  └─ Footer.tsx
│  ├─ app/
│  │  ├─ CreateSecret.tsx
│  │  ├─ ReadSecret.tsx
│  │  ├─ Collections.tsx
│  │  ├─ Settings.tsx
│  │  └─ SecretCreatedModal.tsx
│  └─ shared/
│     ├─ ThemeToggle.tsx
│     └─ LanguageSwitcher.tsx
├─ lib/
│  ├─ crypto.ts                    # ✅ Done
│  ├─ supabase.ts                  # ✅ Done
│  ├─ theme.ts
│  ├─ language.ts
│  └─ utils.ts
├─ types/
│  └─ index.ts                     # ✅ Done
├─ public/
│  ├─ logo.png
│  ├─ og-image.png
│  └─ favicon.ico
└─ docs/
   └─ (all markdown documentation)
```

---

## Database Setup

**Run in Supabase SQL Editor:**

See `ENGAGE-AD-NOTRACE-COMPLETE-DOCUMENTATION.md` → DATABASE MIGRATIONS section

Key tables:
- `secrets` - Encrypted messages
- `collections` - User folders
- `testimonials` - User reviews
- `usage_stats` - Counter

---

## Environment Variables

```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
NEXT_PUBLIC_RAZORPAY_KEY_ID=your_key (Phase 2)
ADMIN_SECRET_KEY=your_secret
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_SUPPORT_EMAIL=mouhitkanaujia@gmail.com
NEXT_PUBLIC_SUPPORT_PHONE=+91 9369524385
NEXT_PUBLIC_COMPANY_NAME=Engage Ad
```

---

## Design System

**Colors:**
- Primary: #00e5a0 (green)
- Dark bg: #0f172a
- Light bg: #f8fafc
- Text dark: #e2e8f0
- Text light: #1e293b

**Fonts:**
- Headers: Bold, clean sans-serif
- Body: Regular sans-serif
- Mono: JetBrains Mono (for code)

**Spacing:**
- Use Tailwind's default scale
- Mobile-first approach

**Components:**
- No custom CSS (Tailwind only)
- Dark mode: `dark:` prefix
- Responsive: sm, md, lg, xl breakpoints

---

## Testing Checklist

Before submitting Phase 1:

- [ ] Landing page loads (/)
- [ ] All sections render correctly
- [ ] Dark/light mode toggle works
- [ ] Hero section looks good on mobile
- [ ] Features section responsive
- [ ] Pricing table displays correctly
- [ ] Testimonials modal opens
- [ ] Create secret page loads (/app)
- [ ] Encryption works (console test)
- [ ] API endpoints return correct responses
- [ ] Collections create/list works
- [ ] Mobile responsive (< 768px)
- [ ] No console errors
- [ ] Build succeeds (`npm run build`)

---

## Deployment Checklist

Before deploying to Vercel:

- [ ] All environment variables configured
- [ ] Database migrations run in Supabase
- [ ] Domain configured (notrace.co.in)
- [ ] SSL certificate generated
- [ ] Build succeeds
- [ ] No console errors in production

---

## Support & Contact

**For questions about Phase 1:**
- Email: mouhitkanaujia@gmail.com
- Phone: +91 9369524385
- Company: Engage Ad, Lucknow, India

---

## Next Phase

**Phase 2 (After Phase 1 Complete):**
- User authentication
- Razorpay payments
- Subscription tiers
- Team features (Business tier)
- API access

