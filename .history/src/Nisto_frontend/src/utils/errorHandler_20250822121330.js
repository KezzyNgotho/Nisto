// Error handling utility for better user feedback
export const getErrorMessage = (error, context = '') => {
  if (!error) return 'An unknown error occurred';
  
  const errorMessage = error.message || error.toString();
  
  // Network/Connection errors
  if (errorMessage.includes('Network') || errorMessage.includes('fetch')) {
    return 'Network connection failed. Please check your internet connection and try again.';
  }
  
  // Authentication errors
  if (errorMessage.includes('authentication') || errorMessage.includes('auth')) {
    return 'Authentication failed. Please log in again.';
  }
  
  // Backend/Canister errors
  if (errorMessage.includes('CanisterError') || errorMessage.includes('has no query method')) {
    return 'Service temporarily unavailable. Please try again later.';
  }
  
  // Recovery method errors
  if (context === 'recovery') {
    if (errorMessage.includes('already exists')) {
      return 'This recovery method is already set up for your account.';
    }
    if (errorMessage.includes('invalid')) {
      return 'Invalid recovery method details. Please check your information and try again.';
    }
    if (errorMessage.includes('verification')) {
      return 'Verification failed. Please check your code and try again.';
    }
  }
  
  // Payment errors
  if (context === 'payment') {
    if (errorMessage.includes('insufficient')) {
      return 'Insufficient funds. Please check your wallet balance.';
    }
    if (errorMessage.includes('invalid amount')) {
      return 'Invalid payment amount. Please enter a valid amount.';
    }
  }
  
  // Wallet errors
  if (context === 'wallet') {
    if (errorMessage.includes('already exists')) {
      return 'This wallet is already connected to your account.';
    }
    if (errorMessage.includes('invalid address')) {
      return 'Invalid wallet address. Please check and try again.';
    }
  }
  
  // Profile errors
  if (context === 'profile') {
    if (errorMessage.includes('username')) {
      return 'Username is already taken. Please choose a different one.';
    }
    if (errorMessage.includes('display name')) {
      return 'Display name contains invalid characters. Please use only letters, numbers, and common punctuation.';
    }
  }
  
  // Generic error messages for common patterns
  if (errorMessage.includes('timeout')) {
    return 'Request timed out. Please try again.';
  }
  
  if (errorMessage.includes('permission') || errorMessage.includes('unauthorized')) {
    return 'You don\'t have permission to perform this action.';
  }
  
  if (errorMessage.includes('not found')) {
    return 'The requested resource was not found.';
  }
  
  // Return the original error message if no specific pattern matches
  return errorMessage;
};

export const getSuccessMessage = (action, context = '') => {
  const messages = {
    recovery: {
      add: 'Recovery method added successfully! Your account is now more secure.',
      verify: 'Recovery method verified successfully!',
      complete: 'Account recovery completed successfully!'
    },
    payment: {
      send: 'Payment sent successfully!',
      receive: 'Payment received successfully!',
      bill: 'Bill payment completed successfully!'
    },
    wallet: {
      add: 'Wallet connected successfully!',
      remove: 'Wallet removed successfully!',
      update: 'Wallet updated successfully!'
    },
    profile: {
      update: 'Profile updated successfully!',
      username: 'Username updated successfully!',
      avatar: 'Profile picture updated successfully!'
    },
    vault: {
      create: 'Vault created successfully!',
      join: 'Joined vault successfully!',
      deposit: 'Deposit completed successfully!',
      withdraw: 'Withdrawal completed successfully!'
    },
    general: {
      save: 'Changes saved successfully!',
      delete: 'Item deleted successfully!',
      create: 'Item created successfully!'
    }
  };
  
  return messages[context]?.[action] || messages.general[action] || 'Action completed successfully!';
};

export const handleError = (error, context = '', showToast = null) => {
  const message = getErrorMessage(error, context);
  console.error(`Error in ${context}:`, error);
  
  if (showToast) {
    showToast({
      message,
      type: 'error',
      icon: '⚠️'
    });
  }
  
  return message;
};

export const handleSuccess = (action, context = '', showToast = null, customMessage = null) => {
  const message = customMessage || getSuccessMessage(action, context);
  
  if (showToast) {
    showToast({
      message,
      type: 'success',
      icon: '✅'
    });
  }
  
  return message;
};
