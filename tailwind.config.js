/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      opacity: {
        8: "0.08",
      },
      colors: {
        // RGB-triplet CSS vars so opacity modifiers (e.g. white/8) still work
        // and the whole palette flips between dark/light themes.
        white: "rgb(var(--c-white) / <alpha-value>)",
        ink: {
          950: "rgb(var(--ink-950) / <alpha-value>)",
          900: "rgb(var(--ink-900) / <alpha-value>)",
          850: "rgb(var(--ink-850) / <alpha-value>)",
          800: "rgb(var(--ink-800) / <alpha-value>)",
          700: "rgb(var(--ink-700) / <alpha-value>)",
          600: "rgb(var(--ink-600) / <alpha-value>)",
        },
        mint: {
          DEFAULT: "rgb(var(--mint) / <alpha-value>)",
          soft: "rgb(var(--mint-soft) / <alpha-value>)",
          deep: "#16b97e",
        },
        haze: "rgb(var(--c-haze) / <alpha-value>)",
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
          "linear-gradient(to right, rgb(var(--c-white) / 0.035) 1px, transparent 1px), linear-gradient(to bottom, rgb(var(--c-white) / 0.035) 1px, transparent 1px)",
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
        float: {
          "0%,100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
        gradientShift: {
          "0%,100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
        glowPulse: {
          "0%,100%": { opacity: "0.4", transform: "scale(1)" },
          "50%": { opacity: "0.7", transform: "scale(1.05)" },
        },
        marquee: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
        blink: {
          "0%,49%": { opacity: "1" },
          "50%,100%": { opacity: "0" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.6s cubic-bezier(0.22,1,0.36,1) both",
        shimmer: "shimmer 2.5s linear infinite",
        pulseDot: "pulseDot 1.8s ease-in-out infinite",
        float: "float 6s ease-in-out infinite",
        gradientShift: "gradientShift 8s ease infinite",
        glowPulse: "glowPulse 5s ease-in-out infinite",
        marquee: "marquee 30s linear infinite",
        blink: "blink 1.1s step-end infinite",
      },
    },
  },
  plugins: [],
};
