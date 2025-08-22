import React, { useState, useEffect } from 'react';
import { FiSun, FiMoon } from 'react-icons/fi';
import { theme, applyTheme } from '../utils/theme';

const ThemeSwitcher = () => {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // Apply the Nisto theme on component mount
    applyTheme();
    
    // Check for saved theme preference or default to light mode
    const savedTheme = localStorage.getItem('nisto-theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
      setIsDark(true);
      document.documentElement.classList.add('dark');
    } else {
      setIsDark(false);
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = !isDark;
    setIsDark(newTheme);
    
    if (newTheme) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('nisto-theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('nisto-theme', 'light');
    }
  };

  return (
    <button
      onClick={toggleTheme}
      style={{
        position: 'fixed',
        top: '1rem',
        right: '1rem',
        zIndex: 1000,
        width: '48px',
        height: '48px',
        borderRadius: '50%',
        background: theme.colors.white,
        border: `1px solid ${theme.colors.border.primary}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        color: theme.colors.primary,
        fontSize: '1.25rem',
        transition: theme.transitions.normal,
        boxShadow: theme.shadows.md,
        ':hover': {
          transform: 'scale(1.05)',
          boxShadow: theme.shadows.lg
        }
      }}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {isDark ? <FiSun size={20} /> : <FiMoon size={20} />}
    </button>
  );
};

export default ThemeSwitcher;
