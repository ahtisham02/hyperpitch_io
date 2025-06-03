// CustomDropdown.js
import React, { useState, useRef, useEffect } from 'react';
import * as LucideIcons from 'lucide-react';

export const CustomDropdown = ({ options, selected, onSelect, placeholder = "Select an option", label, labelBase }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const handleSelect = (option) => {
    onSelect(option);
    setIsOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedOption = options.find(opt => opt.value === selected?.value) || { label: placeholder, value: '' };

  return (
    <div className="relative w-full" ref={dropdownRef}>
      {label && <label className={labelBase || "block text-sm font-semibold text-slate-900 mb-1.5"}>{label}</label>}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="block w-full bg-green-50/30 border-2 border-green-300/50 rounded-lg py-2.5 px-4 text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#2e8b57]/70 focus:border-[#2e8b57] transition-all duration-200 ease-in-out text-sm text-left flex justify-between items-center"
      >
        <span className={selectedOption.value ? 'text-slate-800' : 'text-slate-400'}>{selectedOption.label}</span>
        <LucideIcons.ChevronDown size={18} className={`transition-transform duration-200 ${isOpen ? 'transform rotate-180' : ''}`} />
      </button>
      {isOpen && (
        <ul className="absolute z-10 mt-1 w-full bg-white border border-green-300/50 rounded-lg shadow-lg max-h-60 overflow-auto py-1 text-sm">
          {options.map((option) => (
            <li
              key={option.value}
              onClick={() => handleSelect(option)}
              className={`px-4 py-2.5 hover:bg-green-100/70 cursor-pointer flex items-center justify-between ${selectedOption.value === option.value ? 'bg-green-100 font-medium text-[#2e8b57]' : 'text-slate-700'}`}
            >
              {option.label}
              {selectedOption.value === option.value && <LucideIcons.Check size={16} className="text-[#2e8b57]" />}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};