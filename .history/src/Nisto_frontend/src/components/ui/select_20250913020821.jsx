import React, { useState, useRef, useEffect } from 'react';

export const Select = ({ children, value, onValueChange, ...props }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedValue, setSelectedValue] = useState(value);
  const selectRef = useRef(null);

  useEffect(() => {
    setSelectedValue(value);
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (selectRef.current && !selectRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (newValue) => {
    setSelectedValue(newValue);
    onValueChange?.(newValue);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={selectRef} {...props}>
      {React.Children.map(children, child => 
        React.cloneElement(child, { 
          isOpen, 
          setIsOpen, 
          selectedValue, 
          onSelect: handleSelect 
        })
      )}
    </div>
  );
};

export const SelectTrigger = ({ className = '', children, isOpen, setIsOpen, ...props }) => (
  <button
    type="button"
    className={`flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
    onClick={() => setIsOpen?.(!isOpen)}
    {...props}
  >
    {children}
  </button>
);

export const SelectValue = ({ placeholder = 'Select...', selectedValue, children }) => {
  if (selectedValue && children) {
    const selectedChild = React.Children.toArray(children).find(
      child => child.props.value === selectedValue
    );
    return selectedChild ? selectedChild.props.children : placeholder;
  }
  return placeholder;
};

export const SelectContent = ({ className = '', children, isOpen, onSelect, ...props }) => {
  if (!isOpen) return null;
  
  return (
    <div 
      className={`absolute top-full z-50 w-full rounded-md border bg-popover p-1 text-popover-foreground shadow-md ${className}`}
      {...props}
    >
      {React.Children.map(children, child => 
        React.cloneElement(child, { onSelect })
      )}
    </div>
  );
};

export const SelectItem = ({ className = '', value, children, onSelect, ...props }) => (
  <div
    className={`relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 ${className}`}
    onClick={() => onSelect?.(value)}
    {...props}
  >
    {children}
  </div>
);
