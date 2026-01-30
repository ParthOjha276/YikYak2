/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        yak: {
          teal: '#00D1C0',
          black: '#1A1A1B',
          gray: '#F3F4F6',
        }
      },
    },
  },
  plugins: [],
};