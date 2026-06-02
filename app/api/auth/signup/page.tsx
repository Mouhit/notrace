// app/auth/signup/page.tsx
// Sign up page - By Engage Ad

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SignUpPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, full_name: fullName }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Sign up failed');
        return;
      }

      // Redirect to payment
      router.push(`/checkout?plan=TRIAL&userId=${data.userId}`);
    } catch (err) {
      setError('Something went wrong');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-light dark:bg-dark flex items-center justify-center">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold text-center mb-6 text-dark dark:text-light">
          Create Account
        </h1>

        <form onSubmit={handleSignUp} className="space-y-4">
          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-900 text-red-900 dark:text-red-100 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold mb-2">Full Name</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-900 dark:text-white"
              placeholder="Your name"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-900 dark:text-white"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-900 dark:text-white"
              placeholder="Min 8 characters"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-dark font-semibold py-3 rounded-lg hover:opacity-90 disabled:opacity-50"
          >
            {loading ? 'Creating...' : 'Create Account'}
          </button>
        </form>

        <p className="text-center text-gray-600 dark:text-gray-400 mt-6">
          Already have an account?{' '}
          <a href="/auth/login" className="text-primary font-semibold">
            Log in
          </a>
        </p>
      </div>
    </main>
  );
}
