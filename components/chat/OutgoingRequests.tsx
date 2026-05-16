"use client";
import { Clock, X } from "lucide-react";
import { useState } from "react";

const T = {
  bg: "#050505",
  card: "#0e0e0e",
  border: "#1a1a1a",
  accent: "#9fff00",
  text: "#f0f0f0",
  muted: "#666",
  muted2: "#333",
  font: "'JetBrains Mono', monospace",
};

interface OutgoingRequestsProps {
  requests: any[];
  onCancel: (requestId: string) => Promise<void>;
}

export default function OutgoingRequests({ requests, onCancel }: OutgoingRequestsProps) {
  const [processing, setProcessing] = useState<string | null>(null);

  const handleCancel = async (requestId: string) => {
    setProcessing(requestId);
    await onCancel(requestId);
    setProcessing(null);
  };

  if (requests.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: "20px", color: T.muted }}>
        No sent requests pending
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <h2 style={{ fontSize: 14, fontWeight: 700, color: T.text, margin: 0, marginBottom: 8 }}>
        Sent Requests ({requests.length})
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
              @{req.recipient}
            </p>
            <p style={{ fontSize: 11, color: T.muted2, margin: 0, display: "flex", alignItems: "center", gap: 6 }}>
              <Clock size={11} />
              Waiting for response...
            </p>
          </div>

          <button
            onClick={() => handleCancel(req.id)}
            disabled={processing === req.id}
            style={{
              padding: "8px 12px",
              borderRadius: 8,
              background: "transparent",
              color: T.muted,
              border: `1px solid ${T.border}`,
              cursor: "pointer",
              fontSize: 12,
              fontFamily: T.font,
              display: "flex",
              alignItems: "center",
              gap: 5,
              opacity: processing === req.id ? 0.5 : 1,
            }}
          >
            <X size={14} />
            Cancel
          </button>
        </div>
      ))}
    </div>
  );
}
