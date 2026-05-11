"use client";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { useState } from "react";

export default function PrivacyPolicyPage() {
  const [expandedSections, setExpandedSections] = useState<Set<number>>(new Set());

  const toggleSection = (id: number) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedSections(newExpanded);
  };

  const sections = [
    {
      id: 1,
      title: "1. Introduction",
      content: "NoTrace is committed to protecting your privacy. This Privacy Policy explains how we collect, use, and handle your personal information."
    },
    {
      id: 2,
      title: "2. Information We Collect",
      content: "We collect account information, payment data, communication records, device information, and usage data. All data is encrypted and securely stored."
    },
    {
      id: 3,
      title: "3. How We Use Your Information",
      content: "Your information is used for service operations, communication, improvement, security, and with your consent, marketing."
    },
    {
      id: 4,
      title: "4. Data Storage and Retention",
      content: "Data is stored on secure Supabase servers. Ephemeral messages auto-delete in 10-15 seconds. Account data deleted 90 days after account closure."
    },
    {
      id: 5,
      title: "5. Sharing and Disclosure",
      content: "We don't share data with marketers or advertisers. We only share with service providers (Razorpay, Supabase, Vercel) and when legally required."
    },
    {
      id: 6,
      title: "6. Your Rights and Choices",
      content: "You have rights to access, correct, delete, and restrict your data. Email privacy@engagead.in to exercise these rights. Response within 15 business days."
    },
    {
      id: 7,
      title: "7. Children's Privacy",
      content: "NoTrace is not for children under 18. We don't knowingly collect data from minors. Contact us if you believe we have done so."
    },
    {
      id: 8,
      title: "8. International Data Transfer",
      content: "Your data may be transferred internationally. We comply with GDPR, CCPA, and other regulations. Standard Contractual Clauses for EU data."
    },
    {
      id: 9,
      title: "9. GDPR & CCPA Compliance",
      content: "Full GDPR compliance for EU users including Data Protection Officer. CCPA compliance for California residents with right to delete and opt-out."
    },
    {
      id: 10,
      title: "10. Cookies and Analytics",
      content: "We use authentication, preference, analytics, and security cookies. You can disable cookies in browser settings. Google Analytics opt-out available."
    },
  ];

  return (
    <div style={{ background: "#050505", minHeight: "100vh", color: "#f0f0f0", fontFamily: "'JetBrains Mono', monospace" }}>
      {/* Header */}
      <div style={{ background: "#0e0e0e", borderBottom: "1px solid #1a1a1a", padding: "40px 20px" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <h1 style={{ fontSize: 32, fontWeight: 700, margin: "0 0 12px" }}>Privacy Policy</h1>
          <p style={{ fontSize: 14, color: "#666", margin: "0 0 8px" }}>Last Updated: May 2026</p>
          <p style={{ fontSize: 13, color: "#999", margin: 0 }}>NoTrace's commitment to protecting your privacy</p>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "40px 20px" }}>
        <div style={{ background: "rgba(159,255,0,0.04)", border: "1px solid rgba(159,255,0,0.15)", borderRadius: 12, padding: 20, marginBottom: 40 }}>
          <p style={{ fontSize: 13, margin: 0, lineHeight: 1.6 }}>
            🔐 <strong>Your Privacy Matters.</strong> We collect minimal data, never sell your information, and comply with GDPR, CCPA, and Indian privacy laws. All data is encrypted and securely stored on Supabase.
          </p>
        </div>

        {/* Sections */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 40 }}>
          {sections.map((section) => (
            <div
              key={section.id}
              style={{
                border: "1px solid #1a1a1a",
                borderRadius: 10,
                overflow: "hidden",
                background: "#0e0e0e",
              }}
            >
              <button
                onClick={() => toggleSection(section.id)}
                style={{
                  width: "100%",
                  padding: "16px 18px",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  color: "#f0f0f0",
                  fontSize: 14,
                  fontWeight: 700,
                  fontFamily: "'JetBrains Mono', monospace",
                  transition: "background 0.2s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(159,255,0,0.08)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
              >
                {section.title}
                <ChevronDown
                  size={18}
                  style={{
                    transform: expandedSections.has(section.id) ? "rotate(180deg)" : "rotate(0deg)",
                    transition: "transform 0.2s",
                    color: "#9fff00",
                  }}
                />
              </button>

              {expandedSections.has(section.id) && (
                <div style={{ padding: "0 18px 16px", borderTop: "1px solid #1a1a1a", color: "#999", fontSize: 13, lineHeight: 1.7 }}>
                  {section.content}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Contact */}
        <div style={{ background: "#0e0e0e", border: "1px solid #1a1a1a", borderRadius: 12, padding: 24, marginBottom: 40 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, margin: "0 0 16px" }}>Have Questions?</h3>
          <p style={{ fontSize: 13, color: "#999", margin: "0 0 12px" }}>
            Contact our Privacy team for any concerns or to exercise your data rights:
          </p>
          <p style={{ fontSize: 13, margin: 0 }}>
            📧 <strong>privacy@engagead.in</strong>
          </p>
          <p style={{ fontSize: 12, color: "#666", margin: "8px 0 0" }}>Response within 15 business days</p>
        </div>

        {/* Footer Links */}
        <div style={{ display: "flex", gap: 20, justifyContent: "center", fontSize: 13, color: "#9fff00", marginBottom: 60 }}>
          <Link href="/terms" style={{ textDecoration: "none", color: "#9fff00" }}>Terms of Service</Link>
          <span style={{ color: "#1a1a1a" }}>•</span>
          <Link href="/refund-policy" style={{ textDecoration: "none", color: "#9fff00" }}>Refund Policy</Link>
          <span style={{ color: "#1a1a1a" }}>•</span>
          <Link href="/" style={{ textDecoration: "none", color: "#9fff00" }}>Home</Link>
        </div>
      </div>
    </div>
  );
}
