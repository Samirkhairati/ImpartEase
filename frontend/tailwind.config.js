/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
			colors: {
				background: '#1B1B27',
				foreground: '#2A2A3D',
				primary: '#C194F7',
				secondary: '#ABB1CA',
				accent: '#2F94AB'
			}
		}
  },
  plugins: [require('@tailwindcss/typography'),require("daisyui")],
}