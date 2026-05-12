"use client";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Loader2, AlertTriangle, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

declare global {
  interface Window {
    Razorpay: any;
  }
}

const T = {
  bg: "#050505", card: "#0e0e0e", border: "#1a1a1a",
  accent: "#9fff00", text: "#f0f0f0", muted: "#666",
  error: "#ff4444", success: "#34d399", font: "'JetBrains Mono', monospace",
};

export default function PaymentPage() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("order");
  const invoiceNumber = searchParams.get("invoice");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [paymentDetails, setPaymentDetails] = useState<any>(null);
  const [paymentStatus, setPaymentStatus] = useState<"pending" | "completed" | "failed" | null>(null);

  useEffect(() => {
    if (!orderId) {
      setError("Invalid payment link");
      return;
    }

    // Load Razorpay script
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);

    // Fetch payment details
    fetchPaymentDetails();
  }, [orderId]);

  const fetchPaymentDetails = async () => {
    try {
      const res = await fetch(`/api/payments/get-order?orderId=${orderId}`);
      const data = await res.json();
      if (res.ok) {
        setPaymentDetails(data);
      } else {
        setError("Failed to load payment details");
      }
    } catch (err) {
      setError("Failed to load payment");
    }
  };

  const handlePayment = async () => {
    if (!paymentDetails || !window.Razorpay) {
      setError("Payment system not ready. Please refresh.");
      return;
    }

    setLoading(true);
    try {
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        order_id: orderId,
        amount: Math.round(paymentDetails.amount * 100),
        currency: paymentDetails.currency,
        name: "NoTrace Payments",
        description: paymentDetails.serviceDescription,
        prefill: {
          email: paymentDetails.clientEmail,
          name: paymentDetails.clientName,
        },
        handler: async (response: any) => {
          try {
            // Verify payment on server
            const verifyRes = await fetch("/api/payments/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                orderId: orderId,
                paymentId: response.razorpay_payment_id,
                signature: response.razorpay_signature,
              }),
            });

            if (verifyRes.ok) {
              setPaymentStatus("completed");
              toast.success("Payment completed successfully!");
            } else {
              setPaymentStatus("failed");
              setError("Payment verification failed");
            }
          } catch (err) {
            setPaymentStatus("failed");
            setError("Payment verification error");
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
      setError("Failed to open payment dialog");
    } finally {
      setLoading(false);
    }
  };

  if (!orderId) {
    return (
      <div style={{ minHeight: "100vh", background: T.bg, display: "flex", alignItems: "center", justifyContent: "center", padding: 20, fontFamily: T.font }}>
        <div style={{ textAlign: "center", color: T.error }}>
          <AlertTriangle size={32} style={{ margin: "0 auto 16px" }} />
          <p>Invalid payment link</p>
        </div>
      </div>
    );
  }

  if (!paymentDetails && !error) {
    return (
      <div style={{ minHeight: "100vh", background: T.bg, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: T.font }}>
        <Loader2 size={32} style={{ color: T.accent, animation: "spin 1s linear infinite" }} />
      </div>
    );
  }

  if (paymentStatus === "completed") {
    return (
      <div style={{ minHeight: "100vh", background: T.bg, display: "flex", alignItems: "center", justifyContent: "center", padding: 20, fontFamily: T.font }}>
        <div style={{ textAlign: "center", maxWidth: 400 }}>
          <CheckCircle2 size={48} style={{ color: T.success, margin: "0 auto 16px" }} />
          <h2 style={{ fontSize: 20, fontWeight: 700, color: T.text, margin: "0 0 8px" }}>Payment Successful!</h2>
          <p style={{ fontSize: 13, color: T.muted, margin: "0 0 8px" }}>Invoice: {invoiceNumber}</p>
          <p style={{ fontSize: 12, color: T.muted }}>Thank you for your payment. You will receive a receipt shortly.</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: T.bg, display: "flex", alignItems: "center", justifyContent: "center", padding: 20, fontFamily: T.font }}>
      <div style={{ maxWidth: 500, width: "100%" }}>
        <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 16, padding: 28 }}>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: T.text, margin: "0 0 20px" }}>Complete Payment</h1>

          {error && (
            <div style={{ padding: "12px 14px", background: "rgba(255,68,68,0.08)", border: "1px solid rgba(255,68,68,0.2)", borderRadius: 10, display: "flex", gap: 10, marginBottom: 20 }}>
              <AlertTriangle size={16} style={{ color: T.error, flexShrink: 0 }} />
              <p style={{ fontSize: 12, color: T.error, margin: 0 }}>{error}</p>
            </div>
          )}

          {paymentDetails && (
            <>
              <div style={{ background: "rgba(159,255,0,0.04)", border: `1px solid rgba(159,255,0,0.15)`, borderRadius: 12, padding: 16, marginBottom: 20 }}>
                <p style={{ fontSize: 11, color: T.muted, textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 8px" }}>Invoice Details</p>
                <p style={{ fontSize: 13, color: T.text, margin: "0 0 4px" }}>{paymentDetails.serviceDescription}</p>
                <p style={{ fontSize: 12, color: T.muted, margin: "0 0 12px" }}>Invoice: {invoiceNumber}</p>

                <div style={{ borderTop: `1px solid ${T.border}`, paddingTop: 12 }}>
                  <p style={{ fontSize: 12, color: T.muted, margin: "0 0 4px" }}>Amount to Pay</p>
                  <p style={{ fontSize: 24, fontWeight: 700, color: T.accent, margin: 0 }}>
                    {paymentDetails.currency === "INR" ? "₹" : "$"} {paymentDetails.amount.toLocaleString()}
                  </p>
                </div>
              </div>

              <button
                onClick={handlePayment}
                disabled={loading}
                style={{ width: "100%", padding: "16px", borderRadius: 10, background: T.accent, color: "#000", fontWeight: 700, fontSize: 14, border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, opacity: loading ? 0.6 : 1, fontFamily: T.font }}
              >
                {loading ? <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} /> : null}
                {loading ? "Processing..." : "Pay Now with Razorpay"}
              </button>

              <p style={{ fontSize: 11, color: T.muted, textAlign: "center", margin: "16px 0 0", lineHeight: 1.6 }}>
                🔒 Secure payment powered by Razorpay. Your payment information is encrypted and safe.
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
