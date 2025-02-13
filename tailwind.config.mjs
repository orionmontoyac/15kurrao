/** @type {import('tailwindcss').Config} */

const colors = require("tailwindcss/colors");

module.exports = {
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
				primary: {
					DEFAULT: "#bfd630",
					50: "#f0faea",
					100: "#e2f5d5",
					200: "#c5ebb0",
					300: "#a8e18b",
					400: "#8bd766",
					500: "#bfd630",
					600: "#96c225",
					700: "#7ba31e",
					800: "#618317",
					900: "#476410",
				},
				secondary: {
					DEFAULT: "#66C4D0",
					50: "#f0fbfc",
					100: "#e0f7f9",
					200: "#b8ecf1",
					300: "#8fdee6",
					400: "#66C4D0",
					500: "#41a7b4",
					600: "#318694",
					700: "#266b77",
					800: "#1d515a",
					900: "#13373d"
				},
				base: {
					DEFAULT: "#2f5a1e",
					50: "#ecf8e5",
					100: "#d9f1cc",
					200: "#b4e399",
					300: "#8fd566",
					400: "#6ac833",
					500: "#2f5a1e", // main color
					600: "#264d19",
					700: "#1d3f14",
					800: "#142f0f",
					900: "#0b1f0a",
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
