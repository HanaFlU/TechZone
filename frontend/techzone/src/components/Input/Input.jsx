import React from 'react';

const Input = ({
  label,
  id,
  name,
  type,
  value,
  onChange,
  placeholder,
  required = false,
  readOnly = false,
  disabled = false,
  className = '',
}) => {
  const baseInputClasses = `
     p-2 w-full h-10 rounded-lg 
    ${readOnly || disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white border border-dark-gray focus:ring-1'}
    ${className}
  `;
  const inputId = id || name;

  return (
    <div className="mb-4">
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-gray-700 mb-1">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <input
        id={inputId}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        readOnly={readOnly}
        disabled={disabled}
        className={baseInputClasses}
      />
    </div>
  );
};

export default Input;