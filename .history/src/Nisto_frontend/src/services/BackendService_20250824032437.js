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
    // In production, always use the mainnet canister ID
    console.log('BackendService: Using mainnet canister ID: tp4se-aiaaa-aaaau-abyha-cai');
    return 'tp4se-aiaaa-aaaau-abyha-cai';
  }
  
  // In local development, use the environment variable from .env file
  // This is automatically set by dfx when running locally
  const envCanisterId = import.meta.env.VITE_CANISTER_ID_NISTO_BACKEND || import.meta.env.CANISTER_ID_NISTO_BACKEND;
  if (envCanisterId) {
    console.log('BackendService: Using canister ID from environment:', envCanisterId);
    return envCanisterId;
  }
  
  // Fallback to hardcoded local canister ID
  console.log('BackendService: Using hardcoded local canister ID: bkyz2-fmaaa-aaaaa-qaaaq-cai');
  return 'bkyz2-fmaaa-aaaaa-qaaaq-cai';
};

// Get Internet Identity canister ID
const getInternetIdentityCanisterId = () => {
  if (!isLocal) {
    // In production, use the actual mainnet Internet Identity canister ID
    return 'r3cxq-fiaaa-aaaau-abyja-cai';
  }
  
  // In local development, use the environment variable from .env file
  // This is automatically set by dfx when running locally
  const envIIId = import.meta.env.VITE_CANISTER_ID_INTERNET_IDENTITY || import.meta.env.CANISTER_ID_INTERNET_IDENTITY;
  if (envIIId) {
    console.log('BackendService: Using Internet Identity canister ID from environment:', envIIId);
    return envIIId;
  }
  
  // Fallback to hardcoded local Internet Identity canister ID
  console.log('BackendService: Using hardcoded local Internet Identity canister ID: be2us-64aaa-aaaaa-qaabq-cai');
  return 'be2us-64aaa-aaaaa-qaabq-cai';
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
      console.log('BackendService: Starting initialization...');
      
      // Initialize auth client
      console.log('BackendService: Creating AuthClient...');
      this.authClient = await AuthClient.create();
      console.log('BackendService: AuthClient created successfully');
      
      // Check if already authenticated
      const isAuthenticated = await this.authClient.isAuthenticated();
      console.log('BackendService: User authentication status:', isAuthenticated);
      
      if (isAuthenticated) {
        this.identity = this.authClient.getIdentity();
        this.principal = this.identity.getPrincipal();
        this.isAuthenticated = true;
        console.log('BackendService: User already authenticated with principal:', this.principal.toString());
      }
      
      // Try to create actor, but don't fail if dfx is not running
      try {
        console.log('BackendService: Attempting to create actor...');
      await this.createActor();
        console.log('BackendService: Actor created successfully during initialization');
      } catch (actorError) {
        console.warn('BackendService: Failed to create actor during initialization (dfx may not be running):', actorError);
        // Don't throw the error, just log it - this allows the service to be used later when dfx is running
      }
      
      console.log('BackendService: Initialization completed successfully');
      return this.isAuthenticated;
    } catch (error) {
      console.error('BackendService: Failed to initialize backend service:', error);
      return false;
    }
  }

  async createActor() {
    try {
      console.log('BackendService: Creating actor with canister ID:', CANISTER_ID);
      console.log('BackendService: Using identity:', this.identity ? 'authenticated' : 'anonymous');
      console.log('BackendService: Host:', isLocal ? 'http://localhost:4943' : 'https://ic0.app');
      console.log('BackendService: isLocal value:', isLocal);
      
      const agent = new HttpAgent({ 
        identity: this.identity, // Can be null for unauthenticated operations
        host: isLocal ? 'http://localhost:4943' : 'https://ic0.app'
      });

      // Fetch root key for certificate validation in development
      if (isLocal) {
        console.log('BackendService: Fetching root key for local development...');
        try {
        await agent.fetchRootKey();
          console.log('BackendService: Root key fetched successfully');
        } catch (rootKeyError) {
          console.warn('BackendService: Failed to fetch root key:', rootKeyError);
          // Continue anyway - this might work without root key in some cases
        }
      }

      this.actor = Actor.createActor(idlFactory, {
        agent,
        canisterId: CANISTER_ID,
      });

      console.log('BackendService: Actor created successfully');
      return this.actor;
    } catch (error) {
      console.error('BackendService: Failed to create actor:', error);
      if (error.message.includes('fetch') || error.message.includes('localhost:4943') || error.message.includes('Failed to fetch')) {
        throw new Error('Cannot connect to dfx local network. Please ensure dfx is running with: dfx start --clean --background');
      }
      throw error;
    }
  }

  async ensureActor() {
    try {
    if (!this.actor) {
        console.log('BackendService: Actor not found, creating new actor...');
      await this.createActor();
        console.log('BackendService: Actor created successfully');
      }
      
      // Actor is ready for use
      if (this.actor) {
        console.log('BackendService: Actor ready for use');
      }
      
    return this.actor;
    } catch (error) {
      console.error('BackendService: Failed to ensure actor:', error);
      throw new Error(`Failed to create actor: ${error.message}`);
    }
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
        // Configure Internet Identity provider URL (use canister subdomain locally per IC docs)
        const identityProvider = isLocal 
          ? `http://${INTERNET_IDENTITY_CANISTER_ID}.localhost:4943/#authorize`
          : 'https://identity.ic0.app';
        
        console.log('Initiating Internet Identity login with provider:', identityProvider);
        console.log('INTERNET_IDENTITY_CANISTER_ID value:', INTERNET_IDENTITY_CANISTER_ID);
        console.log('isLocal value:', isLocal);
        
        // Start the Internet Identity login flow
        this.authClient.login({
          identityProvider,
          // Ensure correct origin derivation in local dev to avoid redirect/module load issues
          ...(isLocal ? { derivationOrigin: window.location.origin } : {}),
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
              
              // Create user account if it doesn't exist (only if backend supports it)
              try {
                // Only try to check/create user if the backend supports it
                if (this.supportsMethod('userExists')) {
                  const userExists = await this.userExists();
                  if (!userExists) {
                    console.log('User does not exist, creating user account...');
                    await this.loginOrCreateUser();
                    console.log('User account created successfully');
                  } else {
                    console.log('User already exists');
                  }
                } else {
                  console.log('Backend does not support user management, skipping user creation');
                }
              } catch (userError) {
                console.warn('Failed to check/create user account (this is normal if backend is not fully implemented):', userError.message);
                // Don't fail the login if user creation fails - this is expected in development
              }
              
              // Return success with principal information
              const sanitizedResponse = sanitizeForAuth({ 
                success: true, 
                user: null,
                principal: this.principal.toString()
              });
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
      // Check if the userExists method exists on the actor before calling it
      if (this.supportsMethod('userExists')) {
      return await this.actor.userExists();
      } else {
        console.warn('userExists method not available on actor (this is normal in development)');
        return false;
      }
    } catch (error) {
      // This is expected if the backend canister doesn't have the userExists method implemented
      console.warn('User exists check failed (this is normal in development):', error.message);
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

  // Get the current principal from the authenticated identity
  getCurrentPrincipal() {
    if (this.principal) {
      return this.principal;
    }
    if (this.identity) {
      return this.identity.getPrincipal();
    }
    return null;
  }

  // Check if the backend service is properly initialized
  isInitialized() {
    return this.authClient !== null;
  }

  // Check if the actor is available
  hasActor() {
    return this.actor !== null;
  }

  // Check if the backend supports a specific method
  supportsMethod(methodName) {
    return this.actor && typeof this.actor[methodName] === 'function';
  }

  // Check if dfx is running by testing the connection
  async checkDfxConnection() {
    try {
      const agent = new HttpAgent({ 
        host: isLocal ? 'http://localhost:4943' : 'https://ic0.app'
      });
      
      if (isLocal) {
        await agent.fetchRootKey();
      }
      
      return true;
    } catch (error) {
      console.warn('BackendService: DFX connection check failed:', error);
      return false;
    }
  }

  // Force reinitialize the actor
  async reinitializeActor() {
    console.log('BackendService: Reinitializing actor...');
    this.actor = null;
    try {
      await this.createActor();
      console.log('BackendService: Actor reinitialized successfully');
      return true;
    } catch (error) {
      console.error('BackendService: Failed to reinitialize actor:', error);
      return false;
    }
  }

  // Auto-generate username based on principal
  async generateUsernameFromPrincipal() {
    try {
      const principal = this.getCurrentPrincipal();
      if (!principal) {
        throw new Error('No principal available for username generation');
      }

      // Create a username based on the principal
      const principalText = principal.toString().replace(/[^a-z0-9]/gi, '').slice(0, 8).toLowerCase();
      const generated = `nesto_${principalText}`;
      
      console.log('Generated username from principal:', generated);
      
      // Update the user with the generated username
      const result = await this.updateUser(generated, null);
      console.log('Username updated successfully:', result);
      
      return generated;
    } catch (error) {
      console.error('Failed to generate username from principal:', error);
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
      // Mock implementation for development
      if (error.message && (error.message.includes('has no query method') || error.message.includes('CanisterError'))) {
        console.log('Using mock recovery implementation');
        return {
          recoveryRequestId: `mock-${Date.now()}`,
          message: `Recovery initiated via ${recoveryMethod}. Check your ${recoveryMethod === 'email' ? 'email' : 'phone'} for verification code.`
        };
      }
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
      // Mock implementation for development
      if (error.message && (error.message.includes('has no query method') || error.message.includes('CanisterError'))) {
        console.log('Using mock verification implementation');
        // For mock, accept any 6-digit code or valid security answers
        if (verificationCode && verificationCode.length === 6) {
          return { success: true, message: 'Verification successful' };
        }
        if (securityAnswers && Object.keys(securityAnswers).length > 0) {
          return { success: true, message: 'Security questions verified' };
        }
        throw new Error('Invalid or expired verification code');
      }
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
      // Mock implementation for development
      if (error.message && (error.message.includes('has no query method') || error.message.includes('CanisterError'))) {
        console.log('Using mock completion implementation');
        return { success: true, message: 'Recovery completed successfully' };
      }
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

  async respondToVaultInvitation(vaultId, response) {
    await this.ensureActor();
    try {
      const result = await this.actor.respondToVaultInvitation(vaultId, response);
      if (result.ok) {
        return result;
      } else {
        throw new Error(result.err);
      }
    } catch (error) {
      console.error('Failed to respond to vault invitation:', error);
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
      // Get real-time conversion rates using multiple APIs for accuracy
      
      // Approach 1: Try Binance USDT/NGN rate (often more accurate)
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
          
          // Get real NGN/KES rate from ExchangeRate API
          const ngnKesResponse = await fetch('https://api.exchangerate-api.com/v4/latest/NGN', {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json'
            }
          });
          
          if (ngnKesResponse.ok) {
            const ngnKesData = await ngnKesResponse.json();
            const ngnKesRate = ngnKesData.rates.KES;
            const usdtKesRate = usdtNgnRate * ngnKesRate;
            
            console.log(`Binance NGN Success: 1 USDT = ${usdtNgnRate} NGN = ${usdtKesRate} KES (NGN/KES: ${ngnKesRate})`);
            return usdtKesRate;
          }
        }
      } catch (error) {
        console.log('Binance NGN failed, trying Binance USD...');
      }
      
      // Approach 2: Try Binance USDT/USD rate
      try {
        const response = await fetch('https://api.binance.com/api/v3/ticker/price?symbol=USDTUSD', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          const usdtUsdRate = parseFloat(data.price);
          
          // Get real USD/KES rate from ExchangeRate API
          const usdKesResponse = await fetch('https://api.exchangerate-api.com/v4/latest/USD', {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json'
            }
          });
          
          if (usdKesResponse.ok) {
            const usdKesData = await usdKesResponse.json();
            const usdKesRate = usdKesData.rates.KES;
            const usdtKesRate = usdtUsdRate * usdKesRate;
            
            console.log(`Binance USD Success: 1 USDT = ${usdtUsdRate} USD = ${usdtKesRate} KES (USD/KES: ${usdKesRate})`);
            return usdtKesRate;
          }
        }
      } catch (error) {
        console.log('Binance USD failed, trying CoinGecko...');
      }
      
      // Approach 3: Try to get direct USDT/KES rate from CoinGecko
      try {
        const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=tether&vs_currencies=kes', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data.tether && data.tether.kes) {
            const usdtKesRate = data.tether.kes;
            console.log(`CoinGecko Direct KES Success: 1 USDT = ${usdtKesRate} KES`);
            return usdtKesRate;
          }
        }
      } catch (error) {
        console.log('Direct KES rate failed, trying USD conversion...');
      }
      
      // Approach 2: Get USD rate and convert using real USD/KES rate
      try {
        // Get USDT/USD rate
        const usdtResponse = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=tether&vs_currencies=usd', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        });
        
        if (usdtResponse.ok) {
          const usdtData = await usdtResponse.json();
          const usdtUsdRate = usdtData.tether.usd;
          
          // Get real USD/KES rate from a reliable source
          const usdKesResponse = await fetch('https://api.exchangerate-api.com/v4/latest/USD', {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json'
            }
          });
          
          if (usdKesResponse.ok) {
            const usdKesData = await usdKesResponse.json();
            const usdKesRate = usdKesData.rates.KES;
            const usdtKesRate = usdtUsdRate * usdKesRate;
            
            console.log(`USD Conversion Success: 1 USDT = ${usdtUsdRate} USD = ${usdtKesRate} KES (USD/KES: ${usdKesRate})`);
            return usdtKesRate;
          }
        }
      } catch (error) {
        console.log('USD conversion failed, trying NGN...');
      }
      
      // Approach 3: Try NGN conversion with real NGN/KES rate
      try {
        const ngnResponse = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=tether&vs_currencies=ngn', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        });
        
        if (ngnResponse.ok) {
          const ngnData = await ngnResponse.json();
          const usdtNgnRate = ngnData.tether.ngn;
          
          // Get real NGN/KES rate
          const ngnKesResponse = await fetch('https://api.exchangerate-api.com/v4/latest/NGN', {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json'
            }
          });
          
          if (ngnKesResponse.ok) {
            const ngnKesData = await ngnKesResponse.json();
            const ngnKesRate = ngnKesData.rates.KES;
            const usdtKesRate = usdtNgnRate * ngnKesRate;
            
            console.log(`NGN Conversion Success: 1 USDT = ${usdtNgnRate} NGN = ${usdtKesRate} KES (NGN/KES: ${ngnKesRate})`);
            return usdtKesRate;
          }
        }
      } catch (error) {
        console.log('NGN conversion failed, trying backend...');
      }
      
      // Approach 4: Fallback to backend
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

  async getUserWallets() {
    try {
      const actor = await this.ensureActor();
      const result = await actor.getUserWallets();
      
      if ('ok' in result) {
        return result.ok;
      } else {
        throw new Error(result.err);
      }
    } catch (error) {
      console.error('Error fetching user wallets:', error);
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
      // Use the improved accurate method
      return await this.getUSDTtoKESRate();
    } catch (error) {
      console.error('Error in enhanced rate calculation:', error);
      // Fallback to basic method
      return this.getUSDTtoKESRate();
    }
  }

  // Deposit Methods
  async initiateMpesaDeposit(depositData) {
    try {
      // First, process the deposit in our backend
      const actor = await this.ensureActor();
      const backendResult = await actor.processDeposit({
        kesAmount: depositData.kesAmount,
        usdtAmount: depositData.usdtAmount,
        phoneNumber: depositData.phoneNumber,
        conversionRate: depositData.conversionRate
      });

      // Then initiate real Mpesa STK Push for deposit
      const mpesaResult = await this.initiateMpesaSTKPush(
        depositData.phoneNumber,
        depositData.kesAmount,
        '174379', // Nisto deposit shortcode
        'Nisto Deposit',
        'CustomerPayBillOnline'
      );

      return {
        ...backendResult,
        mpesaCheckoutRequestID: mpesaResult.CheckoutRequestID,
        mpesaMerchantRequestID: mpesaResult.MerchantRequestID,
        mpesaResponseCode: mpesaResult.ResponseCode,
        mpesaResponseDescription: mpesaResult.ResponseDescription,
        mpesaCustomerMessage: mpesaResult.CustomerMessage
      };

    } catch (error) {
      console.error('Error processing deposit with Mpesa:', error);
      throw error;
    }
  }

  async getDepositHistory() {
    try {
      const actor = await this.ensureActor();
      const result = await actor.getDepositHistory();

      if ('ok' in result) {
        return result.ok;
      } else {
        throw new Error(result.err);
      }
    } catch (error) {
      console.error('Error fetching deposit history:', error);
      throw error;
    }
  }

  // Get Daraja API Access Token
  async getDarajaAccessToken() {
    try {
      const proxyBase = import.meta.env.VITE_MPESA_PROXY_URL || '/mpesa';
      const response = await fetch(`${proxyBase}/oauth/token`, { method: 'GET' });
      if (!response.ok) throw new Error('Failed to get Daraja access token');
      const data = await response.json();
      return data.access_token;
    } catch (error) {
      console.error('Error getting Daraja access token:', error);
      throw error;
    }
  }

  // Generate Daraja API Password
  generateDarajaPassword(businessShortCode, passkey, timestamp) {
    const str = businessShortCode + passkey + timestamp;
    return btoa(str);
  }

  // Initiate Mpesa STK Push
  async initiateMpesaSTKPush(phoneNumber, amount, businessShortCode, accountReference, transactionType = 'CustomerPayBillOnline') {
    try {
      const accessToken = await this.getDarajaAccessToken();
      
      // Generate timestamp in required format (YYYYMMDDHHmmss)
      const now = new Date();
      const timestamp = now.getFullYear().toString() +
        (now.getMonth() + 1).toString().padStart(2, '0') +
        now.getDate().toString().padStart(2, '0') +
        now.getHours().toString().padStart(2, '0') +
        now.getMinutes().toString().padStart(2, '0') +
        now.getSeconds().toString().padStart(2, '0');

      // Use sandbox passkey for testing
      const passkey = 'bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919';
      
      const password = this.generateDarajaPassword(businessShortCode, passkey, timestamp);
      
      const stkPushData = {
        BusinessShortCode: businessShortCode,
        Password: password,
        Timestamp: timestamp,
        TransactionType: transactionType,
        Amount: Math.round(amount), // Amount must be integer
        PartyA: phoneNumber,
        PartyB: businessShortCode,
        PhoneNumber: phoneNumber,
        CallBackURL: 'https://your-app.com/mpesa/callback', // Update with your callback URL
        AccountReference: accountReference,
        TransactionDesc: `Payment for ${accountReference}`
      };

      const proxyBase = import.meta.env.VITE_MPESA_PROXY_URL || '/mpesa';
      const response = await fetch(`${proxyBase}/stkpush`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-access-token': accessToken },
        body: JSON.stringify(stkPushData),
      });

      if (response.ok) {
        const result = await response.json();
        return result;
      } else {
        const errorData = await response.json();
        throw new Error(errorData.errorMessage || 'STK Push failed');
      }
    } catch (error) {
      console.error('Error initiating STK Push:', error);
      throw error;
    }
  }

  // B2C payout via proxy
  async initiateMpesaB2CPayout(phoneNumber, amount, remarks = 'Payout', occasion = '', commandId = 'BusinessPayment') {
    try {
      const proxyBase = import.meta.env.VITE_MPESA_PROXY_URL || '/mpesa';
      const response = await fetch(`${proxyBase}/b2c/payment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: phoneNumber, amount, remarks, occasion, commandId })
      });
      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error || 'B2C payout failed');
      }
      return await response.json();
    } catch (error) {
      console.error('Error initiating B2C payout:', error);
      throw error;
    }
  }

  // Enhanced Paybill Payment with real Mpesa integration
  async processPaybillPaymentWithMpesa(paymentData) {
    try {
      // First, process the payment in our backend
      const backendResult = await this.processPaybillPayment(paymentData);
      
      // Then initiate real Mpesa STK Push
      let mpesaResult = null;
      
      if (paymentData.billId === 'send-money') {
        // For send money, use different transaction type
        mpesaResult = await this.initiateMpesaSTKPush(
          paymentData.phoneNumber,
          paymentData.kesAmount,
          '174379', // Mpesa shortcode
          paymentData.recipientName || 'Send Money',
          'CustomerPayBillOnline'
        );
      } else if (paymentData.billId === 'buy-goods') {
        // For buy goods, use buy goods transaction type
        mpesaResult = await this.initiateMpesaSTKPush(
          paymentData.phoneNumber,
          paymentData.kesAmount,
          '174379', // Till number
          paymentData.accountReference || 'Buy Goods',
          'CustomerBuyGoodsOnline'
        );
      } else {
        // For paybill transactions
        mpesaResult = await this.initiateMpesaSTKPush(
          paymentData.phoneNumber,
          paymentData.kesAmount,
          paymentData.paybillNumber || '174379',
          paymentData.accountReference || 'Paybill',
          'CustomerPayBillOnline'
        );
      }
      
      return {
        ...backendResult,
        mpesaCheckoutRequestID: mpesaResult.CheckoutRequestID,
        mpesaMerchantRequestID: mpesaResult.MerchantRequestID,
        mpesaResponseCode: mpesaResult.ResponseCode,
        mpesaResponseDescription: mpesaResult.ResponseDescription,
        mpesaCustomerMessage: mpesaResult.CustomerMessage
      };
      
    } catch (error) {
      console.error('Error processing payment with Mpesa:', error);
      throw error;
    }
  }

  // ===== ENHANCED NOTIFICATION METHODS =====

  // Create notification
  async createNotification(notificationType, title, message, priority, actionUrl, expiresAt) {
    try {
      await this.ensureActor();
      const result = await this.actor.createNotification(notificationType, title, message, priority, actionUrl, expiresAt);
      console.log('BackendService: Notification created:', result);
      return result;
    } catch (error) {
      console.error('BackendService: Failed to create notification:', error);
      throw error;
    }
  }

  // Get user notifications
  async getUserNotifications(limit = 20, offset = 0) {
    try {
      await this.ensureActor();
      console.log('BackendService: Calling actor.getUserNotifications() with limit:', limit, 'offset:', offset);
      const result = await this.actor.getUserNotifications(limit, offset);
      console.log('BackendService: Actor returned:', result);
      console.log('BackendService: Result type:', typeof result);
      console.log('BackendService: Result structure:', JSON.stringify(result, null, 2));
      return result;
    } catch (error) {
      console.error('BackendService: Failed to get notifications:', error);
      throw error;
    }
  }

  // Mark notification as read
  async markNotificationAsRead(notificationId) {
    try {
      await this.ensureActor();
      const result = await this.actor.markNotificationAsRead(notificationId);
      console.log('BackendService: Notification marked as read:', result);
      return result;
    } catch (error) {
      console.error('BackendService: Failed to mark notification as read:', error);
      throw error;
    }
  }

  // Mark all notifications as read
  async markAllNotificationsAsRead() {
    try {
      await this.ensureActor();
      const result = await this.actor.markAllNotificationsAsRead();
      console.log('BackendService: All notifications marked as read:', result);
      return result;
    } catch (error) {
      console.error('BackendService: Failed to mark all notifications as read:', error);
      throw error;
    }
  }

  // Delete notification
  async deleteNotification(notificationId) {
    try {
      await this.ensureActor();
      const result = await this.actor.deleteNotification(notificationId);
      console.log('BackendService: Notification deleted:', result);
      return result;
    } catch (error) {
      console.error('BackendService: Failed to delete notification:', error);
      throw error;
    }
  }

  // Get unread notification count
  async getUnreadNotificationCount() {
    try {
      await this.ensureActor();
      const result = await this.actor.getUnreadNotificationCount();
      console.log('BackendService: Unread notification count:', result);
      // Convert BigInt to number if needed
      return typeof result === 'bigint' ? Number(result) : result;
    } catch (error) {
      console.error('BackendService: Failed to get unread notification count:', error);
      // Return 0 as fallback to prevent UI errors
      return 0;
    }
  }

  // Add push subscription
  async addPushSubscription(subscriptionData) {
    try {
      await this.ensureActor();
      const result = await this.actor.addPushSubscription(subscriptionData);
      console.log('BackendService: Push subscription added:', result);
      return result;
    } catch (error) {
      console.error('BackendService: Failed to add push subscription:', error);
      throw error;
    }
  }

  // Remove push subscription
  async removePushSubscription(subscriptionId) {
    try {
      await this.ensureActor();
      const result = await this.actor.removePushSubscription(subscriptionId);
      console.log('BackendService: Push subscription removed:', result);
      return result;
    } catch (error) {
      console.error('BackendService: Failed to remove push subscription:', error);
      throw error;
    }
  }

  // Update notification preferences
  async updateNotificationPreferences(
    email, push, inApp, transactionNotifications, securityNotifications,
    vaultNotifications, socialNotifications, systemNotifications,
    paymentNotifications, recoveryNotifications, quietHours, timezone
  ) {
    try {
      await this.ensureActor();
      const result = await this.actor.updateNotificationPreferences(
        email, push, inApp, transactionNotifications, securityNotifications,
        vaultNotifications, socialNotifications, systemNotifications,
        paymentNotifications, recoveryNotifications, quietHours, timezone
      );
      console.log('BackendService: Notification preferences updated:', result);
      return result;
    } catch (error) {
      console.error('BackendService: Failed to update notification preferences:', error);
      throw error;
    }
  }

  // Get notification preferences
  async getNotificationPreferences() {
    try {
      await this.ensureActor();
      const result = await this.actor.getNotificationPreferences();
      console.log('BackendService: Retrieved notification preferences:', result);
      return result;
    } catch (error) {
      console.error('BackendService: Failed to get notification preferences:', error);
      throw error;
    }
  }

  // Send cross-canister notification
  async sendCrossCanisterNotification(targetCanisterId, notificationData) {
    try {
      await this.ensureActor();
      const result = await this.actor.sendCrossCanisterNotification(targetCanisterId, notificationData);
      console.log('BackendService: Cross-canister notification sent:', result);
      return result;
    } catch (error) {
      console.error('BackendService: Failed to send cross-canister notification:', error);
      throw error;
    }
  }

  // Get unread notification count
  async getUnreadNotificationCount() {
    try {
      await this.ensureActor();
      console.log('BackendService: Calling actor.getUnreadNotificationCount()');
      const result = await this.actor.getUnreadNotificationCount();
      console.log('BackendService: Actor returned:', result);
      console.log('BackendService: Result type:', typeof result);
      console.log('BackendService: Result structure:', JSON.stringify(result, null, 2));
      return result;
    } catch (error) {
      console.error('BackendService: Failed to get unread notification count:', error);
      throw error;
    }
  }
}

export default BackendService; 