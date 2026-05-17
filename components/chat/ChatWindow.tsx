"use client";
import { useState, useEffect } from "react";
import { MessageSquare, Search } from "lucide-react";
import { toast } from "sonner";
import IncomingRequests from "./IncomingRequests";
import OutgoingRequests from "./OutgoingRequests";
import ActiveChat from "./ActiveChat";
import RequestNotification from "./RequestNotification";
import { useRequests } from "@/lib/chat/useRequests";

const T = {
  bg: "#050505",
  card: "#0e0e0e",
  border: "#1a1a1a",
  accent: "#9fff00",
  text: "#f0f0f0",
  muted: "#666",
  font: "'JetBrains Mono', monospace",
};

interface ChatWindowProps {
  username: string;
  onLogout: () => void;
}

type View = "discovery" | "requests" | "chat";

export default function ChatWindow({ username, onLogout }: ChatWindowProps) {
  const [view, setView] = useState<View>("discovery");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeChat, setActiveChat] = useState<any>(null);
  const [showNotification, setShowNotification] = useState<any>(null);
  const [lastRequestId, setLastRequestId] = useState<string>("");

  const { incomingRequests, outgoingRequests, sendRequest, acceptRequest, rejectRequest, cancelRequest } =
    useRequests(username);

  // Search for user
  const handleSearchUser = async () => {
    if (!searchQuery.trim()) {
      toast.error("Enter a username");
      return;
    }

    const success = await sendRequest(searchQuery.trim());
    if (success) {
      setSearchQuery("");
      setView("requests");
    }
  };

  // Accept request
  const handleAcceptRequest = async (requestId: string, requester: string) => {
    const roomId = await acceptRequest(requestId, requester);
    if (roomId) {
      setActiveChat({
        roomId,
        otherUser: requester,
      });
      setView("chat");
      setShowNotification(null);
    }
  };

  // Reject request (returns boolean, wrap to return void)
  const handleRejectRequest = async (requestId: string): Promise<void> => {
    await rejectRequest(requestId);
  };

  // Cancel request (returns boolean, wrap to return void)
  const handleCancelRequest = async (requestId: string): Promise<void> => {
    await cancelRequest(requestId);
  };

  // End chat
  const handleEndChat = async () => {
    if (!activeChat) return;

    await fetch("/api/chat/end", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ roomId: activeChat.roomId, username }),
    });

    setActiveChat(null);
    setView("requests");
  };

  // Show notification for new incoming request
  useEffect(() => {
    if (incomingRequests.length > 0) {
      const latestRequest = incomingRequests[0];
      if (latestRequest.id !== lastRequestId) {
        setShowNotification(latestRequest);
        setLastRequestId(latestRequest.id);
      }
    }
  }, [incomingRequests]);

  return (
    <div style={{ minHeight: "100vh", background: T.bg, padding: 20, fontFamily: T.font }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 3px; }
        ::-webkit-scrollbar-thumb { background: #333; border-radius: 99px; }
      `}</style>

      {/* Notification */}
      {showNotification && (
        <RequestNotification
          requester={showNotification.requester}
          onAccept={() => handleAcceptRequest(showNotification.id, showNotification.requester)}
          onDismiss={() => setShowNotification(null)}
        />
      )}

      {/* Header */}
      <div style={{ maxWidth: 900, margin: "0 auto", marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <MessageSquare size={24} style={{ color: T.accent }} />
            <h1 style={{ fontSize: 22, fontWeight: 700, color: T.text, margin: 0 }}>P2P Chat</h1>
          </div>
          <button
            onClick={onLogout}
            style={{
              padding: "8px 16px",
              borderRadius: 8,
              background: "transparent",
              border: `1px solid ${T.border}`,
              color: T.muted,
              cursor: "pointer",
              fontSize: 12,
              fontFamily: T.font,
            }}
          >
            Logout
          </button>
        </div>

        {/* Navigation */}
        <div style={{ display: "flex", gap: 8, borderBottom: `1px solid ${T.border}`, paddingBottom: 12 }}>
          <button
            onClick={() => setView("discovery")}
            style={{
              padding: "8px 16px",
              background: view === "discovery" ? T.accent : "transparent",
              color: view === "discovery" ? "#000" : T.muted,
              border: "none",
              borderRadius: 8,
              cursor: "pointer",
              fontSize: 12,
              fontFamily: T.font,
              fontWeight: 700,
            }}
          >
            Find User
          </button>
          <button
            onClick={() => setView("requests")}
            style={{
              padding: "8px 16px",
              background: view === "requests" ? T.accent : "transparent",
              color: view === "requests" ? "#000" : T.muted,
              border: "none",
              borderRadius: 8,
              cursor: "pointer",
              fontSize: 12,
              fontFamily: T.font,
              fontWeight: 700,
            }}
          >
            Requests
            {incomingRequests.length > 0 && (
              <span style={{ marginLeft: 6, color: "#ff4444" }}>({incomingRequests.length})</span>
            )}
          </button>
          {activeChat && (
            <button
              onClick={() => setView("chat")}
              style={{
                padding: "8px 16px",
                background: view === "chat" ? T.accent : "transparent",
                color: view === "chat" ? "#000" : T.muted,
                border: "none",
                borderRadius: 8,
                cursor: "pointer",
                fontSize: 12,
                fontFamily: T.font,
                fontWeight: 700,
              }}
            >
              Chat @{activeChat.otherUser}
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: 900, margin: "0 auto" }}>
        {view === "discovery" && (
          <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 16, padding: 24 }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: T.text, margin: "0 0 16px" }}>Find a User to Chat</h2>
            <div style={{ display: "flex", gap: 8 }}>
              <input
                type="text"
                placeholder="Enter username..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearchUser()}
                style={{
                  flex: 1,
                  padding: "12px 16px",
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
                onClick={handleSearchUser}
                style={{
                  padding: "12px 24px",
                  borderRadius: 8,
                  background: T.accent,
                  color: "#000",
                  border: "none",
                  cursor: "pointer",
                  fontWeight: 700,
                  fontSize: 13,
                  fontFamily: T.font,
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <Search size={14} />
                Search
              </button>
            </div>
          </div>
        )}

        {view === "requests" && (
          <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 16, padding: 24 }}>
            <div style={{ marginBottom: 24 }}>
              <IncomingRequests
                requests={incomingRequests}
                onAccept={handleAcceptRequest}
                onReject={handleRejectRequest}
              />
            </div>
            <div style={{ borderTop: `1px solid ${T.border}`, paddingTop: 24 }}>
              <OutgoingRequests requests={outgoingRequests} onCancel={handleCancelRequest} />
            </div>
          </div>
        )}

        {view === "chat" && activeChat && (
          <ActiveChat
            roomId={activeChat.roomId}
            username={username}
            otherUser={activeChat.otherUser}
            onEndChat={handleEndChat}
          />
        )}
      </div>
    </div>
  );
}
