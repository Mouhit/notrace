"use client";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-surface-border py-5 px-5">
      <div className="max-w-2xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
        <p className="text-xs text-slate-600">
          © {new Date().getFullYear()} NoTrace · No logs · No tracking · No accounts
        </p>
        <div className="flex items-center gap-4">
          <Link href="/admin" className="text-xs text-slate-600 hover:text-slate-400 transition-colors">
            Admin
          </Link>
        </div>
      </div>
    </footer>
  );
}
