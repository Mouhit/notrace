'use client';

import { useState } from 'react';

export default function AppPage() {
  const [message, setMessage] = useState('');
  const [password, setPassword] = useState('');
  const [expiry, setExpiry] = useState('1');
  const [loading, setLoading] = useState(false);

  const handleCreateSecret = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message.trim()) {
      alert('Please enter a message');
      return;
    }

    setLoading(true);
    try {
      // TODO: Call API endpoint /api/secrets/create
      // For now, just show a placeholder
      alert('API endpoint not yet implemented. This is Phase 1 Task 1.3');
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to create secret');
    } finally {
      setLoading(false);
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
          <form onSubmit={handleCreateSecret} className="space-y-6">
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
                <option value="1">1 Hour</option>
                <option value="24">1 Day</option>
                <option value="168">7 Days</option>
                <option value="720">30 Days</option>
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

          <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900 rounded-lg">
            <p className="text-sm text-blue-900 dark:text-blue-100">
              ℹ️ Your message is encrypted in your browser. The server never sees the plaintext. Only you and the recipient can read it.
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}
