import { Actor, HttpAgent } from '@dfinity/agent';
import { AuthClient } from '@dfinity/auth-client';
import { Principal } from '@dfinity/principal';
import { sanitizeForSerialization, convertLargeNumbers, sanitizeForAuth } from '../utils/typeUtils';

import { idlFactory } from '../../../declarations/Nisto_backend/Nisto_backend.did.js';

// Auto-detect environment and canister ID
const isLocal = window.location.hostname === 'localhost' || 
               window.location.hostname === '127.0.0.1' ||
               window.location.hostname.includes('localhost');

// Get canister ID from environment or use default
const getCanisterId = () => {
  // Check if we're in a deployed environment
  if (!isLocal) {
    // In production, the canister ID should be available from the dfx deployment
    return import.meta.env.VITE_CANISTER_ID_NISTO_BACKEND || 'uxrrr-q7777-77774-qaaaq-cai';
  }
  
  // In local development, use the environment variable from .env file
  // This is automatically set by dfx when running locally
  return import.meta.env.VITE_CANISTER_ID_NISTO_BACKEND || 'uxrrr-q7777-77774-qaaaq-cai';
};

// Get Internet Identity canister ID
const getInternetIdentityCanisterId = () => {
  if (!isLocal) {
    // In production, use the mainnet Internet Identity
    return 'rdmx6-jaaaa-aaaaa-aaadq-cai';
  }
  
  // In local development, use the local Internet Identity canister
  return import.meta.env.VITE_CANISTER_ID_INTERNET_IDENTITY || 'uzt4z-lp777-77774-qaabq-cai';
};

const CANISTER_ID = getCanisterId();
const INTERNET_IDENTITY_CANISTER_ID = getInternetIdentityCanisterId();

class BackendService {
  constructor() {
    this.authClient = null;
    this.actor = null;
    this.isAuthenticated = false;
    this.identity = null;
    this.principal = null;
  }

  async init() {
    try {
      // Initialize auth client
      this.authClient = await AuthClient.create();
      
      // Check if already authenticated
      const isAuthenticated = await this.authClient.isAuthenticated();
      
      if (isAuthenticated) {
        this.identity = this.authClient.getIdentity();
        this.principal = this.identity.getPrincipal();
        this.isAuthenticated = true;
      }
      
      // Always create actor for both authenticated and unauthenticated operations
      await this.createActor();
      
      return this.isAuthenticated;
    } catch (error) {
      console.error('Failed to initialize backend service:', error);
      return false;
    }
  }

  async createActor() {
    try {
      const agent = new HttpAgent({ 
        identity: this.identity, // Can be null for unauthenticated operations
        host: isLocal ? 'http://localhost:4943' : 'https://ic0.app'
      });

      // Fetch root key for certificate validation in development
      if (isLocal) {
        await agent.fetchRootKey();
      }

      console.log('Creating actor with canister ID:', CANISTER_ID);
      
      this.actor = Actor.createActor(idlFactory, {
        agent,
        canisterId: CANISTER_ID,
      });

      return this.actor;
    } catch (error) {
      console.error('Failed to create actor:', error);
      throw error;
    }
  }

  async ensureActor() {
    if (!this.actor) {
      await this.createActor();
    }
    return this.actor;
  }

