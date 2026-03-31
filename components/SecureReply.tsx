"use client";
import { useState, useRef, useCallback } from "react";
import { Send, Loader2, CheckCircle2, Copy } from "lucide-react";
import { toast } from "sonner";
import { generateEncryptionKey, encryptSecret, buildShareUrl } from "@/lib/crypto";

const MAX_CHARS = 5000;

interface SecureReplyProps {
  originalId: string;
  onActiveChange?: (active: boolean) => void;
}

export default function SecureReply({ originalId, onActiveChange }: SecureReplyProps) {
  const [open, setOpen] = useState(false);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [replyId, setReplyId] = useState<string | null>(null);
  const [replyUrl, setReplyUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const contentRef = useRef(content);

  const handleContentChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value.slice(0, MAX_CHARS);
    contentRef.current = val;
    setContent(val);
  }, []);

  const handleSend = async () => {
    const currentContent = contentRef.current;
    if (!currentContent.trim()) return;
    setLoading(true);
    try {
      // ── E2E encrypt the reply — server never sees plaintext ──
      const { key, keyString } = await generateEncryptionKey();
      const encryptedContent = await encryptSecret(currentContent.trim(), key);

      const res = await fetch("/api/reply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: encryptedContent, reply_to_id: originalId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      // Build reply URL with decryption key in fragment
      const baseUrl = `${window.location.origin}/s/${data.reply_id}`;
      const url = buildShareUrl(baseUrl, keyString);

      setReplyId(data.reply_id);
      setReplyUrl(url);
      setContent("");
      contentRef.current = "";
      onActiveChange?.(false);
    } catch (err: any) {
      toast.error(err.message || "Failed to send reply");
    } finally {
      setLoading(false);
    }
  };

  const handleCopyReplyLink = async () => {
    if (!replyUrl) return;
    await navigator.clipboard.writeText(replyUrl);
    setCopied(true);
    toast.success("Reply link copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  if (replyId && replyUrl) {
    return (
      <div className="mt-5 rounded-xl border border-brand-border bg-brand-muted p-4 space-y-3">
        <div className="flex items-center gap-2 text-brand text-xs font-semibold">
          <CheckCircle2 className="w-4 h-4" />
          Secure reply sent!
        </div>
        <p className="text-xs text-slate-400">
          Share this link with the original sender — it self-destructs after they read it.
        </p>
        <div className="flex items-center gap-2 bg-surface rounded-lg px-3 py-2 border border-surface-border">
          <p className="flex-1 text-xs text-slate-300 break-all">{replyUrl}</p>
        </div>
        <button onClick={handleCopyReplyLink}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-surface-border text-xs text-slate-300 hover:border-brand-border hover:text-brand transition-all"
        >
          {copied ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
          {copied ? "Copied!" : "Copy Reply Link"}
        </button>
      </div>
    );
  }

  return (
    <div className="mt-5 space-y-3">
      {!open ? (
        <button onClick={() => { setOpen(true); onActiveChange?.(true); }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-surface-border text-xs text-slate-400 hover:border-brand-border hover:text-brand transition-all"
        >
          <Send className="w-3.5 h-3.5" />
          Send a secure reply
        </button>
      ) : (
        <div className="rounded-xl border border-surface-border bg-surface-card p-4 space-y-3">
          <p className="text-xs text-slate-400 font-semibold">
            📨 Your reply is also burn-after-read
          </p>
          <textarea
            placeholder="Type your secure reply here..."
            value={content}
            onChange={handleContentChange}
            rows={4}
            autoFocus
            className="w-full px-4 py-3 rounded-xl bg-surface border border-surface-border text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-brand-border focus:ring-1 focus:ring-brand/20 resize-none transition-all"
          />
          <div className="flex items-center justify-between">
            <span className={`text-xs tabular-nums ${content.length > MAX_CHARS * 0.9 ? "text-red-400" : "text-slate-700"}`}>
              {content.length} / {MAX_CHARS}
            </span>
            <div className="flex gap-2">
              <button onClick={() => { setOpen(false); setContent(""); contentRef.current = ""; onActiveChange?.(false); }}
                className="px-4 py-2 rounded-lg border border-surface-border text-xs text-slate-500 hover:text-slate-300 transition-all"
              >
                Cancel
              </button>
              <button onClick={handleSend} disabled={loading || !content.trim()}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-brand text-surface font-bold text-xs hover:bg-brand-dim disabled:opacity-40 transition-all"
              >
                {loading
                  ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Sending...</>
                  : <><Send className="w-3.5 h-3.5" /> Send Reply</>
                }
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
