import React, { useState } from 'react';
import { Link } from 'react-scroll';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Menu, X } from 'lucide-react';
import logo from '../../../assets/logo.png';

const Logo = () => (
    <Link to="home" smooth={true} duration={500} className="flex items-center cursor-pointer">
        <img src={logo} alt="HyperPitch.io" className="h-14 w-44 mt-1" />
    </Link>
);

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const { userToken } = useSelector((state) => state.auth);

  const navLinks = [
    { to: 'features', label: 'Features' },
    { to: 'how-it-works', label: 'How it Works' },
    { to: 'capabilities', label: 'Capabilities' },
    { to: 'advanced-features', label: 'Advanced' },
    { to: 'pricing', label: 'Pricing' },
    { to: 'faq', label: 'FAQ' },
  ];

  const handleNavigate = (path) => {
    navigate(path);
    setIsOpen(false);
  };

  return (
    <nav className="bg-white/80 backdrop-blur-lg h-20 fixed top-0 left-0 right-0 z-40 border-b border-border-color">
      <div className="container mx-auto px-6 h-full flex justify-between items-center">
        <Logo />
        
        <ul className="hidden lg:flex items-center space-x-8">
          {navLinks.map((link) => (
            <li key={link.to}>
              <Link 
                to={link.to} 
                spy={true} 
                smooth={true} 
                offset={-80} 
                duration={500}
                className="text-medium-text hover:text-dark-text font-medium cursor-pointer transition-colors pb-1.5"
                activeClass="!text-dark-text border-b-2 border-brand-green"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="hidden lg:flex items-center space-x-2">
          {userToken ? (
            <button 
              onClick={() => navigate('/dashboard')} 
              className="cursor-pointer px-5 py-2 rounded-lg font-semibold text-white bg-gradient-primary shadow-md shadow-brand-green/30 hover:opacity-90 transition-opacity"
            >
              Dashboard
            </button>
          ) : (
            <>
              <button 
                onClick={() => navigate('/login')} 
                className="px-5 py-2 font-semibold text-dark-text transition-colors"
              >
                Login
              </button>
              <button 
                onClick={() => navigate('/signup')} 
                className="cursor-pointer px-5 py-2 rounded-lg font-semibold text-white bg-brand-gradient shadow-md shadow-brand-green/30 hover:opacity-90 transition-opacity"
              >
                Start Free Trial
              </button>
            </>
          )}
        </div>

        <div className="lg:hidden">
          <button onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="lg:hidden absolute top-20 left-0 w-full bg-white shadow-lg p-4">
          <ul className="flex flex-col space-y-2">
            {navLinks.map((link) => (
              <li key={link.to}>
                <Link 
                  to={link.to} 
                  smooth={true} 
                  offset={-80} 
                  duration={500} 
                  className="block py-2 text-center cursor-pointer hover:text-black" 
                  onClick={() => setIsOpen(false)}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
          <div className="flex flex-col space-y-2 mt-4">
            {userToken ? (
              <button 
                onClick={() => handleNavigate('/dashboard')} 
                className="w-full text-center py-2 rounded-lg font-semibold text-white bg-gradient-primary"
              >
                Dashboard
              </button>
            ) : (
              <>
                <button 
                  onClick={() => handleNavigate('/login')} 
                  className="w-full text-center py-2 rounded-lg font-semibold text-dark-text bg-gray-100"
                >
                  Login
                </button>
                <button 
                  onClick={() => handleNavigate('/signup')} 
                  className="w-full text-center py-2 rounded-lg font-semibold text-white bg-brand-gradient"
                >
                  Start Free Trial
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;