import React from 'react';

const buttonVariants = {
  default: 'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800',
  destructive: 'bg-red-600 text-white hover:bg-red-700 active:bg-red-800',
  outline: 'border border-gray-300 bg-transparent text-gray-700 hover:bg-gray-50 active:bg-gray-100',
  secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300 active:bg-gray-400',
  ghost: 'bg-transparent text-gray-700 hover:bg-gray-100 active:bg-gray-200',
  link: 'bg-transparent text-blue-600 underline hover:text-blue-700'
};

const buttonSizes = {
  default: 'h-10 px-4 py-2 text-sm',
  sm: 'h-8 px-3 text-xs',
  lg: 'h-12 px-6 text-base',
  icon: 'h-10 w-10 p-0'
};

export const Button = ({ 
  className = '', 
  variant = 'default', 
  size = 'default', 
  children, 
  disabled = false,
  ...props 
}) => (
  <button 
    className={`
      inline-flex items-center justify-center 
      font-medium rounded-lg
      transition-all duration-200 ease-in-out
      focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
      disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none
      ${buttonVariants[variant]} 
      ${buttonSizes[size]} 
      ${className}
    `.trim()}
    disabled={disabled}
    {...props}
  >
    {children}
  </button>
);
