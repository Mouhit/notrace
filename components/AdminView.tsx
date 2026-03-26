"use client";
import { useState } from "react";
import { Shield, Loader2, Lock, BarChart3 } from "lucide-react";

interface Stats {
  total_created: number;
  total_read: number;
  active_secrets: number;
  destroyed_secrets: number;
}

function StatCard({ label, value, sub }: { label: string; value: number; sub?: string }) {
  return (
    <div className="rounded-xl border border-surface-border bg-surface-card p-5 space-y-2">
      <p className="text-xs text-slate-500 uppercase tracking-widest">{label}</p>
      <p className="text-3xl font-bold text-white tabular-nums">{value.toLocaleString()}</p>
      {sub && <p className="text-xs text-slate-600">{sub}</p>}
    </div>
  );
}

export default function AdminView() {
  const [key, setKey] = useState("");
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLoad = async () => {
    if (!key.trim()) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/admin?key=${encodeURIComponent(key)}`);
      if (res.status === 401) { setError("Invalid admin key."); return; }
      if (!res.ok) throw new Error("Server error");
      setStats(await res.json());
    } catch {
      setError("Failed to load stats.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-up space-y-8">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
        <p className="text-sm text-slate-500">View NoTrace platform statistics.</p>
      </div>

      {!stats ? (
        <div className="rounded-2xl border border-surface-border bg-surface-card p-6 space-y-4 max-w-sm">
          <div className="flex items-center gap-2 text-slate-400">
            <Lock className="w-4 h-4" />
            <span className="text-sm font-medium">Admin access required</span>
          </div>
          <input
            type="password"
            placeholder="Enter admin key"
            value={key}
            autoFocus
            onChange={(e) => { setKey(e.target.value); setError(""); }}
            onKeyDown={(e) => e.key === "Enter" && handleLoad()}
            className="w-full px-4 py-3 rounded-xl bg-surface border border-surface-border text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-brand-border focus:ring-1 focus:ring-brand/20 transition-all"
          />
          {error && <p className="text-xs text-red-400">{error}</p>}
          <button
            onClick={handleLoad}
            disabled={loading || !key.trim()}
            className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-brand text-surface font-bold text-sm hover:bg-brand-dim disabled:opacity-40 transition-all"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Shield className="w-4 h-4" />}
            {loading ? "Loading..." : "Access Dashboard"}
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-brand text-sm font-semibold">
            <BarChart3 className="w-4 h-4" />
            Platform Statistics
          </div>
          <div className="grid grid-cols-2 gap-3">
            <StatCard label="Total Created" value={stats.total_created} sub="All time" />
            <StatCard label="Total Read" value={stats.total_read} sub="Secrets revealed" />
            <StatCard label="Active Secrets" value={stats.active_secrets} sub="Waiting to be read" />
            <StatCard label="Destroyed" value={stats.destroyed_secrets} sub="Already burned" />
          </div>
          <div className="rounded-xl border border-surface-border bg-surface-card p-4">
            <p className="text-xs text-slate-500">
              Read rate:{" "}
              <span className="text-white font-semibold">
                {stats.total_created > 0
                  ? `${Math.round((stats.total_read / stats.total_created) * 100)}%`
                  : "N/A"}
              </span>
            </p>
          </div>
          <button
            onClick={() => { setStats(null); setKey(""); }}
            className="text-xs text-slate-600 hover:text-slate-400 transition-colors"
          >
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}
