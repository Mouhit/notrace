"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import { createClient } from "@supabase/supabase-js";

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

export function useWebRTCChat({
  roomId,
  localUsername,
  remoteUsername,
  onMessage,
  onConnectionChange,
}: UseWebRTCChatOptions) {
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const dataChannelRef = useRef<RTCDataChannel | null>(null);
  const channelRef = useRef<any>(null);
  const supabaseRef = useRef<any>(null);
  const [isConnected, setIsConnected] = useState(false);
  const readyRef = useRef(false); // tracks whether our subscription is live
  const pendingSignalsRef = useRef<Array<{ type: string; payload: any }>>([]);
  const isCaller = localUsername < remoteUsername;

  const getSupabase = useCallback(() => {
    if (!supabaseRef.current) {
      supabaseRef.current = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );
    }
    return supabaseRef.current;
  }, []);

  // Send signal via the shared subscribed channel (not a throwaway instance)
  const sendSignal = useCallback(async (type: string, payload: any) => {
    const ch = channelRef.current;
    if (!ch || !readyRef.current) {
      // Queue it — channel not ready yet
      pendingSignalsRef.current.push({ type, payload });
      return;
    }
    await ch.send({
      type: "broadcast",
      event: "signal",
      payload: { room_id: roomId, sender: localUsername, type, payload },
    });
  }, [roomId, localUsername]);

  const setupDataChannel = useCallback((dc: RTCDataChannel) => {
    dataChannelRef.current = dc;
    dc.onopen = () => setIsConnected(true);
    dc.onclose = () => setIsConnected(false);
    dc.onmessage = (e) => {
      try {
        const msg: ChatMessage = JSON.parse(e.data);
        onMessage(msg);
      } catch { /* ignore */ }
    };
  }, [onMessage]);

  const initPeerConnection = useCallback(() => {
    // Don't re-create if already exists
    if (pcRef.current) return pcRef.current;

    const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS });
    pcRef.current = pc;

    pc.onconnectionstatechange = () => {
      onConnectionChange(pc.connectionState);
      if (pc.connectionState === "connected") setIsConnected(true);
      if (pc.connectionState === "disconnected" || pc.connectionState === "failed") {
        setIsConnected(false);
      }
    };

    pc.onicecandidate = (e) => {
      if (e.candidate) {
        sendSignal("ice", { candidate: e.candidate });
      }
    };

    if (isCaller) {
      const dc = pc.createDataChannel("chat", { ordered: true });
      setupDataChannel(dc);
    } else {
      pc.ondatachannel = (e) => setupDataChannel(e.channel);
    }

    return pc;
  }, [isCaller, onConnectionChange, sendSignal, setupDataChannel]);

  const startCall = useCallback(async () => {
    const pc = initPeerConnection();
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    await sendSignal("offer", { sdp: offer });
  }, [initPeerConnection, sendSignal]);

  const handleSignal = useCallback(async (type: string, payload: any) => {
    // Lazily create PC for callee when offer arrives
    if (type === "offer" && !pcRef.current) {
      initPeerConnection();
    }
    const pc = pcRef.current;
    if (!pc) return;

    try {
      if (type === "offer") {
        await pc.setRemoteDescription(new RTCSessionDescription(payload.sdp));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        await sendSignal("answer", { sdp: answer });
      } else if (type === "answer") {
        if (pc.signalingState === "have-local-offer") {
          await pc.setRemoteDescription(new RTCSessionDescription(payload.sdp));
        }
      } else if (type === "ice") {
        if (pc.remoteDescription) {
          await pc.addIceCandidate(new RTCIceCandidate(payload.candidate));
        }
      }
    } catch (err) {
      console.error("handleSignal error:", type, err);
    }
  }, [initPeerConnection, sendSignal]);

  const sendMessage = useCallback((text: string, from: string) => {
    if (!dataChannelRef.current || dataChannelRef.current.readyState !== "open") return false;
    const msg: ChatMessage = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      from,
      text,
      timestamp: Date.now(),
    };
    dataChannelRef.current.send(JSON.stringify(msg));
    return msg;
  }, []);

  const destroy = useCallback(() => {
    readyRef.current = false;
    channelRef.current?.unsubscribe();
    channelRef.current = null;
    dataChannelRef.current?.close();
    dataChannelRef.current = null;
    pcRef.current?.close();
    pcRef.current = null;
    setIsConnected(false);
  }, []);

  useEffect(() => {
    if (!roomId || !localUsername || !remoteUsername) return;

    const sb = getSupabase();

    // Create ONE channel and reuse it for both listening AND sending
    const channel = sb.channel(`signal:${roomId}`, {
      config: { broadcast: { self: false } },
    });

    channel.on("broadcast", { event: "signal" }, ({ payload }: any) => {
      if (payload.sender !== localUsername && payload.room_id === roomId) {
        handleSignal(payload.type, payload.payload);
      }
    });

    channel.subscribe((status: string) => {
      if (status === "SUBSCRIBED") {
        readyRef.current = true;
        channelRef.current = channel;

        // Flush any signals queued before subscription was ready
        const pending = [...pendingSignalsRef.current];
        pendingSignalsRef.current = [];
        for (const sig of pending) {
          channel.send({
            type: "broadcast",
            event: "signal",
            payload: { room_id: roomId, sender: localUsername, type: sig.type, payload: sig.payload },
          });
        }

        // Caller starts the handshake only after channel is confirmed SUBSCRIBED
        if (isCaller) {
          // Small delay to give callee time to subscribe
          setTimeout(startCall, 800);
        }
      }
    });

    channelRef.current = channel;

    return () => destroy();
  }, [roomId, localUsername, remoteUsername]);

  return { isConnected, sendMessage, destroy };
}
