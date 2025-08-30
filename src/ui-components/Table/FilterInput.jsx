import React from 'react';

const FilterInput = ({ 
  label, 
  type = "text", 
  value, 
  onChange, 
  name, 
  placeholder, 
  required = false, 
  icon: Icon, 
  accept, 
  className = "", 
  readOnly = false, 
  onKeyDown,
  disabled = false
}) => (
  <div className={className}>
    <label
      htmlFor={name}
      className="block text-sm font-medium text-slate-700 mb-1.5"
    >
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <div className="relative group">
      {Icon && (
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
          <Icon className="h-4 w-4 text-slate-500" />
        </div>
      )}
      <input
        type={type}
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        readOnly={readOnly}
        disabled={disabled}
        onKeyDown={onKeyDown}
        accept={accept}
        className={`w-full p-2 bg-white rounded-lg border border-slate-300 min-h-[42px] focus:outline-none focus:ring-2 focus:ring-emerald-500/50 ${
          Icon ? 'pl-10' : ''
        } ${readOnly ? 'bg-gray-50 cursor-not-allowed' : ''} ${disabled ? 'bg-gray-50 cursor-not-allowed opacity-50' : ''}`}
      />
    </div>
  </div>
);

export default FilterInput;
