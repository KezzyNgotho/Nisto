// Environment configuration
const isDevelopment = window.location.hostname === 'localhost' || 
                     window.location.hostname === '127.0.0.1' ||
                     window.location.hostname.includes('.raw.ic0.app');

export const config = {
  isDevelopment,
  isProduction: !isDevelopment,
  chromeExtension: {
    url: isDevelopment 
      ? 'https://chrome.google.com/webstore/category/extensions'
      : 'https://chrome.google.com/webstore/detail/nesto-ic-wallet/...'
  },
  mailgun: {
    apiKey: process.env.VITE_MAILGUN_API_KEY || '',
    domain: process.env.VITE_MAILGUN_DOMAIN || 'sandboxe54ddfa38e1e4b038e06f214d4c2af78.mailgun.org',
    baseUrl: 'https://api.mailgun.net'
  }
};
