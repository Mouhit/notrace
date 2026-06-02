// app/components/ShareButtons.tsx
// Share to WhatsApp, Telegram, Email, Copy link - By Engage Ad

'use client';

import { useState } from 'react';

interface ShareButtonsProps {
  secretLink: string;
  onQRClick?: () => void;
}

export default function ShareButtons({ secretLink, onQRClick }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);

  const handleWhatsAppShare = () => {
    const message = `Check this secret (burns after reading):\n\n${secretLink}\n\n🔐 Encrypted end-to-end. Self-destructs after opening.`;
    const url = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  const handleTelegramShare = () => {
    const url = `https://t.me/share/url?url=${encodeURIComponent(secretLink)}&text=${encodeURIComponent('Check this secret (burns after reading):')}`;
    window.open(url, '_blank');
  };

  const handleEmailShare = () => {
    const subject = 'Secret Message from NoTrace';
    const body = `I'm sharing a secret with you that burns after reading:\n\n${secretLink}\n\nJust click the link and the message will decrypt and disappear forever.\n\n🔐 Encrypted end-to-end. Self-destructs after opening.`;
    const url = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = url;
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(secretLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className="space-y-4">
      {/* Heading */}
      <h3 className="text-lg font-semibold text-dark dark:text-light">
        📤 Share This Secret
      </h3>

      {/* Share Buttons Grid */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {/* WhatsApp */}
        <button
          onClick={handleWhatsAppShare}
          className="flex flex-col items-center gap-2 p-4 bg-light dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-primary hover:shadow-md transition"
          title="Share via WhatsApp"
        >
          <span className="text-2xl">💬</span>
          <span className="text-xs font-semibold text-dark dark:text-light">WhatsApp</span>
        </button>

        {/* Telegram */}
        <button
          onClick={handleTelegramShare}
          className="flex flex-col items-center gap-2 p-4 bg-light dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-primary hover:shadow-md transition"
          title="Share via Telegram"
        >
          <span className="text-2xl">✈️</span>
          <span className="text-xs font-semibold text-dark dark:text-light">Telegram</span>
        </button>

        {/* Email */}
        <button
          onClick={handleEmailShare}
          className="flex flex-col items-center gap-2 p-4 bg-light dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-primary hover:shadow-md transition"
          title="Share via Email"
        >
          <span className="text-2xl">✉️</span>
          <span className="text-xs font-semibold text-dark dark:text-light">Email</span>
        </button>

        {/* Copy Link */}
        <button
          onClick={handleCopyLink}
          className="flex flex-col items-center gap-2 p-4 bg-light dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-primary hover:shadow-md transition"
          title="Copy link to clipboard"
        >
          <span className="text-2xl">📋</span>
          <span className="text-xs font-semibold text-dark dark:text-light">
            {copied ? '✅ Copied!' : 'Copy'}
          </span>
        </button>

        {/* QR Code */}
        {onQRClick && (
          <button
            onClick={onQRClick}
            className="flex flex-col items-center gap-2 p-4 bg-light dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-primary hover:shadow-md transition"
            title="Show QR code"
          >
            <span className="text-2xl">🔲</span>
            <span className="text-xs font-semibold text-dark dark:text-light">QR Code</span>
          </button>
        )}
      </div>

      {/* Copied Notification */}
      {copied && (
        <div className="p-3 bg-green-50 dark:bg-green-900 rounded-lg text-sm text-green-900 dark:text-green-100 text-center animate-pulse">
          ✅ Link copied to clipboard!
        </div>
      )}
    </div>
  );
}
