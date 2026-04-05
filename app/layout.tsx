import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "sonner";
import { LanguageProvider } from "@/lib/language";
import { ThemeProvider } from "@/lib/theme";
import PWARegister from "@/components/PWARegister";

export const metadata: Metadata = {
  metadataBase: new URL("https://notrace.co.in"),
  title: {
    default: "NoTrace — Send secrets that self-destruct",
    template: "%s | NoTrace",
  },
  description: "Send burn-after-read secret messages. End-to-end encrypted. Zero-knowledge. No accounts. No logs. Messages self-destruct after reading.",
  keywords: ["secret sharing", "burn after read", "encrypted messages", "zero knowledge", "private messaging", "self destructing messages", "secure share", "one time secret"],
  authors: [{ name: "Engage Ad", url: "https://notrace.co.in" }],
  creator: "Engage Ad",
  publisher: "Engage Ad",
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://notrace.co.in",
    siteName: "NoTrace",
    title: "NoTrace — Send secrets that self-destruct",
    description: "End-to-end encrypted secret sharing. Zero-knowledge. Burn-after-read. No accounts. No logs.",
    images: [{
      url: "/og-image.png",
      width: 1200,
      height: 630,
      alt: "NoTrace — Send secrets that self-destruct",
    }],
  },
  twitter: {
    card: "summary_large_image",
    title: "NoTrace — Send secrets that self-destruct",
    description: "End-to-end encrypted secret sharing. Zero-knowledge. Burn-after-read. No accounts.",
    images: ["/og-image.png"],
    creator: "@engagead",
  },
  icons: {
    icon: [
      { url: "/favicon-16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-48.png", sizes: "48x48", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
    shortcut: "/favicon-32.png",
  },
  manifest: "/manifest.json",
  alternates: {
    canonical: "https://notrace.co.in",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta name="theme-color" content="#00e5a0" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="NoTrace" />
        <link rel="manifest" href="/manifest.json" />
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
