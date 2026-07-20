# Quick Start Guide

Get Secrets by NoTrace up and running in 15 minutes.

## 1. Clone & Setup (2 min)

```bash
# Create new Next.js project
npx create-next-app@latest secrets-by-notrace --typescript --tailwind

# Copy all provided files to the project
# (Copy config files, lib/, pages/api/, supabase/ folders)

cd secrets-by-notrace
npm install
```

## 2. Supabase Setup (3 min)

```bash
# Install Supabase CLI
npm install -g supabase

# Create .env.local from .env.example
cp .env.example .env.local
```

1. Go to [supabase.com](https://supabase.com)
2. Create new project
3. Go to Settings → API
4. Copy `URL` → `NEXT_PUBLIC_SUPABASE_URL` in .env.local
5. Copy `anon` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY` in .env.local

## 3. Database Migrations (2 min)

```bash
# Link to Supabase project
supabase link --project-ref your-project-ref

# Apply all migrations
supabase db push
```

Or manually in Supabase SQL Editor:
1. Copy & paste each migration file:
   - `001_create_messages_table.sql`
   - `002_create_password_attempts_table.sql`
   - `003_create_functions.sql`
2. Run each one

## 4. Local Development (2 min)

```bash
# Start dev server
npm run dev

# Open http://localhost:3000
```

Test API:
```bash
# In another terminal
curl -X POST http://localhost:3000/api/messages/create \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Hello World",
    "templateType": "email",
    "expiryMinutes": 60
  }'
```

Should return:
```json
{
  "success": true,
  "id": "uuid-here"
}
```

## 5. Frontend Components (6 min)

Create these React components:

### `pages/index.tsx` (Landing Page)
```typescript
export default function Home() {
  return (
    <div>
      <h1>Secrets by NoTrace</h1>
      <p>Your secrets. Encrypted. Auto-destroyed.</p>
      <button onClick={() => window.location.href = '/create'}>
        Create Secret
      </button>
    </div>
  );
}
```

### `pages/create.tsx` (Message Creation)
```typescript
import { useState } from 'react';

export default function Create() {
  const [content, setContent] = useState('');
  const [messageId, setMessageId] = useState('');

  const handleCreate = async () => {
    const res = await fetch('/api/messages/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        content,
        templateType: 'email',
        expiryMinutes: 1440,
      }),
    });
    const data = await res.json();
    if (data.success) {
      setMessageId(data.id);
      const link = `${window.location.origin}/s/${data.id}`;
      navigator.clipboard.writeText(link);
      alert('Link copied to clipboard!');
    }
  };

  return (
    <div>
      <h1>Create Secret</h1>
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Your secret message (max 4500 chars)"
        maxLength={4500}
      />
      <button onClick={handleCreate}>Create & Copy Link</button>
      {messageId && <p>Message created: {messageId}</p>}
    </div>
  );
}
```

### `pages/s/[id].tsx` (Message Viewer)
```typescript
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { decryptMessage } from '@/lib/encryption';

export default function ViewMessage() {
  const router = useRouter();
  const { id } = router.query;
  const [message, setMessage] = useState('');
  const [password, setPassword] = useState('');
  const [needsPassword, setNeedsPassword] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    const fetchMessage = async () => {
      try {
        const res = await fetch(`/api/messages/${id}`);
        const data = await res.json();

        if (!data.success) {
          setMessage('Message not found or expired');
          setLoading(false);
          return;
        }

        if (data.data.requires_password) {
          setNeedsPassword(true);
          setLoading(false);
          return;
        }

        // Decrypt and display
        const decrypted = await decryptMessage(
          data.data.encrypted_content,
          data.data.nonce,
          ''
        );
        setMessage(decrypted);
      } catch (error) {
        setMessage('Error loading message');
      } finally {
        setLoading(false);
      }
    };

    fetchMessage();
  }, [id]);

  const handlePasswordSubmit = async () => {
    try {
      const res = await fetch(`/api/messages/${id}/verify-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();

      if (data.valid) {
        // Fetch and decrypt message
        const msgRes = await fetch(`/api/messages/${id}`);
        const msgData = await msgRes.json();
        const decrypted = await decryptMessage(
          msgData.data.encrypted_content,
          msgData.data.nonce,
          password
        );
        setMessage(decrypted);
        setNeedsPassword(false);
      } else {
        alert(`Wrong password. ${data.attempts_remaining} attempts left.`);
      }
    } catch (error) {
      alert('Error verifying password');
    }
  };

  if (loading) return <div>Loading...</div>;

  if (needsPassword) {
    return (
      <div>
        <h1>Password Required</h1>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter password"
        />
        <button onClick={handlePasswordSubmit}>Unlock</button>
      </div>
    );
  }

  return (
    <div>
      <h1>Secret Message</h1>
      <div className="message-display">
        <p>{message}</p>
      </div>
      <button onClick={() => navigator.clipboard.writeText(message)}>
        Copy Message
      </button>
    </div>
  );
}
```

## 6. Deploy to Vercel (1 min)

```bash
# Push to GitHub first
git add .
git commit -m "Initial commit"
git push origin main

# Import to Vercel
# Go to vercel.com → Import Project → Select GitHub repo
```

Add environment variables in Vercel:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_APP_URL=https://secrets.notrace.co.in`

## Testing Checklist

- [ ] Landing page loads
- [ ] Can create message
- [ ] Can share link
- [ ] Can decrypt message
- [ ] Password protection works
- [ ] Self-destruct timer works
- [ ] Scheduled messages work
- [ ] API endpoints respond correctly

## Common Issues

### "Module not found: @supabase/supabase-js"
```bash
npm install @supabase/supabase-js tweetnacl-js qrcode.react
```

### "NEXT_PUBLIC_SUPABASE_URL is undefined"
```bash
# Check .env.local exists and has values
cat .env.local
```

### "Supabase connection failed"
```bash
# Verify in .env.local:
# - URL is correct
# - Anon key is correct
# - Network allows access
```

## Next Steps

1. ✅ Basic setup complete
2. **Add landing page styling** with 3D claymorphism
3. **Build remaining components** (dashboard, scheduler, QR generator)
4. **Add security hardening**
5. **Deploy to production**

## File Reference

| What You Need | Where It Is |
|---|---|
| Config files | Root directory |
| API endpoints | `pages/api/messages/` |
| Core libraries | `lib/` |
| Database schema | `supabase/migrations/` |
| Documentation | `README.md`, `SUPABASE_SETUP.md`, `DEPLOYMENT.md` |

## Support

- 📖 Full docs: `README.md`
- 🗄️ Database setup: `SUPABASE_SETUP.md`
- 🚀 Deployment: `DEPLOYMENT.md`
- 📋 File guide: `FILES_SUMMARY.md`

---

**Ready to build? Start with landing page styling!** 🚀
