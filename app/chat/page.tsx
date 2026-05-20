"use client";
import { useState } from "react";
import ChatAuth from "@/components/chat/ChatAuth";
import ChatWindow from "@/components/chat/ChatWindow";

type AppState = "auth" | "chat";

export default function ChatPage() {
  const [appState, setAppState] = useState<AppState>("auth");
  const [username, setUsername] = useState("");
  const [privateKey, setPrivateKey] = useState("");

  const handleAuthenticated = (user: string, key: string) => {
    setUsername(user);
    setPrivateKey(key);
    setAppState("chat");
  };

  const handleLogout = () => {
    setUsername("");
    setPrivateKey("");
    setAppState("auth");
  };

  if (appState === "auth") {
    return <ChatAuth onAuthenticated={handleAuthenticated} onLogout={handleLogout} />;
  }

  return <ChatWindow username={username} onLogout={handleLogout} />;
}
