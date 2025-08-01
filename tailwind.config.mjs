/** @type {import('tailwindcss').Config} */

const colors = require("tailwindcss/colors");

module.exports = {
	// this enables you to cancel out dark mode using the class "light" for specific sections if desired
	darkMode: ["variant", "&:is(.dark *):not(.light *)"],

	content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"],
	theme: {
		screens: {
			xs: "400px",
			sm: "640px",
			md: "768px",
			lg: "1024px",
			xl: "1280px",
			"2xl": "1536px",
		},
		extend: {
			colors: {
				// use any standard tailwind colors from here https://tailwindcss.com/docs/customizing-colors
				// or generate with https://uicolors.app/create
				primary: {
					DEFAULT: "#0b75b9",
					50: "#eff6ff",
					100: "#dbeafe",
					200: "#bfdbfe",
					300: "#93c5fd",
					400: "#60a5fa",
					500: "#0b75b9", // main color
					600: "#0a68a6",
					700: "#085a8c",
					800: "#064c73",
					900: "#043e5a",
				},
				secondary: {
					DEFAULT: "#c9d436",
					50: "#f7f9e8",
					100: "#eff3d1",
					200: "#dfe7a3",
					300: "#cfdb75",
					400: "#bfcf47",
					500: "#c9d436", // main color
					600: "#b3c02a",
					700: "#9dac1e",
					800: "#879812",
					900: "#718406",
				},
				base: {
					DEFAULT: "#c9d436",
					50: "#f7f9e8",
					100: "#eff3d1",
					200: "#dfe7a3",
					300: "#cfdb75",
					400: "#bfcf47",
					500: "#c9d436", // main color
					600: "#b3c02a",
					700: "#9dac1e",
					800: "#879812",
					900: "#718406",
				},
				info: "#7dd3fc",
				"info-content": "#082f49",
				success: "#6ee7b7",
				"success-content": "#022c22",
				warning: "#fcd34d",
				"warning-content": "#111827",
				error: "#fca5a5",
				"error-content": "#450a0a",
			},
			animation: {
				marquee: "marquee 50s linear infinite",
				marquee2: "marquee2 50s linear infinite",
				"marquee2-mobile": "marquee2 30s linear infinite",
			},
			keyframes: {
				marquee: {
					from: {
						transform: "translateX(calc(-100% - 1.5rem))",
					},
					to: {
						transform: "translateX(0)",
					},
				},
				marquee2: {
					from: {
						transform: "translateX(calc(-100% - 8rem))",
					},
					to: {
						transform: "translateX(0)",
					},
				},
			},
		},
		fontFamily: {
			sans: [
				"Inter",
				"Satoshi",
				"-apple-system",
				"BlinkMacSystemFont",
				"Segoe UI",
				"Roboto",
				"Helvetica",
				"Arial",
				"sans-serif",
				"Apple Color Emoji",
				"Segoe UI Emoji",
				"Segoe UI Symbol",
			],
			mono: [
				"SFMono-Regular",
				"Menlo",
				"Monaco",
				"Consolas",
				"Liberation Mono",
				"Courier New",
				"monospace",
			],
		},
	},
	plugins: [require("@tailwindcss/typography"), require("@tailwindcss/forms")],
};
