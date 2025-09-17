import React from 'react';

export const Card = ({ className = '', children, ...props }) => (
  <div 
    className={`
      bg-white dark:bg-gray-800 
      border border-gray-200 dark:border-gray-700 
      rounded-xl shadow-sm
      transition-all duration-200 ease-in-out
      hover:shadow-md
      ${className}
    `.trim()} 
    {...props}
  >
    {children}
  </div>
);

export const CardHeader = ({ className = '', children, ...props }) => (
  <div 
    className={`
      flex flex-col space-y-2 p-6 pb-4
      border-b border-gray-100 dark:border-gray-700
      ${className}
    `.trim()} 
    {...props}
  >
    {children}
  </div>
);

export const CardTitle = ({ className = '', children, ...props }) => (
  <h3 
    className={`
      text-xl font-semibold 
      text-gray-900 dark:text-white
      leading-tight
      ${className}
    `.trim()} 
    {...props}
  >
    {children}
  </h3>
);

export const CardDescription = ({ className = '', children, ...props }) => (
  <p 
    className={`
      text-sm text-gray-600 dark:text-gray-400
      leading-relaxed
      ${className}
    `.trim()} 
    {...props}
  >
    {children}
  </p>
);

export const CardContent = ({ className = '', children, ...props }) => (
  <div 
    className={`
      p-6
      ${className}
    `.trim()} 
    {...props}
  >
    {children}
  </div>
);

export const CardFooter = ({ className = '', children, ...props }) => (
  <div 
    className={`
      flex items-center justify-between p-6 pt-4
      border-t border-gray-100 dark:border-gray-700
      ${className}
    `.trim()} 
    {...props}
  >
    {children}
  </div>
);
