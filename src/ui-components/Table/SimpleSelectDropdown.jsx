import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Check } from 'lucide-react';

const SimpleSelectDropdown = ({ 
  title, 
  icon: Icon, 
  options, 
  selected, 
  setSelected,
  className = "" 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (option) => {
    setSelected(option);
    setIsOpen(false);
  };

  return (
    <div className={`relative ${className}`} ref={wrapperRef}>
      <label className="text-sm font-medium block mb-1.5 flex items-center gap-2 text-body-text">
        {Icon && <Icon className="text-muted-foreground" size={16}/>}
        <span>{title}</span>
      </label>
      
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-between p-2 bg-background rounded-lg border border-input min-h-[42px] focus:outline-none focus:ring-2 focus:ring-primary/50"
        >
          <span className={selected ? 'text-body-text' : 'text-muted-foreground'}>
            {selected || `Select ${title.toLowerCase()}...`}
          </span>
          <ChevronDown 
            size={16} 
            className={`text-muted-foreground transition-transform ${isOpen ? 'rotate-180' : ''}`} 
          />
        </button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute top-full left-0 right-0 mt-1 bg-card border border-input rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto"
            >
              <div className="py-1">
                {options.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => handleSelect(option)}
                    className="w-full px-4 py-2 text-left hover:bg-secondary text-sm flex items-center justify-between"
                  >
                    <span className="truncate">{option}</span>
                    {selected === option && (
                      <Check size={14} className="text-primary flex-shrink-0" />
                    )}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default SimpleSelectDropdown;
