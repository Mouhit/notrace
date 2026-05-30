import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'NoTrace - Burn After Read Secret Sharing',
  description: 'Send secrets that self-destruct. End-to-end encrypted. Zero-knowledge. No accounts. No logs.',
  keywords: 'secret sharing, encrypted messaging, privacy, burn after read',
  authors: [{ name: 'Engage Ad' }],
  openGraph: {
    title: 'NoTrace - Secure Secret Sharing',
    description: 'Send secrets that self-destruct after being read',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className="bg-light dark:bg-dark text-gray-900 dark:text-gray-100">
        {children}
      </body>
    </html>
  )
}
