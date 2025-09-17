const fs = require('fs');
const path = require('path');

// List of canister declarations to fix
const canisters = [
  'MPCService',
  'SwapService'
];

// Function to fix a single declaration file
function fixDeclarationFile(canisterName) {
  const filePath = `src/declarations/${canisterName}/index.js`;
  
  if (!fs.existsSync(filePath)) {
    console.log(`File ${filePath} does not exist, skipping...`);
    return;
  }
  
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Replace process.env with import.meta.env
  content = content.replace(/process\.env\.CANISTER_ID_/g, 'import.meta.env.CANISTER_ID_');
  content = content.replace(/process\.env\.DFX_NETWORK/g, 'import.meta.env.DFX_NETWORK');
  
  // Add fallback canister IDs (these are dummy IDs since these services are now consolidated)
  content = content.replace(
    /import\.meta\.env\.CANISTER_ID_MPCSERVICE;/g,
    'import.meta.env.CANISTER_ID_MPCSERVICE || "dummy-mpc-id";'
  );
  content = content.replace(
    /import\.meta\.env\.CANISTER_ID_SWAPSERVICE;/g,
    'import.meta.env.CANISTER_ID_SWAPSERVICE || "dummy-swap-id";'
  );
  
  fs.writeFileSync(filePath, content);
  console.log(`Fixed ${filePath}`);
}

// Fix all canister declarations
canisters.forEach(fixDeclarationFile);

console.log('All declaration files have been fixed!');
