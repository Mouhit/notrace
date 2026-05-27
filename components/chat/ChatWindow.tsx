"use client";
import { useState, useEffect } from "react";
import { MessageSquare, Users } from "lucide-react";
import { toast } from "sonner";
import { useRequests } from "@/lib/chat/useRequests";
import ChatAuth from "./ChatAuth";
import IncomingRequests from "./IncomingRequests";
import OutgoingRequests from "./OutgoingRequests";
import ActiveChat from "./ActiveChat";
import UserSearch from "./UserSearch";

const T = {
  bg: "#050505",
  card: "#0e0e0e",
  border: "#1a1a1a",
  accent: "#9fff00",
  text: "#f0f0f0",
  muted: "#666",
  font: "'JetBrains Mono', monospace",
};

type ViewType = "requests" | "chat";

interface ActiveChatState {
  roomId: string;
  otherUser: string;
  initiator: "requester" | "recipient";
}

interface ChatWindowProps {
  username: string;
  privateKey: string;
  onLogout: () => void;
}

export default function ChatWindow({ username, privateKey, onLogout }: ChatWindowProps) {
  const [view, setView] = useState<ViewType>("requests");
  const [activeTab, setActiveTab] = useState<"incoming" | "outgoing">("incoming");
  const [activeChat, setActiveChat] = useState<ActiveChatState | null>(null);

  const {
    incomingRequests,
    outgoingRequests,
    acceptRequest,
    rejectRequest,
    cancelRequest,
    sendRequest,
    outgoingRequestAccepted,
    acceptedRoomId,
    acceptedWith,
  } = useRequests(username);

  // ✅ Auto-transition when request accepted
  useEffect(() => {
    if (outgoingRequestAccepted && acceptedRoomId && acceptedWith) {
      console.log(`✅ Auto-transitioning to chat with ${acceptedWith}`);

      setActiveChat({
        roomId: acceptedRoomId,
        otherUser: acceptedWith,
        initiator: "requester",
      });

      setView("chat");

      toast.success(`Connected with @${acceptedWith}!`);
    }
  }, [outgoingRequestAccepted, acceptedRoomId, acceptedWith]);

  // Handle accepting incoming request
  const handleAcceptRequest = async (requestId: string, requester: string) => {
    try {
      const roomId = await acceptRequest(requestId, requester);

      if (roomId) {
        setActiveChat({
          roomId,
          otherUser: requester,
          initiator: "recipient",
        });

        setView("chat");
        toast.success(`Connected with @${requester}!`);
      }
    } catch (error) {
      toast.error("Failed to accept request");
      console.error(error);
    }
  };

  // Handle rejecting incoming request
  const handleRejectRequest = async (requestId: string) => {
    await rejectRequest(requestId);
  };

  // Handle canceling outgoing request
  const handleCancelRequest = async (requestId: string) => {
    await cancelRequest(requestId);
  };

  // Handle accepting from OutgoingRequests component
  const handleOutgoingRequestAccepted = (roomId: string, otherUser: string) => {
    setActiveChat({
      roomId,
      otherUser,
      initiator: "requester",
    });

    setView("chat");
  };

  // ✅ NEW: Handle request sent from search
  const handleRequestSent = (recipient: string) => {
    // Switch to outgoing tab to show sent request
    setActiveTab("outgoing");
  };

  // Close active chat and return to requests
  const handleCloseChat = () => {
    setActiveChat(null);
    setView("requests");
    setActiveTab("incoming");
  };

  // If in chat view
  if (view === "chat" && activeChat) {
    return (
      <div style={{ height: "100vh", background: T.bg, padding: 20, fontFamily: T.font }}>
        <ActiveChat
          roomId={activeChat.roomId}
          username={username}
          otherUser={activeChat.otherUser}
          onClose={handleCloseChat}
        />
      </div>
    );
  }

  // Requests view
  return (
    <div style={{ minHeight: "100vh", background: T.bg, padding: 20, fontFamily: T.font }}>
      <div style={{ maxWidth: 1000, margin: "0 auto" }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 32 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <MessageSquare size={32} style={{ color: T.accent }} />
            <h1 style={{ fontSize: 28, fontWeight: 900, color: T.text, margin: 0 }}>P2P Chat</h1>
          </div>

          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <span style={{ fontSize: 13, color: T.muted }}>@{username}</span>
            <button
              onClick={onLogout}
              style={{
                padding: "8px 16px",
                background: "transparent",
                border: `1px solid ${T.border}`,
                color: T.text,
                borderRadius: 6,
                cursor: "pointer",
                fontSize: 12,
                fontFamily: T.font,
                fontWeight: 700,
              }}
            >
              Logout
            </button>
          </div>
        </div>

        {/* ✅ NEW: User Search Component */}
        <UserSearch
          username={username}
          onRequestSent={handleRequestSent}
          outgoingRequests={outgoingRequests}
          sendRequest={sendRequest}
        />

        {/* Tabs */}
        <div
          style={{
            display: "flex",
            gap: 12,
            marginBottom: 24,
            borderBottom: `1px solid ${T.border}`,
            paddingBottom: 12,
          }}
        >
          <button
            onClick={() => setActiveTab("incoming")}
            style={{
              background: activeTab === "incoming" ? T.accent : "transparent",
              color: activeTab === "incoming" ? "#000" : T.muted,
              border: "none",
              padding: "8px 16px",
              borderRadius: 6,
              cursor: "pointer",
              fontSize: 12,
              fontFamily: T.font,
              fontWeight: 700,
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <Users size={14} />
            Incoming ({incomingRequests.length})
          </button>

          <button
            onClick={() => setActiveTab("outgoing")}
            style={{
              background: activeTab === "outgoing" ? T.accent : "transparent",
              color: activeTab === "outgoing" ? "#000" : T.muted,
              border: "none",
              padding: "8px 16px",
              borderRadius: 6,
              cursor: "pointer",
              fontSize: 12,
              fontFamily: T.font,
              fontWeight: 700,
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <MessageSquare size={14} />
            Outgoing ({outgoingRequests.length})
          </button>
        </div>

        {/* Content */}
        <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 12, padding: 24 }}>
          {activeTab === "incoming" ? (
            <IncomingRequests
              requests={incomingRequests}
              onAccept={handleAcceptRequest}
              onReject={handleRejectRequest}
            />
          ) : (
            <OutgoingRequests
              requests={outgoingRequests}
              username={username}
              onCancel={handleCancelRequest}
              onAccepted={handleOutgoingRequestAccepted}
              outgoingRequestAccepted={outgoingRequestAccepted}
              acceptedRoomId={acceptedRoomId}
              acceptedWith={acceptedWith}
            />
          )}
        </div>
      </div>
    </div>
  );
}
