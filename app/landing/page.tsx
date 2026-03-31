import LandingPage from "@/components/LandingPage";

export const metadata = {
  title: "NoTrace — Send secrets that self-destruct",
  description: "End-to-end encrypted secret sharing. Zero-knowledge. Burn-after-read. No accounts. No logs.",
};

export default function Landing() {
  return (
    <div style={{
      background: "#ffffff",
      color: "#1c1917",
      fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif",
      minHeight: "100vh",
    }}>
      <LandingPage />
    </div>
  );
}
