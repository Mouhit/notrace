"use client";
import Link from "next/link";
import Image from "next/image";
import { FolderOpen } from "lucide-react";
import { useLang } from "@/lib/language";
import LanguageSwitcher from "./LanguageSwitcher";
import ThemeToggle from "./ThemeToggle";

export default function Header() {
  const { t } = useLang();

  return (
    <header className="sticky top-0 z-50 border-b border-surface-border bg-surface/80 backdrop-blur-sm">
      <div className="max-w-2xl mx-auto px-5 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 group">
          <Image
            src="/logo.png"
            alt="NoTrace"
            width={36}
            height={36}
            className="rounded-lg"
          />
          <span className="font-bold text-base tracking-tight text-white">
            No<span className="text-brand">Trace</span>
          </span>
        </Link>

        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-2.5 mr-1">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand opacity-60" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-brand" />
            </span>
            <span className="text-xs text-slate-500 tracking-wide">
              {t("nav", "tagline")}
            </span>
          </div>
          <Link href="/collections"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-surface-border text-xs text-slate-400 hover:border-brand-border hover:text-brand transition-all"
          >
            <FolderOpen className="w-3.5 h-3.5" />
            <span className="hidden sm:block">Collections</span>
          </Link>
          <ThemeToggle />
          <LanguageSwitcher />
        </div>
      </div>
    </header>
  );
}
