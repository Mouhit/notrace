// app/app/page.tsx
// Create secret page with share buttons - FIXED VERSION
// By Engage Ad

'use client';

import { useState } from 'react';
import { generateEncryptionKey, encryptMessage, exportKey, hashPassword } from '@/lib/crypto';
import ShareButtons from '@/app/components/ShareButtons';
import QRCodeModal from '@/app/components/QRCodeModal';

export default function AppPage() {
  const [message, setMessage] = useState('');
  const [password, setPassword] = useState('');
  const [expiry, setExpiry] = useState('60');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ id: string; link: string } | null>(null);
  const [error, setError] = useState('');
  const [showQRModal, setShowQRModal] = useState(false);

  const handleCreateSecret = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setResult(null);

    if (!message.trim()) {
      setError('Please enter a message');
      return;
    }

    setLoading(true);
    try {
      // Step 1: Generate encryption key
      const key = await generateEncryptionKey();

      // Step 2: Encrypt message
      const { encrypted } = await encryptMessage(message, key);

      // Step 3: Hash password if provided
      let passwordHash = null;
      if (password.trim()) {
        passwordHash = await hashPassword(password);
      }

      // Step 4: Export key to string (for URL)
      const keyString = await exportKey(key);

      // Step 5: Call API to create secret
      const apiResponse = await fetch('/api/secrets/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          encrypted_blob: encrypted,
          password_hash: passwordHash,
          expires_in_minutes: parseInt(expiry),
        }),
      });

      if (!apiResponse.ok) {
        const errorData = await apiResponse.json();
        throw new Error(errorData.error || 'Failed to create secret');
      }

      const data = await apiResponse.json();

      // Step 6: Append key to link as URL fragment
      const linkWithKey = `${data.link}#key=${encodeURIComponent(keyString)}`;

      setResult({
        id: data.id,
        link: linkWithKey,
      });

      // Clear form
      setMessage('');
      setPassword('');
      setExpiry('60');
    } catch (error) {
      console.error('Error:', error);
      setError(error instanceof Error ? error.message : 'Failed to create secret');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (result?.link) {
      navigator.clipboard.writeText(result.link);
      alert('Link copied to clipboard!');
    }
  };

  return (
    <main className="min-h-screen bg-light dark:bg-dark">
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold text-center mb-4">Create a Secret</h1>
        <p className="text-center text-gray-600 dark:text-gray-400 mb-12">
          Your message will be encrypted and self-destruct after reading
        </p>

        <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
          {result ? (
            // Success state - show link and sharing options
            <div className="space-y-6">
              <div className="p-4 bg-green-50 dark:bg-green-900 rounded-lg">
                <p className="text-green-900 dark:text-green-100 font-semibold mb-4">
                  ✅ Secret created successfully!
                </p>
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg break-all font-mono text-sm mb-4">
                  {result.link}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={copyToClipboard}
                    className="flex-1 bg-primary text-dark font-semibold py-2 rounded-lg hover:opacity-90"
                  >
                    Copy Link
                  </button>
                  <button
                    onClick={() => setResult(null)}
                    className="flex-1 border-2 border-primary text-primary font-semibold py-2 rounded-lg hover:bg-primary hover:text-dark"
                  >
                    Create Another
                  </button>
                </div>
              </div>

              {/* Share Buttons - FIXED: Removed secretId parameter (not needed) */}
              <ShareButtons
                secretLink={result.link}
                onQRClick={() => setShowQRModal(true)}
              />

              <div className="p-4 bg-blue-50 dark:bg-blue-900 rounded-lg">
                <p className="text-sm text-blue-900 dark:text-blue-100">
                  📌 <strong>Share this link</strong> with anyone. The recipient can read the message once, then it self-destructs.
                </p>
              </div>
            </div>
          ) : (
            // Form state
            <form onSubmit={handleCreateSecret} className="space-y-6">
              {error && (
                <div className="p-4 bg-red-50 dark:bg-red-900 rounded-lg">
                  <p className="text-red-900 dark:text-red-100">{error}</p>
                </div>
              )}

              <div>
                <label htmlFor="message" className="block text-sm font-semibold mb-2">
                  Your Secret Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full h-32 p-4 border border-gray-300 dark:border-gray-700 rounded-lg dark:bg-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Type your secret message here..."
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-semibold mb-2">
                  Password (Optional)
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full p-4 border border-gray-300 dark:border-gray-700 rounded-lg dark:bg-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Add an optional password for extra security"
                />
              </div>

              <div>
                <label htmlFor="expiry" className="block text-sm font-semibold mb-2">
                  Expires After
                </label>
                <select
                  id="expiry"
                  name="expiry"
                  value={expiry}
                  onChange={(e) => setExpiry(e.target.value)}
                  className="w-full p-4 border border-gray-300 dark:border-gray-700 rounded-lg dark:bg-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="60">1 Hour</option>
                  <option value="1440">1 Day</option>
                  <option value="10080">7 Days</option>
                  <option value="43200">30 Days</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary text-dark font-semibold py-3 rounded-lg hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Creating...' : 'Create Secret'}
              </button>
            </form>
          )}

          <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900 rounded-lg">
            <p className="text-sm text-blue-900 dark:text-blue-100">
              ℹ️ Your message is encrypted in your browser. The server never sees the plaintext. Only you and the recipient can read it.
            </p>
          </div>
        </div>
      </div>

      {/* QR Code Modal - Keeps secretId for filename */}
      {result && (
        <QRCodeModal
          isOpen={showQRModal}
          onClose={() => setShowQRModal(false)}
          secretLink={result.link}
          secretId={result.id}
        />
      )}
    </main>
  );
}
