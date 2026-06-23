'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function PricingSection() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    // Check if user is logged in
    if (typeof window !== 'undefined') {
      const storedUserId = localStorage.getItem('userId');
      setUserId(storedUserId);
    }
  }, []);

  // Handle pricing button clicks
  const handlePlanClick = (plan: string) => {
    if (!userId) {
      // Not logged in - redirect to signup
      router.push('/auth/signup');
    } else {
      // Logged in - go to checkout with plan and userId
      router.push(`/checkout?plan=${plan}&userId=${userId}`);
    }
  };

  return (
    <section className="py-16 md:py-24 bg-light dark:bg-dark">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-16 text-dark dark:text-light">
          Simple, Honest Pricing
        </h2>

        {/* Pricing Grid - 5 Plans */}
        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-6 max-w-6xl mx-auto">
          
          {/* Free Plan */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-bold mb-2 text-dark dark:text-light">Free</h3>
            <p className="text-2xl font-bold text-primary mb-4">
              ₹0
              <span className="text-sm font-normal">/month</span>
            </p>
            <ul className="text-sm space-y-2 text-gray-600 dark:text-gray-400 mb-6">
              <li>✅ 5 secrets/day</li>
              <li>✅ 1 day expiry</li>
              <li>✅ No signup needed</li>
              <li>❌ No collections</li>
            </ul>
            <a 
              href="/app" 
              className="block text-center bg-gray-200 dark:bg-gray-700 text-dark dark:text-light py-2 rounded-lg hover:opacity-90 transition font-semibold"
            >
              Get Started
            </a>
          </div>

          {/* Trial Plan - ₹1.99/month */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-bold mb-2 text-dark dark:text-light">Trial</h3>
            <p className="text-2xl font-bold text-primary mb-4">
              ₹1.99
              <span className="text-sm font-normal">/month</span>
            </p>
            <ul className="text-sm space-y-2 text-gray-600 dark:text-gray-400 mb-6">
              <li>✅ 20 secrets/day</li>
              <li>✅ 15 day expiry</li>
              <li>✅ 2 collections</li>
              <li>✅ Email login</li>
            </ul>
            <button 
              onClick={() => handlePlanClick('TRIAL')}
              className="w-full border-2 border-primary text-primary py-2 rounded-lg hover:bg-primary hover:text-dark transition font-semibold"
            >
              {userId ? '↗ Try Trial' : '↗ Sign Up & Try'}
            </button>
          </div>

          {/* Pro Plan - ₹4.99/month (Popular) */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border-2 border-primary relative">
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-primary text-dark px-4 py-1 rounded-full text-sm font-bold">
              Popular
            </div>
            <h3 className="text-lg font-bold mb-2 text-dark dark:text-light">Pro</h3>
            <p className="text-2xl font-bold text-primary mb-4">
              ₹4.99
              <span className="text-sm font-normal">/month</span>
            </p>
            <ul className="text-sm space-y-2 text-gray-600 dark:text-gray-400 mb-6">
              <li>✅ 50 secrets/day</li>
              <li>✅ 30 day expiry</li>
              <li>✅ 10 collections</li>
              <li>✅ All features</li>
            </ul>
            <button 
              onClick={() => handlePlanClick('PRO')}
              className="w-full bg-primary text-dark py-2 rounded-lg hover:opacity-90 transition font-bold"
            >
              {userId ? '↗ Upgrade to Pro' : '↗ Sign Up for Pro'}
            </button>
          </div>

          {/* Business Plan - ₹9.99/month */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-bold mb-2 text-dark dark:text-light">Business</h3>
            <p className="text-2xl font-bold text-primary mb-4">
              ₹9.99
              <span className="text-sm font-normal">/month</span>
            </p>
            <ul className="text-sm space-y-2 text-gray-600 dark:text-gray-400 mb-6">
              <li>✅ Unlimited secrets</li>
              <li>✅ 90 day expiry</li>
              <li>✅ Team (5 users)</li>
              <li>✅ API access</li>
            </ul>
            <button 
              onClick={() => handlePlanClick('BUSINESS')}
              className="w-full border-2 border-primary text-primary py-2 rounded-lg hover:bg-primary hover:text-dark transition font-semibold"
            >
              {userId ? '↗ Upgrade' : '↗ Sign Up'}
            </button>
          </div>

          {/* Enterprise Plan - Custom pricing */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-bold mb-2 text-dark dark:text-light">Enterprise</h3>
            <p className="text-2xl font-bold text-primary mb-4">Custom</p>
            <ul className="text-sm space-y-2 text-gray-600 dark:text-gray-400 mb-6">
              <li>✅ Everything</li>
              <li>✅ Unlimited team</li>
              <li>✅ Custom domain</li>
              <li>✅ 24/7 Support</li>
            </ul>
            <a 
              href="mailto:mouhitkanaujia@gmail.com?subject=Enterprise%20Plan%20Inquiry"
              className="block text-center border-2 border-primary text-primary py-2 rounded-lg hover:bg-primary hover:text-dark transition font-semibold"
            >
              ↗ Contact Us
            </a>
          </div>
        </div>

        {/* Comparison Table (Optional) */}
        <div className="mt-16 pt-16 border-t border-gray-300 dark:border-gray-700">
          <h3 className="text-2xl font-bold text-center mb-8 text-dark dark:text-light">
            Feature Comparison
          </h3>
          <div className="overflow-x-auto max-w-4xl mx-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-300 dark:border-gray-700">
                  <th className="text-left py-3 px-4 font-bold text-dark dark:text-light">Feature</th>
                  <th className="text-center py-3 px-4 font-bold text-dark dark:text-light">Free</th>
                  <th className="text-center py-3 px-4 font-bold text-dark dark:text-light">Trial</th>
                  <th className="text-center py-3 px-4 font-bold text-dark dark:text-light">Pro</th>
                  <th className="text-center py-3 px-4 font-bold text-dark dark:text-light">Business</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <td className="py-3 px-4 text-dark dark:text-light">Secrets Per Day</td>
                  <td className="text-center py-3 px-4 text-gray-600 dark:text-gray-400">5</td>
                  <td className="text-center py-3 px-4 text-gray-600 dark:text-gray-400">20</td>
                  <td className="text-center py-3 px-4 text-gray-600 dark:text-gray-400">50</td>
                  <td className="text-center py-3 px-4 text-primary font-bold">Unlimited</td>
                </tr>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <td className="py-3 px-4 text-dark dark:text-light">Max Expiry</td>
                  <td className="text-center py-3 px-4 text-gray-600 dark:text-gray-400">1 day</td>
                  <td className="text-center py-3 px-4 text-gray-600 dark:text-gray-400">15 days</td>
                  <td className="text-center py-3 px-4 text-gray-600 dark:text-gray-400">30 days</td>
                  <td className="text-center py-3 px-4 text-gray-600 dark:text-gray-400">90 days</td>
                </tr>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <td className="py-3 px-4 text-dark dark:text-light">Collections</td>
                  <td className="text-center py-3 px-4 text-gray-600 dark:text-gray-400">-</td>
                  <td className="text-center py-3 px-4 text-gray-600 dark:text-gray-400">2</td>
                  <td className="text-center py-3 px-4 text-gray-600 dark:text-gray-400">10</td>
                  <td className="text-center py-3 px-4 text-primary font-bold">Unlimited</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 text-dark dark:text-light">Support</td>
                  <td className="text-center py-3 px-4 text-gray-600 dark:text-gray-400">-</td>
                  <td className="text-center py-3 px-4 text-gray-600 dark:text-gray-400">Email</td>
                  <td className="text-center py-3 px-4 text-gray-600 dark:text-gray-400">Priority</td>
                  <td className="text-center py-3 px-4 text-primary font-bold">24/7</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
}
