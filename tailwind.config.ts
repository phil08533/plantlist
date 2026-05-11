import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        riverside: {
          DEFAULT: "#1f7a3a",
          50: "#f1faf3",
          100: "#dcf2e2",
          200: "#bce5c8",
          300: "#8ed1a4",
          400: "#5ab77b",
          500: "#379a5b",
          600: "#1f7a3a",
          700: "#196031",
          800: "#164d29",
          900: "#123f23",
        },
      },
      fontFamily: {
        sans: ["system-ui", "-apple-system", "Segoe UI", "Roboto", "sans-serif"],
      },
      boxShadow: {
        card: "0 1px 2px rgba(0,0,0,0.04), 0 4px 14px rgba(0,0,0,0.05)",
      },
    },
  },
  plugins: [],
};

export default config;
