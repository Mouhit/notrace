"use client";
import { useLang } from "@/lib/language";
import ComposeView from "@/components/ComposeView";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SocialProof from "@/components/SocialProof";
import SecurityBadge from "@/components/SecurityBadge";

export default function Home() {
  const { t } = useLang();
  return (
    <div className="min-h-screen flex flex-col bg-surface">
      <Header />
      <main className="flex-1 max-w-2xl w-full mx-auto px-5 py-12 sm:py-16">
        <div className="mb-10 space-y-3">
          <h1 className="text-3xl font-bold text-white tracking-tight">{t("home", "title")}</h1>
          <p className="text-sm text-slate-400">{t("home", "subtitle")}</p>
          <div className="flex flex-wrap items-center gap-3 pt-1">
            <SocialProof />
            <SecurityBadge />
          </div>
        </div>
        <ComposeView />
      </main>
      <Footer />
    </div>
  );
}
