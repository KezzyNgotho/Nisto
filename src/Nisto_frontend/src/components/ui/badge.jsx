import React from 'react';

const badgeVariants = {
  default: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  secondary: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
  destructive: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
  outline: 'border border-gray-300 text-gray-700 dark:border-gray-600 dark:text-gray-300',
  success: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  warning: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
};

export const Badge = ({ 
  className = '', 
  variant = 'default', 
  children, 
  ...props 
}) => (
  <span 
    className={`
      inline-flex items-center 
      rounded-full px-2.5 py-0.5 
      text-xs font-medium
      transition-colors duration-200
      ${badgeVariants[variant]} 
      ${className}
    `.trim()}
    {...props}
  >
    {children}
  </span>
);
