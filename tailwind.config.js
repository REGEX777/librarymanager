/** @type {import('tailwindcss').Config} */
export default {
  content: ["./views/**/*.{html,ejs,js}"],
  theme: {
    extend: {
      fontFamily: {
        "poppins": 'Poppins, sans-serif',
        "inter": 'Inter, sans-serif'
      }
    },
  },
  plugins: [],
}

