"use client";
import { useState } from "react";
import { Send, Loader2, AlertTriangle, CheckCircle2, Copy } from "lucide-react";
import { toast } from "sonner";
import { PaymentRequest, Currency } from "@/types/payments";

const T = {
  bg: "#050505", card: "#0e0e0e", border: "#1a1a1a",
  accent: "#9fff00", accentDim: "rgba(159,255,0,0.12)",
  accentBorder: "rgba(159,255,0,0.25)", text: "#f0f0f0",
  muted: "#666", error: "#ff4444", font: "'JetBrains Mono', monospace",
};

const inp: React.CSSProperties = {
  width: "100%", padding: "12px 16px", background: "#0a0a0a",
  border: `1px solid ${T.border}`, borderRadius: 10, color: T.text,
  fontSize: 14, fontFamily: T.font, outline: "none", boxSizing: "border-box",
};

export default function AdminPaymentForm() {
  const [invoice, setInvoice] = useState("");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState<Currency>("INR");
  const [serviceType, setServiceType] = useState("service_1");
  const [clientEmail, setClientEmail] = useState("");
  const [clientName, setClientName] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [paymentLink, setPaymentLink] = useState("");
  const [copied, setCopied] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!invoice.trim()) { setError("Invoice number required"); return; }
    if (!description.trim()) { setError("Service description required"); return; }
    if (!amount || parseFloat(amount) <= 0) { setError("Valid amount required"); return; }
    if (!clientEmail.includes("@")) { setError("Valid email required"); return; }

    setLoading(true);
    try {
      const res = await fetch("/api/payments/create-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-secret": process.env.NEXT_PUBLIC_ADMIN_SECRET || "",
        },
        body: JSON.stringify({
          invoiceNumber: invoice.trim(),
          serviceDescription: description.trim(),
          amount: parseFloat(amount),
          currency,
          serviceType,
          clientEmail: clientEmail.trim(),
          clientName: clientName.trim(),
          notes: notes.trim(),
        } as PaymentRequest),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to create payment order");
        return;
      }

      const paymentLink = `/pay?order=${data.orderId}&invoice=${invoice}`;
      setPaymentLink(paymentLink);
      setSuccess(`Payment order created! Share link with client: ${window.location.origin}${paymentLink}`);
      toast.success("Payment order created successfully!");

      // Reset form
      setInvoice("");
      setDescription("");
      setAmount("");
      setClientEmail("");
      setClientName("");
      setNotes("");
    } catch (err) {
      setError("Failed to create payment order");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = async () => {
    if (!paymentLink) return;
    const fullLink = `${window.location.origin}${paymentLink}`;
    await navigator.clipboard.writeText(fullLink);
    setCopied(true);
    toast.success("Payment link copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{ minHeight: "100vh", background: T.bg, padding: 20, fontFamily: T.font }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&display=swap');
        input:focus, select:focus, textarea:focus { border-color: ${T.accent} !important; box-shadow: 0 0 0 2px rgba(159,255,0,0.1) !important; }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes slideUp { from { opacity:0;transform:translateY(20px) } to { opacity:1;transform:translateY(0) } }
        .slide-up { animation: slideUp 0.3s ease forwards; }
      `}</style>

      <div className="slide-up" style={{ maxWidth: 700, margin: "0 auto" }}>
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: T.text, margin: "0 0 8px" }}>
            Create Payment Invoice
          </h1>
          <p style={{ fontSize: 13, color: T.muted, margin: 0 }}>
            Generate payment links for clients (USD or INR)
          </p>
        </div>

        {/* Success Message */}
        {success && (
          <div style={{ padding: "14px 16px", background: "rgba(159,255,0,0.08)", border: `1px solid ${T.accentBorder}`, borderRadius: 12, marginBottom: 20 }}>
            <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
              <CheckCircle2 size={18} style={{ color: T.accent, flexShrink: 0, marginTop: 2 }} />
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 13, fontWeight: 700, color: T.accent, margin: "0 0 8px" }}>Payment Order Created</p>
                <p style={{ fontSize: 12, color: T.text, margin: "0 0 12px", lineHeight: 1.6 }}>{success}</p>
                <button
                  onClick={handleCopyLink}
                  style={{ padding: "8px 14px", borderRadius: 8, background: T.accent, color: "#000", fontWeight: 700, fontSize: 12, border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 6, fontFamily: T.font }}
                >
                  {copied ? <><CheckCircle2 size={14} /> Copied!</> : <><Copy size={14} /> Copy Link</>}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div style={{ padding: "12px 14px", background: "rgba(255,68,68,0.08)", border: "1px solid rgba(255,68,68,0.2)", borderRadius: 10, marginBottom: 20, display: "flex", gap: 10 }}>
            <AlertTriangle size={16} style={{ color: T.error, flexShrink: 0 }} />
            <p style={{ fontSize: 12, color: T.error, margin: 0 }}>{error}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 16, padding: 24, display: "flex", flexDirection: "column", gap: 18 }}>
          {/* Invoice Number */}
          <div>
            <label style={{ fontSize: 11, color: T.muted, textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: 7 }}>Invoice Number</label>
            <input style={inp} placeholder="INV-2024-001" value={invoice} onChange={(e) => setInvoice(e.target.value)} />
          </div>

          {/* Service Description */}
          <div>
            <label style={{ fontSize: 11, color: T.muted, textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: 7 }}>Service Description</label>
            <textarea style={{ ...inp, minHeight: 80, resize: "vertical", lineHeight: 1.5 }} placeholder="e.g., Custom website development, SEO optimization, etc." value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>

          {/* Amount & Currency */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <div>
              <label style={{ fontSize: 11, color: T.muted, textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: 7 }}>Amount</label>
              <input style={inp} type="number" placeholder="5000" value={amount} onChange={(e) => setAmount(e.target.value)} step="0.01" min="0" />
            </div>
            <div>
              <label style={{ fontSize: 11, color: T.muted, textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: 7 }}>Currency</label>
              <select style={inp} value={currency} onChange={(e) => setCurrency(e.target.value as Currency)}>
                <option value="INR">INR (₹ India)</option>
                <option value="USD">USD ($ International)</option>
              </select>
            </div>
          </div>

          {/* Service Type */}
          <div>
            <label style={{ fontSize: 11, color: T.muted, textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: 7 }}>Service Type</label>
            <select style={inp} value={serviceType} onChange={(e) => setServiceType(e.target.value)}>
              <option value="service_1">Service 1</option>
              <option value="service_2">Service 2</option>
            </select>
          </div>

          {/* Client Email */}
          <div>
            <label style={{ fontSize: 11, color: T.muted, textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: 7 }}>Client Email</label>
            <input style={inp} type="email" placeholder="client@example.com" value={clientEmail} onChange={(e) => setClientEmail(e.target.value)} />
          </div>

          {/* Client Name */}
          <div>
            <label style={{ fontSize: 11, color: T.muted, textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: 7 }}>Client Name (Optional)</label>
            <input style={inp} placeholder="John Doe" value={clientName} onChange={(e) => setClientName(e.target.value)} />
          </div>

          {/* Notes */}
          <div>
            <label style={{ fontSize: 11, color: T.muted, textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: 7 }}>Notes (Optional)</label>
            <textarea style={{ ...inp, minHeight: 60, resize: "vertical" }} placeholder="Any additional notes..." value={notes} onChange={(e) => setNotes(e.target.value)} />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            style={{ padding: "14px", borderRadius: 10, background: T.accent, color: "#000", fontWeight: 700, fontSize: 14, border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, opacity: loading ? 0.6 : 1, fontFamily: T.font }}
          >
            {loading ? <><Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} /> Creating...</> : <><Send size={16} /> Create Payment Invoice</>}
          </button>
        </form>

        {/* Info */}
        <div style={{ marginTop: 24, padding: "12px 14px", background: "rgba(159,255,0,0.04)", border: `1px solid ${T.accentBorder}`, borderRadius: 10 }}>
          <p style={{ fontSize: 11, color: T.muted, margin: 0, lineHeight: 1.6 }}>
            💡 After creating the invoice, a unique payment link will be generated. Share this link with your client to collect payment via Razorpay.
          </p>
        </div>
      </div>
    </div>
  );
}
