import React, { useState, createContext, useContext } from 'react';

const TabsContext = createContext();

export const Tabs = ({ children, value, onValueChange, defaultValue, ...props }) => {
  const [activeTab, setActiveTab] = useState(value || defaultValue);

  const handleValueChange = (newValue) => {
    setActiveTab(newValue);
    onValueChange?.(newValue);
  };

  return (
    <TabsContext.Provider value={{ activeTab, onValueChange: handleValueChange }}>
      <div {...props}>
        {children}
      </div>
    </TabsContext.Provider>
  );
};

export const TabsList = ({ className = '', children, ...props }) => (
  <div 
    className={`inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground ${className}`}
    {...props}
  >
    {children}
  </div>
);

export const TabsTrigger = ({ className = '', value, children, ...props }) => {
  const { activeTab, onValueChange } = useContext(TabsContext);
  const isActive = activeTab === value;

  return (
    <button
      className={`inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ${
        isActive 
          ? 'bg-background text-foreground shadow-sm' 
          : 'hover:bg-background/50'
      } ${className}`}
      onClick={() => onValueChange(value)}
      {...props}
    >
      {children}
    </button>
  );
};

export const TabsContent = ({ className = '', value, children, ...props }) => {
  const { activeTab } = useContext(TabsContext);
  
  if (activeTab !== value) return null;

  return (
    <div 
      className={`mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
