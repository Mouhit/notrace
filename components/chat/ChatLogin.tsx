"use client";
import { useState } from "react";
import { Eye, EyeOff, Loader2, Shield, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { hashPassword, saveChatIdentity, generateKeypair, mnemonicToSeed, generateMnemonic } from "@/lib/chat/crypto";

const T = {
  bg: "#050505", card: "#0e0e0e", border: "#1a1a1a",
  accent: "#9fff00", accentDim: "rgba(159,255,0,0.12)",
  accentBorder: "rgba(159,255,0,0.25)", text: "#f0f0f0",
  muted: "#666", muted2: "#444", error: "#ff4444",
  font: "'JetBrains Mono', monospace",
};

const inp: React.CSSProperties = {
  width: "100%", padding: "12px 16px", background: "#0a0a0a",
  border: `1px solid ${T.border}`, borderRadius: 10, color: T.text,
  fontSize: 14, fontFamily: T.font, outline: "none", boxSizing: "border-box",
};

interface Props {
  onSuccess: (username: string) => void;
  onSwitchToRegister: () => void;
}

export default function ChatLogin({ onSuccess, onSwitchToRegister }: Props) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    setError("");
    if (!username.trim() || !password) { setError("Username and password required"); return; }
    setLoading(true);
    try {
      const pwHash = await hashPassword(password, username.trim());
      const res = await fetch("/api/chat/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: username.trim(), password_hash: pwHash }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Invalid credentials"); return; }

      // Check if private key exists locally
      const storedPrivKey = localStorage.getItem("notrace-chat-privkey");
      if (!storedPrivKey) {
        // Private key missing — user is on a different device
        // They need their mnemonic to restore the keypair
        setError("Private key not found on this device. Use 'Restore from phrase' to recover your identity.");
        return;
      }

      // Save updated identity
      saveChatIdentity(data.username, {
        publicKey: data.public_key,
        privateKey: storedPrivKey,
      });

      toast.success(`Welcome back, ${data.username}!`);
      onSuccess(data.username);
    } catch {
      setError("Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: T.bg, display: "flex", alignItems: "center", justifyContent: "center", padding: 20, fontFamily: T.font }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&display=swap');
        .chat-inp:focus { border-color: ${T.accent} !important; box-shadow: 0 0 0 2px rgba(159,255,0,0.1) !important; }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeUp { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        .fade-up { animation: fadeUp 0.35s ease forwards; }
      `}</style>

      <div className="fade-up" style={{ width: "100%", maxWidth: 420 }}>
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{ width: 52, height: 52, borderRadius: 14, background: T.accentDim, border: `1px solid ${T.accentBorder}`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px" }}>
            <Shield style={{ color: T.accent }} size={24} />
          </div>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: T.text, margin: "0 0 5px" }}>Sign In</h1>
          <p style={{ fontSize: 12, color: T.muted, margin: 0 }}>Enter your credentials to access NoTrace Chat</p>
        </div>

        <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 18, padding: 26 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div>
              <label style={{ fontSize: 10, color: T.muted, textTransform: "uppercase", letterSpacing: "0.1em", display: "block", marginBottom: 7 }}>Username</label>
              <input className="chat-inp" style={inp} placeholder="your_username" value={username}
                onChange={(e) => setUsername(e.target.value)} autoComplete="off" spellCheck={false} />
            </div>

            <div>
              <label style={{ fontSize: 10, color: T.muted, textTransform: "uppercase", letterSpacing: "0.1em", display: "block", marginBottom: 7 }}>Password</label>
              <div style={{ position: "relative" }}>
                <input className="chat-inp" style={{ ...inp, paddingRight: 44 }} type={showPw ? "text" : "password"}
                  placeholder="Your password" value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleLogin()} />
                <button onClick={() => setShowPw(!showPw)} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: T.muted }}>
                  {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {error && (
              <div style={{ display: "flex", gap: 8, alignItems: "center", padding: "9px 12px", background: "rgba(255,68,68,0.07)", border: "1px solid rgba(255,68,68,0.2)", borderRadius: 8 }}>
                <AlertTriangle size={13} style={{ color: T.error, flexShrink: 0 }} />
                <p style={{ fontSize: 12, color: T.error, margin: 0 }}>{error}</p>
              </div>
            )}

            <button onClick={handleLogin} disabled={loading}
              style={{ padding: "13px", borderRadius: 10, background: T.accent, color: "#000", fontWeight: 700, fontSize: 14, border: "none", cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.5 : 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, fontFamily: T.font }}>
              {loading ? <><Loader2 size={15} style={{ animation: "spin 1s linear infinite" }} /> Signing in...</> : "Sign In →"}
            </button>

            <p style={{ textAlign: "center", fontSize: 12, color: T.muted, margin: 0 }}>
              New here?{" "}
              <button onClick={onSwitchToRegister} style={{ background: "none", border: "none", color: T.accent, cursor: "pointer", fontFamily: T.font, fontSize: 12, padding: 0 }}>
                Create identity
              </button>
            </p>
          </div>
        </div>

        <p style={{ textAlign: "center", fontSize: 10, color: T.muted2, marginTop: 14 }}>
          🔐 Your private key stays on this device only
        </p>
      </div>
    </div>
  );
}
