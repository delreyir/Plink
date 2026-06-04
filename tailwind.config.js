/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      opacity: {
        8: "0.08",
      },
      colors: {
        ink: {
          950: "#05060a",
          900: "#0a0c12",
          850: "#0e1118",
          800: "#13161f",
          700: "#1c2030",
          600: "#2a2f42",
        },
        mint: {
          DEFAULT: "#5ef2b0",
          soft: "#a7f7d3",
          deep: "#16b97e",
        },
        haze: "#7c8aa5",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["'JetBrains Mono'", "ui-monospace", "monospace"],
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(94,242,176,0.18), 0 20px 60px -20px rgba(94,242,176,0.25)",
        card: "0 24px 80px -32px rgba(0,0,0,0.8)",
      },
      backgroundImage: {
        "grid-faint":
          "linear-gradient(to right, rgba(255,255,255,0.035) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.035) 1px, transparent 1px)",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        pulseDot: {
          "0%,100%": { opacity: "1" },
          "50%": { opacity: "0.35" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.6s cubic-bezier(0.22,1,0.36,1) both",
        shimmer: "shimmer 2.5s linear infinite",
        pulseDot: "pulseDot 1.8s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
