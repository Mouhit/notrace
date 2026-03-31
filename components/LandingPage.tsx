"use client";
import { useState } from "react";
import Link from "next/link";
import {
  Shield, Lock, Flame, Clock, MessageCircle,
  FolderOpen, Globe, Smartphone, ChevronDown,
  ChevronUp, ArrowRight, Eye, Server, Zap
} from "lucide-react";

// ─── Data ──────────────────────────────────────────────────────────────────

const HOW_IT_WORKS = [
  {
    step: "01",
    icon: <Lock className="w-6 h-6" />,
    title: "Type your secret",
    desc: "Write your message. Your browser instantly encrypts it with AES-256-GCM — before it leaves your device.",
  },
  {
    step: "02",
    icon: <Shield className="w-6 h-6" />,
    title: "Get a secure link",
    desc: "We store only ciphertext. The decryption key lives in your link's URL fragment — never sent to our server.",
  },
  {
    step: "03",
    icon: <Flame className="w-6 h-6" />,
    title: "They read. It burns.",
    desc: "The recipient opens the link, your browser decrypts locally, and the secret is permanently destroyed.",
  },
];

const FEATURES = [
  { icon: <Flame className="w-5 h-5" />, title: "Burn After Read", desc: "Permanently destroyed after the first view. No recovery, no second chances." },
  { icon: <Lock className="w-5 h-5" />, title: "AES-256 Encrypted", desc: "Military-grade encryption in your browser. Server never sees plaintext." },
  { icon: <Server className="w-5 h-5" />, title: "Zero-Knowledge", desc: "We literally cannot read your secrets. The key never touches our servers." },
  { icon: <Clock className="w-5 h-5" />, title: "Scheduled Secrets", desc: "Set a reveal date. Perfect for birthday messages or timed announcements." },
  { icon: <MessageCircle className="w-5 h-5" />, title: "Secure Reply", desc: "Recipients can send one encrypted reply back. Also burn-after-read." },
  { icon: <FolderOpen className="w-5 h-5" />, title: "Collections", desc: "Organise secrets by project or team. Track read/unread status." },
  { icon: <Globe className="w-5 h-5" />, title: "15 Languages", desc: "English, Hindi, Arabic, Spanish, French, German, Japanese and more." },
  { icon: <Smartphone className="w-5 h-5" />, title: "Install as App", desc: "Works as a PWA. Install on mobile or desktop. Works offline." },
];

const FAQS = [
  {
    q: "Can NoTrace read my secrets?",
    a: "No. Your message is encrypted in your browser before it's sent. The decryption key lives only in the URL fragment — a part of the URL that browsers never transmit to servers. We store only unreadable ciphertext.",
  },
  {
    q: "What happens after someone reads my secret?",
    a: "The secret is immediately marked as read and permanently deleted from our database. It cannot be recovered, re-opened, or accessed again by anyone — including us.",
  },
  {
    q: "Do I need an account?",
    a: "No. NoTrace requires zero accounts, zero sign-ups, and zero personal information. Completely anonymous by design.",
  },
  {
    q: "What if the link expires before the recipient opens it?",
    a: "The secret is automatically deleted when it expires. You can choose 5 minutes, 1 hour, 24 hours, or no expiry when creating the link.",
  },
  {
    q: "Is NoTrace free?",
    a: "Yes. NoTrace is completely free with no limits, no ads, and no premium tier. No accounts means no upsells.",
  },
  {
    q: "How is this different from WhatsApp or Signal?",
    a: "WhatsApp and Signal require both parties to have accounts and be contacts. NoTrace works with just a link — send to anyone, anywhere, no app required.",
  },
];

// ─── Components ────────────────────────────────────────────────────────────

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div
      className="border-b border-stone-200 last:border-0"
      onClick={() => setOpen(!open)}
    >
      <button className="w-full flex items-center justify-between py-5 text-left gap-4">
        <span className="text-sm font-semibold text-stone-800">{q}</span>
        {open
          ? <ChevronUp className="w-4 h-4 text-stone-400 shrink-0" />
          : <ChevronDown className="w-4 h-4 text-stone-400 shrink-0" />
        }
      </button>
      {open && (
        <p className="text-sm text-stone-500 pb-5 leading-relaxed">{a}</p>
      )}
    </div>
  );
}

