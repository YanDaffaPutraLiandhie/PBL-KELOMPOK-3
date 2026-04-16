/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/styles/**/*.{css}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        primary: "#00e5a0",
        secondary: "#00c8ff",
        accent: "#7c3aed",
        dark: {
          900: "#0a0f1a",
          800: "#0d1424",
          700: "#111827",
          600: "#1a2235",
          500: "#1e293b",
        },
      },
      fontFamily: {
        mono: ["'Courier New'", "monospace"],
        display: ["'Exo 2'", "sans-serif"],
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "blink": "blink 1.5s step-end infinite",
      },
      keyframes: {
        blink: {
          "0%, 100%": { opacity: 1 },
          "50%": { opacity: 0 },
        },
      },
    },
  },
  plugins: [],
};
