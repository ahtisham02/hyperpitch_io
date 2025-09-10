/**
 * Utility functions for generating HTML with proper CSS configuration
 */

export const generateHtmlHead = (title = 'Campaign Page') => {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${title}</title>
<script src="https://cdn.tailwindcss.com"></script>
<script>
  tailwind.config = {
    theme: {
      extend: {
        fontFamily: {
          "plus-jakarta": ['"Plus Jakarta Sans"', "sans-serif"],
          mono: ['"JetBrains Mono"', "monospace"],
          heading: ["Sora", "sans-serif"],
        },
        colors: {
          "brand-green": {
            DEFAULT: "#10b981",
            light: "#34d399",
            dark: "#059669",
          },
          "brand-lime": {
            DEFAULT: "#14b8a6",
            light: "#2dd4bf",
            dark: "#0d9488",
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
          "gradient-secondary": "linear-gradient(90deg, #5eead4 0%, #6ee7b7 100%)",
          "gradient-pro": "linear-gradient(90deg, #14b8a6 0%, #2dd4bf 100%)",
          "section-glow": "radial-gradient(circle at 50% 0, rgba(16, 185, 129, 0.07), rgba(255, 255, 255, 0) 40%)",
          "pricing-glow": "radial-gradient(ellipse 80% 50% at 50% 50%, rgba(16, 185, 129, 0.1), rgba(255, 255, 255, 0) 100%)",
        },
      },
    },
  }
</script>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap');
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700&display=swap');
  
  html {
    scroll-behavior: smooth;
  }
  
  body {
    font-family: "Plus Jakarta Sans", sans-serif;
    color: #212529;
    background-color: white;
  }
  
  .dotted-line {
    background-image: linear-gradient(to right, #dee2e6 50%, transparent 50%);
    background-size: 16px 2px;
    background-repeat: repeat-x;
  }
  
  .logo-swiper .swiper-wrapper {
    transition-timing-function: linear !important;
  }
  
  .custom-checkbox {
    appearance: none;
    width: 1.25rem;
    height: 1.25rem;
    border: 2px solid #cbd5e1;
    border-radius: 0.375rem;
    background-color: white;
    cursor: pointer;
    transition: all 0.2s;
    position: relative;
    background-image: none;
    background-size: 0;
    background-repeat: no-repeat;
    background-position: center;
  }
  
  .custom-checkbox:checked {
    background-color: #059669;
    border-color: #059669;
    background-image: url("data:image/svg+xml,%3csvg viewBox='0 0 20 20' fill='white' xmlns='http://www.w3.org/2000/svg'%3e%3cpath fill-rule='evenodd' d='M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z' clip-rule='evenodd'/%3e%3c/svg%3e");
    background-size: 14px;
  }
  
  .custom-checkbox:focus {
    outline: none;
    box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.5);
  }
  
  .custom-checkbox:indeterminate {
    background-color: #059669;
    border-color: #059669;
    background-image: url("data:image/svg+xml,%3csvg viewBox='0 0 20 20' fill='white' xmlns='http://www.w3.org/2000/svg'%3e%3cpath d='M4 10h12' stroke='white' stroke-width='2' stroke-linecap='round'/%3e%3c/svg%3e");
    background-size: 14px;
  }
  
  .custom-checkbox:hover:not(:checked) {
    border-color: #34d399;
    background-color: #ecfdf5;
  }
  
  .action-button {
    background-color: #059669;
    color: white;
    transition: background-color 0.2s;
  }
  
  .action-button:hover {
    background-color: #047857;
  }
</style>
</head>
<body>`;
};

export const generateHtmlFooter = () => {
  return '</body>\n</html>';
};

