import React, { useState, useRef, useEffect, createContext } from 'react';

const TooltipContext = createContext();

export const TooltipProvider = ({ children }) => {
  return (
    <TooltipContext.Provider value={{}}>
      {children}
    </TooltipContext.Provider>
  );
};

export const Tooltip = ({ children, ...props }) => {
  return <div {...props}>{children}</div>;
};

export const TooltipTrigger = ({ children, ...props }) => {
  return <div {...props}>{children}</div>;
};

export const TooltipContent = ({ className = '', children, ...props }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const contentRef = useRef(null);

  useEffect(() => {
    const handleMouseEnter = (e) => {
      setIsVisible(true);
      const rect = e.target.getBoundingClientRect();
      setPosition({
        top: rect.bottom + window.scrollY + 5,
        left: rect.left + window.scrollX
      });
    };

    const handleMouseLeave = () => {
      setIsVisible(false);
    };

    const trigger = contentRef.current?.previousElementSibling;
    if (trigger) {
      trigger.addEventListener('mouseenter', handleMouseEnter);
      trigger.addEventListener('mouseleave', handleMouseLeave);
    }

    return () => {
      if (trigger) {
        trigger.removeEventListener('mouseenter', handleMouseEnter);
        trigger.removeEventListener('mouseleave', handleMouseLeave);
      }
    };
  }, []);

  if (!isVisible) return null;

  return (
    <div
      ref={contentRef}
      className={`absolute z-50 overflow-hidden rounded-md border bg-popover px-3 py-1.5 text-sm text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 ${className}`}
      style={{
        top: position.top,
        left: position.left
      }}
      {...props}
    >
      {children}
    </div>
  );
};
