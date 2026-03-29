import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "sonner";
import { LanguageProvider } from "@/lib/language";

export const metadata: Metadata = {
  title: "NoTrace — Send secrets securely",
  description: "Burn-after-read. No accounts. No logs. Send ephemeral secret messages.",
  openGraph: {
    title: "NoTrace — Send secrets securely",
    description: "Burn-after-read encrypted messages. No accounts. No logs.",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <LanguageProvider>
          {children}
        </LanguageProvider>
        <Toaster
          theme="dark"
          toastOptions={{
            style: {
              background: "#12151c",
              border: "1px solid rgba(255,255,255,0.07)",
              color: "#e2e8f0",
              fontFamily: "JetBrains Mono, monospace",
              fontSize: "13px",
            },
          }}
        />
      </body>
    </html>
  );
}
