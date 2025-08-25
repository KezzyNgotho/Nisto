import React from 'react';

// Fallback component for missing icons
const IconFallback = ({ iconName, size = 20, color = "currentColor", ...props }) => {
  // Return a simple div with text as fallback
  return (
    <div
      style={{
        width: size,
        height: size,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: color,
        color: 'white',
        borderRadius: '50%',
        fontSize: size * 0.4,
        fontWeight: 'bold',
        ...props.style
      }}
      {...props}
    >
      {iconName ? iconName.charAt(0).toUpperCase() : '?'}
    </div>
  );
};

export default IconFallback;
