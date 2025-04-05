/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Dark mode color palette
        dark: {
          background: '#121212',
          surface: '#1E1E1E',
          primary: '#BB86FC',
          secondary: '#03DAC6',
          text: {
            primary: '#FFFFFF',
            secondary: '#B0B0B0',
          },
        },
        // Light mode color palette (default Tailwind colors)
        light: {
          background: '#FFFFFF',
          surface: '#F4F4F4',
          primary: '#1976D2',
          secondary: '#DC004E',
          text: {
            primary: '#000000',
            secondary: '#666666',
          },
        },
      },
      backgroundColor: {
        // Dark mode backgrounds
        'dark-bg-primary': '#121212',
        'dark-bg-secondary': '#1E1E1E',
        // Light mode backgrounds
        'light-bg-primary': '#FFFFFF',
        'light-bg-secondary': '#F4F4F4',
      },
      textColor: {
        // Dark mode text colors
        'dark-text-primary': '#FFFFFF',
        'dark-text-secondary': '#B0B0B0',
        // Light mode text colors
        'light-text-primary': '#000000',
        'light-text-secondary': '#666666',
      },
      borderColor: {
        // Dark mode border colors
        'dark-border': '#333333',
        // Light mode border colors
        'light-border': '#E0E0E0',
      },
    },
  },
  plugins: [],
}