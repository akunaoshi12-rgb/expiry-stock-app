import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        background: "#fff8f5",
        surface: "#ffffff",
        "surface-soft": "#fbf2ed",
        "surface-muted": "#efe6e2",
        border: "#dcc0ba",
        primary: "#9a4028",
        "primary-hover": "#7e2b16",
        text: "#201a18",
        muted: "#66534d",
        success: "#166534",
        warning: "#b45309",
        danger: "#b91c1c",
        info: "#0f766e"
      },
      boxShadow: {
        soft: "0 10px 30px rgba(32, 26, 24, 0.08)"
      }
    }
  },
  plugins: []
};

export default config;
