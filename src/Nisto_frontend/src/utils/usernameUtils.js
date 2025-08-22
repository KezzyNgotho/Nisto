// Username utility functions

// Format username for display
export const formatUsername = (username) => {
  if (!username) return 'Anonymous';
  
  // Remove any special characters and format nicely
  return username
    .replace(/[^a-zA-Z0-9]/g, '')
    .replace(/([A-Z])/g, ' $1')
    .trim()
    .toLowerCase()
    .replace(/\b\w/g, l => l.toUpperCase());
};

// Generate a consistent color based on username
export const getUsernameColor = (username) => {
  if (!username) return '#6b7280';
  
  // Simple hash function to generate consistent colors
  let hash = 0;
  for (let i = 0; i < username.length; i++) {
    hash = username.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  // Generate a color from the hash
  const hue = Math.abs(hash) % 360;
  return `hsl(${hue}, 70%, 60%)`;
};

// Get initials from display name or username
export const getInitials = (displayName, username) => {
  if (displayName) {
    const names = displayName.split(' ');
    if (names.length >= 2) {
      return (names[0][0] + names[names.length - 1][0]).toUpperCase();
    }
    return displayName[0]?.toUpperCase() || '?';
  }
  
  if (username) {
    // For usernames, take first two characters
    return username.slice(0, 2).toUpperCase();
  }
  
  return '?';
};

// Validate username format
export const validateUsername = (username) => {
  if (!username) return { valid: false, error: 'Username is required' };
  
  if (username.length < 3) {
    return { valid: false, error: 'Username must be at least 3 characters' };
  }
  
  if (username.length > 20) {
    return { valid: false, error: 'Username must be less than 20 characters' };
  }
  
  // Only allow alphanumeric characters and underscores
  if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    return { valid: false, error: 'Username can only contain letters, numbers, and underscores' };
  }
  
  return { valid: true };
};

// Generate a unique username suggestion
export const generateUsernameSuggestion = (displayName) => {
  if (!displayName) return 'user_' + Math.random().toString(36).substr(2, 6);
  
  const base = displayName
    .toLowerCase()
    .replace(/[^a-zA-Z0-9]/g, '')
    .substring(0, 10);
  
  const suffix = Math.random().toString(36).substr(2, 4);
  return `${base}_${suffix}`;
};

// Validate display name format
export const validateDisplayName = (displayName) => {
  if (!displayName) return { isValid: false, error: 'Display name is required' };
  
  if (displayName.length < 2) {
    return { isValid: false, error: 'Display name must be at least 2 characters' };
  }
  
  if (displayName.length > 50) {
    return { isValid: false, error: 'Display name must be less than 50 characters' };
  }
  
  // Allow letters, numbers, spaces, and common punctuation
  if (!/^[a-zA-Z0-9\s\-_.,!?'"()]+$/.test(displayName)) {
    return { isValid: false, error: 'Display name contains invalid characters' };
  }
  
  // Check for excessive spaces
  if (displayName.trim() !== displayName) {
    return { isValid: false, error: 'Display name cannot start or end with spaces' };
  }
  
  if (/\s{2,}/.test(displayName)) {
    return { isValid: false, error: 'Display name cannot contain multiple consecutive spaces' };
  }
  
  return { isValid: true };
};
