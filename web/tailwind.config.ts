import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'thali-green': '#005f5f',
        'thali-brown': '#a0522d',
        'thali-gold': '#ffb700', 
        'thali-light': '#f4f4f4', 
      },
      fontFamily: {
        'serif': ['Playfair Display', 'serif'],
        'sans': ['Inter', 'sans-serif'], 
      },
    },
  },
  plugins: [],
};

export default config;