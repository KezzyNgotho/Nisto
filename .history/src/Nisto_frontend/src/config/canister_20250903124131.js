// NISTO Canister Configuration
// Switch between local development and live environment by commenting/uncommenting

// ===== LOCAL DEVELOPMENT (dfx start) =====
export const LOCAL_CANISTERS = {
  NISTO_BACKEND: 'rrkah-fqaaa-aaaaa-aaaaq-cai', // Replace with your local canister ID
  // Add other local canisters here
};

// ===== LIVE ENVIRONMENT (Mainnet) =====
export const LIVE_CANISTERS = {
  NISTO_BACKEND: 'your_live_canister_id_here', // Replace with your actual live canister ID
  // Add other live canisters here
};

// ===== ENVIRONMENT SELECTION =====
// Set this to 'local' for development, 'live' for production
const ENVIRONMENT = 'local'; // Change this to switch environments

// ===== EXPORTED CONFIGURATION =====
export const CANISTERS = ENVIRONMENT === 'local' ? LOCAL_CANISTERS : LIVE_CANISTERS;

// ===== ENVIRONMENT INFO =====
export const ENV_INFO = {
  current: ENVIRONMENT,
  isLocal: ENVIRONMENT === 'local',
  isLive: ENVIRONMENT === 'live',
  network: ENVIRONMENT === 'local' ? 'local' : 'mainnet'
};

// ===== QUICK SWITCH FUNCTIONS =====
export const switchToLocal = () => {
  console.log('🔄 Switching to LOCAL environment');
  // You can implement dynamic switching here
  return LOCAL_CANISTERS;
};

export const switchToLive = () => {
  console.log('🔄 Switching to LIVE environment');
  // You can implement dynamic switching here
  return LIVE_CANISTERS;
};

// ===== CANISTER ID GETTERS =====
export const getNistoBackendId = () => CANISTERS.NISTO_BACKEND;
export const getCurrentEnvironment = () => ENV_INFO.current;

// ===== VALIDATION =====
export const validateCanisterIds = () => {
  const issues = [];
  
  if (!CANISTERS.NISTO_BACKEND || CANISTERS.NISTO_BACKEND === 'your_live_canister_id_here') {
    issues.push('NISTO_BACKEND canister ID not configured');
  }
  
  if (issues.length > 0) {
    console.warn('⚠️ Canister configuration issues:', issues);
    return false;
  }
  
  console.log(`✅ Canister configuration valid for ${ENVIRONMENT} environment`);
  return true;
};

// ===== USAGE EXAMPLES =====
/*
// In your components/services:
import { CANISTERS, ENV_INFO, getNistoBackendId } from '../config/canister';

// Get canister ID
const backendId = getNistoBackendId();

// Check environment
if (ENV_INFO.isLocal) {
  console.log('Running in local development mode');
}

// Validate configuration
validateCanisterIds();
*/

export default CANISTERS;
