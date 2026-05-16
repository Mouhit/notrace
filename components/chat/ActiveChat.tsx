"use client";
import { useState, useEffect, useRef } from "react";
import { Send, PhoneOff, Loader2 } from "lucide-react";
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

const EPHEMERAL_TIMEOUT = 10000 + Math.random() * 5000;

interface Message {
  id: string;
  from: string;
  text: string;
  timestamp: number;
  visible: boolean;
}

interface ActiveChatProps {
  roomId: string;
  username: string;
  otherUser: string;
  onEndChat: () => Promise<void>;
}

export default function ActiveChat({ roomId, username, otherUser, onEndChat }: ActiveChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Add message and auto-delete
  const addMessage = (from: string, text: string) => {
    const message: Message = {
      id: `${Date.now()}-${Math.random()}`,
      from,
      text,
      timestamp: Date.now(),
      visible: true,
    };

    setMessages((prev) => [...prev, message]);

    // Auto-delete after timeout
    setTimeout(() => {
      setMessages((prev) => prev.map((m) => (m.id === message.id ? { ...m, visible: false } : m)));
      setTimeout(() => {
        setMessages((prev) => prev.filter((m) => m.id !== message.id));
      }, 500);
    }, EPHEMERAL_TIMEOUT);
  };

  // Send message
  const handleSend = () => {
    if (!input.trim() || !isConnected) return;

    addMessage(username, input.trim());
    setInput("");

    // In real implementation, would send via WebRTC DataChannel
    // For now, just add locally
  };

  // End chat
  const handleEndChat = async () => {
    setLoading(true);
    try {
      await onEndChat();
      toast.success("Chat ended");
    } catch (err) {
      toast.error("Failed to end chat");
    } finally {
      setLoading(false);
    }
  };

  // Simulate connection
  useEffect(() => {
    setIsConnected(true);
  }, [roomId]);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        background: T.bg,
        borderRadius: 16,
        overflow: "hidden",
        border: `1px solid ${T.border}`,
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "14px 16px",
          background: T.card,
          borderBottom: `1px solid ${T.border}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div>
          <p style={{ fontSize: 13, fontWeight: 700, color: T.text, margin: 0 }}>@{otherUser}</p>
          <p style={{ fontSize: 11, color: isConnected ? T.accent : "#ff4444", margin: "4px 0 0" }}>
            {isConnected ? "🔒 P2P Connected" : "Connecting..."}
          </p>
        </div>
        <button
          onClick={handleEndChat}
          disabled={loading}
          style={{
            padding: "8px 12px",
            borderRadius: 8,
            background: "transparent",
            color: "#ff4444",
            border: "1px solid #ff4444",
            cursor: "pointer",
            fontSize: 12,
            fontFamily: T.font,
            display: "flex",
            alignItems: "center",
            gap: 5,
            opacity: loading ? 0.5 : 1,
          }}
        >
          {loading ? <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} /> : <PhoneOff size={14} />}
          End
        </button>
      </div>

      {/* Messages */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "16px",
          display: "flex",
          flexDirection: "column",
          gap: 12,
        }}
      >
        {messages.length === 0 && isConnected && (
          <div style={{ textAlign: "center", color: T.muted, fontSize: 12, marginTop: "auto", marginBottom: "auto" }}>
            💬 Messages auto-delete in 10-15 seconds
          </div>
        )}

        {messages.map((msg) => (
          <div
            key={msg.id}
            style={{
              display: "flex",
              justifyContent: msg.from === username ? "flex-end" : "flex-start",
              opacity: msg.visible ? 1 : 0,
              transition: "opacity 0.5s",
            }}
          >
            <div
              style={{
                maxWidth: "70%",
                padding: "10px 14px",
                borderRadius: msg.from === username ? "14px 4px 14px 14px" : "14px 14px 4px 14px",
                background: msg.from === username ? "rgba(159,255,0,0.1)" : T.card,
                border: `1px solid ${msg.from === username ? "rgba(159,255,0,0.25)" : T.border}`,
              }}
            >
              {msg.from !== username && (
                <p style={{ fontSize: 10, color: T.accent, margin: "0 0 4px" }}>@{msg.from}</p>
              )}
              <p style={{ fontSize: 13, color: T.text, margin: 0, wordBreak: "break-word" }}>{msg.text}</p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div style={{ padding: "12px 16px", borderTop: `1px solid ${T.border}`, display: "flex", gap: 8 }}>
        <input
          type="text"
          placeholder={isConnected ? "Type a message..." : "Connecting..."}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          disabled={!isConnected}
          style={{
            flex: 1,
            padding: "10px 12px",
            borderRadius: 8,
            background: "#0a0a0a",
            border: `1px solid ${T.border}`,
            color: T.text,
            fontSize: 13,
            fontFamily: T.font,
            outline: "none",
          }}
        />
        <button
          onClick={handleSend}
          disabled={!isConnected || !input.trim()}
          style={{
            padding: "10px 14px",
            borderRadius: 8,
            background: T.accent,
            color: "#000",
            border: "none",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            opacity: !isConnected || !input.trim() ? 0.4 : 1,
            fontFamily: T.font,
          }}
        >
          <Send size={14} />
        </button>
      </div>
    </div>
  );
}
