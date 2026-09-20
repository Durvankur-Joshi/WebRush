/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: 'var(--color-background)',
        surface: {
          DEFAULT: 'var(--color-surface)',
          elevated: 'var(--color-surface-elevated)',
          muted: 'var(--color-surface-muted)',
        },
        border: {
          DEFAULT: 'var(--color-border)',
          subtle: 'var(--color-border-subtle)',
          highlight: 'var(--color-border-highlight)',
        },
        accent: {
          primary: 'var(--color-accent-primary)',
          'primary-dim': 'var(--color-accent-primary-dim)',
          secondary: 'var(--color-accent-secondary)',
          emerald: 'var(--color-accent-emerald)',
          purple: 'var(--color-accent-purple)',
        },
        content: {
          main: 'var(--color-text-main)',
          muted: 'var(--color-text-muted)',
          dim: 'var(--color-text-dim)',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'Menlo', 'Monaco', 'Consolas', 'Courier New', 'monospace'],
      },
      letterSpacing: {
        widest: '.15em',
        observatory: '.08em',
      },
      boxShadow: {
        'observatory-sm': '0 1px 2px 0 rgba(0, 0, 0, 0.4)',
        'observatory-md': '0 4px 16px -2px rgba(0, 0, 0, 0.6), 0 0 0 1px var(--color-border-subtle)',
        'observatory-lg': '0 10px 30px -4px rgba(0, 0, 0, 0.7), 0 0 0 1px var(--color-border)',
        'glow-primary': '0 0 20px -3px rgba(56, 189, 248, 0.25)',
        'glow-secondary': '0 0 20px -3px rgba(245, 158, 11, 0.25)',
      },
    },
  },
  plugins: [],
}