// ─── Main Landing Page ──────────────────────────────────────────────────────

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#fafaf8] text-stone-900" style={{ fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif" }}>

      {/* Google Font */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=DM+Mono:wght@400;500&display=swap');
        * { box-sizing: border-box; }
        .hero-glow { background: radial-gradient(ellipse 60% 40% at 50% 0%, rgba(0,180,120,0.08) 0%, transparent 70%); }
        .feature-card:hover { transform: translateY(-2px); }
        .feature-card { transition: transform 0.2s ease, box-shadow 0.2s ease; }
        .step-line::after { content: ''; position: absolute; top: 28px; left: calc(50% + 32px); width: calc(100% - 64px); height: 1px; background: linear-gradient(to right, #d4d4aa, transparent); }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .fade-up { animation: fadeUp 0.6s ease forwards; }
        .fade-up-1 { animation-delay: 0.1s; opacity: 0; }
        .fade-up-2 { animation-delay: 0.2s; opacity: 0; }
        .fade-up-3 { animation-delay: 0.3s; opacity: 0; }
        .fade-up-4 { animation-delay: 0.4s; opacity: 0; }
      `}</style>

      {/* ── Nav ── */}
      <nav className="sticky top-0 z-50 bg-[#fafaf8]/90 backdrop-blur-sm border-b border-stone-200">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-base tracking-tight">
              No<span className="text-emerald-500">Trace</span>
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <a href="#features" className="text-sm text-stone-500 hover:text-stone-800 transition-colors hidden sm:block">Features</a>
            <a href="#security" className="text-sm text-stone-500 hover:text-stone-800 transition-colors hidden sm:block">Security</a>
            <a href="#faq" className="text-sm text-stone-500 hover:text-stone-800 transition-colors hidden sm:block">FAQ</a>
            <Link href="/"
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-500 text-white text-sm font-semibold hover:bg-emerald-600 transition-colors"
            >
              Try it free <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="hero-glow pt-20 pb-24 px-6">
        <div className="max-w-3xl mx-auto text-center space-y-6">

          {/* Badge */}
          <div className="fade-up fade-up-1 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-emerald-200 bg-emerald-50 text-xs font-semibold text-emerald-700">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Zero-knowledge · End-to-end encrypted
          </div>

          {/* Headline */}
          <h1 className="fade-up fade-up-2 text-5xl sm:text-6xl font-bold tracking-tight text-stone-900 leading-[1.1]"
            style={{ fontFamily: "'DM Sans', sans-serif" }}>
            Send secrets that<br />
            <span className="text-emerald-500">self-destruct.</span>
          </h1>

          {/* Subhead */}
          <p className="fade-up fade-up-3 text-lg text-stone-500 max-w-xl mx-auto leading-relaxed">
            Share passwords, API keys, and sensitive information with a link that burns after reading. No accounts. No logs. We can't read your secrets — even if we wanted to.
          </p>

          {/* CTAs */}
          <div className="fade-up fade-up-4 flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link href="/"
              className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-emerald-500 text-white font-semibold hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/20 text-sm"
            >
              <Shield className="w-4 h-4" />
              Send a Secret — Free
            </Link>
            <a href="#how-it-works"
              className="flex items-center gap-2 px-6 py-3.5 rounded-xl border border-stone-200 text-stone-600 font-medium hover:border-stone-300 hover:bg-stone-50 transition-all text-sm"
            >
              See how it works
            </a>
          </div>

          {/* Trust bar */}
          <div className="fade-up fade-up-4 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 pt-4 text-xs text-stone-400">
            <span className="flex items-center gap-1.5"><Lock className="w-3.5 h-3.5" /> AES-256-GCM</span>
            <span className="flex items-center gap-1.5"><Eye className="w-3.5 h-3.5" /> Zero-knowledge</span>
            <span className="flex items-center gap-1.5"><Flame className="w-3.5 h-3.5" /> Burn-after-read</span>
            <span className="flex items-center gap-1.5"><Zap className="w-3.5 h-3.5" /> No accounts</span>
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section id="how-it-works" className="py-20 px-6 bg-white border-y border-stone-100">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-xs font-semibold text-emerald-600 uppercase tracking-widest mb-3">How it works</p>
            <h2 className="text-3xl font-bold text-stone-900">Three steps. Total privacy.</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {HOW_IT_WORKS.map((item, i) => (
              <div key={i} className="relative text-center space-y-4">
                <div className="flex flex-col items-center gap-3">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
                    {item.icon}
                  </div>
                  <span className="text-xs font-bold text-stone-300 tracking-widest"
                    style={{ fontFamily: "'DM Mono', monospace" }}>
                    {item.step}
                  </span>
                </div>
                <h3 className="text-base font-semibold text-stone-800">{item.title}</h3>
                <p className="text-sm text-stone-500 leading-relaxed">{item.desc}</p>
                {i < 2 && (
                  <div className="hidden md:block absolute top-7 left-[calc(50%+36px)] w-[calc(100%-72px)] h-px bg-gradient-to-r from-stone-200 to-transparent" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" className="py-20 px-6 bg-[#fafaf8]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-xs font-semibold text-emerald-600 uppercase tracking-widest mb-3">Features</p>
            <h2 className="text-3xl font-bold text-stone-900">Everything you need. Nothing you don't.</h2>
            <p className="text-stone-500 mt-3 text-sm max-w-md mx-auto">NoTrace is designed to be the last secret-sharing tool you'll ever need.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {FEATURES.map((f, i) => (
              <div key={i}
                className="feature-card p-5 rounded-2xl bg-white border border-stone-100 shadow-sm hover:shadow-md space-y-3"
              >
                <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
                  {f.icon}
                </div>
                <div>
                  <p className="text-sm font-semibold text-stone-800">{f.title}</p>
                  <p className="text-xs text-stone-500 mt-1 leading-relaxed">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Security ── */}
      <section id="security" className="py-20 px-6 bg-stone-900 text-white">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

            {/* Left — text */}
            <div className="space-y-6">
              <p className="text-xs font-semibold text-emerald-400 uppercase tracking-widest">Security</p>
              <h2 className="text-3xl font-bold leading-tight">
                We designed it so we <span className="text-emerald-400">can't</span> betray your trust.
              </h2>
              <p className="text-stone-400 leading-relaxed text-sm">
                Most "secure" tools store your messages in plaintext and just promise not to look. NoTrace is architected differently — the encryption key never leaves your browser.
              </p>
              <div className="space-y-4 pt-2">
                {[
                  { icon: <Lock className="w-4 h-4 text-emerald-400" />, title: "Browser-side encryption", desc: "AES-256-GCM encryption happens locally before anything is sent." },
                  { icon: <Server className="w-4 h-4 text-emerald-400" />, title: "Key never touches server", desc: "Decryption key lives in the URL #fragment — browsers never transmit this." },
                  { icon: <Shield className="w-4 h-4 text-emerald-400" />, title: "Rate limiting + brute force detection", desc: "Automatic Telegram alerts on suspicious activity. 5 password attempts max." },
                  { icon: <Eye className="w-4 h-4 text-emerald-400" />, title: "Security headers on every request", desc: "HSTS, CSP, X-Frame-Options, Referrer-Policy — all enforced." },
                ].map((item, i) => (
                  <div key={i} className="flex gap-3">
                    <div className="mt-0.5 shrink-0">{item.icon}</div>
                    <div>
                      <p className="text-sm font-semibold text-white">{item.title}</p>
                      <p className="text-xs text-stone-500 mt-0.5 leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right — visual */}
            <div className="relative">
              <div className="rounded-2xl border border-stone-700 bg-stone-800 p-6 space-y-4"
                style={{ fontFamily: "'DM Mono', monospace" }}>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-3 h-3 rounded-full bg-red-500/60" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500/60" />
                  <span className="text-xs text-stone-500 ml-2">encryption flow</span>
                </div>
                {[
                  { label: "your message", value: "Meet at 9pm tomorrow", color: "text-white" },
                  { label: "aes-256 key", value: "aB3xKm9...QpR2 (in URL only)", color: "text-emerald-400" },
                  { label: "what server sees", value: "7f3a9b2c8d1e4f6a...", color: "text-stone-500" },
                  { label: "server can decrypt?", value: "✗ impossible", color: "text-red-400" },
                ].map((row, i) => (
                  <div key={i} className="space-y-1">
                    <p className="text-xs text-stone-600 uppercase tracking-wider">{row.label}</p>
                    <p className={`text-sm font-medium ${row.color}`}>{row.value}</p>
                    {i < 3 && <div className="border-b border-stone-700/50 pt-1" />}
                  </div>
                ))}
              </div>
              {/* Glow */}
              <div className="absolute -inset-4 rounded-3xl bg-emerald-500/5 -z-10" />
            </div>
          </div>
        </div>
      </section>

      {/* ── Use cases ── */}
      <section className="py-20 px-6 bg-white border-y border-stone-100">
        <div className="max-w-4xl mx-auto text-center space-y-10">
          <div>
            <p className="text-xs font-semibold text-emerald-600 uppercase tracking-widest mb-3">Who uses NoTrace</p>
            <h2 className="text-3xl font-bold text-stone-900">Built for anyone who values privacy.</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { emoji: "💻", label: "Developers", desc: "Share API keys, tokens, credentials securely with teammates." },
              { emoji: "🏢", label: "Teams", desc: "Send passwords and sensitive docs without leaving email trails." },
              { emoji: "📰", label: "Journalists", desc: "Communicate with sources safely, leaving no trace." },
              { emoji: "👤", label: "Everyone", desc: "Send anything private — to anyone, anywhere, no app required." },
            ].map((item, i) => (
              <div key={i} className="p-5 rounded-2xl bg-stone-50 border border-stone-100 text-center space-y-2">
                <div className="text-3xl">{item.emoji}</div>
                <p className="text-sm font-semibold text-stone-800">{item.label}</p>
                <p className="text-xs text-stone-500 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section id="faq" className="py-20 px-6 bg-[#fafaf8]">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-xs font-semibold text-emerald-600 uppercase tracking-widest mb-3">FAQ</p>
            <h2 className="text-3xl font-bold text-stone-900">Questions? We have answers.</h2>
          </div>
          <div className="bg-white rounded-2xl border border-stone-100 shadow-sm px-6">
            {FAQS.map((faq, i) => (
              <FAQItem key={i} q={faq.q} a={faq.a} />
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-20 px-6 bg-emerald-500">
        <div className="max-w-2xl mx-auto text-center space-y-6">
          <h2 className="text-3xl font-bold text-white">
            Ready to send your first secret?
          </h2>
          <p className="text-emerald-100 text-sm">
            No sign-up. No credit card. No trace.
          </p>
          <Link href="/"
            className="inline-flex items-center gap-2 px-7 py-4 rounded-xl bg-white text-emerald-600 font-bold text-sm hover:bg-emerald-50 transition-all shadow-xl"
          >
            <Shield className="w-4 h-4" />
            Send a Secret — It's Free
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="py-10 px-6 bg-stone-900 text-stone-500">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-emerald-500 flex items-center justify-center">
              <Shield className="w-3 h-3 text-white" />
            </div>
            <span className="text-sm text-stone-400 font-medium">NoTrace</span>
            <span className="text-stone-600">·</span>
            <span className="text-xs">No logs · No tracking · No accounts</span>
          </div>
          <div className="flex items-center gap-5 text-xs">
            <Link href="/" className="hover:text-stone-300 transition-colors">App</Link>
            <Link href="/collections" className="hover:text-stone-300 transition-colors">Collections</Link>
            <Link href="/admin" className="hover:text-stone-300 transition-colors">Admin</Link>
            <span className="text-stone-600">© {new Date().getFullYear()} NoTrace</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
