// PHASE-1-7-TESTING-CHECKLIST.md
// Complete manual testing checklist for Phase 1.7
// By Engage Ad

# Phase 1.7: Testing & Polish - Complete Checklist

## 🎯 Before You Start

1. Deploy U1 + Phase 1.6 to production
2. Wait 5 minutes for Vercel to fully deploy
3. Clear browser cache (Ctrl+Shift+Delete)
4. Test on actual devices (not just browser)

---

## ✅ SECTION A: Landing Page Testing (30 minutes)

### A1: Page Load
- [ ] Visit notrace.co.in
- [ ] Page loads in < 2 seconds
- [ ] No console errors (F12 → Console)
- [ ] No console warnings
- [ ] All images load
- [ ] Fonts render correctly

### A2: Hero Section
- [ ] Title visible
- [ ] Subtitle visible
- [ ] "Create a Secret" button works (→ /app)
- [ ] "Learn More" button works (→ #solution)
- [ ] Tagline visible

### A3: Problem Section
- [ ] Heading visible
- [ ] 4 cards display (Email Breaches, Chat Messages, Screenshots, No Privacy)
- [ ] Cards have icons
- [ ] Cards have descriptions
- [ ] CTA "See How NoTrace Works" visible

### A4: Solution Section
- [ ] Heading visible
- [ ] 4-step flow shows
- [ ] Step numbers visible
- [ ] Step icons visible
- [ ] Descriptions clear
- [ ] Security note visible
- [ ] CTA "Try It Now for Free" works

### A5: Use Cases Section
- [ ] Heading visible
- [ ] 6 use case cards show
- [ ] Cards have gradient backgrounds
- [ ] Icons visible
- [ ] Titles clear
- [ ] Descriptions clear
- [ ] Hover effects work

### A6: Features Section
- [ ] 6 feature cards visible
- [ ] Icons present
- [ ] Descriptions clear

### A7: Testimonials Section
- [ ] Heading visible
- [ ] Testimonials load from API
- [ ] Cards display with names
- [ ] Star ratings show
- [ ] "Share Your Experience" button visible

### A8: FAQ Section
- [ ] 12 questions visible
- [ ] Accordion expands/collapses
- [ ] Answers display correctly
- [ ] Smooth animations
- [ ] Contact link works

### A9: Pricing Section
- [ ] 5 pricing tiers visible
- [ ] Features listed
- [ ] Buttons work
- [ ] Popular badge on Pro

### A10: Footer
- [ ] All sections visible
- [ ] Links work
- [ ] Contact info visible

---

## ✅ SECTION B: Create Secret Page Testing (/app) (45 minutes)

### B1: Page Load
- [ ] Visit notrace.co.in/app
- [ ] Page loads
- [ ] No errors
- [ ] Form visible

### B2: Form Fields
- [ ] Message textarea present
- [ ] Can type in textarea
- [ ] Password input present
- [ ] Can type password
- [ ] Expiry dropdown present
- [ ] Can select different expiry times

### B3: Create Secret - Happy Path
- [ ] Type a message: "Hello World"
- [ ] Leave password blank
- [ ] Select "1 Hour"
- [ ] Click Create button
- [ ] Gets success message
- [ ] Link displayed with long URL
- [ ] Link includes #key=...

### B4: Copy Link
- [ ] Click "Copy Link" button
- [ ] Gets "Link copied!" confirmation
- [ ] Can paste link (Ctrl+V) and see it

### B5: QR Code
- [ ] Click "QR Code" button
- [ ] Modal opens
- [ ] QR code displays
- [ ] Can scan with phone
- [ ] Download button works
- [ ] Modal closes

### B6: Share Buttons
- [ ] WhatsApp button opens WhatsApp
- [ ] Telegram button opens Telegram
- [ ] Email button opens email client
- [ ] Copy button copies link

### B7: Create Another
- [ ] Click "Create Another"
- [ ] Form clears
- [ ] Can create second secret
- [ ] Different link generated

### B8: Mobile Responsive
- [ ] Test on phone (or browser dev tools: 375px width)
- [ ] All buttons visible
- [ ] Form fills width
- [ ] No overflow
- [ ] QR code fits screen
- [ ] Share buttons stack properly

### B9: Dark Mode
- [ ] Toggle dark mode (if button exists)
- [ ] All text readable
- [ ] Good contrast
- [ ] QR visible

### B10: Error Handling
- [ ] Try to create empty secret → Error
- [ ] Try very large message → Error if > 1MB
- [ ] Test network error (disable internet) → Error

---

## ✅ SECTION C: Secret Read Page Testing (/secret?id=xyz#key=...) (45 minutes)

### C1: Page Load
- [ ] Use link from B3
- [ ] Page loads
- [ ] Shows "Reveal Secret" form

### C2: Before Reveal
- [ ] Title visible
- [ ] Description visible
- [ ] Security info visible
- [ ] Reveal button disabled until ready

### C3: Reveal Secret
- [ ] Click "Reveal Secret" button
- [ ] Shows "Decrypting..." state
- [ ] Message decrypts and displays
- [ ] Shows success message "✅ Secret successfully decrypted..."
- [ ] Shows warning message (don't refresh)

### C4: Three Buttons (U1 Update) ✅
- [ ] **Copy Message** button visible
- [ ] **Create Secret** button visible (→ /app)
- [ ] **Return Home** button visible (→ /)

### C5: Copy Message
- [ ] Click "Copy Message"
- [ ] Shows "✅ Copied to clipboard!"
- [ ] Can paste message (Ctrl+V)
- [ ] Message content correct

### C6: Create Secret
- [ ] Click "Create Secret"
- [ ] Navigates to /app
- [ ] Form ready to create new secret

### C7: Return Home
- [ ] Click "Return Home"
- [ ] Navigates to /
- [ ] Landing page loads

### C8: Message Deletion
- [ ] After revealing, try to refresh page
- [ ] Shows "Secret not found or already deleted"
- [ ] Cannot see message again

### C9: With Password
- [ ] Create secret with password "test123"
- [ ] Copy link
- [ ] Open link
- [ ] Try wrong password → Error
- [ ] Try correct password → Works

### C10: Mobile & Dark Mode
- [ ] Test on phone (375px width)
- [ ] All buttons fit screen
- [ ] Dark mode readable

---

## ✅ SECTION D: API Testing (30 minutes)

Use Postman or curl to test:

### D1: Create Secret
```
POST /api/secrets/create
Body: {
  "encrypted_blob": "...",
  "password_hash": null,
  "expires_in_minutes": 60
}
Response: { id: "...", link: "..." }
```
- [ ] Returns 200
- [ ] ID generated
- [ ] Link valid

### D2: Read Secret
```
GET /api/secrets/read?id=xxx
Response: { encrypted_blob: "..." }
```
- [ ] Returns 200
- [ ] Encrypted blob returned
- [ ] Valid base64 format

### D3: Read Confirm (Delete)
```
POST /api/secrets/read-confirm
Body: { id: "xxx" }
```
- [ ] Returns 200
- [ ] Subsequent reads return 410 (Gone)

### D4: Testimonials Submit
```
POST /api/testimonials/submit
Body: {
  "name": "Test",
  "message": "Great app!",
  "rating": 5
}
```
- [ ] Returns 200
- [ ] Data stored

### D5: Testimonials List
```
GET /api/testimonials/list
```
- [ ] Returns 200
- [ ] Lists testimonials
- [ ] Only approved ones show

### D6: Stats Get
```
GET /api/stats/get
```
- [ ] Returns 200
- [ ] Shows secrets_sent_count

### D7: Stats Increment
```
POST /api/stats/increment
```
- [ ] Returns 200
- [ ] Counter increments

---

## ✅ SECTION E: Security Testing (30 minutes)

### E1: Encryption Key Security
- [ ] Create secret
- [ ] Check URL - key only in fragment (#)
- [ ] Fragment not sent to server
- [ ] Key not in any API logs
- [ ] Key not in database

### E2: Password Protection
- [ ] Create secret with password
- [ ] Hash stored, not plaintext
- [ ] Can't decrypt without correct password

### E3: Zero-Knowledge
- [ ] Decrypt secret
- [ ] Check server logs - no plaintext message
- [ ] Only encrypted blob stored

### E4: Expiry & Deletion
- [ ] Create secret with 1 hour expiry
- [ ] Wait (or check cron job logs)
- [ ] After time passes, link should be deleted
- [ ] Opening link shows "Not Found"

### E5: No XSS
- [ ] Create secret with message: `<script>alert('xss')</script>`
- [ ] Decrypt and display
- [ ] Script doesn't execute
- [ ] Shows as text only

### E6: Headers Security
- [ ] Check Response Headers (F12 → Network → Headers)
- [ ] CSP header present
- [ ] HSTS header present
- [ ] X-Frame-Options present

---

## ✅ SECTION F: Performance Testing (20 minutes)

### F1: Lighthouse Score
- [ ] Open page in Chrome
- [ ] F12 → Lighthouse
- [ ] Run audit
- [ ] Performance > 90
- [ ] Accessibility > 90
- [ ] Best Practices > 90
- [ ] SEO > 90

### F2: Page Load Times
- [ ] Landing page: < 2 seconds
- [ ] Create page: < 1 second
- [ ] Read page: < 1 second

### F3: Bundle Size
- [ ] Check Network tab
- [ ] JavaScript bundle < 50KB
- [ ] CSS bundle < 10KB
- [ ] Total < 100KB

### F4: Memory
- [ ] Open DevTools → Memory
- [ ] Take heap snapshot before test
- [ ] Use app for 5 minutes
- [ ] Take heap snapshot after
- [ ] No significant memory increase

---

## ✅ SECTION G: Cross-Browser Testing (30 minutes)

Test on:
- [ ] Chrome (Windows)
- [ ] Firefox (Windows)
- [ ] Safari (macOS or iOS)
- [ ] Edge (Windows)
- [ ] Chrome (Android)
- [ ] Safari (iOS)

For each browser:
- [ ] Landing loads
- [ ] Create works
- [ ] Read works
- [ ] Buttons work
- [ ] Forms work

---

## ✅ SECTION H: Phase 1.6 Cron Job Testing (15 minutes)

### H1: Cron Setup
- [ ] vercel.json exists in project root
- [ ] Schedule set to: `0 * * * *` (every hour)
- [ ] CRON_SECRET environment variable set

### H2: Manual Test
- [ ] Create secret with 1 minute expiry (if possible)
- [ ] Wait 2 minutes
- [ ] Try to open link
- [ ] Should show "Not Found" (deleted by cron)

### H3: Check Logs
- [ ] Go to Vercel dashboard
- [ ] Check logs for cron job execution
- [ ] Should show successful runs
- [ ] Check deleted count

### H4: Verify Deletion
- [ ] Check Supabase database
- [ ] Expired secrets should be deleted
- [ ] Unread secrets with past expiry = 0

---

## ✅ FINAL CHECKLIST

Before marking Phase 1 complete:

- [ ] All A sections passed
- [ ] All B sections passed
- [ ] All C sections passed
- [ ] All D sections passed
- [ ] All E sections passed
- [ ] All F sections passed
- [ ] All G sections passed
- [ ] All H sections passed
- [ ] No console errors
- [ ] No console warnings
- [ ] Mobile responsive
- [ ] Dark mode works
- [ ] U1 buttons working
- [ ] Cron job running
- [ ] Documentation complete

---

## 🐛 Bug Tracking

Found bugs? Fill this table:

| # | Issue | Severity | Fix |
|---|-------|----------|-----|
| 1 | Example bug | High | Fixed |
| 2 |  |  |  |
| 3 |  |  |  |

---

## 📝 Notes

- Take screenshots of tests
- Document all bugs
- Get user feedback
- Check analytics

---

## 🎉 Phase 1.7 Complete!

When ALL checkboxes are checked:

✅ **Phase 1 = 100% COMPLETE!**

Ready for Phase 2 (Payments) 🚀

