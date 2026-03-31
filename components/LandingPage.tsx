"use client";
import { useState } from "react";
import Link from "next/link";
import {
  Shield, Lock, Flame, Clock, MessageCircle,
  FolderOpen, Globe, Smartphone, ChevronDown,
  ChevronUp, ArrowRight, Eye, Server, Zap, Mail,
  CheckCircle2, Building2
} from "lucide-react";

const FAQS = [
  { q: "Can NoTrace read my secrets?", a: "No. Your message is encrypted in your browser before it's sent. The decryption key lives only in the URL fragment — a part of the URL that browsers never transmit to servers. We store only unreadable ciphertext." },
  { q: "What happens after someone reads my secret?", a: "The secret is immediately marked as read and permanently deleted from our database. It cannot be recovered, re-opened, or accessed again by anyone — including us." },
  { q: "Do I need an account?", a: "No. NoTrace requires zero accounts, zero sign-ups, and zero personal information. Completely anonymous by design." },
  { q: "What if the link expires before the recipient opens it?", a: "The secret is automatically deleted when it expires. You can choose 5 minutes, 1 hour, 24 hours, or no expiry when creating the link." },
  { q: "Is NoTrace free?", a: "Yes. NoTrace is completely free with no limits, no ads, and no premium tier." },
  { q: "How is this different from WhatsApp or Signal?", a: "WhatsApp and Signal require both parties to have accounts and be contacts. NoTrace works with just a link — send to anyone, anywhere, no app required. And unlike WhatsApp, your messages truly disappear — not just visually, but permanently from our servers." },
];

const FEATURES = [
  { icon: "🔥", title: "Burn After Read", desc: "Permanently destroyed after the first view. No recovery, no second chances." },
  { icon: "🔐", title: "AES-256 Encrypted", desc: "Military-grade encryption in your browser. Server never sees plaintext." },
  { icon: "🕵️", title: "Zero-Knowledge", desc: "We literally cannot read your secrets. The key never touches our servers." },
  { icon: "⏰", title: "Scheduled Secrets", desc: "Set a reveal date. Perfect for birthday messages or timed announcements." },
  { icon: "💬", title: "Secure Reply", desc: "Recipients can send one encrypted reply back. Also burn-after-read." },
  { icon: "📁", title: "Collections", desc: "Organise secrets by project or team. Track read/unread status instantly." },
  { icon: "🌍", title: "15 Languages", desc: "English, Hindi, Arabic, Spanish, French, German, Japanese and more." },
  { icon: "📱", title: "Install as App", desc: "Works as a PWA. Install on mobile or desktop. Works fully offline." },
];

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-stone-100 last:border-0 cursor-pointer" onClick={() => setOpen(!open)}>
      <button className="w-full flex items-center justify-between py-5 text-left gap-4">
        <span className="text-sm font-semibold text-stone-800">{q}</span>
        {open ? <ChevronUp className="w-4 h-4 text-stone-400 shrink-0" /> : <ChevronDown className="w-4 h-4 text-stone-400 shrink-0" />}
      </button>
      {open && <p className="text-sm text-stone-500 pb-5 leading-relaxed">{a}</p>}
    </div>
  );
}

