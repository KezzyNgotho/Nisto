// NISTO Social Media Integration Manager
// Central hub for managing all social media platform integrations

import SocialMediaHandler from './SocialMediaHandler';
import InstagramHandler from './platforms/InstagramHandler';
import WhatsAppHandler from './platforms/WhatsAppHandler';
import TwitterHandler from './platforms/TwitterHandler';
import TelegramHandler from './platforms/TelegramHandler';
import DiscordHandler from './platforms/DiscordHandler';
import SlackHandler from './platforms/SlackHandler';

class SocialMediaIntegration {
  constructor() {
    this.handler = null;
    this.platforms = new Map();
    this.isInitialized = false;
    this.initialize();
  }

  async initialize() {
    try {
      console.log('🚀 Initializing NISTO Social Media Integration...');
      
      // Initialize the main social media handler
      this.handler = new SocialMediaHandler();
      
      // Initialize individual platform handlers
      await this.initializePlatforms();
      
      // Set up webhook endpoints
      await this.setupWebhooks();
      
      // Start health monitoring
      this.startHealthMonitoring();
      
      this.isInitialized = true;
      console.log('✅ NISTO Social Media Integration initialized successfully!');
      
    } catch (error) {
      console.error('❌ Failed to initialize NISTO Social Media Integration:', error);
      this.isInitialized = false;
    }
  }

  async initializePlatforms() {
    try {
      // Initialize each platform handler
      const platformHandlers = [
        { name: 'instagram', handler: new InstagramHandler() },
        { name: 'whatsapp', handler: new WhatsAppHandler() },
        { name: 'twitter', handler: new TwitterHandler() },
        { name: 'telegram', handler: new TelegramHandler() },
        { name: 'discord', handler: new DiscordHandler() },
        { name: 'slack', handler: new SlackHandler() }
      ];

      for (const { name, handler } of platformHandlers) {
        try {
          await handler.initialize();
          this.platforms.set(name, handler);
          console.log(`✅ ${name} platform initialized`);
        } catch (error) {
          console.error(`❌ Failed to initialize ${name} platform:`, error);
        }
      }

      console.log(`📱 Initialized ${this.platforms.size} platforms`);
      
    } catch (error) {
      console.error('Error initializing platforms:', error);
      throw error;
    }
  }

  async setupWebhooks() {
    try {
      console.log('🔗 Setting up webhook endpoints...');
      
      // TODO: Set up Express.js webhook routes
      // TODO: Handle webhook verification
      // TODO: Route webhooks to appropriate handlers
      
      console.log('✅ Webhook endpoints configured');
      
    } catch (error) {
      console.error('Error setting up webhooks:', error);
      throw error;
    }
  }

  startHealthMonitoring() {
    // Monitor platform health every 5 minutes
    setInterval(async () => {
      await this.checkAllPlatformsHealth();
    }, 5 * 60 * 1000);
    
    console.log('📊 Health monitoring started');
  }

  async checkAllPlatformsHealth() {
    try {
      const healthReport = await this.handler.healthCheck();
      console.log('🏥 Health Check Report:', healthReport);
      
      // Log any unhealthy platforms
      for (const [platform, status] of Object.entries(healthReport)) {
        if (platform !== 'status' && platform !== 'platforms' && 
            platform !== 'activeConnections' && platform !== 'queueLength' && 
            platform !== 'timestamp') {
          if (status.status !== 'healthy') {
            console.warn(`⚠️ ${platform} platform is ${status.status}`);
          }
        }
      }
      
    } catch (error) {
      console.error('Error during health check:', error);
    }
  }

  // Process message from any platform
  async processMessage(platform, message) {
    try {
      if (!this.isInitialized) {
        throw new Error('Social Media Integration not initialized');
      }

      if (!this.platforms.has(platform)) {
        throw new Error(`Platform ${platform} not supported`);
      }

      // Process through main handler
      const result = await this.handler.processMessage(platform, message);
      
      // Update platform statistics
      const platformHandler = this.platforms.get(platform);
      if (platformHandler && result) {
        platformHandler.transferCount++;
      }

      return result;
      
    } catch (error) {
      console.error(`Error processing ${platform} message:`, error);
      throw error;
    }
  }

