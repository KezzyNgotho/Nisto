import React, { useState, useEffect } from 'react';

const ThemeSwitcher = () => {
  const [currentTheme, setCurrentTheme] = useState('ocean-coral');

  const themes = [
    {
      id: 'ocean-coral',
      name: 'Ocean & Coral',
      gradient: 'linear-gradient(135deg, #1e3a8a 0%, #f97316 100%)'
    }
  ];

  useEffect(() => {
    // Load saved theme from localStorage
    const savedTheme = localStorage.getItem('nisto-theme');
    if (savedTheme && themes.find(t => t.id === savedTheme)) {
      setCurrentTheme(savedTheme);
      document.documentElement.setAttribute('data-theme', savedTheme);
    } else {
      // Set default theme
      document.documentElement.setAttribute('data-theme', currentTheme);
    }
  }, []);

  const changeTheme = (themeId) => {
    setCurrentTheme(themeId);
    document.documentElement.setAttribute('data-theme', themeId);
    localStorage.setItem('nisto-theme', themeId);
    
    // Add a subtle animation effect
    document.body.style.transition = 'all 0.3s ease';
    setTimeout(() => {
      document.body.style.transition = '';
    }, 300);
  };

  return (
    <div className="theme-switcher">
      {themes.map((theme) => (
        <button
          key={theme.id}
          className={`theme-option ${currentTheme === theme.id ? 'active' : ''}`}
          data-theme={theme.id}
          onClick={() => changeTheme(theme.id)}
          title={theme.name}
          style={{
            background: theme.gradient
          }}
        />
      ))}
    </div>
  );
};

export default ThemeSwitcher;
