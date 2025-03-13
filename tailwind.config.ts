import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: 'class', // Enables manual control using CSS classes
  theme: {
    extend: {
      fontFamily: {
        crete: ["var(--font-crete-round)", "serif"],
        unbounded: ["var(--font-unbounded)", "sans-serif"],
        kablammo: ["var(--font-kablammo)", "sans-serif"],
        dynapuff: ["var(--font-dynapuff)", "sans-serif"],
        instrument: ["var(--font-instrument-sans)", "sans-serif"],
        ebgaramond: ["var(--font-eb-garamond)", "serif"],
        shadowsintolight: ["var(--font-shadows-into-light)", "sans-serif"],
        delagothicone: ["var(--font-delagothicone)", "sans-serif"],
      },
      colors: {
        white: "#ffffff",
        black: "#000000",
        "primary-dark-pink": "#CC0DF8",
        "primary-text-dark-pink": "#78158E",
        "button-black": "#000000",
        "messages-unread": "#FCF1FF",
        "message-bubble": "#CC0DF8",
        "model-online-notify": "#04D900",
        coin: "#F4900C",
        "coins-card-bottom": "#FAE2FF",
        "coins-card-top": "#e057ff",
      },
    },
  },
  plugins: [],
};
export default config;
