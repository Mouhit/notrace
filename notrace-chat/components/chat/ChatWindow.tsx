"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { Send, Mic, MicOff, PhoneOff, Shield, Wifi, WifiOff, Search, QrCode, ChevronLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useWebRTCChat, ChatMessage } from "@/lib/chat/useWebRTCChat";
import { useShakeDetector } from "@/lib/chat/useShakeDetector";
import VaultLocked from "./VaultLocked";

const T = {
  bg: "#050505", card: "#0e0e0e", border: "#1a1a1a",
  accent: "#9fff00", accentDim: "rgba(159,255,0,0.12)",
  accentBorder: "rgba(159,255,0,0.25)", text: "#f0f0f0",
  muted: "#666", muted2: "#333", font: "'JetBrains Mono', monospace",
  msgSent: "rgba(159,255,0,0.1)", msgRecv: "#111",
};

const EPHEMERAL_DELAY = 10000 + Math.random() * 5000; // 10-15s random

interface EphemeralMessage extends ChatMessage {
  visible: boolean;
  expiresAt: number;
}

interface Props {
  username: string;
  onLogout: () => void;
}

// ── Discovery Panel ─────────────────────────────────────────────────────────
function DiscoveryPanel({ onStartChat }: { onStartChat: (remote: string) => void }) {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ username: string; public_key: string } | null>(null);
  const [notFound, setNotFound] = useState(false);

  const handleSearch = async () => {
    if (!query.trim() || query.trim().length < 3) return;
    setLoading(true); setResult(null); setNotFound(false);
    try {
      const res = await fetch(`/api/chat/discover?username=${encodeURIComponent(query.trim())}`);
      const data = await res.json();
      if (data.found) setResult(data);
      else setNotFound(true);
    } catch { toast.error("Search failed"); }
    finally { setLoading(false); }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ display: "flex", gap: 8 }}>
        <input
          style={{ flex: 1, padding: "11px 14px", background: "#0a0a0a", border: `1px solid ${T.border}`, borderRadius: 10, color: T.text, fontSize: 14, fontFamily: T.font, outline: "none" }}
          placeholder="Search username..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
        />
        <button onClick={handleSearch} disabled={loading}
          style={{ padding: "11px 16px", borderRadius: 10, background: T.accent, color: "#000", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 6, fontFamily: T.font, fontSize: 13, fontWeight: 700 }}>
          {loading ? <Loader2 size={15} style={{ animation: "spin 1s linear infinite" }} /> : <Search size={15} />}
        </button>
      </div>

      {result && (
        <div style={{ padding: "14px 16px", background: T.accentDim, border: `1px solid ${T.accentBorder}`, borderRadius: 12 }}>
          <p style={{ fontSize: 14, fontWeight: 700, color: T.accent, margin: "0 0 4px", fontFamily: T.font }}>@{result.username}</p>
          <p style={{ fontSize: 11, color: T.muted, margin: "0 0 12px", fontFamily: T.font, wordBreak: "break-all" }}>
            🔑 {result.public_key.slice(0, 32)}...
          </p>
          <button onClick={() => onStartChat(result.username)}
            style={{ padding: "9px 18px", borderRadius: 9, background: T.accent, color: "#000", fontWeight: 700, fontSize: 13, border: "none", cursor: "pointer", fontFamily: T.font }}>
            Start Secure Chat →
          </button>
        </div>
      )}

      {notFound && (
        <p style={{ fontSize: 13, color: T.muted, textAlign: "center" }}>No user found with that username.</p>
      )}
    </div>
  );
}

