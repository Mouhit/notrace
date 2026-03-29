"use client";
import Link from "next/link";
import { useLang } from "@/lib/language";

export default function Footer() {
  const { t } = useLang();

  return (
    <footer className="border-t border-surface-border py-5 px-5">
      <div className="max-w-2xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
        <p className="text-xs text-slate-600">
          © {new Date().getFullYear()} NoTrace · {t("footer", "copy")}
        </p>
        <div className="flex items-center gap-4">
          <Link href="/admin" className="text-xs text-slate-600 hover:text-slate-400 transition-colors">
            {t("footer", "admin")}
          </Link>
        </div>
      </div>
    </footer>
  );
}
