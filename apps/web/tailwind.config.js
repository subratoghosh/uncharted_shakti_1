/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class'],
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        // Butter & Green System
        butter: {
          bg: 'var(--butter-bg)',
          card: 'var(--butter-card)',
          panel: 'var(--butter-panel)',
          cream: 'var(--butter-cream)',
          gold: 'var(--butter-gold)',
          warm: 'var(--butter-warm)',
        },
        green: {
          dark: 'var(--green-dark)',
          deep: 'var(--green-deep)',
          hero: 'var(--green-hero)',
          mid: 'var(--green-mid)',
          light: 'var(--green-light)',
          accent: 'var(--green-accent)',
          sage: 'var(--green-sage)',
        },
        'text-brand': {
          main: 'var(--text-main)',
          dim: 'var(--text-dim)',
          muted: 'var(--text-muted)',
          onDark: 'var(--text-hero-main)',
          onDarkSub: 'var(--text-hero-sub)',
        },
        // Existing tokens preserved for app dashboard compatibility
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
        sm: '10px',
        md: '14px',
        lg: '20px',
        xl: '24px',
        hero: '36px',
        pill: '30px',
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
        heading: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
        slab: ['Roboto Slab', 'Georgia', 'serif'],
        serif: ['Georgia', 'serif'],
        mono: ['JetBrains Mono', 'Space Mono', 'Menlo', 'monospace'],
      },
      boxShadow: {
        sm: '0 2px 8px rgba(12, 56, 46, 0.05)',
        md: '0 6px 20px rgba(12, 56, 46, 0.06)',
        lg: '0 12px 35px -8px rgba(12, 56, 46, 0.08)',
        'card-hover': '0 18px 40px -8px rgba(12, 56, 46, 0.16)',
        'hero-card': '0 25px 60px -10px rgba(0, 0, 0, 0.45)',
        dropdown: '0 16px 40px rgba(12, 56, 46, 0.15)',
      },
      animation: {
        shimmer: 'shimmer 2s infinite linear',
        'fade-in': 'fadeIn 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)',
        'pulse-subtle': 'pulseSubtle 3s infinite ease-in-out',
        'plane-hero-loop': 'planeHeroLoop 8s infinite ease-in-out',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(4px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseSubtle: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.85' },
        },
        planeHeroLoop: {
          '0%': { transform: 'translate(0, 0) rotate(0deg)' },
          '25%': { transform: 'translate(15px, -10px) rotate(4deg)' },
          '50%': { transform: 'translate(30px, -4px) rotate(-2deg)' },
          '75%': { transform: 'translate(15px, 8px) rotate(2deg)' },
          '100%': { transform: 'translate(0, 0) rotate(0deg)' },
        },
      },
    },
  },
  plugins: [],
};
