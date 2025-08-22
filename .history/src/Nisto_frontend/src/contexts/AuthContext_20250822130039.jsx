import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import BackendService from '../services/BackendService';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  console.log('🔄 AuthProvider: Initializing...');
  
  const [user, setUser] = useState(null);
  const [principal, setPrincipal] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [recoveryMethods, setRecoveryMethods] = useState([]);
  const [cryptoWallets, setCryptoWallets] = useState([]);

  // BackendService instance - ensure it's properly initialized
  const [backend, setBackend] = useState(null);

  // Perfect Authentication Flow
  // Step 1: Initialize BackendService
  // Step 2: Check DFX Connection
  // Step 3: Create Actor
  // Step 4: Check Authentication Status
  // Step 5: Load User Data (if authenticated)
  // Step 6: Set State

  useEffect(() => {
    const initializeAuthFlow = async () => {
      console.log('🔄 AuthContext: Starting Perfect Authentication Flow...');
      setIsLoading(true);
      
      try {
        // Step 1: Create BackendService
        console.log('📦 Step 1: Creating BackendService...');
        const backendService = new BackendService();
        setBackend(backendService);
        console.log('✅ Step 1: BackendService created successfully');
        
        // Step 2: Initialize BackendService
        console.log('🔧 Step 2: Initializing BackendService...');
        const initResult = await backendService.init();
        console.log('✅ Step 2: BackendService initialized with result:', initResult);
        
        // Step 3: Check if backend is properly initialized
        const isInitialized = backendService.isInitialized();
        console.log('🔍 Step 3: BackendService initialization check:', isInitialized);
        
        if (!isInitialized) {
          throw new Error('BackendService failed to initialize properly');
        }
        
        // Step 4: Check authentication status
        const authed = backendService.isAuthenticated;
        console.log('🔐 Step 4: Authentication status check:', authed);
        setIsAuthenticated(authed);
        
        // Step 5: Set principal
        const principal = backendService.getCurrentPrincipal();
        setPrincipal(principal);
        console.log('🆔 Step 5: Principal set:', principal);
        
        // Step 6: Load user data if authenticated
        if (authed) {
          console.log('👤 Step 6: Loading authenticated user data...');
          await loadUserData(backendService);
        } else {
          console.log('👤 Step 6: No authenticated user, skipping user data load');
          setUser(null);
          setRecoveryMethods([]);
          setCryptoWallets([]);
        }
        
        console.log('🎉 AuthContext: Perfect Authentication Flow completed successfully!');
        
      } catch (error) {
        console.error('❌ AuthContext: Authentication flow failed:', error);
        
        // Create fallback BackendService for retry attempts
        console.log('🔄 AuthContext: Creating fallback BackendService...');
        const fallbackBackendService = new BackendService();
        setBackend(fallbackBackendService);
        setIsAuthenticated(false);
        setUser(null);
        setPrincipal(null);
        setRecoveryMethods([]);
        setCryptoWallets([]);
        
        console.log('⚠️ AuthContext: Fallback BackendService created - retry available');
      } finally {
        setIsLoading(false);
        console.log('🏁 AuthContext: Authentication flow initialization complete');
      }
    };
    
    initializeAuthFlow();
  }, []);

  // Helper function to load user data
  const loadUserData = async (backendService) => {
    try {
      console.log('📥 Loading user data...');
      
      // Load user profile
      const userData = await backendService.getUser();
      setUser(userData);
      console.log('✅ User profile loaded:', userData?.displayName || userData?.username || 'No name');
      
      // Load recovery methods
      const recoveryMethods = await backendService.getUserRecoveryMethods();
      setRecoveryMethods(recoveryMethods || []);
      console.log('✅ Recovery methods loaded:', recoveryMethods?.length || 0, 'methods');
      
      // Load crypto wallets
      const cryptoWallets = await backendService.getUserCryptoWallets();
      setCryptoWallets(cryptoWallets || []);
      console.log('✅ Crypto wallets loaded:', cryptoWallets?.length || 0, 'wallets');
      
    } catch (error) {
      console.error('❌ Failed to load user data:', error);
      setUser(null);
      setRecoveryMethods([]);
      setCryptoWallets([]);
    }
  };

  const fetchUser = useCallback(async (backendService = backend) => {
    if (!backendService) return;
    try {
      let userData = await backendService.getUser();
      setUser(userData);
    } catch (e) {
      setUser(null);
    }
  }, [backend]);

  const refreshRecoveryMethods = useCallback(async (backendService = backend) => {
    if (!backendService) return;
    try {
      const methods = await backendService.getUserRecoveryMethods();
      setRecoveryMethods(methods || []);
    } catch {
      setRecoveryMethods([]);
    }
  }, [backend]);

  const refreshCryptoWallets = useCallback(async (backendService = backend) => {
    if (!backendService) return;
    try {
      const wallets = await backendService.getUserCryptoWallets();
      setCryptoWallets(wallets || []);
    } catch {
      setCryptoWallets([]);
    }
  }, [backend]);

  // Perfect Retry Initialization Flow
  // Step 1: Validate BackendService
  // Step 2: Check DFX Connection
  // Step 3: Reinitialize Actor
  // Step 4: Reinitialize BackendService
  // Step 5: Update Authentication State
  // Step 6: Load User Data (if authenticated)

  const retryInitialization = useCallback(async () => {
    console.log('🔄 AuthContext: Starting Perfect Retry Initialization Flow...');
    setIsLoading(true);
    
    try {
      if (!backend) {
        throw new Error('BackendService not available for retry');
      }
      
      // Step 1: Validate BackendService
      console.log('🔍 Step 1: Validating BackendService for retry...');
      console.log('✅ Step 1: BackendService available for retry');
      
      // Step 2: Check DFX Connection
      console.log('🌐 Step 2: Checking DFX connection...');
      const dfxRunning = await backend.checkDfxConnection();
      console.log('🔍 Step 2: DFX running status:', dfxRunning);
      
      if (!dfxRunning) {
        throw new Error('DFX is not running. Please start dfx with: dfx start --clean --background');
      }
      console.log('✅ Step 2: DFX connection confirmed');
      
      // Step 3: Reinitialize Actor
      console.log('🔧 Step 3: Reinitializing actor...');
      const actorReinitialized = await backend.reinitializeActor();
      console.log('✅ Step 3: Actor reinitialized:', actorReinitialized);
      
      // Step 4: Reinitialize BackendService
      console.log('🔄 Step 4: Reinitializing BackendService...');
      const initResult = await backend.init();
      console.log('✅ Step 4: BackendService reinitialized with result:', initResult);
      
      // Step 5: Update Authentication State
      console.log('🔐 Step 5: Updating authentication state...');
      const isInitialized = backend.isInitialized();
      console.log('🔍 Step 5: BackendService initialization check:', isInitialized);
      
      const authed = backend.isAuthenticated;
      setIsAuthenticated(authed);
      console.log('🔐 Step 5: Authentication status updated:', authed);
      
      const principal = backend.getCurrentPrincipal();
      setPrincipal(principal);
      console.log('🆔 Step 5: Principal updated:', principal);
      
      // Step 6: Load User Data (if authenticated)
      if (authed) {
        console.log('📥 Step 6: Loading user data for authenticated user...');
        await loadUserData(backend);
      } else {
        console.log('👤 Step 6: No authenticated user, clearing user data...');
        setUser(null);
        setRecoveryMethods([]);
        setCryptoWallets([]);
      }
      
      console.log('🎉 AuthContext: Perfect Retry Initialization Flow completed successfully!');
      return initResult;
      
    } catch (error) {
      console.error('❌ AuthContext: Retry initialization flow failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
      console.log('🏁 AuthContext: Retry initialization flow complete');
    }
  }, [backend]);

  // Separate function for generating username - can be called when needed
  const generateUsername = useCallback(async () => {
    if (!backend) return null;
    try {
      // Use the new method from BackendService
      const generated = await backend.generateUsernameFromPrincipal();
      // Refetch user data after update
      await fetchUser();
      return generated;
    } catch (error) {
      console.error('Failed to generate username:', error);
      return null;
    }
  }, [backend, fetchUser]);

  // Perfect Login Flow
  // Step 1: Validate BackendService
  // Step 2: Start Internet Identity Authentication
  // Step 3: Handle Authentication Success
  // Step 4: Load User Data
  // Step 5: Auto-generate Username (if needed)
  // Step 6: Update State

  const login = useCallback(async () => {
    console.log('🔐 AuthContext: Starting Perfect Login Flow...');
    
    if (!backend) {
      throw new Error('BackendService not initialized');
    }
    
    setIsLoading(true);
    
    try {
      // Step 1: Validate BackendService
      console.log('🔍 Step 1: Validating BackendService...');
      const isInitialized = backend.isInitialized();
      if (!isInitialized) {
        throw new Error('BackendService is not properly initialized');
      }
      console.log('✅ Step 1: BackendService validated');
      
      // Step 2: Start Internet Identity Authentication
      console.log('🌐 Step 2: Starting Internet Identity authentication...');
      const result = await backend.login();
      console.log('✅ Step 2: Internet Identity authentication successful');
      
      // Step 3: Handle Authentication Success
      console.log('🎉 Step 3: Authentication successful, updating state...');
      setIsAuthenticated(true);
      
      // Step 4: Set principal
      const principal = backend.getCurrentPrincipal();
      setPrincipal(principal);
      console.log('🆔 Step 4: Principal set:', principal);
      
      // Step 5: Load user data
      console.log('📥 Step 5: Loading user data...');
      await loadUserData(backend);
      
      // Step 6: Auto-generate username if needed
      console.log('👤 Step 6: Checking username generation...');
      try {
        const userData = await backend.getUser();
        if (userData && (!userData.displayName || !userData.username)) {
          console.log('🔄 Step 6: Auto-generating username for new user...');
          await generateUsername();
          console.log('✅ Step 6: Username generated successfully');
        } else {
          console.log('✅ Step 6: User already has username, skipping generation');
        }
      } catch (error) {
        console.warn('⚠️ Step 6: Failed to auto-generate username:', error);
      }
      
      console.log('🎉 AuthContext: Perfect Login Flow completed successfully!');
      return result;
      
    } catch (error) {
      console.error('❌ AuthContext: Login flow failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
      console.log('🏁 AuthContext: Login flow complete');
    }
  }, [backend, generateUsername]);

  const logout = useCallback(async () => {
    if (!backend) return;
    setIsLoading(true);
    try {
      await backend.logout();
      setIsAuthenticated(false);
      setUser(null);
      setPrincipal(null);
      setRecoveryMethods([]);
      setCryptoWallets([]);
    } finally {
      setIsLoading(false);
    }
  }, [backend]);

  // Recovery flows
  const completeRecoverySetup = useCallback(async (...args) => {
    if (!backend) throw new Error('BackendService not initialized');
    return backend.completeRecoverySetup(...args);
  }, [backend]);

  const initiateRecovery = useCallback(async (...args) => {
    if (!backend) throw new Error('BackendService not initialized');
    return backend.initiateRecovery(...args);
  }, [backend]);

  const verifyRecovery = useCallback(async (...args) => {
    if (!backend) throw new Error('BackendService not initialized');
    return backend.verifyRecovery(...args);
  }, [backend]);

  const completeRecovery = useCallback(async (...args) => {
    if (!backend) throw new Error('BackendService not initialized');
    return backend.completeRecovery(...args);
  }, [backend]);

  const linkRecoveredAccount = useCallback(async (...args) => {
    if (!backend) throw new Error('BackendService not initialized');
    return backend.linkRecoveredAccount(...args);
  }, [backend]);

  const getUserRecoveryMethods = useCallback(async () => {
    if (!backend) return [];
    try {
      const result = await backend.getUserRecoveryMethods();
      return result;
    } catch (error) {
      console.error('Failed to get user recovery methods:', error);
      return [];
    }
  }, [backend]);

  const addRecoveryMethod = useCallback(async (methodType, value, metadata = null) => {
    if (!backend) throw new Error('BackendService not initialized');
    try {
      const result = await backend.addRecoveryMethod(methodType, value, metadata);
      return result;
    } catch (error) {
      console.error('Failed to add recovery method:', error);
      throw error;
    }
  }, [backend]);

  // Profile update
  const updateProfile = useCallback(async (displayName, avatar) => {
    if (!backend) throw new Error('BackendService not initialized');
    const result = await backend.updateUser(displayName, avatar);
    await fetchUser();
    return result;
  }, [backend, fetchUser]);

  // Add updateCryptoWalletBalance
  const updateCryptoWalletBalance = useCallback(async (walletId, newBalance) => {
    if (!backend) throw new Error('BackendService not initialized');
    return backend.updateCryptoWalletBalance(walletId, newBalance);
  }, [backend]);

  // Group Vaults
  const getUserGroupVaults = useCallback(async () => {
    if (!backend) return [];
    try {
      const result = await backend.getUserGroupVaults();
      if (result.ok) {
        return result.ok;
      } else {
        console.error('Failed to get user group vaults:', result.err);
        return [];
      }
    } catch (error) {
      console.error('Failed to get user group vaults:', error);
      return [];
    }
  }, [backend]);

  const getPublicVaults = useCallback(async () => {
    if (!backend) return [];
    try {
      const result = await backend.getPublicVaults();
      if (result.ok) {
        return result.ok;
      } else {
        console.error('Failed to get public vaults:', result.err);
        return [];
      }
    } catch (error) {
      console.error('Failed to get public vaults:', error);
      return [];
    }
  }, [backend]);

  const createGroupVault = useCallback(async (name, description, vaultType, currency, targetAmount, isPublic, rules) => {
    if (!backend) throw new Error('BackendService not initialized');
    return backend.createGroupVault(name, description, vaultType, currency, targetAmount, isPublic, rules);
  }, [backend]);

  const joinGroupVault = useCallback(async (vaultId) => {
    if (!backend) throw new Error('BackendService not initialized');
    return backend.joinGroupVault(vaultId);
  }, [backend]);

  // New group vault management methods
  const getVaultDetails = useCallback(async (vaultId) => {
    if (!backend) throw new Error('BackendService not initialized');
    return backend.getVaultDetails(vaultId);
  }, [backend]);

  const inviteVaultMember = useCallback(async (vaultId, userId, role) => {
    if (!backend) throw new Error('BackendService not initialized');
    return backend.inviteVaultMember(vaultId, userId, role);
  }, [backend]);

  const toggleVaultPrivacy = useCallback(async (vaultId, isPublic) => {
    if (!backend) throw new Error('BackendService not initialized');
    return backend.toggleVaultPrivacy(vaultId, isPublic);
  }, [backend]);

  const removeVaultMember = useCallback(async (vaultId, memberId) => {
    if (!backend) throw new Error('BackendService not initialized');
    return backend.removeVaultMember(vaultId, memberId);
  }, [backend]);

  const changeVaultMemberRole = useCallback(async (vaultId, memberId, newRole) => {
    if (!backend) throw new Error('BackendService not initialized');
    return backend.changeVaultMemberRole(vaultId, memberId, newRole);
  }, [backend]);

  const editGroupVault = useCallback(async (vaultId, fields) => {
    if (!backend) throw new Error('BackendService not initialized');
    return backend.editGroupVault(vaultId, fields);
  }, [backend]);

  const depositToVault = useCallback(async (vaultId, amount, description) => {
    if (!backend) throw new Error('BackendService not initialized');
    return backend.depositToVault(vaultId, amount, description);
  }, [backend]);

  const withdrawFromVault = useCallback(async (vaultId, amount, description) => {
    if (!backend) throw new Error('BackendService not initialized');
    return backend.withdrawFromVault(vaultId, amount, description);
  }, [backend]);

  const deleteGroupVault = useCallback(async (vaultId) => {
    if (!backend) throw new Error('BackendService not initialized');
    return backend.deleteGroupVault(vaultId);
  }, [backend]);

  // Vault Action Proposals
  const proposeVaultAction = useCallback(async (vaultId, actionType, targetId = null, newRole = null) => {
    if (!backend) throw new Error('BackendService not initialized');
    return backend.proposeVaultAction(vaultId, actionType, targetId, newRole);
  }, [backend]);

  const voteVaultAction = useCallback(async (proposalId, approve) => {
    if (!backend) throw new Error('BackendService not initialized');
    return backend.voteVaultAction(proposalId, approve);
  }, [backend]);

  const appealVaultAction = useCallback(async (proposalId, reason) => {
    if (!backend) throw new Error('BackendService not initialized');
    return backend.appealVaultAction(proposalId, reason);
  }, [backend]);

  const getVaultProposals = useCallback(async (vaultId) => {
    if (!backend) throw new Error('BackendService not initialized');
    return backend.getVaultProposals(vaultId);
  }, [backend]);

  // Provide all values and functions needed by consumers
  const value = {
    user,
    principal,
    isAuthenticated,
    isLoading,
    login,
    logout,
    retryInitialization,
    completeRecoverySetup,
    recoveryMethods,
    cryptoWallets,
    refreshRecoveryMethods,
    refreshCryptoWallets,
    initiateRecovery,
    verifyRecovery,
    completeRecovery,
    linkRecoveredAccount,
    getUserRecoveryMethods,
    addRecoveryMethod,
    updateCryptoWalletBalance,
    getUserGroupVaults,
    getPublicVaults,
    createGroupVault,
    joinGroupVault,
    getVaultDetails,
    inviteVaultMember,
    toggleVaultPrivacy,
    removeVaultMember,
    changeVaultMemberRole,
    editGroupVault,
    depositToVault,
    withdrawFromVault,
    deleteGroupVault,
    proposeVaultAction,
    voteVaultAction,
    appealVaultAction,
    getVaultProposals,
    backendService: backend, // Add the backend service instance
    backend: backend, // Also provide as 'backend' for consistency
    actor: backend?.actor || null, // Also provide the actor for backward compatibility with null check
    updateProfile,
    generateUsername, // Add the username generation function
  };

  console.log('🔄 AuthProvider: Context value created:', {
    isAuthenticated,
    isLoading,
    hasBackend: !!backend,
    hasUser: !!user
  });

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    console.error('useAuth must be used within an AuthProvider');
    // Return a fallback object to prevent destructuring errors
    return {
      user: null,
      principal: null,
      isAuthenticated: false,
      isLoading: true,
      login: () => Promise.reject(new Error('Auth not initialized')),
      logout: () => Promise.reject(new Error('Auth not initialized')),
      retryInitialization: () => Promise.reject(new Error('Auth not initialized')),
      recoveryMethods: [],
      cryptoWallets: [],
      refreshRecoveryMethods: () => Promise.reject(new Error('Auth not initialized')),
      refreshCryptoWallets: () => Promise.reject(new Error('Auth not initialized')),
      updateProfile: () => Promise.reject(new Error('Auth not initialized')),
      generateUsername: () => Promise.reject(new Error('Auth not initialized')),
      backend: null,
      backendService: null,
      actor: null
    };
  }
  
  return context;
} 