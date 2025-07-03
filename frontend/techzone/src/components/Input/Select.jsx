import React from 'react';

const Select = ({
  label,
  id,
  name,
  value,
  onChange,
  options = [],
  required = false,
  disabled = false,
  className = '',
}) => {
  const baseSelectClasses = `
    p-2 w-full h-10 rounded-lg 
    ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white border border-dark-gray focus:ring-1'}
    ${className}
  `;

  const selectId = id || name;

  return (
    <div className="mb-4">
      {label && (
        <label htmlFor={selectId} className="block text-sm font-medium text-gray-700 mb-1">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <select
        id={selectId}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        disabled={disabled}
        className={baseSelectClasses}
      >
        {options.map((option, index) => (
          <option key={index} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default Select;