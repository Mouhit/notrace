'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { importKey, decryptMessage } from '@/lib/crypto';

export default function SecretPage() {
  const searchParams = useSearchParams();
  const secretId = searchParams.get('id');
  
  const [keyFromUrl, setKeyFromUrl] = useState<string | null>(null);
  const [urlLoaded, setUrlLoaded] = useState(false); // Track if we've tried to load URL
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [decrypted, setDecrypted] = useState(false);
  const [decryptedMessage, setDecryptedMessage] = useState('');

  // Extract key from URL hash (fragment) - runs first
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash;
      if (hash) {
        const params = new URLSearchParams(hash.substring(1));
        const key = params.get('key');
        setKeyFromUrl(key);
      }
      // Mark that we've tried to load the URL (whether key found or not)
      setUrlLoaded(true);
    }
  }, []);

  // Only validate AFTER we've tried to load the URL
  useEffect(() => {
    if (urlLoaded && (!secretId || !keyFromUrl)) {
      setError('Invalid or missing secret link');
    }
  }, [urlLoaded, secretId, keyFromUrl]);

  const handleReveal = async () => {
    setError('');
    setLoading(true);

    try {
      if (!secretId || !keyFromUrl) {
        throw new Error('Invalid secret link');
      }

      // Fetch encrypted secret from server
      const response = await fetch(`/api/secrets/read?id=${secretId}`);

      if (!response.ok) {
        if (response.status === 410) {
          throw new Error('Secret not found or already deleted');
        }
        throw new Error('Failed to fetch secret');
      }

      const data = await response.json();
      const { encrypted_blob, requires_password } = data;

      if (requires_password && !password) {
        throw new Error('This secret requires a password');
      }

      // Import key from URL
      const key = await importKey(decodeURIComponent(keyFromUrl));

      // Decrypt message
      const decrypted = await decryptMessage(encrypted_blob, keyFromUrl, key);

      setDecryptedMessage(decrypted);
      setDecrypted(true);

      // Delete secret after reading (burn after read)
      try {
        await fetch('/api/secrets/read-confirm', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ id: secretId }),
        });
      } catch (deleteError) {
        console.error('Error deleting secret:', deleteError);
      }
    } catch (error) {
      console.error('Error:', error);
      setError(error instanceof Error ? error.message : 'Failed to decrypt secret');
    } finally {
      setLoading(false);
    }
  };

  // Show error only after we've loaded the URL
  if (urlLoaded && (!secretId || !keyFromUrl)) {
    return (
      <main className="min-h-screen bg-light dark:bg-dark flex items-center justify-center">
        <div className="max-w-md mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 text-center">
          <p className="text-red-600 dark:text-red-400">❌ Invalid secret link</p>
          <p className="text-gray-600 dark:text-gray-400 mt-4">
            {error || 'This link is incomplete or has expired.'}
          </p>
          <a
            href="/"
            className="inline-block mt-6 bg-primary text-dark px-6 py-2 rounded-lg font-semibold hover:opacity-90"
          >
            Return Home
          </a>
        </div>
      </main>
    );
  }

  // Show loading while parsing URL
  if (!urlLoaded) {
    return (
      <main className="min-h-screen bg-light dark:bg-dark flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400">Loading secret...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-light dark:bg-dark">
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold text-center mb-4">Secret Message</h1>
        <p className="text-center text-gray-600 dark:text-gray-400 mb-12">
          This message will self-destruct after you view it
        </p>

        <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
          {decrypted ? (
            // Decrypted message display
            <div className="space-y-6">
              <div className="p-4 bg-blue-50 dark:bg-blue-900 rounded-lg">
                <p className="text-sm text-blue-900 dark:text-blue-100">
                  ✅ Secret successfully decrypted and will now be deleted from our servers.
                </p>
              </div>

              <div className="p-6 bg-gray-100 dark:bg-gray-900 rounded-lg border-2 border-primary">
                <p className="text-lg leading-relaxed break-words">
                  {decryptedMessage}
                </p>
              </div>

              <div className="p-4 bg-yellow-50 dark:bg-yellow-900 rounded-lg">
                <p className="text-sm text-yellow-900 dark:text-yellow-100">
                  ⚠️ This message is now deleted from our servers. Do not refresh this page as you won&apos;t be able to see it again.
                </p>
              </div>

              <div className="space-y-2">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(decryptedMessage);
                    alert('Message copied to clipboard');
                  }}
                  className="w-full bg-primary text-dark font-semibold py-2 rounded-lg hover:opacity-90"
                >
                  Copy Message
                </button>
                <a
                  href="/"
                  className="block text-center border-2 border-primary text-primary font-semibold py-2 rounded-lg hover:bg-primary hover:text-dark"
                >
                  Return Home
                </a>
              </div>
            </div>
          ) : (
            // Before decryption
            <form onSubmit={(e) => { e.preventDefault(); handleReveal(); }} className="space-y-6">
              {error && (
                <div className="p-4 bg-red-50 dark:bg-red-900 rounded-lg">
                  <p className="text-red-900 dark:text-red-100">{error}</p>
                </div>
              )}

              <div className="p-4 bg-blue-50 dark:bg-blue-900 rounded-lg">
                <p className="text-sm text-blue-900 dark:text-blue-100">
                  🔐 This message is <strong>end-to-end encrypted</strong>. Click below to decrypt and view it. It will then be permanently deleted.
                </p>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-semibold mb-2">
                  Password (if required)
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full p-4 border border-gray-300 dark:border-gray-700 rounded-lg dark:bg-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Enter password if the sender set one"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary text-dark font-semibold py-3 rounded-lg hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Decrypting...' : 'Reveal Secret'}
              </button>

              <a
                href="/"
                className="block text-center text-gray-600 dark:text-gray-400 hover:text-primary"
              >
                ← Back to Home
              </a>
            </form>
          )}

          <div className="mt-8 p-4 bg-green-50 dark:bg-green-900 rounded-lg">
            <p className="text-sm text-green-900 dark:text-green-100">
              ℹ️ <strong>Zero-Knowledge:</strong> We never see your message. It&apos;s encrypted in your browser and decrypted only on the recipient&apos;s device.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
