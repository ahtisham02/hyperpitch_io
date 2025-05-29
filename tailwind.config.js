/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        "plus-jakarta": ['"Plus Jakarta Sans"', "sans-serif"],
        mono: ['"JetBrains Mono"', "monospace"],
        heading: ["Sora", "sans-serif"],
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
