import React from 'react';
import { useState } from 'react';
import { Link } from 'react-scroll';
import { Menu, X, Rocket } from 'lucide-react';

const Logo = () => (
    <Link to="home" smooth={true} duration={500} className="flex items-center gap-2 cursor-pointer">
        <Rocket className="text-brand-green" size={32} />
        <span className="text-xl font-bold text-dark-text">HyperPitch.io</span>
    </Link>
);

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const navLinks = [
    { to: 'examples', label: 'Examples' },
    { to: 'how-it-works', label: 'How it works' },
    { to: 'features', label: 'Features' },
    { to: 'reviews', label: 'Reviews' },
    { to: 'pricing', label: 'Pricing' },
    { to: 'faq', label: 'FAQ' },
  ];

  return (
    <nav className="bg-white/80 backdrop-blur-lg h-20 fixed top-0 left-0 right-0 z-40 border-b border-border-color">
      <div className="container mx-auto px-6 h-full flex justify-between items-center">
        <Logo />
        
        <ul className="hidden lg:flex items-center space-x-8">
          {navLinks.map((link) => (
            <li key={link.to}>
              <Link to={link.to} spy={true} smooth={true} offset={-80} duration={500}
                className="text-medium-text hover:text-dark-text font-medium cursor-pointer transition-colors pb-1.5"
                activeClass="!text-dark-text border-b-2 border-brand-green"
              >{link.label}</Link>
            </li>
          ))}
        </ul>

        <div className="hidden lg:flex items-center space-x-2">
            <a href="/login" className="px-5 py-2 rounded-lg font-semibold text-dark-text bg-gray-100 hover:bg-gray-200 transition-colors">Login</a>
            <Link to="pricing" smooth={true} offset={-80} duration={500} className="cursor-pointer px-5 py-2 rounded-lg font-semibold text-white bg-gradient-primary shadow-md shadow-brand-green/30 hover:opacity-90 transition-opacity">Start Free Trial</Link>
        </div>

        <div className="lg:hidden"><button onClick={() => setIsOpen(!isOpen)}>{isOpen ? <X /> : <Menu />}</button></div>
      </div>

      {isOpen && (
        <div className="lg:hidden absolute top-20 left-0 w-full bg-white shadow-lg p-4">
          <ul className="flex flex-col space-y-2">{navLinks.map((link) => (<li key={link.to}><Link to={link.to} smooth={true} offset={-80} duration={500} className="block py-2 text-center cursor-pointer hover:text-black" onClick={() => setIsOpen(false)}>{link.label}</Link></li>))}</ul>
          <div className="flex flex-col space-y-2 mt-4">
              <a href="/login" className="w-full text-center py-2 rounded-lg font-semibold text-dark-text bg-gray-100">Login</a>
              <Link to="pricing" smooth={true} offset={-80} duration={500} onClick={() => setIsOpen(false)} className="w-full text-center py-2 rounded-lg font-semibold text-white bg-gradient-primary">Start Free Trial</Link>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;