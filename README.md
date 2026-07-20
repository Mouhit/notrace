# Secrets by NoTrace

A privacy-first encrypted messaging platform where messages self-destruct automatically.

**Demo:** [secrets.notrace.co.in](https://secrets.notrace.co.in)

## Features

- 🔐 **End-to-End Encryption** — Messages encrypted in browser, decrypted only by recipient
- 🔗 **No Accounts Required** — Share link and QR code, no signup needed
- ⏰ **Auto-Destruct** — Messages self-destroy after reading (10s base + 10s per 25 words)
- 🔒 **Optional Password** — Add password protection with 3 attempt limit
- 📅 **Scheduled Messages** — Set specific date/time for message availability
- 📱 **QR Code Sharing** — Generate downloadable QR codes
- 🎨 **6 Templates** — Email, API Key, OTP, Journal, Document, Credit Card
- 📊 **Sender Dashboard** — Track message status with countdown timers (local storage, no login)
- 🌐 **Zero-Knowledge** — Server can't read encrypted messages

## Tech Stack

- **Frontend:** Next.js 14, React, TypeScript, Tailwind CSS
- **Backend:** Supabase (PostgreSQL), Vercel
- **Encryption:** TweetNaCl.js (browser-side)
- **State Management:** Zustand
- **QR Generation:** qrcode.react

## Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account
- Vercel account (for deployment)

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/secrets-by-notrace.git
   cd secrets-by-notrace
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Fill in your Supabase credentials:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

4. **Set up Supabase**
   ```bash
   # Install Supabase CLI
   npm install -g supabase
   
   # Link to your Supabase project
   supabase link --project-ref your-project-ref
   
   # Push migrations
   supabase db push
   ```

5. **Run development server**
   ```bash
   npm run dev
   ```
   
   Open [http://localhost:3000](http://localhost:3000)

## Project Structure

```
secrets-by-notrace/
├── pages/
│   ├── api/
│   │   └── messages/
│   │       ├── create.ts          # Create new message
│   │       ├── [id].ts            # Fetch message
│   │       └── [id]/
│   │           ├── verify-password.ts
│   │           └── destroy.ts
│   ├── index.tsx               # Landing page
│   ├── create.tsx              # Message creation
│   └── [id].tsx                # Message viewer
├── components/
│   ├── landing/                # Landing page components
│   ├── creation/               # Message creation components
│   └── viewer/                 # Message viewer components
├── lib/
│   ├── supabase.ts            # Supabase client
│   ├── encryption.ts          # Encryption utilities
│   ├── api.ts                 # API helpers
│   ├── store/
│   │   └── messageStore.ts    # Zustand store
│   └── utils/
│       ├── destruct.ts        # Destruct timing
│       └── dashboard.ts       # Dashboard persistence
├── supabase/
│   └── migrations/            # Database migrations
├── public/                     # Static assets
├── tailwind.config.js         # Tailwind configuration
├── next.config.js             # Next.js configuration
├── vercel.json                # Vercel configuration
└── package.json
```

## API Endpoints

### Create Message
```
POST /api/messages/create
Content-Type: application/json

{
  "content": "Your secret message",
  "templateType": "email",
  "expiryMinutes": 1440,
  "password": "optional-password",
  "scheduledFor": "2026-07-21T14:00:00Z"
}

Response:
{
  "success": true,
  "id": "uuid"
}
```

### Get Message
```
GET /api/messages/[id]

Response:
{
  "success": true,
  "data": {
    "id": "uuid",
    "encrypted_content": "base64-encoded",
    "nonce": "base64-encoded",
    "encrypted_password": null,
    "password_nonce": null,
    "template_type": "email",
    "requires_password": false,
    "is_expired": false,
    "is_available": true,
    "time_until_available_ms": 0
  }
}
```

### Verify Password
```
POST /api/messages/[id]/verify-password
Content-Type: application/json

{
  "password": "user-entered-password"
}

Response:
{
  "success": true,
  "valid": true,
  "attempts_remaining": 2
}
```

### Destroy Message
```
POST /api/messages/[id]/destroy

Response:
{
  "success": true
}
```

## Database Schema

### messages
- `id` (UUID) — Primary key
- `encrypted_content` (TEXT) — Base64-encoded encrypted message
- `nonce` (TEXT) — Base64-encoded nonce for decryption
- `encrypted_password` (TEXT) — Optional encrypted password
- `password_nonce` (TEXT) — Optional nonce for password
- `template_type` (VARCHAR) — email, api_key, otp, journal, document, credit_card
- `expiry_at` (TIMESTAMP) — When message expires
- `scheduled_for` (TIMESTAMP) — When message becomes available (optional)
- `created_at` (TIMESTAMP) — Creation time
- `opened_at` (TIMESTAMP) — First open time
- `destroyed_at` (TIMESTAMP) — Destruction time
- `view_count` (INTEGER) — Number of views
- `ip_accessed_from` (VARCHAR) — Recipient IP
- `created_by_ip` (VARCHAR) — Sender IP

### password_attempts
- `id` (UUID) — Primary key
- `message_id` (UUID) — Foreign key to messages
- `attempted_at` (TIMESTAMP) — Attempt time
- `success` (BOOLEAN) — Whether password was correct
- `ip_address` (VARCHAR) — Attempt IP

## Encryption Details

### Browser-Side Encryption
- **Algorithm:** NaCl secretbox (XSalsa20-Poly1305)
- **Key Derivation:** SHA-256 from password
- **Nonce:** 24-byte random value
- **Message Format:** Base64-encoded encrypted bytes

### Decryption Flow
1. Recipient receives encrypted message
2. Browser derives key from entered password (or retrieves it)
3. Browser decrypts message using nonce + key
4. Original plaintext displayed
5. After reading time expires, message is destroyed

## Security Considerations

- ✅ Never store unencrypted messages on server
- ✅ Encryption/decryption happens in browser only
- ✅ Server can't read message content
- ✅ Passwords validated through encrypted content
- ✅ Rate limiting on password attempts (3 max)
- ✅ IP tracking for audit purposes (optional)
- ✅ Auto-destruct prevents long-term data leaks
- ⚠️ For production, upgrade to libsodium.js with Argon2 key derivation

## Deployment

### Deploy to Vercel

1. **Connect GitHub repository to Vercel**
   ```
   vercel link
   ```

2. **Set environment variables in Vercel**
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_APP_URL=https://secrets.notrace.co.in`

3. **Deploy**
   ```
   vercel deploy
   ```

### Supabase Setup

1. Create Supabase project
2. Connect to GitHub for automatic migrations
3. Run migrations:
   ```bash
   supabase db push
   ```

4. Enable RLS (Row Level Security) on tables

## Contributing

Contributions welcome! Please:
1. Create feature branch (`git checkout -b feature/amazing-feature`)
2. Commit changes (`git commit -m 'Add amazing feature'`)
3. Push to branch (`git push origin feature/amazing-feature`)
4. Open Pull Request

## License

MIT License - see LICENSE file for details

## Support

- 📧 Email: support@notrace.co.in
- 🐛 Issues: GitHub Issues
- 💬 Discussions: GitHub Discussions

## Roadmap

- [ ] End-to-end UI components
- [ ] Mobile app (React Native)
- [ ] Team/organization accounts
- [ ] Audit logs & compliance (SOC 2)
- [ ] Enterprise features (IP whitelisting, retention policies)
- [ ] Analytics dashboard
- [ ] Webhook notifications

## Changelog

### v0.1.0 (Initial Release)
- Basic message creation and sharing
- Browser-side encryption
- Auto-destruct functionality
- Password protection
- Scheduled messages
- Sender dashboard
- First Deployment
