/**
 * types/chat.ts
 * TypeScript types for P2P chat system
 */

export interface ChatRequest {
  id: string;
  requester: string;
  recipient: string;
  status: "pending" | "accepted" | "rejected" | "cancelled";
  room_id?: string; // ✅ NEW: Add if request was accepted
  created_at: string;
}

export interface ActiveChat {
  id: string;
  user1: string;
  user2: string;
  room_id: string;
  status: "connected" | "disconnected";
  otherUser?: string; // ✅ NEW: From current user's perspective
  started_at: string;
}

export interface RequestResponse {
  requests: ChatRequest[];
  count: number;
}

export interface ActiveChatResponse {
  hasActiveChat: boolean;
  activeChat?: ActiveChat;
}

export interface ChatMessage {
  id: string;
  sender: string;
  content: string;
  timestamp: number;
  side: "sent" | "received";
  encrypted: boolean;
}

export interface WebRTCSignal {
  room_id: string;
  type: "offer" | "answer" | "ice-candidate";
  data: any;
  from: string;
  to: string;
  created_at?: string;
}

export interface UseRequestsReturn {
  incomingRequests: ChatRequest[];
  outgoingRequests: ChatRequest[];
  sendRequest: (recipient: string) => Promise<boolean>;
  acceptRequest: (requestId: string, requester: string) => Promise<string | null>;
  rejectRequest: (requestId: string) => Promise<boolean>;
  cancelRequest: (requestId: string) => Promise<boolean>;
  // ✅ NEW: Acceptance detection for requester side
  outgoingRequestAccepted: boolean;
  acceptedRoomId: string | null;
  acceptedWith: string | null;
  checkAcceptanceStatus: () => Promise<void>;
}

export interface UseWebRTCChatReturn {
  sendMessage: (message: string) => Promise<boolean>;
  peerConnection: RTCPeerConnection | null;
  connectionReady: boolean;
  connectionError: string | null;
  remoteStream: MediaStream | null;
}
