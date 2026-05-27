import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";

interface ChatRequest {
  id: string;
  requester: string;
  recipient: string;
  status: "pending" | "accepted" | "rejected" | "cancelled";
  created_at: string;
}

interface OutgoingRequest {
  id: string;
  requester: string;
  recipient: string;
  status: "pending" | "accepted" | "rejected" | "cancelled";
  created_at: string;
}

interface UseRequestsReturn {
  incomingRequests: ChatRequest[];
  outgoingRequests: OutgoingRequest[];
  sendRequest: (recipient: string) => Promise<boolean>;
  acceptRequest: (requestId: string, requester: string) => Promise<string | null>;
  rejectRequest: (requestId: string) => Promise<void>;
  cancelRequest: (requestId: string) => Promise<void>;
  outgoingRequestAccepted: boolean;
  acceptedRoomId: string | null;
  acceptedWith: string | null;
  error: string | null;
}

export function useRequests(username: string): UseRequestsReturn {
  const [incomingRequests, setIncomingRequests] = useState<ChatRequest[]>([]);
  const [outgoingRequests, setOutgoingRequests] = useState<OutgoingRequest[]>([]);
  const [outgoingRequestAccepted, setOutgoingRequestAccepted] = useState(false);
  const [acceptedRoomId, setAcceptedRoomId] = useState<string | null>(null);
  const [acceptedWith, setAcceptedWith] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const pendingSendRef = useRef<Set<string>>(new Set());
  const lastCancelRef = useRef<Map<string, number>>(new Map());

  const fetchIncomingRequests = async () => {
    try {
      const res = await fetch(`/api/chat/request?username=${username}`);
      const data = await res.json();
      setIncomingRequests(data.requests || []);
      setError(null);
    } catch (err) {
      console.error("Error fetching incoming requests:", err);
      setError("Failed to load incoming requests");
      setIncomingRequests([]);
    }
  };

  const fetchOutgoingRequests = async () => {
    try {
      const res = await fetch(`/api/chat/request/outgoing?username=${username}`);

      if (res.status === 404) {
        setOutgoingRequests([]);
        return;
      }

      const data = await res.json();
      setOutgoingRequests(data.requests || []);
      setError(null);
    } catch (err) {
      console.error("Error fetching outgoing requests:", err);
      setError("Failed to load outgoing requests");
      setOutgoingRequests([]);
    }
  };

  // ✅ IMPROVED: Better acceptance checking
  const checkAcceptanceStatus = async () => {
    if (outgoingRequests.length === 0) {
      console.log("No outgoing requests to check");
      return;
    }

    try {
      console.log(`🔵 Checking acceptance status for ${outgoingRequests.length} requests`);
      
      for (const req of outgoingRequests) {
        console.log(`  Checking: ${req.requester} → ${req.recipient}`);
        
        // ✅ FIX: Check active chats directly
        const activeRes = await fetch(`/api/chat/active?username=${username}`);
        const activeData = await activeRes.json();
        
        console.log("Active chats response:", activeData);
        
        if (activeData.activeChat) {
          const chat = activeData.activeChat;
          
          // Check if this is the chat we're looking for
          // Active chat has user1 and user2
          const isMatchingChat = 
            (chat.user1 === username && chat.user2 === req.recipient) ||
            (chat.user1 === req.recipient && chat.user2 === username);
          
          if (isMatchingChat && chat.room_id) {
            console.log(`✅ FOUND ACTIVE CHAT! Room: ${chat.room_id}`);
            setOutgoingRequestAccepted(true);
            setAcceptedRoomId(chat.room_id);
            setAcceptedWith(req.recipient);
            return;
          }
        }
      }
    } catch (err) {
      console.error("Error checking acceptance status:", err);
    }
  };

  const sendRequest = async (recipient: string): Promise<boolean> => {
    try {
      if (pendingSendRef.current.has(recipient)) {
        toast.info("Request already being sent...");
        return false;
      }

      const alreadySent = outgoingRequests.some(
        (req) => req.recipient === recipient && req.status === "pending"
      );
      if (alreadySent) {
        toast.info("Request already sent to this user");
        return false;
      }

      pendingSendRef.current.add(recipient);

      const res = await fetch("/api/chat/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requester: username, recipient }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success(`Request sent to @${recipient}`);
        await fetchOutgoingRequests();
        setError(null);
        return true;
      } else {
        if (res.status === 409) {
          toast.info(data.error || "Request already sent");
        } else {
          setError(data.error || "Failed to send request");
          toast.error(data.error || "Failed to send request");
        }
        return false;
      }
    } catch (error) {
      console.error("Error sending request:", error);
      setError("Failed to send request");
      toast.error("Failed to send request");
      return false;
    } finally {
      pendingSendRef.current.delete(recipient);
    }
  };

  const acceptRequest = async (requestId: string, requester: string): Promise<string | null> => {
    try {
      console.log(`🔵 Accepting request:`, { requestId, requester, recipient: username });

      const payload = { requestId, requester, recipient: username };
      console.log(`📤 Sending payload:`, payload);

      const res = await fetch("/api/chat/request/accept", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      console.log(`📥 Response status:`, res.status);

      const data = await res.json();
      console.log(`📥 Response data:`, data);

      if (res.ok) {
        console.log(`✅ Accept successful!`);
        toast.success(`Connected with @${requester}!`);
        fetchIncomingRequests();
        
        const roomId = data.roomId || data.activeChat?.room_id;
        if (roomId) {
          setAcceptedRoomId(roomId);
        }
        
        setAcceptedWith(requester);
        setError(null);
        return roomId || null;
      } else {
        console.error(`❌ Accept failed:`, data);
        setError(data.error || "Failed to accept request");
        toast.error(data.error || "Failed to accept request");
        return null;
      }
    } catch (error) {
      console.error("❌ Accept error:", error);
      setError("Network error");
      toast.error("Network error");
      return null;
    }
  };

  const rejectRequest = async (requestId: string) => {
    try {
      const res = await fetch("/api/chat/request/reject", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestId }),
      });

      if (res.ok) {
        toast.info("Request rejected");
        await fetchIncomingRequests();
        setError(null);
      } else {
        const data = await res.json();
        setError(data.error || "Failed to reject request");
        toast.error(data.error || "Failed to reject request");
      }
    } catch (error) {
      console.error("Error rejecting request:", error);
      setError("Failed to reject request");
      toast.error("Failed to reject request");
    }
  };

  const cancelRequest = async (requestId: string) => {
    try {
      const lastCancel = lastCancelRef.current.get(requestId) || 0;
      if (Date.now() - lastCancel < 1000) {
        toast.info("Already canceling...");
        return;
      }

      lastCancelRef.current.set(requestId, Date.now());

      const res = await fetch("/api/chat/request/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestId }),
      });

      if (res.ok) {
        toast.info("Request cancelled");
        setOutgoingRequests((prev) => prev.filter((req) => req.id !== requestId));
        setError(null);
      } else {
        const data = await res.json();
        setError(data.error || "Failed to cancel request");
        toast.error(data.error || "Failed to cancel request");
      }
    } catch (error) {
      console.error("Error canceling request:", error);
      setError("Failed to cancel request");
      toast.error("Failed to cancel request");
    }
  };

  useEffect(() => {
    if (!username) return;

    fetchIncomingRequests();
    fetchOutgoingRequests();
    checkAcceptanceStatus();

    const interval = setInterval(() => {
      console.log("🔄 Polling for requests...");
      fetchIncomingRequests();
      fetchOutgoingRequests();
      checkAcceptanceStatus(); // ✅ Check acceptance every 3 seconds
    }, 3000);

    return () => clearInterval(interval);
  }, [username]);

  return {
    incomingRequests,
    outgoingRequests,
    sendRequest,
    acceptRequest,
    rejectRequest,
    cancelRequest,
    outgoingRequestAccepted,
    acceptedRoomId,
    acceptedWith,
    error,
  };
}
