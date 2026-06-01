// app/components/ProblemSection.tsx
// Problem section highlighting pain points - By Engage Ad

export default function ProblemSection() {
  const problems = [
    {
      icon: '🔓',
      title: 'Email Breaches',
      description: 'Passwords shared via email are exposed to hackers and can be forwarded indefinitely',
    },
    {
      icon: '💬',
      title: 'Chat Messages Persist',
      description: 'Messages in Slack, WhatsApp, and Teams are never truly deleted - they\'re archived forever',
    },
    {
      icon: '📸',
      title: 'Screenshots & Forwarding',
      description: 'Anyone can screenshot your secret and share it with others without your knowledge',
    },
    {
      icon: '👁️',
      title: 'No Privacy Control',
      description: 'You can\'t tell who accessed your secret, when they accessed it, or if they shared it',
    },
  ];

  return (
    <section className="py-16 md:py-24 bg-light dark:bg-dark">
      <div className="container mx-auto px-4">
        {/* Headline */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-dark dark:text-light">
            Sharing Secrets Shouldn&apos;t Be This Risky
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Every day, sensitive information is lost, leaked, or misused. Traditional methods of sharing secrets are broken.
          </p>
        </div>

        {/* Problems Grid */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {problems.map((problem, index) => (
            <div
              key={index}
              className="p-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-lg transition"
            >
              <div className="text-4xl mb-4">{problem.icon}</div>
              <h3 className="text-xl font-semibold mb-2 text-dark dark:text-light">
                {problem.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {problem.description}
              </p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-12">
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            There&apos;s a better way. A way that puts control back in your hands.
          </p>
          <a
            href="#solution"
            className="inline-block bg-primary text-dark font-semibold px-8 py-3 rounded-lg hover:opacity-90 transition"
          >
            See How NoTrace Works →
          </a>
        </div>
      </div>
    </section>
  );
}
