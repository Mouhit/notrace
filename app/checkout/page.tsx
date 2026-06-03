'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { PLANS } from '@/lib/constants';

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function CheckoutPage() {
  const searchParams = useSearchParams();
  const plan = (searchParams.get('plan') || 'PRO') as keyof typeof PLANS;
  const userId = searchParams.get('userId');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);
  }, []);

  const planConfig = PLANS[plan];

  const handlePayment = async () => {
    if (!userId) {
      setError('User ID missing');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Create order
      const orderResponse = await fetch('/api/payments/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, plan }),
      });

      const orderData = await orderResponse.json();

      if (!orderResponse.ok) {
        throw new Error(orderData.error || 'Failed to create order');
      }

      // Open Razorpay
      const options = {
        key: orderData.key,
        amount: orderData.amount,
        currency: orderData.currency,
        order_id: orderData.orderId,
        handler: async (response: any) => {
          try {
            // Verify payment
            const verifyResponse = await fetch('/api/payments/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                orderId: orderData.orderId,
                paymentId: response.razorpay_payment_id,
                signature: response.razorpay_signature,
              }),
            });

            if (verifyResponse.ok) {
              window.location.href = '/success';
            } else {
              setError('Payment verification failed');
            }
          } catch (err) {
            setError('Verification error');
            console.error(err);
          }
        },
        prefill: {
          email: '',
          contact: '',
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Payment error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-light dark:bg-dark flex items-center justify-center">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold mb-2 text-dark dark:text-light">
          {plan} Plan
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          ₹{(planConfig.price / 100).toFixed(2)}/month
        </p>

        <div className="space-y-3 mb-8 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-primary">✓</span>
            <span>{planConfig.secrets_per_day === 999999 ? 'Unlimited' : planConfig.secrets_per_day} secrets/day</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-primary">✓</span>
            <span>{planConfig.expiry_days} day expiry</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-primary">✓</span>
            <span>{planConfig.collections === 999999 ? 'Unlimited' : planConfig.collections} collections</span>
          </div>
        </div>

        {error && (
          <div className="p-3 bg-red-50 dark:bg-red-900 text-red-900 dark:text-red-100 rounded-lg mb-4 text-sm">
            {error}
          </div>
        )}

        <button
          onClick={handlePayment}
          disabled={loading}
          className="w-full bg-primary text-dark font-semibold py-3 rounded-lg hover:opacity-90 disabled:opacity-50"
        >
          {loading ? 'Processing...' : 'Pay Now'}
        </button>

        <p className="text-xs text-gray-600 dark:text-gray-400 mt-6 text-center">
          Secure payment powered by Razorpay
        </p>
      </div>
    </main>
  );
}
