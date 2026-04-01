"use client";
import { useState, CSSProperties } from "react";
import Link from "next/link";

// ─── Tokens ────────────────────────────────────────────────────────────────
const C = {
  white: "#ffffff",
  bg: "#fafaf8",
  bgHero: "linear-gradient(135deg, #f0fdf4 0%, #ffffff 45%, #fefce8 100%)",
  dark: "#1c1917",
  dark2: "#292524",
  dark3: "#44403c",
  mid: "#57534e",
  muted: "#78716c",
  muted2: "#a8a29e",
  muted3: "#d6d3d1",
  border: "#e7e5e4",
  border2: "#f5f5f4",
  emerald: "#10b981",
  emeraldDark: "#059669",
  emeraldLight: "#ecfdf5",
  emeraldBorder: "#a7f3d0",
  stone800: "#292524",
  stone700: "#44403c",
  stone600: "#57534e",
};

const F = {
  sans: "'DM Sans', 'Helvetica Neue', Arial, sans-serif",
  mono: "'DM Mono', 'Fira Code', monospace",
};

// ─── Reusable style helpers ─────────────────────────────────────────────────
const s = {
  section: (bg = C.white): CSSProperties => ({
    padding: "80px 24px",
    background: bg,
    fontFamily: F.sans,
  }),
  container: (maxW = 1100): CSSProperties => ({
    maxWidth: maxW,
    margin: "0 auto",
  }),
  label: (): CSSProperties => ({
    fontSize: 11,
    fontWeight: 700,
    color: C.emerald,
    textTransform: "uppercase",
    letterSpacing: "0.12em",
    marginBottom: 12,
    fontFamily: F.sans,
  }),
  h2: (light = false): CSSProperties => ({
    fontSize: "clamp(28px, 4vw, 38px)",
    fontWeight: 800,
    color: light ? C.white : C.dark,
    lineHeight: 1.15,
    margin: "0 0 16px",
    fontFamily: F.sans,
  }),
  body: (light = false): CSSProperties => ({
    fontSize: 15,
    color: light ? "#a8a29e" : C.muted,
    lineHeight: 1.7,
    fontFamily: F.sans,
  }),
  card: (): CSSProperties => ({
    background: C.white,
    border: `1px solid ${C.border}`,
    borderRadius: 16,
    padding: 24,
    boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
    fontFamily: F.sans,
  }),
  btn: (variant: "primary" | "outline" = "primary"): CSSProperties => ({
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    padding: "14px 28px",
    borderRadius: 14,
    fontWeight: 700,
    fontSize: 15,
    cursor: "pointer",
    textDecoration: "none",
    border: "none",
    fontFamily: F.sans,
    transition: "all 0.15s ease",
    ...(variant === "primary"
      ? { background: C.emerald, color: C.white, boxShadow: "0 4px 20px rgba(16,185,129,0.3)" }
      : { background: "transparent", color: C.mid, border: `2px solid ${C.border}` }
    ),
  }),
};

// ─── FAQ Item ───────────────────────────────────────────────────────────────
function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div
      onClick={() => setOpen(!open)}
      style={{ borderBottom: `1px solid ${C.border2}`, cursor: "pointer", fontFamily: F.sans }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "18px 0", gap: 16 }}>
        <span style={{ fontSize: 14, fontWeight: 600, color: C.dark, fontFamily: F.sans }}>{q}</span>
        <span style={{ color: C.muted2, fontSize: 18, flexShrink: 0 }}>{open ? "−" : "+"}</span>
      </div>
      {open && <p style={{ fontSize: 14, color: C.muted, lineHeight: 1.7, paddingBottom: 16, margin: 0, fontFamily: F.sans }}>{a}</p>}
    </div>
  );
}

