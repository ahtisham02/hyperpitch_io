import React from "react";
import { Instagram, Twitter, Linkedin, Youtube, Zap, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const footerSections = [
  {
    title: "Platform",
    items: [
      { name: "Features", href: "/features" },
      { name: "Themes", href: "/themes" },
      { name: "Plugins", href: "/plugins" },
      { name: "Pricing", href: "/pricing" },
    ],
  },
  {
    title: "Resources",
    items: [
      { name: "Documentation", href: "/docs" },
      { name: "Community", href: "/community" },
      { name: "Blog", href: "/blog" },
      { name: "Support Center", href: "/support" },
    ],
  },
  {
    title: "Company",
    items: [
      { name: "About Us", href: "/about" },
      { name: "Contact", href: "/contact" },
      { name: "Careers", href: "/careers" },
      { name: "Press", href: "/press" },
    ],
  },
];

const socialLinks = [
  { name: "Twitter", href: "#", icon: Twitter },
  { name: "LinkedIn", href: "#", icon: Linkedin },
  { name: "Instagram", href: "#", icon: Instagram },
  { name: "Youtube", href: "#", icon: Youtube },
];

const policyLinks = [
  { name: "Privacy Policy", href: "/privacy" },
  { name: "Terms of Service", href: "/terms" },
];

export default function UniqueFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-100 text-gray-700 border-t border-gray-200/90 pt-16 pb-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-10 mb-12">
          <div className="sm:col-span-2 lg:col-span-1 xl:col-span-2 mb-6 lg:mb-0">
             <Link to="/" className="flex items-center gap-2 text-2xl font-bold text-gray-800 mb-4">
              <Zap size={28} className="text-gray-500" />
              HyperPitch
            </Link>
            <p className="text-sm text-gray-600 max-w-md leading-relaxed mb-6">
              The modern, intuitive platform for building and managing your professional website with WordPress-like power.
            </p>
             <Link
                to="/dashboard"
                className="inline-flex items-center gap-2 bg-gray-800 text-white font-semibold text-sm px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors shadow-md"
            >
                Get Started Free
                <ArrowRight size={18} />
            </Link>
          </div>
          {footerSections.map((section) => (
            <div key={section.title}>
              <h5 className="font-semibold text-gray-800 mb-4 text-sm uppercase tracking-wider">
                {section.title}
              </h5>
              <ul className="space-y-3">
                {section.items.map((item) => (
                  <li key={item.name}>
                    <Link
                      to={item.href}
                      className="text-sm text-gray-600 hover:text-gray-900 hover:underline transition-colors"
                    >
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="border-t border-gray-200/90 pt-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-center md:text-left">
            <p className="text-xs text-gray-500">
              © {currentYear} HyperPitch.io. All Rights Reserved.
            </p>
            <nav className="mt-2 flex flex-wrap justify-center md:justify-start gap-x-4 gap-y-1">
              {policyLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.href}
                  className="text-xs text-gray-500 hover:text-gray-800 hover:underline transition-colors"
                >
                  {link.name}
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex space-x-5">
            {socialLinks.map((social) => (
              <Link
                key={social.name}
                to={social.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-500 hover:text-gray-800 transition-colors p-1 rounded-full"
                aria-label={social.name}
              >
                <social.icon className="h-5 w-5" aria-hidden="true" />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}