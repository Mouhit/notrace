// app/page.tsx
// Landing page with all Phase 1.4 sections - By Engage Ad
import PricingSection from '@/components/pricing-section';
import ProblemSection from './components/ProblemSection';
import SolutionSection from './components/SolutionSection';
import UseCasesSection from './components/UseCasesSection';
import FAQSection from './components/FAQSection';
import TestimonialsSection from './components/TestimonialsSection';

export const metadata = {
  title: 'NoTrace - Burn After Read Secret Sharing',
  description: 'Share secrets safely. Messages encrypt in browser, self-destruct after reading. Zero-knowledge encryption. Perfect for passwords, documents, and private messages.',
};

export default function Home() {
  return (
    <main className="bg-light dark:bg-dark">
      {/* Hero Section */}
      <section className="py-20 md:py-32 bg-gradient-to-b from-light to-white dark:from-dark dark:to-gray-900">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 text-dark dark:text-light leading-tight">
              Share Secrets. Not Traces.
            </h1>
            <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 mb-8">
              Send encrypted messages that self-destruct after reading. Zero-knowledge encryption means we can&apos;t see your secrets. Only you and the recipient can read it.
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <a
                href="/app"
                className="bg-primary text-dark font-semibold px-8 py-3 rounded-lg hover:opacity-90 transition"
              >
                Create a Secret →
              </a>
              <a
                href="#solution"
                className="border-2 border-primary text-primary font-semibold px-8 py-3 rounded-lg hover:bg-primary hover:text-dark transition"
              >
                Learn More
              </a>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-500 mt-6">
              ✅ No signup required • 🔐 AES-256-GCM encryption • 💨 Auto-deletes
            </p>
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <ProblemSection />

      {/* Solution Section */}
      <SolutionSection />

      {/* Use Cases Section */}
      <UseCasesSection />

      {/* Features Section */}
      <section className="py-16 md:py-24 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16 text-dark dark:text-light">
            Why Choose NoTrace?
          </h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="text-4xl mb-4">🔐</div>
              <h3 className="text-xl font-bold mb-2 text-dark dark:text-light">Military-Grade Encryption</h3>
              <p className="text-gray-600 dark:text-gray-400">
                AES-256-GCM encryption used by governments and banks.
              </p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-4">💨</div>
              <h3 className="text-xl font-bold mb-2 text-dark dark:text-light">Burns After Reading</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Messages self-destruct immediately after recipient views them.
              </p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-4">🚀</div>
              <h3 className="text-xl font-bold mb-2 text-dark dark:text-light">No Signup Needed</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Create and share secrets instantly. No login required.
              </p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-4">👁️</div>
              <h3 className="text-xl font-bold mb-2 text-dark dark:text-light">Zero-Knowledge</h3>
              <p className="text-gray-600 dark:text-gray-400">
                We can&apos;t see your secrets, even if we wanted to.
              </p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-4">🔗</div>
              <h3 className="text-xl font-bold mb-2 text-dark dark:text-light">Share a Link</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Get a unique link with encryption built-in.
              </p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-4">📱</div>
              <h3 className="text-xl font-bold mb-2 text-dark dark:text-light">Mobile Ready</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Works perfectly on phones and tablets.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <TestimonialsSection />

      {/* FAQ Section */}
      <FAQSection />

      {/* Pricing Section */}
      <section className="py-16 md:py-24 bg-light dark:bg-dark">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16 text-dark dark:text-light">
            Simple, Honest Pricing
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-6 max-w-6xl mx-auto">
            {/* Free */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-bold mb-2 text-dark dark:text-light">Free</h3>
              <p className="text-2xl font-bold text-primary mb-4">$0</p>
              <ul className="text-sm space-y-2 text-gray-600 dark:text-gray-400 mb-6">
                <li>✅ 5 secrets/day</li>
                <li>✅ 1 day expiry</li>
                <li>✅ No signup</li>
                <li>❌ No collections</li>
              </ul>
              <a href="/app" className="block text-center bg-gray-200 dark:bg-gray-700 text-dark dark:text-light py-2 rounded-lg">
                Get Started
              </a>
            </div>

            {/* Trial */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-bold mb-2 text-dark dark:text-light">Trial</h3>
              <p className="text-2xl font-bold text-primary mb-4">$1.99<span className="text-sm">/mo</span></p>
              <ul className="text-sm space-y-2 text-gray-600 dark:text-gray-400 mb-6">
                <li>✅ 20 secrets/day</li>
                <li>✅ 15 day expiry</li>
                <li>✅ 2 collections</li>
                <li>✅ Email login</li>
              </ul>
              <button className="w-full border-2 border-primary text-primary py-2 rounded-lg hover:bg-primary hover:text-dark transition">
                Try Trial
              </button>
            </div>

            {/* Pro */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border-2 border-primary relative">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-primary text-dark px-4 py-1 rounded-full text-sm font-bold">
                Popular
              </div>
              <h3 className="text-lg font-bold mb-2 text-dark dark:text-light">Pro</h3>
              <p className="text-2xl font-bold text-primary mb-4">$4.99<span className="text-sm">/mo</span></p>
              <ul className="text-sm space-y-2 text-gray-600 dark:text-gray-400 mb-6">
                <li>✅ 50 secrets/day</li>
                <li>✅ 30 day expiry</li>
                <li>✅ 10 collections</li>
                <li>✅ All features</li>
              </ul>
              <button className="w-full bg-primary text-dark py-2 rounded-lg hover:opacity-90 transition font-bold">
                Upgrade to Pro
              </button>
            </div>

            {/* Business */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-bold mb-2 text-dark dark:text-light">Business</h3>
              <p className="text-2xl font-bold text-primary mb-4">$9.99<span className="text-sm">/mo</span></p>
              <ul className="text-sm space-y-2 text-gray-600 dark:text-gray-400 mb-6">
                <li>✅ Unlimited secrets</li>
                <li>✅ 90 day expiry</li>
                <li>✅ Team (5 users)</li>
                <li>✅ API access</li>
              </ul>
              <button className="w-full border-2 border-primary text-primary py-2 rounded-lg hover:bg-primary hover:text-dark transition">
                Contact Sales
              </button>
            </div>

            {/* Enterprise */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-bold mb-2 text-dark dark:text-light">Enterprise</h3>
              <p className="text-2xl font-bold text-primary mb-4">Custom</p>
              <ul className="text-sm space-y-2 text-gray-600 dark:text-gray-400 mb-6">
                <li>✅ Everything</li>
                <li>✅ Unlimited team</li>
                <li>✅ Custom domain</li>
                <li>✅ Support</li>
              </ul>
              <button className="w-full border-2 border-primary text-primary py-2 rounded-lg hover:bg-primary hover:text-dark transition">
                Contact Us
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 md:py-24 bg-primary text-dark">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Share Secrets Safely?
          </h2>
          <p className="text-lg mb-8 max-w-2xl mx-auto opacity-90">
            No signup required. No credit card needed. Create your first secret in seconds.
          </p>
          <a
            href="/app"
            className="inline-block bg-dark text-primary font-semibold px-10 py-4 rounded-lg hover:opacity-90 transition text-lg"
          >
            Create a Secret Now →
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-dark text-light py-12 border-t border-gray-700">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="font-bold mb-4">NoTrace</h3>
              <p className="text-gray-400 text-sm">
                Burn After Read. Zero-Knowledge Encryption. Your secrets, your control.
              </p>
            </div>
            <div>
              <h4 className="font-bold mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="/app" className="hover:text-primary">Create Secret</a></li>
                <li><a href="#pricing" className="hover:text-primary">Pricing</a></li>
                <li><a href="#security" className="hover:text-primary">Security</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-primary">About</a></li>
                <li><a href="#" className="hover:text-primary">Blog</a></li>
                <li><a href="#" className="hover:text-primary">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-primary">Privacy</a></li>
                <li><a href="#" className="hover:text-primary">Terms</a></li>
                <li><a href="#" className="hover:text-primary">Security</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-700 pt-8 text-center text-gray-400 text-sm">
            <p>© 2026 NoTrace by Engage Ad. All rights reserved.</p>
            <p className="mt-2">
              📧 mouhitkanaujia@gmail.com • 📱 +91 9369524385
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}
