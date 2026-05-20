"use client";
import { useState } from "react";
import { Lock, AlertCircle } from "lucide-react";
import { toast } from "sonner";

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
  const [strength, setStrength] = useState<"weak" | "medium" | "strong">("weak");

  const calculateStrength = (value: string) => {
    if (value.length < 12) return "weak";
    if (value.length < 20 || !/[A-Z]/.test(value) || !/[0-9]/.test(value)) return "medium";
    return "strong";
  };

  const handlePassphraseChange = (value: string) => {
    setPassphrase(value);
    setStrength(calculateStrength(value));
  };

  const handleConfirm = async () => {
    if (passphrase !== confirmPassphrase) {
      toast.error("Passphrases don't match");
      return;
    }

    if (passphrase.length < 12) {
      toast.error("Passphrase must be at least 12 characters");
      return;
    }

    await onConfirm(passphrase);
  };

  if (!isOpen) return null;

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999, padding: 20 }}>
      <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 16, maxWidth: 500, width: "100%", padding: 32 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
          <Lock size={24} style={{ color: T.accent }} />
          <h2 style={{ fontSize: 22, fontWeight: 700, color: T.text, margin: 0 }}>Set Recovery Passphrase</h2>
        </div>

        <p style={{ fontSize: 13, color: T.muted, margin: "0 0 24px", lineHeight: 1.6 }}>
          This passphrase encrypts your private key for recovery on other devices.
        </p>

        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 12, color: T.muted, display: "block", marginBottom: 6, textTransform: "uppercase" }}>Passphrase</label>
          <input
            type="password"
            value={passphrase}
            onChange={(e) => handlePassphraseChange(e.target.value)}
            placeholder="Enter a strong passphrase..."
            style={{ width: "100%", padding: "10px 12px", background: "#0a0a0a", border: `1px solid ${T.border}`, borderRadius: 8, color: T.text, fontFamily: T.font, fontSize: 13, outline: "none" }}
          />
          <div style={{ display: "flex", gap: 4, marginTop: 8 }}>
            {["weak", "medium", "strong"].map((level) => (
              <div key={level} style={{ flex: 1, height: 4, background: strength === level ? (level === "strong" ? "#4ade80" : level === "medium" ? T.accent : "#ff4444") : "#1a1a1a", borderRadius: 2 }} />
            ))}
          </div>
          <p style={{ fontSize: 11, color: T.muted, margin: "6px 0 0" }}>Strength: {strength === "weak" ? "Weak" : strength === "medium" ? "Medium" : "Strong"}</p>
        </div>

        <div style={{ marginBottom: 24 }}>
          <label style={{ fontSize: 12, color: T.muted, display: "block", marginBottom: 6, textTransform: "uppercase" }}>Confirm Passphrase</label>
          <input
            type="password"
            value={confirmPassphrase}
            onChange={(e) => setConfirmPassphrase(e.target.value)}
            placeholder="Confirm your passphrase..."
            style={{ width: "100%", padding: "10px 12px", background: "#0a0a0a", border: `1px solid ${T.border}`, borderRadius: 8, color: T.text, fontFamily: T.font, fontSize: 13, outline: "none" }}
          />
        </div>

        <div style={{ background: "rgba(159,255,0,0.08)", border: `1px solid rgba(159,255,0,0.25)`, borderRadius: 8, padding: 12, marginBottom: 24, fontSize: 12, color: T.text }}>
          <p style={{ margin: 0, marginBottom: 8, display: "flex", alignItems: "center", gap: 6 }}>
            <AlertCircle size={14} style={{ color: T.accent }} />
            Requirements:
          </p>
          <ul style={{ margin: 0, paddingLeft: 20, fontSize: 11, color: T.muted }}>
            <li>At least 12 characters</li>
            <li>Mix of uppercase, lowercase, numbers</li>
            <li>Cannot be changed later</li>
          </ul>
        </div>

        <div style={{ display: "flex", gap: 12 }}>
          <button onClick={onClose} disabled={loading} style={{ flex: 1, padding: "12px 16px", borderRadius: 8, background: "transparent", border: `1px solid ${T.border}`, color: T.text, cursor: "pointer", fontFamily: T.font, fontWeight: 700, fontSize: 13 }}>
            Cancel
          </button>
          <button onClick={handleConfirm} disabled={loading || passphrase.length < 12} style={{ flex: 1, padding: "12px 16px", borderRadius: 8, background: T.accent, color: "#000", border: "none", cursor: "pointer", fontFamily: T.font, fontWeight: 700, fontSize: 13, opacity: passphrase.length < 12 ? 0.5 : 1 }}>
            {loading ? "Setting..." : "Set Passphrase"}
          </button>
        </div>
      </div>
    </div>
  );
}
