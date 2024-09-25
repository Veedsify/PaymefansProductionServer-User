import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
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