// ── Message Bubble ──────────────────────────────────────────────────────────
function MessageBubble({ msg, isSelf, timeLeft }: { msg: EphemeralMessage; isSelf: boolean; timeLeft: number }) {
  const progress = Math.max(0, timeLeft / EPHEMERAL_DELAY);
  const isUrgent = timeLeft < 3000;

  return (
    <div style={{
      display: "flex", flexDirection: "column",
      alignItems: isSelf ? "flex-end" : "flex-start",
      opacity: msg.visible ? 1 : 0,
      transition: "opacity 0.5s ease",
      marginBottom: 12,
    }}>
      <div style={{
        maxWidth: "75%", padding: "10px 14px",
        background: isSelf ? T.msgSent : T.msgRecv,
        border: `1px solid ${isSelf ? T.accentBorder : T.border}`,
        borderRadius: isSelf ? "14px 14px 4px 14px" : "14px 14px 14px 4px",
      }}>
        {!isSelf && (
          <p style={{ fontSize: 10, color: T.accent, margin: "0 0 4px", fontFamily: T.font }}>@{msg.from}</p>
        )}
        <p style={{ fontSize: 14, color: T.text, margin: 0, lineHeight: 1.5, fontFamily: T.font, wordBreak: "break-word" }}>
          {msg.text}
        </p>
      </div>

      {/* Ephemeral progress bar */}
      <div style={{ width: "75%", height: 2, background: T.muted2, borderRadius: 99, marginTop: 4, overflow: "hidden" }}>
        <div style={{
          height: "100%", borderRadius: 99,
          background: isUrgent ? "#ff4444" : T.accent,
          width: `${progress * 100}%`,
          transition: "width 0.1s linear, background 0.3s ease",
        }} />
      </div>
      <p style={{ fontSize: 9, color: T.muted, marginTop: 2, fontFamily: T.font }}>
        {isUrgent ? "⚠️ " : ""}{Math.ceil(timeLeft / 1000)}s
      </p>
    </div>
  );
}

