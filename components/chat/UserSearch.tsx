"use client";
import { useState } from "react";
import { Search, Send, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { toast } from "sonner";

const T = {
  bg: "#050505",
  card: "#0e0e0e",
  border: "#1a1a1a",
  accent: "#9fff00",
  text: "#f0f0f0",
  muted: "#666",
  font: "'JetBrains Mono', monospace",
};

interface SearchResult {
  found: boolean;
  username: string;
  public_key: string;
}

interface UserSearchProps {
  username: string;
  onRequestSent: (recipient: string) => void;
  outgoingRequests: Array<{ recipient: string; status: string }>;
  sendRequest: (recipient: string) => Promise<boolean>;
}

export default function UserSearch({
  username,
  onRequestSent,
  outgoingRequests,
  sendRequest,
}: UserSearchProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResult, setSearchResult] = useState<SearchResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ✅ Check if request already sent to this user
  const hasExistingRequest = (recipient: string) => {
    return outgoingRequests.some(
      (req) => req.recipient === recipient && req.status === "pending"
    );
  };

  // ✅ Search for user
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!searchQuery.trim() || searchQuery.trim().length < 3) {
      setError("Username must be at least 3 characters");
      return;
    }

    if (searchQuery.trim().toLowerCase() === username.toLowerCase()) {
      setError("You can't send a request to yourself!");
      return;
    }

    setSearching(true);
    setError(null);
    setSearchResult(null);

    try {
      const res = await fetch(
        `/api/chat/discover?username=${encodeURIComponent(searchQuery.trim())}`
      );
      const data = await res.json();

      if (data.found) {
        setSearchResult({
          found: true,
          username: data.username,
          public_key: data.public_key,
        });
      } else {
        setError("User not found");
        setSearchResult(null);
      }
    } catch (err) {
      console.error("Search error:", err);
      setError("Search failed. Please try again.");
    } finally {
      setSearching(false);
    }
  };

  // ✅ Send request to found user
  const handleSendRequest = async (recipient: string) => {
    setLoading(true);
    try {
      const success = await sendRequest(recipient);
      if (success) {
        setSearchQuery("");
        setSearchResult(null);
        onRequestSent(recipient);
        toast.success(`Request sent to @${recipient}!`);
      }
    } catch (err) {
      console.error("Send request error:", err);
      toast.error("Failed to send request");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        background: T.card,
        border: `1px solid ${T.border}`,
        borderRadius: 12,
        padding: 24,
        marginBottom: 24,
      }}
    >
      <h3 style={{ fontSize: 16, fontWeight: 700, color: T.text, margin: "0 0 16px" }}>
        🔍 Find Users
      </h3>

      {/* Search Form */}
      <form onSubmit={handleSearch} style={{ marginBottom: 16 }}>
        <div style={{ display: "flex", gap: 8 }}>
          <div style={{ flex: 1, position: "relative" }}>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setError(null);
              }}
              placeholder="Search username... (min 3 chars)"
              style={{
                width: "100%",
                padding: "10px 12px",
                paddingLeft: "36px",
                background: "#0a0a0a",
                border: `1px solid ${error ? "#ff4444" : T.border}`,
                borderRadius: 8,
                color: T.text,
                fontFamily: T.font,
                fontSize: 13,
                outline: "none",
              }}
            />
            <Search
              size={16}
              style={{
                position: "absolute",
                left: 12,
                top: "50%",
                transform: "translateY(-50%)",
                color: T.muted,
                pointerEvents: "none",
              }}
            />
          </div>

          <button
            type="submit"
            disabled={searching || !searchQuery.trim()}
            style={{
              padding: "10px 16px",
              background: T.accent,
              color: "#000",
              border: "none",
              borderRadius: 8,
              cursor: searching ? "wait" : "pointer",
              fontFamily: T.font,
              fontWeight: 700,
              fontSize: 12,
              display: "flex",
              alignItems: "center",
              gap: 6,
              opacity: !searchQuery.trim() ? 0.5 : 1,
            }}
          >
            {searching ? (
              <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} />
            ) : (
              <Search size={14} />
            )}
            Search
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div
            style={{
              marginTop: 8,
              padding: "8px 12px",
              background: "rgba(255, 68, 68, 0.1)",
              border: "1px solid #ff4444",
              borderRadius: 6,
              display: "flex",
              alignItems: "center",
              gap: 8,
              color: "#ff4444",
              fontSize: 12,
            }}
          >
            <AlertCircle size={14} />
            {error}
          </div>
        )}
      </form>

      {/* Search Result */}
      {searchResult && (
        <div
          style={{
            padding: 12,
            background: "#0a0a0a",
            border: `1px solid ${T.border}`,
            borderRadius: 8,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div>
            <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: T.text }}>
              @{searchResult.username}
            </p>
            <p
              style={{
                margin: "4px 0 0",
                fontSize: 11,
                color: T.muted,
                fontFamily: T.font,
              }}
            >
              {hasExistingRequest(searchResult.username)
                ? "✅ Request already sent"
                : "Ready to send request"}
            </p>
          </div>

          {hasExistingRequest(searchResult.username) ? (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                color: T.accent,
                fontSize: 12,
                fontWeight: 700,
              }}
            >
              <CheckCircle2 size={16} />
              Sent
            </div>
          ) : (
            <button
              onClick={() => handleSendRequest(searchResult.username)}
              disabled={loading}
              style={{
                padding: "8px 14px",
                background: T.accent,
                color: "#000",
                border: "none",
                borderRadius: 6,
                cursor: loading ? "wait" : "pointer",
                fontFamily: T.font,
                fontWeight: 700,
                fontSize: 12,
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              {loading ? (
                <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} />
              ) : (
                <Send size={14} />
              )}
              Send Request
            </button>
          )}
        </div>
      )}

      {/* Helper Text */}
      <p style={{ margin: "12px 0 0", fontSize: 11, color: T.muted }}>
        💡 Search for any username to send them a chat request
      </p>
    </div>
  );
}
