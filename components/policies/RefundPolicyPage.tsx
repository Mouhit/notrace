"use client";
import Link from "next/link";
import { CheckCircle2, XCircle, Clock } from "lucide-react";

export default function RefundPolicyPage() {
  return (
    <div style={{ background: "#050505", minHeight: "100vh", color: "#f0f0f0", fontFamily: "'JetBrains Mono', monospace" }}>
      {/* Header */}
      <div style={{ background: "#0e0e0e", borderBottom: "1px solid #1a1a1a", padding: "40px 20px" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <h1 style={{ fontSize: 32, fontWeight: 700, margin: "0 0 12px" }}>Refund Policy</h1>
          <p style={{ fontSize: 14, color: "#666", margin: "0 0 8px" }}>Last Updated: May 2026</p>
          <p style={{ fontSize: 13, color: "#999", margin: 0 }}>15-Day Money-Back Guarantee</p>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "40px 20px" }}>
        {/* Quick Summary */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 16,
          marginBottom: 40,
        }}>
          <div style={{ background: "rgba(159,255,0,0.08)", border: "1px solid rgba(159,255,0,0.25)", borderRadius: 12, padding: 20 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
              <Clock size={18} style={{ color: "#9fff00" }} />
              <h3 style={{ fontSize: 13, fontWeight: 700, margin: 0 }}>15-Day Window</h3>
            </div>
            <p style={{ fontSize: 12, color: "#999", margin: 0, lineHeight: 1.6 }}>
              Request refunds within 15 days of payment
            </p>
          </div>

          <div style={{ background: "rgba(159,255,0,0.08)", border: "1px solid rgba(159,255,0,0.25)", borderRadius: 12, padding: 20 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
              <CheckCircle2 size={18} style={{ color: "#34d399" }} />
              <h3 style={{ fontSize: 13, fontWeight: 700, margin: 0 }}>Quick Processing</h3>
            </div>
            <p style={{ fontSize: 12, color: "#999", margin: 0, lineHeight: 1.6 }}>
              Processed within 5-7 business days
            </p>
          </div>

          <div style={{ background: "rgba(159,255,0,0.08)", border: "1px solid rgba(159,255,0,0.25)", borderRadius: 12, padding: 20 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
              <CheckCircle2 size={18} style={{ color: "#34d399" }} />
              <h3 style={{ fontSize: 13, fontWeight: 700, margin: 0 }}>Full Refund</h3>
            </div>
            <p style={{ fontSize: 12, color: "#999", margin: 0, lineHeight: 1.6 }}>
              If unsatisfied with service quality
            </p>
          </div>
        </div>

        {/* Key Points */}
        <div style={{ background: "#0e0e0e", border: "1px solid #1a1a1a", borderRadius: 12, padding: 24, marginBottom: 40 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, margin: "0 0 16px" }}>Quick Summary</h2>

          <div style={{ marginBottom: 24 }}>
            <h3 style={{ fontSize: 13, fontWeight: 700, color: "#34d399", margin: "0 0 12px", textTransform: "uppercase" }}>✅ You Get Refund If:</h3>
            <ul style={{ margin: 0, paddingLeft: 20, fontSize: 13, color: "#999", lineHeight: 1.8 }}>
              <li>Paid for a service (Service 1 or Service 2)</li>
              <li>Requested refund within 15 days of payment</li>
              <li>Service didn't meet your expectations</li>
              <li>Provided detailed reason for dissatisfaction</li>
            </ul>
          </div>

          <div>
            <h3 style={{ fontSize: 13, fontWeight: 700, color: "#ff4444", margin: "0 0 12px", textTransform: "uppercase" }}>❌ No Refund If:</h3>
            <ul style={{ margin: 0, paddingLeft: 20, fontSize: 13, color: "#999", lineHeight: 1.8 }}>
              <li><strong>15+ days</strong> have passed since payment</li>
              <li>Requesting refund for simple change of mind</li>
              <li>Service was fully used and completed as described</li>
              <li>You didn't communicate within the 15-day window</li>
            </ul>
          </div>
        </div>

        {/* Refund Process */}
        <div style={{ background: "#0e0e0e", border: "1px solid #1a1a1a", borderRadius: 12, padding: 24, marginBottom: 40 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, margin: "0 0 20px" }}>How to Get a Refund</h2>

          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {[
              {
                step: "1",
                title: "Send Request",
                details: "Email refunds@engagead.in with invoice #, payment date, amount, and reason"
              },
              {
                step: "2",
                title: "We Review",
                details: "Our team reviews your request (3-5 business days)"
              },
              {
                step: "3",
                title: "Decision",
                details: "We email you approval/denial with explanation"
              },
              {
                step: "4",
                title: "Refund Processed",
                details: "Money returned to original payment method (5-7 days)"
              },
            ].map((item) => (
              <div key={item.step} style={{ display: "flex", gap: 16 }}>
                <div style={{
                  width: 32,
                  height: 32,
                  borderRadius: "50%",
                  background: "#9fff00",
                  color: "#000",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 700,
                  flexShrink: 0,
                }}>
                  {item.step}
                </div>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 700, margin: "0 0 4px" }}>{item.title}</p>
                  <p style={{ fontSize: 12, color: "#999", margin: 0 }}>{item.details}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Timeline */}
        <div style={{ background: "#0e0e0e", border: "1px solid #1a1a1a", borderRadius: 12, padding: 24, marginBottom: 40 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, margin: "0 0 16px" }}>Refund Timeline</h2>
          <table style={{
            width: "100%",
            borderCollapse: "collapse",
            fontSize: 13,
          }}>
            <thead>
              <tr style={{ borderBottom: "1px solid #1a1a1a" }}>
                <th style={{ textAlign: "left", padding: "8px 0", fontWeight: 700, color: "#9fff00" }}>Event</th>
                <th style={{ textAlign: "left", padding: "8px 0", fontWeight: 700, color: "#9fff00" }}>Timeline</th>
              </tr>
            </thead>
            <tbody>
              {[
                { event: "Payment made", time: "Day 0" },
                { event: "Refund request deadline", time: "Day 15" },
                { event: "Review completed", time: "Day 3-5" },
                { event: "Decision notified", time: "Day 8-10" },
                { event: "Refund processed", time: "Day 15-20" },
              ].map((row, idx) => (
                <tr key={idx} style={{ borderBottom: idx < 4 ? "1px solid #1a1a1a" : "none" }}>
                  <td style={{ padding: "10px 0", color: "#f0f0f0" }}>{row.event}</td>
                  <td style={{ padding: "10px 0", color: "#999" }}>{row.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Special Cases */}
        <div style={{ background: "#0e0e0e", border: "1px solid #1a1a1a", borderRadius: 12, padding: 24, marginBottom: 40 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, margin: "0 0 16px" }}>Special Cases</h2>

          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div>
              <p style={{ fontSize: 13, fontWeight: 700, margin: "0 0 8px" }}>Service Not Delivered</p>
              <p style={{ fontSize: 12, color: "#999", margin: 0 }}>Full refund immediately eligible, no waiting period.</p>
            </div>
            <div style={{ borderTop: "1px solid #1a1a1a", paddingTop: 16 }}>
              <p style={{ fontSize: 13, fontWeight: 700, margin: "0 0 8px" }}>Fraud/Unauthorized</p>
              <p style={{ fontSize: 12, color: "#999", margin: 0 }}>Contact us immediately. Full refund + investigation with Razorpay.</p>
            </div>
            <div style={{ borderTop: "1px solid #1a1a1a", paddingTop: 16 }}>
              <p style={{ fontSize: 13, fontWeight: 700, margin: "0 0 8px" }}>Partial Completion</p>
              <p style={{ fontSize: 12, color: "#999", margin: 0 }}>0-25% done: full refund. 26-50%: 50% refund. 51-75%: 25% refund. 75%+: no refund.</p>
            </div>
          </div>
        </div>

        {/* Contact */}
        <div style={{ background: "rgba(159,255,0,0.08)", border: "1px solid rgba(159,255,0,0.25)", borderRadius: 12, padding: 24, marginBottom: 40 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, margin: "0 0 12px" }}>Need a Refund?</h3>
          <p style={{ fontSize: 13, color: "#999", margin: "0 0 16px", lineHeight: 1.6 }}>
            We stand behind our services. If you're not satisfied, we'll refund you within 15 days.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <p style={{ fontSize: 13, margin: 0 }}>
              📧 <strong>Refunds:</strong> refunds@engagead.in
            </p>
            <p style={{ fontSize: 13, margin: 0 }}>
              🔄 <strong>Appeals:</strong> appeals@engagead.in
            </p>
            <p style={{ fontSize: 12, color: "#666", margin: "8px 0 0" }}>Response within 24-48 hours</p>
          </div>
        </div>

        {/* FAQ */}
        <div style={{ background: "#0e0e0e", border: "1px solid #1a1a1a", borderRadius: 12, padding: 24, marginBottom: 40 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, margin: "0 0 20px" }}>Common Questions</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {[
              { q: "What if I request on day 16?", a: "Ineligible. The 15-day window is strict." },
              { q: "Can I get cash instead of refund to card?", a: "No. Refunds go to original payment method only." },
              { q: "How long does the refund take?", a: "5-7 business days after approval. May vary by your bank." },
              { q: "Can I appeal if denied?", a: "Yes. Email appeals@engagead.in with additional details." },
              { q: "What about payment processing fees?", a: "Non-refundable per Razorpay terms." },
            ].map((item, idx) => (
              <div key={idx} style={{ borderTop: idx > 0 ? "1px solid #1a1a1a" : "none", paddingTop: idx > 0 ? 12 : 0 }}>
                <p style={{ fontSize: 13, fontWeight: 700, margin: "0 0 6px", color: "#9fff00" }}>Q: {item.q}</p>
                <p style={{ fontSize: 12, color: "#999", margin: 0 }}>A: {item.a}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Footer Links */}
        <div style={{ display: "flex", gap: 20, justifyContent: "center", fontSize: 13, color: "#9fff00", marginBottom: 60 }}>
          <Link href="/privacy-policy" style={{ textDecoration: "none", color: "#9fff00" }}>Privacy Policy</Link>
          <span style={{ color: "#1a1a1a" }}>•</span>
          <Link href="/terms" style={{ textDecoration: "none", color: "#9fff00" }}>Terms of Service</Link>
          <span style={{ color: "#1a1a1a" }}>•</span>
          <Link href="/" style={{ textDecoration: "none", color: "#9fff00" }}>Home</Link>
        </div>
      </div>
    </div>
  );
}
