export const metadata = {
  title: "NoTrace Chat — P2P Encrypted Messaging",
  description: "Direct device-to-device encrypted chat. No server storage. Messages self-destruct.",
};

export default function ChatLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      background: "#050505",
      color: "#f0f0f0",
      fontFamily: "'JetBrains Mono', monospace",
      minHeight: "100vh",
      WebkitFontSmoothing: "antialiased",
    }}>
      {children}
    </div>
  );
}
