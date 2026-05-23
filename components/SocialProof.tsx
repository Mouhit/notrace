"use client";
import { useEffect, useState } from "react";
import { Copy, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

export default function SocialProof() {
  const [count, setCount] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  // ✅ Fetch initial count on mount
  useEffect(() => {
    const fetchCount = async () => {
      try {
        const res = await fetch("/api/stats");
        const data = await res.json();
        setCount(data.count);
      } catch {
        setCount(101054); // Fallback to initial count
      }
    };

    fetchCount();

    // ✅ Refetch every 60 seconds to check for increments
    const interval = setInterval(async () => {
      setIsUpdating(true);
      try {
        const res = await fetch("/api/stats");
        const data = await res.json();
        // ✅ Only update if changed
        setCount((prev) => {
          if (data.count !== prev) {
            // Animation: flash effect when count changes
            setTimeout(() => setIsUpdating(false), 500);
            return data.count;
          }
          setIsUpdating(false);
          return prev;
        });
      } catch {
        setIsUpdating(false);
      }
    }, 60000); // Check every 60 seconds

    return () => clearInterval(interval);
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
      <p className={`text-xs text-slate-500 font-mono transition-all ${isUpdating ? "animate-pulse" : ""}`}>
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
