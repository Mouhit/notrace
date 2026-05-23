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

  // ✅ FIXED: Now accepts 2 args to match ChatLogin callback signature
  const handleLoggedIn = (loggedInUsername: string, loggedInPrivateKey: string) => {
    setUsername(loggedInUsername);
    setPrivateKey(loggedInPrivateKey);
    setView("chat");
    onAuthenticated(loggedInUsername, loggedInPrivateKey);
  };

  // ✅ OK: Accepts 1 arg to match ChatRegister callback signature
  const handleRegistered = (registeredUsername: string) => {
    setUsername(registeredUsername);
    setView("chat");
    onAuthenticated(registeredUsername, "");
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
        onLoggedIn={handleLoggedIn}
        onSwitchToRegister={() => setView("register")}
      />
    );
  }

  if (view === "register") {
    return (
      <ChatRegister
        onRegistered={handleRegistered}
        onSwitchToLogin={() => setView("login")}
      />
    );
  }

  return null;
}
