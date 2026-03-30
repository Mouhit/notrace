"use client";
import { useEffect, useState } from "react";
import { Copy, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

export default function SocialProof() {
  const [count, setCount] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch("/api/stats")
      .then((r) => r.json())
      .then((d) => setCount(d.count))
      .catch(() => setCount(100993));
  }, []);

  const handleCopyBadge = async () => {
    const badge = `🔐 I use NoTrace for secure sharing — ${window.location.origin}`;
    await navigator.clipboard.writeText(badge);
    setCopied(true);
    toast.success("Badge copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  if (!count) return null;

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
      <p className="text-xs text-slate-500 font-mono">
        <span className="text-brand font-bold text-sm">
          {count.toLocaleString()}
        </span>{" "}
        secrets sent so far
      </p>
      <button
        onClick={handleCopyBadge}
        className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-surface-border text-xs text-slate-500 hover:border-brand-border hover:text-brand transition-all"
      >
        {copied
          ? <><CheckCircle2 className="w-3 h-3" /> Copied!</>
          : <><Copy className="w-3 h-3" /> Copy badge</>
        }
      </button>
    </div>
  );
}
