import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";

interface UseWebRTCChatReturn {
  sendMessage: (message: string) => Promise<boolean>;
  peerConnection: RTCPeerConnection | null;
  connectionReady: boolean;
  connectionError: string | null;
  remoteStream: MediaStream | null;
}

const MAX_POLLING_DURATION = 120000;
const POLLING_INTERVAL = 500;
const CONNECTION_TIMEOUT = 60000;

export function useWebRTCChat(roomId: string, username: string, otherUser: string): UseWebRTCChatReturn {
  const [connectionReady, setConnectionReady] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);

  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const dataChannelRef = useRef<RTCDataChannel | null>(null);
  const signalPollIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const connectionTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const offerGeneratedRef = useRef(false);
  const answerGeneratedRef = useRef(false);
  const processedICECandidatesRef = useRef<Set<string>>(new Set());
  const pollStartTimeRef = useRef<number>(0);
  const failedFetchCountRef = useRef<number>(0);
  const messagesReceivedRef = useRef<number>(0); // ✅ Track if messages are flowing
  const lastMessageTimeRef = useRef<number>(0); // ✅ Track last message time

  const initializePeerConnection = async () => {
    try {
      const pc = new RTCPeerConnection({
        iceServers: [
          { urls: ["stun:stun.l.google.com:19302"] },
          { urls: ["stun:stun1.l.google.com:19302"] },
          { urls: ["stun:stun2.l.google.com:19302"] },
          { urls: ["stun:stun3.l.google.com:19302"] },
          { urls: ["stun:stun4.l.google.com:19302"] },
          { urls: ["stun:stun.l.temasys.sg:3478"] },
          { urls: ["stun:stun2.l.temasys.sg:3478"] },
          { urls: ["stun:stun.twiliocdn.com:3478"] },
          { urls: ["stun:stun.services.mozilla.com:3478"] },
        ],
        iceCandidatePoolSize: 10,
      });

      const dataChannel = pc.createDataChannel("chat", { ordered: true });
      setupDataChannel(dataChannel);
      dataChannelRef.current = dataChannel;

      pc.ondatachannel = (event) => {
        console.log("🔵 Received data channel from remote peer");
        setupDataChannel(event.channel);
        dataChannelRef.current = event.channel;
      };

      pc.onconnectionstatechange = () => {
        console.log(`📊 Connection state: ${pc.connectionState}`);

        if (pc.connectionState === "connected") {
          setConnectionReady(true);
          setConnectionError(null);
          if (connectionTimeoutRef.current) {
            clearTimeout(connectionTimeoutRef.current);
          }
          console.log("✅ Connection established!");
        } else if (
          pc.connectionState === "failed" ||
          pc.connectionState === "disconnected" ||
          pc.connectionState === "closed"
        ) {
          setConnectionReady(false);
          if (!connectionError) {
            setConnectionError(`Connection ${pc.connectionState}`);
          }
        }
      };

      pc.onicecandidate = async (event) => {
        if (event.candidate) {
          console.log("📍 New ICE candidate found");
          await storeICECandidate(event.candidate);
        }
      };

      peerConnectionRef.current = pc;

      // ✅ SMART TIMER: Don't just timeout, check if messages are flowing
      connectionTimeoutRef.current = setTimeout(() => {
        // Before showing error, check if messages are actually working
        if (messagesReceivedRef.current > 0 && lastMessageTimeRef.current > 0) {
          const timeSinceLastMessage = Date.now() - lastMessageTimeRef.current;
          
          // If messages received recently (within last 10 seconds), don't show error
          if (timeSinceLastMessage < 10000) {
            console.log("✅ Messages are flowing! Not showing error even though connection not fully established");
            // Keep the connection going, don't show error
            return;
          }
        }

        // Only show error if messages are NOT flowing
        if (!connectionReady && !connectionError) {
          setConnectionError("Connection timeout - messages not flowing");
          console.warn("WebRTC connection timeout - no messages received");
        }
      }, CONNECTION_TIMEOUT);

      return pc;
    } catch (error) {
      console.error("Failed to initialize peer connection:", error);
      setConnectionError("Failed to initialize connection");
      return null;
    }
  };

  const setupDataChannel = (dataChannel: RTCDataChannel) => {
    console.log(`📡 Setting up data channel: ${dataChannel.label}`);

    dataChannel.onopen = () => {
      console.log("✅ Data channel opened!");
      setConnectionReady(true);
      setConnectionError(null);
    };

    dataChannel.onclose = () => {
      console.log("❌ Data channel closed");
      setConnectionReady(false);
    };

    dataChannel.onerror = (error) => {
      console.error("Data channel error:", error);
      setConnectionError("Data channel error");
    };

    dataChannel.onmessage = (event) => {
      console.log("💬 Message received:", event.data);
      // ✅ SMART TIMER: Track that we received a message
      messagesReceivedRef.current++;
      lastMessageTimeRef.current = Date.now();
      
      // ✅ If we're receiving messages, clear any error
      if (connectionError && connectionError.includes("timeout")) {
        setConnectionError(null);
      }
    };
  };

  const generateOffer = async (pc: RTCPeerConnection) => {
    if (offerGeneratedRef.current) {
      console.log("⚠️ Offer already generated");
      return;
    }

    try {
      console.log("📤 Generating offer...");
      const offer = await pc.createOffer({
        offerToReceiveAudio: false,
        offerToReceiveVideo: false,
      });
      await pc.setLocalDescription(offer);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      await fetch("/api/chat/signal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roomId: roomId,
          type: "offer",
          payload: offer,
          sender: username,
          receiver: otherUser,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      offerGeneratedRef.current = true;
      failedFetchCountRef.current = 0;
      console.log("✅ Offer generated and stored");
    } catch (error) {
      console.error("Failed to generate offer:", error);
      failedFetchCountRef.current++;
      setConnectionError("Failed to generate offer");
    }
  };

  const generateAnswer = async (pc: RTCPeerConnection, offer: any) => {
    if (answerGeneratedRef.current) {
      console.log("⚠️ Answer already generated");
      return;
    }

    try {
      console.log("📥 Generating answer...");
      await pc.setRemoteDescription(new RTCSessionDescription(offer));

      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      await fetch("/api/chat/signal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roomId: roomId,
          type: "answer",
          payload: answer,
          sender: username,
          receiver: otherUser,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      answerGeneratedRef.current = true;
      failedFetchCountRef.current = 0;
      console.log("✅ Answer generated and stored");
    } catch (error) {
      console.error("Failed to generate answer:", error);
      failedFetchCountRef.current++;
      setConnectionError("Failed to generate answer");
    }
  };

  const applyAnswerIfFound = async (pc: RTCPeerConnection) => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const res = await fetch(`/api/chat/signal?roomId=${roomId}&receiver=${username}&type=answer`, {
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      const data = await res.json();

      if (data.signals && data.signals.length > 0) {
        const answerData = data.signals[0].payload;
        if (pc.remoteDescription === null) {
          await pc.setRemoteDescription(new RTCSessionDescription(answerData));
          console.log("✅ Answer applied");
        }
      }
    } catch (error) {
      console.log("Still waiting for answer...");
    }
  };

  const storeICECandidate = async (candidate: RTCIceCandidate) => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      await fetch("/api/chat/signal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roomId: roomId,
          type: "ice-candidate",
          payload: candidate,
          sender: username,
          receiver: otherUser,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
    } catch (error) {
      console.log("Failed to store ICE candidate (will retry)");
    }
  };

  const applyICECandidates = async (pc: RTCPeerConnection) => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const res = await fetch(`/api/chat/signal?roomId=${roomId}&receiver=${username}&type=ice-candidate`, {
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      const data = await res.json();

      if (data.signals) {
        for (const signal of data.signals) {
          const candidateString = JSON.stringify(signal.payload);

          if (processedICECandidatesRef.current.has(candidateString)) {
            continue;
          }

          try {
            await pc.addIceCandidate(new RTCIceCandidate(signal.payload));
            processedICECandidatesRef.current.add(candidateString);
            console.log("✅ ICE candidate added");
          } catch (error) {
            console.log("Failed to add ICE candidate (will retry)");
          }
        }
      }
    } catch (error) {
      console.log("Failed to fetch ICE candidates (will retry)");
    }
  };

  const startWebRTCHandshake = async () => {
    const pc = await initializePeerConnection();
    if (!pc) return;

    console.log(`🚀 Starting WebRTC handshake for ${username} with ${otherUser}`);

    pollStartTimeRef.current = Date.now();

    signalPollIntervalRef.current = setInterval(async () => {
      const elapsedTime = Date.now() - pollStartTimeRef.current;

      if (elapsedTime > MAX_POLLING_DURATION && !connectionReady) {
        console.warn("⏰ Polling timeout");
        clearInterval(signalPollIntervalRef.current!);
        
        // ✅ SMART: Only show error if messages aren't flowing
        if (messagesReceivedRef.current === 0) {
          setConnectionError("WebRTC connection failed - no response from peer");
        }
        return;
      }

      try {
        const offerRes = await fetch(`/api/chat/signal?roomId=${roomId}&receiver=${username}&type=offer`);
        const offerData = await offerRes.json();

        if (offerData.signals && offerData.signals.length > 0 && !answerGeneratedRef.current) {
          console.log(`📨 ${username} received offer from ${otherUser}`);
          await generateAnswer(pc, offerData.signals[0].payload);
        } else if (!offerGeneratedRef.current && !answerGeneratedRef.current) {
          console.log(`📨 ${username} generating offer`);
          await generateOffer(pc);
        }

        if (offerGeneratedRef.current && !answerGeneratedRef.current) {
          await applyAnswerIfFound(pc);
        }

        await applyICECandidates(pc);

        failedFetchCountRef.current = 0;
      } catch (error) {
        console.error("Error in WebRTC handshake loop:", error);
        failedFetchCountRef.current++;

        if (failedFetchCountRef.current > 20) {
          clearInterval(signalPollIntervalRef.current!);
          setConnectionError("WebRTC connection failed - too many network errors");
        }
      }
    }, POLLING_INTERVAL);
  };

  const sendMessage = async (message: string): Promise<boolean> => {
    try {
      if (!dataChannelRef.current || dataChannelRef.current.readyState !== "open") {
        console.error("Data channel not open. State:", dataChannelRef.current?.readyState);
        return false;
      }

      const messageData = {
        text: message,
        sender: username,
        timestamp: Date.now(),
      };

      dataChannelRef.current.send(JSON.stringify(messageData));
      console.log("📤 Message sent via WebRTC");
      
      // ✅ SMART: Track that we sent a message (connection is working)
      lastMessageTimeRef.current = Date.now();

      return true;
    } catch (error) {
      console.error("Failed to send message:", error);
      return false;
    }
  };

  useEffect(() => {
    if (roomId && username && otherUser) {
      startWebRTCHandshake();
    }

    return () => {
      if (signalPollIntervalRef.current) {
        clearInterval(signalPollIntervalRef.current);
      }
      if (connectionTimeoutRef.current) {
        clearTimeout(connectionTimeoutRef.current);
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
