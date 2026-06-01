// app/components/SolutionSection.tsx
// Solution section with 4-step flow - By Engage Ad

export default function SolutionSection() {
  const steps = [
    {
      number: '1',
      title: 'Type Your Secret',
      description: 'Write your message - password, API key, personal note, anything you want to keep private',
      icon: '✏️',
    },
    {
      number: '2',
      title: 'Encrypted in Browser',
      description: 'NoTrace encrypts your message using AES-256-GCM. You control the key. Server never sees plaintext',
      icon: '🔐',
    },
    {
      number: '3',
      title: 'Share Unique Link',
      description: 'Get a link with the encryption key built-in. Share only with who you trust. Each link is unique',
      icon: '🔗',
    },
    {
      number: '4',
      title: 'It Self-Destructs',
      description: 'Recipient opens link, sees message, clicks "Reveal". Message decrypts once and is deleted forever',
      icon: '💨',
    },
  ];

  return (
    <section id="solution" className="py-16 md:py-24 bg-white dark:bg-gray-900">
      <div className="container mx-auto px-4">
        {/* Headline */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-dark dark:text-light">
            How NoTrace Works
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Zero-knowledge encryption means we can&apos;t see your secrets, even if we wanted to. Only you and the recipient can read it.
          </p>
        </div>

        {/* Steps */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {steps.map((step, index) => (
            <div key={index} className="relative">
              {/* Card */}
              <div className="bg-light dark:bg-gray-800 p-6 rounded-lg border-2 border-primary h-full">
                {/* Number */}
                <div className="w-12 h-12 bg-primary text-dark rounded-full flex items-center justify-center font-bold text-lg mb-4">
                  {step.number}
                </div>

                {/* Icon */}
                <div className="text-4xl mb-4">{step.icon}</div>

                {/* Content */}
                <h3 className="text-lg font-semibold mb-2 text-dark dark:text-light">
                  {step.title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {step.description}
                </p>
              </div>

              {/* Arrow (hidden on mobile, last item) */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-1/2 -right-4 transform -translate-y-1/2 text-primary text-2xl">
                  →
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Security Note */}
        <div className="max-w-2xl mx-auto bg-blue-50 dark:bg-blue-900 p-6 rounded-lg text-center">
          <p className="text-sm text-blue-900 dark:text-blue-100">
            <strong>🔒 Military-Grade Security:</strong> Using AES-256-GCM encryption, the same standard used by governments and financial institutions.
          </p>
        </div>

        {/* CTA */}
        <div className="text-center mt-12">
          <a
            href="/app"
            className="inline-block bg-primary text-dark font-semibold px-8 py-3 rounded-lg hover:opacity-90 transition"
          >
            Try It Now for Free
          </a>
        </div>
      </div>
    </section>
  );
}
