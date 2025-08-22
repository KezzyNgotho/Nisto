# Nisto Theme System Guide

## Overview

The Nisto theme system provides a centralized way to manage colors, typography, spacing, and other design tokens across the entire application. The system uses the specified color palette:

- **Primary**: `#113F67` (Dark Blue)
- **White**: `#fff` (Pure White)
- **Black**: `#000000` (Pure Black)

## Quick Start

### 1. Using the Theme in Components

```jsx
import { useTheme } from '../contexts/ThemeContext';
import { theme } from '../utils/theme';

function MyComponent() {
  const { theme } = useTheme();
  
  return (
    <div style={{
      background: theme.colors.background,
      color: theme.colors.text.primary,
      border: `1px solid ${theme.colors.border.primary}`
    }}>
      Hello World
    </div>
  );
}
```

### 2. Using Theme Helpers

```jsx
import { getThemedStyles, replaceColors } from '../utils/themeHelpers';

function MyButton() {
  const buttonStyle = getThemedStyles.button.primary;
  
  return (
    <button style={buttonStyle}>
      Click Me
    </button>
  );
}
```

### 3. Replacing Hardcoded Colors

```jsx
import { replaceColors } from '../utils/themeHelpers';

const oldStyle = {
  color: '#1e293b',
  background: '#ffffff',
  border: '#e2e8f0'
};

const newStyle = replaceColors(oldStyle);
// Result: Uses theme colors instead of hardcoded values
```

## Theme Structure

### Colors

```javascript
theme.colors = {
  primary: '#113F67',        // Main brand color
  white: '#fff',            // Pure white
  black: '#000000',         // Pure black
  
  // Semantic colors
  background: '#fff',
  surface: '#fff',
  
  // Text colors
  text: {
    primary: '#113F67',
    secondary: '#666666',
    muted: '#999999',
    inverse: '#fff'
  },
  
  // Status colors
  success: '#28a745',
  warning: '#ffc107',
  error: '#dc3545',
  info: '#17a2b8',
  
  // Interactive colors
  interactive: {
    primary: '#113F67',
    secondary: '#f8f9fa',
    hover: '#0d2f4f',
    active: '#0a253f',
    disabled: '#e9ecef'
  },
  
  // Border colors
  border: {
    primary: '#dee2e6',
    secondary: '#e9ecef',
    accent: '#113F67'
  },
  
  // Shadow colors
  shadow: {
    light: 'rgba(17, 63, 103, 0.1)',
    medium: 'rgba(17, 63, 103, 0.2)',
    dark: 'rgba(17, 63, 103, 0.3)'
  }
}
```

### Typography

```javascript
theme.typography = {
  fontFamily: {
    primary: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, ...',
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
  }
}
```

### Spacing

```javascript
theme.spacing = {
  xs: '0.25rem',
  sm: '0.5rem',
  md: '1rem',
  lg: '1.5rem',
  xl: '2rem',
  '2xl': '3rem',
  '3xl': '4rem'
}
```

## Migration Guide

### Step 1: Replace Hardcoded Colors

Instead of:
```jsx
<div style={{ color: '#1e293b', background: '#ffffff' }}>
```

Use:
```jsx
<div style={{ color: theme.colors.text.primary, background: theme.colors.background }}>
```

### Step 2: Use Theme Helpers

For common components, use the pre-built styles:

```jsx
import { getThemedStyles } from '../utils/themeHelpers';

// Button
<button style={getThemedStyles.button.primary}>Primary Button</button>
<button style={getThemedStyles.button.secondary}>Secondary Button</button>

// Card
<div style={getThemedStyles.card.container}>
  <div style={getThemedStyles.card.header}>Card Header</div>
  Card Content
</div>

// Input
<input style={getThemedStyles.input.field} placeholder="Enter text..." />
```

### Step 3: Use CSS Variables

The theme system automatically applies CSS variables to the document root:

```css
/* In your CSS/SCSS files */
.my-component {
  background: var(--nisto-background);
  color: var(--nisto-text-primary);
  border: 1px solid var(--nisto-border-primary);
}
```

## Common Color Mappings

| Old Color | New Theme Color |
|-----------|-----------------|
| `#1e293b` | `theme.colors.text.primary` |
| `#64748b` | `theme.colors.text.secondary` |
| `#94a3b8` | `theme.colors.text.muted` |
| `#3b82f6` | `theme.colors.primary` |
| `#10b981` | `theme.colors.success` |
| `#f59e0b` | `theme.colors.warning` |
| `#ef4444` | `theme.colors.error` |
| `#e2e8f0` | `theme.colors.border.primary` |
| `#f8fafc` | `theme.colors.interactive.secondary` |

## Best Practices

1. **Always use theme colors** instead of hardcoded hex values
2. **Use semantic color names** (e.g., `text.primary` instead of `#113F67`)
3. **Leverage the helper functions** for common components
4. **Use CSS variables** in stylesheets when possible
5. **Test with different themes** to ensure consistency

## Adding New Colors

To add new colors to the theme:

1. Add the color to `theme.colors` in `src/utils/theme.js`
2. Add corresponding CSS variables to `cssVariables`
3. Update the color mapping in `themeHelpers.js` if needed

## Example Component Migration

### Before (Hardcoded Colors)
```jsx
function OldComponent() {
  return (
    <div style={{
      background: '#ffffff',
      color: '#1e293b',
      border: '1px solid #e2e8f0',
      padding: '1rem'
    }}>
      <h2 style={{ color: '#3b82f6' }}>Title</h2>
      <p style={{ color: '#64748b' }}>Description</p>
      <button style={{
        background: '#3b82f6',
        color: '#ffffff',
        border: 'none',
        padding: '0.5rem 1rem'
      }}>
        Click Me
      </button>
    </div>
  );
}
```

### After (Using Theme System)
```jsx
import { useTheme } from '../contexts/ThemeContext';
import { getThemedStyles } from '../utils/themeHelpers';

function NewComponent() {
  const { theme } = useTheme();
  
  return (
    <div style={{
      background: theme.colors.background,
      color: theme.colors.text.primary,
      border: `1px solid ${theme.colors.border.primary}`,
      padding: theme.spacing.md
    }}>
      <h2 style={{ color: theme.colors.primary }}>Title</h2>
      <p style={{ color: theme.colors.text.secondary }}>Description</p>
      <button style={getThemedStyles.button.primary}>
        Click Me
      </button>
    </div>
  );
}
```

This theme system ensures consistency across the entire Nisto application while making it easy to maintain and update the design system.
