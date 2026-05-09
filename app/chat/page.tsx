// Listen for chat requests on a dedicated channel
useEffect(() => {
  if (!localUsername) return;

  const channel = supabase.channel(`chat-requests:${localUsername}`);

  channel.on("broadcast", { event: "request" }, ({ payload }: any) => {
    if (payload.to === localUsername && payload.from !== localUsername) {
      setIncomingRequest(payload.from);
    }
  });

  channel.on("broadcast", { event: "accepted" }, ({ payload }: any) => {
    if (payload.initiator === localUsername) {
      setChatState("accepted");
    }
  });

  channel.subscribe();

  return () => {
    channel.unsubscribe();
  };
}, [localUsername]);

// When initiating chat
const initiateChat = async (target: string) => {
  const channel = supabase.channel(`chat-requests:${target}`);
  channel.subscribe(async (status) => {
    if (status === "SUBSCRIBED") {
      await channel.send({
        type: "broadcast",
        event: "request",
        payload: { from: localUsername, to: target },
      });
      channel.unsubscribe();
      setChatState("waiting-acceptance");
    }
  });
};

// When accepting chat
const acceptChat = async (from: string) => {
  const channel = supabase.channel(`chat-requests:${from}`);
  channel.subscribe(async (status) => {
    if (status === "SUBSCRIBED") {
      await channel.send({
        type: "broadcast",
        event: "accepted",
        payload: { initiator: from, acceptor: localUsername },
      });
      channel.unsubscribe();
      setChatState("accepted");
    }
  });
};