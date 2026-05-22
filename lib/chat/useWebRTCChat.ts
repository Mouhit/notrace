import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";

interface UseWebRTCChatReturn {
  sendMessage: (message: string) => Promise<boolean>;
  peerConnection: RTCPeerConnection | null;
  connectionReady: boolean;
  connectionError: string | null;
  remoteStream: MediaStream | null;
}

export function useWebRTCChat(roomId: string, username: string, otherUser: string): UseWebRTCChatReturn {
  const [connectionReady, setConnectionReady] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);

  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const dataChannelRef = useRef<RTCDataChannel | null>(null);
  const signalPollIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const offerGeneratedRef = useRef(false);
  const answerGeneratedRef = useRef(false);

  // ✅ Initialize WebRTC Connection
  const initializePeerConnection = async () => {
    try {
      const pc = new RTCPeerConnection({
        iceServers: [
          { urls: ["stun:stun.l.google.com:19302"] },
          { urls: ["stun:stun1.l.google.com:19302"] },
        ],
      });

      // ✅ Create data channel for messaging
      const dataChannel = pc.createDataChannel("chat", { ordered: true });
      setupDataChannel(dataChannel);
      dataChannelRef.current = dataChannel;

      // Handle incoming data channels
      pc.ondatachannel = (event) => {
        setupDataChannel(event.channel);
        dataChannelRef.current = event.channel;
      };

      // Handle connection state changes
      pc.onconnectionstatechange = () => {
        console.log(`Connection state: ${pc.connectionState}`);

        if (pc.connectionState === "connected" || pc.connectionState === "completed") {
          setConnectionReady(true);
          toast.success("Connected to peer!");
        } else if (pc.connectionState === "failed" || pc.connectionState === "disconnected") {
          setConnectionReady(false);
          setConnectionError("Connection lost");
        }
      };

      // Handle ICE candidates
      pc.onicecandidate = async (event) => {
        if (event.candidate) {
          await storeICECandidate(event.candidate);
        }
      };

      peerConnectionRef.current = pc;
      return pc;
    } catch (error) {
      console.error("Failed to initialize peer connection:", error);
      setConnectionError("Failed to initialize connection");
      return null;
    }
  };

  // ✅ Setup data channel
  const setupDataChannel = (dataChannel: RTCDataChannel) => {
    dataChannel.onopen = () => {
      console.log("Data channel opened");
      setConnectionReady(true);
    };

    dataChannel.onclose = () => {
      console.log("Data channel closed");
      setConnectionReady(false);
    };

    dataChannel.onerror = (error) => {
      console.error("Data channel error:", error);
      setConnectionError("Data channel error");
    };

    dataChannel.onmessage = (event) => {
      console.log("Message received:", event.data);
      // Parent component handles message display
    };
  };

  // ✅ Generate and store WebRTC offer
  const generateOffer = async (pc: RTCPeerConnection) => {
    if (offerGeneratedRef.current) return;

    try {
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      await fetch("/api/chat/signal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          room_id: roomId,
          type: "offer",
          data: offer,
          from: username,
          to: otherUser,
        }),
      });

      offerGeneratedRef.current = true;
      console.log("✅ Offer generated and stored");
    } catch (error) {
      console.error("Failed to generate offer:", error);
      setConnectionError("Failed to generate offer");
    }
  };

  // ✅ Generate and store WebRTC answer
  const generateAnswer = async (pc: RTCPeerConnection, offer: any) => {
    if (answerGeneratedRef.current) return;

    try {
      await pc.setRemoteDescription(new RTCSessionDescription(offer));

      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      await fetch("/api/chat/signal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          room_id: roomId,
          type: "answer",
          data: answer,
          from: username,
          to: otherUser,
        }),
      });

      answerGeneratedRef.current = true;
      console.log("✅ Answer generated and stored");
    } catch (error) {
      console.error("Failed to generate answer:", error);
      setConnectionError("Failed to generate answer");
    }
  };

  // ✅ Fetch and apply answer
  const applyAnswerIfFound = async (pc: RTCPeerConnection) => {
    try {
      const res = await fetch(`/api/chat/signal?room_id=${roomId}&type=answer&from=${otherUser}`);
      const data = await res.json();

      if (data.signals && data.signals.length > 0) {
        const answerData = data.signals[0].data;
        if (pc.remoteDescription === null) {
          await pc.setRemoteDescription(new RTCSessionDescription(answerData));
          console.log("✅ Answer applied");
        }
      }
    } catch (error) {
      console.error("Failed to apply answer:", error);
    }
  };

  // ✅ Store ICE candidate
  const storeICECandidate = async (candidate: RTCIceCandidate) => {
    try {
      await fetch("/api/chat/signal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          room_id: roomId,
          type: "ice-candidate",
          data: candidate,
          from: username,
          to: otherUser,
        }),
      });
    } catch (error) {
      console.error("Failed to store ICE candidate:", error);
    }
  };

  // ✅ Fetch and add ICE candidates
  const applyICECandidates = async (pc: RTCPeerConnection) => {
    try {
      const res = await fetch(`/api/chat/signal?room_id=${roomId}&type=ice-candidate&from=${otherUser}`);
      const data = await res.json();

      if (data.signals) {
        for (const signal of data.signals) {
          try {
            await pc.addIceCandidate(new RTCIceCandidate(signal.data));
          } catch (error) {
            console.error("Failed to add ICE candidate:", error);
          }
        }
      }
    } catch (error) {
      console.error("Failed to fetch ICE candidates:", error);
    }
  };

  // ✅ Main WebRTC handshake logic - BOTH SIDES EXECUTE THIS
  const startWebRTCHandshake = async () => {
    const pc = await initializePeerConnection();
    if (!pc) return;

    console.log(`Starting WebRTC handshake for ${username} with ${otherUser}`);

    // ✅ Poll for signals every 1 second (more frequent)
    signalPollIntervalRef.current = setInterval(async () => {
      try {
        // Check if we have incoming offer
        const offerRes = await fetch(`/api/chat/signal?room_id=${roomId}&type=offer&from=${otherUser}`);
        const offerData = await offerRes.json();

        if (offerData.signals && offerData.signals.length > 0 && !answerGeneratedRef.current) {
          // ✅ We have an offer - generate answer
          console.log(`${username} received offer from ${otherUser}`);
          await generateAnswer(pc, offerData.signals[0].data);
        } else if (!offerGeneratedRef.current && !answerGeneratedRef.current) {
          // ✅ No offer found - generate our own offer
          console.log(`${username} generating offer (no offer from ${otherUser})`);
          await generateOffer(pc);
        }

        // Check for answer if we sent offer
        if (offerGeneratedRef.current && !answerGeneratedRef.current) {
          await applyAnswerIfFound(pc);
        }

        // Exchange ICE candidates
        await applyICECandidates(pc);
      } catch (error) {
        console.error("Error in WebRTC handshake loop:", error);
      }
    }, 1000);
  };

  // ✅ Send message via data channel
  const sendMessage = async (message: string): Promise<boolean> => {
    try {
      if (!dataChannelRef.current || dataChannelRef.current.readyState !== "open") {
        toast.error("Connection not ready. Please wait...");
        return false;
      }

      dataChannelRef.current.send(
        JSON.stringify({
          text: message,
          sender: username,
          timestamp: Date.now(),
        })
      );

      return true;
    } catch (error) {
      console.error("Failed to send message:", error);
      toast.error("Failed to send message");
      return false;
    }
  };

  // Initialize on mount
  useEffect(() => {
    if (roomId && username && otherUser) {
      startWebRTCHandshake();
    }

    return () => {
      if (signalPollIntervalRef.current) {
        clearInterval(signalPollIntervalRef.current);
      }
      if (peerConnectionRef.current) {
        peerConnectionRef.current.close();
      }
    };
  }, [roomId, username, otherUser]);

  return {
    sendMessage,
    peerConnection: peerConnectionRef.current,
    connectionReady,
    connectionError,
    remoteStream,
  };
}
