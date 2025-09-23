import React from 'react';

export const Input = ({ 
  className = '', 
  type = 'text', 
  disabled = false,
  placeholder = '',
  ...props 
}) => (
  <input
    type={type}
    disabled={disabled}
    placeholder={placeholder}
    className={`
      flex h-10 w-full 
      rounded-lg border border-gray-300 dark:border-gray-600
      bg-white dark:bg-gray-800
      px-3 py-2 text-sm
      text-gray-900 dark:text-white
      placeholder:text-gray-500 dark:placeholder:text-gray-400
      transition-all duration-200 ease-in-out
      focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
      disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-50 dark:disabled:bg-gray-700
      file:border-0 file:bg-transparent file:text-sm file:font-medium
      ${className}
    `.trim()}
    {...props}
  />
);
