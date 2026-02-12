import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
        'orbitron': ['Orbitron', 'sans-serif'],
        'rajdhani': ['Rajdhani', 'sans-serif'],
        'audiowide': ['Audiowide', 'sans-serif'],
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
          DEFAULT: "hsl(var(--destructive) / <alpha-value>)",
          foreground: "hsl(var(--destructive-foreground) / <alpha-value>)",
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
        neon: {
          cyan: "hsl(180 100% 50%)",
          lime: "hsl(80 100% 60%)",
          red: "hsl(0 100% 60%)",
          purple: "hsl(280 100% 60%)",
        },
        'true-charcoal': '#0B0D10',
        'electric-cyan': '#40E0FF',
        'neon-lime': '#B6FF3B',
        'amber-glow': '#ff6a00',
        'ruby-red': '#FF1744',
        'moonlit-grey': '#2A2D35',
        'holo-lilac': '#C77DFF',
        'surface-white': '#E9EEF5',
        'ion-gold': '#FFD700',
      },
      borderRadius: {
        xl: "calc(var(--radius) + 4px)",
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        xs: "calc(var(--radius) - 6px)",
      },
      boxShadow: {
        xs: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
        glow: "0 0 20px -5px rgba(0, 255, 255, 0.5)",
        "glow-lg": "0 0 40px -10px rgba(0, 255, 255, 0.5)",
        "glow-lime": "0 0 20px -5px rgba(163, 230, 53, 0.5)",
        "glow-red": "0 0 20px -5px rgba(239, 68, 68, 0.5)",
        "glow-cyan": "0 0 20px -5px rgba(64, 224, 255, 0.5)",
      },
      animation: {
        'phosphor-flicker': 'phosphor 150ms ease-out',
        'glitch': 'glitch 300ms ease-in-out',
        'scanline': 'scanline 8s linear infinite',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "caret-blink": "caret-blink 1.25s ease-out infinite",
        "float": "float 6s ease-in-out infinite",
        "slide-up": "slide-up 0.5s ease-out forwards",
        "fade-in": "fade-in 0.5s ease-out forwards",
        "scale-in": "scale-in 0.3s ease-out forwards",
        "shimmer": "shimmer 2s linear infinite",
      },
      keyframes: {
        phosphor: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7', filter: 'blur(1px)' },
        },
        glitch: {
          '0%, 100%': { transform: 'translate(0)' },
          '20%': { transform: 'translate(-2px, 2px)' },
          '40%': { transform: 'translate(-2px, -2px)' },
          '60%': { transform: 'translate(2px, 2px)' },
          '80%': { transform: 'translate(2px, -2px)' },
        },
        scanline: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100%)' },
        },
        'pulse-glow': {
          '0%, 100%': { 
            boxShadow: '0 0 20px -5px rgba(64, 224, 255, 0.4)',
          },
          '50%': { 
            boxShadow: '0 0 30px -5px rgba(64, 224, 255, 0.7)',
          },
        },
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "caret-blink": {
          "0%,70%,100%": { opacity: "1" },
          "20%,50%": { opacity: "0" },
        },
        "float": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
        "slide-up": {
          from: { 
            opacity: "0", 
            transform: "translateY(20px)" 
          },
          to: { 
            opacity: "1", 
            transform: "translateY(0)" 
          },
        },
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        "scale-in": {
          from: { 
            opacity: "0", 
            transform: "scale(0.95)" 
          },
          to: { 
            opacity: "1", 
            transform: "scale(1)" 
          },
        },
        "shimmer": {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      backgroundImage: {
        'crt-scanlines': 'repeating-linear-gradient(0deg, rgba(0, 0, 0, 0.15), rgba(0, 0, 0, 0.15) 1px, transparent 1px, transparent 2px)',
      },
    },
  },
  plugins: [],
};

export default config;