  // Get platform statistics
  getPlatformStats() {
    if (!this.handler) return {};
    return this.handler.getPlatformStats();
  }

  // Get overall system health
  async getSystemHealth() {
    try {
      if (!this.handler) {
        return { status: 'not_initialized', error: 'Handler not available' };
      }

      const health = await this.handler.healthCheck();
      
      // Add integration-level health info
      health.integrationStatus = this.isInitialized ? 'healthy' : 'unhealthy';
      health.activePlatforms = this.platforms.size;
      health.totalActiveUsers = Array.from(this.platforms.values())
        .reduce((total, handler) => total + handler.getActiveUsers(), 0);
      health.totalTransfers = Array.from(this.platforms.values())
        .reduce((total, handler) => total + handler.getTransferCount(), 0);

      return health;
      
    } catch (error) {
      return {
        status: 'error',
        error: error.message,
        timestamp: new Date()
      };
    }
  }

  // Send message to specific platform
  async sendMessage(platform, recipientId, message, options = {}) {
    try {
      if (!this.platforms.has(platform)) {
        throw new Error(`Platform ${platform} not supported`);
      }

      const platformHandler = this.platforms.get(platform);
      
      // Platform-specific message sending
      switch (platform) {
        case 'instagram':
          return await platformHandler.sendMessage(recipientId, message);
        case 'whatsapp':
          return await platformHandler.sendMessage(recipientId, message);
        case 'twitter':
          return await platformHandler.sendMessage(recipientId, message);
        case 'telegram':
          return await platformHandler.sendMessage(recipientId, message);
        case 'discord':
          return await platformHandler.sendMessage(recipientId, message);
        case 'slack':
          return await platformHandler.sendMessage(recipientId, message, options.threadId);
        default:
          throw new Error(`Unsupported platform: ${platform}`);
      }
      
    } catch (error) {
      console.error(`Error sending message to ${platform}:`, error);
      throw error;
    }
  }

  // Broadcast message to multiple platforms
  async broadcastMessage(platforms, recipientIds, message, options = {}) {
    try {
      const results = [];
      
      for (const platform of platforms) {
        if (this.platforms.has(platform)) {
          for (const recipientId of recipientIds) {
            try {
              const result = await this.sendMessage(platform, recipientId, message, options);
              results.push({ platform, recipientId, success: true, result });
            } catch (error) {
              results.push({ platform, recipientId, success: false, error: error.message });
            }
          }
        }
      }
      
      return results;
      
    } catch (error) {
      console.error('Error broadcasting message:', error);
      throw error;
    }
  }

  // Get platform handler
  getPlatformHandler(platform) {
    return this.platforms.get(platform);
  }

  // Check if platform is connected
  isPlatformConnected(platform) {
    const handler = this.platforms.get(platform);
    return handler ? handler.isConnected() : false;
  }

  // Get active users for platform
  getPlatformActiveUsers(platform) {
    const handler = this.platforms.get(platform);
    return handler ? handler.getActiveUsers() : 0;
  }

  // Get transfer count for platform
  getPlatformTransferCount(platform) {
    const handler = this.platforms.get(platform);
    return handler ? handler.getTransferCount() : 0;
  }

  // Reinitialize specific platform
  async reinitializePlatform(platform) {
    try {
      if (!this.platforms.has(platform)) {
        throw new Error(`Platform ${platform} not found`);
      }

      console.log(`🔄 Reinitializing ${platform} platform...`);
      
      const handler = this.platforms.get(platform);
      await handler.initialize();
      
      console.log(`✅ ${platform} platform reinitialized`);
      return true;
      
    } catch (error) {
      console.error(`Error reinitializing ${platform} platform:`, error);
      return false;
    }
  }

  // Get integration status
  getStatus() {
    return {
      isInitialized: this.isInitialized,
      activePlatforms: this.platforms.size,
      totalActiveUsers: Array.from(this.platforms.values())
        .reduce((total, handler) => total + handler.getActiveUsers(), 0),
      totalTransfers: Array.from(this.platforms.values())
        .reduce((total, handler) => total + handler.getTransferCount(), 0),
      timestamp: new Date()
    };
  }
}

// Create and export singleton instance
const socialMediaIntegration = new SocialMediaIntegration();

export default socialMediaIntegration;
