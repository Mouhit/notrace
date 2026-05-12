'use client';

import { Suspense, useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Loader2, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

declare global {
  interface Window {
    Razorpay: any;
  }
}

// Type definition for payment details
interface PaymentDetails {
  orderId: string;
  invoiceNumber: string;
  serviceDescription: string;
  amount: number;
  currency: 'INR' | 'USD';
  clientEmail: string;
  clientName: string;
  status: string;
}

const T = {
  bg: '#050505',
  card: '#0e0e0e',
  border: '#1a1a1a',
  accent: '#9fff00',
  text: '#f0f0f0',
  muted: '#666',
  error: '#ff4444',
  success: '#34d399',
  font: "'JetBrains Mono', monospace",
};

/**
 * PaymentContent component - handles search params and payment logic
 * Wrapped in Suspense to handle dynamic rendering
 */
function PaymentContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('order');
  const invoiceNumber = searchParams.get('invoice');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [paymentDetails, setPaymentDetails] = useState<PaymentDetails | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'completed' | 'failed' | null>(null);

  // Fetch payment details on mount or orderId change
  useEffect(() => {
    if (!orderId) {
      setError('Invalid payment link');
      return;
    }

    const fetchPaymentDetails = async () => {
      try {
        const res = await fetch(`/api/payments/get-order?orderId=${encodeURIComponent(orderId)}`);
        
        if (!res.ok) {
          setError('Failed to load payment details');
          return;
        }

        const data: PaymentDetails = await res.json();
        
        // Validate required fields
        if (!data.orderId || !data.amount || !data.currency) {
          setError('Invalid payment data received');
          return;
        }

        setPaymentDetails(data);
        setError(''); // Clear any previous errors
      } catch (err) {
        console.error('Fetch payment details error:', err);
        setError('Failed to load payment details');
      }
    };

    fetchPaymentDetails();
  }, [orderId]);

  // Load Razorpay script on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (window.Razorpay) return; // Already loaded

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onerror = () => {
      console.error('Failed to load Razorpay script');
      setError('Failed to load payment system');
    };
    document.body.appendChild(script);
  }, []);

  const handlePayment = async () => {
    if (!paymentDetails) {
      setError('Payment details not loaded');
      return;
    }

    if (typeof window === 'undefined' || !window.Razorpay) {
      setError('Payment system not ready. Please refresh the page.');
      return;
    }

    if (!process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID) {
      setError('Payment system configuration error');
      console.error('NEXT_PUBLIC_RAZORPAY_KEY_ID not set');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        order_id: paymentDetails.orderId,
        amount: Math.round(paymentDetails.amount * 100),
        currency: paymentDetails.currency,
        name: 'NoTrace Payments',
        description: paymentDetails.serviceDescription,
        prefill: {
          email: paymentDetails.clientEmail,
          name: paymentDetails.clientName,
        },
        handler: async (response: any) => {
          try {
            if (!response.razorpay_payment_id || !response.razorpay_signature) {
              setError('Invalid payment response');
              setPaymentStatus('failed');
              return;
            }

            // Verify payment on server
            const verifyRes = await fetch('/api/payments/verify', {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                orderId: paymentDetails.orderId,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
              }),
            });

            if (verifyRes.ok) {
              setPaymentStatus('completed');
              toast.success('Payment completed successfully!');
            } else {
              const errorData = await verifyRes.json();
              setPaymentStatus('failed');
              setError(errorData.error || 'Payment verification failed');
              toast.error('Payment verification failed');
            }
          } catch (err) {
            console.error('Verification error:', err);
            setPaymentStatus('failed');
            setError('Payment verification error. Please contact support.');
            toast.error('Payment verification error');
          } finally {
            setLoading(false);
          }
        },
        modal: {
          ondismiss: () => {
            setLoading(false);
          },
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (err) {
      console.error('Payment error:', err);
      setError('Failed to open payment dialog');
      setLoading(false);
    }
  };

  // Loading state - waiting for payment details
  if (!paymentDetails && !error) {
    return (
      <div
        style={{
          minHeight: '100vh',
          background: T.bg,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: T.font,
        }}
      >
        <Loader2 size={32} style={{ color: T.accent, animation: 'spin 1s linear infinite' }} />
      </div>
    );
  }

  // Success state
  if (paymentStatus === 'completed') {
    return (
      <div
        style={{
          minHeight: '100vh',
          background: T.bg,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 20,
          fontFamily: T.font,
        }}
      >
        <div style={{ textAlign: 'center', maxWidth: 400 }}>
          <CheckCircle2 size={48} style={{ color: T.success, margin: '0 auto 16px' }} />
          <h2 style={{ fontSize: 20, fontWeight: 700, color: T.text, margin: '0 0 8px' }}>
            Payment Successful!
          </h2>
          <p style={{ fontSize: 13, color: T.muted, margin: '0 0 8px' }}>
            Invoice: {invoiceNumber || 'N/A'}
          </p>
          <p style={{ fontSize: 12, color: T.muted }}>
            Thank you for your payment. You will receive a receipt shortly.
          </p>
        </div>
      </div>
    );
  }

  // Invalid order ID
  if (!orderId && !paymentDetails) {
    return (
      <div
        style={{
          minHeight: '100vh',
          background: T.bg,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 20,
          fontFamily: T.font,
        }}
      >
        <div style={{ textAlign: 'center', color: T.error }}>
          <AlertTriangle size={32} style={{ margin: '0 auto 16px' }} />
          <p>Invalid payment link</p>
        </div>
      </div>
    );
  }

  // Main payment form
  return (
    <div
      style={{
        minHeight: '100vh',
        background: T.bg,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
        fontFamily: T.font,
      }}
    >
      <div style={{ maxWidth: 500, width: '100%' }}>
        <div
          style={{
            background: T.card,
            border: `1px solid ${T.border}`,
            borderRadius: 16,
            padding: 28,
          }}
        >
          <h1 style={{ fontSize: 22, fontWeight: 700, color: T.text, margin: '0 0 20px' }}>
            Complete Payment
          </h1>

          {error && (
            <div
              style={{
                padding: '12px 14px',
                background: 'rgba(255,68,68,0.08)',
                border: '1px solid rgba(255,68,68,0.2)',
                borderRadius: 10,
                display: 'flex',
                gap: 10,
                marginBottom: 20,
              }}
            >
              <AlertTriangle size={16} style={{ color: T.error, flexShrink: 0 }} />
              <p style={{ fontSize: 12, color: T.error, margin: 0 }}>{error}</p>
            </div>
          )}

          {paymentDetails && (
            <>
              <div
                style={{
                  background: 'rgba(159,255,0,0.04)',
                  border: `1px solid rgba(159,255,0,0.15)`,
                  borderRadius: 12,
                  padding: 16,
                  marginBottom: 20,
                }}
              >
                <p
                  style={{
                    fontSize: 11,
                    color: T.muted,
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    margin: '0 0 8px',
                  }}
                >
                  Invoice Details
                </p>
                <p style={{ fontSize: 13, color: T.text, margin: '0 0 4px' }}>
                  {paymentDetails.serviceDescription}
                </p>
                <p style={{ fontSize: 12, color: T.muted, margin: '0 0 12px' }}>
                  Invoice: {paymentDetails.invoiceNumber || 'N/A'}
                </p>

                <div style={{ borderTop: `1px solid ${T.border}`, paddingTop: 12 }}>
                  <p style={{ fontSize: 12, color: T.muted, margin: '0 0 4px' }}>Amount to Pay</p>
                  <p style={{ fontSize: 24, fontWeight: 700, color: T.accent, margin: 0 }}>
                    {paymentDetails.currency === 'INR' ? '₹' : '$'}
                    {paymentDetails.amount.toLocaleString()}
                  </p>
                </div>
              </div>

              <button
                onClick={handlePayment}
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '16px',
                  borderRadius: 10,
                  background: T.accent,
                  color: '#000',
                  fontWeight: 700,
                  fontSize: 14,
                  border: 'none',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  opacity: loading ? 0.6 : 1,
                  fontFamily: T.font,
                  transition: 'opacity 0.2s',
                }}
              >
                {loading ? (
                  <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
                ) : null}
                {loading ? 'Processing...' : 'Pay Now with Razorpay'}
              </button>

              <p
                style={{
                  fontSize: 11,
                  color: T.muted,
                  textAlign: 'center',
                  margin: '16px 0 0',
                  lineHeight: 1.6,
                }}
              >
                🔒 Secure payment powered by Razorpay. Your payment information is encrypted and safe.
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * PaymentPage component - wrapped with Suspense for useSearchParams
 */
export default function PaymentPage() {
  return (
    <Suspense
      fallback={
        <div
          style={{
            minHeight: '100vh',
            background: T.bg,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: T.font,
          }}
        >
          <Loader2 size={32} style={{ color: T.accent, animation: 'spin 1s linear infinite' }} />
        </div>
      }
    >
      <PaymentContent />
    </Suspense>
  );
}
