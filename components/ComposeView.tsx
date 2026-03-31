"use client";
import { useState, useCallback, useEffect, useRef } from "react";
import { Shield, Eye, Loader2, Copy, Share2, CheckCircle2, ArrowLeft, MessageCircle, Send } from "lucide-react";
import { toast } from "sonner";
import { Expiry } from "@/types";
import { expiryToSeconds, formatCountdown } from "@/lib/utils";
import { useLang } from "@/lib/language";
import Confetti from "./Confetti";
import QRCodeDisplay from "./QRCodeDisplay";
import SecretTemplates from "./SecretTemplates";
import DateTimePicker from "./DateTimePicker";
import { useOwnerId } from "@/lib/useOwnerId";
import { generateEncryptionKey, encryptSecret, buildShareUrl } from "@/lib/crypto";

const MAX_CHARS = 5000;

interface ResultData {
  id: string;
  url: string;
  expiry: Expiry;
  title: string | null;
}

function useCountdown(totalSeconds: number | null) {
  const [remaining, setRemaining] = useState<number | null>(totalSeconds);
  useEffect(() => {
    if (totalSeconds === null) { setRemaining(null); return; }
    setRemaining(totalSeconds);
    const interval = setInterval(() => {
      setRemaining((prev) => {
        if (prev === null || prev <= 0) { clearInterval(interval); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [totalSeconds]);
  return remaining;
}

function ResultPanel({ result, onCreateNew }: { result: ResultData; onCreateNew: () => void }) {
  const { t } = useLang();
  const [copied, setCopied] = useState(false);
  const [showConfetti, setShowConfetti] = useState(true);
  const expiryTotal = expiryToSeconds(result.expiry);
  const remaining = useCountdown(expiryTotal);
  const canShare = typeof navigator !== "undefined" && "share" in navigator;

  useEffect(() => {
    const timer = setTimeout(() => setShowConfetti(false), 4000);
    return () => clearTimeout(timer);
  }, []);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(result.url);
    setCopied(true);
    toast.success(t("compose", "copyLink"));
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    if (canShare) {
      await navigator.share({ url: result.url, title: "Secure secret link" });
    } else {
      await handleCopy();
    }
  };

  const handleWhatsApp = () => {
    const text = encodeURIComponent(`🔐 I sent you a secret on NoTrace — it self-destructs after reading:\n\n${result.url}`);
    window.open(`https://wa.me/?text=${text}`, "_blank");
  };

  const handleTelegram = () => {
    const text = encodeURIComponent(`🔐 Secret message for you (self-destructs after reading):\n${result.url}`);
    window.open(`https://t.me/share/url?url=${encodeURIComponent(result.url)}&text=${text}`, "_blank");
  };

  return (
    <>
      <Confetti active={showConfetti} />
      <div className="animate-fade-up w-full space-y-5">
        <div className="flex items-center gap-2 text-brand flex-wrap">
          <CheckCircle2 className="w-4 h-4" />
          <span className="text-sm font-semibold">{t("compose", "successBadge")}</span>
          <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-brand-muted border border-brand-border text-xs text-brand">
            🔐 E2E Encrypted
          </span>
        </div>

        <div className="rounded-xl border border-surface-border bg-surface-card p-5 space-y-4">
          {result.title && (
            <p className="text-xs text-slate-500 uppercase tracking-widest">"{result.title}"</p>
          )}
          <div className="flex items-center gap-3 bg-surface rounded-lg px-4 py-3 border border-surface-border">
            <p className="flex-1 text-xs text-slate-300 break-all leading-relaxed">{result.url}</p>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap gap-2">
            <button onClick={handleCopy} className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-surface-border text-xs text-slate-300 hover:border-brand-border hover:text-brand transition-all duration-150">
              {copied ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? t("compose", "copied") : t("compose", "copyLink")}
            </button>

            <button onClick={handleWhatsApp} className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-green-800/40 bg-green-950/20 text-xs text-green-400 hover:border-green-600/60 hover:bg-green-950/40 transition-all duration-150">
              <MessageCircle className="w-3.5 h-3.5" />
              {t("compose", "whatsapp")}
            </button>

            <button onClick={handleTelegram} className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-blue-800/40 bg-blue-950/20 text-xs text-blue-400 hover:border-blue-600/60 hover:bg-blue-950/40 transition-all duration-150">
              <Send className="w-3.5 h-3.5" />
              Telegram
            </button>

            {canShare && (
              <button onClick={handleShare} className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-surface-border text-xs text-slate-300 hover:border-brand-border hover:text-brand transition-all duration-150">
                <Share2 className="w-3.5 h-3.5" />
                {t("compose", "share")}
              </button>
            )}
          </div>

          {/* QR Code */}
          <QRCodeDisplay url={result.url} />
        </div>

        <div className="flex items-center gap-3 text-xs text-slate-500">
          <span className="w-1.5 h-1.5 rounded-full bg-brand animate-pulse-dot shrink-0" />
          {remaining !== null
            ? <span>{t("compose", "expiresIn")} <span className="text-slate-300">{formatCountdown(remaining)}</span></span>
            : <span>{t("compose", "neverExpires")}</span>
          }
        </div>

        <button onClick={onCreateNew} className="flex items-center gap-2 text-xs text-slate-500 hover:text-slate-300 transition-colors mt-2">
          <ArrowLeft className="w-3.5 h-3.5" />
          {t("compose", "createAnother")}
        </button>
      </div>
    </>
  );
}

function PreviewPanel({ title, content, onBack }: { title: string; content: string; onBack: () => void }) {
  const { t } = useLang();
  return (
    <div className="animate-fade-up w-full space-y-4">
      <button onClick={onBack} className="flex items-center gap-2 text-xs text-slate-500 hover:text-slate-300 transition-colors">
        <ArrowLeft className="w-3.5 h-3.5" /> {t("compose", "backToEdit")}
      </button>
      <div className="rounded-xl border border-brand-border bg-brand-muted p-5 space-y-3">
        <div className="flex items-center gap-2 text-brand text-xs font-semibold uppercase tracking-widest">
          <Eye className="w-3.5 h-3.5" /> {t("compose", "previewLabel")}
        </div>
        {title && <p className="text-sm font-semibold text-white">{title}</p>}
        <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">{content}</p>
      </div>
      <p className="text-xs text-slate-600">{t("compose", "previewNote")}</p>
    </div>
  );
}

export default function ComposeView() {
  const { t } = useLang();
  const [stage, setStage] = useState<"compose" | "preview" | "result">("compose");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [expiry, setExpiry] = useState<Expiry>("1hr");
  const [password, setPassword] = useState("");
  const [scheduledAt, setScheduledAt] = useState<string | null>(null);
  const [collectionId, setCollectionId] = useState<string | null>(null);
  const [collections, setCollections] = useState<{id: string; name: string; emoji: string}[]>([]);
  const [loading, setLoading] = useState(false);
  const ownerId = useOwnerId();
  const [result, setResult] = useState<ResultData | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const expiryOptions: { value: Expiry; labelKey: string }[] = [
    { value: "5min", labelKey: "expiry5min" },
    { value: "1hr", labelKey: "expiry1hr" },
    { value: "24hr", labelKey: "expiry24hr" },
    { value: "never", labelKey: "expiryNever" },
  ];

  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (content.trim()) { e.preventDefault(); e.returnValue = ""; }
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [content]);

  useEffect(() => {
    if (!ownerId) return;
    fetch(`/api/collections?owner_id=${ownerId}`)
      .then((r) => r.json())
      .then((d) => setCollections(d.collections || []))
      .catch(() => {});
  }, [ownerId]);

  const handleCreate = useCallback(async () => {
    if (!content.trim()) { toast.error(t("compose", "emptyError")); return; }
    setLoading(true);
    try {
      // ── Zero-knowledge AES-256-GCM encryption ──
      // Generate a fresh random key — never sent to server
      const { key, keyString } = await generateEncryptionKey();
      // Encrypt content AND title locally — server never sees plaintext
      const encryptedContent = await encryptSecret(content.trim(), key);
      const encryptedTitle = title.trim() ? await encryptSecret(title.trim(), key) : undefined;

      const res = await fetch("/api/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: encryptedTitle,
          content: encryptedContent,
          password: password || undefined,
          expiry,
          scheduled_at: scheduledAt || undefined,
          collection_id: collectionId || undefined,
          encrypted: true,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      // Build URL with key in fragment — fragment never sent to server
      const baseUrl = `${window.location.origin}/s/${data.id}`;
      const url = buildShareUrl(baseUrl, keyString);

      setResult({ id: data.id, url, expiry, title: title.trim() || null });
      setContent(""); setTitle(""); setPassword("");
      setStage("result");
    } catch (err: any) {
      toast.error(err.message || "Failed to create secret");
    } finally {
      setLoading(false);
    }
  }, [content, title, password, expiry, t]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter" && stage === "compose") {
        e.preventDefault(); handleCreate();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [stage, handleCreate]);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); setIsDragging(false);
    const text = e.dataTransfer.getData("text/plain");
    if (text) setContent((prev) => (prev + text).slice(0, MAX_CHARS));
  };

  const handleTemplateSelect = (tplTitle: string, tplContent: string) => {
    setTitle(tplTitle);
    setContent(tplContent);
    textareaRef.current?.focus();
  };

  if (stage === "result" && result) return <ResultPanel result={result} onCreateNew={() => { setStage("compose"); setResult(null); }} />;
  if (stage === "preview") return <PreviewPanel title={title} content={content} onBack={() => setStage("compose")} />;

  const charRatio = content.length / MAX_CHARS;

  return (
    <div className="animate-fade-up w-full space-y-4">
      {/* Templates */}
      <SecretTemplates onSelect={handleTemplateSelect} />

      <input
        type="text"
        placeholder={t("compose", "titlePlaceholder")}
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        maxLength={120}
        className="w-full px-4 py-3 rounded-xl bg-surface-input border border-surface-border text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-brand-border focus:ring-1 focus:ring-brand/20 transition-all"
      />

      <div
        className={`relative rounded-xl transition-all duration-150 ${isDragging ? "ring-2 ring-brand/40" : ""}`}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
      >
        <textarea
          ref={textareaRef}
          placeholder={t("compose", "contentPlaceholder")}
          value={content}
          onChange={(e) => setContent(e.target.value.slice(0, MAX_CHARS))}
          rows={8}
          className="w-full px-4 py-3 rounded-xl bg-surface-input border border-surface-border text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-brand-border focus:ring-1 focus:ring-brand/20 resize-none transition-all"
        />
        <div className={`absolute bottom-3 right-3 text-xs tabular-nums pointer-events-none transition-colors ${
          charRatio > 0.9 ? "text-red-400" : charRatio > 0.7 ? "text-yellow-500/60" : "text-slate-700"
        }`}>
          {content.length} / {MAX_CHARS}
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-xs text-slate-600 uppercase tracking-widest">{t("compose", "validity")}</p>
        <div className="flex gap-2 flex-wrap">
          {expiryOptions.map((opt) => (
            <button key={opt.value} type="button" onClick={() => setExpiry(opt.value)}
              className={`px-3.5 py-1.5 rounded-full text-xs border transition-all duration-150 ${
                expiry === opt.value
                  ? "bg-brand-muted border-brand-border text-brand font-semibold"
                  : "border-surface-border text-slate-500 hover:border-slate-600 hover:text-slate-300"
              }`}
            >
              {t("compose", opt.labelKey)}
            </button>
          ))}
        </div>
      </div>

      <input
        type="password"
        placeholder={t("compose", "passwordPlaceholder")}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="w-full px-4 py-3 rounded-xl bg-surface-input border border-surface-border text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-brand-border focus:ring-1 focus:ring-brand/20 transition-all"
      />

      {/* Scheduled reveal */}
      <DateTimePicker value={scheduledAt} onChange={setScheduledAt} />

      {/* Save to collection */}
      {collections.length > 0 && (
        <div className="space-y-2">
          <button
            type="button"
            onClick={() => setCollectionId(collectionId ? null : collections[0].id)}
            className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-300 transition-colors"
          >
            <span className="text-base">{collectionId ? collections.find(c => c.id === collectionId)?.emoji ?? "📁" : "📁"}</span>
            {collectionId
              ? <span className="text-brand">Saved to: {collections.find(c => c.id === collectionId)?.name}</span>
              : <span>Save to a collection (optional)</span>
            }
          </button>
          {collectionId !== null && (
            <div className="flex flex-wrap gap-2">
              {collections.map((col) => (
                <button key={col.id} type="button" onClick={() => setCollectionId(col.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs border transition-all ${
                    collectionId === col.id
                      ? "bg-brand-muted border-brand-border text-brand font-semibold"
                      : "border-surface-border text-slate-500 hover:border-slate-600 hover:text-slate-300"
                  }`}
                >
                  {col.emoji} {col.name}
                </button>
              ))}
              <button type="button" onClick={() => setCollectionId(null)}
                className="px-3 py-1.5 rounded-full text-xs border border-surface-border text-slate-600 hover:text-slate-400 transition-all"
              >
                None
              </button>
            </div>
          )}
        </div>
      )}

      <div className="flex gap-3 pt-1">
        <button onClick={handleCreate} disabled={loading || !content.trim()}
          className="flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-brand text-surface font-bold text-sm hover:bg-brand-dim disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-150 glow-brand"
        >
          {loading
            ? <><Loader2 className="w-4 h-4 animate-spin" /> {t("compose", "creating")}</>
            : <><Shield className="w-4 h-4" /> {t("compose", "createButton")}</>
          }
        </button>
        <button type="button" onClick={() => setStage("preview")} disabled={!content.trim()}
          className="flex items-center gap-1.5 px-4 py-3 rounded-xl border border-surface-border text-xs text-slate-400 hover:border-slate-600 hover:text-slate-200 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
        >
          <Eye className="w-3.5 h-3.5" /> {t("compose", "preview")}
        </button>
      </div>

      <p className="text-xs text-slate-700 text-center">{t("compose", "shortcut")}</p>
      <p className="text-xs text-slate-700 text-center">
        🔐 Encrypted in your browser before sending — server never sees your secret.
      </p>
    </div>
  );
}
