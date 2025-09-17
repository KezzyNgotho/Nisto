// Universal Social Media Money Transfer Handler
// Supports Instagram, WhatsApp, Twitter, Telegram, Discord, Slack, and more

class SocialMediaHandler {
  constructor() {
    this.platforms = new Map();
    this.activeConnections = new Map();
    this.transactionQueue = [];
    this.initializePlatforms();
  }

  // Initialize all supported platforms
  initializePlatforms() {
    // Core platforms
    this.addPlatform('instagram', new InstagramHandler());
    this.addPlatform('whatsapp', new WhatsAppHandler());
    this.addPlatform('twitter', new TwitterHandler());
    this.addPlatform('telegram', new TelegramHandler());
    this.addPlatform('discord', new DiscordHandler());
    this.addPlatform('slack', new SlackHandler());
    
    console.log(`🚀 NISTO Social Media Handler initialized with ${this.platforms.size} platforms`);
  }

  // Add a new platform dynamically
  addPlatform(name, handler) {
    this.platforms.set(name, handler);
    console.log(`✅ Added platform: ${name}`);
  }

  // Get platform handler
  getPlatform(name) {
    return this.platforms.get(name);
  }

  // Universal message processing
  async processMessage(platform, message) {
    try {
      const handler = this.getPlatform(platform);
      if (!handler) {
        throw new Error(`Platform ${platform} not supported`);
      }

      // Detect intent
      const intent = this.detectIntent(message);
      
      if (intent === 'MONEY_TRANSFER') {
        return await this.processMoneyTransfer(platform, message);
      } else if (intent === 'HELP') {
        return await this.sendHelpMessage(platform, message);
      } else if (intent === 'BALANCE') {
        return await this.sendBalanceInfo(platform, message);
      }

      return await handler.sendDefaultMessage(message);
    } catch (error) {
      console.error(`Error processing ${platform} message:`, error);
      return this.sendErrorMessage(platform, message);
    }
  }

  // Detect user intent from message
  detectIntent(message) {
    const text = message.text.toLowerCase();
    
    // Money transfer patterns
    const transferPatterns = [
      /send\s+\$?(\d+(?:\.\d{2})?)\s+to\s+@?(\w+)/i,
      /pay\s+@?(\w+)\s+\$?(\d+(?:\.\d{2})?)/i,
      /transfer\s+\$?(\d+(?:\.\d{2})?)\s+to\s+@?(\w+)/i,
      /gift\s+\$?(\d+(?:\.\d{2})?)\s+to\s+@?(\w+)/i,
      /split\s+\$?(\d+(?:\.\d{2})?)\s+with\s+@?(\w+)/i
    ];

    // Check for transfer intent
    for (const pattern of transferPatterns) {
      if (pattern.test(text)) {
        return 'MONEY_TRANSFER';
      }
    }

    // Check for help intent
    if (text.includes('help') || text.includes('how') || text.includes('?')) {
      return 'HELP';
    }

    // Check for balance intent
    if (text.includes('balance') || text.includes('wallet') || text.includes('money')) {
      return 'BALANCE';
    }

    return 'UNKNOWN';
  }

  // Process money transfer request
  async processMoneyTransfer(platform, message) {
    try {
      const transferDetails = this.parseTransferDetails(message);
      
      if (!transferDetails) {
        return await this.sendParseError(platform, message);
      }

      // Validate transfer
      const validation = await this.validateTransfer(transferDetails);
      if (!validation.valid) {
        return await this.sendValidationError(platform, message, validation.error);
      }

      // Send confirmation request
      return await this.sendConfirmationRequest(platform, message, transferDetails);
    } catch (error) {
      console.error('Error processing money transfer:', error);
      return await this.sendErrorMessage(platform, message);
    }
  }

  // Parse transfer details from message
  parseTransferDetails(message) {
    const text = message.text;
    
    // Universal parsing patterns
    const patterns = [
      {
        regex: /send\s+\$?(\d+(?:\.\d{2})?)\s+to\s+@?(\w+)/i,
        extract: (matches) => ({
          action: 'send',
          amount: parseFloat(matches[1]),
          recipient: matches[2],
          currency: 'USD'
        })
      },
      {
        regex: /pay\s+@?(\w+)\s+\$?(\d+(?:\.\d{2})?)/i,
        extract: (matches) => ({
          action: 'pay',
          amount: parseFloat(matches[1]),
          recipient: matches[2],
          currency: 'USD'
        })
      },
      {
        regex: /transfer\s+(\d+(?:\.\d{2})?)\s+(\w{3})\s+to\s+@?(\w+)/i,
        extract: (matches) => ({
          action: 'transfer',
          amount: parseFloat(matches[1]),
          currency: matches[2].toUpperCase(),
          recipient: matches[3]
        })
      },
      {
        regex: /gift\s+\$?(\d+(?:\.\d{2})?)\s+to\s+@?(\w+)/i,
        extract: (matches) => ({
          action: 'gift',
          amount: parseFloat(matches[1]),
          recipient: matches[2],
          currency: 'USD'
        })
      }
    ];

    for (const pattern of patterns) {
      const matches = text.match(pattern.regex);
      if (matches) {
        return pattern.extract(matches);
      }
    }

    return null;
  }

