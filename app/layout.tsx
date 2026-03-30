import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "sonner";
import { LanguageProvider } from "@/lib/language";
import { ThemeProvider } from "@/lib/theme";
import PWARegister from "@/components/PWARegister";

export const metadata: Metadata = {
  title: "NoTrace — Send secrets securely",
  description: "Burn-after-read. No accounts. No logs. Send ephemeral secret messages.",
  manifest: "/manifest.json",
  themeColor: "#00e5a0",
  openGraph: {
    title: "NoTrace — Send secrets securely",
    description: "Burn-after-read encrypted messages. No accounts. No logs.",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="NoTrace" />
      </head>
      <body>
        <PWARegister />
        <ThemeProvider>
          <LanguageProvider>
            {children}
          </LanguageProvider>
        </ThemeProvider>
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
