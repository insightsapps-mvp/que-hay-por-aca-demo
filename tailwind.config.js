import animate from 'tailwindcss-animate'
/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    container: { center: true, padding: '1rem' },
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      colors: {
        bg: 'var(--bg)',
        surface: 'var(--surface)',
        'surface-2': 'var(--surface-2)',
        border: 'var(--border)',
        input: 'var(--border)',
        ring: 'var(--accent-ring)',
        text: 'var(--text)',
        muted: 'var(--muted)',
        accent: { DEFAULT: 'var(--accent)', fg: 'var(--accent-fg)', soft: 'var(--accent-soft)', ring: 'var(--accent-ring)' },
        success: 'var(--success)',
        danger: 'var(--danger)',
        warning: 'var(--warning)',
        info: 'var(--info)',
        background: 'var(--bg)',
        foreground: 'var(--text)',
        popover: { DEFAULT: 'var(--surface)', foreground: 'var(--text)' },
        primary: { DEFAULT: 'var(--accent)', foreground: 'var(--accent-fg)' },
      },
      borderRadius: { lg: '12px', md: '10px', sm: '8px' },
      boxShadow: { card: '0 1px 2px rgba(0,0,0,.05)' },
      keyframes: {
        'accordion-down': { from: { height: '0' }, to: { height: 'var(--radix-accordion-content-height)' } },
        pulsering: { '0%': { transform: 'scale(1)', opacity: '.6' }, '100%': { transform: 'scale(1.8)', opacity: '0' } },
        backpulse: { '0%': { transform: 'scale(1)', opacity: '.55' }, '100%': { transform: 'scale(1.28)', opacity: '0' } },
        laser: { '0%,100%': { top: '8%' }, '50%': { top: '88%' } },
      },
      animation: {
        pulsering: 'pulsering 1.6s ease-out infinite',
        backpulse: 'backpulse 1.9s ease-out infinite',
        laser: 'laser 2.4s ease-in-out infinite',
      },
    },
  },
  plugins: [animate],
}