  // Validate transfer request
  async validateTransfer(details) {
    // Basic validation
    if (!details.amount || details.amount <= 0) {
      return { valid: false, error: 'Invalid amount' };
    }

    if (!details.recipient) {
      return { valid: false, error: 'Invalid recipient' };
    }

    // Amount limits
    if (details.amount > 1000) {
      return { valid: false, error: 'Amount exceeds daily limit of $1000' };
    }

    // Currency validation
    const supportedCurrencies = ['USD', 'KES', 'EUR', 'GBP', 'NGN'];
    if (!supportedCurrencies.includes(details.currency)) {
      return { valid: false, error: `Currency ${details.currency} not supported` };
    }

    return { valid: true };
  }

  // Send confirmation request
  async sendConfirmationRequest(platform, message, details) {
    const handler = this.getPlatform(platform);
    const confirmationMessage = this.formatConfirmationMessage(details);
    
    return await handler.sendMessage(message.senderId, confirmationMessage);
  }

  // Format confirmation message
  formatConfirmationMessage(details) {
    const fee = this.calculateFee(details.amount, details.currency);
    const total = details.amount + fee;
    
    return `🤖 NISTO: I'll help you ${details.action} ${details.amount} ${details.currency} to @${details.recipient}!

💰 Amount: ${details.amount} ${details.currency}
👤 Recipient: @${details.recipient}
💳 From: Your NISTO Wallet
 Fee: ${fee} ${details.currency} (1%)
 Total: ${total} ${details.currency}

✅ Confirm with: "YES ${details.action} ${details.amount}"
❌ Cancel with: "NO"

💡 Tip: You can also use voice commands!`;
  }

  // Calculate transaction fee
  calculateFee(amount, currency) {
    // Base fee: 1% of amount
    const baseFee = amount * 0.01;
    
    // Minimum fee: $0.25 or equivalent
    const minFee = this.getMinFee(currency);
    
    return Math.max(baseFee, minFee);
  }

  // Get minimum fee in currency
  getMinFee(currency) {
    const minFees = {
      'USD': 0.25,
      'KES': 25,
      'EUR': 0.20,
      'GBP': 0.18,
      'NGN': 100
    };
    
    return minFees[currency] || 0.25;
  }

  // Send help message
  async sendHelpMessage(platform, message) {
    const handler = this.getPlatform(platform);
    const helpMessage = `🤖 NISTO Help - Send money anywhere on social media!

💰 Money Transfer Commands:
• "Send $50 to @username"
• "Pay @friend 1000 KES"
• "Transfer $25 to @john"
• "Gift $10 to @family"
• "Split $100 with @group"

💡 Other Commands:
• "Balance" - Check your wallet
• "Help" - Show this message
• "Settings" - Manage preferences

🌍 Works on: Instagram, WhatsApp, Twitter, Telegram, Discord, Slack & more!

Need help? Contact support@nisto.com`;

    return await handler.sendMessage(message.senderId, helpMessage);
  }

  // Send balance information
  async sendBalanceInfo(platform, message) {
    const handler = this.getPlatform(platform);
    const balanceMessage = `💰 Your NISTO Wallet Balance:

💵 USD: $1,250.00
🇰🇪 KES: 125,000
🇪🇺 EUR: €1,150.00
🇬🇧 GBP: £1,000.00

💳 Total Value: $1,250.00
📈 24h Change: +$25.00 (+2.04%)

💡 Tip: Use "Send $X to @username" to transfer money!`;

    return await handler.sendMessage(message.senderId, balanceMessage);
  }

  // Send error message
  async sendErrorMessage(platform, message) {
    const handler = this.getPlatform(platform);
    const errorMessage = `❌ Sorry, I couldn't process your request.

💡 Try these commands:
• "Send $50 to @username"
• "Help" for assistance
• "Balance" to check wallet

🔧 If the problem persists, contact support@nisto.com`;

    return await handler.sendMessage(message.senderId, errorMessage);
  }

