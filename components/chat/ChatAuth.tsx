"use client";
import { useState } from "react";
import ChatRegister from "./ChatRegister";
import ChatLogin from "./ChatLogin";
import ChatWindow from "./ChatWindow";

interface ChatAuthProps {
  onAuthenticated: (username: string, privateKey: string) => void;
  onLogout: () => void;
}

type ViewType = "login" | "register" | "chat";

export default function ChatAuth({ onAuthenticated, onLogout }: ChatAuthProps) {
  const [view, setView] = useState<ViewType>("login");
  const [username, setUsername] = useState("");
  const [privateKey, setPrivateKey] = useState("");

  // ✅ Wrapper that accepts 2 arguments
  const handleAuthenticated = (authUsername: string, authPrivateKey: string) => {
    setUsername(authUsername);
    setPrivateKey(authPrivateKey);
    setView("chat");
    onAuthenticated(authUsername, authPrivateKey);
  };

  const handleLogout = () => {
    setUsername("");
    setPrivateKey("");
    setView("login");
    onLogout();
  };

  if (view === "chat") {
    return (
      <ChatWindow
        username={username}
        privateKey={privateKey}
        onLogout={handleLogout}
      />
    );
  }

  if (view === "login") {
    return (
      <ChatLogin
        onLoggedIn={handleAuthenticated}
        onSwitchToRegister={() => setView("register")}
      />
    );
  }

  if (view === "register") {
    return (
      <ChatRegister
        onRegistered={handleAuthenticated}
        onSwitchToLogin={() => setView("login")}
      />
    );
  }

  return null;
}
