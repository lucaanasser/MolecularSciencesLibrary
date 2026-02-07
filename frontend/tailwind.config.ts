import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
    "./src/index.css",
  ],
  safelist: [
    'border-cm-red', 'bg-cm-red',
    'border-cm-orange', 'bg-cm-orange',
    'border-cm-yellow', 'bg-cm-yellow',
    'border-cm-green', 'bg-cm-green',
    'border-cm-blue', 'bg-cm-blue',
    'border-library-purple', 'bg-library-purple',
    'border-academic-blue', 'bg-academic-blue',
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
        /* Cores do CM */
        "cm-red": "#eb0000",
        "cm-orange": "#ff6300",
        "cm-yellow": "#ffcf00",
        "cm-green": "#00c80e",
        "cm-blue": "#008cff",

        /* Cores tema do site */
        "default-bg": "#fcfcf8",
        "default-text": "#616161",
        "library-purple": "#b657b3",
        "library-purple-muted": "#c579c2",
        "academic-blue": "#01aad0",
        "academic-blue-muted": "#34bbd9",

        /* Cores base usando CSS variables para componentes reutilizáveis */
        input: {
          foreground: "var(--input-foreground)",
          background: "var(--input-background)",
        },
        background: "var(--background)",
        foreground: "var(--foreground)",
        primary: {
          DEFAULT: "var(--primary)",
        },
        secondary: {
          DEFAULT: "var(--secondary)",
        },
        destructive: {
          DEFAULT: "var(--destructive)",
          foreground: "var(--destructive-foreground)",
        },
        accent: {
          DEFAULT: "var(--accent)",
          foreground: "var(--accent-foreground)",
        },
        popover: {
          DEFAULT: "var(--popover)",
          foreground: "var(--popover-foreground)",
        },
      },
      fontFamily: {
        'dmsans': ['"DM Sans"', 'sans-serif'],
        'bebas': ['"Bebas Neue"', 'sans-serif'],
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        fadeIn: {
          '0%': { opacity: 0 },
          '100%': { opacity: 1 },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        'fade-in': 'fadeIn 1.5s ease-in-out',
        'float': 'float 3s ease-in-out infinite',
        'pulse': 'pulse 2s infinite',
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
