"use client";
import { useState } from "react";
import { Send, Loader2, CheckCircle2, Copy } from "lucide-react";
import { toast } from "sonner";

const MAX_CHARS = 5000;

interface SecureReplyProps {
  originalId: string;
}

export default function SecureReply({ originalId }: SecureReplyProps) {
  const [open, setOpen] = useState(false);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [replyId, setReplyId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleSend = async () => {
    if (!content.trim()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/reply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: content.trim(), reply_to_id: originalId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setReplyId(data.reply_id);
      setContent("");
    } catch (err: any) {
      toast.error(err.message || "Failed to send reply");
    } finally {
      setLoading(false);
    }
  };

  const replyUrl = replyId
    ? `${window.location.origin}/s/${replyId}`
    : null;

  const handleCopyReplyLink = async () => {
    if (!replyUrl) return;
    await navigator.clipboard.writeText(replyUrl);
    setCopied(true);
    toast.success("Reply link copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  // After reply sent — show success
  if (replyId && replyUrl) {
    return (
      <div className="mt-5 rounded-xl border border-brand-border bg-brand-muted p-4 space-y-3">
        <div className="flex items-center gap-2 text-brand text-xs font-semibold">
          <CheckCircle2 className="w-4 h-4" />
          Secure reply sent!
        </div>
        <p className="text-xs text-slate-400">
          Share this link with the original sender so they can read your reply. It will self-destruct after they read it.
        </p>
        <div className="flex items-center gap-2 bg-surface rounded-lg px-3 py-2 border border-surface-border">
          <p className="flex-1 text-xs text-slate-300 break-all">{replyUrl}</p>
        </div>
        <button
          onClick={handleCopyReplyLink}
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
        <button
          onClick={() => setOpen(true)}
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
            onChange={(e) => setContent(e.target.value.slice(0, MAX_CHARS))}
            rows={4}
            autoFocus
            className="w-full px-4 py-3 rounded-xl bg-surface border border-surface-border text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-brand-border focus:ring-1 focus:ring-brand/20 resize-none transition-all"
          />
          <div className="flex gap-2">
            <button
              onClick={handleSend}
              disabled={loading || !content.trim()}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-brand text-surface font-bold text-xs hover:bg-brand-dim disabled:opacity-40 transition-all"
            >
              {loading
                ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Sending...</>
                : <><Send className="w-3.5 h-3.5" /> Send Reply</>
              }
            </button>
            <button
              onClick={() => setOpen(false)}
              className="px-4 py-2 rounded-lg border border-surface-border text-xs text-slate-500 hover:text-slate-300 transition-all"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
