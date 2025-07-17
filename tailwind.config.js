/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        "plus-jakarta": ['"Plus Jakarta Sans"', "sans-serif"],
        mono: ['"JetBrains Mono"', "monospace"],
        heading: ["Sora", "sans-serif"],
      },
      colors: {
        "brand-green": {
          DEFAULT: "#10b981", // emerald-500
          light: "#34d399", // emerald-400
          dark: "#059669", // emerald-600
        },
        "brand-lime": {
          DEFAULT: "#14b8a6", // teal-500
          light: "#2dd4bf", // teal-400
          dark: "#0d9488", // teal-600
        },
        "dark-text": "#212529",
        "medium-text": "#495057",
        "light-bg": "#f8f9fa",
        "dark-bg": "#343a40",
        "border-color": "#dee2e6",
        "footer-bg": "#f0fdf4",
      },
      backgroundImage: {
        "gradient-primary": "linear-gradient(90deg, #10b981 0%, #34d399 100%)",
        "gradient-secondary":
          "linear-gradient(90deg, #5eead4 0%, #6ee7b7 100%)",
        "gradient-pro": "linear-gradient(90deg, #14b8a6 0%, #2dd4bf 100%)",
        "section-glow":
          "radial-gradient(circle at 50% 0, rgba(16, 185, 129, 0.07), rgba(255, 255, 255, 0) 40%)",
        "pricing-glow":
          "radial-gradient(ellipse 80% 50% at 50% 50%, rgba(16, 185, 129, 0.1), rgba(255, 255, 255, 0) 100%)",
      },
    },
  },
  plugins: [],
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.devtool = false;
    }
    return config;
  },
  safelist: ["font-plus-jakarta"],
};
