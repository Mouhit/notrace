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
    // Check if user is authenticated
    const checkAuth = async () => {
      try {
        // Try to get user from session/localStorage
        const storedUser = localStorage.getItem("chatUser");
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
        }
      } catch (error) {
        console.error("Auth check error:", error);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const handleAuthenticated = (username: string, privateKey: string) => {
    const userData = { username, privateKey };
    setUser(userData);
    localStorage.setItem("chatUser", JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
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
