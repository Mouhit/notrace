"use client";
import { useState, useEffect } from "react";
import { Eye, EyeOff, Copy, CheckCircle2, Loader2, Shield, RefreshCw, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import {
  generateMnemonic, mnemonicToSeed, generateKeypair,
  hashPassword, saveChatIdentity, STORAGE_KEYS,
} from "@/lib/chat/crypto";

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
  onSwitchToLogin: () => void;
}

type Step = "form" | "mnemonic" | "confirm" | "registering";

export default function ChatRegister({ onSuccess, onSwitchToLogin }: Props) {
  const [step, setStep] = useState<Step>("form");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [mnemonic, setMnemonic] = useState("");
  const [mnemonicInput, setMnemonicInput] = useState("");
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [usernameError, setUsernameError] = useState("");

  useEffect(() => {
    if (!username) { setUsernameError(""); return; }
    if (!/^[a-zA-Z0-9_]{3,20}$/.test(username))
      setUsernameError("3-20 chars, letters/numbers/underscore only");
    else setUsernameError("");
  }, [username]);

  const handleFormSubmit = async () => {
    setError("");
    if (!username.trim()) { setError("Username required"); return; }
    if (usernameError) { setError(usernameError); return; }
    if (password.length < 8) { setError("Password must be at least 8 characters"); return; }
    if (password !== confirmPw) { setError("Passwords don't match"); return; }
    setLoading(true);
    try {
      const phrase = await generateMnemonic();
      setMnemonic(phrase);
      setStep("mnemonic");
    } catch { setError("Failed to generate recovery phrase"); }
    finally { setLoading(false); }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(mnemonic);
    setCopied(true); toast.success("Recovery phrase copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRegen = async () => {
    setMnemonic(await generateMnemonic()); setCopied(false);
  };

  const handleRegister = async () => {
    setError("");
    if (mnemonicInput.trim().toLowerCase() !== mnemonic.toLowerCase()) {
      setError("Recovery phrase doesn't match. Please check and try again."); return;
    }
    setStep("registering");
    try {
      const seed = await mnemonicToSeed(mnemonic);
      const keypair = await generateKeypair(seed);
      const pwHash = await hashPassword(password, username);
      const res = await fetch("/api/chat/register", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: username.trim(), password_hash: pwHash, public_key: keypair.publicKey }),
      });
      const data = await res.json();
      if (!res.ok) { setStep("form"); setError(data.error || "Registration failed"); return; }
      saveChatIdentity(username.trim(), keypair);
      localStorage.removeItem(STORAGE_KEYS.mnemonic);
      toast.success("Identity created! Welcome to NoTrace Chat.");
      onSuccess(username.trim());
    } catch { setStep("form"); setError("Registration failed. Please try again."); }
  };

  const words = mnemonic.split(" ").filter(Boolean);

  return (
    <div style={{ minHeight: "100vh", background: T.bg, display: "flex", alignItems: "center", justifyContent: "center", padding: 20, fontFamily: T.font }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&display=swap');
        .chat-inp:focus { border-color: ${T.accent} !important; box-shadow: 0 0 0 2px rgba(159,255,0,0.1) !important; }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeUp { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        .fade-up { animation: fadeUp 0.35s ease forwards; }
      `}</style>

      <div className="fade-up" style={{ width: "100%", maxWidth: 460 }}>

        {/* Logo + title */}
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{ width: 52, height: 52, borderRadius: 14, background: T.accentDim, border: `1px solid ${T.accentBorder}`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px" }}>
            <Shield style={{ color: T.accent }} size={24} />
          </div>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: T.text, margin: "0 0 5px" }}>
            {step === "form" && "Create Identity"}
            {step === "mnemonic" && "Save Recovery Phrase"}
            {(step === "confirm" || step === "registering") && "Confirm & Create"}
          </h1>
          <p style={{ fontSize: 12, color: T.muted, margin: 0 }}>
            {step === "form" && "Your keys. Your identity. Zero server knowledge."}
            {step === "mnemonic" && "These 12 words are your ONLY account recovery method."}
            {step === "confirm" && "Type your phrase to prove you saved it."}
            {step === "registering" && "Generating cryptographic identity..."}
          </p>
        </div>

        <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 18, padding: 26 }}>

          {/* ── STEP 1: Username + Password ── */}
          {step === "form" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <label style={{ fontSize: 10, color: T.muted, textTransform: "uppercase", letterSpacing: "0.1em", display: "block", marginBottom: 7 }}>Username</label>
                <input className="chat-inp" style={inp} placeholder="your_username" value={username}
                  onChange={(e) => setUsername(e.target.value.slice(0, 20))} autoComplete="off" spellCheck={false} />
                {usernameError && <p style={{ fontSize: 11, color: T.error, marginTop: 5 }}>{usernameError}</p>}
              </div>
              <div>
                <label style={{ fontSize: 10, color: T.muted, textTransform: "uppercase", letterSpacing: "0.1em", display: "block", marginBottom: 7 }}>Password</label>
                <div style={{ position: "relative" }}>
                  <input className="chat-inp" style={{ ...inp, paddingRight: 44 }} type={showPw ? "text" : "password"}
                    placeholder="Min. 8 characters" value={password} onChange={(e) => setPassword(e.target.value)} />
                  <button onClick={() => setShowPw(!showPw)} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: T.muted }}>
                    {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>
              <div>
                <label style={{ fontSize: 10, color: T.muted, textTransform: "uppercase", letterSpacing: "0.1em", display: "block", marginBottom: 7 }}>Confirm Password</label>
                <input className="chat-inp" style={inp} type="password" placeholder="Repeat password" value={confirmPw}
                  onChange={(e) => setConfirmPw(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleFormSubmit()} />
              </div>

              {error && (
                <div style={{ display: "flex", gap: 8, alignItems: "center", padding: "9px 12px", background: "rgba(255,68,68,0.07)", border: "1px solid rgba(255,68,68,0.2)", borderRadius: 8 }}>
                  <AlertTriangle size={13} style={{ color: T.error, flexShrink: 0 }} />
                  <p style={{ fontSize: 12, color: T.error, margin: 0 }}>{error}</p>
                </div>
              )}

              <button onClick={handleFormSubmit} disabled={loading || !!usernameError}
                style={{ padding: "13px", borderRadius: 10, background: T.accent, color: "#000", fontWeight: 700, fontSize: 14, border: "none", cursor: "pointer", opacity: (loading || !!usernameError) ? 0.5 : 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, fontFamily: T.font }}>
                {loading ? <><Loader2 size={15} style={{ animation: "spin 1s linear infinite" }} /> Generating...</> : "Continue →"}
              </button>

              <p style={{ textAlign: "center", fontSize: 12, color: T.muted, margin: 0 }}>
                Already registered?{" "}
                <button onClick={onSwitchToLogin} style={{ background: "none", border: "none", color: T.accent, cursor: "pointer", fontFamily: T.font, fontSize: 12, padding: 0 }}>Sign in</button>
              </p>
            </div>
          )}

          {/* ── STEP 2: Show Mnemonic ── */}
          {step === "mnemonic" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={{ padding: "10px 14px", background: "rgba(159,255,0,0.05)", border: `1px solid ${T.accentBorder}`, borderRadius: 8 }}>
                <p style={{ fontSize: 12, color: T.accent, margin: 0, lineHeight: 1.65 }}>
                  ⚠️ Write these 12 words down in order. This phrase is generated locally and <strong>never sent to any server.</strong>
                </p>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 7 }}>
                {words.map((word, i) => (
                  <div key={i} style={{ padding: "7px 10px", background: "#0a0a0a", border: `1px solid ${T.border}`, borderRadius: 7, display: "flex", gap: 7, alignItems: "center" }}>
                    <span style={{ fontSize: 9, color: T.muted2, minWidth: 14, fontFamily: T.font }}>{i + 1}.</span>
                    <span style={{ fontSize: 12, color: T.text, fontWeight: 600, fontFamily: T.font }}>{word}</span>
                  </div>
                ))}
              </div>

              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={handleCopy} style={{ flex: 1, padding: "10px", borderRadius: 9, background: T.accentDim, border: `1px solid ${T.accentBorder}`, color: T.accent, fontSize: 12, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, fontFamily: T.font }}>
                  {copied ? <><CheckCircle2 size={13} /> Copied!</> : <><Copy size={13} /> Copy phrase</>}
                </button>
                <button onClick={handleRegen} style={{ padding: "10px 13px", borderRadius: 9, background: "#0a0a0a", border: `1px solid ${T.border}`, color: T.muted, cursor: "pointer", display: "flex", alignItems: "center", gap: 5, fontFamily: T.font, fontSize: 12 }}>
                  <RefreshCw size={13} /> New
                </button>
              </div>

              <button onClick={() => setStep("confirm")} style={{ padding: "13px", borderRadius: 10, background: T.accent, color: "#000", fontWeight: 700, fontSize: 14, border: "none", cursor: "pointer", fontFamily: T.font }}>
                I've saved it → Confirm
              </button>
              <button onClick={() => setStep("form")} style={{ background: "none", border: "none", color: T.muted, fontSize: 12, cursor: "pointer", fontFamily: T.font }}>← Back</button>
            </div>
          )}

          {/* ── STEP 3: Confirm Mnemonic ── */}
          {step === "confirm" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <p style={{ fontSize: 13, color: T.muted, margin: 0 }}>Type your 12-word recovery phrase to confirm:</p>
              <textarea className="chat-inp" style={{ ...inp, minHeight: 96, resize: "vertical", lineHeight: 1.7 }}
                placeholder="word1 word2 word3 ... word12"
                value={mnemonicInput} onChange={(e) => setMnemonicInput(e.target.value)} spellCheck={false} />

              {error && (
                <div style={{ display: "flex", gap: 8, alignItems: "center", padding: "9px 12px", background: "rgba(255,68,68,0.07)", border: "1px solid rgba(255,68,68,0.2)", borderRadius: 8 }}>
                  <AlertTriangle size={13} style={{ color: T.error, flexShrink: 0 }} />
                  <p style={{ fontSize: 12, color: T.error, margin: 0 }}>{error}</p>
                </div>
              )}

              <button onClick={handleRegister} disabled={!mnemonicInput.trim()}
                style={{ padding: "13px", borderRadius: 10, background: T.accent, color: "#000", fontWeight: 700, fontSize: 14, border: "none", cursor: "pointer", opacity: !mnemonicInput.trim() ? 0.4 : 1, fontFamily: T.font }}>
                ✓ Create Identity
              </button>
              <button onClick={() => { setStep("mnemonic"); setError(""); }} style={{ background: "none", border: "none", color: T.muted, fontSize: 12, cursor: "pointer", fontFamily: T.font }}>← Back to phrase</button>
            </div>
          )}

          {/* ── STEP 4: Registering ── */}
          {step === "registering" && (
            <div style={{ textAlign: "center", padding: "24px 0" }}>
              <Loader2 size={36} style={{ color: T.accent, animation: "spin 1s linear infinite", display: "block", margin: "0 auto 16px" }} />
              <p style={{ color: T.muted, fontSize: 14, margin: "0 0 6px" }}>Generating cryptographic identity...</p>
              <p style={{ color: T.muted2, fontSize: 11 }}>Private key never leaves this device.</p>
            </div>
          )}
        </div>

        <p style={{ textAlign: "center", fontSize: 10, color: T.muted2, marginTop: 14, lineHeight: 1.6 }}>
          🔐 Ed25519 keypair · BIP39 recovery · Zero-knowledge · Local-only private key
        </p>
      </div>
    </div>
  );
}
