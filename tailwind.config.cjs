/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class', '[data-theme="dark"]'],
  content: [
    './src/**/*.{njk,md,html}',
    './public/**/*.html',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: 'rgb(var(--color-brand) / <alpha-value>)',
          600: 'rgb(var(--color-brand-600) / <alpha-value>)',
          400: 'rgb(var(--color-brand-400) / <alpha-value>)',
        },
        surface: {
          DEFAULT: 'rgb(var(--color-surface) / <alpha-value>)',
          alt: 'rgb(var(--color-surface-alt) / <alpha-value>)',
          elev: 'rgb(var(--color-surface-elev) / <alpha-value>)',
        },
        text: {
          DEFAULT: 'rgb(var(--color-text) / <alpha-value>)',
          muted: 'rgb(var(--color-text-muted) / <alpha-value>)',
        },
        border: 'rgb(var(--color-border) / <alpha-value>)',
        code: {
          bg: 'rgb(var(--color-code-bg) / <alpha-value>)',
          text: 'rgb(var(--color-code-text) / <alpha-value>)',
        },
      },
      borderRadius: {
        xl: '12px',
      },
      boxShadow: {
        brand: '0 1px 0 rgba(0,0,0,0.03), 0 6px 16px rgba(11,74,216,0.18)',
      },
      maxWidth: {
        content: '1100px',
      },
    },
  },
  plugins: [],
};

