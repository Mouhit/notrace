// app/admin/dashboard/page.tsx
// Admin dashboard - By Engage Ad

'use client';

import { useState, useEffect } from 'react';

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [adminKey, setAdminKey] = useState('');
  const [authenticated, setAuthenticated] = useState(false);

  const handleAuth = () => {
    setAuthenticated(true);
  };

  useEffect(() => {
    if (!authenticated) return;

    const fetchPayments = async () => {
      try {
        const response = await fetch('/api/admin/users?limit=100', {
          headers: { 'x-admin-key': adminKey },
        });

        if (response.ok) {
          const data = await response.json();
          console.log('Users:', data.users);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPayments();
  }, [authenticated, adminKey]);

  if (!authenticated) {
    return (
      <main className="min-h-screen bg-light dark:bg-dark flex items-center justify-center">
        <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
          <h1 className="text-2xl font-bold mb-6">Admin Panel</h1>
          <input
            type="password"
            placeholder="Admin Key"
            value={adminKey}
            onChange={(e) => setAdminKey(e.target.value)}
            className="w-full p-3 border rounded-lg mb-4 dark:bg-gray-900 dark:text-white"
          />
          <button
            onClick={handleAuth}
            className="w-full bg-primary text-dark font-semibold py-2 rounded-lg"
          >
            Login
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-light dark:bg-dark p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-dark dark:text-light">
          Admin Dashboard
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
            <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">
              Total Users
            </h3>
            <p className="text-3xl font-bold text-dark dark:text-light">-</p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
            <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">
              Successful Payments
            </h3>
            <p className="text-3xl font-bold text-green-600">-</p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
            <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">
              Failed Payments
            </h3>
            <p className="text-3xl font-bold text-red-600">-</p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-bold mb-4 text-dark dark:text-light">
            Recent Payments
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-2 px-4 font-semibold">Payment ID</th>
                  <th className="text-left py-2 px-4 font-semibold">Amount</th>
                  <th className="text-left py-2 px-4 font-semibold">Status</th>
                  <th className="text-left py-2 px-4 font-semibold">Date</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <td colSpan={4} className="text-center py-8 text-gray-600 dark:text-gray-400">
                    {loading ? 'Loading...' : 'No payments yet'}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  );
}
