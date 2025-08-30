import React from 'react';

const CustomCheckbox = ({ id, label, checked, onChange, disabled = false }) => {
  return (
    <div className="flex items-center">
              <input
          id={id}
          type="checkbox"
          checked={checked}
          onChange={onChange}
          disabled={disabled}
          className="custom-checkbox"
        />
              <label htmlFor={id} className="ml-2 text-sm text-slate-700 cursor-pointer">
        {label}
      </label>
    </div>
  );
};

export default CustomCheckbox;
