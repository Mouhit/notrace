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
  const [privateKey, setPrivateKey] = useState(""); // ✅ FIX: Add privateKey state

  // ✅ FIX: Store BOTH username and privateKey when authenticated
  const handleAuthenticated = (authenticatedUsername: string, authenticatedPrivateKey: string) => {
    setUsername(authenticatedUsername);
    setPrivateKey(authenticatedPrivateKey); // ✅ FIX: Store privateKey
    setView("chat");
    onAuthenticated(authenticatedUsername, authenticatedPrivateKey);
  };

  const handleLogout = () => {
    setUsername("");
    setPrivateKey(""); // ✅ FIX: Clear privateKey on logout
    setView("login");
    onLogout();
  };

  // Chat view - user is authenticated
  if (view === "chat") {
    return (
      <ChatWindow
        username={username}
        privateKey={privateKey} // ✅ FIX: Pass privateKey to ChatWindow
        onLogout={handleLogout}
      />
    );
  }

  // Login view
  if (view === "login") {
    return (
      <ChatLogin
        onLoggedIn={handleAuthenticated} // ✅ FIX: Pass full handler
        onSwitchToRegister={() => setView("register")}
      />
    );
  }

  // Register view
  if (view === "register") {
    return (
      <ChatRegister
        onRegistered={handleAuthenticated} // ✅ FIX: Pass full handler
        onSwitchToLogin={() => setView("login")}
      />
    );
  }

  return null;
}
