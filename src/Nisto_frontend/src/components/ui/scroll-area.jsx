import React from 'react';

export const ScrollArea = ({ className = '', children, ...props }) => (
  <div 
    className={`relative overflow-hidden ${className}`}
    {...props}
  >
    <div className="h-full w-full overflow-auto">
      {children}
    </div>
  </div>
);
