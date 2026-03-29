"use client";
import { useState, useRef, useEffect } from "react";
import { Languages, ChevronDown } from "lucide-react";
import { useLang } from "@/lib/language";
import { locales, languageNames, Locale } from "@/lib/i18n";

export default function LanguageSwitcher() {
  const { locale, setLocale } = useLang();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-surface-border text-xs text-slate-400 hover:border-slate-600 hover:text-slate-200 transition-all"
      >
        <Languages className="w-3.5 h-3.5" />
        <span>{languageNames[locale]}</span>
        <ChevronDown className={`w-3 h-3 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-44 max-h-72 overflow-y-auto rounded-xl border border-surface-border bg-surface-card shadow-xl z-50">
          {locales.map((l) => (
            <button
              key={l}
              onClick={() => { setLocale(l as Locale); setOpen(false); }}
              className={`w-full text-left px-3.5 py-2.5 text-xs transition-colors ${
                l === locale
                  ? "text-brand bg-brand-muted"
                  : "text-slate-400 hover:text-slate-200 hover:bg-surface"
              }`}
            >
              {languageNames[l as Locale]}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
