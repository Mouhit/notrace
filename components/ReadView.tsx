"use client";
import { useEffect, useState } from "react";
import { AlertTriangle, Copy, Flame, Lock, Loader2, Shield, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

type Phase = "loading" | "notFound" | "alreadyRead" | "passwordEntry" | "confirm" | "revealing" | "revealed" | "destroyed" | "error";

export default function ReadView({ id }: { id: string }) {
  const [phase, setPhase] = useState<Phase>("loading");
  const [hasPassword, setHasPassword] = useState(false);
  const [secretTitle, setSecretTitle] = useState<string | null>(null);
  const [passwordInput, setPasswordInput] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [revealedTitle, setRevealedTitle] = useState<string | null>(null);
  const [revealedContent, setRevealedContent] = useState("");
  const [countdown, setCountdown] = useState(0);
  const [countdownTotal, setCountdownTotal] = useState(0);
  const [destroyed, setDestroyed] = useState(false);

  // Peek on mount
  useEffect(() => {
    async function peek() {
      try {
        const res = await fetch(`/api/read?id=${id}`);
        const data = await res.json();
        if (!data.exists) {
          setPhase(data.already_read ? "alreadyRead" : "notFound");
          return;
        }
        setHasPassword(data.has_password);
        setSecretTitle(data.title);
        setPhase(data.has_password ? "passwordEntry" : "confirm");
      } catch {
        setPhase("error");
      }
    }
    peek();
  }, [id]);

  // Countdown after reveal
  useEffect(() => {
    if (phase !== "revealed" || destroyed) return;
    if (countdown <= 0) {
      setDestroyed(true);
      setPhase("destroyed");
      return;
    }
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [phase, countdown, destroyed]);

  const handleReveal = async (pw?: string) => {
    setPhase("revealing");
    try {
      const res = await fetch("/api/read", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, password: pw }),
      });
      const data = await res.json();
      if (res.status === 403) { setPasswordError("Incorrect password."); setPhase("passwordEntry"); return; }
      if (res.status === 410) { setPhase("alreadyRead"); return; }
      if (!res.ok) { setPhase("error"); return; }
      setRevealedTitle(data.title);
      setRevealedContent(data.content);
      const secs = Math.max(7, Math.min(120, Math.ceil(data.content.length / 8)));
      setCountdownTotal(secs);
      setCountdown(secs);
      setPhase("revealed");
    } catch {
      setPhase("error");
    }
  };

  const handlePasswordSubmit = () => {
    if (!passwordInput.trim()) return;
    setPasswordError("");
    handleReveal(passwordInput);
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(revealedContent);
    toast.success("Secret copied");
  };

  // ── Loading ──
  if (phase === "loading") return (
    <div className="flex flex-col items-center gap-4 py-24 text-slate-500">
      <Loader2 className="w-6 h-6 animate-spin text-brand" />
      <p className="text-xs">Verifying secret...</p>
    </div>
  );

  // ── Not found ──
  if (phase === "notFound") return (
    <div className="flex flex-col items-center gap-5 py-20 text-center">
      <div className="w-14 h-14 rounded-2xl border border-surface-border bg-surface-card flex items-center justify-center">
        <AlertTriangle className="w-6 h-6 text-slate-600" />
      </div>
      <div>
        <p className="text-base font-semibold text-white">Invalid or broken link</p>
        <p className="text-sm text-slate-500 mt-1">This secret doesn't exist or was never created.</p>
      </div>
      <Link href="/" className="px-4 py-2 rounded-lg border border-surface-border text-xs text-slate-400 hover:border-slate-600 hover:text-slate-200 transition-all">
        Create a new secret
      </Link>
    </div>
  );

  // ── Already read ──
  if (phase === "alreadyRead") return (
    <div className="flex flex-col items-center gap-5 py-20 text-center">
      <div className="w-14 h-14 rounded-2xl border border-red-900/40 bg-red-950/20 flex items-center justify-center">
        <Flame className="w-6 h-6 text-red-400/60" />
      </div>
      <div>
        <p className="text-base font-semibold text-white">Already viewed or expired</p>
        <p className="text-sm text-slate-500 mt-1">Secrets can only be read once.</p>
      </div>
      <Link href="/" className="px-4 py-2 rounded-lg border border-surface-border text-xs text-slate-400 hover:border-slate-600 hover:text-slate-200 transition-all">
        Create a new secret
      </Link>
    </div>
  );

  // ── Error ──
  if (phase === "error") return (
    <div className="flex flex-col items-center gap-5 py-20 text-center">
      <AlertTriangle className="w-8 h-8 text-red-400/60" />
      <div>
        <p className="text-base font-semibold text-white">Something went wrong</p>
        <p className="text-sm text-slate-500 mt-1">Unable to load the secret. Please try again.</p>
      </div>
    </div>
  );

  // ── Password entry ──
  if (phase === "passwordEntry") return (
    <div className="animate-fade-up max-w-md mx-auto">
      <div className="rounded-2xl border border-surface-border bg-surface-card p-6 space-y-5">
        <div className="flex items-center gap-2.5 text-slate-400">
          <Lock className="w-4 h-4" />
          <span className="text-sm font-medium">Password protected</span>
        </div>
        {secretTitle && <p className="text-base font-semibold text-white">"{secretTitle}"</p>}
        <p className="text-sm text-slate-500">Enter the password to unlock this secret.</p>
        <input
          type="password"
          placeholder="Enter password"
          value={passwordInput}
          autoFocus
          onChange={(e) => { setPasswordInput(e.target.value); setPasswordError(""); }}
          onKeyDown={(e) => e.key === "Enter" && handlePasswordSubmit()}
          className="w-full px-4 py-3 rounded-xl bg-surface border border-surface-border text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-brand-border focus:ring-1 focus:ring-brand/20 transition-all"
        />
        {passwordError && <p className="text-xs text-red-400">{passwordError}</p>}
        <button
          onClick={handlePasswordSubmit}
          disabled={!passwordInput.trim()}
          className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-brand text-surface font-bold text-sm hover:bg-brand-dim disabled:opacity-40 transition-all"
        >
          <Lock className="w-4 h-4" /> Unlock
        </button>
      </div>
    </div>
  );

  // ── Confirm ──
  if (phase === "confirm") return (
    <div className="animate-fade-up max-w-md mx-auto">
      <div className="rounded-2xl border border-surface-border bg-surface-card p-8 space-y-6 text-center">
        <div className="flex justify-center">
          <div className="w-16 h-16 rounded-2xl border border-brand-border bg-brand-muted flex items-center justify-center">
            <Shield className="w-7 h-7 text-brand" />
          </div>
        </div>
        {secretTitle && <p className="text-base font-semibold text-white">"{secretTitle}"</p>}
        <div>
          <p className="text-sm font-medium text-white">This message will self-destruct after viewing.</p>
          <p className="text-xs text-slate-500 mt-2">Once revealed, the secret is permanently destroyed and cannot be accessed again.</p>
        </div>
        <button
          onClick={() => handleReveal()}
          className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-brand text-surface font-bold text-sm hover:bg-brand-dim transition-all glow-brand"
        >
          <Shield className="w-4 h-4" /> Reveal Secret
        </button>
      </div>
    </div>
  );

  // ── Revealing ──
  if (phase === "revealing") return (
    <div className="flex flex-col items-center gap-4 py-24 text-slate-500">
      <Loader2 className="w-6 h-6 animate-spin text-brand" />
      <p className="text-xs">Retrieving secret...</p>
    </div>
  );

  // ── Revealed ──
  if (phase === "revealed") return (
    <div className="animate-fade-up max-w-md mx-auto space-y-4">
      {/* Progress bar */}
      <div className="h-0.5 bg-surface-card rounded-full overflow-hidden">
        <div
          className="h-full bg-brand rounded-full transition-all"
          style={{ width: `${(countdown / countdownTotal) * 100}%`, transitionDuration: "1s", transitionTimingFunction: "linear" }}
        />
      </div>

      <div className="rounded-2xl border border-surface-border bg-surface-card overflow-hidden">
        <div className="px-5 pt-5 pb-3 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Shield className="w-3.5 h-3.5 text-brand" />
            <span>Secret message</span>
          </div>
          <span className="text-xs text-slate-600 tabular-nums">{countdown}s</span>
        </div>

        <div className="px-5 pb-5 space-y-4">
          {revealedTitle && <p className="text-sm font-semibold text-white">{revealedTitle}</p>}
          <p className="text-sm text-slate-200 leading-relaxed whitespace-pre-wrap">{revealedContent}</p>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-surface-border text-xs text-slate-400 hover:border-slate-600 hover:text-slate-200 transition-all"
          >
            <Copy className="w-3.5 h-3.5" /> Copy Secret
          </button>
          <p className="text-xs text-slate-600">This secret will be permanently destroyed after the timer ends.</p>
        </div>
      </div>
    </div>
  );

  // ── Destroyed ──
  if (phase === "destroyed") return (
    <div className="animate-fade-up flex flex-col items-center gap-5 py-20 text-center">
      <div className="w-14 h-14 rounded-2xl border border-red-900/30 bg-red-950/20 flex items-center justify-center">
        <Flame className="w-6 h-6 text-red-400/70" />
      </div>
      <div>
        <p className="text-base font-semibold text-white">Secret permanently destroyed.</p>
        <p className="text-sm text-slate-500 mt-1">It cannot be recovered or accessed again.</p>
      </div>
      <Link href="/" className="flex items-center gap-2 px-4 py-2 rounded-lg border border-surface-border text-xs text-slate-400 hover:border-slate-600 hover:text-slate-200 transition-all">
        Create New Secret
      </Link>
    </div>
  );

  return null;
}
