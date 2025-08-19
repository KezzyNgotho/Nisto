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
    return import.meta.env.VITE_CANISTER_ID_NISTO_BACKEND || 'uzt4z-lp777-77774-qaabq-cai';
  }
  
  // In local development, use the environment variable from .env file
  // This is automatically set by dfx when running locally
  return import.meta.env.VITE_CANISTER_ID_NISTO_BACKEND || import.meta.env.CANISTER_ID_NISTO_BACKEND || 'bkyz2-fmaaa-aaaaa-qaaaq-cai';
};

// Get Internet Identity canister ID
const getInternetIdentityCanisterId = () => {
  if (!isLocal) {
    // In production, use the mainnet Internet Identity
    return 'rdmx6-jaaaa-aaaaa-aaadq-cai';
  }
  
  // In local development, use the environment variable from .env file
  // This is automatically set by dfx when running locally
  return import.meta.env.VITE_CANISTER_ID_INTERNET_IDENTITY || import.meta.env.CANISTER_ID_INTERNET_IDENTITY || 'be2us-64aaa-aaaaa-qaabq-cai';
};

const CANISTER_ID = getCanisterId();
const INTERNET_IDENTITY_CANISTER_ID = getInternetIdentityCanisterId();

// Debug logging
console.log('Backend canister ID:', CANISTER_ID);
console.log('Internet Identity canister ID:', INTERNET_IDENTITY_CANISTER_ID);

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
      console.log('Initializing BackendService...');
      
      // Initialize auth client
      this.authClient = await AuthClient.create();
      
      // Check if already authenticated
      const isAuthenticated = await this.authClient.isAuthenticated();
      console.log('User authentication status:', isAuthenticated);
      
      if (isAuthenticated) {
        this.identity = this.authClient.getIdentity();
        this.principal = this.identity.getPrincipal();
        this.isAuthenticated = true;
        console.log('User already authenticated with principal:', this.principal.toString());
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
      console.log('Creating actor with canister ID:', CANISTER_ID);
      console.log('Using identity:', this.identity ? 'authenticated' : 'anonymous');
      
      const agent = new HttpAgent({ 
        identity: this.identity, // Can be null for unauthenticated operations
        host: isLocal ? 'http://localhost:4943' : 'https://ic0.app'
      });

      // Fetch root key for certificate validation in development
      if (isLocal) {
        await agent.fetchRootKey();
        console.log('Root key fetched for local development');
      }

      this.actor = Actor.createActor(idlFactory, {
        agent,
        canisterId: CANISTER_ID,
      });

      console.log('Actor created successfully');
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
      console.log('BackendService.login() called');
      // Initialize auth client if not already done
      if (!this.authClient) {
        console.log('Creating AuthClient...');
        this.authClient = await AuthClient.create();
        console.log('AuthClient created successfully');
      }

      return new Promise((resolve, reject) => {
        // Configure Internet Identity provider URL
        const identityProvider = isLocal 
          ? `http://${INTERNET_IDENTITY_CANISTER_ID}.localhost:4943`
          : 'https://identity.ic0.app';
        
        console.log('Initiating Internet Identity login with provider:', identityProvider);
        console.log('INTERNET_IDENTITY_CANISTER_ID value:', INTERNET_IDENTITY_CANISTER_ID);
        console.log('isLocal value:', isLocal);
        
        // Start the Internet Identity login flow
        this.authClient.login({
          identityProvider,
          maxTimeToLive: BigInt(7 * 24 * 60 * 60 * 1000 * 1000 * 1000), // 7 days in nanoseconds
          onSuccess: async () => {
            try {
              console.log('Internet Identity login successful');
              
              // Get the authenticated identity
              this.identity = this.authClient.getIdentity();
              this.principal = this.identity.getPrincipal();
              this.isAuthenticated = true;
              
              console.log('User principal:', this.principal.toString());
              
              // Create actor with authenticated identity
              await this.createActor();
              
              // Auto-create user account if they don't exist
              const user = await this.loginOrCreateUser();
              const sanitizedResponse = sanitizeForAuth({ success: true, user });
              resolve(sanitizedResponse);
            } catch (error) {
              console.error('Post-login setup failed:', error);
              reject(error);
            }
          },
          onError: (error) => {
            console.error('Internet Identity login failed:', error);
            reject(error);
          },
        });
      });
    } catch (error) {
      console.error('Login initialization failed:', error);
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
  async getUserVaults() {
    await this.ensureActor();
    try {
      return await this.actor.getUserVaults();
    } catch (error) {
      console.error('Failed to get user vaults:', error);
      return [];
    }
  }

  async getUserGroupVaults() {
    await this.ensureActor();
    try {
      const result = await this.actor.getUserGroupVaults();
      return result;
    } catch (error) {
      console.error('Failed to get user group vaults:', error);
      throw error;
    }
  }

  async getPublicVaults() {
    await this.ensureActor();
    try {
      const result = await this.actor.getPublicVaults();
      return result;
    } catch (error) {
      console.error('Failed to get public vaults:', error);
      throw error;
    }
  }

  // New createVault method for the updated backend
  async createVault(name, description, vaultType, currency, isPublic, targetAmount, rules, metadata) {
    await this.ensureActor();
    try {
      const result = await this.actor.createVault(
        name,
        description,
        vaultType,
        currency,
        isPublic,
        targetAmount,
        rules,
        metadata
      );
      return result;
    } catch (error) {
      console.error('Failed to create vault:', error);
      throw error;
    }
  }

  // Group Vault methods
  async createGroupVault(name, description, vaultType, currency, targetAmount, isPublic, rules) {
    await this.ensureActor();
    try {
      const result = await this.actor.createGroupVault(
        name,
        description ? [description] : [],
        vaultType,
        currency,
        targetAmount ? [targetAmount] : [],
        isPublic,
        rules ? [rules] : []
      );
      return result;
    } catch (error) {
      console.error('Failed to create group vault:', error);
      throw error;
    }
  }

  async joinGroupVault(vaultId) {
    await this.ensureActor();
    try {
      const result = await this.actor.joinVault(vaultId);
      return result;
    } catch (error) {
      console.error('Failed to join group vault:', error);
      throw error;
    }
  }

  async getVaultDetails(vaultId) {
    await this.ensureActor();
    try {
      const result = await this.actor.getVaultDetails(vaultId);
      return result;
    } catch (error) {
      console.error('Failed to get vault details:', error);
      throw error;
    }
  }

  async inviteVaultMember(vaultId, userId, role) {
    await this.ensureActor();
    try {
      const result = await this.actor.inviteToVault(vaultId, userId, role);
      if (result.ok) {
        return result;
      } else {
        throw new Error(result.err);
      }
    } catch (error) {
      console.error('Failed to invite vault member:', error);
      throw error;
    }
  }

  async toggleVaultPrivacy(vaultId, isPublic) {
    await this.ensureActor();
    try {
      // For now, return success - implement when toggleVaultPrivacy method is available
      return { ok: { vaultId, isPublic } };
    } catch (error) {
      console.error('Failed to toggle vault privacy:', error);
      throw error;
    }
  }

  async removeVaultMember(vaultId, memberId) {
    await this.ensureActor();
    try {
      const result = await this.actor.removeMember(vaultId, memberId);
      if (result.ok) {
        return result;
      } else {
        throw new Error(result.err);
      }
    } catch (error) {
      console.error('Failed to remove vault member:', error);
      throw error;
    }
  }

  async changeVaultMemberRole(vaultId, memberId, newRole) {
    await this.ensureActor();
    try {
      const result = await this.actor.changeMemberRole(vaultId, memberId, newRole);
      if (result.ok) {
        return result;
      } else {
        throw new Error(result.err);
      }
    } catch (error) {
      console.error('Failed to change vault member role:', error);
      throw error;
    }
  }

  async editGroupVault(vaultId, fields) {
    await this.ensureActor();
    try {
      // For now, return success - implement when editGroupVault method is available
      return { ok: { vaultId, fields, updated: true } };
    } catch (error) {
      console.error('Failed to edit group vault:', error);
      throw error;
    }
  }

  async depositToVault(vaultId, amount, description) {
    await this.ensureActor();
    try {
      const result = await this.actor.depositToVault(vaultId, parseFloat(amount), description ? [description] : []);
      if (result.ok) {
        return result;
      } else {
        throw new Error(result.err);
      }
    } catch (error) {
      console.error('Failed to deposit to vault:', error);
      throw error;
    }
  }

  async withdrawFromVault(vaultId, amount, description) {
    await this.ensureActor();
    try {
      const result = await this.actor.withdrawFromVault(vaultId, parseFloat(amount), description ? [description] : []);
      if (result.ok) {
        return result;
      } else {
        throw new Error(result.err);
      }
    } catch (error) {
      console.error('Failed to withdraw from vault:', error);
      throw error;
    }
  }

  async deleteGroupVault(vaultId) {
    await this.ensureActor();
    try {
      // For now, return success - implement when deleteGroupVault method is available
      return { ok: { vaultId, deleted: true } };
    } catch (error) {
      console.error('Failed to delete group vault:', error);
      throw error;
    }
  }

  async proposeVaultAction(vaultId, actionType, targetId = null, newRole = null) {
    await this.ensureActor();
    try {
      // For now, return success - implement when proposeVaultAction method is available
      return { ok: { vaultId, actionType, targetId, newRole, proposed: true } };
    } catch (error) {
      console.error('Failed to propose vault action:', error);
      throw error;
    }
  }

  async voteVaultAction(proposalId, approve) {
    await this.ensureActor();
    try {
      // For now, return success - implement when voteVaultAction method is available
      return { ok: { proposalId, approve, voted: true } };
    } catch (error) {
      console.error('Failed to vote vault action:', error);
      throw error;
    }
  }

  async appealVaultAction(proposalId, reason) {
    await this.ensureActor();
    try {
      // For now, return success - implement when appealVaultAction method is available
      return { ok: { proposalId, reason, appealed: true } };
    } catch (error) {
      console.error('Failed to appeal vault action:', error);
      throw error;
    }
  }

  async getVaultProposals(vaultId) {
    await this.ensureActor();
    try {
      // For now, return empty array - implement when getVaultProposals method is available
      return { ok: [] };
    } catch (error) {
      console.error('Failed to get vault proposals:', error);
      throw error;
    }
  }

  // ========== VAULT CHAT FUNCTIONS ==========

  async createVaultChatRoom(vaultId, name, description = null) {
    try {
      await this.ensureActor();
      const result = await this.actor.createVaultChatRoom(vaultId, name, description ? [description] : []);
      return result;
    } catch (error) {
      console.error('Failed to create vault chat room:', error);
      throw error;
    }
  }

  async joinVaultChat(vaultId, userName) {
    try {
      await this.ensureActor();
      const result = await this.actor.joinVaultChat(vaultId, userName);
      return result;
    } catch (error) {
      console.error('Failed to join vault chat:', error);
      throw error;
    }
  }

  async sendVaultMessage(vaultId, content, messageType = 'Text', replyTo = null) {
    try {
      await this.ensureActor();
      
      // Convert string messageType to enum format
      let messageTypeEnum;
      switch (messageType) {
        case 'Text':
          messageTypeEnum = { Text: null };
          break;
        case 'System':
          messageTypeEnum = { System: null };
          break;
        case 'Transaction':
          messageTypeEnum = { Transaction: null };
          break;
        case 'Image':
          messageTypeEnum = { Image: null };
          break;
        case 'File':
          messageTypeEnum = { File: null };
          break;
        case 'Reaction':
          messageTypeEnum = { Reaction: null };
          break;
        default:
          messageTypeEnum = { Text: null };
      }
      
      const result = await this.actor.sendVaultMessage(vaultId, content, messageTypeEnum, replyTo ? [replyTo] : []);
      return result;
    } catch (error) {
      console.error('Failed to send vault message:', error);
      throw error;
    }
  }

  async getVaultMessages(vaultId, limit = 50, offset = 0) {
    try {
      await this.ensureActor();
      console.log('Getting vault messages for vaultId:', vaultId);
      console.log('Current principal:', this.principal?.toString());
      console.log('Is authenticated:', this.isAuthenticated);
      
      const result = await this.actor.getVaultMessages(vaultId, limit, offset);
      return result;
    } catch (error) {
      console.error('Failed to get vault messages:', error);
      throw error;
    }
  }

  async updateTypingStatus(vaultId, isTyping) {
    try {
      await this.ensureActor();
      const result = await this.actor.updateTypingStatus(vaultId, isTyping);
      return result;
    } catch (error) {
      console.error('Failed to update typing status:', error);
      throw error;
    }
  }

  async getTypingIndicators(vaultId) {
    try {
      await this.ensureActor();
      const result = await this.actor.getTypingIndicators(vaultId);
      return result;
    } catch (error) {
      console.error('Failed to get typing indicators:', error);
      throw error;
    }
  }

  async markMessagesAsRead(vaultId, messageIds) {
    try {
      await this.ensureActor();
      const result = await this.actor.markMessagesAsRead(vaultId, messageIds);
      return result;
    } catch (error) {
      console.error('Failed to mark messages as read:', error);
      throw error;
    }
  }

  async getUserChatNotifications(limit = 20, offset = 0) {
    try {
      await this.ensureActor();
      const result = await this.actor.getUserChatNotifications(limit, offset);
      return result;
    } catch (error) {
      console.error('Failed to get user chat notifications:', error);
      throw error;
    }
  }

  async leaveVaultChat(vaultId) {
    try {
      await this.ensureActor();
      const result = await this.actor.leaveVaultChat(vaultId);
      return result;
    } catch (error) {
      console.error('Failed to leave vault chat:', error);
      throw error;
    }
  }

  async getVaultChatMembers(vaultId) {
    try {
      await this.ensureActor();
      const result = await this.actor.getVaultChatMembers(vaultId);
      return result;
    } catch (error) {
      console.error('Failed to get vault chat members:', error);
      throw error;
    }
  }

  // ============ NISTO TOKEN FUNCTIONS ============
  
  async getTokenMetadata() {
    try {
      const actor = await this.ensureActor();
      return await actor.getTokenMetadata();
    } catch (error) {
      console.error('Error getting token metadata:', error);
      throw error;
    }
  }

  async balanceOf(owner) {
    try {
      const actor = await this.ensureActor();
      return await actor.balanceOf(owner);
    } catch (error) {
      console.error('Error getting balance:', error);
      throw error;
    }
  }

  async getTotalBalance(owner) {
    try {
      const actor = await this.ensureActor();
      return await actor.getTotalBalance(owner);
    } catch (error) {
      console.error('Error getting total balance:', error);
      throw error;
    }
  }

  async allowance(owner, spender) {
    try {
      const actor = await this.ensureActor();
      return await actor.allowance(owner, spender);
    } catch (error) {
      console.error('Error getting allowance:', error);
      throw error;
    }
  }

  async transfer(to, amount) {
    try {
      const actor = await this.ensureActor();
      return await actor.transfer(to, amount);
    } catch (error) {
      console.error('Error transferring tokens:', error);
      throw error;
    }
  }

  async approve(spender, amount) {
    try {
      const actor = await this.ensureActor();
      return await actor.approve(spender, amount);
    } catch (error) {
      console.error('Error approving tokens:', error);
      throw error;
    }
  }

  async transferFrom(from, to, amount) {
    try {
      const actor = await this.ensureActor();
      return await actor.transferFrom(from, to, amount);
    } catch (error) {
      console.error('Error transferring from:', error);
      throw error;
    }
  }

  async mint(to, amount, reason) {
    try {
      const actor = await this.ensureActor();
      return await actor.mint(to, amount, reason);
    } catch (error) {
      console.error('Error minting tokens:', error);
      throw error;
    }
  }

  async burn(amount, reason) {
    try {
      const actor = await this.ensureActor();
      return await actor.burn(amount, reason);
    } catch (error) {
      console.error('Error burning tokens:', error);
      throw error;
    }
  }

  async stake(amount) {
    try {
      const actor = await this.ensureActor();
      return await actor.stake(amount);
    } catch (error) {
      console.error('Error staking tokens:', error);
      throw error;
    }
  }

  async unstake(amount) {
    try {
      const actor = await this.ensureActor();
      return await actor.unstake(amount);
    } catch (error) {
      console.error('Error unstaking tokens:', error);
      throw error;
    }
  }

  async claimRewards() {
    try {
      const actor = await this.ensureActor();
      return await actor.claimRewards();
    } catch (error) {
      console.error('Error claiming rewards:', error);
      throw error;
    }
  }

  async getStakingInfo(userId) {
    try {
      const actor = await this.ensureActor();
      return await actor.getStakingInfo(userId);
    } catch (error) {
      console.error('Error getting staking info:', error);
      throw error;
    }
  }

  async getTotalStaked() {
    try {
      const actor = await this.ensureActor();
      return await actor.getTotalStaked();
    } catch (error) {
      console.error('Error getting total staked:', error);
      throw error;
    }
  }

  async getTransferHistory(limit = 10, offset = 0) {
    try {
      const actor = await this.ensureActor();
      return await actor.getTransferHistory(limit, offset);
    } catch (error) {
      console.error('Error getting transfer history:', error);
      throw error;
    }
  }

  async getMintHistory(limit = 10, offset = 0) {
    try {
      const actor = await this.ensureActor();
      return await actor.getMintHistory(limit, offset);
    } catch (error) {
      console.error('Error getting mint history:', error);
      throw error;
    }
  }

  async getBurnHistory(limit = 10, offset = 0) {
    try {
      const actor = await this.ensureActor();
      return await actor.getBurnHistory(limit, offset);
    } catch (error) {
      console.error('Error getting burn history:', error);
      throw error;
    }
  }

  // ============ CRUCIAL WALLET TRANSFER FUNCTIONS ============
  
  async sendCrypto(walletId, toAddress, amount, memo = null) {
    try {
      const actor = await this.ensureActor();
      return await actor.sendCrypto(walletId, toAddress, amount, memo);
    } catch (error) {
      console.error('Error sending crypto:', error);
      throw error;
    }
  }

  async transferBetweenWallets(fromWalletId, toWalletId, amount, memo = null) {
    try {
      const actor = await this.ensureActor();
      return await actor.transferBetweenWallets(fromWalletId, toWalletId, amount, memo);
    } catch (error) {
      console.error('Error transferring between wallets:', error);
      throw error;
    }
  }

  async getWalletTransactionHistory(walletId, limit = 20, offset = 0) {
    try {
      const actor = await this.ensureActor();
      return await actor.getWalletTransactionHistory(walletId, limit, offset);
    } catch (error) {
      console.error('Error getting wallet transaction history:', error);
      throw error;
    }
  }

  async updateTransactionStatus(transactionId, status, txHash = null, blockHeight = null) {
    try {
      const actor = await this.ensureActor();
      return await actor.updateTransactionStatus(transactionId, status, txHash, blockHeight);
    } catch (error) {
      console.error('Error updating transaction status:', error);
      throw error;
    }
  }

  async getUserCryptoTransactions() {
    try {
      const actor = await this.ensureActor();
      return await actor.getUserCryptoTransactions();
    } catch (error) {
      console.error('Error getting user crypto transactions:', error);
      throw error;
    }
  }

  // ============ DEPOSIT ADDRESS FUNCTIONS ============
  
  async getDepositAddress(currency) {
    try {
      const actor = await this.ensureActor();
      return await actor.getDepositAddress(currency);
    } catch (error) {
      console.error('Error getting deposit address:', error);
      throw error;
    }
  }

  async getDepositAddresses() {
    try {
      const actor = await this.ensureActor();
      return await actor.getDepositAddresses();
    } catch (error) {
      console.error('Error getting deposit addresses:', error);
      throw error;
    }
  }

  // ============ PAY BILLS FUNCTIONS ============
  
  async getUSDTtoKESRate() {
    try {
      // Try multiple approaches to get the rate
      
      // Approach 1: Try Binance public API (no API key needed for basic price data)
      try {
        const response = await fetch('https://api.binance.com/api/v3/ticker/price?symbol=USDTNGN', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          const usdtNgnRate = parseFloat(data.price);
          
          // Convert NGN to KES (approximate rate: 1 NGN ≈ 0.25 KES)
          const ngnToKesRate = 0.25;
          const usdtKesRate = usdtNgnRate * ngnToKesRate;
          
          console.log(`Binance API Success: 1 USDT = ${usdtNgnRate} NGN = ${usdtKesRate} KES`);
          return usdtKesRate;
        }
      } catch (binanceError) {
        console.log('Binance API failed, trying alternative...');
      }
      
      // Approach 2: Try CoinGecko API (free, no API key needed)
      try {
        const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=tether&vs_currencies=ngn,usd', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          const usdtNgnRate = data.tether.ngn;
          const usdtUsdRate = data.tether.usd;
          
          // Try NGN first, fallback to USD
          if (usdtNgnRate) {
            const ngnToKesRate = 0.25;
            const usdtKesRate = usdtNgnRate * ngnToKesRate;
            console.log(`CoinGecko NGN Success: 1 USDT = ${usdtNgnRate} NGN = ${usdtKesRate} KES`);
            return usdtKesRate;
          } else if (usdtUsdRate) {
            const usdToKesRate = 150; // Approximate USD to KES rate
            const usdtKesRate = usdtUsdRate * usdToKesRate;
            console.log(`CoinGecko USD Success: 1 USDT = ${usdtUsdRate} USD = ${usdtKesRate} KES`);
            return usdtKesRate;
          }
        }
      } catch (coingeckoError) {
        console.log('CoinGecko API failed, trying backend...');
      }
      
      // Approach 3: Fallback to backend
      const actor = await this.ensureActor();
      const result = await actor.getUSDTtoKESRate();
      
      if ('ok' in result) {
        console.log(`Backend fallback: 1 USDT = ${result.ok} KES`);
        return result.ok;
      } else {
        throw new Error(result.err);
      }
      
    } catch (error) {
      console.error('All conversion rate methods failed:', error);
      
      // Final fallback: return a reasonable estimate
      const fallbackRate = 135.50;
      console.log(`Using fallback rate: 1 USDT = ${fallbackRate} KES`);
      return fallbackRate;
    }
  }

  async processPaybillPayment(paymentData) {
    try {
      const actor = await this.ensureActor();
      const result = await actor.processPaybillPayment(paymentData);
      
      if ('ok' in result) {
        return {
          transactionId: result.ok.id,
          mpesaReceipt: result.ok.mpesaReceipt?.[0] || null,
          status: result.ok.status,
          message: 'Payment processed successfully'
        };
      } else {
        throw new Error(result.err);
      }
    } catch (error) {
      console.error('Error processing paybill payment:', error);
      throw new Error('Payment processing failed');
    }
  }

  async getPaybillTransactionHistory() {
    try {
      const actor = await this.ensureActor();
      const result = await actor.getPaybillTransactionHistory();
      
      if ('ok' in result) {
        return result.ok;
      } else {
        throw new Error(result.err);
      }
    } catch (error) {
      console.error('Error fetching paybill transaction history:', error);
      throw error;
    }
  }

  async getAvailableBills() {
    try {
      const actor = await this.ensureActor();
      const result = await actor.getAvailableBills();
      
      if ('ok' in result) {
        return result.ok;
      } else {
        throw new Error(result.err);
      }
    } catch (error) {
      console.error('Error fetching available bills:', error);
      throw error;
    }
  }

  // Enhanced API methods
  async getCryptoRates() {
    try {
      // Try multiple APIs for better reliability
      const rates = {};
      
      // Try Binance public API
      try {
        const symbols = ['USDTNGN', 'USDTUSD', 'BTCUSDT', 'ETHUSDT'];
        for (const symbol of symbols) {
          const response = await fetch(`https://api.binance.com/api/v3/ticker/price?symbol=${symbol}`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json'
            }
          });
          
          if (response.ok) {
            const data = await response.json();
            rates[symbol] = parseFloat(data.price);
          }
        }
      } catch (error) {
        console.log('Binance API failed, trying CoinGecko...');
      }
      
      // Try CoinGecko if Binance failed
      if (Object.keys(rates).length === 0) {
        try {
          const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=tether,bitcoin,ethereum&vs_currencies=ngn,usd', {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json'
            }
          });
          
          if (response.ok) {
            const data = await response.json();
            if (data.tether) {
              rates.USDTNGN = data.tether.ngn;
              rates.USDTUSD = data.tether.usd;
            }
            if (data.bitcoin) {
              rates.BTCUSD = data.bitcoin.usd;
            }
            if (data.ethereum) {
              rates.ETHUSD = data.ethereum.usd;
            }
          }
        } catch (error) {
          console.log('CoinGecko API also failed');
        }
      }
      
      return rates;
    } catch (error) {
      console.error('Error fetching crypto rates:', error);
      return {};
    }
  }

  async getEnhancedUSDTtoKESRate() {
    try {
      const rates = await this.getCryptoRates();
      
      if (rates.USDTNGN) {
        // Use USDT/NGN rate and convert to KES
        const ngnToKesRate = 0.25; // Approximate conversion
        const usdtKesRate = rates.USDTNGN * ngnToKesRate;
        
        console.log(`Enhanced Rate: 1 USDT = ${rates.USDTNGN} NGN = ${usdtKesRate} KES`);
        return usdtKesRate;
      } else if (rates.USDTUSD) {
        // Fallback to USD rate if NGN not available
        const usdToKesRate = 150; // Approximate USD to KES rate
        const usdtKesRate = rates.USDTUSD * usdToKesRate;
        
        console.log(`Fallback Rate: 1 USDT = ${rates.USDTUSD} USD = ${usdtKesRate} KES`);
        return usdtKesRate;
      } else {
        // Fallback to basic method if no rates available
        return this.getUSDTtoKESRate();
      }
    } catch (error) {
      console.error('Error in enhanced rate calculation:', error);
      // Fallback to basic method
      return this.getUSDTtoKESRate();
    }
  }
}

export default BackendService; 