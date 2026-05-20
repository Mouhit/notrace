"use client";
import { useState } from "react";
import ChatRegister from "./ChatRegister";
import ChatLogin from "./ChatLogin";
import ChatWindow from "./ChatWindow";

interface ChatAuthProps {
  onAuthenticated: (username: string, privateKey: string) => void;
  onLogout: () => void;
}

type AuthView = "register" | "login" | "chat";

export default function ChatAuth({ onAuthenticated, onLogout }: ChatAuthProps) {
  const [view, setView] = useState<AuthView>("login");
  const [username, setUsername] = useState("");

  if (view === "register") {
    return (
      <ChatRegister
        onRegistered={(username) => {
          setUsername(username);
          setView("login");
        }}
        onSwitchToLogin={() => setView("login")}
      />
    );
  }

  if (view === "login") {
    return (
      <ChatLogin
        onLoggedIn={(username, privateKey) => {
          setUsername(username);
          onAuthenticated(username, privateKey);
          setView("chat");
        }}
        onSwitchToRegister={() => setView("register")}
      />
    );
  }

  if (view === "chat") {
    return (
      <ChatWindow
        username={username}
        onLogout={() => {
          setView("login");
          onLogout();
        }}
      />
    );
  }

  return null;
}
