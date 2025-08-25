// Nisto Theme System
// Centralized color management using the specified color palette:
// - #113F67 (dark blue)
// - #fff (white) 
// - black

export const theme = {
  // Core Colors
  colors: {
    primary: '#113F67',    // Dark blue - main brand color
    white: '#fff',         // Pure white
    black: '#000000',      // Pure black
    
    // Semantic Colors
    background: {
      primary: '#fff',
      secondary: '#f8f9fa',
      tertiary: '#e9ecef'
    },
    surface: '#fff',
    text: {
      primary: '#113F67',
      secondary: '#666666',
      muted: '#999999',
      inverse: '#fff'
    },
    
    // Status Colors
    success: '#28a745',
    warning: '#ffc107',
    error: {
      hex: '#dc3545',
      r: 220,
      g: 53,
      b: 69
    },
    info: '#17a2b8',
    
    // Interactive Colors
    interactive: {
      primary: '#113F67',
      secondary: '#f8f9fa',
      hover: '#0d2f4f',
      active: '#0a253f',
      disabled: '#e9ecef'
    },
    
    // Border Colors
    border: {
      primary: '#dee2e6',
      secondary: '#e9ecef',
      accent: '#113F67'
    },
    
    // Shadow Colors
    shadow: {
      light: 'rgba(17, 63, 103, 0.1)',
      medium: 'rgba(17, 63, 103, 0.2)',
      dark: 'rgba(17, 63, 103, 0.3)'
    }
  },
  
  // Typography
  typography: {
    fontFamily: {
      primary: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      mono: 'SFMono-Regular, Consolas, "Liberation Mono", Menlo, monospace'
    },
    
    fontSize: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '1.875rem',
      '4xl': '2.25rem'
    },
    
    fontWeight: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700
    },
    
    lineHeight: {
      tight: 1.25,
      normal: 1.5,
      relaxed: 1.75
    }
  },
  
  // Spacing
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    '2xl': '3rem',
    '3xl': '4rem'
  },
  
  // Border Radius
  borderRadius: {
    none: '0',
    sm: '0.25rem',
    md: '0.5rem',
    lg: '0.75rem',
    xl: '1rem',
    full: '9999px'
  },
  
  // Shadows
  shadows: {
    sm: '0 1px 2px 0 rgba(17, 63, 103, 0.05)',
    md: '0 4px 6px -1px rgba(17, 63, 103, 0.1)',
    lg: '0 10px 15px -3px rgba(17, 63, 103, 0.1)',
    xl: '0 20px 25px -5px rgba(17, 63, 103, 0.1)'
  },
  
  // Transitions
  transitions: {
    fast: '0.15s ease-in-out',
    normal: '0.2s ease-in-out',
    slow: '0.3s ease-in-out'
  }
};

// Theme utility functions
export const getThemeColor = (colorPath) => {
  const path = colorPath.split('.');
  let value = theme.colors;
  
  for (const key of path) {
    value = value[key];
    if (value === undefined) {
      console.warn(`Theme color not found: ${colorPath}`);
      return theme.colors.primary;
    }
  }
  
  return value;
};

// Component-specific theme helpers
export const componentThemes = {
  // Button themes
  button: {
    primary: {
      background: theme.colors.primary,
      color: theme.colors.white,
      border: `1px solid ${theme.colors.primary}`,
      hover: {
        background: theme.colors.interactive.hover,
        border: `1px solid ${theme.colors.interactive.hover}`
      }
    },
    secondary: {
      background: theme.colors.white,
      color: theme.colors.primary,
      border: `1px solid ${theme.colors.border.primary}`,
      hover: {
        background: theme.colors.interactive.secondary,
        border: `1px solid ${theme.colors.border.accent}`
      }
    },
    outline: {
      background: 'transparent',
      color: theme.colors.primary,
      border: `1px solid ${theme.colors.primary}`,
      hover: {
        background: theme.colors.primary,
        color: theme.colors.white
      }
    }
  },
  
  // Card themes
  card: {
    background: theme.colors.white,
    border: `1px solid ${theme.colors.border.primary}`,
    shadow: theme.shadows.md,
    header: {
      background: theme.colors.white,
      border: `1px solid ${theme.colors.border.primary}`,
      color: theme.colors.text.primary
    }
  },
  
  // Input themes
  input: {
    background: theme.colors.white,
    border: `1px solid ${theme.colors.border.primary}`,
    color: theme.colors.text.primary,
    placeholder: theme.colors.text.muted,
    focus: {
      border: `1px solid ${theme.colors.primary}`,
      shadow: `0 0 0 3px ${theme.colors.shadow.light}`
    }
  },
  
  // Navigation themes
  navigation: {
    background: theme.colors.white,
    border: `1px solid ${theme.colors.border.primary}`,
    item: {
      color: theme.colors.text.secondary,
      active: {
        color: theme.colors.primary,
        background: theme.colors.interactive.secondary
      },
      hover: {
        color: theme.colors.primary,
        background: theme.colors.interactive.secondary
      }
    }
  }
};

// CSS Variables for use in stylesheets
export const cssVariables = {
  '--nisto-primary': theme.colors.primary,
  '--nisto-white': theme.colors.white,
  '--nisto-black': theme.colors.black,
  '--nisto-background-primary': theme.colors.background.primary,
  '--nisto-background-secondary': theme.colors.background.secondary,
  '--nisto-background-tertiary': theme.colors.background.tertiary,
  '--nisto-surface': theme.colors.surface,
  '--nisto-text-primary': theme.colors.text.primary,
  '--nisto-text-secondary': theme.colors.text.secondary,
  '--nisto-text-muted': theme.colors.text.muted,
  '--nisto-text-inverse': theme.colors.text.inverse,
  '--nisto-border-primary': theme.colors.border.primary,
  '--nisto-border-secondary': theme.colors.border.secondary,
  '--nisto-border-accent': theme.colors.border.accent,
  '--nisto-shadow-light': theme.colors.shadow.light,
  '--nisto-shadow-medium': theme.colors.shadow.medium,
  '--nisto-shadow-dark': theme.colors.shadow.dark,
  '--nisto-success': theme.colors.success,
  '--nisto-warning': theme.colors.warning,
  '--nisto-error': theme.colors.error.hex,
  '--nisto-info': theme.colors.info
};

// Apply theme to document root
export const applyTheme = () => {
  const root = document.documentElement;
  
  Object.entries(cssVariables).forEach(([property, value]) => {
    root.style.setProperty(property, value);
  });
};

// React hook for using theme in components
export const useTheme = () => {
  return {
    theme,
    getThemeColor,
    componentThemes,
    applyTheme
  };
};

export default theme;
