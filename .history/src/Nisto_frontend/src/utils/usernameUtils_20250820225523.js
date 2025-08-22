/**
 * Username utility functions for the Nisto frontend
 */

/**
 * Format a system username (e.g., "duck_sunset_1234") to a readable format
 * @param {string} username - The system username
 * @returns {string} - Formatted username (e.g., "Duck Sunset 1234")
 */
export const formatUsername = (username) => {
  if (!username) return '—';
  return username.split('_').map(part => 
    part.charAt(0).toUpperCase() + part.slice(1)
  ).join(' ');
};

/**
 * Generate a color for a username based on its hash
 * @param {string} username - The username to generate a color for
 * @returns {string} - Hex color code
 */
export const getUsernameColor = (username) => {
  if (!username) return '#6b7280';
  const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];
  const hash = username.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return colors[hash % colors.length];
};

/**
 * Get initials from display name or username
 * @param {string} displayName - User's display name
 * @param {string} username - User's system username
 * @returns {string} - Initials (1-2 characters)
 */
export const getInitials = (displayName, username) => {
  if (displayName) {
    return displayName.split(' ').map(word => word.charAt(0)).join('').toUpperCase().slice(0, 2);
  }
  if (username) {
    return username.split('_')[0].charAt(0).toUpperCase();
  }
  return 'U';
};

/**
 * Validate display name format
 * @param {string} displayName - The display name to validate
 * @returns {object} - Validation result with isValid and error properties
 */
export const validateDisplayName = (displayName) => {
  const trimmed = displayName.trim();
  
  if (!trimmed) {
    return { isValid: false, error: 'Display name cannot be empty' };
  }
  
  if (trimmed.length < 3) {
    return { isValid: false, error: 'Display name must be at least 3 characters' };
  }
  
  if (trimmed.length > 30) {
    return { isValid: false, error: 'Display name must be 30 characters or less' };
  }
  
  if (!/^[-a-zA-Z0-9_\.\s]+$/.test(trimmed)) {
    return { isValid: false, error: 'Use only letters, numbers, spaces, dash, underscore, and dot' };
  }
  
  return { isValid: true, error: null };
};

/**
 * Get a user-friendly display name, falling back to formatted username
 * @param {object} user - User object with displayName and username
 * @returns {string} - User-friendly display name
 */
export const getUserDisplayName = (user) => {
  if (!user) return 'User';
  
  if (user.displayName && user.displayName.trim()) {
    return user.displayName.trim();
  }
  
  if (user.username) {
    return formatUsername(user.username);
  }
  
  return 'User';
};

/**
 * Check if a user has a custom display name set
 * @param {object} user - User object
 * @returns {boolean} - True if user has a custom display name
 */
export const hasCustomDisplayName = (user) => {
  return !!(user?.displayName && user.displayName.trim());
};

/**
 * Generate a short preview of the username for display
 * @param {string} username - The full username
 * @param {number} maxLength - Maximum length for preview
 * @returns {string} - Shortened username preview
 */
export const getUsernamePreview = (username, maxLength = 20) => {
  if (!username) return '—';
  
  if (username.length <= maxLength) {
    return username;
  }
  
  return username.substring(0, maxLength - 3) + '...';
};

/**
 * Extract the animal part from a system username
 * @param {string} username - System username (e.g., "duck_sunset_1234")
 * @returns {string} - Animal name (e.g., "duck")
 */
export const getUsernameAnimal = (username) => {
  if (!username) return '';
  const parts = username.split('_');
  return parts[0] || '';
};

/**
 * Extract the noun part from a system username
 * @param {string} username - System username (e.g., "duck_sunset_1234")
 * @returns {string} - Noun (e.g., "sunset")
 */
export const getUsernameNoun = (username) => {
  if (!username) return '';
  const parts = username.split('_');
  return parts[1] || '';
};

/**
 * Extract the number part from a system username
 * @param {string} username - System username (e.g., "duck_sunset_1234")
 * @returns {string} - Number (e.g., "1234")
 */
export const getUsernameNumber = (username) => {
  if (!username) return '';
  const parts = username.split('_');
  return parts[2] || '';
};

/**
 * Create a user avatar component props object
 * @param {object} user - User object
 * @param {string} size - Size of avatar ('small', 'medium', 'large')
 * @returns {object} - Props for avatar component
 */
export const createAvatarProps = (user, size = 'medium') => {
  const sizeMap = {
    small: 32,
    medium: 40,
    large: 48
  };
  
  return {
    size: sizeMap[size] || 40,
    color: getUsernameColor(user?.username),
    initials: getInitials(user?.displayName, user?.username),
    title: getUserDisplayName(user)
  };
};
