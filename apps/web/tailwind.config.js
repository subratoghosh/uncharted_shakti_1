/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class'],
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        bg: 'var(--bg)',
        surface: 'var(--surface)',
        'surface-2': 'var(--surface-2)',
        border: 'var(--border)',
        text: 'var(--text)',
        'text-muted': 'var(--text-muted)',
        muted: 'var(--text-muted)',
        accent: 'var(--accent)',
        'sev-breaking': 'var(--sev-breaking)',
        'sev-warning': 'var(--sev-warning)',
        'sev-info': 'var(--sev-info)',
        ok: 'var(--ok)',
      },
      borderRadius: {
        sm: '4px',
        md: '6px',
        lg: '10px',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Menlo', 'monospace'],
      },
    },
  },
  plugins: [],
};
