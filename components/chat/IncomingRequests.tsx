"use client";
import { CheckCircle2, XCircle, Clock } from "lucide-react";
import { useState } from "react";

const T = {
  bg: "#050505",
  card: "#0e0e0e",
  border: "#1a1a1a",
  accent: "#9fff00",
  text: "#f0f0f0",
  muted: "#666",
  font: "'JetBrains Mono', monospace",
};

interface IncomingRequestsProps {
  requests: any[];
  onAccept: (requestId: string, requester: string) => Promise<void>;
  onReject: (requestId: string) => Promise<void>;
  loading?: boolean;
}

export default function IncomingRequests({ requests, onAccept, onReject, loading }: IncomingRequestsProps) {
  const [processing, setProcessing] = useState<string | null>(null);

  const handleAccept = async (requestId: string, requester: string) => {
    setProcessing(requestId);
    await onAccept(requestId, requester);
    setProcessing(null);
  };

  const handleReject = async (requestId: string) => {
    setProcessing(requestId);
    await onReject(requestId);
    setProcessing(null);
  };

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "20px", color: T.muted }}>
        Loading requests...
      </div>
    );
  }

  if (requests.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: "20px", color: T.muted }}>
        No incoming chat requests
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <h2 style={{ fontSize: 14, fontWeight: 700, color: T.text, margin: 0, marginBottom: 8 }}>
        Incoming Requests ({requests.length})
      </h2>

      {requests.map((req) => (
        <div
          key={req.id}
          style={{
            background: T.card,
            border: `1px solid ${T.border}`,
            borderRadius: 12,
            padding: 14,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
          }}
        >
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: 14, fontWeight: 700, color: T.accent, margin: "0 0 4px" }}>
              @{req.requester}
            </p>
            <p style={{ fontSize: 11, color: T.muted, margin: 0, display: "flex", alignItems: "center", gap: 6 }}>
              <Clock size={11} />
              {new Date(req.created_at).toLocaleTimeString()}
            </p>
          </div>

          <div style={{ display: "flex", gap: 8 }}>
            <button
              onClick={() => handleAccept(req.id, req.requester)}
              disabled={processing === req.id}
              style={{
                padding: "8px 12px",
                borderRadius: 8,
                background: T.accent,
                color: "#000",
                border: "none",
                cursor: "pointer",
                fontSize: 12,
                fontWeight: 700,
                fontFamily: T.font,
                display: "flex",
                alignItems: "center",
                gap: 5,
                opacity: processing === req.id ? 0.5 : 1,
              }}
            >
              <CheckCircle2 size={14} />
              Accept
            </button>

            <button
              onClick={() => handleReject(req.id)}
              disabled={processing === req.id}
              style={{
                padding: "8px 12px",
                borderRadius: 8,
                background: "transparent",
                color: T.text,
                border: `1px solid ${T.border}`,
                cursor: "pointer",
                fontSize: 12,
                fontWeight: 700,
                fontFamily: T.font,
                display: "flex",
                alignItems: "center",
                gap: 5,
                opacity: processing === req.id ? 0.5 : 1,
              }}
            >
              <XCircle size={14} />
              Reject
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
