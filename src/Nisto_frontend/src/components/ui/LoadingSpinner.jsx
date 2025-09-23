import React from 'react';
import './LoadingSpinner.css';

const LoadingSpinner = ({ 
  size = 'md', 
  color = 'primary', 
  text = '', 
  fullScreen = false,
  className = '' 
}) => {
  const sizeClasses = {
    sm: 'loading-spinner--sm',
    md: 'loading-spinner--md',
    lg: 'loading-spinner--lg',
    xl: 'loading-spinner--xl'
  };

  const colorClasses = {
    primary: 'loading-spinner--primary',
    white: 'loading-spinner--white',
    success: 'loading-spinner--success',
    warning: 'loading-spinner--warning',
    error: 'loading-spinner--error'
  };

  const spinnerClasses = [
    'loading-spinner',
    sizeClasses[size],
    colorClasses[color],
    className
  ].filter(Boolean).join(' ');

  const containerClasses = [
    'loading-container',
    fullScreen && 'loading-container--fullscreen'
  ].filter(Boolean).join(' ');

  return (
    <div className={containerClasses}>
      <div className={spinnerClasses}>
        <div className="loading-spinner__ring">
          <div></div>
          <div></div>
          <div></div>
          <div></div>
        </div>
      </div>
      {text && (
        <p className="loading-text">{text}</p>
      )}
    </div>
  );
};

export default LoadingSpinner;
