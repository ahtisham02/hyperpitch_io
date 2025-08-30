import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronDown, Search, Loader2 } from 'lucide-react';
import { toast } from 'react-toastify';
import { API_BASE_URL } from '../../config/api';


const AsyncMultiSelect = ({ 
  label, 
  icon: Icon, 
  placeholder, 
  values, 
  setValues, 
  fetchEndpoint, 
  optionFormatter, 
  displayFormatter, 
  suggestionFormatter,
  className = "" 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const wrapperRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchSuggestions = useCallback(async (searchQuery) => {
    if (!searchQuery.trim()) {
      setSuggestions([]);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}${fetchEndpoint}?query=${encodeURIComponent(searchQuery)}`);
      const responseData = await response.json();
      const data = responseData.data || [];
      const formattedSuggestions = data.map(optionFormatter);
      setSuggestions(formattedSuggestions);
      setHasSearched(true);
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      toast.error('Failed to fetch suggestions');
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  }, [fetchEndpoint, optionFormatter]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (query) {
        fetchSuggestions(query);
      } else {
        setSuggestions([]);
        setHasSearched(false);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query, fetchSuggestions]);

  const handleSelect = (suggestion) => {
    if (!values.some(v => displayFormatter(v) === displayFormatter(suggestion))) {
      setValues([...values, suggestion]);
    }
    setQuery('');
    setIsOpen(false);
  };

  const handleRemove = (valueToRemove) => {
    setValues(values.filter(v => displayFormatter(v) !== displayFormatter(valueToRemove)));
  };

  const handleInputFocus = () => {
    setIsOpen(true);
    if (query && suggestions.length > 0) {
      setIsOpen(true);
    }
  };

  return (
    <div className={`relative ${className}`} ref={wrapperRef}>
      <label className="text-sm font-medium block mb-1.5 flex items-center gap-2 text-slate-700">
        {Icon && <Icon className="text-slate-500" size={16}/>}
        <span>{label}</span>
      </label>
      
      <div className="relative">
        <div className="flex flex-wrap gap-2 p-2 bg-white rounded-lg border border-slate-300 min-h-[42px] focus-within:ring-2 focus-within:ring-emerald-500/50">
          {values.map((value, index) => (
            <div key={index} className="flex items-center gap-1 px-2 py-1 bg-emerald-100 text-emerald-700 text-sm rounded-md">
              <span className="truncate max-w-[150px]">{displayFormatter(value)}</span>
              <button
                onClick={() => handleRemove(value)}
                                  className="ml-1 p-0.5 hover:bg-emerald-200 rounded"
              >
                <X size={14} />
              </button>
            </div>
          ))}
          
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={handleInputFocus}
            placeholder={values.length === 0 ? placeholder : ''}
            className="flex-1 min-w-[120px] bg-transparent outline-none text-sm"
          />
          
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-1 hover:bg-slate-100 rounded"
          >
            {isLoading ? (
              <Loader2 size={16} className="animate-spin text-slate-500" />
            ) : (
              <ChevronDown size={16} className={`text-slate-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            )}
          </button>
        </div>

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
                  Searching...
                </div>
              ) : suggestions.length > 0 ? (
                <div className="py-1">
                  {suggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => handleSelect(suggestion)}
                      className="w-full px-4 py-2 text-left hover:bg-slate-100 text-sm flex items-center gap-2"
                    >
                      <Search size={14} className="text-slate-500" />
                      <span className="truncate">{suggestionFormatter(suggestion)}</span>
                    </button>
                  ))}
                </div>
              ) : hasSearched ? (
                <div className="p-4 text-center text-slate-500 text-sm">
                  No results found for "{query}"
                </div>
              ) : (
                <div className="p-4 text-center text-slate-500 text-sm">
                  Start typing to search...
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default AsyncMultiSelect;
