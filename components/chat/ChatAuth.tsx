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

  // ✅ FIX: Handle ChatRegister/ChatLogin callbacks that return only username
  // They internally get privateKey, so we need to reconstruct it
  const handleRegistered = (registeredUsername: string) => {
    setUsername(registeredUsername);
    setView("chat");
    // Temporarily use empty privateKey - it will be set from IndexedDB or session
    onAuthenticated(registeredUsername, "");
  };

  // ✅ Same for login
  const handleLoggedIn = (loggedInUsername: string) => {
    setUsername(loggedInUsername);
    setView("chat");
    // Temporarily use empty privateKey - it will be set from IndexedDB or session
    onAuthenticated(loggedInUsername, "");
  };

  const handleLogout = () => {
    setUsername("");
    setPrivateKey("");
    setView("login");
    onLogout();
  };

  // Chat view - user is authenticated
  if (view === "chat") {
    return (
      <ChatWindow
        username={username}
        privateKey={privateKey}
        onLogout={handleLogout}
      />
    );
  }

  // Login view
  if (view === "login") {
    return (
      <ChatLogin
        onLoggedIn={handleLoggedIn}
        onSwitchToRegister={() => setView("register")}
      />
    );
  }

  // Register view
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
