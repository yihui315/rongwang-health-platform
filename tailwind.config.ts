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
        sans: [
          "var(--font-inter)",
          "SF Pro Display",
          "-apple-system",
          "Noto Sans SC",
          "system-ui",
          "sans-serif",
        ],
      },
      colors: {
        clinical: {
          50: "#eaf4f8",
          100: "#d5e8f0",
          200: "#abcfe0",
          300: "#7db2cc",
          400: "#4d90b2",
          500: "#2d7194",
          600: "#185a7c",
          700: "#0f4c6a",
          800: "#0b3a53",
          900: "#082f44",
          950: "#051e2d",
        },
        nutrition: {
          50: "#e8f6f3",
          100: "#ccece6",
          200: "#99d9ce",
          300: "#63c3b4",
          400: "#35a99b",
          500: "#138f84",
          600: "#0f766e",
          700: "#115e59",
          800: "#134e4a",
          900: "#073b38",
        },
        risk: {
          medium: "#b7791f",
          mediumSoft: "#fff7e6",
          mediumBorder: "#f3d08a",
          high: "#b42318",
          highSoft: "#fff1f0",
          highBorder: "#f4b3ac",
        },
        surface: {
          page: "#f6f9fc",
          soft: "#eef5f8",
          muted: "#f4f7fa",
          card: "#ffffff",
          border: "#d8e2ea",
        },
        teal: {
          DEFAULT: "#138f84",
          50: "#e8f6f3",
          100: "#ccece6",
          200: "#99d9ce",
          300: "#63c3b4",
          400: "#35a99b",
          500: "#138f84",
          600: "#0f766e",
          700: "#115e59",
          800: "#134e4a",
          900: "#073b38",
          950: "#042f2e",
        },
        orange: {
          DEFAULT: "#b7791f",
          50: "#fff7e6",
          100: "#ffedc2",
          200: "#f3d08a",
          300: "#e4b45e",
          400: "#cc9233",
          500: "#b7791f",
          600: "#965f18",
          700: "#774813",
        },
        text: {
          primary: "#102033",
          secondary: "#465a69",
          muted: "#718391",
        },
      },
      borderRadius: {
        "2xl": "0.75rem",
        "3xl": "1rem",
        "4xl": "1.25rem",
      },
      spacing: {
        "18": "4.5rem",
        "22": "5.5rem",
      },
      fontSize: {
        display: [
          "3.25rem",
          { lineHeight: "1.08", letterSpacing: "0", fontWeight: "700" },
        ],
        headline: [
          "2.25rem",
          { lineHeight: "1.16", letterSpacing: "0", fontWeight: "700" },
        ],
        title: [
          "1.375rem",
          { lineHeight: "1.3", letterSpacing: "0", fontWeight: "600" },
        ],
        "body-lg": ["1.125rem", { lineHeight: "1.7", letterSpacing: "0" }],
        body: ["1rem", { lineHeight: "1.65", letterSpacing: "0" }],
        caption: ["0.875rem", { lineHeight: "1.5", letterSpacing: "0" }],
        micro: ["0.75rem", { lineHeight: "1.4", letterSpacing: "0" }],
      },
      animation: {
        "fade-up": "fadeUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) both",
        "fade-in": "fadeIn 0.5s ease-out both",
        "scale-in": "scaleIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) both",
        "slide-up": "slideUp 0.35s cubic-bezier(0.16, 1, 0.3, 1) both",
      },
      keyframes: {
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        scaleIn: {
          "0%": { opacity: "0", transform: "scale(0.98)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      backdropBlur: {
        xs: "2px",
      },
    },
  },
  plugins: [],
};

export default config;
