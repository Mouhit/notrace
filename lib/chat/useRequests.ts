import { useState, useEffect } from "react";
import { toast } from "sonner";

interface ChatRequest {
  id: string;
  requester: string;
  recipient: string;
  status: "pending" | "accepted" | "rejected" | "cancelled";
  room_id?: string;
  created_at: string;
}

interface UseRequestsReturn {
  incomingRequests: ChatRequest[];
  outgoingRequests: ChatRequest[];
  sendRequest: (recipient: string) => Promise<boolean>;
  acceptRequest: (requestId: string, requester: string) => Promise<string | null>;
  rejectRequest: (requestId: string) => Promise<boolean>;
  cancelRequest: (requestId: string) => Promise<boolean>;
  outgoingRequestAccepted: boolean;
  acceptedRoomId: string | null;
  acceptedWith: string | null;
  checkAcceptanceStatus: () => Promise<void>;
  // ✅ NEW: Error state
  error: string | null;
}

export function useRequests(username: string): UseRequestsReturn {
  const [incomingRequests, setIncomingRequests] = useState<ChatRequest[]>([]);
  const [outgoingRequests, setOutgoingRequests] = useState<ChatRequest[]>([]);
  const [outgoingRequestAccepted, setOutgoingRequestAccepted] = useState(false);
  const [acceptedRoomId, setAcceptedRoomId] = useState<string | null>(null);
  const [acceptedWith, setAcceptedWith] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null); // ✅ NEW: Error state

  // ✅ FIX: Check if sent request was accepted
  const checkAcceptanceStatus = async () => {
    if (outgoingRequests.length === 0) return;

    try {
      const res = await fetch(`/api/chat/active?username=${username}`);
      const data = await res.json();

      if (data.hasActiveChat) {
        const chatUser = data.activeChat.otherUser;
        const sentToThisUser = outgoingRequests.some((req) => req.recipient === chatUser);

        if (sentToThisUser) {
          setOutgoingRequestAccepted(true);
          setAcceptedRoomId(data.activeChat.room_id);
          setAcceptedWith(chatUser);
          setError(null); // ✅ FIX: Clear error on success
        }
      }
    } catch (error) {
      console.error("Error checking acceptance status:", error);
      // ✅ FIX: Don't show toast, just log
    }
  };

  // ✅ FIX: Add error handling to fetchIncomingRequests
  const fetchIncomingRequests = async () => {
    try {
      const res = await fetch(`/api/chat/request?username=${username}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setIncomingRequests(data.requests || []);
      setError(null); // ✅ FIX: Clear error on success
    } catch (error) {
      console.error("Error fetching incoming requests:", error);
      setError("Failed to load incoming requests");
      setIncomingRequests([]); // ✅ FIX: Clear on error
    }
  };

  // ✅ FIX: Add error handling to fetchOutgoingRequests
  const fetchOutgoingRequests = async () => {
    try {
      // ✅ FIX: Check if endpoint exists (graceful fallback)
      const res = await fetch(`/api/chat/request/outgoing?username=${username}`);
      if (!res.ok) {
        if (res.status === 404) {
          console.warn("Outgoing requests endpoint not found");
          setOutgoingRequests([]); // ✅ FIX: Return empty list if 404
          return;
        }
        throw new Error(`HTTP ${res.status}`);
      }
      const data = await res.json();
      setOutgoingRequests(data.requests || []);
      setError(null); // ✅ FIX: Clear error on success
    } catch (error) {
      console.error("Error fetching outgoing requests:", error);
      setError("Failed to load outgoing requests");
      setOutgoingRequests([]); // ✅ FIX: Clear on error
    }
  };

  // Poll incoming AND outgoing requests + check acceptance
  useEffect(() => {
    fetchIncomingRequests();
    fetchOutgoingRequests();
    checkAcceptanceStatus();

    const interval = setInterval(() => {
      fetchIncomingRequests();
      fetchOutgoingRequests();
      checkAcceptanceStatus();
    }, 3000);

    return () => clearInterval(interval);
  }, [username]);

  // Send request
  const sendRequest = async (recipient: string): Promise<boolean> => {
    try {
      const res = await fetch("/api/chat/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requester: username, recipient }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success(`Request sent to @${recipient}`);
        fetchOutgoingRequests();
        setError(null); // ✅ FIX: Clear error
        return true;
      } else {
        setError(data.error || "Failed to send request");
        toast.error(data.error || "Failed to send request");
        return false;
      }
    } catch (error) {
      setError("Network error");
      toast.error("Network error");
      console.error(error);
      return false;
    }
  };

  // Accept request
  const acceptRequest = async (requestId: string, requester: string): Promise<string | null> => {
    try {
      const res = await fetch("/api/chat/request/accept", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestId, requester, recipient: username }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success(`Connected with @${requester}!`);
        fetchIncomingRequests();
        setAcceptedRoomId(data.activeChat.room_id);
        setAcceptedWith(requester);
        setError(null); // ✅ FIX: Clear error
        return data.roomId;
      } else {
        setError(data.error || "Failed to accept request");
        toast.error(data.error || "Failed to accept request");
        return null;
      }
    } catch (error) {
      setError("Network error");
      toast.error("Network error");
      console.error(error);
      return null;
    }
  };

  // Reject request
  const rejectRequest = async (requestId: string): Promise<boolean> => {
    try {
      const res = await fetch("/api/chat/request/reject", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestId }),
      });

      if (res.ok) {
        toast.info("Request rejected");
        fetchIncomingRequests();
        setError(null); // ✅ FIX: Clear error
        return true;
      } else {
        setError("Failed to reject request");
        toast.error("Failed to reject request");
        return false;
      }
    } catch (error) {
      setError("Network error");
      toast.error("Network error");
      console.error(error);
      return false;
    }
  };

  // Cancel request
  const cancelRequest = async (requestId: string): Promise<boolean> => {
    try {
      const res = await fetch("/api/chat/request/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestId }),
      });

      if (res.ok) {
        toast.info("Request cancelled");
        fetchOutgoingRequests();
        setOutgoingRequestAccepted(false);
        setAcceptedRoomId(null);
        setAcceptedWith(null);
        setError(null); // ✅ FIX: Clear error
        return true;
      } else {
        setError("Failed to cancel request");
        toast.error("Failed to cancel request");
        return false;
      }
    } catch (error) {
      setError("Network error");
      toast.error("Network error");
      console.error(error);
      return false;
    }
  };

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
    checkAcceptanceStatus,
    error, // ✅ NEW: Return error state
  };
}
