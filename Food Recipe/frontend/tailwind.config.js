/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      clipPath: {
        'custom': 'polygon(100% 0, 100% 100%, 0% 100%, 0% 50%, 10% 40%, 0% 30%)',
      },
    },
  },
  plugins: [],
}