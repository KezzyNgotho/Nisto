import React, { useState, useEffect } from 'react';

const ThemeSwitcher = () => {
  const [currentTheme, setCurrentTheme] = useState('bright-gold-blue-white');

  const themes = [
    {
      id: 'bright-gold-blue-white',
      name: 'Bright Gold, Blue & White',
      gradient: 'linear-gradient(135deg, #ffffff 0%, #f59e0b 100%)'
    },
    {
      id: 'light',
      name: 'Light',
      gradient: 'linear-gradient(135deg, #ffffff 0%, #f59e0b 100%)'
    },
    {
      id: 'purple',
      name: 'Purple',
      gradient: 'linear-gradient(135deg, #1a1a2e 0%, #a855f7 100%)'
    },
    {
      id: 'green',
      name: 'Green',
      gradient: 'linear-gradient(135deg, #0f172a 0%, #22c55e 100%)'
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
