import React, { useState } from 'react';
import { FiSun, FiMoon } from 'react-icons/fi';

const ThemeSwitcher = () => {
  const [isDark, setIsDark] = useState(true);

  const toggleTheme = () => {
    setIsDark(!isDark);
    document.body.classList.toggle('light-theme');
  };

  return (
    <button 
      onClick={toggleTheme}
      className="theme-switcher"
      title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
    >
      {isDark ? <FiSun /> : <FiMoon />}
    </button>
  );
};

export default ThemeSwitcher;
