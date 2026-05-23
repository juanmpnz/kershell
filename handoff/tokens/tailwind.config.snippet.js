// Merge this into your tailwind.config.{js,ts}.
// Replace your existing theme.extend with this (or merge field by field).

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        ink:        '#0A0B0D',
        surface:    '#111316',
        'surface-2':'#1A1D21',
        border:     '#262B33',
        text:       '#ECEEF0',
        'text-dim': '#B6BBC2',
        muted:      '#7B8088',
        accent:     '#B4F23F',
        'accent-ink':  '#0A0B0D',
        'accent-soft': 'rgba(180,242,63,0.14)',
      },
      fontFamily: {
        // Driven by next/font/google variables set in app/layout.tsx
        sans: ['var(--font-geist)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)',  'ui-monospace', 'monospace'],
      },
      fontSize: {
        // Display / hero
        display:   ['5.75rem', { lineHeight: '1.0',  letterSpacing: '-0.035em' }], // 92px
        'h2':      ['3.5rem',  { lineHeight: '1.05', letterSpacing: '-0.03em'  }], // 56px
        'h3':      ['2rem',    { lineHeight: '1.1',  letterSpacing: '-0.02em'  }], // 32px
        'h4':      ['1.5rem',  { lineHeight: '1.15', letterSpacing: '-0.015em' }], // 24px
        'lead':    ['1.125rem',{ lineHeight: '1.55', letterSpacing: '-0.005em' }], // 18px
        'eyebrow': ['0.6875rem',{ lineHeight: '1',   letterSpacing: '0.16em'   }], // 11px
        'data':    ['3.25rem', { lineHeight: '1',    letterSpacing: '-0.03em'  }], // 52px
      },
      letterSpacing: {
        tightest: '-0.035em',
        tighter:  '-0.03em',
        tight:    '-0.02em',
      },
      borderRadius: {
        sm: '4px',
        md: '6px',
        lg: '12px',
      },
      boxShadow: {
        'focus':  '0 0 0 4px rgba(180,242,63,0.18)',
        'card':   '0 1px 3px rgba(0,0,0,.4), 0 8px 24px rgba(0,0,0,.25)',
      },
      keyframes: {
        blink: {
          '0%, 49%':   { opacity: '1' },
          '50%, 100%': { opacity: '0' },
        },
        marquee: {
          from: { transform: 'translateX(0)' },
          to:   { transform: 'translateX(-50%)' },
        },
        'fade-up': {
          from: { opacity: '0', transform: 'translateY(20px)' },
          to:   { opacity: '1', transform: 'translateY(0)'    },
        },
      },
      animation: {
        blink:    'blink 1.1s steps(1) infinite',
        marquee:  'marquee 40s linear infinite',
        'fade-up':'fade-up 400ms cubic-bezier(0.16, 1, 0.3, 1) both',
      },
      transitionTimingFunction: {
        'ease-out-quint': 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
    },
  },
};
