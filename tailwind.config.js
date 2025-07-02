
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'solana-green': '#14F195',
        'solana-purple': '#B069FF',
        'degen-red': '#FF4D4D',
        'dark-bg': '#121212',
        'card-bg': '#1A1A1A',
        'light-gray': '#A0AEC0',
        'border-color': '#4A5568',
        
        'rarity-common': '#90A4AE',
        'rarity-uncommon': '#4CAF50',
        'rarity-rare': '#2196F3',
        'rarity-epic': '#9C27B0',
        'rarity-legendary': '#FFC107',
      }
    },
  },
  plugins: [],
}