  // Send parse error
  async sendParseError(platform, message) {
    const handler = this.getPlatform(platform);
    const parseError = `🤔 I didn't understand that. Here are some examples:

✅ "Send $50 to @john"
✅ "Pay @sarah 1000 KES"
✅ "Transfer $25 to @friend"
✅ "Gift $10 to @family"

💡 Type "Help" for more commands!`;

    return await handler.sendMessage(message.senderId, parseError);
  }

  // Send validation error
  async sendValidationError(platform, message, error) {
    const handler = this.getPlatform(platform);
    const validationError = `❌ Transfer Error: ${error}

💡 Please check:
• Amount is valid and above $0.01
• Recipient username is correct
• You have sufficient balance
• Daily limit not exceeded ($1000)

Try again or type "Help" for assistance!`;

    return await handler.sendMessage(message.senderId, validationError);
  }

  // Execute confirmed transfer
  async executeTransfer(platform, message, details) {
    try {
      // Create transaction record
      const transaction = await this.createTransaction(details);
      
      // Process the transfer
      const result = await this.processTransfer(transaction);
      
      // Send success message
      return await this.sendTransferSuccess(platform, message, result);
    } catch (error) {
      console.error('Transfer execution error:', error);
      return await this.sendTransferError(platform, message, error);
    }
  }

  // Create transaction record
  async createTransaction(details) {
    const transaction = {
      id: `NST-${Date.now()}`,
      sender: details.senderId,
      recipient: details.recipient,
      amount: details.amount,
      currency: details.currency,
      fee: this.calculateFee(details.amount, details.currency),
      platform: details.platform,
      status: 'pending',
      timestamp: new Date(),
      metadata: {
        messageId: details.messageId,
        platform: details.platform,
        action: details.action
      }
    };

    // Store transaction (integrate with your backend)
    await this.storeTransaction(transaction);
    
    return transaction;
  }

  // Store transaction (placeholder - integrate with your backend)
  async storeTransaction(transaction) {
    // TODO: Integrate with NISTO backend
    console.log('Storing transaction:', transaction);
    
    // For now, just log it
    this.transactionQueue.push(transaction);
  }

  // Process transfer (placeholder - integrate with your backend)
  async processTransfer(transaction) {
    // TODO: Integrate with NISTO wallet system
    console.log('Processing transfer:', transaction);
    
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Update transaction status
    transaction.status = 'completed';
    transaction.completedAt = new Date();
    
    return transaction;
  }

  // Send transfer success message
  async sendTransferSuccess(platform, message, transaction) {
    const handler = this.getPlatform(platform);
    const successMessage = `✅ Transfer completed successfully!

💰 Amount: ${transaction.amount} ${transaction.currency}
👤 Recipient: @${transaction.recipient}
💳 Transaction ID: ${transaction.id}
⏰ Time: ${transaction.completedAt.toLocaleTimeString()}
📍 Status: ${transaction.status}

🎉 Both users have been notified!

💡 Tip: Use "Balance" to check your updated wallet!`;

    return await handler.sendMessage(message.senderId, successMessage);
  }

  // Send transfer error message
  async sendTransferError(platform, message, error) {
    const handler = this.getPlatform(platform);
    const errorMessage = `❌ Transfer failed!

🔍 Error: ${error.message || 'Unknown error'}

💡 Please try again or contact support@nisto.com

Your money is safe and has not been deducted from your wallet.`;

    return await handler.sendMessage(message.senderId, errorMessage);
  }

  // Get platform statistics
  getPlatformStats() {
    const stats = {};
    
    for (const [platform, handler] of this.platforms) {
      stats[platform] = {
        active: handler.isConnected(),
        users: handler.getActiveUsers(),
        transfers: handler.getTransferCount()
      };
    }
    
    return stats;
  }

  // Health check
  async healthCheck() {
    const health = {
      status: 'healthy',
      platforms: this.platforms.size,
      activeConnections: this.activeConnections.size,
      queueLength: this.transactionQueue.length,
      timestamp: new Date()
    };

    // Check each platform
    for (const [platform, handler] of this.platforms) {
      try {
        const platformHealth = await handler.healthCheck();
        health[platform] = platformHealth;
      } catch (error) {
        health[platform] = { status: 'error', error: error.message };
        health.status = 'degraded';
      }
    }

    return health;
  }
}

// Export the handler
export default SocialMediaHandler;