// ─── Main ───────────────────────────────────────────────────────────────────
export default function LandingPage() {
  return (
    <div style={{ fontFamily: F.sans, background: C.white, color: C.dark, minHeight: "100vh" }}>

      {/* Google Fonts */}
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,400;0,500;0,600;0,700;0,800;1,400&family=DM+Mono:wght@400;500&display=swap');`}</style>

      {/* ── Nav ── */}
      <nav style={{ position: "sticky", top: 0, zIndex: 50, background: "rgba(255,255,255,0.92)", backdropFilter: "blur(12px)", borderBottom: `1px solid ${C.border2}`, fontFamily: F.sans }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "14px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: C.emerald, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ color: C.white, fontSize: 16 }}>🔐</span>
            </div>
            <span style={{ fontWeight: 800, fontSize: 16, color: C.dark, fontFamily: F.sans }}>
              No<span style={{ color: C.emerald }}>Trace</span>
            </span>
          </Link>
          <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
            <div style={{ display: "flex", gap: 24 }} className="hide-mobile">
              {["#how", "#features", "#security", "#faq"].map((href, i) => (
                <a key={i} href={href} style={{ fontSize: 14, color: C.muted, textDecoration: "none", fontFamily: F.sans }}>
                  {["How it works", "Features", "Security", "FAQ"][i]}
                </a>
              ))}
            </div>
            <Link href="/" style={s.btn("primary") as any}>
              Try it now — Free →
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section style={{ background: C.bgHero, padding: "80px 24px 100px", fontFamily: F.sans, position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: -80, right: -80, width: 400, height: 400, borderRadius: "50%", background: "rgba(16,185,129,0.06)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: -60, left: -60, width: 300, height: 300, borderRadius: "50%", background: "rgba(253,224,71,0.08)", pointerEvents: "none" }} />

        <div style={{ maxWidth: 800, margin: "0 auto", textAlign: "center", position: "relative", zIndex: 1 }}>

          {/* Company badge */}
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "8px 16px", borderRadius: 999, background: C.white, border: `1px solid ${C.border}`, boxShadow: "0 1px 4px rgba(0,0,0,0.06)", fontSize: 12, color: C.mid, marginBottom: 28, fontFamily: F.sans }}>
            🏢 By <strong style={{ color: C.emerald }}>Engage Ad</strong> · MSME Est. 2016 · GST 2024 · Lucknow, India
          </div>

          {/* Headline — shocking, not safe */}
          <h1 style={{ fontSize: "clamp(36px, 6vw, 64px)", fontWeight: 900, color: C.dark, lineHeight: 1.06, margin: "0 0 20px", fontFamily: F.sans }}>
            This message will<br />
            <span style={{ color: C.emerald }}>self-destruct</span> after<br />
            you read it.
          </h1>

          {/* Curiosity line — THE hook */}
          <p style={{ fontSize: 20, fontWeight: 700, color: C.dark, margin: "0 auto 10px", maxWidth: 480, fontFamily: F.sans }}>
            Even we can't read your messages.
          </p>

          {/* Subhead */}
          <p style={{ fontSize: 16, color: C.muted, lineHeight: 1.6, maxWidth: 460, margin: "0 auto 10px", fontFamily: F.sans }}>
            No login. No tracking. No history.
          </p>
          <p style={{ fontSize: 15, color: C.muted2, fontStyle: "italic", marginBottom: 40, fontFamily: F.sans }}>
            Like WhatsApp… but messages don't stay.
          </p>

          {/* CTA — dominant, impossible to miss */}
          <div style={{ marginBottom: 20 }}>
            <Link href="/" style={{
              display: "inline-flex", alignItems: "center", gap: 10,
              padding: "18px 40px", borderRadius: 16,
              background: C.emerald, color: C.white,
              fontWeight: 900, fontSize: 18,
              textDecoration: "none", fontFamily: F.sans,
              boxShadow: "0 8px 32px rgba(16,185,129,0.4)",
              letterSpacing: "-0.01em",
            } as any}>
              🔐 Try it now — It's Free
            </Link>
          </div>
          <p style={{ fontSize: 13, color: C.muted2, marginBottom: 40, fontFamily: F.sans }}>
            No sign-up. No credit card. Just a link.
          </p>

          {/* ── Visual Demo — message → burn animation ── */}
          <div style={{ maxWidth: 480, margin: "0 auto 36px", borderRadius: 20, overflow: "hidden", border: `1px solid ${C.border}`, boxShadow: "0 8px 40px rgba(0,0,0,0.1)", background: C.white }}>
            <style>{`
              @keyframes msgAppear { 0%{opacity:0;transform:translateY(10px)} 10%{opacity:1;transform:translateY(0)} 70%{opacity:1} 85%{opacity:0;transform:scale(0.95)} 100%{opacity:0} }
              @keyframes burnAppear { 0%{opacity:0} 80%{opacity:0} 90%{opacity:1} 100%{opacity:1} }
              @keyframes flicker { 0%,100%{opacity:1} 50%{opacity:0.7} 30%{opacity:0.9} 70%{opacity:0.8} }
              .demo-msg { animation: msgAppear 5s ease-in-out infinite; }
              .demo-burn { animation: burnAppear 5s ease-in-out infinite; }
              .demo-flame { animation: flicker 0.8s ease-in-out infinite; }
            `}</style>

            {/* Demo header */}
            <div style={{ background: "#f9fafb", borderBottom: `1px solid ${C.border2}`, padding: "12px 16px", display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#ef4444", opacity: 0.6 }} />
              <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#f59e0b", opacity: 0.6 }} />
              <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#10b981", opacity: 0.6 }} />
              <span style={{ fontSize: 12, color: C.muted2, marginLeft: 8, fontFamily: F.mono }}>notrace.co.in/s/xK9mPq...</span>
            </div>

            {/* Demo content */}
            <div style={{ padding: 28, minHeight: 140, display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
              {/* Message state */}
              <div className="demo-msg" style={{ position: "absolute", textAlign: "center", width: "100%" }}>
                <div style={{ display: "inline-block", background: "#f0fdf4", border: `1px solid ${C.emeraldBorder}`, borderRadius: 12, padding: "14px 20px", marginBottom: 12 }}>
                  <p style={{ fontSize: 15, color: C.dark, margin: 0, fontFamily: F.sans, fontWeight: 500 }}>🔑 My bank password is: <strong>Tr0ub4dor</strong></p>
                </div>
                <p style={{ fontSize: 12, color: C.muted2, margin: 0, fontFamily: F.sans }}>Reading... secret will be destroyed</p>
              </div>

              {/* Burned state */}
              <div className="demo-burn" style={{ position: "absolute", textAlign: "center", width: "100%" }}>
                <div className="demo-flame" style={{ fontSize: 48, marginBottom: 8 }}>🔥</div>
                <p style={{ fontSize: 15, fontWeight: 700, color: "#dc2626", margin: "0 0 4px", fontFamily: F.sans }}>Secret permanently destroyed.</p>
                <p style={{ fontSize: 12, color: C.muted2, margin: 0, fontFamily: F.sans }}>It cannot be recovered or accessed again.</p>
              </div>
            </div>
          </div>

          {/* Trust pills */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center" }}>
            {["🔒 AES-256-GCM", "👁 Zero-knowledge", "🔥 Burn-after-read", "⚡ No accounts ever", "🌍 15 languages"].map((t) => (
              <span key={t} style={{ padding: "6px 14px", borderRadius: 999, background: C.white, border: `1px solid ${C.border}`, fontSize: 12, color: C.mid, fontFamily: F.sans, boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>{t}</span>
            ))}
          </div>

          <p style={{ fontSize: 14, color: C.muted2, fontStyle: "italic", marginTop: 24, fontFamily: F.sans }}>
            "Not everything should stay forever."
          </p>
        </div>
      </section>

      {/* ── Comparison bar ── */}
      <div style={{ background: C.dark, padding: "16px 24px", fontFamily: F.sans }}>
        <div style={{ maxWidth: 700, margin: "0 auto", display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "center", gap: 24, fontSize: 14 }}>
          <span style={{ color: "#6b7280" }}>✕ WhatsApp stores your chats forever</span>
          <span style={{ color: C.muted3 }}>vs</span>
          <span style={{ color: C.emerald, fontWeight: 700 }}>✓ NoTrace — messages vanish after reading</span>
        </div>
      </div>

      {/* ── How it works ── */}
      <section id="how" style={s.section(C.white)}>
        <div style={s.container()}>
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <p style={s.label()}>How it works</p>
            <h2 style={s.h2()}>Three steps. Total privacy.</h2>
            <p style={{ ...s.body(), maxWidth: 440, margin: "0 auto" }}>No technical knowledge needed. If you can send a WhatsApp message, you can use NoTrace.</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 20 }}>
            {[
              { emoji: "✍️", step: "01", title: "Write your secret", desc: "Type your message — password, API key, personal note. Your browser encrypts it instantly before sending." },
              { emoji: "🔗", step: "02", title: "Share the link", desc: "Copy your secure link and send it via WhatsApp, Telegram, email — anywhere you like." },
              { emoji: "💥", step: "03", title: "They read. It burns.", desc: "The recipient opens it once. Then it's gone forever. No recovery, no second read, no trace." },
            ].map((s2, i) => (
              <div key={i} style={{ background: "#f9fafb", border: `1px solid ${C.border2}`, borderRadius: 20, padding: 32, textAlign: "center" }}>
                <div style={{ width: 56, height: 56, borderRadius: 16, background: C.emerald, fontSize: 24, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>{s2.emoji}</div>
                <div style={{ fontSize: 11, fontWeight: 700, color: C.emerald, letterSpacing: "0.12em", textTransform: "uppercase", fontFamily: F.mono, marginBottom: 8 }}>STEP {s2.step}</div>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: C.dark, margin: "0 0 10px", fontFamily: F.sans }}>{s2.title}</h3>
                <p style={{ fontSize: 14, color: C.muted, lineHeight: 1.65, margin: 0, fontFamily: F.sans }}>{s2.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" style={s.section(C.bg)}>
        <div style={s.container()}>
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <p style={s.label()}>Features</p>
            <h2 style={s.h2()}>Everything you need.<br />Nothing you don't.</h2>
          </div>

          {/* Top 3 — hero features */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16, marginBottom: 16 }}>
            {[
              { e: "🔥", t: "Burn After Read", d: "The secret is permanently destroyed after the first view. No recovery. No second read. No trace. Ever.", big: true },
              { e: "🔐", t: "AES-256 Zero-Knowledge", d: "Encrypted in your browser before sending. We literally cannot read your messages — even if we wanted to.", big: true },
              { e: "⚡", t: "No Login. No Tracking.", d: "Zero accounts, zero sign-ups, zero data collected. Send to anyone with just a link. Completely anonymous.", big: true },
            ].map((f, i) => (
              <div key={i} style={{ background: C.white, border: `2px solid ${C.emeraldBorder}`, borderRadius: 20, padding: 28, cursor: "default", boxShadow: "0 4px 20px rgba(16,185,129,0.08)" }}>
                <div style={{ fontSize: 36, marginBottom: 14 }}>{f.e}</div>
                <p style={{ fontSize: 16, fontWeight: 800, color: C.dark, margin: "0 0 8px", fontFamily: F.sans }}>{f.t}</p>
                <p style={{ fontSize: 14, color: C.muted, lineHeight: 1.65, margin: 0, fontFamily: F.sans }}>{f.d}</p>
              </div>
            ))}
          </div>

          {/* Secondary features */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12 }}>
            {[
              { e: "⏰", t: "Scheduled Secrets", d: "Set a reveal date for timed announcements." },
              { e: "💬", t: "Secure Reply", d: "Recipient can reply once — also burn-after-read." },
              { e: "📁", t: "Collections", d: "Organise and track secrets by project or team." },
              { e: "🌍", t: "15 Languages", d: "Hindi, Arabic, Spanish, Japanese and more." },
              { e: "📱", t: "Install as App", d: "PWA — works on mobile, offline too." },
            ].map((f, i) => (
              <div key={i} style={{ ...s.card(), display: "flex", gap: 12, alignItems: "flex-start", padding: 16 }}>
                <span style={{ fontSize: 22, flexShrink: 0 }}>{f.e}</span>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 700, color: C.dark, margin: "0 0 3px", fontFamily: F.sans }}>{f.t}</p>
                  <p style={{ fontSize: 12, color: C.muted, lineHeight: 1.5, margin: 0, fontFamily: F.sans }}>{f.d}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Security ── */}
      <section id="security" style={{ ...s.section(C.dark), color: C.white }}>
        <div style={s.container()}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 60, alignItems: "center" }}>

            <div>
              <p style={{ ...s.label(), color: "#34d399" }}>Security</p>
              <h2 style={s.h2(true)}>We designed it so we <span style={{ color: "#34d399" }}>can't</span> betray your trust.</h2>
              <p style={{ ...s.body(true), marginBottom: 32 }}>Most "secure" tools store your messages in plaintext and promise not to look. NoTrace is architectured differently — the encryption key never leaves your browser. Ever.</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {[
                  { e: "🔐", t: "Browser-side AES-256-GCM encryption", d: "Encryption happens locally before anything is transmitted." },
                  { e: "🕵️", t: "Key never touches our server", d: "Lives in URL #fragment — browsers never send this in HTTP requests." },
                  { e: "🛡️", t: "Rate limiting + brute force detection", d: "Auto Telegram alerts. 5 password attempts max per secret." },
                  { e: "📋", t: "Full security headers", d: "HSTS, CSP, X-Frame-Options, Referrer-Policy on every request." },
                ].map((item, i) => (
                  <div key={i} style={{ display: "flex", gap: 14, padding: "14px 16px", background: "rgba(255,255,255,0.05)", borderRadius: 12, border: "1px solid rgba(255,255,255,0.08)" }}>
                    <span style={{ fontSize: 20, flexShrink: 0, marginTop: 2 }}>{item.e}</span>
                    <div>
                      <p style={{ fontSize: 13, fontWeight: 600, color: C.white, margin: "0 0 3px", fontFamily: F.sans }}>{item.t}</p>
                      <p style={{ fontSize: 12, color: "#6b7280", margin: 0, fontFamily: F.sans }}>{item.d}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Code terminal */}
            <div style={{ background: "#111827", borderRadius: 20, overflow: "hidden", border: "1px solid rgba(255,255,255,0.1)", boxShadow: "0 20px 60px rgba(0,0,0,0.4)" }}>
              <div style={{ background: "#1f2937", padding: "12px 16px", display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ width: 12, height: 12, borderRadius: "50%", background: "#ef4444", opacity: 0.7 }} />
                <span style={{ width: 12, height: 12, borderRadius: "50%", background: "#f59e0b", opacity: 0.7 }} />
                <span style={{ width: 12, height: 12, borderRadius: "50%", background: "#10b981", opacity: 0.7 }} />
                <span style={{ fontSize: 12, color: "#4b5563", marginLeft: 8, fontFamily: F.mono }}>notrace — encryption flow</span>
              </div>
              <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 20 }}>
                {[
                  { label: "// your message", value: "Meet at 9pm tomorrow", color: "#f3f4f6" },
                  { label: "// encrypted in browser", value: "7f3a9b2c8d1e4f6a49c2...", color: "#34d399" },
                  { label: "// what server stores", value: "7f3a9b2c8d1e4f6a49c2...", color: "#4b5563" },
                  { label: "// server can decrypt?", value: "✗  IMPOSSIBLE — key not here", color: "#f87171", bg: "rgba(239,68,68,0.1)", br: "8px" },
                  { label: "// key location", value: "URL fragment (#) — browser only", color: "#fbbf24" },
                ].map((row, i) => (
                  <div key={i} style={{ paddingBottom: i < 4 ? 20 : 0, borderBottom: i < 4 ? "1px solid rgba(255,255,255,0.06)" : "none" }}>
                    <p style={{ fontSize: 11, color: "#374151", margin: "0 0 4px", fontFamily: F.mono }}>{row.label}</p>
                    <p style={{ fontSize: 13, fontWeight: 500, color: row.color, margin: 0, fontFamily: F.mono, background: (row as any).bg, borderRadius: (row as any).br, padding: (row as any).bg ? "4px 8px" : 0, display: "inline-block" }}>{row.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Use cases ── */}
      <section style={s.section(C.white)}>
        <div style={{ ...s.container(), textAlign: "center" }}>
          <p style={s.label()}>Who uses NoTrace</p>
          <h2 style={{ ...s.h2(), marginBottom: 48 }}>Built for anyone who values privacy.</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16 }}>
            {[
              { e: "💻", t: "Developers", d: "Share API keys, tokens, and credentials without email trails." },
              { e: "🏢", t: "Teams", d: "Send passwords and sensitive docs that self-destruct after reading." },
              { e: "📰", t: "Journalists", d: "Communicate with sources safely. No chat history, no risk." },
              { e: "👤", t: "Everyone", d: "Send anything private — to anyone, anywhere, no app needed." },
            ].map((item, i) => (
              <div key={i} style={{ padding: 28, borderRadius: 20, background: C.bg, border: `1px solid ${C.border2}`, textAlign: "center" }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>{item.e}</div>
                <p style={{ fontSize: 15, fontWeight: 700, color: C.dark, margin: "0 0 8px", fontFamily: F.sans }}>{item.t}</p>
                <p style={{ fontSize: 13, color: C.muted, lineHeight: 1.6, margin: 0, fontFamily: F.sans }}>{item.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section id="faq" style={s.section(C.bg)}>
        <div style={{ maxWidth: 680, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <p style={s.label()}>FAQ</p>
            <h2 style={s.h2()}>Questions answered.</h2>
          </div>
          <div style={{ background: C.white, borderRadius: 20, border: `1px solid ${C.border}`, padding: "0 28px", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
            {[
              { q: "Can NoTrace read my secrets?", a: "No. Your message is encrypted in your browser before it's sent. The decryption key lives only in the URL fragment — a part of the URL that browsers never transmit to servers. We store only unreadable ciphertext." },
              { q: "What happens after someone reads my secret?", a: "The secret is immediately marked as read and permanently deleted from our database. It cannot be recovered, re-opened, or accessed again by anyone — including us." },
              { q: "Do I need an account?", a: "No. NoTrace requires zero accounts, zero sign-ups, and zero personal information. Completely anonymous by design." },
              { q: "What if the link expires before the recipient opens it?", a: "The secret is automatically deleted when it expires. You can choose 5 minutes, 1 hour, 24 hours, or no expiry when creating the link." },
              { q: "Is NoTrace free?", a: "Yes. NoTrace is completely free with no limits, no ads, and no premium tier." },
              { q: "How is this different from WhatsApp or Signal?", a: "WhatsApp and Signal require both parties to have accounts. NoTrace works with just a link — send to anyone, anywhere, no app required. And unlike WhatsApp, your messages truly disappear from our servers." },
            ].map((faq, i) => <FAQItem key={i} q={faq.q} a={faq.a} />)}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ padding: "80px 24px", background: C.emerald, textAlign: "center", position: "relative", overflow: "hidden", fontFamily: F.sans }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(circle at 20% 50%, rgba(255,255,255,0.08) 1px, transparent 1px), radial-gradient(circle at 80% 50%, rgba(255,255,255,0.08) 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
        <div style={{ position: "relative", zIndex: 1, maxWidth: 560, margin: "0 auto" }}>
          <h2 style={{ fontSize: "clamp(28px, 4vw, 42px)", fontWeight: 900, color: C.white, margin: "0 0 12px", fontFamily: F.sans }}>Send your first self-destructing message.</h2>
          <p style={{ fontSize: 16, color: "rgba(255,255,255,0.75)", margin: "0 0 8px", fontFamily: F.sans }}>Even we can't read it. It burns after they do.</p>
          <p style={{ fontSize: 14, color: "rgba(255,255,255,0.5)", margin: "0 0 32px", fontFamily: F.sans }}>No sign-up. No credit card. No trace.</p>
          <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: 10, padding: "16px 32px", borderRadius: 16, background: C.white, color: C.emeraldDark, fontWeight: 800, fontSize: 16, textDecoration: "none", boxShadow: "0 8px 32px rgba(0,0,0,0.15)", fontFamily: F.sans }}>
            🔐 Create Secure Message — It's Free →
          </Link>
          <p style={{ fontSize: 14, color: "rgba(255,255,255,0.6)", fontStyle: "italic", marginTop: 20, fontFamily: F.sans }}>"Not everything should stay forever."</p>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer style={{ background: "#111827", padding: "48px 24px 32px", fontFamily: F.sans }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 40, marginBottom: 40 }}>

            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                <div style={{ width: 30, height: 30, borderRadius: 8, background: C.emerald, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>🔐</div>
                <span style={{ fontWeight: 800, fontSize: 15, color: C.white, fontFamily: F.sans }}>No<span style={{ color: "#34d399" }}>Trace</span></span>
              </div>
              <p style={{ fontSize: 13, color: "#6b7280", lineHeight: 1.7, margin: "0 0 16px", fontFamily: F.sans }}>Send secrets that self-destruct.<br />No accounts. No logs. No trace.</p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {["AES-256-GCM", "Zero-Knowledge", "Burn-after-read"].map((t) => (
                  <span key={t} style={{ padding: "4px 10px", borderRadius: 6, background: "#1f2937", fontSize: 11, color: "#4b5563", border: "1px solid #374151", fontFamily: F.sans }}>{t}</span>
                ))}
              </div>
            </div>

            <div>
              <p style={{ fontSize: 11, fontWeight: 700, color: "#4b5563", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 16, fontFamily: F.sans }}>Product</p>
              {[["Create Secret", "/"], ["My Collections", "/collections"], ["Admin Dashboard", "/admin"]].map(([label, href]) => (
                <div key={label} style={{ marginBottom: 10 }}>
                  <Link href={href} style={{ fontSize: 14, color: "#6b7280", textDecoration: "none", fontFamily: F.sans }}>{label}</Link>
                </div>
              ))}
            </div>

            <div>
              <p style={{ fontSize: 11, fontWeight: 700, color: "#4b5563", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 16, fontFamily: F.sans }}>Company</p>
              <div style={{ fontSize: 13, color: "#6b7280", lineHeight: 1.8, fontFamily: F.sans }}>
                <p style={{ fontSize: 14, fontWeight: 700, color: "#9ca3af", margin: "0 0 4px", fontFamily: F.sans }}>Engage Ad</p>
                <p style={{ margin: "0 0 2px" }}>MSME Registered · Est. 2016</p>
                <p style={{ margin: "0 0 2px" }}>GST Registered · Since 2024</p>
                <p style={{ margin: "0 0 2px" }}>GST: 09GVRPK4451F2Z3</p>
                <p style={{ margin: "0 0 12px" }}>Lucknow, Uttar Pradesh, India</p>
                <a href="mailto:azadraj@engagead.in" style={{ color: "#34d399", textDecoration: "none", fontFamily: F.sans }}>📧 azadraj@engagead.in</a>
                <p style={{ margin: "4px 0 0", fontSize: 12, color: "#4b5563" }}>CTO — Queries & partnerships</p>
              </div>
            </div>

          </div>

          <div style={{ borderTop: "1px solid #1f2937", paddingTop: 24, display: "flex", flexWrap: "wrap", justifyContent: "space-between", gap: 12, fontSize: 12, color: "#4b5563", fontFamily: F.sans }}>
            <p style={{ margin: 0 }}>© {new Date().getFullYear()} Engage Ad. All rights reserved. NoTrace is a product of Engage Ad.</p>
            <p style={{ margin: 0 }}>No logs · No tracking · No accounts · Privacy first</p>
          </div>
        </div>
      </footer>

    </div>
  );
}
