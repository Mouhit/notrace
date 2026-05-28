"use client";
import { useState, useEffect, useRef } from "react";
import { Send, Loader2, AlertCircle, Volume2, VolumeX } from "lucide-react";
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
  status?: "pending" | "sent" | "failed";
  read?: boolean; // ✅ FEATURE 3: Read/unread
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
  const [notificationMuted, setNotificationMuted] = useState(false); // ✅ FEATURE 6: Mute/unmute
  const [otherUserStatus, setOtherUserStatus] = useState<"online" | "idle" | "offline">("offline"); // ✅ FEATURE 4: Online status

  const { sendMessage, connectionReady, connectionError, peerConnection } = useWebRTCChat(roomId, username, otherUser);

  const messageQueueRef = useRef<Array<{ content: string; id: string }>>([]); // Message queue
  const messagesContainerRef = useRef<HTMLDivElement>(null); // ✅ FEATURE 1 & 2: Scroll reference
  const lastOtherUserMessageTimeRef = useRef<number>(0); // ✅ FEATURE 4: Track online status
  const visibleMessagesRef = useRef<Set<string>>(new Set()); // ✅ FEATURE 3: Track visible messages

  // ✅ FEATURE 4: Update online status based on last message time
  useEffect(() => {
    const updateStatus = () => {
      if (lastOtherUserMessageTimeRef.current === 0) {
        setOtherUserStatus("offline");
        return;
      }

      const timeSinceLastMessage = Date.now() - lastOtherUserMessageTimeRef.current;

      if (timeSinceLastMessage < 2 * 60 * 1000) {
        setOtherUserStatus("online");
      } else if (timeSinceLastMessage < 10 * 60 * 1000) {
        setOtherUserStatus("idle");
      } else {
        setOtherUserStatus("offline");
      }
    };

    updateStatus();
    const interval = setInterval(updateStatus, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, [messages]);

  // ✅ FEATURE 3: Auto-mark messages as read when visible
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const messageId = entry.target.getAttribute("data-message-id");
          if (!messageId) return;

          if (entry.isIntersecting) {
            visibleMessagesRef.current.add(messageId);

            // Auto-mark as read after 1 second
            setTimeout(() => {
              setMessages((prev) =>
                prev.map((msg) => (msg.id === messageId ? { ...msg, read: true } : msg))
              );
            }, 1000);
          } else {
            visibleMessagesRef.current.delete(messageId);
          }
        });
      },
      { threshold: 0.5 }
    );

    // Observe all messages
    document.querySelectorAll("[data-message-id]").forEach((el) => {
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, [messages]);

  // ✅ FEATURE 1 & 2: Auto-scroll to top when new message arrives
  const scrollToTop = () => {
    setTimeout(() => {
      if (messagesContainerRef.current && messagesContainerRef.current.firstChild) {
        const firstMessage = messagesContainerRef.current.firstChild as HTMLElement;
        firstMessage.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 0);
  };

  // ✅ Update connection status
  useEffect(() => {
    if (connectionError) {
      setConnectionStatus("error");
      console.error("Connection error:", connectionError);
    } else if (connectionReady) {
      setConnectionStatus("connected");
      console.log("✅ Connection ready");
      processMessageQueue();
    } else {
      setConnectionStatus("connecting");
    }
  }, [connectionReady, connectionError]);

  // Process queued messages
  const processMessageQueue = async () => {
    if (messageQueueRef.current.length === 0) return;

    console.log(`Processing ${messageQueueRef.current.length} queued messages`);

    for (const queuedMessage of messageQueueRef.current) {
      const success = await sendMessage(queuedMessage.content);
      if (success) {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === queuedMessage.id ? { ...msg, status: "sent" } : msg
          )
        );
      } else {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === queuedMessage.id ? { ...msg, status: "failed" } : msg
          )
        );
      }
    }

    messageQueueRef.current = [];
  };

  // ✅ Listen for incoming messages
  useEffect(() => {
    if (!peerConnection) return;

    const handleDataChannelMessage = (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data);
        console.log("Received message:", data);

        const newMessage: Message = {
          id: `msg-${Date.now()}-${Math.random()}`,
          sender: data.sender,
          content: data.text,
          timestamp: data.timestamp,
          side: "received",
          status: "sent",
          read: false, // ✅ FEATURE 3: New received messages start as unread
        };

        // ✅ FEATURE 4: Update last message time for online status
        lastOtherUserMessageTimeRef.current = Date.now();

        // ✅ FEATURE 1: Add to top (reverse order)
        setMessages((prev) => [newMessage, ...prev]);

        // ✅ FEATURE 2: Auto-scroll to top
        scrollToTop();

        // ✅ FEATURE 5: Play notification sound if tab not focused and not muted
        if (!document.hasFocus() && !notificationMuted) {
          playNotificationSound();
        }
      } catch (error) {
        console.error("Failed to parse message:", error);
      }
    };

    const handleDataChannel = (event: RTCDataChannelEvent) => {
      console.log("Data channel received:", event.channel.label);
      event.channel.onmessage = handleDataChannelMessage;
    };

    peerConnection.ondatachannel = handleDataChannel;

    return () => {
      peerConnection.ondatachannel = null;
    };
  }, [peerConnection, notificationMuted]);

  // ✅ FEATURE 5: Play notification sound
  const playNotificationSound = () => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.value = 800;
      oscillator.type = "sine";

      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
    } catch (error) {
      console.log("Could not play notification sound");
    }
  };

  // Handle send message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!inputValue.trim()) return;

    const messageId = `msg-${Date.now()}`;
    const messageContent = inputValue;

    const newMessage: Message = {
      id: messageId,
      sender: username,
      content: messageContent,
      timestamp: Date.now(),
      side: "sent",
      status: connectionReady ? "pending" : "pending",
      read: true, // Own messages are marked as read
    };

    // ✅ FEATURE 1: Add to top
    setMessages((prev) => [newMessage, ...prev]);

    // ✅ FEATURE 2: Auto-scroll to top
    scrollToTop();

    setInputValue("");
    setSending(true);

    try {
      if (!connectionReady) {
        console.log("Connection not ready - queueing message");
        messageQueueRef.current.push({ content: messageContent, id: messageId });
        toast.info("Connection not ready - message will be sent when connected");
        setSending(false);
        return;
      }

      const success = await sendMessage(messageContent);

      if (success) {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === messageId ? { ...msg, status: "sent" } : msg
          )
        );
        console.log("Message sent successfully");
      } else {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === messageId ? { ...msg, status: "failed" } : msg
          )
        );
        toast.error("Failed to send message - connection not ready");
      }
    } catch (error) {
      console.error("Error sending message:", error);
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === messageId ? { ...msg, status: "failed" } : msg
        )
      );
      toast.error("Error sending message");
    } finally {
      setSending(false);
    }
  };

  // ✅ FEATURE 4: Get status color and text
  const getStatusColor = () => {
    if (otherUserStatus === "online") return "#4ade80"; // Green
    if (otherUserStatus === "idle") return "#fbbf24"; // Yellow
    return "#666"; // Grey
  };

  const getStatusText = () => {
    if (otherUserStatus === "online") return "Online";
    if (otherUserStatus === "idle") return "Idle";
    return "Offline";
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
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: T.text, margin: 0 }}>@{otherUser}</h3>
            {/* ✅ FEATURE 4: Online status indicator */}
            <div
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: getStatusColor(),
              }}
            />
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                background:
                  connectionStatus === "connected"
                    ? "#4ade80"
                    : connectionStatus === "error"
                      ? "#ff4444"
                      : "#fbbf24",
                animation: connectionStatus === "connecting" ? "pulse 1.5s infinite" : "none",
              }}
            />
            <span style={{ fontSize: 11, color: T.muted }}>
              {connectionStatus === "connected" && "✅ Connected"}
              {connectionStatus === "connecting" && "⏳ Connecting..."}
              {connectionStatus === "error" && "❌ Connection Error"}
            </span>
            <span style={{ fontSize: 10, color: T.muted, marginLeft: 8 }}>({getStatusText()})</span>
          </div>

          {connectionError && (
            <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 6 }}>
              <AlertCircle size={12} style={{ color: "#ff4444" }} />
              <span style={{ fontSize: 10, color: "#ff4444" }}>{connectionError}</span>
            </div>
          )}
        </div>

        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          {/* ✅ FEATURE 6: Mute/Unmute button */}
          <button
            onClick={() => {
              setNotificationMuted(!notificationMuted);
              localStorage.setItem("chatNotificationMuted", JSON.stringify(!notificationMuted));
              toast.success(notificationMuted ? "Notifications enabled" : "Notifications muted");
            }}
            style={{
              background: "transparent",
              border: `1px solid ${T.border}`,
              color: notificationMuted ? "#ff6666" : T.accent,
              padding: "6px 12px",
              borderRadius: 6,
              cursor: "pointer",
              fontSize: 12,
              fontFamily: T.font,
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
            title={notificationMuted ? "Notifications muted" : "Notifications enabled"}
          >
            {notificationMuted ? <VolumeX size={14} /> : <Volume2 size={14} />}
          </button>

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
      </div>

      {/* Messages Area - ✅ FEATURE 1: Reverse order display */}
      <div
        ref={messagesContainerRef}
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
            {connectionStatus === "connecting"
              ? "Connecting... Messages will appear here"
              : "No messages yet. Start the conversation!"}
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              data-message-id={msg.id}
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
                  opacity: msg.status === "failed" ? 0.5 : 1,
                }}
              >
                <p style={{ margin: 0, fontWeight: 600, fontSize: 11 }}>
                  {msg.side === "sent" ? "You" : msg.sender}
                  {msg.status === "pending" && " (sending...)"}
                  {msg.status === "failed" && " (failed)"}
                </p>
                <p style={{ margin: "4px 0 0", fontSize: 12 }}>{msg.content}</p>
                {/* ✅ FEATURE 3: Read/Unread status next to timestamp */}
                <div style={{ fontSize: 10, opacity: 0.7, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 4, marginTop: 4 }}>
                  <span>{new Date(msg.timestamp).toLocaleTimeString()}</span>
                  {msg.side === "sent" && (
                    <span>{msg.read ? "✓✓" : "✓"}</span>
                  )}
                </div>
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
          background: connectionStatus === "error" ? "rgba(255,68,68,0.05)" : T.bg,
        }}
      >
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder={
            connectionStatus === "connecting"
              ? "Connecting... You can type, message will be sent when ready"
              : connectionStatus === "error"
                ? "Connection error - refresh page"
                : "Type a message..."
          }
          disabled={sending || connectionStatus === "error"}
          style={{
            flex: 1,
            padding: "10px 12px",
            background: "#0a0a0a",
            border: `1px solid ${connectionStatus === "error" ? "#ff4444" : T.border}`,
            borderRadius: 8,
            color: T.text,
            fontFamily: T.font,
            fontSize: 13,
            outline: "none",
          }}
        />

        <button
          type="submit"
          disabled={sending || !inputValue.trim() || connectionStatus === "error"}
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
            opacity: !inputValue.trim() ? 0.5 : 1,
          }}
        >
          {sending ? <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} /> : <Send size={14} />}
          Send
        </button>
      </form>
    </div>
  );
}
