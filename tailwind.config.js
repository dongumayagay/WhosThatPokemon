/** @type {import('tailwindcss').Config} */
export default {
	content: ['./src/**/*.{html,js,svelte,ts,svelte.js}'],
	theme: {
		extend: {
			fontFamily: {
				pixel: ['pixel', 'sans-serif'],
				pokemon: ['pokemon', 'serif']
			}
		},
		container: {
			center: true,
			screens: {
				sm: '640px',
				md: '768px',
				lg: '1024px'
			}
		}
	},
	plugins: []
};
