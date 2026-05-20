"use client";
import { useState } from "react";
import { LogIn, UserCheck } from "lucide-react";
import { toast } from "sonner";
import PassphraseRecovery from "./PassphraseRecovery";

const T = {
  bg: "#050505",
  card: "#0e0e0e",
  border: "#1a1a1a",
  accent: "#9fff00",
  text: "#f0f0f0",
  muted: "#666",
  font: "'JetBrains Mono', monospace",
};

interface ChatLoginProps {
  onLoggedIn: (username: string, privateKey: string) => void;
  onSwitchToRegister: () => void;
}

export default function ChatLogin({ onLoggedIn, onSwitchToRegister }: ChatLoginProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassphraseRecovery, setShowPassphraseRecovery] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!username || !password) {
      toast.error("Fill all fields");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/chat/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (res.ok) {
        // Check if private key is in IndexedDB
        const db = await openIndexedDB();
        const storedKey = await getPrivateKeyFromDB(db, username);

        if (storedKey) {
          // Key found locally
          toast.success("Login successful!");
          onLoggedIn(username, storedKey);
        } else {
          // Key not found - need passphrase recovery
          toast.info("Key not found on this device. Please recover with passphrase.");
          setShowPassphraseRecovery(true);
        }
      } else {
        toast.error(data.error || "Login failed");
      }
    } catch (error) {
      toast.error("Network error");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyRecovered = async (privateKey: string) => {
    // Store in IndexedDB
    const db = await openIndexedDB();
    await storePrivateKeyInDB(db, username, privateKey);
    toast.success("Key recovered and saved!");
    onLoggedIn(username, privateKey);
  };

  return (
    <div style={{ minHeight: "100vh", background: T.bg, display: "flex", alignItems: "center", justifyContent: "center", padding: 20, fontFamily: T.font }}>
      <div style={{ maxWidth: 450, width: "100%" }}>
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 16 }}>
            <UserCheck size={32} style={{ color: T.accent }} />
            <h1 style={{ fontSize: 28, fontWeight: 900, color: T.text, margin: 0 }}>Login</h1>
          </div>
          <p style={{ fontSize: 14, color: T.muted, margin: 0 }}>Access your P2P chat account</p>
        </div>

        <form onSubmit={handleLogin} style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 16, padding: 32, marginBottom: 20 }}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 12, color: T.muted, display: "block", marginBottom: 6, textTransform: "uppercase" }}>Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter username..."
              style={{ width: "100%", padding: "10px 12px", background: "#0a0a0a", border: `1px solid ${T.border}`, borderRadius: 8, color: T.text, fontFamily: T.font, fontSize: 13, outline: "none" }}
            />
          </div>

          <div style={{ marginBottom: 24 }}>
            <label style={{ fontSize: 12, color: T.muted, display: "block", marginBottom: 6, textTransform: "uppercase" }}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password..."
              style={{ width: "100%", padding: "10px 12px", background: "#0a0a0a", border: `1px solid ${T.border}`, borderRadius: 8, color: T.text, fontFamily: T.font, fontSize: 13, outline: "none" }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{ width: "100%", padding: "12px 16px", background: T.accent, color: "#000", border: "none", borderRadius: 8, fontWeight: 700, fontSize: 14, fontFamily: T.font, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, opacity: loading ? 0.6 : 1 }}
          >
            <LogIn size={16} />
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <div style={{ textAlign: "center" }}>
          <p style={{ fontSize: 13, color: T.muted, margin: 0 }}>
            Don't have an account?{" "}
            <button
              onClick={onSwitchToRegister}
              style={{ background: "none", border: "none", color: T.accent, cursor: "pointer", fontWeight: 700, fontSize: 13, fontFamily: T.font }}
            >
              Register
            </button>
          </p>
        </div>
      </div>

      <PassphraseRecovery username={username} isOpen={showPassphraseRecovery} onClose={() => setShowPassphraseRecovery(false)} onRecover={handleKeyRecovered} />
    </div>
  );
}

// IndexedDB helpers
async function openIndexedDB() {
  return new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open("NoTraceChat", 1);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains("keys")) {
        db.createObjectStore("keys");
      }
    };
  });
}

async function getPrivateKeyFromDB(db: IDBDatabase, username: string): Promise<string | null> {
  return new Promise((resolve, reject) => {
    const tx = db.transaction("keys", "readonly");
    const store = tx.objectStore("keys");
    const request = store.get(username);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result || null);
  });
}

async function storePrivateKeyInDB(db: IDBDatabase, username: string, privateKey: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const tx = db.transaction("keys", "readwrite");
    const store = tx.objectStore("keys");
    const request = store.put(privateKey, username);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}
