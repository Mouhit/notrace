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

  // ✅ NEW: Track pending send requests to prevent duplicates
  const pendingSendRef = useRef<Set<string>>(new Set());

  // ✅ NEW: Track last cancel time to prevent duplicate cancels
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
        // Endpoint doesn't exist yet
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

  const checkAcceptanceStatus = async () => {
    if (outgoingRequests.length === 0) return;

    try {
      for (const req of outgoingRequests) {
        const res = await fetch(`/api/chat/request/${req.id}`);
        if (res.ok) {
          const data = await res.json();
          if (data.status === "accepted") {
            setOutgoingRequestAccepted(true);
            setAcceptedRoomId(data.roomId);
            setAcceptedWith(req.recipient);
          }
        }
      }
    } catch (err) {
      console.error("Error checking acceptance status:", err);
    }
  };

  // ✅ FIXED: Send request with deduplication
  const sendRequest = async (recipient: string): Promise<boolean> => {
    try {
      // ✅ NEW: Check if request already pending for this recipient
      if (pendingSendRef.current.has(recipient)) {
        toast.info("Request already being sent...");
        return false;
      }

      // ✅ NEW: Check if request already exists in outgoing list
      const alreadySent = outgoingRequests.some(
        (req) => req.recipient === recipient && req.status === "pending"
      );
      if (alreadySent) {
        toast.info("Request already sent to this user");
        return false;
      }

      // ✅ NEW: Mark as pending
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
      // ✅ NEW: Remove from pending
      pendingSendRef.current.delete(recipient);
    }
  };

  // ✅ FIXED: Accept request
  const acceptRequest = async (requestId: string, requester: string): Promise<string | null> => {
    try {
      const res = await fetch("/api/chat/request/accept", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestId, requester }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success(`Connected with @${requester}!`);
        await fetchIncomingRequests();
        setError(null);
        return data.roomId;
      } else {
        setError(data.error || "Failed to accept request");
        toast.error(data.error || "Failed to accept request");
        return null;
      }
    } catch (error) {
      console.error("Error accepting request:", error);
      setError("Failed to accept request");
      toast.error("Failed to accept request");
      return null;
    }
  };

  // ✅ FIXED: Reject request
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

  // ✅ FIXED: Cancel request with duplicate prevention
  const cancelRequest = async (requestId: string) => {
    try {
      // ✅ NEW: Prevent duplicate cancels in same second
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
        // ✅ NEW: Immediately remove from state
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

  // Poll incoming AND outgoing requests + check acceptance
  useEffect(() => {
    if (!username) return;

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
