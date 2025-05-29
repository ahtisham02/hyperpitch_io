import React, { useState, useEffect, useRef } from "react";
import { Menu, X, ChevronDown, LayoutDashboard, Zap } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

export default function UniqueNavbar() {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isFeaturesDropdownOpen, setIsFeaturesDropdownOpen] = useState(false);
  const featuresDropdownRef = useRef(null);

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
  const toggleFeaturesDropdown = () => setIsFeaturesDropdownOpen(!isFeaturesDropdownOpen);

  const navLinks = [
    {
      name: "Features",
      isDropdown: true,
      subLinks: [
        { name: "Live Builder Demo", href: "/page-builder-demo" },
        { name: "Drag & Drop Magic", href: "/features/drag-drop" },
        { name: "Deep Customization", href: "/features/customization" },
        { name: "Instant Preview", href: "/features/preview" },
      ],
    },
    { name: "Showcase", href: "/showcase" },
    { name: "Pricing", href: "/pricing" },
    { name: "Support", href: "/support" },
  ];

  const isActive = (href) => location.pathname === href;

  const isSubLinkActive = (subLinks) => {
    if (!subLinks) return false;
    return subLinks.some((subLink) => location.pathname === subLink.href);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (featuresDropdownRef.current && !featuresDropdownRef.current.contains(event.target)) {
        setIsFeaturesDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <nav className="bg-white text-gray-700 border-b border-gray-200/80 sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <div className="flex-shrink-0">
            <Link to="/" className="flex items-center gap-2 text-2xl font-bold text-indigo-600 hover:text-indigo-500 transition-colors">
              <Zap size={28} className="text-amber-500" />
              PageCraft
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-2">
            {navLinks.map((link) =>
              link.isDropdown ? (
                <div key={link.name} className="relative" ref={featuresDropdownRef}>
                  <button
                    onClick={toggleFeaturesDropdown}
                    className={`flex items-center gap-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ease-in-out
                      ${isSubLinkActive(link.subLinks) || isFeaturesDropdownOpen ? "text-indigo-600 bg-indigo-50" : "text-gray-600 hover:text-indigo-600 hover:bg-gray-100/70"}`}
                  >
                    {link.name}
                    <ChevronDown className={`w-5 h-5 transition-transform ${isFeaturesDropdownOpen ? "rotate-180 text-indigo-500" : "text-gray-400"}`} />
                  </button>
                  {isFeaturesDropdownOpen && (
                    <div className="absolute left-0 mt-2 w-60 origin-top-left bg-white border border-gray-200/80 rounded-xl shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none py-2 z-20">
                      {link.subLinks.map((subLink) => (
                        <Link
                          key={subLink.name}
                          to={subLink.href}
                          onClick={() => setIsFeaturesDropdownOpen(false)}
                          className={`block px-5 py-2.5 text-sm transition-colors duration-150
                            ${isActive(subLink.href) ? "text-indigo-600 font-semibold bg-indigo-50/70" : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"}`}
                        >
                          {subLink.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  key={link.name}
                  to={link.href}
                  className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ease-in-out ${isActive(link.href) ? "text-indigo-600 bg-indigo-50 font-semibold" : "text-gray-600 hover:text-indigo-600 hover:bg-gray-100/70"}`}
                >
                  {link.name}
                </Link>
              )
            )}
          </div>

          <div className="hidden md:flex items-center space-x-3">
            <Link
              to="/dashboard" // Navigate to dashboard
              className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50/80 px-5 py-2.5 rounded-lg text-sm font-medium transition-colors"
            >
              Login
            </Link>
            <Link
              to="/dashboard" // Navigate to dashboard
              className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-semibold text-sm px-6 py-2.5 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-105 flex items-center gap-1.5"
            >
               Get Started
            </Link>
          </div>

          <div className="md:hidden flex items-center">
            <button
              onClick={toggleMobileMenu}
              type="button"
              className="inline-flex items-center justify-center p-2.5 rounded-lg text-gray-500 hover:text-indigo-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500 transition-colors"
            >
              <span className="sr-only">Open main menu</span>
              {isMobileMenuOpen ? <X className="block h-6 w-6" /> : <Menu className="block h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      <div className={`md:hidden bg-white border-t border-gray-200/80 ${isMobileMenuOpen ? "block" : "hidden"}`}>
        <div className="px-3 pt-3 pb-4 space-y-1 sm:px-4">
          {navLinks.map((link) => {
            if (link.isDropdown) {
              return (
                <div key={link.name}>
                  <button
                    onClick={toggleFeaturesDropdown}
                    className={`w-full text-left flex items-center justify-between px-3 py-3 rounded-lg text-base font-medium transition-colors ${isSubLinkActive(link.subLinks) || isFeaturesDropdownOpen ? "text-indigo-600 bg-indigo-50" : "text-gray-700 hover:text-indigo-600 hover:bg-gray-100"}`}
                  >
                    {link.name}
                    <ChevronDown className={`w-5 h-5 transition-transform ${isFeaturesDropdownOpen ? "rotate-180" : ""}`} />
                  </button>
                  {isFeaturesDropdownOpen && (
                    <div className="pl-4 mt-1 space-y-1">
                      {link.subLinks.map((subLink) => (
                        <Link
                          key={subLink.name}
                          to={subLink.href}
                          onClick={() => {setIsMobileMenuOpen(false); setIsFeaturesDropdownOpen(false);}}
                          className={`block px-3 py-2.5 rounded-md text-base font-medium ${isActive(subLink.href) ? "text-indigo-600 bg-indigo-50/70" : "text-gray-600 hover:text-indigo-600 hover:bg-gray-50"}`}
                        >
                          {subLink.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            }
            return (
              <Link
                key={link.name}
                to={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`block px-3 py-3 rounded-lg text-base font-medium ${isActive(link.href) ? "text-indigo-600 bg-indigo-50" : "text-gray-700 hover:text-indigo-600 hover:bg-gray-100"}`}
              >
                {link.name}
              </Link>
            );
          })}
        </div>
        <div className="pt-4 pb-4 border-t border-gray-200/80">
          <div className="px-3 space-y-3 sm:px-4">
            <Link
              to="/dashboard" // Navigate to dashboard
              onClick={() => setIsMobileMenuOpen(false)}
              className="block w-full text-center px-4 py-3 rounded-lg text-base font-medium text-gray-700 hover:bg-gray-100 hover:text-indigo-600 border border-gray-300"
            >
              Login
            </Link>
            <Link
              to="/dashboard" // Navigate to dashboard
              onClick={() => setIsMobileMenuOpen(false)}
              className="block w-full text-center mt-2 px-4 py-3 border border-transparent rounded-lg shadow-sm text-base font-medium text-white bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700"
            >
              Get Started
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}