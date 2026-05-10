"use client";
import { useState } from "react";
import ChatAuth from "@/components/chat/ChatAuth";
import ChatWindow from "@/components/chat/ChatWindow";
import { clearChatIdentity } from "@/lib/chat/crypto";

type AppState = "auth" | "chat";

export default function ChatPage() {
  const [appState, setAppState] = useState<AppState>("auth");
  const [username, setUsername] = useState("");

  const handleAuthenticated = (user: string) => {
    setUsername(user);
    setAppState("chat");
  };

  const handleLogout = () => {
    clearChatIdentity();
    setUsername("");
    setAppState("auth");
  };

  if (appState === "auth") {
    return <ChatAuth onAuthenticated={handleAuthenticated} />;
  }

  return <ChatWindow username={username} onLogout={handleLogout} />;
}
