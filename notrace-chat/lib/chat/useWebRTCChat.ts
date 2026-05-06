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
  const supabaseRef = useRef<any>(null);
  const channelRef = useRef<any>(null);
  const [isConnected, setIsConnected] = useState(false);
  const isCaller = localUsername < remoteUsername; // deterministic caller

  const supabase = useCallback(() => {
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
    dc.onopen = () => { setIsConnected(true); };
    dc.onclose = () => { setIsConnected(false); };
    dc.onmessage = (e) => {
      try {
        const msg: ChatMessage = JSON.parse(e.data);
        onMessage(msg);
      } catch { /* ignore malformed */ }
    };
  }, [onMessage]);

  const initPeerConnection = useCallback(() => {
    const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS });
    pcRef.current = pc;

    pc.onconnectionstatechange = () => {
      onConnectionChange(pc.connectionState);
      if (pc.connectionState === "connected") setIsConnected(true);
      if (pc.connectionState === "disconnected" || pc.connectionState === "failed") setIsConnected(false);
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
    if (!pcRef.current) {
      if (type === "offer") {
        initPeerConnection();
      } else return;
    }
    const pc = pcRef.current!;

    if (type === "offer") {
      await pc.setRemoteDescription(new RTCSessionDescription(payload.sdp));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      await sendSignal("answer", { sdp: answer });
    } else if (type === "answer") {
      await pc.setRemoteDescription(new RTCSessionDescription(payload.sdp));
    } else if (type === "ice") {
      try { await pc.addIceCandidate(new RTCIceCandidate(payload.candidate)); } catch {}
    }
  }, [initPeerConnection, sendSignal]);

  const sendMessage = useCallback((text: string, from: string) => {
    if (!dataChannelRef.current || dataChannelRef.current.readyState !== "open") return false;
    const msg: ChatMessage = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      from, text, timestamp: Date.now(),
    };
    dataChannelRef.current.send(JSON.stringify(msg));
    return msg;
  }, []);

  const destroy = useCallback(() => {
    channelRef.current?.unsubscribe();
    dataChannelRef.current?.close();
    pcRef.current?.close();
    pcRef.current = null;
    dataChannelRef.current = null;
    setIsConnected(false);
  }, []);

  useEffect(() => {
    // Subscribe to signaling channel via Supabase Realtime
    const sb = supabase();
    const channel = sb.channel(`signal:${roomId}`)
      .on("broadcast", { event: "signal" }, ({ payload }: any) => {
        // Only handle signals meant for us
        if (payload.sender !== localUsername && payload.room_id === roomId) {
          handleSignal(payload.type, payload.payload);
        }
      })
      .subscribe();

    channelRef.current = channel;

    // Caller initiates after short delay to ensure both sides are subscribed
    if (isCaller) {
      const t = setTimeout(startCall, 1500);
      return () => { clearTimeout(t); destroy(); };
    }

    return () => destroy();
  }, [roomId, localUsername, isCaller, supabase, handleSignal, startCall, destroy]);

  return { isConnected, sendMessage, destroy };
}
