'use client';

import { useState, useEffect } from 'react';

export default function DashboardPage() {
  const [subscription, setSubscription] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState('');

  useEffect(() => {
    // Get userId from localStorage or session
    const storedUserId = localStorage.getItem('userId');
    if (storedUserId) {
      setUserId(storedUserId);
      fetchSubscription(storedUserId);
    } else {
      setLoading(false);
    }
  }, []);

  const fetchSubscription = async (id: string) => {
    try {
      const response = await fetch(`/api/subscriptions/status?userId=${id}`);
      if (response.ok) {
        const data = await response.json();
        setSubscription(data);
      }
    } catch (error) {
      console.error('Error fetching subscription:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!userId) {
    return (
      <main className="min-h-screen bg-light dark:bg-dark flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400 mb-4">Please log in first</p>
          <a href="/auth/login" className="text-primary font-semibold">
            Go to Login
          </a>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-light dark:bg-dark p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-dark dark:text-light">
          Dashboard
        </h1>

        {loading ? (
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Subscription Status */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h2 className="text-xl font-bold mb-4 text-dark dark:text-light">
                Subscription
              </h2>
              {subscription ? (
                <div className="space-y-2 text-sm">
                  <p>
                    <span className="font-semibold">Plan:</span>{' '}
                    {subscription.plan}
                  </p>
                  <p>
                    <span className="font-semibold">Status:</span>{' '}
                    <span className="text-green-600">{subscription.is_active ? 'Active' : 'Inactive'}</span>
                  </p>
                  <p>
                    <span className="font-semibold">Start Date:</span>{' '}
                    {subscription.start_date}
                  </p>
                  <p>
                    <span className="font-semibold">End Date:</span>{' '}
                    {subscription.end_date || 'No expiry'}
                  </p>
                </div>
              ) : (
                <p className="text-gray-600 dark:text-gray-400">No active subscription</p>
              )}
              <a
                href="/checkout?plan=PRO"
                className="mt-4 block bg-primary text-dark font-semibold py-2 px-4 rounded text-center hover:opacity-90"
              >
                Upgrade Plan
              </a>
            </div>

            {/* Usage Stats */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h2 className="text-xl font-bold mb-4 text-dark dark:text-light">
                Usage Today
              </h2>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    Secrets Created
                  </p>
                  <div className="bg-gray-200 dark:bg-gray-700 rounded h-2">
                    <div
                      className="bg-primary h-2 rounded"
                      style={{ width: '30%' }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    3/50
                  </p>
                </div>
              </div>
            </div>

            {/* Billing */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h2 className="text-xl font-bold mb-4 text-dark dark:text-light">
                Billing
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Next payment due: {subscription?.end_date || 'N/A'}
              </p>
              <button className="w-full border-2 border-primary text-primary font-semibold py-2 rounded hover:bg-primary hover:text-dark">
                Download Invoice
              </button>
            </div>

            {/* Account */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h2 className="text-xl font-bold mb-4 text-dark dark:text-light">
                Account
              </h2>
              <button className="w-full bg-red-50 dark:bg-red-900 text-red-600 dark:text-red-100 font-semibold py-2 rounded hover:opacity-90">
                Cancel Subscription
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
