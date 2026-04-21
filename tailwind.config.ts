import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-inter)', 'SF Pro Display', '-apple-system', 'Noto Sans SC', 'system-ui', 'sans-serif'],
      },
      colors: {
        // Brand teal — full scale
        teal: {
          DEFAULT: "#0d9488",
          50: "#f0fdfa",
          100: "#ccfbf1",
          200: "#99f6e4",
          300: "#5eead4",
          400: "#2dd4bf",
          500: "#14b8a6",
          600: "#0d9488",
          700: "#0f766e",
          800: "#115e59",
          900: "#134e4a",
          950: "#042f2e",
        },
        // Brand orange
        orange: {
          DEFAULT: "#f97316",
          50: "#fff7ed",
          100: "#ffedd5",
          200: "#fed7aa",
          300: "#fdba74",
          400: "#fb923c",
          500: "#f97316",
          600: "#ea580c",
          700: "#c2410c",
        },
        text: {
          primary: "#0f172a",
          secondary: "#475569",
          muted: "#94a3b8",
        },
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
      },
      fontSize: {
        'display': ['3.75rem', { lineHeight: '1.1', letterSpacing: '-0.025em', fontWeight: '700' }],
        'headline': ['2.5rem', { lineHeight: '1.15', letterSpacing: '-0.025em', fontWeight: '700' }],
        'title': ['1.5rem', { lineHeight: '1.3', letterSpacing: '-0.02em', fontWeight: '600' }],
        'body-lg': ['1.125rem', { lineHeight: '1.7', letterSpacing: '-0.011em' }],
        'body': ['1rem', { lineHeight: '1.6', letterSpacing: '-0.011em' }],
        'caption': ['0.875rem', { lineHeight: '1.5', letterSpacing: '0' }],
        'micro': ['0.75rem', { lineHeight: '1.4', letterSpacing: '0.01em' }],
      },
      animation: {
        'fade-up': 'fadeUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) both',
        'fade-in': 'fadeIn 0.5s ease-out both',
        'scale-in': 'scaleIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) both',
        'slide-up': 'slideUp 0.35s cubic-bezier(0.16, 1, 0.3, 1) both',
      },
      keyframes: {
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.96)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
};

export default config;
