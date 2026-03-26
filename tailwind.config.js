/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        mono: ["'JetBrains Mono'", "'Fira Code'", "monospace"],
      },
      colors: {
        brand: {
          DEFAULT: "#00e5a0",
          dim: "#00c48a",
          muted: "rgba(0,229,160,0.12)",
          border: "rgba(0,229,160,0.25)",
        },
        surface: {
          DEFAULT: "#0d0f14",
          card: "#12151c",
          input: "#181c25",
          border: "rgba(255,255,255,0.07)",
        },
      },
      animation: {
        "pulse-dot": "pulse 2s cubic-bezier(0.4,0,0.6,1) infinite",
        "fade-up": "fadeUp 0.3s ease forwards",
      },
      keyframes: {
        fadeUp: {
          "0%": { opacity: 0, transform: "translateY(8px)" },
          "100%": { opacity: 1, transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};
