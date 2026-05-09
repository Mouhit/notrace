"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import { createClient } from "@supabase/supabase-js";
import { useWebRTCChat } from "@/lib/chat/useWebRTCChat";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function ChatPage() {
  const [localUsername, setLocalUsername] = useState<string | null>(null);
  const [users, setUsers] = useState<string[]>([]);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [chatState, setChatState] = useState<
    "idle" | "initiating" | "waiting-acceptance" | "accepted" | "chatting"
  >("idle");
  const [incomingRequest, setIncomingRequest] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const presenceChannelRef = useRef<any>(null);
  const roomId = selectedUser
    ? [localUsername, selectedUser].sort().join("-")
    : null;

  // Load username from localStorage
  useEffect(() => {
    const stored = localStorage.getItem("chatUsername");
    if (stored) {
      setLocalUsername(stored);
    }
  }, []);

  // Subscribe to presence channel to see who's online
  useEffect(() => {
    if (!localUsername) return;

    const channel = supabase.channel("presence-all", {
      config: { presence: { key: localUsername } },
    });

    channel.on("presence", { event: "sync" }, () => {
      const state = channel.presenceState();
      const onlineUsers = Object.keys(state).filter(
        (u) => u !== localUsername
      );
      setUsers(onlineUsers);
    });

    channel.on("presence", { event: "join" }, ({ key }: any) => {
      if (key !== localUsername) {
        setUsers((prev) => [...new Set([...prev, key])]);
      }
    });

    channel.on("presence", { event: "leave" }, ({ key }: any) => {
      setUsers((prev) => prev.filter((u) => u !== key));
    });

    channel.subscribe(async (status) => {
      if (status === "SUBSCRIBED") {
        await channel.track({
          username: localUsername,
          status: "online",
          timestamp: Date.now(),
        });
      }
    });

    presenceChannelRef.current = channel;

    return () => {
      channel.unsubscribe();
    };
  }, [localUsername]);

  // Listen for chat requests on a dedicated channel
  useEffect(() => {
    if (!localUsername) return;

    const channel = supabase.channel(`chat-requests:${localUsername}`);

    channel.on("broadcast", { event: "request" }, ({ payload }: any) => {
      if (payload.to === localUsername && payload.from !== localUsername) {
        setIncomingRequest(payload.from);
        setChatState("idle");
      }
    });

    channel.on("broadcast", { event: "accepted" }, ({ payload }: any) => {
      if (payload.initiator === localUsername) {
        setChatState("accepted");
      }
    });

    channel.subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [localUsername]);

  // Initiate chat
  const initiateChat = useCallback(
    async (target: string) => {
      if (!localUsername) return;

      setSelectedUser(target);
      setChatState("initiating");

      const channel = supabase.channel(`chat-requests:${target}`);
      channel.subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          await channel.send({
            type: "broadcast",
            event: "request",
            payload: { from: localUsername, to: target },
          });
          channel.unsubscribe();
          setChatState("waiting-acceptance");
        }
      });
    },
    [localUsername]
  );

  // Accept incoming chat request
  const acceptChat = useCallback(
    async (from: string) => {
      if (!localUsername) return;

      setSelectedUser(from);
      setIncomingRequest(null);

      const channel = supabase.channel(`chat-requests:${from}`);
      channel.subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          await channel.send({
            type: "broadcast",
            event: "accepted",
            payload: { initiator: from, acceptor: localUsername },
          });
          channel.unsubscribe();
          setChatState("accepted");
        }
      });
    },
    [localUsername]
  );

  // Reject incoming chat request
  const rejectChat = useCallback(() => {
    setIncomingRequest(null);
  }, []);

  // WebRTC hook (only runs when both sides have accepted)
  const { isConnected, sendMessage } = useWebRTCChat({
    roomId: roomId!,
    localUsername: localUsername!,
    remoteUsername: selectedUser!,
    onMessage: (msg) => {
      setMessages((prev) => [...prev, msg]);
    },
    onConnectionChange: (state) => {
      if (state === "connected") {
        setChatState("chatting");
      }
    },
  });

  if (!localUsername) {
    return <div>Loading user...</div>;
  }

  return (
    <div className="flex h-screen gap-4 p-4">
      {/* Left: User List */}
      <div className="w-1/4 border rounded p-4">
        <h2 className="font-bold mb-4">Online Users</h2>
        {users.length === 0 ? (
          <p className="text-gray-500">No users online</p>
        ) : (
          <div className="space-y-2">
            {users.map((user) => (
              <button
                key={user}
                onClick={() => initiateChat(user)}
                disabled={chatState !== "idle"}
                className="w-full p-2 bg-blue-500 text-white rounded disabled:bg-gray-400"
              >
                Chat with {user}
              </button>
            ))}
          </div>
        )}

        {/* Incoming Request */}
        {incomingRequest && (
          <div className="mt-6 p-4 bg-yellow-100 rounded">
            <p className="font-bold mb-2">{incomingRequest} wants to chat</p>
            <button
              onClick={() => acceptChat(incomingRequest)}
              className="w-full p-2 bg-green-500 text-white rounded mb-2"
            >
              Accept
            </button>
            <button
              onClick={rejectChat}
              className="w-full p-2 bg-red-500 text-white rounded"
            >
              Reject
            </button>
          </div>
        )}
      </div>

      {/* Right: Chat View */}
      <div className="w-3/4 border rounded p-4 flex flex-col">
        {selectedUser ? (
          <>
            <h2 className="font-bold mb-2">
              Chat with {selectedUser} [{chatState}]
            </h2>
            <p className={isConnected ? "text-green-600" : "text-red-600"}>
              {isConnected ? "Connected" : "Connecting..."}
            </p>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto border rounded p-2 mb-4 bg-gray-50">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`mb-2 p-2 rounded ${
                    msg.from === localUsername
                      ? "bg-blue-200"
                      : "bg-gray-200"
                  }`}
                >
                  <strong>{msg.from}:</strong> {msg.text}
                </div>
              ))}
            </div>

            {/* Input */}
            {isConnected && (
              <ChatInput
                onSend={(text) => {
                  const msg = sendMessage(text, localUsername);
                  if (msg) setMessages((prev) => [...prev, msg]);
                }}
              />
            )}
          </>
        ) : (
          <p className="text-gray-500">Select a user to start chatting</p>
        )}
      </div>
    </div>
  );
}

function ChatInput({ onSend }: { onSend: (text: string) => void }) {
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (input.trim()) {
      onSend(input);
      setInput("");
    }
  };

  return (
    <div className="flex gap-2">
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyPress={(e) => e.key === "Enter" && handleSend()}
        placeholder="Type a message..."
        className="flex-1 border rounded p-2"
      />
      <button
        onClick={handleSend}
        className="px-4 py-2 bg-blue-500 text-white rounded"
      >
        Send
      </button>
    </div>
  );
}
