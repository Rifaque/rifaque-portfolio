import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    extend: {
      screens: {
        // Tailwind's defaults stop at 1536. Large monitors and ultrawides are
        // a real design environment here, not an edge case.
        "3xl": "1920px",
        "4xl": "2560px",
        // Short viewports get tighter vertical rhythm: 1280x720, 1366x768,
        // and small phones in portrait.
        short: { raw: "(max-height: 800px)" },
        // Landscape phones are a different problem entirely - wide but only
        // ~400px tall - and need the type scale capped, not just less padding.
        squat: { raw: "(max-height: 520px)" },
        tall: { raw: "(min-height: 900px)" },
        // Devices that cannot hover. Used to drop hover-only affordances.
        touch: { raw: "(hover: none)" },
        stylus: { raw: "(hover: hover) and (pointer: fine)" },
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
        // Aurora colors
        aurora: {
          teal: "hsl(var(--aurora-teal))",
          purple: "hsl(var(--aurora-purple))",
          pink: "hsl(var(--aurora-pink))",
          green: "hsl(var(--aurora-green))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "-apple-system", "sans-serif"],
        mono: ["JetBrains Mono", "Fira Code", "monospace"],
      },
      keyframes: {
        "aurora-drift": {
          "0%, 100%": {
            transform: "translate(0%, 0%) scale(1)",
            opacity: "0.08",
          },
          "25%": {
            transform: "translate(5%, -5%) scale(1.05)",
            opacity: "0.1",
          },
          "50%": {
            transform: "translate(-5%, 5%) scale(0.95)",
            opacity: "0.06",
          },
          "75%": {
            transform: "translate(-3%, -3%) scale(1.02)",
            opacity: "0.09",
          },
        },
        "aurora-drift-2": {
          "0%, 100%": {
            transform: "translate(0%, 0%) scale(1)",
            opacity: "0.06",
          },
          "33%": {
            transform: "translate(-8%, 4%) scale(1.08)",
            opacity: "0.08",
          },
          "66%": {
            transform: "translate(4%, -6%) scale(0.92)",
            opacity: "0.05",
          },
        },
        "aurora-drift-3": {
          "0%, 100%": {
            transform: "translate(0%, 0%) scale(1)",
            opacity: "0.07",
          },
          "40%": {
            transform: "translate(6%, 6%) scale(0.98)",
            opacity: "0.09",
          },
          "80%": {
            transform: "translate(-4%, -2%) scale(1.04)",
            opacity: "0.06",
          },
        },
        "fade-in-up": {
          "0%": {
            opacity: "0",
            transform: "translateY(30px)",
          },
          "100%": {
            opacity: "1",
            transform: "translateY(0)",
          },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "scale-in": {
          "0%": {
            opacity: "0",
            transform: "scale(0.95)",
          },
          "100%": {
            opacity: "1",
            transform: "scale(1)",
          },
        },
        "glow-pulse": {
          "0%, 100%": {
            boxShadow: "0 0 20px hsl(var(--aurora-teal) / 0.2), 0 0 40px hsl(var(--aurora-purple) / 0.1)",
          },
          "50%": {
            boxShadow: "0 0 30px hsl(var(--aurora-teal) / 0.3), 0 0 60px hsl(var(--aurora-purple) / 0.15)",
          },
        },
      },
      animation: {
        "aurora-1": "aurora-drift 45s ease-in-out infinite",
        "aurora-2": "aurora-drift-2 55s ease-in-out infinite",
        "aurora-3": "aurora-drift-3 50s ease-in-out infinite",
        "fade-in-up": "fade-in-up 0.6s ease-out forwards",
        "fade-in": "fade-in 0.4s ease-out forwards",
        "scale-in": "scale-in 0.3s ease-out forwards",
        "glow-pulse": "glow-pulse 3s ease-in-out infinite",
      },
    },
  },
  plugins: [],
} satisfies Config;
