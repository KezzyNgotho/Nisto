import React, { createContext, useContext, useEffect } from 'react';
import { theme, applyTheme } from '../utils/theme';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  useEffect(() => {
    // Apply the Nisto theme when the provider mounts
    applyTheme();
    console.log('🎨 Nisto theme applied globally');
  }, []);

  const value = {
    theme,
    applyTheme
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

export default ThemeProvider;
