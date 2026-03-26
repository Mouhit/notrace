"use client";
import Link from "next/link";
import { Shield } from "lucide-react";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-surface-border bg-surface/80 backdrop-blur-sm">
      <div className="max-w-2xl mx-auto px-5 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-lg border border-brand-border bg-brand-muted flex items-center justify-center group-hover:bg-brand/20 transition-all duration-200">
            <Shield className="w-4 h-4 text-brand" />
          </div>
          <span className="font-bold text-base tracking-tight text-white">
            No<span className="text-brand">Trace</span>
          </span>
        </Link>

        <div className="flex items-center gap-2.5">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand opacity-60" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-brand" />
          </span>
          <span className="text-xs text-slate-500 hidden sm:block tracking-wide">
            Anonymous · Ephemeral
          </span>
        </div>
      </div>
    </header>
  );
}
