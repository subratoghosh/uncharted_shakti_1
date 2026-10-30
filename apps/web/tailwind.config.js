/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-geist-sans)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-geist-mono)', 'monospace'],
      },
      colors: {
        // Map CSS variables to Tailwind utilities
        bg: 'var(--bg)',
        surface: 'var(--surface)',
        'surface-2': 'var(--surface-2)',
        border: 'var(--border)',
        text: 'var(--text)',
        muted: 'var(--text-muted)',
        accent: 'var(--accent)',
        'sev-breaking': 'var(--sev-breaking)',
        'sev-warning': 'var(--sev-warning)',
        'sev-info': 'var(--sev-info)',
        ok: 'var(--ok)',
      },
      borderRadius: {
        DEFAULT: '6px',
        card: '10px',
        full: '999px',
      },
      spacing: {
        // Base 4px scale: 4,8,12,16,24,32,48
        1: '4px',
        2: '8px',
        3: '12px',
        4: '16px',
        6: '24px',
        8: '32px',
        12: '48px',
      },
      fontSize: {
        xs: ['12px', { lineHeight: '1.5' }],
        sm: ['13px', { lineHeight: '1.5' }],
        base: ['14px', { lineHeight: '1.5' }],
        lead: ['16px', { lineHeight: '1.5' }],
        h3: ['20px', { lineHeight: '1.25' }],
        h2: ['24px', { lineHeight: '1.25' }],
        h1: ['30px', { lineHeight: '1.25' }],
      },
      maxWidth: {
        content: '1280px',
      },
      boxShadow: {
        popover: '0 1px 2px rgba(0,0,0,.06)',
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
};

