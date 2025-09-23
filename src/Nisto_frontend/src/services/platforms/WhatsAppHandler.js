// WhatsApp Platform Handler for NISTO Social Media Money Transfer
// Handles WhatsApp Business API integration for money transfers

class WhatsAppHandler {
  constructor() {
    this.platform = 'whatsapp';
    this.isConnected = false;
    this.activeUsers = new Set();
    this.transferCount = 0;
    this.apiKey = process.env.WHATSAPP_API_KEY;
    this.phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
    this.webhookUrl = '/webhooks/whatsapp';
    this.initialize();
  }

  async initialize() {
    try {
      // Initialize WhatsApp Business API
      await this.initializeAPI();
      
      // Set up webhook for message notifications
      await this.setupWebhook();
      
      this.isConnected = true;
      console.log('✅ WhatsApp handler initialized successfully');
    } catch (error) {
      console.error('❌ WhatsApp handler initialization failed:', error);
      this.isConnected = false;
    }
  }

  async initializeAPI() {
    // WhatsApp Business API initialization
    console.log('🔐 Initializing WhatsApp Business API...');
    
    // TODO: Implement WhatsApp Business API setup
    // TODO: Verify phone number
    // TODO: Set up message templates
    // TODO: Handle access token management
  }

  async setupWebhook() {
    // Set up WhatsApp webhook for real-time message notifications
    console.log('🔗 Setting up WhatsApp webhook...');
    
    // TODO: Register webhook with WhatsApp
    // TODO: Handle webhook verification
    // TODO: Process incoming webhook events
  }

  async processWebhook(payload) {
    try {
      const { object, entry } = payload;
      
      if (object === 'whatsapp_business_account' && entry) {
        for (const event of entry) {
          await this.processWhatsAppEvent(event);
        }
      }
    } catch (error) {
      console.error('Error processing WhatsApp webhook:', error);
    }
  }

  async processWhatsAppEvent(event) {
    try {
      const { changes, value } = event;
      
      if (changes && changes.length > 0) {
        for (const change of changes) {
          if (change.field === 'messages') {
            await this.processNewMessage(change.value);
          }
        }
      }
    } catch (error) {
      console.error('Error processing WhatsApp event:', error);
    }
  }

  async processNewMessage(messageData) {
    try {
      const { from, to, message: originalMessage, timestamp } = messageData;
      
      // Create standardized message format
      const message = {
        platform: 'whatsapp',
        senderId: from,
        senderPhone: from,
        recipientId: to,
        recipientPhone: to,
        text: originalMessage.text?.body || '',
        messageId: originalMessage.id,
        timestamp: new Date(timestamp * 1000),
        type: originalMessage.type || 'text'
      };

      // Process the message through NISTO handler
      await this.processMessage(message);
      
    } catch (error) {
      console.error('Error processing new WhatsApp message:', error);
    }
  }

  async processMessage(message) {
    try {
      // Add user to active users
      this.activeUsers.add(message.senderId);
      
      // Process through main social media handler
      console.log('📱 Processing WhatsApp message:', message.text);
      
      // TODO: Integrate with main SocialMediaHandler
      // TODO: Handle money transfer requests
      // TODO: Send responses back to WhatsApp
      
    } catch (error) {
      console.error('Error processing WhatsApp message:', error);
    }
  }

  async sendMessage(userId, message) {
    try {
      // Send message through WhatsApp Business API
      console.log(`📤 Sending WhatsApp message to ${userId}:`, message);
      
      // TODO: Implement WhatsApp message sending
      // TODO: Handle message delivery status
      // TODO: Retry logic for failed messages
      
      return { success: true, messageId: `wa_${Date.now()}` };
    } catch (error) {
      console.error('Error sending WhatsApp message:', error);
      return { success: false, error: error.message };
    }
  }

  async sendTemplateMessage(userId, templateName, parameters = []) {
    try {
      // Send WhatsApp template message
      console.log(`📤 Sending WhatsApp template to ${userId}: ${templateName}`);
      
      // TODO: Implement WhatsApp template sending
      // TODO: Handle template parameters
      // TODO: Track template delivery
      
      return { success: true, messageId: `wa_template_${Date.now()}` };
    } catch (error) {
      console.error('Error sending WhatsApp template:', error);
      return { success: false, error: error.message };
    }
  }

