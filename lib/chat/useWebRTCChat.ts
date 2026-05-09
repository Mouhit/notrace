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
  const readyRef = useRef(false);
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

  // Broadcast directly through the subscribed channel (not an API route)
  const sendSignal = useCallback(async (type: string, payload: any) => {
    if (!channelRef.current || !readyRef.current) {
      console.warn("Channel not ready, signal queued:", type);
      return;
    }
    try {
      await channelRef.current.send({
        type: "broadcast",
        event: "signal",
        payload: { room_id: roomId, sender: localUsername, type, payload },
      });
    } catch (err) {
      console.error("Send signal error:", err);
    }
  }, [roomId, localUsername]);

  const setupDataChannel = useCallback((dc: RTCDataChannel) => {
    dataChannelRef.current = dc;
    dc.onopen = () => {
      console.log("Data channel opened");
      setIsConnected(true);
    };
    dc.onclose = () => {
      console.log("Data channel closed");
      setIsConnected(false);
    };
    dc.onmessage = (e) => {
      try {
        const msg: ChatMessage = JSON.parse(e.data);
        onMessage(msg);
      } catch { /* ignore */ }
    };
  }, [onMessage]);

  const initPeerConnection = useCallback(() => {
    if (pcRef.current) return pcRef.current;

    console.log("Creating RTCPeerConnection");
    const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS });
    pcRef.current = pc;

    pc.onconnectionstatechange = () => {
      console.log("PC connectionState:", pc.connectionState);
      onConnectionChange(pc.connectionState);
      if (pc.connectionState === "connected") setIsConnected(true);
      if (pc.connectionState === "disconnected" || pc.connectionState === "failed") {
        setIsConnected(false);
      }
    };

    pc.onicecandidate = (e) => {
      if (e.candidate) {
        console.log("Got ICE candidate");
        sendSignal("ice", { candidate: e.candidate });
      }
    };

    if (isCaller) {
      console.log("Creating data channel (caller)");
      const dc = pc.createDataChannel("chat", { ordered: true });
      setupDataChannel(dc);
    } else {
      console.log("Waiting for data channel (callee)");
      pc.ondatachannel = (e) => {
        console.log("Got data channel (callee)");
        setupDataChannel(e.channel);
      };
    }

    return pc;
  }, [isCaller, onConnectionChange, sendSignal, setupDataChannel]);

  const startCall = useCallback(async () => {
    console.log("Starting call");
    const pc = initPeerConnection();
    try {
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      console.log("Sending offer");
      await sendSignal("offer", { sdp: offer });
    } catch (err) {
      console.error("Start call error:", err);
    }
  }, [initPeerConnection, sendSignal]);

  const handleSignal = useCallback(async (type: string, payload: any) => {
    console.log("Received signal:", type);
    
    if (type === "offer" && !pcRef.current) {
      console.log("Creating PC for incoming offer");
      initPeerConnection();
    }
    const pc = pcRef.current;
    if (!pc) {
      console.warn("PC not ready for signal:", type);
      return;
    }

    try {
      if (type === "offer") {
        console.log("Setting remote description (offer)");
        await pc.setRemoteDescription(new RTCSessionDescription(payload.sdp));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        console.log("Sending answer");
        await sendSignal("answer", { sdp: answer });
      } else if (type === "answer") {
        if (pc.signalingState === "have-local-offer") {
          console.log("Setting remote description (answer)");
          await pc.setRemoteDescription(new RTCSessionDescription(payload.sdp));
        }
      } else if (type === "ice") {
        if (pc.remoteDescription) {
          try {
            await pc.addIceCandidate(new RTCIceCandidate(payload.candidate));
          } catch (err) {
            console.warn("ICE candidate error (might be duplicate):", err);
          }
        }
      }
    } catch (err) {
      console.error("handleSignal error:", type, err);
    }
  }, [initPeerConnection, sendSignal]);

  const sendMessage = useCallback((text: string, from: string) => {
    if (!dataChannelRef.current || dataChannelRef.current.readyState !== "open") {
      console.warn("Data channel not open");
      return false;
    }
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

    console.log(`Subscribing to signal:${roomId} as ${localUsername}`);
    const sb = getSupabase();

    const channel = sb.channel(`signal:${roomId}`, {
      config: { broadcast: { self: false } },
    });

    channel.on("broadcast", { event: "signal" }, ({ payload }: any) => {
      if (payload.sender !== localUsername && payload.room_id === roomId) {
        handleSignal(payload.type, payload.payload);
      }
    });

    channel.subscribe((status: string) => {
      console.log("Channel subscription status:", status);
      if (status === "SUBSCRIBED") {
        readyRef.current = true;
        
        // Caller starts after subscription is confirmed
        if (isCaller) {
          console.log("Caller: channel ready, starting call");
          startCall();
        } else {
          console.log("Callee: channel ready, waiting for offer");
        }
      }
    });

    channelRef.current = channel;

    return () => destroy();
  }, [roomId, localUsername, remoteUsername, isCaller, getSupabase, handleSignal, startCall, destroy]);

  return { isConnected, sendMessage, destroy };
}