"use client";
import { useState } from "react";
import { Lock, Eye, EyeOff, AlertTriangle } from "lucide-react";
import { hashPassword, loadChatIdentity } from "@/lib/chat/crypto";

const T = {
  bg: "#050505", card: "#0e0e0e", border: "#1a1a1a",
  accent: "#9fff00", accentDim: "rgba(159,255,0,0.12)",
  accentBorder: "rgba(159,255,0,0.25)", text: "#f0f0f0",
  muted: "#666", error: "#ff4444", font: "'JetBrains Mono', monospace",
};

interface Props {
  username: string;
  onUnlock: () => void;
}

export default function VaultLocked({ username, onUnlock }: Props) {
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleUnlock = async () => {
    if (!password) return;
    setLoading(true);
    setError("");
    try {
      // Verify by re-hashing and checking against server
      const pwHash = await hashPassword(password, username);
      const res = await fetch("/api/chat/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password_hash: pwHash }),
      });
      if (res.ok) {
        onUnlock();
      } else {
        setError("Wrong password");
      }
    } catch {
      setError("Failed to verify. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: "fixed", inset: 0, background: "#000",
      display: "flex", alignItems: "center", justifyContent: "center",
      zIndex: 9999, fontFamily: T.font,
    }}>
      <style>{`@keyframes pulse-lock { 0%,100%{opacity:1} 50%{opacity:0.4} }`}</style>

      <div style={{ textAlign: "center", width: "100%", maxWidth: 380, padding: 24 }}>
        {/* Pulsing lock */}
        <div style={{ animation: "pulse-lock 2s ease-in-out infinite", marginBottom: 24 }}>
          <div style={{ width: 72, height: 72, borderRadius: 20, background: "rgba(159,255,0,0.08)", border: "1px solid rgba(159,255,0,0.2)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto" }}>
            <Lock size={32} style={{ color: "#9fff00" }} />
          </div>
        </div>

        <h2 style={{ fontSize: 20, fontWeight: 700, color: T.text, margin: "0 0 6px" }}>Vault Locked</h2>
        <p style={{ fontSize: 12, color: T.muted, margin: "0 0 28px" }}>
          All connections cleared. Enter password to re-enter as <span style={{ color: "#9fff00" }}>{username}</span>.
        </p>

        <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 16, padding: 22, textAlign: "left" }}>
          <div style={{ position: "relative", marginBottom: 12 }}>
            <input
              type={showPw ? "text" : "password"}
              placeholder="Enter password"
              value={password}
              autoFocus
              onChange={(e) => { setPassword(e.target.value); setError(""); }}
              onKeyDown={(e) => e.key === "Enter" && handleUnlock()}
              style={{ width: "100%", padding: "12px 44px 12px 14px", background: "#0a0a0a", border: `1px solid ${error ? T.error : T.border}`, borderRadius: 10, color: T.text, fontSize: 14, fontFamily: T.font, outline: "none", boxSizing: "border-box" }}
            />
            <button onClick={() => setShowPw(!showPw)} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: T.muted }}>
              {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>

          {error && (
            <div style={{ display: "flex", gap: 7, alignItems: "center", padding: "8px 12px", background: "rgba(255,68,68,0.07)", border: "1px solid rgba(255,68,68,0.2)", borderRadius: 7, marginBottom: 12 }}>
              <AlertTriangle size={12} style={{ color: T.error }} />
              <p style={{ fontSize: 12, color: T.error, margin: 0 }}>{error}</p>
            </div>
          )}

          <button onClick={handleUnlock} disabled={loading || !password}
            style={{ width: "100%", padding: "12px", borderRadius: 10, background: "#9fff00", color: "#000", fontWeight: 700, fontSize: 14, border: "none", cursor: "pointer", opacity: (loading || !password) ? 0.5 : 1, fontFamily: T.font }}>
            {loading ? "Verifying..." : "Unlock Vault →"}
          </button>
        </div>

        <p style={{ fontSize: 10, color: "#333", marginTop: 20 }}>
          Shake detected · All P2P connections terminated
        </p>
      </div>
    </div>
  );
}
