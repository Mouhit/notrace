// app/components/TestimonialsSection.tsx
// Testimonials section with display and submit - By Engage Ad

'use client';

import { useEffect, useState } from 'react';

interface Testimonial {
  id: string;
  name: string | null;
  title: string | null;
  company: string | null;
  message: string;
  rating: number | null;
  avatar_url: string | null;
  created_at: string;
}

export default function TestimonialsSection() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    title: '',
    company: '',
    message: '',
    rating: 5,
    email: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');

  // Fetch testimonials
  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        const response = await fetch('/api/testimonials/list');
        if (response.ok) {
          const data = await response.json();
          setTestimonials(data.testimonials || []);
        }
      } catch (error) {
        console.error('Error fetching testimonials:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTestimonials();
  }, []);

  // Handle form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitMessage('');

    try {
      const response = await fetch('/api/testimonials/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setSubmitMessage('✅ Thank you! Your testimonial will appear after review.');
        setFormData({
          name: '',
          title: '',
          company: '',
          message: '',
          rating: 5,
          email: '',
        });
        setTimeout(() => setShowForm(false), 2000);
      } else {
        setSubmitMessage('❌ Error submitting testimonial. Please try again.');
      }
    } catch (error) {
      console.error('Error:', error);
      setSubmitMessage('❌ Error submitting testimonial. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // Render stars
  const renderStars = (rating: number | null) => {
    if (!rating) return null;
    return (
      <div className="flex gap-1">
        {Array.from({ length: 5 }).map((_, i) => (
          <span key={i} className={i < rating ? 'text-yellow-400' : 'text-gray-300'}>
            ★
          </span>
        ))}
      </div>
    );
  };

  return (
    <section className="py-16 md:py-24 bg-light dark:bg-dark">
      <div className="container mx-auto px-4">
        {/* Headline */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-dark dark:text-light">
            Trusted by Users Worldwide
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            See what others are saying about NoTrace
          </p>
        </div>

        {/* Testimonials Grid */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400">Loading testimonials...</p>
          </div>
        ) : testimonials.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {testimonials.slice(0, 6).map((testimonial) => (
              <div
                key={testimonial.id}
                className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700"
              >
                {/* Rating */}
                {testimonial.rating && (
                  <div className="mb-3">
                    {renderStars(testimonial.rating)}
                  </div>
                )}

                {/* Message */}
                <p className="text-gray-700 dark:text-gray-300 mb-4 italic">
                  &quot;{testimonial.message}&quot;
                </p>

                {/* Author */}
                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                  <p className="font-semibold text-dark dark:text-light">
                    {testimonial.name || 'Anonymous'}
                  </p>
                  {(testimonial.title || testimonial.company) && (
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {testimonial.title}
                      {testimonial.title && testimonial.company && ' at '}
                      {testimonial.company}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400">Be the first to leave a testimonial!</p>
          </div>
        )}

        {/* Submit Form */}
        {!showForm && (
          <div className="text-center mb-12">
            <button
              onClick={() => setShowForm(true)}
              className="bg-primary text-dark font-semibold px-8 py-3 rounded-lg hover:opacity-90 transition"
            >
              Share Your Experience
            </button>
          </div>
        )}

        {showForm && (
          <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 rounded-lg p-8 border border-gray-200 dark:border-gray-700">
            <h3 className="text-2xl font-bold mb-6 text-dark dark:text-light">
              Share Your Experience with NoTrace
            </h3>

            {submitMessage && (
              <div className={`p-4 rounded-lg mb-6 ${submitMessage.includes('✅') ? 'bg-green-50 dark:bg-green-900 text-green-900 dark:text-green-100' : 'bg-red-50 dark:bg-red-900 text-red-900 dark:text-red-100'}`}>
                {submitMessage}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Your name (optional)"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="p-3 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-900 dark:text-white"
                />
                <input
                  type="email"
                  placeholder="Your email (optional)"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="p-3 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-900 dark:text-white"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Your title (optional)"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="p-3 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-900 dark:text-white"
                />
                <input
                  type="text"
                  placeholder="Your company (optional)"
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  className="p-3 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-900 dark:text-white"
                />
              </div>

              <select
                value={formData.rating}
                onChange={(e) => setFormData({ ...formData, rating: parseInt(e.target.value) })}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-900 dark:text-white"
              >
                <option value="5">⭐⭐⭐⭐⭐ Excellent</option>
                <option value="4">⭐⭐⭐⭐ Very Good</option>
                <option value="3">⭐⭐⭐ Good</option>
                <option value="2">⭐⭐ Fair</option>
                <option value="1">⭐ Poor</option>
              </select>

              <textarea
                placeholder="Your testimonial (required)"
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                required
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-900 dark:text-white h-28"
              />

              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={submitting || !formData.message.trim()}
                  className="flex-1 bg-primary text-dark font-semibold py-3 rounded-lg hover:opacity-90 transition disabled:opacity-50"
                >
                  {submitting ? 'Submitting...' : 'Submit Testimonial'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 border-2 border-primary text-primary font-semibold py-3 rounded-lg hover:bg-primary hover:text-dark transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </section>
  );
}
