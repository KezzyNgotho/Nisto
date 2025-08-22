// Username utility functions

export const generateUsername = (principal) => {
  if (!principal) return 'user';
  
  const principalStr = principal.toString();
  const shortId = principalStr.slice(0, 8);
  return `user_${shortId}`;
};

export const validateUsername = (username) => {
  if (!username || username.length < 3) return false;
  if (username.length > 20) return false;
  if (!/^[a-zA-Z0-9_]+$/.test(username)) return false;
  return true;
};

export const formatUsername = (username) => {
  if (!username) return '';
  return username.toLowerCase().replace(/[^a-z0-9_]/g, '');
};

export const getDisplayName = (user) => {
  if (!user) return 'Anonymous';
  return user.displayName || user.username || 'Anonymous';
};
