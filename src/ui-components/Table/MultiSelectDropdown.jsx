import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, X, Check, Loader2 } from 'lucide-react';

const MultiSelectDropdown = ({ 
  title, 
  icon: Icon, 
  options, 
  selected, 
  setSelected, 
  isLoading = false,
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

  const handleToggle = (option) => {
    if (selected.includes(option)) {
      setSelected(selected.filter(item => item !== option));
    } else {
      setSelected([...selected, option]);
    }
  };

  const handleRemove = (optionToRemove) => {
    setSelected(selected.filter(option => option !== optionToRemove));
  };

  return (
    <div className={`relative ${className}`} ref={wrapperRef}>
      <label className="text-sm font-medium block mb-1.5 flex items-center gap-2 text-slate-700">
        {Icon && <Icon className="text-slate-500" size={16}/>}
        <span>{title}</span>
      </label>
      
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-between p-2 bg-white rounded-lg border border-slate-300 min-h-[42px] focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
        >
          <div className="flex flex-wrap gap-1 flex-1">
            {selected.length > 0 ? (
              selected.map((option, index) => (
                <div key={index} className="flex items-center gap-1 px-2 py-1 bg-emerald-100 text-emerald-700 text-sm rounded-md">
                  <span className="truncate max-w-[120px]">{option}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemove(option);
                    }}
                    className="ml-1 p-0.5 hover:bg-emerald-200 rounded"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))
            ) : (
              <span className="text-slate-500">Select {title ? title.toLowerCase() : 'options'}...</span>
            )}
          </div>
          
          {isLoading ? (
            <Loader2 size={16} className="animate-spin text-slate-500" />
          ) : (
            <ChevronDown 
              size={16} 
              className={`text-slate-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} 
            />
          )}
        </button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto"
            >
              {isLoading ? (
                <div className="p-4 text-center text-slate-500">
                  <Loader2 size={16} className="animate-spin mx-auto mb-2" />
                  Loading options...
                </div>
              ) : options.length > 0 ? (
                <div className="py-1">
                  {options.map((option, index) => (
                    <button
                      key={index}
                      onClick={() => handleToggle(option)}
                      className="w-full px-4 py-2 text-left hover:bg-slate-100 text-sm flex items-center justify-between"
                    >
                      <span className="truncate">{option}</span>
                      {selected.includes(option) && (
                        <Check size={14} className="text-emerald-600 flex-shrink-0" />
                      )}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="p-4 text-center text-slate-500 text-sm">
                  No options available
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default MultiSelectDropdown;
