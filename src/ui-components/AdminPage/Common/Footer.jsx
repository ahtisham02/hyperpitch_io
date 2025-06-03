import React from "react";

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const accentColor = "emerald"; // << NEW ACCENT

  return (
    <footer className="shrink-0 z-50 bg-gray-50 py-4 px-4 sm:px-6 border-t border-gray-200/70">
      <div className="max-w-screen-xl mx-auto text-gray-500 text-xs flex flex-col sm:flex-row sm:justify-between items-center space-y-1 sm:space-y-0">
        <p>
          © {currentYear} Hyperpitch.io. All Rights Reserved.
        </p>
        <div className="flex space-x-4">
          <a
            className={`hover:text-${accentColor}-600 transition-colors hover:underline`}
            href="/privacy-policy"
          >
            Privacy
          </a>
          <a
            className={`hover:text-${accentColor}-600 transition-colors hover:underline`}
            href="/terms-and-conditions"
          >
            Terms
          </a>
          {/* <a className={`hover:text-${accentColor}-600 transition-colors hover:underline`} href="/contact">
            Contact
          </a> */}
        </div>
      </div>
    </footer>
  );
};

export default Footer;