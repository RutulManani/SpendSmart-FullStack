/** @type {import('tailwindcss').Config} */

module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'spendsmart-dark': '#1E1E1E',
        'spendsmart-card': '#2D2D2D',
        'spendsmart-input': '#3D3D3D',
        'spendsmart-green': '#B7FF00',
        'spendsmart-accent': '#4CAF50',
      }
    },
  },
  plugins: [],
}