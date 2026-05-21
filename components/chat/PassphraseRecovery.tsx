"use client";
import { useState } from "react";
import { Key, AlertCircle, Loader2 } from "lucide-react";
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

interface PassphraseRecoveryProps {
  username: string;
  isOpen: boolean;
  onClose: () => void;
  onRecover: (privateKey: string) => Promise<void>;
  onUsernameNotFound?: () => void;  // ✅ NEW: Callback when username not found
}

export default function PassphraseRecovery({ username, isOpen, onClose, onRecover, onUsernameNotFound }: PassphraseRecoveryProps) {
  const [passphrase, setPassphrase] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleRecover = async () => {
    if (!passphrase.trim()) {
      toast.error("Enter your passphrase");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/chat/recover-key", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, passphrase }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success("Private key recovered!");
        await onRecover(data.privateKey);
        onClose();
      } else if (res.status === 404) {
        // ✅ NEW: Handle username not found error
        const errorMsg = "Username not found";
        setError(errorMsg);
        toast.error(errorMsg);
        if (onUsernameNotFound) {
          onUsernameNotFound();
        }
      } else if (res.status === 401) {
        // Invalid passphrase
        const errorMsg = data.error || "Invalid passphrase";
        setError(errorMsg);
        toast.error(errorMsg);
      } else {
        const errorMsg = data.error || "Recovery failed";
        setError(errorMsg);
        toast.error(errorMsg);
      }
    } catch (err) {
      const errorMsg = "Network error";
      setError(errorMsg);
      toast.error(errorMsg);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999, padding: 20 }}>
      <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 16, maxWidth: 500, width: "100%", padding: 32 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
          <Key size={24} style={{ color: T.accent }} />
          <h2 style={{ fontSize: 22, fontWeight: 700, color: T.text, margin: 0 }}>Recover Your Key</h2>
        </div>

        <p style={{ fontSize: 13, color: T.muted, margin: "0 0 12px", lineHeight: 1.6 }}>
          Your private key wasn't found on this device. Enter the passphrase you set during registration to recover it.
        </p>

        <p style={{ fontSize: 12, color: T.accent, margin: "0 0 24px" }}>User: @{username}</p>

        {/* Error Message */}
        {error && (
          <div style={{ background: "rgba(255,68,68,0.1)", border: "1px solid rgba(255,68,68,0.3)", borderRadius: 8, padding: 12, marginBottom: 16, display: "flex", gap: 8, alignItems: "flex-start" }}>
            <AlertCircle size={16} style={{ color: "#ff4444", flexShrink: 0 }} />
            <span style={{ fontSize: 12, color: "#ff4444" }}>{error}</span>
          </div>
        )}

        {/* Passphrase Input */}
        <div style={{ marginBottom: 24 }}>
          <label style={{ fontSize: 12, color: T.muted, display: "block", marginBottom: 6, textTransform: "uppercase" }}>Passphrase</label>
          <input
            type="password"
            value={passphrase}
            onChange={(e) => setPassphrase(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleRecover()}
            placeholder="Enter your recovery passphrase..."
            disabled={loading}
            style={{ width: "100%", padding: "10px 12px", background: "#0a0a0a", border: `1px solid ${T.border}`, borderRadius: 8, color: T.text, fontFamily: T.font, fontSize: 13, outline: "none" }}
          />
        </div>

        {/* Info */}
        <div style={{ background: "rgba(159,255,0,0.08)", border: `1px solid rgba(159,255,0,0.25)`, borderRadius: 8, padding: 12, marginBottom: 24, fontSize: 12, color: T.text }}>
          <p style={{ margin: 0 }}>💡 This is the 12-word passphrase you set during registration, not your login password.</p>
        </div>

        {/* Buttons */}
        <div style={{ display: "flex", gap: 12 }}>
          <button
            onClick={onClose}
            disabled={loading}
            style={{ flex: 1, padding: "12px 16px", borderRadius: 8, background: "transparent", border: `1px solid ${T.border}`, color: T.text, cursor: "pointer", fontFamily: T.font, fontWeight: 700, fontSize: 13 }}
          >
            Cancel
          </button>
          <button
            onClick={handleRecover}
            disabled={loading || !passphrase.trim()}
            style={{ flex: 1, padding: "12px 16px", borderRadius: 8, background: T.accent, color: "#000", border: "none", cursor: "pointer", fontFamily: T.font, fontWeight: 700, fontSize: 13, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, opacity: !passphrase.trim() ? 0.5 : 1 }}
          >
            {loading && <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} />}
            {loading ? "Recovering..." : "Recover Key"}
          </button>
        </div>
      </div>
    </div>
  );
}
