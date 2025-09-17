import React, { useState, useEffect } from 'react';

export const Dialog = ({ children, open, onOpenChange, ...props }) => {
  const [isOpen, setIsOpen] = useState(open);

  useEffect(() => {
    setIsOpen(open);
  }, [open]);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onOpenChange?.(false);
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onOpenChange]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div 
        className="fixed inset-0 bg-black/50"
        onClick={() => onOpenChange?.(false)}
      />
      <div className="relative z-50">
        {React.Children.map(children, child => 
          React.cloneElement(child, { onOpenChange })
        )}
      </div>
    </div>
  );
};

export const DialogContent = ({ className = '', children, onOpenChange, ...props }) => (
  <div 
    className={`relative bg-background p-6 shadow-lg sm:rounded-lg w-full max-w-lg mx-auto ${className}`}
    {...props}
  >
    {children}
  </div>
);

export const DialogHeader = ({ className = '', children, ...props }) => (
  <div className={`flex flex-col space-y-1.5 text-center sm:text-left ${className}`} {...props}>
    {children}
  </div>
);

export const DialogTitle = ({ className = '', children, ...props }) => (
  <h2 className={`text-lg font-semibold leading-none tracking-tight ${className}`} {...props}>
    {children}
  </h2>
);

export const DialogDescription = ({ className = '', children, ...props }) => (
  <p className={`text-sm text-muted-foreground ${className}`} {...props}>
    {children}
  </p>
);

export const DialogFooter = ({ className = '', children, ...props }) => (
  <div className={`flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 ${className}`} {...props}>
    {children}
  </div>
);
