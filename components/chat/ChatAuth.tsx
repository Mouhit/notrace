"use client";
import { useState, useEffect } from "react";
import ChatRegister from "./ChatRegister";
import ChatLogin from "./ChatLogin";
import { loadChatIdentity } from "@/lib/chat/crypto";

type AuthView = "loading" | "register" | "login";

interface Props {
  onAuthenticated: (username: string) => void;
}

export default function ChatAuth({ onAuthenticated }: Props) {
  const [view, setView] = useState<AuthView>("loading");

  useEffect(() => {
    const identity = loadChatIdentity();
    if (identity) {
      onAuthenticated(identity.username);
    } else {
      setView("register");
    }
  }, []);

  if (view === "loading") {
    return (
      <div style={{ minHeight: "100vh", background: "#050505", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }`}</style>
        <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#9fff00", animation: "pulse 1s ease-in-out infinite" }} />
      </div>
    );
  }

  if (view === "register") {
    return <ChatRegister onSuccess={(username) => onAuthenticated(username)} onSwitchToLogin={() => setView("login")} />;
  }

  if (view === "login") {
    return <ChatLogin onSuccess={(username) => onAuthenticated(username)} onSwitchToRegister={() => setView("register")} />;
  }

  return null;
}
