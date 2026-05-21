import { useState, useEffect } from "react";
import { toast } from "sonner";

interface ChatRequest {
  id: string;
  requester: string;
  recipient: string;
  status: "pending" | "accepted" | "rejected" | "cancelled";
  created_at: string;
}

interface UseRequestsReturn {
  incomingRequests: ChatRequest[];
  outgoingRequests: ChatRequest[];
  sendRequest: (recipient: string) => Promise<boolean>;
  acceptRequest: (requestId: string, requester: string) => Promise<string | null>;
  rejectRequest: (requestId: string) => Promise<boolean>;
  cancelRequest: (requestId: string) => Promise<boolean>;
  outgoingRequestAccepted: boolean;  // ✅ NEW: Track if sent request was accepted
  acceptedRoomId: string | null;     // ✅ NEW: Room ID when accepted
  acceptedWith: string | null;       // ✅ NEW: Who accepted the request
  checkAcceptanceStatus: () => Promise<void>; // ✅ NEW: Manual check function
}

export function useRequests(username: string): UseRequestsReturn {
  const [incomingRequests, setIncomingRequests] = useState<ChatRequest[]>([]);
  const [outgoingRequests, setOutgoingRequests] = useState<ChatRequest[]>([]);
  const [outgoingRequestAccepted, setOutgoingRequestAccepted] = useState(false);
  const [acceptedRoomId, setAcceptedRoomId] = useState<string | null>(null);
  const [acceptedWith, setAcceptedWith] = useState<string | null>(null);

  // ✅ NEW: Check if sent request was accepted
  const checkAcceptanceStatus = async () => {
    if (outgoingRequests.length === 0) return;

    try {
      const res = await fetch(`/api/chat/active?username=${username}`);
      const data = await res.json();

      if (data.hasActiveChat) {
        // ✅ Check if this active chat is from one of our outgoing requests
        const chatUser = data.activeChat.otherUser;
        const sentToThisUser = outgoingRequests.some((req) => req.recipient === chatUser);

        if (sentToThisUser) {
          // Request was accepted!
          setOutgoingRequestAccepted(true);
          setAcceptedRoomId(data.activeChat.room_id);
          setAcceptedWith(chatUser);
          console.log(`✅ Request to ${chatUser} was accepted! Room: ${data.activeChat.room_id}`);
        }
      }
    } catch (error) {
      console.error("Error checking acceptance status:", error);
    }
  };

  // Fetch incoming requests (existing)
  const fetchIncomingRequests = async () => {
    try {
      const res = await fetch(`/api/chat/requests?username=${username}`);
      const data = await res.json();
      setIncomingRequests(data.requests || []);
    } catch (error) {
      console.error("Error fetching incoming requests:", error);
    }
  };

  // Fetch outgoing requests (new - needs to be added)
  const fetchOutgoingRequests = async () => {
    try {
      const res = await fetch(`/api/chat/requests/outgoing?username=${username}`);
      const data = await res.json();
      setOutgoingRequests(data.requests || []);
    } catch (error) {
      console.error("Error fetching outgoing requests:", error);
    }
  };

  // Poll incoming AND outgoing requests + check acceptance
  useEffect(() => {
    fetchIncomingRequests();
    fetchOutgoingRequests();
    checkAcceptanceStatus(); // ✅ Check acceptance immediately

    const interval = setInterval(() => {
      fetchIncomingRequests();
      fetchOutgoingRequests();
      checkAcceptanceStatus(); // ✅ Check acceptance every 3 seconds
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
        fetchOutgoingRequests(); // ✅ Refresh outgoing requests
        return true;
      } else {
        toast.error(data.error || "Failed to send request");
        return false;
      }
    } catch (error) {
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
        fetchIncomingRequests(); // ✅ Refresh incoming requests
        setAcceptedRoomId(data.activeChat.room_id);
        setAcceptedWith(requester);
        return data.roomId;
      } else {
        toast.error(data.error || "Failed to accept request");
        return null;
      }
    } catch (error) {
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
        fetchIncomingRequests(); // ✅ Refresh incoming requests
        return true;
      } else {
        toast.error("Failed to reject request");
        return false;
      }
    } catch (error) {
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
        fetchOutgoingRequests(); // ✅ Refresh outgoing requests
        setOutgoingRequestAccepted(false);
        setAcceptedRoomId(null);
        setAcceptedWith(null);
        return true;
      } else {
        toast.error("Failed to cancel request");
        return false;
      }
    } catch (error) {
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
    outgoingRequestAccepted,  // ✅ NEW
    acceptedRoomId,           // ✅ NEW
    acceptedWith,             // ✅ NEW
    checkAcceptanceStatus,    // ✅ NEW
  };
}