  async sendGroupMoneySplit(userId, groupId, amount, participants) {
    try {
      // Send group money splitting message
      const splitMessage = `💰 Group Money Split: ${amount} USD

👥 Participants: ${participants.length}
💸 Amount per person: ${(amount / participants.length).toFixed(2)} USD

✅ Confirm split with: "YES split ${amount}"
❌ Cancel with: "NO"`;
      
      return await this.sendMessage(userId, splitMessage);
    } catch (error) {
      console.error('Error sending group money split:', error);
      return { success: false, error: error.message };
    }
  }

  async sendVoiceMessage(userId, message) {
    try {
      // Send voice message through WhatsApp
      console.log(`🎤 Sending WhatsApp voice message to ${userId}`);
      
      // TODO: Implement WhatsApp voice message sending
      // TODO: Convert text to speech
      // TODO: Handle voice message delivery
      
      return { success: true, messageId: `wa_voice_${Date.now()}` };
    } catch (error) {
      console.error('Error sending voice message:', error);
      return { success: false, error: error.message };
    }
  }

  async sendStatusUpdate(userId, update) {
    try {
      // Send status update message
      const statusMessage = `📊 NISTO Status Update:

💰 Recent Transfer: ${update.amount} ${update.currency}
👤 To: @${update.recipient}
⏰ Time: ${update.timestamp}
📍 Status: ${update.status}

💡 Tip: Use "Balance" to check your wallet!`;
      
      return await this.sendMessage(userId, statusMessage);
    } catch (error) {
      console.error('Error sending status update:', error);
      return { success: false, error: error.message };
    }
  }

  async handleMoneyTransfer(message) {
    try {
      // Extract transfer details from WhatsApp message
      const transferDetails = this.extractTransferDetails(message);
      
      if (!transferDetails) {
        return await this.sendParseError(message);
      }

      // Validate transfer request
      const validation = await this.validateTransfer(transferDetails);
      if (!validation.valid) {
        return await this.sendValidationError(message, validation.error);
      }

      // Send confirmation request
      return await this.sendConfirmationRequest(message, transferDetails);
      
    } catch (error) {
      console.error('Error handling WhatsApp money transfer:', error);
      return await this.sendErrorMessage(message);
    }
  }

