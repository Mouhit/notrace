"use client";
import { Bell, CheckCircle2 } from "lucide-react";

const T = {
  accent: "#9fff00",
  text: "#f0f0f0",
  accentDim: "rgba(159,255,0,0.12)",
  accentBorder: "rgba(159,255,0,0.25)",
};

interface RequestNotificationProps {
  requester: string;
  onAccept: () => void;
  onDismiss: () => void;
}

export default function RequestNotification({ requester, onAccept, onDismiss }: RequestNotificationProps) {
  return (
    <div
      style={{
        position: "fixed",
        top: 20,
        right: 20,
        background: T.accentDim,
        border: `1px solid ${T.accentBorder}`,
        borderRadius: 12,
        padding: 16,
        minWidth: 300,
        maxWidth: 400,
        boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
        zIndex: 9999,
        animation: "slideIn 0.3s ease",
      }}
    >
      <style>{`
        @keyframes slideIn {
          from { transform: translateX(400px); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `}</style>

      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
        <Bell size={18} style={{ color: T.accent, flexShrink: 0 }} />
        <div>
          <p style={{ fontSize: 13, fontWeight: 700, color: T.text, margin: 0 }}>Chat Request</p>
          <p style={{ fontSize: 12, color: T.text, margin: "4px 0 0" }}>@{requester} wants to chat</p>
        </div>
      </div>

      <div style={{ display: "flex", gap: 8 }}>
        <button
          onClick={onAccept}
          style={{
            flex: 1,
            padding: "10px 12px",
            borderRadius: 8,
            background: T.accent,
            color: "#000",
            border: "none",
            cursor: "pointer",
            fontWeight: 700,
            fontSize: 12,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 6,
          }}
        >
          <CheckCircle2 size={14} />
          Accept
        </button>
        <button
          onClick={onDismiss}
          style={{
            flex: 1,
            padding: "10px 12px",
            borderRadius: 8,
            background: "rgba(159,255,0,0.05)",
            color: T.accent,
            border: `1px solid ${T.accentBorder}`,
            cursor: "pointer",
            fontWeight: 700,
            fontSize: 12,
          }}
        >
          Later
        </button>
      </div>
    </div>
  );
}
