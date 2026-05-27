import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";

interface UseWebRTCChatReturn {
  sendMessage: (message: string) => Promise<boolean>;
  peerConnection: RTCPeerConnection | null;
  connectionReady: boolean;
  connectionError: string | null;
  remoteStream: MediaStream | null;
}

const MAX_POLLING_DURATION = 60000; // ✅ INCREASED: 60 seconds (was 30)
const POLLING_INTERVAL = 1000; // 1 second between polls
const CONNECTION_TIMEOUT = 20000; // ✅ INCREASED: 20 seconds (was 10)

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

  const initializePeerConnection = async () => {
    try {
      const pc = new RTCPeerConnection({
        iceServers: [
          { urls: ["stun:stun.l.google.com:19302"] },
          { urls: ["stun:stun1.l.google.com:19302"] },
          { urls: ["stun:stun2.l.google.com:19302"] }, // ✅ ADDED: Extra STUN server
          { urls: ["stun:stun3.l.google.com:19302"] }, // ✅ ADDED: Extra STUN server
          { urls: ["stun:stun4.l.google.com:19302"] }, // ✅ ADDED: Extra STUN server
        ],
      });

      const dataChannel = pc.createDataChannel("chat", { ordered: true });
      setupDataChannel(dataChannel);
      dataChannelRef.current = dataChannel;

      pc.ondatachannel = (event) => {
        console.log("Received data channel from remote peer");
        setupDataChannel(event.channel);
        dataChannelRef.current = event.channel;
      };

      pc.onconnectionstatechange = () => {
        console.log(`Connection state: ${pc.connectionState}`);

        if (pc.connectionState === "connected") {
          setConnectionReady(true);
          setConnectionError(null);
          if (connectionTimeoutRef.current) {
            clearTimeout(connectionTimeoutRef.current);
          }
          console.log("✅ Connection established");
        } else if (pc.connectionState === "failed" || pc.connectionState === "disconnected") {
          setConnectionReady(false);
          setConnectionError("Connection failed or disconnected");
          toast.error("Connection lost");
        }
      };

      pc.onicecandidate = async (event) => {
        if (event.candidate) {
          await storeICECandidate(event.candidate);
        }
      };

      peerConnectionRef.current = pc;

      // ✅ INCREASED: 20 second timeout instead of 10
      connectionTimeoutRef.current = setTimeout(() => {
        if (!connectionReady && !connectionError) {
          setConnectionError("Connection timeout - WebRTC handshake taking too long");
          console.warn("WebRTC connection timeout after 20 seconds");
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
    console.log(`Setting up data channel: ${dataChannel.label}`);

    dataChannel.onopen = () => {
      console.log("Data channel opened");
      setConnectionReady(true);
      setConnectionError(null);
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
      console.log("Message received from peer:", event.data);
    };
  };

  const generateOffer = async (pc: RTCPeerConnection) => {
    if (offerGeneratedRef.current) {
      console.log("Offer already generated");
      return;
    }

    try {
      console.log("Generating offer...");
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

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
      console.log("Answer already generated");
      return;
    }

    try {
      console.log("Generating answer for received offer...");
      await pc.setRemoteDescription(new RTCSessionDescription(offer));

      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

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

      const res = await fetch(`/api/chat/signal?room_id=${roomId}&type=answer&from=${otherUser}`, {
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
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

  const storeICECandidate = async (candidate: RTCIceCandidate) => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

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
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
    } catch (error) {
      console.error("Failed to store ICE candidate:", error);
    }
  };

  const applyICECandidates = async (pc: RTCPeerConnection) => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const res = await fetch(`/api/chat/signal?room_id=${roomId}&type=ice-candidate&from=${otherUser}`, {
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      const data = await res.json();

      if (data.signals) {
        for (const signal of data.signals) {
          const candidateString = JSON.stringify(signal.data);

          if (processedICECandidatesRef.current.has(candidateString)) {
            continue;
          }

          try {
            await pc.addIceCandidate(new RTCIceCandidate(signal.data));
            processedICECandidatesRef.current.add(candidateString);
          } catch (error) {
            console.error("Failed to add ICE candidate:", error);
          }
        }
      }
    } catch (error) {
      console.error("Failed to fetch ICE candidates:", error);
    }
  };

  const startWebRTCHandshake = async () => {
    const pc = await initializePeerConnection();
    if (!pc) return;

    console.log(`Starting WebRTC handshake for ${username} with ${otherUser}`);

    pollStartTimeRef.current = Date.now();

    signalPollIntervalRef.current = setInterval(async () => {
      const elapsedTime = Date.now() - pollStartTimeRef.current;
      if (elapsedTime > MAX_POLLING_DURATION && !connectionReady) {
        console.warn("Polling timeout - stopping after 60 seconds");
        clearInterval(signalPollIntervalRef.current!);
        setConnectionError("WebRTC connection failed - timeout");
        return;
      }

      try {
        const offerRes = await fetch(`/api/chat/signal?room_id=${roomId}&type=offer&from=${otherUser}`);
        const offerData = await offerRes.json();

        if (offerData.signals && offerData.signals.length > 0 && !answerGeneratedRef.current) {
          console.log(`${username} received offer from ${otherUser}`);
          await generateAnswer(pc, offerData.signals[0].data);
        } else if (!offerGeneratedRef.current && !answerGeneratedRef.current) {
          console.log(`${username} generating offer (no offer from ${otherUser})`);
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

        if (failedFetchCountRef.current > 5) {
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
      console.log("Message sent via WebRTC data channel");

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
