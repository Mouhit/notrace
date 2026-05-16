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
  loading: boolean;
  error: string | null;
  sendRequest: (recipient: string) => Promise<boolean>;
  acceptRequest: (requestId: string, requester: string) => Promise<string | null>;
  rejectRequest: (requestId: string) => Promise<boolean>;
  cancelRequest: (requestId: string) => Promise<boolean>;
  refreshRequests: () => Promise<void>;
}

export function useRequests(username: string): UseRequestsReturn {
  const [incomingRequests, setIncomingRequests] = useState<ChatRequest[]>([]);
  const [outgoingRequests, setOutgoingRequests] = useState<ChatRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch pending requests for this user
  const refreshRequests = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/chat/request?username=${username}`);
      const data = await res.json();

      if (res.ok) {
        setIncomingRequests(data.requests || []);
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError("Failed to fetch requests");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Send chat request
  const sendRequest = async (recipient: string): Promise<boolean> => {
    try {
      const res = await fetch("/api/chat/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requester: username, recipient }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success("Chat request sent!");
        setOutgoingRequests([
          ...outgoingRequests,
          {
            id: data.requestId,
            requester: username,
            recipient,
            status: "pending",
            created_at: new Date().toISOString(),
          },
        ]);
        return true;
      } else {
        setError(data.error);
        toast.error(data.error || "Failed to send request");
        return false;
      }
    } catch (err) {
      setError("Failed to send request");
      console.error(err);
      return false;
    }
  };

  // Accept incoming request
  const acceptRequest = async (requestId: string, requester: string): Promise<string | null> => {
    try {
      const res = await fetch("/api/chat/request/accept", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requestId,
          requester,
          recipient: username,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success("Request accepted!");
        setIncomingRequests(incomingRequests.filter((r) => r.id !== requestId));
        return data.roomId;
      } else {
        setError(data.error);
        toast.error(data.error || "Failed to accept request");
        return null;
      }
    } catch (err) {
      setError("Failed to accept request");
      console.error(err);
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
        toast.success("Request rejected");
        setIncomingRequests(incomingRequests.filter((r) => r.id !== requestId));
        return true;
      } else {
        const data = await res.json();
        setError(data.error);
        return false;
      }
    } catch (err) {
      setError("Failed to reject request");
      console.error(err);
      return false;
    }
  };

  // Cancel sent request
  const cancelRequest = async (requestId: string): Promise<boolean> => {
    try {
      const res = await fetch("/api/chat/request/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestId }),
      });

      if (res.ok) {
        toast.success("Request cancelled");
        setOutgoingRequests(outgoingRequests.filter((r) => r.id !== requestId));
        return true;
      } else {
        const data = await res.json();
        setError(data.error);
        return false;
      }
    } catch (err) {
      setError("Failed to cancel request");
      console.error(err);
      return false;
    }
  };

  // Poll for incoming requests every 3 seconds
  useEffect(() => {
    if (!username) return;

    refreshRequests();
    const interval = setInterval(refreshRequests, 3000);

    return () => clearInterval(interval);
  }, [username]);

  return {
    incomingRequests,
    outgoingRequests,
    loading,
    error,
    sendRequest,
    acceptRequest,
    rejectRequest,
    cancelRequest,
    refreshRequests,
  };
}