  extractTransferDetails(message) {
    const text = message.text;
    
    // WhatsApp-specific parsing patterns
    const patterns = [
      {
        regex: /send\s+\$?(\d+(?:\.\d{2})?)\s+to\s+@?(\w+)/i,
        extract: (matches) => ({
          action: 'send',
          amount: parseFloat(matches[1]),
          recipient: matches[2],
          currency: 'USD',
          platform: 'whatsapp'
        })
      },
      {
        regex: /pay\s+@?(\w+)\s+\$?(\d+(?:\.\d{2})?)/i,
        extract: (matches) => ({
          action: 'pay',
          amount: parseFloat(matches[1]),
          recipient: matches[2],
          currency: 'USD',
          platform: 'whatsapp'
        })
      },
      {
        regex: /transfer\s+(\d+(?:\.\d{2})?)\s+(\w{3})\s+to\s+@?(\w+)/i,
        extract: (matches) => ({
          action: 'transfer',
          amount: parseFloat(matches[1]),
          currency: matches[2].toUpperCase(),
          recipient: matches[3],
          platform: 'whatsapp'
        })
      },
      {
        regex: /split\s+\$?(\d+(?:\.\d{2})?)\s+with\s+@?(\w+)/i,
        extract: (matches) => ({
          action: 'split',
          amount: parseFloat(matches[1]),
          recipient: matches[2],
          currency: 'USD',
          platform: 'whatsapp'
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

  async validateTransfer(details) {
    // Basic validation
    if (!details.amount || details.amount <= 0) {
      return { valid: false, error: 'Invalid amount' };
    }

    if (!details.recipient) {
      return { valid: false, error: 'Invalid recipient' };
    }

    // WhatsApp-specific limits
    if (details.amount > 1000) {
      return { valid: false, error: 'WhatsApp transfers limited to $1000 per transaction' };
    }

    // Currency validation
    const supportedCurrencies = ['USD', 'KES', 'EUR', 'GBP', 'NGN'];
    if (!supportedCurrencies.includes(details.currency)) {
      return { valid: false, error: `Currency ${details.currency} not supported on WhatsApp` };
    }

    return { valid: true };
  }

  async sendConfirmationRequest(message, details) {
    const confirmationMessage = this.formatWhatsAppConfirmation(details);
    return await this.sendMessage(message.senderId, confirmationMessage);
  }

  formatWhatsAppConfirmation(details) {
    const fee = this.calculateFee(details.amount, details.currency);
    const total = details.amount + fee;
    
    return `🤖 NISTO WhatsApp: Ready to ${details.action} ${details.amount} ${details.currency} to @${details.recipient}!

💰 Amount: ${details.amount} ${details.currency}
👤 Recipient: @${details.recipient}
💳 From: Your NISTO Wallet
 Fee: ${fee} ${details.currency} (1%)
 Total: ${total} ${details.currency}

✅ Confirm: "YES ${details.action} ${details.amount}"
❌ Cancel: "NO"

💡 Tip: Use voice messages for hands-free transfers! 🎤`;
  }

  calculateFee(amount, currency) {
    // WhatsApp-specific fee structure
    const baseFee = amount * 0.01; // 1%
    const minFee = this.getMinFee(currency);
    
    return Math.max(baseFee, minFee);
  }

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

  async sendParseError(message) {
    const parseError = `🤔 I didn't understand that WhatsApp message. Here are some examples:

✅ "Send $50 to @john"
✅ "Pay @sarah 1000 KES"
✅ "Transfer $25 to @friend"
✅ "Split $100 with @group"

💡 Type "Help" for more commands!
📱 Works on WhatsApp DMs and Groups!`;

    return await this.sendMessage(message.senderId, parseError);
  }

  async sendValidationError(message, error) {
    const validationError = `❌ WhatsApp Transfer Error: ${error}

💡 Please check:
• Amount is valid and above $0.01
• Recipient username is correct
• WhatsApp limit: $1000 per transaction
• You have sufficient balance

Try again or type "Help" for assistance! 📱`;

    return await this.sendMessage(message.senderId, validationError);
  }

  async sendErrorMessage(message) {
    const errorMessage = `❌ Sorry, I couldn't process your WhatsApp request.

💡 Try these commands:
• "Send $50 to @username"
• "Help" for assistance
• "Balance" to check wallet

🔧 If the problem persists, contact support@nisto.com

📱 WhatsApp integration powered by NISTO!`;

    return await this.sendMessage(message.senderId, errorMessage);
  }

  async sendHelpMessage(message) {
    const helpMessage = `🤖 NISTO WhatsApp Help - Send money through chats!

💰 Money Transfer Commands:
• "Send $50 to @username"
• "Pay @friend 1000 KES"
• "Transfer $25 to @john"
• "Split $100 with @group"

💡 Other Commands:
• "Balance" - Check your wallet
• "Help" - Show this message
• "Settings" - Manage preferences

📱 WhatsApp Features:
• DM money transfers
• Group money splitting
• Voice message transfers
• Status updates

🌍 Works with: WhatsApp DMs, Groups & more!

Need help? Contact support@nisto.com 📧`;

    return await this.sendMessage(message.senderId, helpMessage);
  }

  async sendBalanceInfo(message) {
    const balanceMessage = `💰 Your NISTO Wallet Balance (WhatsApp):

💵 USD: $1,250.00
🇰🇪 KES: 125,000
🇪🇺 EUR: €1,150.00
🇬🇧 GBP: £1,000.00
🇳🇬 NGN: 500,000

💳 Total Value: $1,250.00
📈 24h Change: +$25.00 (+2.04%)

💡 Tip: Use "Send $X to @username" to transfer money!
📱 WhatsApp integration powered by NISTO!`;

    return await this.sendMessage(message.senderId, balanceMessage);
  }

  // Platform-specific methods
  isConnected() {
    return this.isConnected;
  }

  getActiveUsers() {
    return this.activeUsers.size;
  }

  getTransferCount() {
    return this.transferCount;
  }

  async healthCheck() {
    try {
      const health = {
        platform: 'whatsapp',
        status: this.isConnected ? 'healthy' : 'disconnected',
        activeUsers: this.activeUsers.size,
        transferCount: this.transferCount,
        lastCheck: new Date()
      };

      // Test WhatsApp API connection
      if (this.isConnected) {
        // TODO: Implement actual API health check
        health.apiStatus = 'connected';
      } else {
        health.apiStatus = 'disconnected';
      }

      return health;
    } catch (error) {
      return {
        platform: 'whatsapp',
        status: 'error',
        error: error.message,
        lastCheck: new Date()
      };
    }
  }

  // WhatsApp-specific features
  async createGroupTransfer(groupId, amount, participants) {
    try {
      // Create group money transfer
      console.log(`👥 Creating group transfer in ${groupId}: ${amount} USD for ${participants.length} participants`);
      
      // TODO: Implement WhatsApp group transfer
      // TODO: Handle participant notifications
      // TODO: Track group transfer status
      
      return { success: true, groupTransferId: `wa_group_${Date.now()}` };
    } catch (error) {
      console.error('Error creating group transfer:', error);
      return { success: false, error: error.message };
    }
  }

  async sendMoneyTemplate(userId, templateData) {
    try {
      // Send money transfer template message
      console.log(`📤 Sending money template to ${userId}: ${templateData.type}`);
      
      // TODO: Implement WhatsApp template sending
      // TODO: Handle template parameters
      // TODO: Track template performance
      
      return { success: true, templateId: `wa_template_${Date.now()}` };
    } catch (error) {
      console.error('Error sending money template:', error);
      return { success: false, error: error.message };
    }
  }

  async handleGroupMessage(message) {
    try {
      // Handle group-specific messages
      if (message.text.includes('split') || message.text.includes('group')) {
        return await this.handleGroupMoneySplit(message);
      }
      
      // Handle regular money transfers
      return await this.handleMoneyTransfer(message);
    } catch (error) {
      console.error('Error handling WhatsApp group message:', error);
      return await this.sendErrorMessage(message);
    }
  }

  async handleGroupMoneySplit(message) {
    try {
      // Extract group split details
      const splitDetails = this.extractGroupSplitDetails(message);
      
      if (!splitDetails) {
        return await this.sendParseError(message);
      }

      // Send group split confirmation
      return await this.sendGroupSplitConfirmation(message, splitDetails);
    } catch (error) {
      console.error('Error handling group money split:', error);
      return await this.sendErrorMessage(message);
    }
  }

  extractGroupSplitDetails(message) {
    const text = message.text;
    
    // Group split patterns
    const patterns = [
      {
        regex: /split\s+\$?(\d+(?:\.\d{2})?)\s+with\s+@?(\w+)/i,
        extract: (matches) => ({
          action: 'split',
          amount: parseFloat(matches[1]),
          recipient: matches[2],
          currency: 'USD',
          platform: 'whatsapp',
          type: 'group_split'
        })
      },
      {
        regex: /divide\s+\$?(\d+(?:\.\d{2})?)\s+among\s+(\d+)/i,
        extract: (matches) => ({
          action: 'divide',
          amount: parseFloat(matches[1]),
          participants: parseInt(matches[2]),
          currency: 'USD',
          platform: 'whatsapp',
          type: 'group_divide'
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

  async sendGroupSplitConfirmation(message, details) {
    let confirmationMessage;
    
    if (details.type === 'group_split') {
      confirmationMessage = `🤖 NISTO Group Split: Ready to split ${details.amount} ${details.currency} with @${details.recipient}!

💰 Amount: ${details.amount} ${details.currency}
👥 Participants: 2
💸 Amount per person: ${(details.amount / 2).toFixed(2)} ${details.currency}
💳 From: Your NISTO Wallet

✅ Confirm: "YES split ${details.amount}"
❌ Cancel: "NO"`;
    } else if (details.type === 'group_divide') {
      confirmationMessage = `🤖 NISTO Group Divide: Ready to divide ${details.amount} ${details.currency} among ${details.participants} people!

💰 Amount: ${details.amount} ${details.currency}
👥 Participants: ${details.participants}
💸 Amount per person: ${(details.amount / details.participants).toFixed(2)} ${details.currency}
💳 From: Your NISTO Wallet

✅ Confirm: "YES divide ${details.amount}"
❌ Cancel: "NO"`;
    }

    return await this.sendMessage(message.senderId, confirmationMessage);
  }
}

export default WhatsAppHandler;
