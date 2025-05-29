import React from "react";
import { Instagram, Twitter, Linkedin, Youtube, Mail, Zap } from "lucide-react";
import { Link } from "react-router-dom";

const footerSections = [
  {
    title: "Product",
    items: [
      { name: "Core Features", href: "/features" },
      { name: "Builder In Action", href: "/page-builder-demo" },
      { name: "Plans & Pricing", href: "/pricing" },
      { name: "Request A Demo", href: "/dashboard" }, // Navigate to dashboard
    ],
  },
  {
    title: "Resources",
    items: [
      { name: "Help Center", href: "/support" },
      { name: "Tutorials", href: "/tutorials" },
      { name: "Community Forum", href: "/community" },
    ],
  },
  {
    title: "Company",
    items: [
      { name: "Our Story", href: "/about" },
      { name: "Contact Us", href: "/contact" },
      { name: "Join Our Team", href: "/careers" },
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
    <footer className="bg-gray-50 text-gray-600 border-t border-gray-200/80 pt-16 pb-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          <div className="sm:col-span-2 lg:col-span-1 mb-6 lg:mb-0">
             <Link to="/" className="flex items-center gap-2 text-2xl font-bold text-indigo-600 mb-3">
              <Zap size={28} className="text-amber-500" />
              PageCraft
            </Link>
            <p className="text-sm text-gray-500 max-w-xs leading-relaxed">
              Empowering you to create beautiful, high-converting landing pages with ease and speed.
            </p>
             <Link
                to="/dashboard" // Navigate to dashboard
                className="mt-6 inline-flex items-center gap-2 bg-indigo-100 text-indigo-700 font-semibold text-sm px-5 py-2.5 rounded-lg hover:bg-indigo-200 transition-colors"
            >
                Start Building Now
                <Mail size={16} />
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
                      className="text-sm text-gray-500 hover:text-indigo-600 hover:underline transition-colors"
                    >
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="border-t border-gray-200/80 pt-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-center md:text-left">
            <p className="text-xs text-gray-500">
              © {currentYear} PageCraft Inc. All rights reserved.
            </p>
            <nav className="mt-2 flex flex-wrap justify-center md:justify-start gap-x-4 gap-y-1">
              {policyLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.href}
                  className="text-xs text-gray-400 hover:text-indigo-600 hover:underline transition-colors"
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
                className="text-gray-400 hover:text-indigo-600 transition-colors p-1 rounded-full hover:bg-gray-100"
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