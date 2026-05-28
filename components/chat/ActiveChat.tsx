"use client";
import { useState, useEffect, useRef } from "react";
import { MessageCircle, Volume2, VolumeX, X } from "lucide-react";
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
  text: string;
  sender: string;
  timestamp: number;
  read: boolean; // ✅ FEATURE 3: Read/unread
}

interface ActiveChatProps {
  roomId: string;
  username: string;
  otherUser: string;
  onClose: () => void;
}

export default function ActiveChat({ roomId, username, otherUser, onClose }: ActiveChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageInput, setMessageInput] = useState("");
  const [notificationMuted, setNotificationMuted] = useState(false); // ✅ FEATURE 4: Mute/unmute
  const [otherUserOnlineStatus, setOtherUserOnlineStatus] = useState<"online" | "idle" | "offline">("offline"); // ✅ FEATURE 2: Online status

  const { sendMessage, connectionError, connectionReady } = useWebRTCChat(roomId, username, otherUser);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messageVisibilityRef = useRef<Set<string>>(new Set()); // ✅ Track visible messages for auto-read

  // ✅ FEATURE 1: Auto-scroll to top (reverse chronological)
  const scrollToTop = () => {
    setTimeout(() => {
      if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
      }
    }, 0);
  };

  // ✅ FEATURE 3: Auto-mark as read when message is visible
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const messageId = entry.target.getAttribute("data-message-id");
          if (!messageId) return;

          if (entry.isIntersecting) {
            messageVisibilityRef.current.add(messageId);

            // Mark as read after 1 second of being visible
            setTimeout(() => {
              setMessages((prev) =>
                prev.map((msg) =>
                  msg.id === messageId ? { ...msg, read: true } : msg
                )
              );
            }, 1000);
          } else {
            messageVisibilityRef.current.delete(messageId);
          }
        });
      },
      { threshold: 0.5 }
    );

    document.querySelectorAll("[data-message-id]").forEach((el) => {
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, [messages]);

  // ✅ FEATURE 4: Listen for messages via WebRTC
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      try {
        const messageData = JSON.parse(event.data);
        const newMessage: Message = {
          id: `${messageData.sender}-${messageData.timestamp}`,
          text: messageData.text,
          sender: messageData.sender,
          timestamp: messageData.timestamp,
          read: false, // Received messages start as unread
        };

        setMessages((prev) => [newMessage, ...prev]); // ✅ Add to top (reverse order)
        scrollToTop();

        // ✅ FEATURE 4: Play notification sound if tab not focused and not muted
        if (!document.hasFocus() && !notificationMuted) {
          playNotificationSound();
        }
      } catch (error) {
        console.error("Error parsing message:", error);
      }
    };

    // This would be called from useWebRTCChat when message is received
    window.addEventListener("p2p-message", handleMessage as EventListener);
    return () => window.removeEventListener("p2p-message", handleMessage as EventListener);
  }, [notificationMuted]);

  // ✅ FEATURE 2: Detect other user's online status (based on message timestamps)
  useEffect(() => {
    const updateOnlineStatus = () => {
      const otherUserMessages = messages.filter((msg) => msg.sender === otherUser);
      if (otherUserMessages.length === 0) {
        setOtherUserOnlineStatus("offline");
        return;
      }

      const lastMessageTime = otherUserMessages[0].timestamp;
      const timeSinceLastMessage = Date.now() - lastMessageTime;

      if (timeSinceLastMessage < 2 * 60 * 1000) {
        // Less than 2 minutes
        setOtherUserOnlineStatus("online");
      } else if (timeSinceLastMessage < 10 * 60 * 1000) {
        // Less than 10 minutes
        setOtherUserOnlineStatus("idle");
      } else {
        setOtherUserOnlineStatus("offline");
      }
    };

    const interval = setInterval(updateOnlineStatus, 10000); // Update every 10 seconds
    updateOnlineStatus(); // Initial check

    return () => clearInterval(interval);
  }, [messages, otherUser]);

  // ✅ FEATURE 4: Play notification sound
  const playNotificationSound = () => {
    try {
      // Use Web Audio API to play a beep sound
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.value = 800; // 800 Hz beep
      oscillator.type = "sine";

      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
    } catch (error) {
      console.log("Could not play notification sound");
    }
  };

  // Send message handler
  const handleSendMessage = async () => {
    if (!messageInput.trim()) return;

    const newMessage: Message = {
      id: `${username}-${Date.now()}`,
      text: messageInput,
      sender: username,
      timestamp: Date.now(),
      read: true, // Own messages are marked as read
    };

    setMessages((prev) => [newMessage, ...prev]); // ✅ Add to top
    scrollToTop();

    const success = await sendMessage(messageInput);
    if (!success) {
      toast.error("Failed to send message");
    }

    setMessageInput("");
  };

  // ✅ FEATURE 2: Online status indicator colors
  const getStatusColor = () => {
    if (otherUserOnlineStatus === "online") return "#9fff00"; // Green
    if (otherUserOnlineStatus === "idle") return "#ffaa00"; // Yellow/Orange
    return "#666"; // Grey
  };

  const getStatusText = () => {
    if (otherUserOnlineStatus === "online") return "Online";
    if (otherUserOnlineStatus === "idle") return "Idle";
    return "Offline";
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", fontFamily: T.font }}>
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "16px 20px",
          borderBottom: `1px solid ${T.border}`,
          marginBottom: 16,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <MessageCircle size={24} style={{ color: T.accent }} />
          <div>
            <h2 style={{ margin: 0, fontSize: 16, color: T.text }}>@{otherUser}</h2>
            {/* ✅ FEATURE 2: Online status display */}
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 4 }}>
              <div
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: getStatusColor(),
                }}
              />
              <span style={{ fontSize: 11, color: T.muted }}>{getStatusText()}</span>
            </div>
          </div>
        </div>

        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          {/* ✅ FEATURE 4: Mute/Unmute button */}
          <button
            onClick={() => setNotificationMuted(!notificationMuted)}
            style={{
              background: "transparent",
              border: `1px solid ${T.border}`,
              color: notificationMuted ? "#ff6666" : T.accent,
              padding: "8px 12px",
              borderRadius: 6,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 6,
              fontSize: 12,
              fontFamily: T.font,
              fontWeight: 700,
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
              padding: "8px 12px",
              borderRadius: 6,
              cursor: "pointer",
              fontSize: 12,
              fontFamily: T.font,
              fontWeight: 700,
            }}
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Connection Status */}
      {connectionError && (
        <div
          style={{
            padding: "12px 20px",
            background: "rgba(255, 100, 100, 0.1)",
            borderBottom: "1px solid rgba(255, 100, 100, 0.3)",
            color: "#ff6464",
            fontSize: 12,
            marginBottom: 16,
          }}
        >
          ⚠️ {connectionError}
        </div>
      )}

      {/* Messages Container - ✅ FEATURE 1: Reverse order (newest at top) */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "0 20px",
          display: "flex",
          flexDirection: "column-reverse", // ✅ Reverse display
        }}
      >
        <div>
          {messages.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                color: T.muted,
                padding: "40px 20px",
                fontSize: 14,
              }}
            >
              No messages yet. Start the conversation!
            </div>
          ) : (
            messages.map((msg) => (
              <div
                key={msg.id}
                data-message-id={msg.id}
                style={{
                  marginBottom: 12,
                  display: "flex",
                  justifyContent: msg.sender === username ? "flex-end" : "flex-start",
                }}
              >
                <div
                  style={{
                    maxWidth: "60%",
                    padding: "10px 14px",
                    background: msg.sender === username ? T.accent : T.card,
                    color: msg.sender === username ? "#000" : T.text,
                    borderRadius: 8,
                    wordWrap: "break-word",
                  }}
                >
                  <div style={{ fontSize: 14, marginBottom: 4 }}>{msg.text}</div>
                  {/* ✅ FEATURE 3: Read/Unread status next to timestamp */}
                  <div
                    style={{
                      fontSize: 11,
                      opacity: 0.7,
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      gap: 6,
                    }}
                  >
                    <span>{new Date(msg.timestamp).toLocaleTimeString()}</span>
                    {msg.sender === username && (
                      <span>{msg.read ? "✓✓" : "✓"}</span> // ✅ Show read/unread
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div
        style={{
          padding: "16px 20px",
          borderTop: `1px solid ${T.border}`,
          display: "flex",
          gap: 12,
        }}
      >
        <input
          type="text"
          value={messageInput}
          onChange={(e) => setMessageInput(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSendMessage();
            }
          }}
          placeholder="Type a message..."
          style={{
            flex: 1,
            padding: "10px 12px",
            background: T.card,
            border: `1px solid ${T.border}`,
            borderRadius: 6,
            color: T.text,
            fontFamily: T.font,
            fontSize: 13,
            outline: "none",
          }}
          disabled={!connectionReady}
        />
        <button
          onClick={handleSendMessage}
          disabled={!messageInput.trim() || !connectionReady}
          style={{
            padding: "10px 20px",
            background: T.accent,
            color: "#000",
            border: "none",
            borderRadius: 6,
            cursor: connectionReady ? "pointer" : "not-allowed",
            fontFamily: T.font,
            fontWeight: 700,
            fontSize: 12,
            opacity: connectionReady ? 1 : 0.5,
          }}
        >
          Send
        </button>
      </div>
    </div>
  );
}
