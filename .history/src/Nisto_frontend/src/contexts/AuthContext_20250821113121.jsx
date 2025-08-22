import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import BackendService from '../services/BackendService';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [principal, setPrincipal] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [recoveryMethods, setRecoveryMethods] = useState([]);
  const [cryptoWallets, setCryptoWallets] = useState([]);

  // BackendService instance - ensure it's properly initialized
  const [backend, setBackend] = useState(null);

  // Initialize session on mount
  useEffect(() => {
    const init = async () => {
      console.log('AuthContext: Starting initialization...');
      setIsLoading(true);
      try {
        // Create and initialize BackendService
        console.log('AuthContext: Creating BackendService...');
        const backendService = new BackendService();
        console.log('AuthContext: BackendService created, calling init()...');
        const initResult = await backendService.init();
        console.log('AuthContext: BackendService.init() completed with result:', initResult);
        
        console.log('AuthContext: Setting backend in state...');
        setBackend(backendService);
        
        // Check if backend is properly initialized
        const isInitialized = backendService.isInitialized();
        console.log('AuthContext: BackendService initialized:', isInitialized);
        
        const authed = backendService.isAuthenticated;
        console.log('AuthContext: Authentication status:', authed);
        setIsAuthenticated(authed);
        
        if (authed) {
          console.log('AuthContext: User is authenticated, fetching user data...');
          await fetchUser(backendService);
          await refreshRecoveryMethods(backendService);
          await refreshCryptoWallets(backendService);
        }
        
        const principal = backendService.getCurrentPrincipal();
        setPrincipal(principal);
        console.log('AuthContext: Principal set to:', principal);
        
        console.log('AuthContext: BackendService initialized successfully:', initResult);
      } catch (e) {
        console.error('AuthContext: Failed to initialize BackendService:', e);
        // Still create the backend service even if initialization fails
        // This allows for retry attempts later
        console.log('AuthContext: Creating fallback BackendService...');
        const backendService = new BackendService();
        setBackend(backendService);
        setIsAuthenticated(false);
        setUser(null);
        console.log('AuthContext: Fallback BackendService created and set');
      } finally {
        console.log('AuthContext: Initialization complete, setting isLoading to false');
        setIsLoading(false);
      }
    };
    init();
    // eslint-disable-next-line
  }, []);

  const fetchUser = useCallback(async (backendService = backend) => {
    if (!backendService) return;
    try {
      let userData = await backendService.getUser();
      setUser(userData);
    } catch (e) {
      setUser(null);
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

  const login = useCallback(async () => {
    if (!backend) {
      throw new Error('BackendService not initialized');
    }
    setIsLoading(true);
    try {
      console.log('AuthContext: Starting login process...');
      const result = await backend.login();
      console.log('AuthContext: Login successful, result:', result);
      setIsAuthenticated(true);
      
      // Ensure principal is properly set
      const principal = backend.getCurrentPrincipal();
      setPrincipal(principal);
      console.log('AuthContext: Principal set to:', principal);
      
      await fetchUser();
      await refreshRecoveryMethods();
      await refreshCryptoWallets();
      
      // Auto-generate username if user doesn't have one
      try {
        const userData = await backend.getUser();
        if (userData && (!userData.displayName || !userData.username)) {
          console.log('AuthContext: Auto-generating username for new user...');
          await generateUsername();
        }
      } catch (error) {
        console.warn('AuthContext: Failed to auto-generate username:', error);
      }
      
      console.log('AuthContext: Login process completed successfully');
      return result;
    } catch (error) {
      console.error('AuthContext: Login failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [backend, fetchUser]);

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
    completeRecoverySetup,
    recoveryMethods,
    cryptoWallets,
    refreshRecoveryMethods,
    refreshCryptoWallets,
    initiateRecovery,
    verifyRecovery,
    completeRecovery,
    linkRecoveredAccount,
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
    actor: backend?.actor || null, // Also provide the actor for backward compatibility with null check
    updateProfile,
    generateUsername, // Add the username generation function
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
} 