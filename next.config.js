/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          // Prevent clickjacking
          { key: "X-Frame-Options", value: "DENY" },
          // Stop MIME sniffing
          { key: "X-Content-Type-Options", value: "nosniff" },
          // Never send referrer (protects URL fragment key)
          { key: "Referrer-Policy", value: "no-referrer" },
          // Force HTTPS for 1 year
          { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains; preload" },
          // Disable browser features we don't need
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()" },
          // Content Security Policy — prevents XSS stealing the key from URL fragment
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval'", // Next.js needs these
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com data:",
              "img-src 'self' data: https://api.qrserver.com",
              "connect-src 'self' https://*.supabase.co https://api.telegram.org https://api.qrserver.com",
              "frame-ancestors 'none'",
            ].join("; "),
          },
          // Prevent XSS in older browsers
          { key: "X-XSS-Protection", value: "1; mode=block" },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
