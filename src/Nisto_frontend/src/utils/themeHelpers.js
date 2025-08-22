import { theme } from './theme';

// Helper function to get themed styles for common components
export const getThemedStyles = {
  // Button styles
  button: {
    primary: {
      background: theme.colors.primary,
      color: theme.colors.white,
      border: `1px solid ${theme.colors.primary}`,
      borderRadius: theme.borderRadius.md,
      padding: `${theme.spacing.sm} ${theme.spacing.lg}`,
      fontSize: theme.typography.fontSize.sm,
      fontWeight: theme.typography.fontWeight.medium,
      cursor: 'pointer',
      transition: theme.transitions.normal,
      ':hover': {
        background: theme.colors.interactive.hover,
        border: `1px solid ${theme.colors.interactive.hover}`
      }
    },
    secondary: {
      background: theme.colors.white,
      color: theme.colors.primary,
      border: `1px solid ${theme.colors.border.primary}`,
      borderRadius: theme.borderRadius.md,
      padding: `${theme.spacing.sm} ${theme.spacing.lg}`,
      fontSize: theme.typography.fontSize.sm,
      fontWeight: theme.typography.fontWeight.medium,
      cursor: 'pointer',
      transition: theme.transitions.normal,
      ':hover': {
        background: theme.colors.interactive.secondary,
        border: `1px solid ${theme.colors.border.accent}`
      }
    }
  },

  // Card styles
  card: {
    container: {
      background: theme.colors.white,
      border: `1px solid ${theme.colors.border.primary}`,
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing.lg,
      boxShadow: theme.shadows.md
    },
    header: {
      borderBottom: `1px solid ${theme.colors.border.primary}`,
      paddingBottom: theme.spacing.md,
      marginBottom: theme.spacing.md
    }
  },

  // Input styles
  input: {
    field: {
      background: theme.colors.white,
      border: `1px solid ${theme.colors.border.primary}`,
      borderRadius: theme.borderRadius.md,
      padding: theme.spacing.sm,
      fontSize: theme.typography.fontSize.sm,
      color: theme.colors.text.primary,
      transition: theme.transitions.normal,
      ':focus': {
        outline: 'none',
        border: `1px solid ${theme.colors.primary}`,
        boxShadow: `0 0 0 3px ${theme.colors.shadow.light}`
      }
    }
  },

  // Text styles
  text: {
    heading: {
      color: theme.colors.text.primary,
      fontWeight: theme.typography.fontWeight.semibold
    },
    body: {
      color: theme.colors.text.primary,
      fontSize: theme.typography.fontSize.sm
    },
    muted: {
      color: theme.colors.text.secondary,
      fontSize: theme.typography.fontSize.sm
    }
  },

  // Navigation styles
  navigation: {
    item: {
      color: theme.colors.text.secondary,
      padding: `${theme.spacing.sm} ${theme.spacing.md}`,
      borderRadius: theme.borderRadius.md,
      transition: theme.transitions.normal,
      cursor: 'pointer',
      ':hover': {
        color: theme.colors.primary,
        background: theme.colors.interactive.secondary
      }
    },
    active: {
      color: theme.colors.primary,
      background: theme.colors.interactive.secondary
    }
  }
};

// Function to replace hardcoded colors with theme colors
export const replaceColors = (styleObject) => {
  const colorMap = {
    '#1e293b': theme.colors.text.primary,
    '#64748b': theme.colors.text.secondary,
    '#94a3b8': theme.colors.text.muted,
    '#3b82f6': theme.colors.primary,
    '#10b981': theme.colors.success,
    '#f59e0b': theme.colors.warning,
    '#ef4444': theme.colors.error,
    '#e2e8f0': theme.colors.border.primary,
    '#f8fafc': theme.colors.interactive.secondary,
    '#ffffff': theme.colors.white,
    '#000000': theme.colors.black
  };

  const newStyle = { ...styleObject };
  
  Object.keys(newStyle).forEach(key => {
    if (typeof newStyle[key] === 'string' && colorMap[newStyle[key]]) {
      newStyle[key] = colorMap[newStyle[key]];
    }
  });

  return newStyle;
};

// Function to create themed component styles
export const createThemedComponent = (baseStyles, variant = 'default') => {
  const themedStyles = {
    ...baseStyles,
    ...getThemedStyles[variant]
  };

  return themedStyles;
};

// Common color replacements for migration
export const colorReplacements = {
  // Text colors
  textPrimary: theme.colors.text.primary,
  textSecondary: theme.colors.text.secondary,
  textMuted: theme.colors.text.muted,
  
  // Background colors
  background: theme.colors.background,
  surface: theme.colors.surface,
  
  // Interactive colors
  primary: theme.colors.primary,
  success: theme.colors.success,
  warning: theme.colors.warning,
  error: theme.colors.error,
  
  // Border colors
  borderPrimary: theme.colors.border.primary,
  borderSecondary: theme.colors.border.secondary,
  borderAccent: theme.colors.border.accent
};

export default {
  getThemedStyles,
  replaceColors,
  createThemedComponent,
  colorReplacements
};
