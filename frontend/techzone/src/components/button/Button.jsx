import React from 'react';

const Button = ({
  children,
  onClick,
  type = 'button',
  variant = 'primary',
  disabled = false,
  className = '',
}) => {
  let baseClasses = `
    w-full h-10 py-2 text-center font-semibold rounded-lg transition-colors duration-200 ease-in-out
  `;

  if (variant === 'primary') {
    baseClasses += `
    text-white bg-light-green
      ${disabled ? 'bg-gray-400 cursor-not-allowed' : 'hover:bg-emerald-700 hover:shadow-lg'}
    `;
  } else if (variant === 'outline') {
    baseClasses += `
      bg-white text-light-green border-2 border-light-green
      ${disabled ? 'opacity-60 cursor-not-allowed' : 'hover:bg-emerald-700 hover:text-white'}
    `;
  }

  const finalClasses = `${baseClasses} ${className}`;

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={finalClasses}
    >
      {children}
    </button>
  );
};

export default Button;