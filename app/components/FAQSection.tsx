// app/components/FAQSection.tsx
// FAQ accordion section - By Engage Ad

'use client';

import { useState } from 'react';

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      question: 'Is NoTrace really secure?',
      answer: 'Yes. NoTrace uses AES-256-GCM encryption, military-grade security used by governments and banks. The server never sees your plaintext message. Only the recipient with the link can decrypt it.',
    },
    {
      question: 'Can I recover a deleted secret?',
      answer: 'No. Once the secret is deleted (either by recipient opening it or expiry time passing), it\'s gone forever. That\'s by design - it\'s the point of NoTrace.',
    },
    {
      question: 'How long can I make a secret visible?',
      answer: 'You can choose: 1 Hour, 1 Day, 7 Days, or 30 Days. After expiry, the message is deleted. But it deletes IMMEDIATELY when recipient opens it (burn after read).',
    },
    {
      question: 'Can I see who opened my secret?',
      answer: 'Currently, no. We don\'t track who opens secrets. We only know if a secret was deleted or expired. This protects your recipient\'s privacy too.',
    },
    {
      question: 'What if the recipient refreshes the page?',
      answer: 'The message is gone. Since we delete it from the server immediately after reading, refreshing will show "Not Found". The message can only be seen once.',
    },
    {
      question: 'Can I password-protect my secret?',
      answer: 'Yes! You can add an optional password. The recipient needs BOTH the link AND the password to decrypt. The password hash is stored, but the actual password isn\'t.',
    },
    {
      question: 'Is there a limit on message length?',
      answer: 'Messages can be up to 1MB in size, which is plenty for text, code snippets, and documents. Perfect for secrets of any reasonable length.',
    },
    {
      question: 'What if my link expires before the recipient opens it?',
      answer: 'If the time limit passes before they open it, the message is automatically deleted from our servers. They\'ll see "Not Found" when trying to open the link.',
    },
    {
      question: 'Do you store any logs of my secrets?',
      answer: 'No. We only store the encrypted blob. We don\'t store plaintext, keys, IPs, or access logs. We literally can\'t see your secrets.',
    },
    {
      question: 'Can I use NoTrace for business/enterprise?',
      answer: 'Absolutely! We offer Business and Enterprise plans with advanced features, team management, unlimited secrets, and API access.',
    },
    {
      question: 'What happens if someone hacks your database?',
      answer: 'They\'d only get encrypted blobs. Without the encryption keys (which are only in URLs), the data is useless. That\'s why zero-knowledge encryption matters.',
    },
    {
      question: 'Is there a mobile app?',
      answer: 'NoTrace works great on mobile browsers (iOS Safari, Chrome, etc.). A native app is on the roadmap, but you don\'t need it - the web app is fully mobile-optimized.',
    },
  ];

  return (
    <section className="py-16 md:py-24 bg-white dark:bg-gray-900">
      <div className="container mx-auto px-4">
        {/* Headline */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-dark dark:text-light">
            Frequently Asked Questions
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Everything you need to know about NoTrace security, privacy, and usage.
          </p>
        </div>

        {/* Accordion */}
        <div className="max-w-3xl mx-auto space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden"
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full p-6 text-left bg-light dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition flex items-center justify-between"
              >
                <h3 className="text-lg font-semibold text-dark dark:text-light pr-4">
                  {faq.question}
                </h3>
                <span className={`text-primary text-xl flex-shrink-0 transition ${openIndex === index ? 'rotate-180' : ''}`}>
                  ▼
                </span>
              </button>

              {/* Answer */}
              {openIndex === index && (
                <div className="p-6 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                    {faq.answer}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Still have questions */}
        <div className="text-center mt-12">
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Still have questions?
          </p>
          <a
            href="mailto:mouhitkanaujia@gmail.com"
            className="inline-block border-2 border-primary text-primary font-semibold px-6 py-2 rounded-lg hover:bg-primary hover:text-dark transition"
          >
            Contact Us
          </a>
        </div>
      </div>
    </section>
  );
}
