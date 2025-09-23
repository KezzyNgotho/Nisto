// Environment configuration
export const ENV = {
  NODE_ENV: 'production',
  CHROME_EXTENSION_URL: 'https://chrome.google.com/webstore/detail/nesto-ic-wallet/...',
  DEVELOPMENT_URL: 'https://chrome.google.com/webstore/category/extensions',
  MAILGUN_API_KEY: process.env.VITE_MAILGUN_API_KEY || '',
  MAILGUN_DOMAIN: 'sandboxe54ddfa38e1e4b038e06f214d4c2af78.mailgun.org',
  MAILGUN_BASE_URL: 'https://api.mailgun.net'
};
