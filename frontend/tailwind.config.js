 /** @type {import('tailwindcss').Config} */
export default {
   content: ["./index.html","./src/**/*.{html,js,jsx}"],   theme: {
     extend: {
      fontFamily: {
        sans: ['Roboto', 'sans-serif'],
        garamond: ['EB Garamond', 'serif'],
      }
     },
   },
   plugins: [],
 }