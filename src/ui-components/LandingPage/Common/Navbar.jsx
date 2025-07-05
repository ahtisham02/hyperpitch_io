import React, { useState } from 'react';
import { Link } from 'react-scroll';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Menu, X, Rocket } from 'lucide-react';

const Logo = () => (
    <Link to="home" smooth={true} duration={500} className="flex items-center gap-2 cursor-pointer">
        <Rocket className="text-brand-green" size={32} />
        <span className="text-xl font-bold text-dark-text">HyperPitch.io</span>
    </Link>
);

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const { userToken } = useSelector((state) => state.auth);

  const navLinks = [
    { to: 'examples', label: 'Examples' },
    { to: 'how-it-works', label: 'How it works' },
    { to: 'features', label: 'Features' },
    { to: 'reviews', label: 'Reviews' },
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
                className="px-5 py-2 rounded-lg font-semibold text-dark-text bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                Login
              </button>
              <button 
                onClick={() => navigate('/signup')} 
                className="cursor-pointer px-5 py-2 rounded-lg font-semibold text-white bg-gradient-primary shadow-md shadow-brand-green/30 hover:opacity-90 transition-opacity"
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
                  onClick={() => handleNavigate('/login')} 
                  className="w-full text-center py-2 rounded-lg font-semibold text-white bg-gradient-primary"
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