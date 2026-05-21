"use client";
import { useState, useEffect } from "react";
import { Lock, Copy, RefreshCw, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { generateRandomPassphrase, isValid12WordPassphrase } from "@/lib/chat/word-list";

const T = {
  bg: "#050505",
  card: "#0e0e0e",
  border: "#1a1a1a",
  accent: "#9fff00",
  text: "#f0f0f0",
  muted: "#666",
  font: "'JetBrains Mono', monospace",
};

interface PassphraseSetupProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (passphrase: string) => Promise<void>;
  loading?: boolean;
}

export default function PassphraseSetup({ isOpen, onClose, onConfirm, loading }: PassphraseSetupProps) {
  const [passphrase, setPassphrase] = useState("");
  const [confirmPassphrase, setConfirmPassphrase] = useState("");
  const [copied, setCopied] = useState(false);
  const [mode, setMode] = useState<"generate" | "manual">("generate");

  useEffect(() => {
    if (isOpen && !passphrase) {
      const generated = generateRandomPassphrase();
      setPassphrase(generated);
    }
  }, [isOpen, passphrase]);

  const handleCopyPassphrase = () => {
    navigator.clipboard.writeText(passphrase);
    setCopied(true);
    toast.success("Passphrase copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRegeneratePassphrase = () => {
    const generated = generateRandomPassphrase();
    setPassphrase(generated);
    setConfirmPassphrase("");
    toast.info("New passphrase generated");
  };

  const handleConfirm = async () => {
    if (mode === "generate") {
      if (!confirmPassphrase.trim()) {
        toast.error("Please confirm you have saved the passphrase");
        return;
      }
      if (confirmPassphrase !== passphrase) {
        toast.error("Passphrase doesn't match. Please re-enter or use manual mode.");
        return;
      }
    } else {
      if (passphrase !== confirmPassphrase) {
        toast.error("Passphrases don't match");
        return;
      }
      if (!isValid12WordPassphrase(passphrase)) {
        toast.error("Passphrase must be exactly 12 words");
        return;
      }
    }
    await onConfirm(passphrase);
  };

  if (!isOpen) return null;

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999, padding: 20 }}>
      <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 16, maxWidth: 600, width: "100%", padding: 32 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
          <Lock size={24} style={{ color: T.accent }} />
          <h2 style={{ fontSize: 22, fontWeight: 700, color: T.text, margin: 0 }}>Your Recovery Passphrase</h2>
        </div>

        <p style={{ fontSize: 13, color: T.muted, margin: "0 0 24px", lineHeight: 1.6 }}>
          We've generated a random 12-word passphrase. Save it somewhere safe - you'll need it to recover your account on other devices.
        </p>

        <div style={{ display: "flex", gap: 12, marginBottom: 24, borderBottom: `1px solid ${T.border}`, paddingBottom: 12 }}>
          <button onClick={() => setMode("generate")} style={{ padding: "8px 16px", background: mode === "generate" ? T.accent : "transparent", color: mode === "generate" ? "#000" : T.muted, border: "none", borderRadius: 8, cursor: "pointer", fontSize: 12, fontFamily: T.font, fontWeight: 700 }}>
            Auto-Generated
          </button>
          <button onClick={() => setMode("manual")} style={{ padding: "8px 16px", background: mode === "manual" ? T.accent : "transparent", color: mode === "manual" ? "#000" : T.muted, border: "none", borderRadius: 8, cursor: "pointer", fontSize: 12, fontFamily: T.font, fontWeight: 700 }}>
            Manual Entry
          </button>
        </div>

        {mode === "generate" && (
          <>
            <div style={{ background: "#0a0a0a", border: `2px solid ${T.accent}`, borderRadius: 12, padding: 16, marginBottom: 16 }}>
              <p style={{ fontSize: 11, color: T.muted, textTransform: "uppercase", margin: "0 0 12px" }}>Your Passphrase (12 Words)</p>
              <p style={{ fontSize: 13, color: T.accent, fontWeight: 600, lineHeight: 1.8, margin: 0, wordBreak: "break-all", fontFamily: T.font }}>{passphrase}</p>
            </div>

            <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
              <button onClick={handleCopyPassphrase} style={{ flex: 1, padding: "10px 16px", background: "transparent", border: `1px solid ${T.border}`, borderRadius: 8, color: T.text, cursor: "pointer", fontSize: 12, fontFamily: T.font, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                <Copy size={14} />
                {copied ? "Copied!" : "Copy"}
              </button>
              <button onClick={handleRegeneratePassphrase} style={{ flex: 1, padding: "10px 16px", background: "transparent", border: `1px solid ${T.border}`, borderRadius: 8, color: T.text, cursor: "pointer", fontSize: 12, fontFamily: T.font, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                <RefreshCw size={14} />
                Regenerate
              </button>
            </div>

            <div style={{ marginBottom: 24 }}>
              <label style={{ fontSize: 12, color: T.muted, display: "block", marginBottom: 6, textTransform: "uppercase" }}>Confirm: Re-enter the passphrase above</label>
              <input type="password" value={confirmPassphrase} onChange={(e) => setConfirmPassphrase(e.target.value)} placeholder="Paste or re-enter the passphrase..." style={{ width: "100%", padding: "10px 12px", background: "#0a0a0a", border: `1px solid ${T.border}`, borderRadius: 8, color: T.text, fontFamily: T.font, fontSize: 13, outline: "none" }} />
            </div>

            <div style={{ background: "rgba(159,255,0,0.08)", border: `1px solid rgba(159,255,0,0.25)`, borderRadius: 8, padding: 12, marginBottom: 24, fontSize: 12, color: T.text }}>
              <p style={{ margin: 0, marginBottom: 8, display: "flex", alignItems: "center", gap: 6 }}>
                <AlertCircle size={14} style={{ color: T.accent }} />
                Save this passphrase:
              </p>
              <ul style={{ margin: 0, paddingLeft: 20, fontSize: 11, color: T.muted }}>
                <li>Write it down on paper</li>
                <li>Store in a password manager</li>
                <li>Never share with anyone</li>
                <li>Cannot be changed or reset</li>
              </ul>
            </div>
          </>
        )}

        {mode === "manual" && (
          <>
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 12, color: T.muted, display: "block", marginBottom: 6, textTransform: "uppercase" }}>Passphrase (12 words)</label>
              <input type="password" value={passphrase} onChange={(e) => setPassphrase(e.target.value)} placeholder="Enter 12 words separated by spaces..." style={{ width: "100%", padding: "10px 12px", background: "#0a0a0a", border: `1px solid ${T.border}`, borderRadius: 8, color: T.text, fontFamily: T.font, fontSize: 13, outline: "none" }} />
            </div>

            <div style={{ marginBottom: 24 }}>
              <label style={{ fontSize: 12, color: T.muted, display: "block", marginBottom: 6, textTransform: "uppercase" }}>Confirm Passphrase</label>
              <input type="password" value={confirmPassphrase} onChange={(e) => setConfirmPassphrase(e.target.value)} placeholder="Confirm your passphrase..." style={{ width: "100%", padding: "10px 12px", background: "#0a0a0a", border: `1px solid ${T.border}`, borderRadius: 8, color: T.text, fontFamily: T.font, fontSize: 13, outline: "none" }} />
            </div>

            <div style={{ background: "rgba(159,255,0,0.08)", border: `1px solid rgba(159,255,0,0.25)`, borderRadius: 8, padding: 12, marginBottom: 24, fontSize: 12, color: T.text }}>
              <p style={{ margin: 0, display: "flex", alignItems: "center", gap: 6 }}>
                <AlertCircle size={14} style={{ color: T.accent }} />
                Must be exactly 12 words
              </p>
            </div>
          </>
        )}

        <div style={{ display: "flex", gap: 12 }}>
          <button onClick={onClose} disabled={loading} style={{ flex: 1, padding: "12px 16px", borderRadius: 8, background: "transparent", border: `1px solid ${T.border}`, color: T.text, cursor: "pointer", fontFamily: T.font, fontWeight: 700, fontSize: 13 }}>
            Cancel
          </button>
          <button onClick={handleConfirm} disabled={loading || !passphrase || (mode === "generate" && passphrase !== confirmPassphrase)} style={{ flex: 1, padding: "12px 16px", borderRadius: 8, background: T.accent, color: "#000", border: "none", cursor: "pointer", fontFamily: T.font, fontWeight: 700, fontSize: 13, opacity: loading || !passphrase ? 0.5 : 1 }}>
            {loading ? "Setting..." : "Continue"}
          </button>
        </div>
      </div>
    </div>
  );
}
