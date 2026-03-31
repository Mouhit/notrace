"use client";
import { useState } from "react";
import { Shield, Lock, Flame, Eye, Server, ChevronDown, ChevronUp, X } from "lucide-react";

interface SecurityFeature {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const FEATURES: SecurityFeature[] = [
  {
    icon: <Lock className="w-4 h-4 text-brand" />,
    title: "AES-256-GCM Encrypted",
    description: "Your secret is encrypted in your browser before being sent. The server never sees your plaintext.",
  },
  {
    icon: <Server className="w-4 h-4 text-brand" />,
    title: "Zero-Knowledge Server",
    description: "The decryption key lives only in your share link's URL fragment — never transmitted to our server.",
  },
  {
    icon: <Flame className="w-4 h-4 text-brand" />,
    title: "Burn After Read",
    description: "Secrets are permanently destroyed after the first view. No recovery, no second chances.",
  },
  {
    icon: <Eye className="w-4 h-4 text-brand" />,
    title: "No Logs, No Tracking",
    description: "We don't track users, log IP addresses, or store any personal data. Completely anonymous.",
  },
  {
    icon: <Shield className="w-4 h-4 text-brand" />,
    title: "Attack Protected",
    description: "Rate limiting, brute-force detection, timing-safe comparisons, and security headers on every request.",
  },
];

export default function SecurityBadge() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Inline badge — shown on homepage */}
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-brand-border bg-brand-muted text-xs text-brand hover:bg-brand/20 transition-all"
      >
        <Shield className="w-3.5 h-3.5" />
        <span className="font-semibold">End-to-End Encrypted</span>
        <span className="text-brand/60">· How?</span>
      </button>

      {/* Modal */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />

          {/* Panel */}
          <div className="relative w-full max-w-md rounded-2xl border border-surface-border bg-surface-card p-6 space-y-5 animate-fade-up">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-brand-muted border border-brand-border flex items-center justify-center">
                  <Shield className="w-4 h-4 text-brand" />
                </div>
                <div>
                  <p className="text-sm font-bold text-white">How NoTrace protects you</p>
                  <p className="text-xs text-slate-500">Military-grade security, explained simply.</p>
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-surface transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              {FEATURES.map((f, i) => (
                <div key={i} className="flex gap-3 p-3 rounded-xl bg-surface border border-surface-border">
                  <div className="mt-0.5 shrink-0">{f.icon}</div>
                  <div>
                    <p className="text-xs font-semibold text-white">{f.title}</p>
                    <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{f.description}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Trust footer */}
            <div className="pt-2 border-t border-surface-border">
              <p className="text-xs text-slate-600 text-center">
                Open source · No accounts · No ads · No tracking
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
