import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      fontFamily: {
        sans: ['Inter Tight', 'sans-serif'],
        serif: ['Cormorant Garamond', 'serif'],
      },
      colors: {
        'canvas': '#F9F8F6', // Warm Bone
        'ink': '#0F1E33',    // Deep Ultramarine
        'ink-muted': '#5D6B7F',
        'line': 'rgba(15, 30, 51, 0.12)',
        'gold': '#C6A87C',
        'verified': '#0D9488',
      },
      fontSize: {
        'xxs': '0.625rem',
      },
      boxShadow: {
        'window': '0 10px 40px -10px rgba(15, 30, 51, 0.08)',
        'floating': '0 20px 50px -10px rgba(15, 30, 51, 0.25)',
        'pop': '0 16px 40px -5px rgba(15, 30, 51, 0.15)',
        'token': '0 4px 12px rgba(15, 30, 51, 0.1), inset 0 2px 4px rgba(255,255,255,0.5)',
        'card': '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
      },
      keyframes: {
        'slide-up-fade': {
            '0%': { opacity: '0', transform: 'translateY(10px)' },
            '100%': { opacity: '1', transform: 'translateY(0)' },
        }
      },
      animation: {
          'slide-up': 'slide-up-fade 0.6s ease-out forwards',
      }
    },
  },
  plugins: [],
};
export default config;