import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "NoTrace — Send secrets that self-destruct",
  description: "End-to-end encrypted secret sharing. Zero-knowledge. Burn-after-read. No accounts. No logs.",
};

export default function LandingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      all: "initial",
      display: "block",
      background: "#ffffff",
      color: "#1c1917",
      fontFamily: "'DM Sans', 'Helvetica Neue', Arial, sans-serif",
      minHeight: "100vh",
      WebkitFontSmoothing: "antialiased",
    }}>
      {children}
    </div>
  );
}
