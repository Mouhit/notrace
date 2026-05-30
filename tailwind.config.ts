import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#00e5a0',
        dark: '#0f172a',
        light: '#f8fafc',
      },
      fontFamily: {
        sans: ['system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
    },
  },
  darkMode: 'class',
  plugins: [],
}
export default config
