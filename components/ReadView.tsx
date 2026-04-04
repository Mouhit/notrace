"use client";
import { useEffect, useState } from "react";
import { AlertTriangle, Copy, Flame, Lock, Loader2, Shield } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { useLang } from "@/lib/language";
import CountdownRing from "./CountdownRing";
import SecureReply from "./SecureReply";
import { importEncryptionKey, decryptSecret, extractKeyFromUrl } from "@/lib/crypto";

// ── Live ticking scheduled countdown ──────────────────────────────────────
function ScheduledCountdown({
  scheduledAt,
  secretTitle,
  onUnlocked,
}: {
  scheduledAt: string;
  secretTitle: string | null;
  onUnlocked: () => void;
}) {
  const unlockDate = new Date(scheduledAt);

  const getRemaining = () => {
    const diff = unlockDate.getTime() - Date.now();
    if (diff <= 0) return null;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hrs  = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const secs = Math.floor((diff % (1000 * 60)) / 1000);
    return { days, hrs, mins, secs, totalMs: diff };
  };

  const [remaining, setRemaining] = useState(getRemaining());

  useEffect(() => {
    const interval = setInterval(() => {
      const r = getRemaining();
      setRemaining(r);
      if (!r) {
        clearInterval(interval);
        onUnlocked(); // auto-refresh when timer hits 0
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [scheduledAt]);

  const pad = (n: number) => String(n).padStart(2, "0");

  return (
    <div className="animate-fade-up max-w-md mx-auto">
      <div className="rounded-2xl border border-surface-border bg-surface-card p-8 space-y-6 text-center">
        <div className="flex justify-center">
          <div className="w-16 h-16 rounded-2xl border border-brand-border bg-brand-muted flex items-center justify-center text-3xl">
            🔒
          </div>
        </div>

        {secretTitle && (
          <p className="text-base font-semibold text-white">"{secretTitle}"</p>
        )}

        <div>
          <p className="text-sm text-slate-400 mb-4">This secret unlocks in</p>

          {remaining ? (
            <>
              {/* Live countdown display */}
              <div className="flex items-center justify-center gap-2">
                {remaining.days > 0 && (
                  <div className="flex flex-col items-center">
                    <span className="text-4xl font-black text-brand tabular-nums">{remaining.days}</span>
                    <span className="text-xs text-slate-500 uppercase tracking-widest mt-1">days</span>
                  </div>
                )}
                {remaining.days > 0 && <span className="text-2xl text-slate-600 font-bold mb-4">:</span>}

                <div className="flex flex-col items-center">
                  <span className="text-4xl font-black text-brand tabular-nums">{pad(remaining.hrs)}</span>
                  <span className="text-xs text-slate-500 uppercase tracking-widest mt-1">hrs</span>
                </div>
                <span className="text-2xl text-slate-600 font-bold mb-4">:</span>

                <div className="flex flex-col items-center">
                  <span className="text-4xl font-black text-brand tabular-nums">{pad(remaining.mins)}</span>
                  <span className="text-xs text-slate-500 uppercase tracking-widest mt-1">min</span>
                </div>
                <span className="text-2xl text-slate-600 font-bold mb-4">:</span>

                <div className="flex flex-col items-center">
                  <span className="text-4xl font-black text-brand tabular-nums">{pad(remaining.secs)}</span>
                  <span className="text-xs text-slate-500 uppercase tracking-widest mt-1">sec</span>
                </div>
              </div>

              {/* Unlock date */}
              <p className="text-xs text-slate-500 mt-4">
                Unlocks on{" "}
                <span className="text-slate-300">
                  {unlockDate.toLocaleString(undefined, {
                    month: "long", day: "numeric", year: "numeric",
                    hour: "2-digit", minute: "2-digit",
                  })}
                </span>
              </p>
            </>
          ) : (
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="w-6 h-6 animate-spin text-brand" />
              <p className="text-sm text-brand">Unlocking now...</p>
            </div>
          )}
        </div>

        <p className="text-xs text-slate-600">
          Come back when the timer reaches zero — the secret will unlock automatically.
        </p>
      </div>
    </div>
  );
}

type Phase = "loading" | "notFound" | "alreadyRead" | "passwordEntry" | "confirm" | "revealing" | "revealed" | "destroyed" | "error" | "scheduled";

export default function ReadView({ id }: { id: string }) {
  const { t } = useLang();
  const [phase, setPhase] = useState<Phase>("loading");
  const [secretTitle, setSecretTitle] = useState<string | null>(null);
  const [passwordInput, setPasswordInput] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [revealedTitle, setRevealedTitle] = useState<string | null>(null);
  const [revealedContent, setRevealedContent] = useState("");
  const [countdown, setCountdown] = useState(0);
  const [countdownTotal, setCountdownTotal] = useState(0);
  const [destroyed, setDestroyed] = useState(false);
  const [scheduledAt, setScheduledAt] = useState<string | null>(null);
  const [allowReply, setAllowReply] = useState(false);
  const [originalId, setOriginalId] = useState<string | null>(null);
  const [replyActive, setReplyActive] = useState(false);

  // Peek on mount
  useEffect(() => {
    async function peek() {
      try {
        const res = await fetch(`/api/read?id=${id}`);
        const data = await res.json();
        if (!data.exists) { setPhase(data.already_read ? "alreadyRead" : "notFound"); return; }
        if (data.scheduled) { setScheduledAt(data.scheduled_at); setSecretTitle(data.title); setPhase("scheduled"); return; }
        setSecretTitle(data.title);
        setPhase(data.has_password ? "passwordEntry" : "confirm");
      } catch { setPhase("error"); }
    }
    peek();
  }, [id]);

  // Countdown timer — pauses when reply is active
  useEffect(() => {
    if (phase !== "revealed" || destroyed) return;

    if (countdown <= 0) {
      // Destroy immediately when timer hits 0
      // Only wait if reply box is actively open
      if (replyActive) {
        const timer = setTimeout(() => setCountdown((c) => c), 5000);
        return () => clearTimeout(timer);
      }
      setDestroyed(true);
      setPhase("destroyed");
      return;
    }

    // Pause countdown only if reply box is open
    const timer = setTimeout(() => {
      if (!replyActive) setCountdown((c) => c - 1);
    }, 1000);
    return () => clearTimeout(timer);
  }, [phase, countdown, destroyed, replyActive]);

  const handleReveal = async (pw?: string) => {
    setPhase("revealing");
    try {
      const res = await fetch("/api/read", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, password: pw }),
      });
      const data = await res.json();
      if (res.status === 403) { setPasswordError(t("read", "wrongPassword")); setPhase("passwordEntry"); return; }
      if (res.status === 410) { setPhase("alreadyRead"); return; }
      if (!res.ok) { setPhase("error"); return; }

      // Zero-knowledge decryption — key is in URL fragment, never sent to server
      let finalContent = data.content;
      let finalTitle = data.title;
      const keyString = extractKeyFromUrl();
      if (keyString) {
        try {
          const cryptoKey = await importEncryptionKey(keyString);
          finalContent = await decryptSecret(data.content, cryptoKey);
          if (data.title && data.title.length > 20) {
            try { finalTitle = await decryptSecret(data.title, cryptoKey); } catch { /* title not encrypted */ }
          }
        } catch {
          console.warn("Decryption failed — showing raw content");
        }
      }

      setRevealedTitle(finalTitle);
      setRevealedContent(finalContent);
      setAllowReply(data.allow_reply || false);
      setOriginalId(id);
      const secs = Math.max(7, Math.min(120, Math.ceil(finalContent.length / 8)));
      setCountdownTotal(secs);
      setCountdown(secs);
      setPhase("revealed");
    } catch { setPhase("error"); }
  };

  const handlePasswordSubmit = () => {
    if (!passwordInput.trim()) return;
    setPasswordError("");
    handleReveal(passwordInput);
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(revealedContent);
    toast.success(t("read", "secretCopied"));
  };

  if (phase === "loading") return (
    <div className="flex flex-col items-center gap-4 py-24 text-slate-500">
      <Loader2 className="w-6 h-6 animate-spin text-brand" />
      <p className="text-xs">{t("read", "verifying")}</p>
    </div>
  );

  if (phase === "notFound") return (
    <div className="flex flex-col items-center gap-5 py-20 text-center">
      <div className="w-14 h-14 rounded-2xl border border-surface-border bg-surface-card flex items-center justify-center">
        <AlertTriangle className="w-6 h-6 text-slate-600" />
      </div>
      <div>
        <p className="text-base font-semibold text-white">{t("read", "invalidTitle")}</p>
        <p className="text-sm text-slate-500 mt-1">{t("read", "invalidSubtitle")}</p>
      </div>
      <Link href="/" className="px-4 py-2 rounded-lg border border-surface-border text-xs text-slate-400 hover:border-slate-600 hover:text-slate-200 transition-all">
        {t("read", "createNewLink")}
      </Link>
    </div>
  );

  if (phase === "alreadyRead") return (
    <div className="flex flex-col items-center gap-5 py-20 text-center">
      <div className="w-14 h-14 rounded-2xl border border-red-900/40 bg-red-950/20 flex items-center justify-center">
        <Flame className="w-6 h-6 text-red-400/60" />
      </div>
      <div>
        <p className="text-base font-semibold text-white">{t("read", "alreadyReadTitle")}</p>
        <p className="text-sm text-slate-500 mt-1">{t("read", "alreadyReadSubtitle")}</p>
      </div>
      <Link href="/" className="px-4 py-2 rounded-lg border border-surface-border text-xs text-slate-400 hover:border-slate-600 hover:text-slate-200 transition-all">
        {t("read", "createNewLink")}
      </Link>
    </div>
  );

  if (phase === "scheduled" && scheduledAt) {
    return <ScheduledCountdown
      scheduledAt={scheduledAt}
      secretTitle={secretTitle}
      onUnlocked={() => {
        // Auto-refresh peek when timer hits zero
        setPhase("loading");
        setScheduledAt(null);
      }}
    />;
  }

  if (phase === "error") return (
    <div className="flex flex-col items-center gap-5 py-20 text-center">
      <AlertTriangle className="w-8 h-8 text-red-400/60" />
      <div>
        <p className="text-base font-semibold text-white">{t("read", "errorTitle")}</p>
        <p className="text-sm text-slate-500 mt-1">{t("read", "errorSubtitle")}</p>
      </div>
    </div>
  );

  if (phase === "passwordEntry") return (
    <div className="animate-fade-up max-w-md mx-auto">
      <div className="rounded-2xl border border-surface-border bg-surface-card p-6 space-y-5">
        <div className="flex items-center gap-2.5 text-slate-400">
          <Lock className="w-4 h-4" />
          <span className="text-sm font-medium">{t("read", "passwordProtected")}</span>
        </div>
        {secretTitle && <p className="text-base font-semibold text-white">"{secretTitle}"</p>}
        <p className="text-sm text-slate-500">{t("read", "enterPassword")}</p>
        <input
          type="password"
          placeholder={t("read", "passwordPlaceholder")}
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
          <Lock className="w-4 h-4" /> {t("read", "unlock")}
        </button>
      </div>
    </div>
  );

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
          <p className="text-sm font-medium text-white">{t("read", "selfDestruct")}</p>
          <p className="text-xs text-slate-500 mt-2">{t("read", "selfDestructNote")}</p>
        </div>
        <button
          onClick={() => handleReveal()}
          className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-brand text-surface font-bold text-sm hover:bg-brand-dim transition-all glow-brand"
        >
          <Shield className="w-4 h-4" /> {t("read", "reveal")}
        </button>
      </div>
    </div>
  );

  if (phase === "revealing") return (
    <div className="flex flex-col items-center gap-4 py-24 text-slate-500">
      <Loader2 className="w-6 h-6 animate-spin text-brand" />
      <p className="text-xs">{t("read", "retrieving")}</p>
    </div>
  );

  if (phase === "revealed") return (
    <div className="animate-fade-up max-w-md mx-auto space-y-4">
      <div className="rounded-2xl border border-surface-border bg-surface-card overflow-hidden">
        <div className="px-5 pt-5 pb-3 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Shield className="w-3.5 h-3.5 text-brand" />
            <span>{t("read", "secretMessage")}</span>
          </div>
          <CountdownRing seconds={countdown} total={countdownTotal} size={52} />
        </div>
        <div className="px-5 pb-5 space-y-4">
          {revealedTitle && <p className="text-sm font-semibold text-white">{revealedTitle}</p>}
          <p className="text-sm text-slate-200 leading-relaxed whitespace-pre-wrap">{revealedContent}</p>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-surface-border text-xs text-slate-400 hover:border-slate-600 hover:text-slate-200 transition-all"
          >
            <Copy className="w-3.5 h-3.5" /> {t("read", "copySecret")}
          </button>
          <p className="text-xs text-slate-600">{t("read", "destroyNote")}</p>
        </div>
      </div>
      {allowReply && originalId && (
        <SecureReply
          originalId={originalId}
          onActiveChange={(active) => {
            setReplyActive(active);
          }}
        />
      )}
    </div>
  );

  if (phase === "destroyed") return (
    <div className="animate-fade-up flex flex-col items-center gap-5 py-20 text-center">
      <div className="w-14 h-14 rounded-2xl border border-red-900/30 bg-red-950/20 flex items-center justify-center">
        <Flame className="w-6 h-6 text-red-400/70" />
      </div>
      <div>
        <p className="text-base font-semibold text-white">{t("read", "destroyedTitle")}</p>
        <p className="text-sm text-slate-500 mt-1">{t("read", "destroyedSubtitle")}</p>
      </div>
      <Link href="/" className="flex items-center gap-2 px-4 py-2 rounded-lg border border-surface-border text-xs text-slate-400 hover:border-slate-600 hover:text-slate-200 transition-all">
        {t("read", "createNew")}
      </Link>
    </div>
  );

  return null;
}
