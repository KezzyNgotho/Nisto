import React from 'react';
import { useInstall } from '../contexts/InstallContext';
import { FiDownload } from 'react-icons/fi';

const InstallButton = ({ 
  variant = 'primary', 
  size = 'medium', 
  showIcon = true, 
  children = 'Install Nesto',
  className = '',
  ...props 
}) => {
  const { isInstallable, isLoading, handleInstallClick, showModal } = useInstall();

  if (!isInstallable) {
    return null;
  }

  const handleClick = () => {
    if (variant === 'info' || variant === 'secondary') {
      showModal();
    } else {
      handleInstallClick();
    }
  };

  const buttonClasses = [
    'btn',
    `btn-${variant}`,
    size !== 'medium' && `btn-${size}`,
    className
  ].filter(Boolean).join(' ');

  return (
    <button
      className={buttonClasses}
      onClick={handleClick}
      disabled={isLoading && variant === 'primary'}
      {...props}
    >
      {showIcon && <FiDownload />}
      {isLoading && variant === 'primary' ? 'Installing...' : children}
    </button>
  );
};

export default InstallButton;
