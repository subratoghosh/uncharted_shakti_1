/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
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
        sm: '6px',
        md: '8px',
        lg: '10px',
      },
    },
  },
  plugins: [],
};
