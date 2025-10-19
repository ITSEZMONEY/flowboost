import type { Config } from "tailwindcss";

export default {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        jb: {
          bg: "#0b0f14",
          card: "#0f151d",
          text: "#e6f2ff",
          accent: "#00ffcc",
          accent2: "#00aaff"
        }
      },
      boxShadow: {
        glow: "0 0 30px rgba(0,255,204,.25), 0 0 30px rgba(0,170,255,.25)"
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui"]
      }
    }
  },
  plugins: []
} satisfies Config;
