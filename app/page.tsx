export default function Home() {
  return (
    <main className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-light dark:bg-dark border-b border-gray-200 dark:border-gray-800">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="text-2xl font-bold text-primary">NoTrace</div>
          <nav className="hidden md:flex space-x-6">
            <a href="#how-it-works" className="hover:text-primary">How it Works</a>
            <a href="#features" className="hover:text-primary">Features</a>
            <a href="#pricing" className="hover:text-primary">Pricing</a>
            <a href="#faq" className="hover:text-primary">FAQ</a>
          </nav>
          <a href="/app" className="bg-primary text-dark px-6 py-2 rounded-lg font-semibold hover:opacity-90">
            Try Now
          </a>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-5xl md:text-6xl font-bold mb-6">
          Send Secrets That Self-Destruct
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
          End-to-end encrypted messaging that burns after reading. Zero-knowledge. No accounts. No logs.
        </p>
        <div className="flex gap-4 justify-center">
          <a href="/app" className="bg-primary text-dark px-8 py-3 rounded-lg font-semibold hover:opacity-90">
            Try Now - It's Free
          </a>
          <a href="#how-it-works" className="border-2 border-primary text-primary px-8 py-3 rounded-lg font-semibold hover:bg-primary hover:text-dark">
            Learn More
          </a>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="bg-gray-50 dark:bg-gray-900 py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-12">Why Choose NoTrace?</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { title: 'End-to-End Encrypted', desc: 'AES-256-GCM encryption' },
              { title: 'Burn After Read', desc: 'Messages auto-delete after viewing' },
              { title: 'Zero-Knowledge', desc: 'Server never sees your messages' },
              { title: 'No Login Required', desc: 'Free tier stays completely anonymous' },
              { title: 'Secure Sharing', desc: 'Share via link, QR code, or chat' },
              { title: 'Open Source', desc: 'Transparency and security' },
            ].map((feature) => (
              <div key={feature.title} className="bg-light dark:bg-dark p-6 rounded-lg border border-gray-200 dark:border-gray-800">
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-600 dark:text-gray-400">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <h2 className="text-4xl font-bold mb-6">Ready to Send Secure Secrets?</h2>
        <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
          No signup. No email. No logs. Start sending encrypted secrets in seconds.
        </p>
        <a href="/app" className="inline-block bg-primary text-dark px-8 py-3 rounded-lg font-semibold text-lg hover:opacity-90">
          Start Using NoTrace →
        </a>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="font-bold mb-4">NoTrace</h3>
              <p className="text-gray-400">Secure secret sharing</p>
            </div>
            <div>
              <h4 className="font-bold mb-4">Product</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">Features</a></li>
                <li><a href="#" className="hover:text-white">Pricing</a></li>
                <li><a href="#" className="hover:text-white">Security</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">About</a></li>
                <li><a href="#" className="hover:text-white">Privacy</a></li>
                <li><a href="#" className="hover:text-white">Terms</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Contact</h4>
              <ul className="space-y-2 text-gray-400">
                <li>mouhitkanaujia@gmail.com</li>
                <li>+91 9369524385</li>
                <li>Engage Ad, Lucknow</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-gray-400">
            <p>&copy; 2026 Engage Ad. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </main>
  )
}
