import type { Config } from "tailwindcss"

const config = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        ink: "#0C0C0E",
        parchment: "#F6F3ED",
        bone: "#EDE9E0",
        ash: "#C8C2B5",
        smoke: "#8C8577",
        gold: "#B89A6A",
        "gold-light": "#D4B98A",
        "gold-dim": "#7A6448",
        "red-muted": "#7A3535",
        "green-muted": "#2A5440",
      },
      fontFamily: {
        display: ["var(--font-display)", "serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config

export default config
