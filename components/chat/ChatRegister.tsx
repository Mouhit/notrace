"use client";
import { useState } from "react";
import { Users, UserPlus, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import PassphraseSetup from "./PassphraseSetup";
import { generateKeyPair } from "@/lib/chat/crypto";

const T = {
  bg: "#050505",
  card: "#0e0e0e",
  border: "#1a1a1a",
  accent: "#9fff00",
  text: "#f0f0f0",
  muted: "#666",
  font: "'JetBrains Mono', monospace",
};

interface ChatRegisterProps {
  onRegistered: (username: string) => void;
  onSwitchToLogin: () => void;
}

export default function ChatRegister({ onRegistered, onSwitchToLogin }: ChatRegisterProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [usernameError, setUsernameError] = useState("");
  const [keyPairData, setKeyPairData] = useState<{ publicKey: string; privateKey: string } | null>(null);
  const [passphraseModalOpen, setPassphraseModalOpen] = useState(false);

  // Check username availability
  const handleCheckUsername = async (name: string) => {
    if (!name) return true;

    try {
      const res = await fetch("/api/chat/check-username", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: name }),
      });

      const data = await res.json();

      if (!data.available) {
        setUsernameError("Username already taken");
        return false;
      }

      setUsernameError("");
      return true;
    } catch (error) {
      console.error("Username check error:", error);
      setUsernameError("Error checking username");
      return false;
    }
  };

  const handleRegisterClick = async (e: React.FormEvent) => {
    e.preventDefault();
    setUsernameError("");

    // Validate inputs
    if (!username || !password || !confirmPassword) {
      toast.error("Fill all fields");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords don't match");
      return;
    }

    if (password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }

    if (username.length < 3) {
      toast.error("Username must be at least 3 characters");
      return;
    }

    setLoading(true);

    try {
      // ✅ CHECK USERNAME AVAILABILITY FIRST (BEFORE GENERATING KEYS)
      const usernameAvailable = await handleCheckUsername(username);

      if (!usernameAvailable) {
        setLoading(false);
        return; // Don't proceed if username taken
      }

      // ✅ Only if username is available, generate key pair
      const { publicKey, privateKey } = await generateKeyPair();
      setKeyPairData({ publicKey, privateKey });

      // Show passphrase setup modal
      setPassphraseModalOpen(true);
    } catch (error) {
      toast.error("Failed to generate keys");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handlePassphraseSet = async (passphrase: string) => {
    if (!keyPairData) return;

    setLoading(true);

    try {
      const res = await fetch("/api/chat/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username,
          password,
          passphrase,
          publicKey: keyPairData.publicKey,
          privateKey: keyPairData.privateKey,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success("Registration successful!");
        setPassphraseModalOpen(false);
        onRegistered(username);
      } else {
        toast.error(data.error || "Registration failed");
      }
    } catch (error) {
      toast.error("Network error");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: T.bg, display: "flex", alignItems: "center", justifyContent: "center", padding: 20, fontFamily: T.font }}>
      <div style={{ maxWidth: 450, width: "100%" }}>
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 16 }}>
            <Users size={32} style={{ color: T.accent }} />
            <h1 style={{ fontSize: 28, fontWeight: 900, color: T.text, margin: 0 }}>Register</h1>
          </div>
          <p style={{ fontSize: 14, color: T.muted, margin: 0 }}>Create a new P2P chat account</p>
        </div>

        <form onSubmit={handleRegisterClick} style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 16, padding: 32, marginBottom: 20 }}>
          {/* Username Error */}
          {usernameError && (
            <div style={{ background: "rgba(255,68,68,0.1)", border: "1px solid rgba(255,68,68,0.3)", borderRadius: 8, padding: 12, marginBottom: 16, display: "flex", gap: 8, alignItems: "flex-start" }}>
              <AlertCircle size={16} style={{ color: "#ff4444", flexShrink: 0 }} />
              <span style={{ fontSize: 12, color: "#ff4444" }}>{usernameError}</span>
            </div>
          )}

          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 12, color: T.muted, display: "block", marginBottom: 6, textTransform: "uppercase" }}>Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Choose a username..."
              style={{ width: "100%", padding: "10px 12px", background: "#0a0a0a", border: `1px solid ${T.border}`, borderRadius: 8, color: T.text, fontFamily: T.font, fontSize: 13, outline: "none" }}
            />
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 12, color: T.muted, display: "block", marginBottom: 6, textTransform: "uppercase" }}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password..."
              style={{ width: "100%", padding: "10px 12px", background: "#0a0a0a", border: `1px solid ${T.border}`, borderRadius: 8, color: T.text, fontFamily: T.font, fontSize: 13, outline: "none" }}
            />
          </div>

          <div style={{ marginBottom: 24 }}>
            <label style={{ fontSize: 12, color: T.muted, display: "block", marginBottom: 6, textTransform: "uppercase" }}>Confirm Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm password..."
              style={{ width: "100%", padding: "10px 12px", background: "#0a0a0a", border: `1px solid ${T.border}`, borderRadius: 8, color: T.text, fontFamily: T.font, fontSize: 13, outline: "none" }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{ width: "100%", padding: "12px 16px", background: T.accent, color: "#000", border: "none", borderRadius: 8, fontWeight: 700, fontSize: 14, fontFamily: T.font, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, opacity: loading ? 0.6 : 1 }}
          >
            <UserPlus size={16} />
            {loading ? "Registering..." : "Register"}
          </button>
        </form>

        <div style={{ textAlign: "center" }}>
          <p style={{ fontSize: 13, color: T.muted, margin: 0 }}>
            Already have an account?{" "}
            <button
              onClick={onSwitchToLogin}
              style={{ background: "none", border: "none", color: T.accent, cursor: "pointer", fontWeight: 700, fontSize: 13, fontFamily: T.font }}
            >
              Login
            </button>
          </p>
        </div>
      </div>

      <PassphraseSetup isOpen={passphraseModalOpen} onClose={() => setPassphraseModalOpen(false)} onConfirm={handlePassphraseSet} loading={loading} />
    </div>
  );
}
