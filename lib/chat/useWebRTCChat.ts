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
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastSignalIdRef = useRef<number>(0);
  const [isConnected, setIsConnected] = useState(false);
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

  const sendSignal = useCallback(async (type: string, payload: any) => {
    await fetch("/api/chat/signal", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ room_id: roomId, sender: localUsername, type, payload }),
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
          try {
            await pc.addIceCandidate(new RTCIceCandidate(payload.candidate));
          } catch { /* ignore duplicate candidates */ }
        }
      }
    } catch (err) {
      console.error("handleSignal error:", type, err);
    }
  }, [initPeerConnection, sendSignal]);

  const pollSignals = useCallback(async () => {
    try {
      const sb = getSupabase();
      const { data } = await sb
        .from("signaling")
        .select("id, type, payload")
        .eq("room_id", roomId)
        .neq("sender", localUsername)
        .gt("id", lastSignalIdRef.current)
        .order("id", { ascending: true })
        .limit(50);

      if (data && data.length > 0) {
        for (const row of data) {
          lastSignalIdRef.current = row.id;
          await handleSignal(row.type, row.payload);
        }
      }
    } catch (err) {
      console.error("Poll error:", err);
    }
  }, [roomId, localUsername, getSupabase, handleSignal]);

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
    if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
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

    // Subscribe to realtime for ICE candidates and quick handshake
    const channel = sb.channel(`signal:${roomId}`, {
      config: { broadcast: { self: false } },
    });

    channel.on("broadcast", { event: "signal" }, ({ payload }: any) => {
      if (payload.sender !== localUsername && payload.room_id === roomId) {
        handleSignal(payload.type, payload.payload);
      }
    });

    channel.subscribe();
    channelRef.current = channel;

    // ALSO poll the DB every 500ms for offers/answers (they might arrive before subscription is ready)
    pollIntervalRef.current = setInterval(pollSignals, 500);

    // Caller starts after 1.5s to give callee time to subscribe + poll
    if (isCaller) {
      const timer = setTimeout(startCall, 1500);
      return () => {
        clearTimeout(timer);
        destroy();
      };
    }

    return () => destroy();
  }, [roomId, localUsername, remoteUsername, isCaller, getSupabase, handleSignal, pollSignals, destroy]);

  return { isConnected, sendMessage, destroy };
}