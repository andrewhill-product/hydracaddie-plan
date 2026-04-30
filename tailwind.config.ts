import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        "hc-green": "#00704A",
        "hc-green-dark": "#005a3b",
        "hc-bg": "#FAFAFA",
        "hc-offwhite": "#FCFCFC",
        "hc-black": "#020912",
      },
    },
  },
  plugins: [],
};

export default config;