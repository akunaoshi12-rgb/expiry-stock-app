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
        background: "#f7f9fc",
        surface: "#ffffff",
        "surface-soft": "#f1f5f9",
        "surface-muted": "#e2e8f0",
        border: "#d8e0eb",
        primary: "#0f2f57",
        "primary-hover": "#0a2342",
        text: "#111827",
        muted: "#607089",
        success: "#15803d",
        "success-soft": "#ecfdf3",
        warning: "#a16207",
        "warning-soft": "#fffbeb",
        danger: "#b42318",
        "danger-soft": "#fff1f0",
        info: "#0369a1"
      },
      boxShadow: {
        soft: "0 10px 28px rgba(15, 47, 87, 0.07)"
      }
    }
  },
  plugins: []
};

export default config;
