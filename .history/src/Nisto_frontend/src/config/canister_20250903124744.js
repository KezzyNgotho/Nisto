// NISTO Canister Configuration
// Switch between local development and live environment by commenting/uncommenting

// ===== LOCAL DEVELOPMENT (dfx start) =====
export const LOCAL_CANISTERS = {
  NISTO_BACKEND: 'bkyz2-fmaaa-aaaaa-qaaaq-cai', // Local canister ID from BackendService
  NISTO_FRONTEND: 'ti5uq-nqaaa-aaaau-abyhq-cai', // Local frontend canister ID
  INTERNET_IDENTITY: 'be2us-64aaa-aaaaa-qaabq-cai', // Local Internet Identity canister ID
};

// ===== LIVE ENVIRONMENT (Mainnet) =====
export const LIVE_CANISTERS = {
  NISTO_BACKEND: 'tp4se-aiaaa-aaaau-abyha-cai', // Live backend canister ID from canister_ids.json
  NISTO_FRONTEND: 'ti5uq-nqaaa-aaaau-abyhq-cai', // Live frontend canister ID from canister_ids.json
  INTERNET_IDENTITY: 'r3cxq-fiaaa-aaaau-abyja-cai', // Live Internet Identity canister ID from canister_ids.json
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
