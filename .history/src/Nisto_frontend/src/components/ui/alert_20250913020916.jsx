import React from 'react';

const alertVariants = {
  default: 'bg-background text-foreground',
  destructive: 'border-destructive/50 text-destructive dark:border-destructive [&>svg]:text-destructive'
};

export const Alert = ({ className = '', variant = 'default', children, ...props }) => (
  <div 
    className={`relative w-full rounded-lg border p-4 [&>svg~*]:pl-7 [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground ${alertVariants[variant]} ${className}`}
    {...props}
  >
    {children}
  </div>
);

export const AlertDescription = ({ className = '', children, ...props }) => (
  <div className={`text-sm [&_p]:leading-relaxed ${className}`} {...props}>
    {children}
  </div>
);
