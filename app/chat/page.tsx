"use client";
import { useState, useEffect } from "react";
import ChatAuth from "@/components/chat/ChatAuth";
import ChatWindow from "@/components/chat/ChatWindow";

interface ChatUser {
  username: string;
  privateKey: string;
}

export default function ChatPage() {
  const [user, setUser] = useState<ChatUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // ✅ FIX: Don't store privateKey in localStorage (security issue)
    // Only restore username from session if available
    const checkAuth = async () => {
      try {
        // Check if there's a session (could be from session storage, not localStorage)
        // For now, user must login on each page reload (safer)
        setLoading(false);
      } catch (error) {
        console.error("Auth check error:", error);
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const handleAuthenticated = (username: string, privateKey: string) => {
    // ✅ FIX: Keep privateKey in memory ONLY (not in localStorage)
    const userData = { username, privateKey };
    setUser(userData);
    
    // ✅ FIX: NEVER store privateKey in localStorage
    // Only store username if you need persistence
    // localStorage.setItem("username", username);
    // But NOT the privateKey!
  };

  const handleLogout = () => {
    setUser(null);
    // ✅ FIX: Clear any sensitive data
    localStorage.removeItem("chatUser");
  };

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: "#050505", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p style={{ color: "#f0f0f0" }}>Loading...</p>
      </div>
    );
  }

  // Not authenticated - show login/register
  if (!user) {
    return <ChatAuth onAuthenticated={handleAuthenticated} onLogout={handleLogout} />;
  }

  // Authenticated - show chat window
  return <ChatWindow username={user.username} privateKey={user.privateKey} onLogout={handleLogout} />;
}
