"use client";
import { useEffect, useState } from "react";
import { Send, Loader2, CheckCircle2 } from "lucide-react";
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

interface OutgoingRequest {
  id: string;
  requester: string;
  recipient: string;
  status: "pending" | "accepted" | "rejected" | "cancelled";
  created_at: string;
}

interface OutgoingRequestsProps {
  username: string;
  requests: OutgoingRequest[];
  onCancel: (requestId: string) => Promise<void>;
  onAccepted?: (roomId: string, withUser: string) => void; // ✅ NEW: Callback when accepted
  outgoingRequestAccepted?: boolean; // ✅ NEW: Track acceptance
  acceptedRoomId?: string | null; // ✅ NEW: Room ID
  acceptedWith?: string | null; // ✅ NEW: Who accepted
}

export default function OutgoingRequests({
  username,
  requests,
  onCancel,
  onAccepted,
  outgoingRequestAccepted,
  acceptedRoomId,
  acceptedWith,
}: OutgoingRequestsProps) {
  const [cancelingId, setCancelingId] = useState<string | null>(null);
  const [connectingUser, setConnectingUser] = useState<string | null>(null);

  // ✅ NEW: Auto-transition when request accepted
  useEffect(() => {
    if (outgoingRequestAccepted && acceptedRoomId && acceptedWith && onAccepted) {
      // Show "Connecting..." state for 1 second then transition
      setConnectingUser(acceptedWith);
      
      const timer = setTimeout(() => {
        onAccepted(acceptedRoomId, acceptedWith);
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [outgoingRequestAccepted, acceptedRoomId, acceptedWith, onAccepted]);

  const handleCancel = async (requestId: string) => {
    setCancelingId(requestId);
    try {
      await onCancel(requestId);
      toast.info("Request cancelled");
    } catch (error) {
      toast.error("Failed to cancel");
    } finally {
      setCancelingId(null);
    }
  };

  if (requests.length === 0) {
    return (
      <div style={{ textAlign: "center", color: T.muted, fontSize: 13, padding: 24 }}>
        No outgoing requests
      </div>
    );
  }

  return (
    <div>
      <h3 style={{ fontSize: 14, fontWeight: 700, color: T.text, margin: "0 0 16px" }}>
        Sent Requests ({requests.length})
      </h3>

      {requests.map((request) => (
        <div
          key={request.id}
          style={{
            background: "#0a0a0a",
            border: `1px solid ${T.border}`,
            borderRadius: 12,
            padding: 16,
            marginBottom: 12,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div>
            <p style={{ margin: 0, fontSize: 13, color: T.accent, fontWeight: 600 }}>
              @{request.recipient}
            </p>

            {/* ✅ NEW: Show different states */}
            {connectingUser === request.recipient ? (
              <p style={{ margin: "4px 0 0", fontSize: 11, color: "#9fff00", display: "flex", alignItems: "center", gap: 6 }}>
                <Loader2 size={12} style={{ animation: "spin 1s linear infinite" }} />
                Connecting via P2P...
              </p>
            ) : outgoingRequestAccepted && acceptedWith === request.recipient ? (
              <p style={{ margin: "4px 0 0", fontSize: 11, color: "#4ade80", display: "flex", alignItems: "center", gap: 6 }}>
                <CheckCircle2 size={12} />
                Accepted! Connecting...
              </p>
            ) : (
              <p style={{ margin: "4px 0 0", fontSize: 11, color: T.muted }}>⏳ Waiting for response...</p>
            )}
          </div>

          {/* ✅ NEW: Hide cancel button when connecting */}
          {!connectingUser && !outgoingRequestAccepted && (
            <button
              onClick={() => handleCancel(request.id)}
              disabled={cancelingId === request.id}
              style={{
                padding: "6px 12px",
                borderRadius: 6,
                background: "transparent",
                border: `1px solid ${T.border}`,
                color: T.muted,
                cursor: "pointer",
                fontSize: 11,
                fontFamily: T.font,
                fontWeight: 700,
                opacity: cancelingId === request.id ? 0.5 : 1,
              }}
            >
              {cancelingId === request.id ? "..." : "✕ Cancel"}
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