  async login() {
    try {
      if (!this.authClient) {
        await this.init();
      }

      return new Promise((resolve, reject) => {
        // Use the correct Internet Identity provider based on environment
        const identityProvider = isLocal 
          ? `http://${INTERNET_IDENTITY_CANISTER_ID}.localhost:4943`
          : 'https://identity.ic0.app';
        
        console.log('Using Internet Identity provider:', identityProvider);
        
        this.authClient.login({
          identityProvider,
          onSuccess: async () => {
            try {
              this.identity = this.authClient.getIdentity();
              this.principal = this.identity.getPrincipal();
              this.isAuthenticated = true;
              
              await this.createActor();
              
              // Auto-create user if they don't exist
              const user = await this.loginOrCreateUser();
              const sanitizedResponse = sanitizeForAuth({ success: true, user });
              resolve(sanitizedResponse);
            } catch (error) {
              console.error('Post-login setup failed:', error);
              reject(error);
            }
          },
          onError: (error) => {
            console.error('Login failed:', error);
            reject(error);
          },
        });
      });
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  async logout() {
    if (this.authClient) {
      await this.authClient.logout();
      this.isAuthenticated = false;
      this.identity = null;
      this.principal = null;
      this.actor = null;
    }
  }

  // User management methods
  async loginOrCreateUser() {
    try {
      const result = await this.actor.loginOrCreateUser();
      if (result.ok) {
        // Convert large numbers (timestamps) to strings for safe serialization
        const user = {
          ...result.ok,
          createdAt: result.ok.createdAt ? result.ok.createdAt.toString() : null,
          updatedAt: result.ok.updatedAt ? result.ok.updatedAt.toString() : null,
          lastLoginAt: result.ok.lastLoginAt ? result.ok.lastLoginAt.toString() : null
        };
        return sanitizeForAuth(user);
      } else {
        throw new Error(result.err);
      }
    } catch (error) {
      console.error('Login or create user failed:', error);
      throw error;
    }
  }

  async getUser() {
    try {
      const result = await this.actor.getUser();
      if (result.ok) {
        // Convert large numbers (timestamps) to strings for safe serialization
        const user = {
          ...result.ok,
          createdAt: result.ok.createdAt ? result.ok.createdAt.toString() : null,
          updatedAt: result.ok.updatedAt ? result.ok.updatedAt.toString() : null,
          lastLoginAt: result.ok.lastLoginAt ? result.ok.lastLoginAt.toString() : null
        };
        return sanitizeForSerialization(user);
      } else {
        throw new Error(result.err);
      }
    } catch (error) {
      console.error('Get user failed:', error);
      throw error;
    }
  }

  async updateUser(displayName, avatar) {
    try {
      const result = await this.actor.updateUser(
        displayName ? [displayName] : [],
        avatar ? [avatar] : []
      );
      if (result.ok) {
        return result.ok;
      } else {
        throw new Error(result.err);
      }
    } catch (error) {
      console.error('Update user failed:', error);
      throw error;
    }
  }

  async userExists() {
    try {
      return await this.actor.userExists();
    } catch (error) {
      console.error('User exists check failed:', error);
      return false;
    }
  }

  async getPrincipalId() {
    try {
      return await this.actor.getPrincipalId();
    } catch (error) {
      console.error('Get principal ID failed:', error);
      throw error;
    }
  }

  // Recovery methods
  async addRecoveryMethod(methodType, value, metadata = null) {
    try {
      await this.ensureActor();
      const result = await this.actor.addRecoveryMethod(
        methodType,
        value,
        metadata ? [metadata] : []
      );
      if (result.ok) {
        return result.ok;
      } else {
        throw new Error(result.err);
      }
    } catch (error) {
      console.error('Add recovery method failed:', error);
      throw error;
    }
  }

  async getUserRecoveryMethods() {
    try {
      await this.ensureActor();
      const result = await this.actor.getUserRecoveryMethods();
      if (result.ok) {
        // Convert large numbers (timestamps) to strings for safe serialization
        const methods = result.ok.map(method => ({
          ...method,
          createdAt: method.createdAt ? method.createdAt.toString() : null,
          verifiedAt: method.verifiedAt ? method.verifiedAt.toString() : null
        }));
        return sanitizeForSerialization(methods);
      } else {
        throw new Error(result.err);
      }
    } catch (error) {
      // Silently handle interface issues and return empty array
      if (error.message && (error.message.includes('has no query method') || error.message.includes('CanisterError'))) {
        return [];
      }
      
      console.error('Get recovery methods failed:', error);
      throw error;
    }
  }

  async addSecurityQuestions(questions) {
    try {
      const result = await this.actor.addSecurityQuestions(questions);
      if (result.ok) {
        return result.ok;
      } else {
        throw new Error(result.err);
      }
    } catch (error) {
      console.error('Add security questions failed:', error);
      throw error;
    }
  }

  async addEmergencyContact(name, email, relationship) {
    try {
      const result = await this.actor.addEmergencyContact(name, email, relationship);
      if (result.ok) {
        return result.ok;
      } else {
        throw new Error(result.err);
      }
    } catch (error) {
      console.error('Add emergency contact failed:', error);
      throw error;
    }
  }

  async completeRecoverySetup() {
    try {
      const result = await this.actor.completeRecoverySetup();
      if (result.ok) {
        return result.ok;
      } else {
        throw new Error(result.err);
      }
    } catch (error) {
      console.error('Complete recovery setup failed:', error);
      throw error;
    }
  }

  // Recovery process methods
  async initiateRecovery(identifier, recoveryMethod) {
    try {
      await this.ensureActor();
      const result = await this.actor.initiateRecovery(identifier, recoveryMethod);
      if (result.ok) {
        return result.ok;
      } else {
        throw new Error(result.err);
      }
    } catch (error) {
      console.error('Initiate recovery failed:', error);
      throw error;
    }
  }

  async verifyRecovery(recoveryRequestId, verificationCode, securityAnswers) {
    try {
      await this.ensureActor();
      const result = await this.actor.verifyRecovery(
        recoveryRequestId,
        verificationCode ? [verificationCode] : [],
        securityAnswers ? [securityAnswers] : []
      );
      if (result.ok) {
        return result.ok;
      } else {
        throw new Error(result.err);
      }
    } catch (error) {
      console.error('Verify recovery failed:', error);
      throw error;
    }
  }

  async completeRecovery(recoveryToken, newDeviceInfo) {
    try {
      await this.ensureActor();
      const result = await this.actor.completeRecovery(
        recoveryToken,
        newDeviceInfo ? [newDeviceInfo] : []
      );
      if (result.ok) {
        return result.ok;
      } else {
        throw new Error(result.err);
      }
    } catch (error) {
      console.error('Complete recovery failed:', error);
      throw error;
    }
  }

  async linkRecoveredAccount(recoveryToken, newPrincipalId) {
    try {
      await this.ensureActor();
      const result = await this.actor.linkRecoveredAccount(recoveryToken, newPrincipalId);
      if (result.ok) {
        return result.ok;
      } else {
        throw new Error(result.err);
      }
    } catch (error) {
      console.error('Link recovered account failed:', error);
      throw error;
    }
  }

  // Crypto Wallets
  async createCryptoWallet(name, currency, isExternal, externalWalletType = null, metadata = null) {
    try {
      await this.ensureActor();
      const result = await this.actor.createCryptoWallet(
        name,
        currency,
        isExternal,
        externalWalletType ? [externalWalletType] : [],
        metadata ? [metadata] : []
      );
      if (result.ok) {
        return result.ok;
      } else {
        throw new Error(result.err);
      }
    } catch (error) {
      console.error('Create crypto wallet failed:', error);
      throw error;
    }
  }

  async getUserCryptoWallets() {
    try {
      await this.ensureActor();
      const result = await this.actor.getUserCryptoWallets();
      if (result.ok) {
        // Convert large numbers (timestamps) to strings for safe serialization
        const wallets = result.ok.map(wallet => ({
          ...wallet,
          createdAt: wallet.createdAt ? wallet.createdAt.toString() : null,
          updatedAt: wallet.updatedAt ? wallet.updatedAt.toString() : null,
          lastSyncAt: wallet.lastSyncAt ? wallet.lastSyncAt.toString() : null
        }));
        return sanitizeForSerialization(wallets);
      } else {
        throw new Error(result.err);
      }
    } catch (error) {
      // Silently handle interface issues and return empty array
      if (error.message && (error.message.includes('has no query method') || error.message.includes('CanisterError'))) {
        return [];
      }
      
      console.error('Get user crypto wallets failed:', error);
      throw error;
    }
  }

  async updateCryptoWalletBalance(walletId, newBalance) {
    try {
      await this.ensureActor();
      const result = await this.actor.updateCryptoWalletBalance(
        walletId,
        newBalance
      );
      if (result.ok) {
        return result.ok;
      } else {
        throw new Error(result.err);
      }
    } catch (error) {
      console.error('Update crypto wallet balance failed:', error);
      throw error;
    }
  }

  // Verification methods
  async sendVerificationCode(identifier, codeType) {
    try {
      await this.ensureActor();
      const result = await this.actor.sendVerificationCode(identifier, codeType);
      if (result.ok) {
        return result.ok;
      } else {
        throw new Error(result.err);
      }
    } catch (error) {
      console.error('Send verification code failed:', error);
      throw error;
    }
  }

  async verifyCode(identifier, code, codeType) {
    try {
      await this.ensureActor();
      const result = await this.actor.verifyCode(identifier, code, codeType);
      if (result.ok) {
        return result.ok;
      } else {
        throw new Error(result.err);
      }
    } catch (error) {
      console.error('Verify code failed:', error);
      throw error;
    }
  }

  // Utility methods
  async getRecoveryRequestStatus(requestId) {
    try {
      await this.ensureActor();
      return await this.actor.getRecoveryRequestStatus(requestId);
    } catch (error) {
      console.error('Get recovery request status failed:', error);
      throw error;
    }
  }

  async greet(name) {
    try {
      return await this.actor.greet(name);
    } catch (error) {
      console.error('Greet failed:', error);
      throw error;
    }
  }

  // Local Payment Methods
  async getUserPaymentMethods() {
    try {
      await this.ensureActor();
      const result = await this.actor.getUserPaymentMethods();
      if (result.ok) {
        return result.ok;
      } else {
        throw new Error(result.err);
      }
    } catch (error) {
      console.error('Get user payment methods failed:', error);
      return [];
    }
  }

  async addPaymentMethod(provider, accountNumber, phoneNumber, accountName, isDefault) {
    try {
      await this.ensureActor();
      const result = await this.actor.addPaymentMethod(
        provider,
        accountNumber ? [accountNumber] : [],
        phoneNumber ? [phoneNumber] : [],
        accountName,
        isDefault
      );
      if (result.ok) {
        return result.ok;
      } else {
        throw new Error(result.err);
      }
    } catch (error) {
      console.error('Add payment method failed:', error);
      throw error;
    }
  }

  async updatePaymentMethod(methodId, accountNumber, phoneNumber, accountName, isDefault) {
    try {
      await this.ensureActor();
      const result = await this.actor.updatePaymentMethod(
        methodId,
        accountNumber ? [accountNumber] : [],
        phoneNumber ? [phoneNumber] : [],
        accountName,
        isDefault
      );
      if (result.ok) {
        return result.ok;
      } else {
        throw new Error(result.err);
      }
    } catch (error) {
      console.error('Update payment method failed:', error);
      throw error;
    }
  }

  async removePaymentMethod(methodId) {
    try {
      await this.ensureActor();
      const result = await this.actor.removePaymentMethod(methodId);
      if (result.ok) {
        return result.ok;
      } else {
        throw new Error(result.err);
      }
    } catch (error) {
      console.error('Remove payment method failed:', error);
      throw error;
    }
  }

  async initiateLocalPayment(provider, type_, amount, currency, recipientPhone, recipientName, reference) {
    try {
      await this.ensureActor();
      const result = await this.actor.initiateLocalPayment(
        provider,
        type_,
        amount,
        currency,
        recipientPhone ? [recipientPhone] : [],
        recipientName ? [recipientName] : [],
        reference ? [reference] : []
      );
      if (result.ok) {
        return result.ok;
      } else {
        throw new Error(result.err);
      }
    } catch (error) {
      console.error('Initiate local payment failed:', error);
      throw error;
    }
  }

  async getUserPaymentHistory() {
    try {
      await this.ensureActor();
      const result = await this.actor.getUserPaymentHistory();
      if (result.ok) {
        return result.ok;
      } else {
        throw new Error(result.err);
      }
    } catch (error) {
      console.error('Get user payment history failed:', error);
      return [];
    }
  }

  // Group Vaults
  async getUserGroupVaults() {
    try {
      await this.ensureActor();
      const result = await this.actor.getUserGroupVaults();
      if (result.ok) {
        return result.ok;
      } else {
        throw new Error(result.err);
      }
    } catch (error) {
      console.error('Get user group vaults failed:', error);
      return [];
    }
  }

  async createGroupVault(name, description, vaultType, currency, targetAmount, isPublic, rules) {
    try {
      await this.ensureActor();
      const result = await this.actor.createGroupVault(
        name,
        description ? [description] : [],
        vaultType,
        currency,
        targetAmount ? [parseFloat(targetAmount)] : [],
        isPublic,
        rules ? [rules] : []
      );
      if (result.ok) {
        return result.ok;
      } else {
        throw new Error(result.err);
      }
    } catch (error) {
      console.error('Create group vault failed:', error);
      throw error;
    }
  }

  async joinGroupVault(vaultId) {
    try {
      await this.ensureActor();
      const result = await this.actor.joinGroupVault(vaultId);
      if (result.ok) {
        return result.ok;
      } else {
        throw new Error(result.err);
      }
    } catch (error) {
      console.error('Join group vault failed:', error);
      throw error;
    }
  }

  // Group Vault Management
  async getVaultDetails(vaultId) {
    try {
      await this.ensureActor();
      const result = await this.actor.getVaultDetails(vaultId);
      if (result.ok) {
        return result.ok;
      } else {
        throw new Error(result.err);
      }
    } catch (error) {
      console.error('Get vault details failed:', error);
      throw error;
    }
  }

  async inviteVaultMember(vaultId, userId, role) {
    try {
      await this.ensureActor();
      const result = await this.actor.inviteVaultMember(vaultId, userId, role);
      if (result.ok) {
        return result.ok;
      } else {
        throw new Error(result.err);
      }
    } catch (error) {
      console.error('Invite vault member failed:', error);
      throw error;
    }
  }

  async toggleVaultPrivacy(vaultId, isPublic) {
    try {
      await this.ensureActor();
      const result = await this.actor.toggleVaultPrivacy(vaultId, isPublic);
      if (result.ok) {
        return result.ok;
      } else {
        throw new Error(result.err);
      }
    } catch (error) {
      console.error('Toggle vault privacy failed:', error);
      throw error;
    }
  }

  async removeVaultMember(vaultId, memberId) {
    try {
      await this.ensureActor();
      const result = await this.actor.removeVaultMember(vaultId, memberId);
      if (result.ok) {
        return result.ok;
      } else {
        throw new Error(result.err);
      }
    } catch (error) {
      console.error('Remove vault member failed:', error);
      throw error;
    }
  }

  async changeVaultMemberRole(vaultId, memberId, newRole) {
    try {
      await this.ensureActor();
      const result = await this.actor.changeVaultMemberRole(vaultId, memberId, newRole);
      if (result.ok) {
        return result.ok;
      } else {
        throw new Error(result.err);
      }
    } catch (error) {
      console.error('Change vault member role failed:', error);
      throw error;
    }
  }

  async editGroupVault(vaultId, fields) {
    try {
      await this.ensureActor();
      const result = await this.actor.editGroupVault(vaultId, fields);
      if (result.ok) {
        return result.ok;
      } else {
        throw new Error(result.err);
      }
    } catch (error) {
      console.error('Edit group vault failed:', error);
      throw error;
    }
  }

  async depositToVault(vaultId, amount, description) {
    try {
      await this.ensureActor();
      const result = await this.actor.depositToVault(
        vaultId,
        parseFloat(amount),
        description ? [description] : []
      );
      if (result.ok) {
        return result.ok;
      } else {
        throw new Error(result.err);
      }
    } catch (error) {
      console.error('Deposit to vault failed:', error);
      throw error;
    }
  }

  async withdrawFromVault(vaultId, amount, description) {
    try {
      await this.ensureActor();
      const result = await this.actor.withdrawFromVault(
        vaultId,
        parseFloat(amount),
        description ? [description] : []
      );
      if (result.ok) {
        return result.ok;
      } else {
        throw new Error(result.err);
      }
    } catch (error) {
      console.error('Withdraw from vault failed:', error);
      throw error;
    }
  }

  async deleteGroupVault(vaultId) {
    try {
      await this.ensureActor();
      const result = await this.actor.deleteGroupVault(vaultId);
      if (result.ok) {
        return result.ok;
      } else {
        throw new Error(result.err);
      }
    } catch (error) {
      console.error('Delete group vault failed:', error);
      throw error;
    }
  }
}

export default BackendService; 