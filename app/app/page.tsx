export default function AppPage() {
  return (
    <main className="min-h-screen bg-light dark:bg-dark">
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold text-center mb-4">Create a Secret</h1>
        <p className="text-center text-gray-600 dark:text-gray-400 mb-12">
          Your message will be encrypted and self-destruct after reading
        </p>
        
        <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold mb-2">Your Secret Message</label>
              <textarea
                className="w-full h-32 p-4 border border-gray-300 dark:border-gray-700 rounded-lg dark:bg-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Type your secret message here..."
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Password (Optional)</label>
              <input
                type="password"
                className="w-full p-4 border border-gray-300 dark:border-gray-700 rounded-lg dark:bg-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Add an optional password for extra security"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Expires After</label>
              <select className="w-full p-4 border border-gray-300 dark:border-gray-700 rounded-lg dark:bg-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary">
                <option>1 Hour</option>
                <option>1 Day</option>
                <option>7 Days</option>
                <option>30 Days</option>
              </select>
            </div>

            <button className="w-full bg-primary text-dark font-semibold py-3 rounded-lg hover:opacity-90 transition">
              Create Secret
            </button>
          </div>

          <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900 rounded-lg">
            <p className="text-sm text-blue-900 dark:text-blue-100">
              ℹ️ Your message is encrypted in your browser. The server never sees the plaintext. Only you and the recipient can read it.
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}
