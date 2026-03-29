"use client";
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Locale, defaultLocale, locales, rtlLocales } from "./i18n";

type Messages = Record<string, Record<string, string>>;

interface LangContextType {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: (section: string, key: string) => string;
  isRTL: boolean;
}

const LangContext = createContext<LangContextType | null>(null);

function detectBrowserLocale(): Locale {
  if (typeof navigator === "undefined") return defaultLocale;
  const lang = navigator.language.split("-")[0] as Locale;
  return locales.includes(lang) ? lang : defaultLocale;
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(defaultLocale);
  const [messages, setMessages] = useState<Messages>({});

  useEffect(() => {
    const saved = localStorage.getItem("notrace-locale") as Locale | null;
    const initial = saved && locales.includes(saved) ? saved : detectBrowserLocale();
    setLocaleState(initial);
  }, []);

  useEffect(() => {
    fetch(`/messages/${locale}.json`)
      .then((r) => r.json())
      .then(setMessages)
      .catch(() => {
        fetch(`/messages/en.json`).then((r) => r.json()).then(setMessages);
      });

    // Set dir for RTL languages
    document.documentElement.dir = rtlLocales.includes(locale) ? "rtl" : "ltr";
    document.documentElement.lang = locale;
  }, [locale]);

  const setLocale = (l: Locale) => {
    setLocaleState(l);
    localStorage.setItem("notrace-locale", l);
  };

  const t = (section: string, key: string): string => {
    return messages[section]?.[key] ?? key;
  };

  const isRTL = rtlLocales.includes(locale);

  return (
    <LangContext.Provider value={{ locale, setLocale, t, isRTL }}>
      {children}
    </LangContext.Provider>
  );
}

export function useLang() {
  const ctx = useContext(LangContext);
  if (!ctx) throw new Error("useLang must be used within LanguageProvider");
  return ctx;
}
