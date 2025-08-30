import React, { useState } from 'react';
import { X } from 'lucide-react';

const TagInput = ({ 
  label, 
  icon: Icon, 
  placeholder, 
  values, 
  setValues,
  className = "" 
}) => {
  const [inputValue, setInputValue] = useState('');

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      e.preventDefault();
      const newTag = inputValue.trim();
      if (!values.includes(newTag)) {
        setValues([...values, newTag]);
      }
      setInputValue('');
    } else if (e.key === 'Backspace' && inputValue === '' && values.length > 0) {
      setValues(values.slice(0, -1));
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setValues(values.filter(tag => tag !== tagToRemove));
  };

  return (
    <div className={className}>
      <label className="text-sm font-medium block mb-1.5 flex items-center gap-2 text-body-text">
        {Icon && <Icon className="text-muted-foreground" size={16}/>}
        <span>{label}</span>
      </label>
      
      <div className="flex flex-wrap gap-2 p-2 bg-background rounded-lg border border-input min-h-[42px] focus-within:ring-2 focus-within:ring-primary/50">
        {values.map((tag, index) => (
          <div key={index} className="flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary text-sm rounded-md">
            <span>{tag}</span>
            <button
              onClick={() => handleRemoveTag(tag)}
              className="ml-1 p-0.5 hover:bg-primary/20 rounded"
            >
              <X size={12} />
            </button>
          </div>
        ))}
        
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={values.length === 0 ? placeholder : ''}
          className="flex-1 min-w-[120px] bg-transparent outline-none text-sm"
        />
      </div>
    </div>
  );
};

export default TagInput;