// ── Main Chat Window ─────────────────────────────────────────────────────────
export default function ChatWindow({ username, onLogout }: Props) {
  const [view, setView] = useState<"discover" | "chat">("discover");
  const [remoteUsername, setRemoteUsername] = useState("");
  const [messages, setMessages] = useState<EphemeralMessage[]>([]);
  const [input, setInput] = useState("");
  const [vaultLocked, setVaultLocked] = useState(false);
  const [recording, setRecording] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const timersRef = useRef<Map<string, NodeJS.Timeout>>(new Map());
  const [timers, setTimers] = useState<Map<string, number>>(new Map());

  const roomId = [username, remoteUsername].sort().join(":");

  // ── Ephemeral message management ──────────────────────────────────────────
  const addMessage = useCallback((msg: ChatMessage) => {
    const ephemeral: EphemeralMessage = {
      ...msg, visible: true, expiresAt: Date.now() + EPHEMERAL_DELAY,
    };

    setMessages((prev) => [...prev, ephemeral]);
    setTimers((prev) => new Map(prev).set(msg.id, EPHEMERAL_DELAY));

    // Countdown timer
    const interval = setInterval(() => {
      setTimers((prev) => {
        const next = new Map(prev);
        const remaining = (next.get(msg.id) ?? 0) - 100;
        if (remaining <= 0) {
          next.delete(msg.id);
          clearInterval(interval);
          timersRef.current.delete(msg.id);
          // Fade out then remove
          setMessages((m) => m.map((x) => x.id === msg.id ? { ...x, visible: false } : x));
          setTimeout(() => setMessages((m) => m.filter((x) => x.id !== msg.id)), 500);
        } else {
          next.set(msg.id, remaining);
        }
        return next;
      });
    }, 100);

    timersRef.current.set(msg.id, interval);
  }, []);

  // ── Shake to Ghost ────────────────────────────────────────────────────────
  useShakeDetector({
    threshold: 25,
    onShake: useCallback(() => {
      // Clear all timers and messages
      timersRef.current.forEach((t) => clearInterval(t));
      timersRef.current.clear();
      setMessages([]);
      setTimers(new Map());
      setVaultLocked(true);
    }, []),
  });

  // ── WebRTC ────────────────────────────────────────────────────────────────
  const { isConnected, sendMessage, destroy } = useWebRTCChat({
    roomId,
    localUsername: username,
    remoteUsername,
    onMessage: addMessage,
    onConnectionChange: (state) => {
      if (state === "failed") toast.error("Connection lost");
    },
  });

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      timersRef.current.forEach((t) => clearInterval(t));
      destroy();
    };
  }, [destroy]);

  const handleSend = () => {
    if (!input.trim() || !isConnected) return;
    const result = sendMessage(input.trim(), username);
    if (result) {
      addMessage(result as ChatMessage);
      setInput("");
    }
  };

  // ── Voice recording ───────────────────────────────────────────────────────
  const handleVoiceToggle = async () => {
    if (recording) {
      mediaRecorderRef.current?.stop();
      setRecording(false);
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream);
      const chunks: Blob[] = [];
      mr.ondataavailable = (e) => chunks.push(e.data);
      mr.onstop = () => {
        const blob = new Blob(chunks, { type: "audio/webm" });
        const url = URL.createObjectURL(blob);
        if (isConnected) {
          const voiceMsg: ChatMessage = {
            id: `${Date.now()}-voice`,
            from: username,
            text: "🎤 Voice note",
            timestamp: Date.now(),
            isVoice: true,
            audioUrl: url,
          };
          sendMessage(JSON.stringify(voiceMsg), username);
          addMessage(voiceMsg);
        }
        stream.getTracks().forEach((t) => t.stop());
      };
      mr.start();
      mediaRecorderRef.current = mr;
      setRecording(true);
      // Auto-stop after 60s
      setTimeout(() => { mr.state === "recording" && mr.stop(); setRecording(false); }, 60000);
    } catch {
      toast.error("Microphone access denied");
    }
  };

  const handleStartChat = (remote: string) => {
    if (remote === username) { toast.error("Can't chat with yourself"); return; }
    setRemoteUsername(remote);
    setMessages([]);
    setView("chat");
  };

  const handleLeave = () => {
    destroy();
    setMessages([]);
    setRemoteUsername("");
    setView("discover");
  };

  if (vaultLocked) {
    return <VaultLocked username={username} onUnlock={() => setVaultLocked(false)} />;
  }

  return (
    <div style={{ height: "100vh", background: T.bg, display: "flex", flexDirection: "column", fontFamily: T.font }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&display=swap');
        @keyframes spin { to { transform: rotate(360deg); } }
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 3px; }
        ::-webkit-scrollbar-thumb { background: ${T.muted2}; border-radius: 99px; }
      `}</style>

      {/* ── Header ── */}
      <div style={{ padding: "14px 18px", borderBottom: `1px solid ${T.border}`, display: "flex", alignItems: "center", justifyContent: "space-between", background: T.card }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {view === "chat" && (
            <button onClick={handleLeave} style={{ background: "none", border: "none", cursor: "pointer", color: T.muted, padding: 0, display: "flex" }}>
              <ChevronLeft size={20} />
            </button>
          )}
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: T.accent }} />
            <span style={{ fontSize: 13, fontWeight: 700, color: T.text }}>
              {view === "chat" ? `@${remoteUsername}` : "NoTrace Chat"}
            </span>
          </div>
          {view === "chat" && (
            <div style={{ display: "flex", alignItems: "center", gap: 5, padding: "3px 8px", borderRadius: 6, background: isConnected ? "rgba(159,255,0,0.08)" : "rgba(255,68,68,0.08)", border: `1px solid ${isConnected ? T.accentBorder : "rgba(255,68,68,0.2)"}` }}>
              {isConnected ? <Wifi size={11} style={{ color: T.accent }} /> : <WifiOff size={11} style={{ color: "#ff4444" }} />}
              <span style={{ fontSize: 10, color: isConnected ? T.accent : "#ff4444" }}>
                {isConnected ? "P2P" : "Connecting..."}
              </span>
            </div>
          )}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 11, color: T.muted }}>@{username}</span>
          {view === "chat" && (
            <button onClick={handleLeave} style={{ background: "none", border: "none", cursor: "pointer", color: "#ff4444", padding: 0 }}>
              <PhoneOff size={16} />
            </button>
          )}
          <button onClick={onLogout} style={{ background: "none", border: "none", cursor: "pointer", color: T.muted, padding: 0 }}>
            <Shield size={16} />
          </button>
        </div>
      </div>

      {/* ── Discover View ── */}
      {view === "discover" && (
        <div style={{ flex: 1, padding: 20, overflowY: "auto" }}>
          <p style={{ fontSize: 11, color: T.muted, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 16 }}>Find a user to chat</p>
          <DiscoveryPanel onStartChat={handleStartChat} />

          <div style={{ marginTop: 28, padding: "14px", background: T.card, border: `1px solid ${T.border}`, borderRadius: 12 }}>
            <p style={{ fontSize: 11, color: T.muted, margin: "0 0 6px", textTransform: "uppercase", letterSpacing: "0.08em" }}>Your Identity</p>
            <p style={{ fontSize: 14, color: T.accent, margin: 0, fontWeight: 700 }}>@{username}</p>
            <p style={{ fontSize: 10, color: T.muted, margin: "8px 0 0" }}>
              📳 Shake your device to lock the vault instantly
            </p>
          </div>
        </div>
      )}

      {/* ── Chat View ── */}
      {view === "chat" && (
        <>
          {/* Connection pending */}
          {!isConnected && (
            <div style={{ padding: "10px 18px", background: "rgba(159,255,0,0.04)", borderBottom: `1px solid ${T.border}`, display: "flex", alignItems: "center", gap: 8 }}>
              <Loader2 size={13} style={{ color: T.accent, animation: "spin 1s linear infinite" }} />
              <p style={{ fontSize: 12, color: T.muted, margin: 0 }}>Establishing P2P connection with @{remoteUsername}...</p>
            </div>
          )}

          {/* Messages */}
          <div style={{ flex: 1, overflowY: "auto", padding: "16px 16px 8px" }}>
            {messages.length === 0 && isConnected && (
              <div style={{ textAlign: "center", padding: "40px 20px" }}>
                <p style={{ fontSize: 13, color: T.muted }}>🔐 P2P connection established. Messages are ephemeral.</p>
                <p style={{ fontSize: 11, color: T.muted2, marginTop: 6 }}>Messages auto-delete in 10-15 seconds.</p>
              </div>
            )}

            {messages.map((msg) => (
              <MessageBubble
                key={msg.id}
                msg={msg}
                isSelf={msg.from === username}
                timeLeft={timers.get(msg.id) ?? 0}
              />
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Ephemeral notice */}
          <div style={{ padding: "6px 16px", borderTop: `1px solid ${T.border}`, display: "flex", justifyContent: "center" }}>
            <p style={{ fontSize: 10, color: T.muted2, margin: 0 }}>⏱ Messages auto-delete in 10-15s · Not stored anywhere</p>
          </div>

          {/* Input */}
          <div style={{ padding: "12px 14px", borderTop: `1px solid ${T.border}`, display: "flex", gap: 8, alignItems: "center" }}>
            <button onClick={handleVoiceToggle}
              style={{ padding: "10px", borderRadius: 10, background: recording ? "rgba(255,68,68,0.1)" : T.accentDim, border: `1px solid ${recording ? "rgba(255,68,68,0.3)" : T.accentBorder}`, cursor: "pointer", color: recording ? "#ff4444" : T.accent, display: "flex" }}>
              {recording ? <MicOff size={16} /> : <Mic size={16} />}
            </button>

            <input
              style={{ flex: 1, padding: "10px 14px", background: "#0a0a0a", border: `1px solid ${T.border}`, borderRadius: 10, color: T.text, fontSize: 14, fontFamily: T.font, outline: "none" }}
              placeholder={isConnected ? "Type a message..." : "Waiting for connection..."}
              value={input}
              disabled={!isConnected}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
            />

            <button onClick={handleSend} disabled={!isConnected || !input.trim()}
              style={{ padding: "10px 16px", borderRadius: 10, background: T.accent, color: "#000", border: "none", cursor: "pointer", opacity: (!isConnected || !input.trim()) ? 0.4 : 1, display: "flex", alignItems: "center" }}>
              <Send size={15} />
            </button>
          </div>
        </>
      )}
    </div>
  );
}
