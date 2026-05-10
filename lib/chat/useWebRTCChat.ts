"use client";
import { useEffect, useRef, useState, useCallback } from "react";

export interface ChatMessage {
  id: string;
  from: string;
  text: string;
  timestamp: number;
  isVoice?: boolean;
  audioUrl?: string;
}

interface UseWebRTCChatOptions {
  roomId: string;
  localUsername: string;
  remoteUsername: string;
  onMessage: (msg: ChatMessage) => void;
  onConnectionChange: (state: RTCPeerConnectionState) => void;
}

const ICE_SERVERS = [
  { urls: "stun:stun.l.google.com:19302" },
  { urls: "stun:stun1.l.google.com:19302" },
];

const SIGNAL_POLL_INTERVAL = 500; // Poll every 500ms for signals
const SIGNAL_TIMEOUT = 30000; // Give up after 30s

/**
 * WebRTC with database-backed signaling (NOT Realtime broadcast).
 * 
 * This fixes the race condition where caller sends offer before
 * listener is ready. Now signals persist in database and get polled.
 */
export function useWebRTCChat({
  roomId,
  localUsername,
  remoteUsername,
  onMessage,
  onConnectionChange,
}: UseWebRTCChatOptions) {
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const dcRef = useRef<RTCDataChannel | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const initTimeRef = useRef(Date.now());
  const isCaller = localUsername < remoteUsername; // deterministic caller

  const sendSignal = useCallback(
    async (type: string, payload: any) => {
      try {
        await fetch("/api/chat/signal", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            room_id: roomId,
            sender: localUsername,
            receiver: remoteUsername,
            type,
            payload,
          }),
        });
      } catch (err) {
        console.error("Send signal error:", err);
      }
    },
    [roomId, localUsername, remoteUsername]
  );

  const pollSignals = useCallback(async () => {
    try {
      const res = await fetch(
        `/api/chat/signal?receiver=${encodeURIComponent(localUsername)}&room_id=${encodeURIComponent(roomId)}`
      );
      const data = await res.json();
      if (data.signals && data.signals.length > 0) {
        for (const signal of data.signals) {
          if (pcRef.current) {
            await handleSignal(signal.type, signal.payload);
          }
        }
      }
    } catch (err) {
      console.error("Poll error:", err);
    }
  }, [localUsername, roomId]);

  const setupDataChannel = useCallback((dc: RTCDataChannel) => {
    dcRef.current = dc;
    dc.onopen = () => {
      setIsConnected(true);
      console.log("📊 Data channel opened");
    };
    dc.onclose = () => {
      setIsConnected(false);
      console.log("📊 Data channel closed");
    };
    dc.onmessage = (e) => {
      try {
        const msg: ChatMessage = JSON.parse(e.data);
        onMessage(msg);
      } catch {
        // Ignore malformed messages
      }
    };
    dc.onerror = (err) => console.error("DC error:", err);
  }, [onMessage]);

  const initPeerConnection = useCallback(() => {
    const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS });
    pcRef.current = pc;

    pc.onconnectionstatechange = () => {
      console.log("🔌 Connection state:", pc.connectionState);
      onConnectionChange(pc.connectionState);
      if (pc.connectionState === "connected") setIsConnected(true);
      if (
        pc.connectionState === "disconnected" ||
        pc.connectionState === "failed" ||
        pc.connectionState === "closed"
      ) {
        setIsConnected(false);
      }
    };

    pc.onicecandidate = (e) => {
      if (e.candidate) {
        console.log("🧊 Sending ICE candidate");
        sendSignal("ice", { candidate: e.candidate });
      }
    };

    // Caller creates data channel, listener waits for it
    if (isCaller) {
      const dc = pc.createDataChannel("chat", { ordered: true });
      setupDataChannel(dc);
      console.log("📢 Caller — created data channel");
    } else {
      pc.ondatachannel = (e) => {
        console.log("📢 Listener — received data channel");
        setupDataChannel(e.channel);
      };
    }

    return pc;
  }, [isCaller, onConnectionChange, sendSignal, setupDataChannel]);

  const handleSignal = useCallback(
    async (type: string, payload: any) => {
      if (!pcRef.current) {
        if (type === "offer") {
          console.log("📥 Received offer, initializing PC");
          initPeerConnection();
        } else {
          console.warn("Signal received before PC initialized:", type);
          return;
        }
      }

      const pc = pcRef.current!;

      try {
        if (type === "offer") {
          console.log("📥 Setting remote description (offer)");
          await pc.setRemoteDescription(new RTCSessionDescription(payload.sdp));
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          console.log("📤 Sending answer");
          await sendSignal("answer", { sdp: answer });
        } else if (type === "answer") {
          console.log("📥 Setting remote description (answer)");
          await pc.setRemoteDescription(new RTCSessionDescription(payload.sdp));
        } else if (type === "ice") {
          try {
            await pc.addIceCandidate(new RTCIceCandidate(payload.candidate));
          } catch (err) {
            console.error("ICE error:", err);
          }
        }
      } catch (err) {
        console.error("Signal handling error:", err);
      }
    },
    [initPeerConnection, sendSignal]
  );

  const startCall = useCallback(async () => {
    console.log("📞 Starting call (caller)");
    const pc = initPeerConnection();
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    console.log("📤 Sending offer");
    await sendSignal("offer", { sdp: offer });
  }, [initPeerConnection, sendSignal]);

  const sendMessage = useCallback((text: string, from: string): ChatMessage | null => {
    if (!dcRef.current || dcRef.current.readyState !== "open") {
      console.warn("Data channel not ready");
      return null;
    }

    const msg: ChatMessage = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      from,
      text,
      timestamp: Date.now(),
    };

    dcRef.current.send(JSON.stringify(msg));
    return msg;
  }, []);

  const destroy = useCallback(() => {
    if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    dcRef.current?.close();
    pcRef.current?.close();
    pcRef.current = null;
    dcRef.current = null;
    setIsConnected(false);
    console.log("🔌 Destroyed P2P connection");
  }, []);

  // Main effect — setup polling and initial call
  useEffect(() => {
    console.log("🚀 useWebRTCChat init:", { roomId, localUsername, remoteUsername, isCaller });

    // Start polling for signals
    const pollInterval = setInterval(pollSignals, SIGNAL_POLL_INTERVAL);
    pollIntervalRef.current = pollInterval;

    // Timeout — give up after 30s if no connection
    const timeoutId = setTimeout(() => {
      if (!isConnected && pcRef.current?.connectionState !== "connected") {
        console.error("⏱ Connection timeout after 30s");
        destroy();
      }
    }, SIGNAL_TIMEOUT);

    // Caller sends offer after a short delay to ensure both sides are polling
    if (isCaller) {
      const callTimeout = setTimeout(() => {
        console.log("📞 Caller initiating offer");
        startCall();
      }, 1000);

      return () => {
        clearInterval(pollInterval);
        clearTimeout(callTimeout);
        clearTimeout(timeoutId);
        destroy();
      };
    }

    return () => {
      clearInterval(pollInterval);
      clearTimeout(timeoutId);
      destroy();
    };
  }, [roomId, localUsername, remoteUsername, isCaller, pollSignals, startCall, destroy, isConnected]);

  return { isConnected, sendMessage, destroy };
}
