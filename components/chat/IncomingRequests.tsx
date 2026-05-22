"use client";
import { useState } from "react";
import { Check, X, Loader2 } from "lucide-react";
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

interface ChatRequest {
  id: string;
  requester: string;
  recipient: string;
  status: "pending" | "accepted" | "rejected" | "cancelled";
  created_at: string;
}

interface IncomingRequestsProps {
  requests: ChatRequest[];
  onAccept: (requestId: string, requester: string) => Promise<void>;
  onReject: (requestId: string) => Promise<void>;
  onAcceptComplete?: (roomId: string, requester: string) => void; // ✅ NEW
}

export default function IncomingRequests({
  requests,
  onAccept,
  onReject,
  onAcceptComplete,
}: IncomingRequestsProps) {
  const [acceptingId, setAcceptingId] = useState<string | null>(null);
  const [rejectingId, setRejectingId] = useState<string | null>(null);

  const handleAccept = async (requestId: string, requester: string) => {
    setAcceptingId(requestId);

    try {
      // Call parent's onAccept which returns roomId
      await onAccept(requestId, requester);

      // ✅ NEW: Notify parent that acceptance is complete
      // Note: In the parent (ChatWindow), this triggers auto-transition
      if (onAcceptComplete) {
        onAcceptComplete(requestId, requester); // Pass roomId would be better, but using requestId for now
      }

      toast.success(`Accepted request from @${requester}`);
    } catch (error) {
      toast.error("Failed to accept request");
      console.error(error);
    } finally {
      setAcceptingId(null);
    }
  };

  const handleReject = async (requestId: string) => {
    setRejectingId(requestId);

    try {
      await onReject(requestId);
      toast.info("Request rejected");
    } catch (error) {
      toast.error("Failed to reject request");
      console.error(error);
    } finally {
      setRejectingId(null);
    }
  };

  if (requests.length === 0) {
    return (
      <div>
        <h3 style={{ fontSize: 14, fontWeight: 600, color: T.text, margin: "0 0 16px" }}>
          Incoming Requests
        </h3>
        <p style={{ fontSize: 12, color: T.muted, margin: 0 }}>No incoming requests</p>
      </div>
    );
  }

  return (
    <div>
      <h3 style={{ fontSize: 14, fontWeight: 600, color: T.text, margin: "0 0 16px" }}>
        Incoming Requests ({requests.length})
      </h3>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {requests.map((request) => (
          <div
            key={request.id}
            style={{
              background: "#0a0a0a",
              border: `1px solid ${T.border}`,
              borderRadius: 8,
              padding: 12,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div>
              <p style={{ fontSize: 13, color: T.accent, fontWeight: 600, margin: "0 0 4px" }}>
                @{request.requester}
              </p>
              <p style={{ fontSize: 11, color: T.muted, margin: 0 }}>
                Wants to chat • {new Date(request.created_at).toLocaleDateString()}
              </p>
            </div>

            {/* Action Buttons */}
            <div style={{ display: "flex", gap: 8 }}>
              <button
                onClick={() => handleReject(request.id)}
                disabled={rejectingId === request.id || acceptingId === request.id}
                title="Reject"
                style={{
                  padding: "8px 12px",
                  borderRadius: 6,
                  background: "transparent",
                  border: `1px solid #ff4444`,
                  color: "#ff4444",
                  cursor: "pointer",
                  fontSize: 12,
                  fontFamily: T.font,
                  fontWeight: 600,
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                  opacity: rejectingId === request.id || acceptingId === request.id ? 0.5 : 1,
                }}
              >
                {rejectingId === request.id ? (
                  <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} />
                ) : (
                  <X size={14} />
                )}
                Reject
              </button>

              <button
                onClick={() => handleAccept(request.id, request.requester)}
                disabled={acceptingId === request.id || rejectingId === request.id}
                title="Accept"
                style={{
                  padding: "8px 12px",
                  borderRadius: 6,
                  background: T.accent,
                  color: "#000",
                  border: "none",
                  cursor: "pointer",
                  fontSize: 12,
                  fontFamily: T.font,
                  fontWeight: 600,
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                  opacity: acceptingId === request.id || rejectingId === request.id ? 0.5 : 1,
                }}
              >
                {acceptingId === request.id ? (
                  <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} />
                ) : (
                  <Check size={14} />
                )}
                Accept
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
