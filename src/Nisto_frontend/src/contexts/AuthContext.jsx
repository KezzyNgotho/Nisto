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

  // BackendService instance
  const backend = React.useRef(new BackendService()).current;

  // Initialize session on mount
  useEffect(() => {
    const init = async () => {
      setIsLoading(true);
      try {
        const authed = await backend.init();
        setIsAuthenticated(authed);
        if (authed) {
          await fetchUser();
          await refreshRecoveryMethods();
          await refreshCryptoWallets();
        }
        setPrincipal(backend.principal ? backend.principal.toString() : null);
      } catch (e) {
        setIsAuthenticated(false);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };
    init();
    // eslint-disable-next-line
  }, []);

  const fetchUser = useCallback(async () => {
    try {
      const userData = await backend.getUser();
      setUser(userData);
    } catch (e) {
      setUser(null);
    }
  }, [backend]);

  const login = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await backend.login();
      setIsAuthenticated(true);
      setPrincipal(backend.principal ? backend.principal.toString() : null);
      await fetchUser();
      await refreshRecoveryMethods();
      await refreshCryptoWallets();
      return result;
    } finally {
      setIsLoading(false);
    }
  }, [backend, fetchUser]);

  const logout = useCallback(async () => {
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

  const refreshRecoveryMethods = useCallback(async () => {
    try {
      const methods = await backend.getUserRecoveryMethods();
      setRecoveryMethods(methods || []);
    } catch {
      setRecoveryMethods([]);
    }
  }, [backend]);

  const refreshCryptoWallets = useCallback(async () => {
    try {
      const wallets = await backend.getUserCryptoWallets();
      setCryptoWallets(wallets || []);
    } catch {
      setCryptoWallets([]);
    }
  }, [backend]);

  // Recovery flows
  const completeRecoverySetup = useCallback(async (...args) => {
    return backend.completeRecoverySetup(...args);
  }, [backend]);

  const initiateRecovery = useCallback(async (...args) => {
    return backend.initiateRecovery(...args);
  }, [backend]);

  const verifyRecovery = useCallback(async (...args) => {
    return backend.verifyRecovery(...args);
  }, [backend]);

  const completeRecovery = useCallback(async (...args) => {
    return backend.completeRecovery(...args);
  }, [backend]);

  const linkRecoveredAccount = useCallback(async (...args) => {
    return backend.linkRecoveredAccount(...args);
  }, [backend]);

  // Add updateCryptoWalletBalance
  const updateCryptoWalletBalance = useCallback(async (walletId, newBalance) => {
    return backend.updateCryptoWalletBalance(walletId, newBalance);
  }, [backend]);

  // Group Vaults
  const getUserGroupVaults = useCallback(async () => {
    return backend.getUserGroupVaults();
  }, [backend]);

  const createGroupVault = useCallback(async (name, description, vaultType, currency, targetAmount, isPublic, rules) => {
    return backend.createGroupVault(name, description, vaultType, currency, targetAmount, isPublic, rules);
  }, [backend]);

  const joinGroupVault = useCallback(async (vaultId) => {
    return backend.joinGroupVault(vaultId);
  }, [backend]);

  // New group vault management methods
  const getVaultDetails = useCallback(async (vaultId) => {
    return backend.getVaultDetails(vaultId);
  }, [backend]);

  const inviteVaultMember = useCallback(async (vaultId, userId, role) => {
    return backend.inviteVaultMember(vaultId, userId, role);
  }, [backend]);

  const toggleVaultPrivacy = useCallback(async (vaultId, isPublic) => {
    return backend.toggleVaultPrivacy(vaultId, isPublic);
  }, [backend]);

  const removeVaultMember = useCallback(async (vaultId, memberId) => {
    return backend.removeVaultMember(vaultId, memberId);
  }, [backend]);

  const changeVaultMemberRole = useCallback(async (vaultId, memberId, newRole) => {
    return backend.changeVaultMemberRole(vaultId, memberId, newRole);
  }, [backend]);

  const editGroupVault = useCallback(async (vaultId, fields) => {
    return backend.editGroupVault(vaultId, fields);
  }, [backend]);

  const depositToVault = useCallback(async (vaultId, amount, description) => {
    return backend.depositToVault(vaultId, amount, description);
  }, [backend]);

  const withdrawFromVault = useCallback(async (vaultId, amount, description) => {
    return backend.withdrawFromVault(vaultId, amount, description);
  }, [backend]);

  const deleteGroupVault = useCallback(async (vaultId) => {
    return backend.deleteGroupVault(vaultId);
  }, [backend]);

  // Vault Action Proposals
  const proposeVaultAction = useCallback(async (vaultId, actionType, targetId = null, newRole = null) => {
    return backend.proposeVaultAction(vaultId, actionType, targetId, newRole);
  }, [backend]);

  const voteVaultAction = useCallback(async (proposalId, approve) => {
    return backend.voteVaultAction(proposalId, approve);
  }, [backend]);

  const appealVaultAction = useCallback(async (proposalId, reason) => {
    return backend.appealVaultAction(proposalId, reason);
  }, [backend]);

  const getVaultProposals = useCallback(async (vaultId) => {
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