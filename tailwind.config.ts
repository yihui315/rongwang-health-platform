import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/lib/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        teal: {
          DEFAULT: "#00D4C8",
          dark: "#00b3a8",
          light: "#33ded4",
          bg: "#E0F8F5"
        },
        orange: {
          DEFAULT: "#FF6B00",
          light: "#FF8533"
        },
        text: {
          primary: "#1F2937",
          secondary: "#4B5563",
          muted: "#64748B"
        }
      },
      borderRadius: {
        xl: "24px",
        "2xl": "32px"
      }
    }
  },
  plugins: []
};

export default config;
