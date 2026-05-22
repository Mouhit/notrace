"use client";
import { useState, useEffect } from "react";
import { Send, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useWebRTCChat } from "@/lib/chat/useWebRTCChat";

const T = {
  bg: "#050505",
  card: "#0e0e0e",
  border: "#1a1a1a",
  accent: "#9fff00",
  text: "#f0f0f0",
  muted: "#666",
  font: "'JetBrains Mono', monospace",
};

interface Message {
  id: string;
  sender: string;
  content: string;
  timestamp: number;
  side: "sent" | "received";
  encrypted: boolean;
}

interface ActiveChatProps {
  roomId: string;
  username: string;
  otherUser: string;
  onClose: () => void;
}

export default function ActiveChat({ roomId, username, otherUser, onClose }: ActiveChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [sending, setSending] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<"connecting" | "connected" | "error">("connecting");

  const { sendMessage, connectionReady, connectionError, peerConnection } = useWebRTCChat(
    roomId,
    username,
    otherUser
  );

  // ✅ Update connection status based on hook state
  useEffect(() => {
    if (connectionError) {
      setConnectionStatus("error");
      toast.error(`Connection error: ${connectionError}`);
    } else if (connectionReady) {
      setConnectionStatus("connected");
      toast.success("Connected to peer!");
    } else {
      setConnectionStatus("connecting");
    }
  }, [connectionReady, connectionError]);

  // ✅ Listen for incoming messages from peer connection
  useEffect(() => {
    if (!peerConnection) return;

    const handleDataChannelMessage = (event: any) => {
      try {
        const data = JSON.parse(event.data);

        // ✅ Add received message
        const newMessage: Message = {
          id: `msg-${Date.now()}-${Math.random()}`,
          sender: data.sender,
          content: data.text,
          timestamp: data.timestamp,
          side: "received",
          encrypted: false,
        };

        setMessages((prev) => [...prev, newMessage]);
      } catch (error) {
        console.error("Failed to parse message:", error);
      }
    };

    // Attach message listener to data channel
    peerConnection.ondatachannel = (event) => {
      event.channel.onmessage = handleDataChannelMessage;
    };

    return () => {
      peerConnection.ondatachannel = null;
    };
  }, [peerConnection]);

  // ✅ Send message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!inputValue.trim()) return;

    if (!connectionReady) {
      toast.error("Connection not ready. Please wait...");
      return;
    }

    setSending(true);

    try {
      // ✅ Send via WebRTC data channel
      const success = await sendMessage(inputValue);

      if (success) {
        // ✅ Add to local UI immediately (optimistic update)
        const newMessage: Message = {
          id: `msg-${Date.now()}`,
          sender: username,
          content: inputValue,
          timestamp: Date.now(),
          side: "sent",
          encrypted: false,
        };

        setMessages((prev) => [...prev, newMessage]);
        setInputValue("");
        toast.success("Message sent!");
      } else {
        toast.error("Failed to send message");
      }
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Error sending message");
    } finally {
      setSending(false);
    }
  };

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
          padding: "16px 20px",
          borderBottom: `1px solid ${T.border}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: T.text, margin: "0 0 4px" }}>
            @{otherUser}
          </h3>

          {/* ✅ Connection status indicator */}
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: connectionReady ? "#4ade80" : connectionStatus === "error" ? "#ff4444" : "#fbbf24",
              }}
            />
            <span style={{ fontSize: 11, color: T.muted }}>
              {connectionStatus === "connected" && "Connected"}
              {connectionStatus === "connecting" && "Connecting..."}
              {connectionStatus === "error" && "Connection error"}
            </span>
          </div>
        </div>

        <button
          onClick={onClose}
          style={{
            background: "transparent",
            border: `1px solid ${T.border}`,
            color: T.text,
            padding: "6px 12px",
            borderRadius: 6,
            cursor: "pointer",
            fontSize: 12,
            fontFamily: T.font,
            fontWeight: 600,
          }}
        >
          Close
        </button>
      </div>

      {/* Messages Area */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "16px 20px",
          display: "flex",
          flexDirection: "column",
          gap: 12,
        }}
      >
        {messages.length === 0 ? (
          <div style={{ textAlign: "center", color: T.muted, fontSize: 12, margin: "auto" }}>
            No messages yet. Start the conversation!
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              style={{
                display: "flex",
                justifyContent: msg.side === "sent" ? "flex-end" : "flex-start",
              }}
            >
              <div
                style={{
                  maxWidth: "70%",
                  background: msg.side === "sent" ? T.accent : T.card,
                  color: msg.side === "sent" ? "#000" : T.text,
                  padding: "10px 12px",
                  borderRadius: 8,
                  fontSize: 13,
                  wordBreak: "break-word",
                  border: msg.side === "received" ? `1px solid ${T.border}` : "none",
                }}
              >
                <p style={{ margin: 0, fontWeight: 600, fontSize: 11 }}>
                  {msg.side === "sent" ? "You" : msg.sender}
                </p>
                <p style={{ margin: "4px 0 0", fontSize: 12 }}>{msg.content}</p>
                <span style={{ fontSize: 10, opacity: 0.7 }}>
                  {new Date(msg.timestamp).toLocaleTimeString()}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Input Area */}
      <form
        onSubmit={handleSendMessage}
        style={{
          padding: "16px 20px",
          borderTop: `1px solid ${T.border}`,
          display: "flex",
          gap: 8,
        }}
      >
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Type a message..."
          disabled={!connectionReady || sending}
          style={{
            flex: 1,
            padding: "10px 12px",
            background: "#0a0a0a",
            border: `1px solid ${T.border}`,
            borderRadius: 8,
            color: T.text,
            fontFamily: T.font,
            fontSize: 13,
            outline: "none",
            opacity: !connectionReady ? 0.5 : 1,
          }}
        />

        <button
          type="submit"
          disabled={!connectionReady || sending || !inputValue.trim()}
          style={{
            padding: "10px 16px",
            background: T.accent,
            color: "#000",
            border: "none",
            borderRadius: 8,
            cursor: "pointer",
            fontFamily: T.font,
            fontWeight: 700,
            fontSize: 12,
            display: "flex",
            alignItems: "center",
            gap: 6,
            opacity: !connectionReady || !inputValue.trim() ? 0.5 : 1,
          }}
        >
          {sending ? <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} /> : <Send size={14} />}
          Send
        </button>
      </form>
    </div>
  );
}
