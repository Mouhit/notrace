import ComposeView from "@/components/ComposeView";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-surface">
      <Header />
      <main className="flex-1 max-w-2xl w-full mx-auto px-5 py-12 sm:py-16">
        <div className="mb-10 space-y-2">
          <h1 className="text-3xl font-bold text-white tracking-tight">
            Send a secret.
          </h1>
          <p className="text-sm text-slate-400">
            Burn-after-read. No accounts. No logs.
          </p>
        </div>
        <ComposeView />
      </main>
      <Footer />
    </div>
  );
}
