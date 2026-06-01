// app/components/UseCasesSection.tsx
// Use cases section with real-world scenarios - By Engage Ad

export default function UseCasesSection() {
  const useCases = [
    {
      icon: '🔑',
      title: 'Share Passwords Safely',
      description: 'Send API keys, database credentials, and access tokens to contractors without email exposure',
      color: 'from-blue-500 to-cyan-500',
    },
    {
      icon: '⚖️',
      title: 'Legal Documents',
      description: 'Share sensitive legal files with lawyers while maintaining attorney-client privilege',
      color: 'from-purple-500 to-pink-500',
    },
    {
      icon: '🏥',
      title: 'Medical Records',
      description: 'Send health information to doctors and specialists securely without HIPAA concerns',
      color: 'from-red-500 to-orange-500',
    },
    {
      icon: '💌',
      title: 'Private Messages',
      description: 'Send love notes, confessions, or sensitive personal messages that disappear forever',
      color: 'from-pink-500 to-rose-500',
    },
    {
      icon: '💰',
      title: 'Financial Data',
      description: 'Share bank account details, tax returns, and investment info with accountants securely',
      color: 'from-green-500 to-emerald-500',
    },
    {
      icon: '🔄',
      title: 'Two-Factor Codes',
      description: 'Share backup codes and recovery keys securely without them being stored in chat',
      color: 'from-yellow-500 to-amber-500',
    },
  ];

  return (
    <section className="py-16 md:py-24 bg-light dark:bg-dark">
      <div className="container mx-auto px-4">
        {/* Headline */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-dark dark:text-light">
            Perfect For Any Sensitive Information
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Whether it&apos;s passwords, documents, or personal messages, NoTrace keeps your secrets safe.
          </p>
        </div>

        {/* Use Cases Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {useCases.map((useCase, index) => (
            <div
              key={index}
              className="group bg-white dark:bg-gray-800 rounded-lg p-6 hover:shadow-lg transition border border-gray-200 dark:border-gray-700"
            >
              {/* Icon Background */}
              <div className={`bg-gradient-to-r ${useCase.color} w-16 h-16 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition`}>
                <span className="text-3xl">{useCase.icon}</span>
              </div>

              {/* Content */}
              <h3 className="text-xl font-semibold mb-2 text-dark dark:text-light">
                {useCase.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {useCase.description}
              </p>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-12">
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Whatever your secret, NoTrace keeps it safe.
          </p>
          <a
            href="/app"
            className="inline-block bg-primary text-dark font-semibold px-8 py-3 rounded-lg hover:opacity-90 transition"
          >
            Create Your First Secret
          </a>
        </div>
      </div>
    </section>
  );
}