export default function LandingPage() {
  return (
    <div className="landing-root min-h-screen" style={{ background: "#ffffff", color: "#1c1917", fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,400&family=DM+Mono:wght@400;500&display=swap');
        *, *::before, *::after { box-sizing: border-box; }
        /* Override app dark theme globals for landing page */
        .landing-root, .landing-root * { font-family: 'DM Sans', 'Helvetica Neue', sans-serif !important; }
        .landing-root .mono { font-family: 'DM Mono', monospace !important; }
        .landing-root .text-white { color: #ffffff !important; }
        .landing-root .text-stone-900 { color: #1c1917 !important; }
        .landing-root .text-stone-800 { color: #292524 !important; }
        .landing-root .text-stone-600 { color: #57534e !important; }
        .landing-root .text-stone-500 { color: #78716c !important; }
        .landing-root .text-stone-400 { color: #a8a29e !important; }
        .landing-root .text-stone-300 { color: #d6d3d1 !important; }
        .landing-root .bg-white { background-color: #ffffff !important; }
        .landing-root .bg-stone-50 { background-color: #fafaf8 !important; }
        .landing-root .bg-stone-900 { background-color: #1c1917 !important; }
        .landing-root .bg-stone-800 { background-color: #292524 !important; }
        .landing-root .border-stone-100 { border-color: #f5f5f4 !important; }
        .landing-root .border-stone-200 { border-color: #e7e5e4 !important; }
        .landing-root .border-stone-700 { border-color: #44403c !important; }
        .feature-card { transition: transform 0.2s ease, box-shadow 0.2s ease; }
        .feature-card:hover { transform: translateY(-3px); box-shadow: 0 12px 32px rgba(0,0,0,0.08); }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); } }
        .fade-up { animation: fadeUp 0.7s cubic-bezier(0.22,1,0.36,1) forwards; }
        .d1 { animation-delay: 0.05s; opacity: 0; }
        .d2 { animation-delay: 0.15s; opacity: 0; }
        .d3 { animation-delay: 0.25s; opacity: 0; }
        .d4 { animation-delay: 0.35s; opacity: 0; }
        .d5 { animation-delay: 0.45s; opacity: 0; }
        .hero-bg { background: linear-gradient(135deg, #f0fdf4 0%, #ffffff 40%, #fefce8 100%); }
        .emerald-glow { box-shadow: 0 0 40px rgba(16,185,129,0.2); }
        .noise { background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.03'/%3E%3C/svg%3E"); }
      `}</style>

      {/* ── Sticky Nav ── */}
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-stone-100">
        <div className="max-w-6xl mx-auto px-6 py-3.5 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center shadow-sm">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-base">No<span className="text-emerald-500">Trace</span></span>
          </Link>
          <div className="hidden md:flex items-center gap-6 text-sm text-stone-500">
            <a href="#how" className="hover:text-stone-800 transition-colors">How it works</a>
            <a href="#features" className="hover:text-stone-800 transition-colors">Features</a>
            <a href="#security" className="hover:text-stone-800 transition-colors">Security</a>
            <a href="#faq" className="hover:text-stone-800 transition-colors">FAQ</a>
          </div>
          <Link href="/"
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-500 text-white text-sm font-semibold hover:bg-emerald-600 active:scale-95 transition-all shadow-sm"
          >
            Create Secure Message <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="hero-bg noise relative overflow-hidden pt-20 pb-28 px-6">
        {/* Decorative blobs */}
        <div className="absolute top-10 right-10 w-72 h-72 rounded-full bg-emerald-100/60 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-64 rounded-full bg-yellow-50/80 blur-3xl pointer-events-none" />

        <div className="max-w-4xl mx-auto text-center relative z-10 space-y-7">

          {/* Company badge */}
          <div className="fade-up d1 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-stone-200 shadow-sm text-xs font-medium text-stone-600">
            <Building2 className="w-3.5 h-3.5 text-emerald-500" />
            By <span className="text-emerald-600 font-semibold">Engage Ad</span> · MSME Est. 2016 · GST 2024 · Lucknow, India
          </div>

          {/* Headline */}
          <h1 className="fade-up d2 text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-stone-900 leading-[1.05]">
            Send messages that<br />
            <span className="relative inline-block">
              <span className="text-emerald-500">disappear forever.</span>
              <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 300 12" fill="none">
                <path d="M2 10 Q75 2 150 8 Q225 14 298 6" stroke="#10b981" strokeWidth="3" strokeLinecap="round" fill="none" opacity="0.4"/>
              </svg>
            </span>
          </h1>

          {/* Subhead */}
          <p className="fade-up d3 text-xl text-stone-500 max-w-xl mx-auto leading-relaxed">
            No login. No tracking. No history.<br />
            <span className="italic text-stone-400">Like WhatsApp… but messages don't stay.</span>
          </p>

          {/* CTA */}
          <div className="fade-up d4 flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link href="/"
              className="flex items-center gap-2 px-7 py-4 rounded-2xl bg-emerald-500 text-white font-bold text-base hover:bg-emerald-600 active:scale-95 transition-all shadow-lg emerald-glow"
            >
              <Shield className="w-5 h-5" />
              Create Secure Message — Free
            </Link>
            <a href="#how"
              className="flex items-center gap-2 px-6 py-4 rounded-2xl border-2 border-stone-200 text-stone-600 font-semibold hover:border-emerald-300 hover:text-emerald-600 transition-all text-base"
            >
              See how it works
            </a>
          </div>

          {/* Emotional line */}
          <p className="fade-up d5 text-sm text-stone-400 italic pt-2">
            "Not everything should stay forever."
          </p>

          {/* Trust pills */}
          <div className="fade-up d5 flex flex-wrap justify-center gap-3 pt-4">
            {[
              { icon: <Lock className="w-3.5 h-3.5" />, label: "AES-256-GCM" },
              { icon: <Eye className="w-3.5 h-3.5" />, label: "Zero-knowledge" },
              { icon: <Flame className="w-3.5 h-3.5" />, label: "Burn-after-read" },
              { icon: <Zap className="w-3.5 h-3.5" />, label: "No accounts ever" },
              { icon: <Globe className="w-3.5 h-3.5" />, label: "15 languages" },
            ].map((t, i) => (
              <span key={i} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-stone-200 text-xs font-medium text-stone-600 shadow-sm">
                <span className="text-emerald-500">{t.icon}</span>
                {t.label}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── Comparison bar ── */}
      <section className="bg-stone-900 py-5 px-6">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-12 text-sm">
          <div className="flex items-center gap-3 text-stone-400">
            <span className="text-red-400 text-lg">✕</span>
            <span>WhatsApp stores your chats forever</span>
          </div>
          <div className="hidden sm:block w-px h-6 bg-stone-700" />
          <div className="flex items-center gap-3 text-emerald-400 font-semibold">
            <span className="text-emerald-400 text-lg">✓</span>
            <span>NoTrace — messages vanish after reading</span>
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section id="how" className="py-24 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-xs font-bold text-emerald-500 uppercase tracking-widest mb-3">How it works</p>
            <h2 className="text-4xl font-extrabold text-stone-900">Three steps. Total privacy.</h2>
            <p className="text-stone-500 mt-3 max-w-md mx-auto">No technical knowledge needed. If you can send a WhatsApp message, you can use NoTrace.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
            {/* Connecting line */}
            <div className="hidden md:block absolute top-12 left-[33.3%] w-[33.3%] h-px bg-gradient-to-r from-emerald-200 to-emerald-200 z-0" />
            <div className="hidden md:block absolute top-12 left-[66.6%] w-[16.7%] h-px bg-gradient-to-r from-emerald-200 to-transparent z-0" />
            {[
              { step: "1", emoji: "✍️", title: "Write your secret", desc: "Type your message — password, API key, personal note. Your browser encrypts it instantly." },
              { step: "2", emoji: "🔗", title: "Share the link", desc: "Copy your secure link and send it via WhatsApp, Telegram, email — anywhere." },
              { step: "3", emoji: "💥", title: "They read. It burns.", desc: "The recipient opens it once. Then it's gone forever. No recovery possible." },
            ].map((s, i) => (
              <div key={i} className="relative z-10 text-center bg-stone-50 rounded-2xl p-8 border border-stone-100">
                <div className="w-14 h-14 rounded-2xl bg-emerald-500 text-white text-2xl flex items-center justify-center mx-auto mb-4 shadow-md">
                  {s.emoji}
                </div>
                <span className="text-xs font-bold text-emerald-500 tracking-widest" className="mono">STEP {s.step}</span>
                <h3 className="text-base font-bold text-stone-800 mt-2 mb-2">{s.title}</h3>
                <p className="text-sm text-stone-500 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" className="py-24 px-6 bg-stone-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-xs font-bold text-emerald-500 uppercase tracking-widest mb-3">Features</p>
            <h2 className="text-4xl font-extrabold text-stone-900">Everything you need.<br />Nothing you don't.</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {FEATURES.map((f, i) => (
              <div key={i} className="feature-card p-6 rounded-2xl bg-white border border-stone-100 shadow-sm space-y-3 cursor-default">
                <div className="text-3xl">{f.icon}</div>
                <div>
                  <p className="text-sm font-bold text-stone-800">{f.title}</p>
                  <p className="text-xs text-stone-500 mt-1.5 leading-relaxed">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Security ── */}
      <section id="security" className="py-24 px-6 bg-stone-900 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-emerald-500/5 blur-3xl pointer-events-none" />
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center relative z-10">

          <div className="space-y-7">
            <p className="text-xs font-bold text-emerald-400 uppercase tracking-widest">Security</p>
            <h2 className="text-4xl font-extrabold leading-tight">
              We designed it so we <span className="text-emerald-400">can't</span> betray your trust.
            </h2>
            <p className="text-stone-400 leading-relaxed">
              Most "secure" tools store your messages in plaintext and promise not to look. NoTrace is architectured differently — the encryption key never leaves your browser. Ever.
            </p>
            <div className="space-y-5">
              {[
                { icon: "🔐", title: "Browser-side AES-256-GCM encryption", desc: "Encryption happens locally before anything is transmitted." },
                { icon: "🕵️", title: "Key never touches our server", desc: "Decryption key lives in URL #fragment — browsers never send this in HTTP requests." },
                { icon: "🛡️", title: "Rate limiting + brute force detection", desc: "Auto Telegram alerts on suspicious activity. 5 password attempts max per secret." },
                { icon: "📋", title: "Full security headers", desc: "HSTS, CSP, X-Frame-Options, Referrer-Policy enforced on every single request." },
              ].map((item, i) => (
                <div key={i} className="flex gap-4 p-4 rounded-xl bg-stone-800/50 border border-stone-700/50">
                  <span className="text-xl shrink-0 mt-0.5">{item.icon}</span>
                  <div>
                    <p className="text-sm font-semibold text-white">{item.title}</p>
                    <p className="text-xs text-stone-500 mt-1 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Code visual */}
          <div className="rounded-2xl border border-stone-700 bg-stone-800 overflow-hidden shadow-2xl">
            <div className="flex items-center gap-2 px-5 py-3.5 bg-stone-900 border-b border-stone-700">
              <div className="w-3 h-3 rounded-full bg-red-500/70" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
              <div className="w-3 h-3 rounded-full bg-emerald-500/70" />
              <span className="text-xs text-stone-500 ml-2" className="mono">notrace — encryption flow</span>
            </div>
            <div className="p-6 space-y-5" className="mono">
              {[
                { label: "// your message", value: "Meet at 9pm tomorrow", color: "text-white", bg: "" },
                { label: "// encrypted in browser", value: "7f3a9b2c8d1e4f6a49c2...", color: "text-emerald-400", bg: "" },
                { label: "// what server stores", value: "7f3a9b2c8d1e4f6a49c2...", color: "text-stone-500", bg: "" },
                { label: "// server can decrypt?", value: "✗  IMPOSSIBLE — key not here", color: "text-red-400", bg: "bg-red-950/30 rounded-lg px-3 py-1" },
                { label: "// key location", value: "URL fragment (#) — browser only", color: "text-yellow-400", bg: "" },
              ].map((row, i) => (
                <div key={i}>
                  <p className="text-xs text-stone-600 mb-1">{row.label}</p>
                  <p className={`text-sm font-medium ${row.color} ${row.bg}`}>{row.value}</p>
                  {i < 4 && <div className="mt-4 border-b border-stone-700/40" />}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Use cases ── */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-5xl mx-auto text-center">
          <p className="text-xs font-bold text-emerald-500 uppercase tracking-widest mb-3">Who uses NoTrace</p>
          <h2 className="text-4xl font-extrabold text-stone-900 mb-12">Built for anyone who values privacy.</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { emoji: "💻", label: "Developers", desc: "Share API keys, tokens, and credentials without email trails." },
              { emoji: "🏢", label: "Teams", desc: "Send passwords and sensitive docs that self-destruct after reading." },
              { emoji: "📰", label: "Journalists", desc: "Communicate with sources safely. No chat history, no risk." },
              { emoji: "👤", label: "Everyone", desc: "Send anything private — to anyone, anywhere, no app needed." },
            ].map((item, i) => (
              <div key={i} className="p-6 rounded-2xl bg-stone-50 border border-stone-100 text-center space-y-3">
                <div className="text-4xl">{item.emoji}</div>
                <p className="text-sm font-bold text-stone-800">{item.label}</p>
                <p className="text-xs text-stone-500 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section id="faq" className="py-24 px-6 bg-stone-50">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-xs font-bold text-emerald-500 uppercase tracking-widest mb-3">FAQ</p>
            <h2 className="text-4xl font-extrabold text-stone-900">Questions answered.</h2>
          </div>
          <div className="bg-white rounded-2xl border border-stone-100 shadow-sm px-6">
            {FAQS.map((faq, i) => <FAQItem key={i} q={faq.q} a={faq.a} />)}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-24 px-6 bg-emerald-500 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 50%, white 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
        <div className="max-w-2xl mx-auto text-center relative z-10 space-y-6">
          <h2 className="text-4xl font-extrabold text-white leading-tight">
            Ready to send your<br />first secret?
          </h2>
          <p className="text-emerald-100">No sign-up. No credit card. No trace. Forever free.</p>
          <Link href="/"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-white text-emerald-600 font-extrabold hover:bg-emerald-50 active:scale-95 transition-all shadow-xl text-base"
          >
            <Shield className="w-5 h-5" />
            Create Secure Message — It's Free
            <ArrowRight className="w-4 h-4" />
          </Link>
          <p className="text-emerald-200 text-sm italic">"Not everything should stay forever."</p>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="py-12 px-6 bg-stone-900">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

            {/* Brand */}
            <div className="space-y-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center">
                  <Shield className="w-4 h-4 text-white" />
                </div>
                <span className="font-bold text-white">No<span className="text-emerald-400">Trace</span></span>
              </div>
              <p className="text-xs text-stone-500 leading-relaxed">
                Send secrets that self-destruct.<br />
                No accounts. No logs. No trace.
              </p>
              <div className="flex flex-wrap gap-2">
                {["AES-256-GCM", "Zero-Knowledge", "Burn-after-read"].map((t) => (
                  <span key={t} className="px-2 py-1 rounded-md bg-stone-800 text-xs text-stone-400 border border-stone-700">{t}</span>
                ))}
              </div>
            </div>

            {/* Links */}
            <div className="space-y-4">
              <p className="text-xs font-bold text-stone-400 uppercase tracking-widest">Product</p>
              <div className="space-y-2.5">
                {[
                  { label: "Create Secret", href: "/" },
                  { label: "My Collections", href: "/collections" },
                  { label: "Admin Dashboard", href: "/admin" },
                ].map((l) => (
                  <Link key={l.label} href={l.href} className="block text-sm text-stone-500 hover:text-stone-300 transition-colors">{l.label}</Link>
                ))}
              </div>
            </div>

            {/* Company */}
            <div className="space-y-4">
              <p className="text-xs font-bold text-stone-400 uppercase tracking-widest">Company</p>
              <div className="space-y-3 text-sm text-stone-500">
                <div className="flex items-start gap-2">
                  <Building2 className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-stone-300 font-semibold">Engage Ad</p>
                    <p className="text-xs">MSME Registered · Est. 2016</p>
                    <p className="text-xs">Lucknow, Uttar Pradesh, India</p>
                    <p className="text-xs">GST Registered · Since 2024</p>
                    <p className="text-xs mt-1">GST: 09GVRPK4451F2Z3</p>
                  </div>
                </div>
                <a href="mailto:azadraj@engagead.in" className="flex items-center gap-2 hover:text-emerald-400 transition-colors">
                  <Mail className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>azadraj@engagead.in</span>
                </a>
                <p className="text-xs text-stone-600">CTO — Queries & partnerships</p>
              </div>
            </div>

          </div>

          <div className="border-t border-stone-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-stone-600">
            <p>© {new Date().getFullYear()} Engage Ad. All rights reserved. NoTrace is a product of Engage Ad.</p>
            <p>No logs · No tracking · No accounts · Privacy first</p>
          </div>
        </div>
      </footer>

    </div>
  );
}
