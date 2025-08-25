import Debug "mo:base/Debug";
import HashMap "mo:base/HashMap";
import Text "mo:base/Text";
import Array "mo:base/Array";
import Time "mo:base/Time";
import Int "mo:base/Int";
import Nat "mo:base/Nat";
import Nat8 "mo:base/Nat8";
import Nat32 "mo:base/Nat32";
import Float "mo:base/Float";
import Result "mo:base/Result";
import Option "mo:base/Option";
import Principal "mo:base/Principal";
import Iter "mo:base/Iter";
import Random "mo:base/Random";
import Blob "mo:base/Blob";
import Buffer "mo:base/Buffer";
import Char "mo:base/Char";
import Timer "mo:base/Timer";


persistent actor Nisto {
  
  // ============ DATA TYPES ============
  
  public type UserId = Principal;
  
  public type User = {
    id: UserId;
    username: Text;
    email: ?Text;
    displayName: Text;
    avatar: ?Text;
    createdAt: Int;
    updatedAt: Int;
    preferences: UserPreferences;
    isActive: Bool;
    recoverySetupCompleted: Bool;
    lastLoginAt: ?Int;
    loginAttempts: Nat;
    isLocked: Bool;
  };
  
  public type UserPreferences = {
    currency: Text; // Primary currency (KES, USD, etc.)
    language: Text;
    theme: Text; // "light" | "dark"
    notifications: NotificationSettings;
    privacy: PrivacySettings;
    security: SecuritySettings;
  };
  
  public type NotificationSettings = {
    email: Bool;
    push: Bool;
    transactions: Bool;
    goals: Bool;
    social: Bool;
    security: Bool;
  };
  
  public type PrivacySettings = {
    profileVisibility: Text; // "public" | "friends" | "private"
    transactionVisibility: Text; // "public" | "friends" | "private"
    allowFriendRequests: Bool;
  };
  
  public type SecuritySettings = {
    twoFactorEnabled: Bool;
    loginNotifications: Bool;
    deviceTracking: Bool;
  };
  
  // ===== RECOVERY SYSTEM TYPES =====
  
  public type RecoveryMethod = {
    id: Text;
    userId: UserId;
    methodType: Text; // "email" | "phone" | "security_qa" | "emergency_contact" | "backup_email"
    value: Text; // Email address, phone number, or encrypted data
    isVerified: Bool;
    isActive: Bool;
    createdAt: Int;
    verifiedAt: ?Int;
    metadata: ?Text; // Additional data (encrypted)
  };
  
  public type SecurityQuestion = {
    id: Text;
    userId: UserId;
    question: Text;
    answerHash: Text; // Hashed answer for security
    createdAt: Int;
    isActive: Bool;
  };
  
  public type EmergencyContact = {
    id: Text;
    userId: UserId;
    name: Text;
    email: Text;
    relationship: Text;
    isVerified: Bool;
    createdAt: Int;
    verifiedAt: ?Int;
  };
  
  public type VerificationCode = {
    id: Text;
    userId: ?UserId;
    identifier: Text; // Email or phone number
    code: Text;
    codeType: Text; // "email_verification" | "sms_verification" | "recovery_request"
    expiresAt: Int;
    isUsed: Bool;
    attempts: Nat;
    createdAt: Int;
  };
  
  public type RecoveryRequest = {
    id: Text;
    userId: ?UserId; // Might be null if user is lost
    identifier: Text; // Email or phone used for recovery
    recoveryMethod: Text;
    status: Text; // "pending" | "verified" | "completed" | "failed" | "expired"
    verificationCode: ?Text;
    recoveryToken: ?Text;
    expiresAt: Int;
    createdAt: Int;
    verifiedAt: ?Int;
    completedAt: ?Int;
    metadata: ?Text;
  };
  
  public type LoginSession = {
    id: Text;
    userId: UserId;
    deviceInfo: ?Text;
    ipAddress: ?Text;
    userAgent: ?Text;
    isActive: Bool;
    createdAt: Int;
    lastAccessAt: Int;
    expiresAt: Int;
  };
  
  public type AuditLog = {
    id: Text;
    userId: ?UserId;
    action: Text;
    details: Text;
    ipAddress: ?Text;
    userAgent: ?Text;
    timestamp: Int;
    success: Bool;
  };
  


  public type Wallet = {
    id: Text;
    userId: UserId;
    name: Text;
    type_: Text; // "personal" | "shared" | "business"
    currency: Text;
    balance: Float;
    isActive: Bool;
    createdAt: Int;
    updatedAt: Int;
  };

  // ===== CRYPTO WALLET TYPES =====
  
  public type CryptoWalletType = {
    #ICP;
    #ckBTC;
    #ckETH;
    #CHAT;
    #SNS1;
    #KINIC;
    #GHOST;
    #CAT;
    #BOOM;
    #NTN;
    #YUGE;
    #WUMBO;
    #ALPACALB;
    #PARTY;
    #SNEED;
    #CLOWN;
    #SHRIMP;
    #DOGMI;
    #FOMO;
    #TRAX;
    #MOTOKO;
    #CKPEPE;
    #SONIC;
    #MOD;
    #DAMONIC;
    #NICP;
    #MEME;
    #DRAGGINZ;
    #ELNA;
    #GLDT;
    #NANAS;
    #PANDA;
    #SEERS;
    #DSCVR;
    #CYCLES;
    #DKUMA;
    #OPENCHAT;
    #FIAT;
  };

  public type CryptoWallet = {
    id: Text;
    userId: UserId;
    name: Text;
    walletType: CryptoWalletType;
    currency: Text; // Token symbol
    balance: Float;
    address: ?Text; // Wallet address/account identifier
    isExternal: Bool; // True for external wallets (Plug, Stoic, etc.)
    externalWalletType: ?Text; // "plug" | "stoic" | "nfid" | "metamask" | "walletconnect"
    isActive: Bool;
    createdAt: Int;
    updatedAt: Int;
    lastSyncAt: ?Int;
    metadata: ?Text; // JSON string for additional data
  };

  public type ExternalWalletConnection = {
    id: Text;
    userId: UserId;
    walletType: Text; // "plug" | "stoic" | "nfid" | "metamask" | "walletconnect"
    principalId: ?Text; // For IC wallets
    address: ?Text; // For Ethereum wallets
    isActive: Bool;
    connectedAt: Int;
    lastUsedAt: Int;
    permissions: [Text]; // List of permissions granted
  };

  public type CryptoTransaction = {
    id: Text;
    walletId: Text;
    userId: UserId;
    type_: Text; // "send" | "receive" | "swap" | "stake" | "unstake" | "claim"
    amount: Float;
    currency: Text;
    status: Text;
    timestamp: Int;
    txHash: ?Text;
    fees: ?Float;
    toAddress: ?Text;
    fromAddress: ?Text;
    blockHeight: ?Nat;
    metadata: ?Text;
  };

  // ===== ENHANCED NOTIFICATION SYSTEM =====
  
  public type NotificationType = {
    #Transaction: { amount: Float; currency: Text; status: Text };
    #Security: { event: Text; severity: Text; action: ?Text };
    #Vault: { vaultId: Text; action: Text; amount: ?Float };
    #Social: { event: Text; userId: Text; metadata: ?Text };
    #System: { message: Text; priority: Text };
    #Payment: { provider: Text; amount: Float; status: Text };
    #Recovery: { method: Text; status: Text };
  };
  
  public type Notification = {
    id: Text;
    userId: UserId;
    notificationType: NotificationType;
    title: Text;
    message: Text;
    priority: Text; // "low" | "medium" | "high" | "critical"
    isRead: Bool;
    isArchived: Bool;
    createdAt: Int;
    readAt: ?Int;
    metadata: ?Text; // JSON string for additional data
    actionUrl: ?Text; // Deep link to relevant section
    expiresAt: ?Int; // Optional expiration
  };
  
  public type NotificationPreferences = {
    userId: UserId;
    email: Bool;
    push: Bool;
    inApp: Bool;
    transactionNotifications: Bool;
    securityNotifications: Bool;
    vaultNotifications: Bool;
    socialNotifications: Bool;
    systemNotifications: Bool;
    paymentNotifications: Bool;
    recoveryNotifications: Bool;
    quietHours: ?{ start: Text; end: Text }; // "HH:MM" format
    timezone: Text;
    updatedAt: Int;
  };
  
  public type PushSubscription = {
    id: Text;
    userId: UserId;
    endpoint: Text;
    p256dh: Text; // Public key
    auth: Text; // Auth secret
    deviceInfo: ?Text;
    isActive: Bool;
    createdAt: Int;
    lastUsed: Int;
  };

  public type WalletPortfolio = {
    userId: UserId;
    totalValueUSD: Float;
    totalValueKES: Float;
    cryptoWallets: [CryptoWallet];
    fiatWallets: [Wallet];
    externalConnections: [ExternalWalletConnection];
    defiPositions: [DeFiPosition];
    lastUpdated: Int;
  };
  
  public type Transaction = {
    id: Text;
    walletId: Text;
    userId: UserId;
    type_: Text; // "income" | "expense" | "transfer"
    amount: Float;
    currency: Text;
    category: Text;
    description: Text;
    timestamp: Int;
    status: Text; // "pending" | "completed" | "failed"
    metadata: ?Text; // JSON string for additional data
  };
  
  public type Budget = {
    id: Text;
    userId: UserId;
    name: Text;
    category: Text;
    amount: Float;
    spent: Float;
    period: Text; // "weekly" | "monthly" | "yearly"
    startDate: Int;
    endDate: Int;
    isActive: Bool;
  };
  
  public type Goal = {
    id: Text;
    userId: UserId;
    title: Text;
    description: Text;
    targetAmount: Float;
    currentAmount: Float;
    currency: Text;
    targetDate: ?Int;
    category: Text;
    isActive: Bool;
    isAchieved: Bool;
    createdAt: Int;
    updatedAt: Int;
  };
  
  // ===== OTP SERVICE TYPES =====
  
  public type OTPService = {
    #AfricasTalking: { username: Text; apiKey: Text };
    #Twilio: { accountSid: Text; authToken: Text; from: Text };
    #Resend: { apiKey: Text; from: Text };
    #SendGrid: { apiKey: Text; from: Text };
    #WhatsApp: { accessToken: Text; phoneNumberId: Text };
  };

  public type OTPRequest = {
    id: Text;
    userId: ?UserId;
    recipient: Text; // Email or phone number
    code: Text;
    service: Text; // "sms" | "email" | "whatsapp"
    provider: Text; // "africas_talking" | "twilio" | "resend" | "sendgrid" | "whatsapp"
    purpose: Text; // "verification" | "recovery" | "login"
    status: Text; // "pending" | "sent" | "delivered" | "failed"
    attempts: Nat;
    expiresAt: Int;
    createdAt: Int;
    sentAt: ?Int;
    deliveredAt: ?Int;
    metadata: ?Text;
  };
  
  // ============ STATE VARIABLES ============
  
  private var nextUserId: Nat = 0;
  private var nextWalletId: Nat = 0;
  private var nextTransactionId: Nat = 0;
  private var nextBudgetId: Nat = 0;
  private var nextGoalId: Nat = 0;
  private var nextRecoveryMethodId: Nat = 0;
  private var nextSecurityQuestionId: Nat = 0;
  private var nextEmergencyContactId: Nat = 0;
  private var nextVerificationCodeId: Nat = 0;
  private var nextRecoveryRequestId: Nat = 0;
  private var nextSessionId: Nat = 0;
  private var nextAuditLogId: Nat = 0;
  
  // Admin principal
  private transient let admin: Principal = Principal.fromText("2vxsx-fae"); // Anonymous principal for development
  
  // Crypto wallet counters
  private var nextCryptoWalletId: Nat = 0;
  private var nextExternalConnectionId: Nat = 0;
  private var nextCryptoTransactionId: Nat = 0;
  private var nextDeFiPositionId: Nat = 0;
  
  // Core data storage
  private transient var users = HashMap.HashMap<UserId, User>(10, Principal.equal, Principal.hash);
  private transient var wallets = HashMap.HashMap<Text, Wallet>(10, Text.equal, Text.hash);
  private transient var transactions = HashMap.HashMap<Text, Transaction>(50, Text.equal, Text.hash);
  private transient var budgets = HashMap.HashMap<Text, Budget>(20, Text.equal, Text.hash);
  private transient var goals = HashMap.HashMap<Text, Goal>(20, Text.equal, Text.hash);
  
  // Crypto wallet storage
  private transient var cryptoWallets = HashMap.HashMap<Text, CryptoWallet>(50, Text.equal, Text.hash);
  private transient var externalConnections = HashMap.HashMap<Text, ExternalWalletConnection>(20, Text.equal, Text.hash);
  private transient var cryptoTransactions = HashMap.HashMap<Text, CryptoTransaction>(100, Text.equal, Text.hash);
  private transient var defiPositions = HashMap.HashMap<Text, DeFiPosition>(50, Text.equal, Text.hash);
  
  // Recovery system storage
  private transient var recoveryMethods = HashMap.HashMap<Text, RecoveryMethod>(20, Text.equal, Text.hash);
  private transient var securityQuestions = HashMap.HashMap<Text, SecurityQuestion>(20, Text.equal, Text.hash);
  private transient var emergencyContacts = HashMap.HashMap<Text, EmergencyContact>(10, Text.equal, Text.hash);
  private transient var verificationCodes = HashMap.HashMap<Text, VerificationCode>(50, Text.equal, Text.hash);
  private transient var recoveryRequests = HashMap.HashMap<Text, RecoveryRequest>(20, Text.equal, Text.hash);
  private transient var loginSessions = HashMap.HashMap<Text, LoginSession>(50, Text.equal, Text.hash);
  private transient var auditLogs = HashMap.HashMap<Text, AuditLog>(100, Text.equal, Text.hash);
  
  // Indexes
  private transient var userWallets = HashMap.HashMap<UserId, [Text]>(10, Principal.equal, Principal.hash);
  private transient var userTransactions = HashMap.HashMap<UserId, [Text]>(10, Principal.equal, Principal.hash);
  private transient var userRecoveryMethods = HashMap.HashMap<UserId, [Text]>(10, Principal.equal, Principal.hash);
  private transient var userSecurityQuestions = HashMap.HashMap<UserId, [Text]>(10, Principal.equal, Principal.hash);
  private transient var userEmergencyContacts = HashMap.HashMap<UserId, [Text]>(10, Principal.equal, Principal.hash);
  private transient var userSessions = HashMap.HashMap<UserId, [Text]>(10, Principal.equal, Principal.hash);
  private transient var emailToUserId = HashMap.HashMap<Text, UserId>(20, Text.equal, Text.hash);
  private transient var phoneToUserId = HashMap.HashMap<Text, UserId>(20, Text.equal, Text.hash);
  
  // Crypto wallet indexes
  private transient var userCryptoWallets = HashMap.HashMap<UserId, [Text]>(10, Principal.equal, Principal.hash);
  private transient var userExternalConnections = HashMap.HashMap<UserId, [Text]>(10, Principal.equal, Principal.hash);
  private transient var userCryptoTransactions = HashMap.HashMap<UserId, [Text]>(10, Principal.equal, Principal.hash);
  private transient var userDeFiPositions = HashMap.HashMap<UserId, [Text]>(10, Principal.equal, Principal.hash);
  private transient var addressToWallet = HashMap.HashMap<Text, Text>(50, Text.equal, Text.hash);
  private transient var principalToConnection = HashMap.HashMap<Text, Text>(20, Text.equal, Text.hash);
  
  // OTP storage
  private transient var otpRequests = HashMap.HashMap<Text, OTPRequest>(100, Text.equal, Text.hash);
  private transient var userOTPRequests = HashMap.HashMap<UserId, [Text]>(10, Principal.equal, Principal.hash);
  private var nextOTPRequestId: Nat = 0;
  
  // ===== GROUP VAULTS STORAGE =====
  private transient var groupVaults = HashMap.HashMap<Text, GroupVault>(50, Text.equal, Text.hash);
  private transient var vaultMembers = HashMap.HashMap<Text, VaultMember>(100, Text.equal, Text.hash);
  private transient var vaultTransactions = HashMap.HashMap<Text, VaultTransaction>(200, Text.equal, Text.hash);
  private var nextVaultId: Nat = 0;
  private var nextVaultMemberId: Nat = 0;
  private var nextVaultTransactionId: Nat = 0;
  
  // Vault indexes
  private transient var userVaults = HashMap.HashMap<UserId, [Text]>(10, Principal.equal, Principal.hash);
  private transient var vaultMemberIndex = HashMap.HashMap<Text, [Text]>(50, Text.equal, Text.hash); // vaultId -> memberIds
  private transient var vaultTransactionIndex = HashMap.HashMap<Text, [Text]>(50, Text.equal, Text.hash); // vaultId -> transactionIds
  
  // ===== VAULT CHAT STORAGE =====
  private transient var vaultMessages = HashMap.HashMap<Text, VaultMessage>(500, Text.equal, Text.hash);
  private transient var vaultChatRooms = HashMap.HashMap<Text, VaultChatRoom>(50, Text.equal, Text.hash);
  private transient var chatMembers = HashMap.HashMap<Text, ChatMember>(200, Text.equal, Text.hash); // userId_vaultId -> ChatMember
  private transient var chatNotifications = HashMap.HashMap<Text, ChatNotification>(200, Text.equal, Text.hash);
  private var nextVaultMessageId: Nat = 0;
  private var nextVaultChatRoomId: Nat = 0;
  private var nextChatNotificationId: Nat = 0;
  
  // Vault chat indexes
  private transient var vaultMessageIndex = HashMap.HashMap<Text, [Text]>(50, Text.equal, Text.hash); // vaultId -> messageIds
  private transient var vaultChatRoomIndex = HashMap.HashMap<Text, [Text]>(50, Text.equal, Text.hash); // vaultId -> chatRoomIds
  private transient var vaultChatMemberIndex = HashMap.HashMap<Text, [Text]>(50, Text.equal, Text.hash); // vaultId -> userIds
  private transient var userChatNotificationIndex = HashMap.HashMap<UserId, [Text]>(10, Principal.equal, Principal.hash); // userId -> notificationIds
  
  // ===== PLUGIN SYSTEM STORAGE =====
  // ===== PLUGIN SYSTEM STORAGE =====
  private transient var pluginStore = HashMap.HashMap<Text, Plugin>(100, Text.equal, Text.hash);
  private transient var userPluginStore = HashMap.HashMap<Text, UserPlugin>(200, Text.equal, Text.hash);
  private var nextPluginId: Nat = 0;
  private var nextUserPluginId: Nat = 0;
  
  // Plugin indexes
  private transient var userPluginIndex = HashMap.HashMap<UserId, [Text]>(10, Principal.equal, Principal.hash);
  private transient var pluginCategoryIndex = HashMap.HashMap<Text, [Text]>(10, Text.equal, Text.hash); // category -> pluginIds
  
  
  // ===== SOCIAL GAMES STORAGE =====
  private transient var socialGames = HashMap.HashMap<Text, SocialGame>(50, Text.equal, Text.hash);
  private transient var gameParticipants = HashMap.HashMap<Text, GameParticipant>(200, Text.equal, Text.hash);
  private transient var gameRewards = HashMap.HashMap<Text, GameReward>(100, Text.equal, Text.hash);
  private var nextGameId: Nat = 0;
  private var nextGameParticipantId: Nat = 0;
  private var nextGameRewardId: Nat = 0;
  
  // Game indexes
  private transient var userGames = HashMap.HashMap<UserId, [Text]>(10, Principal.equal, Principal.hash);
  private transient var gameParticipantIndex = HashMap.HashMap<Text, [Text]>(50, Text.equal, Text.hash); // gameId -> participantIds
    private transient var gameRewardIndex = HashMap.HashMap<UserId, [Text]>(10, Principal.equal, Principal.hash); // userId -> rewardIds

  // ===== ENHANCED NOTIFICATION STORAGE =====
  private transient var notifications = HashMap.HashMap<Text, Notification>(500, Text.equal, Text.hash);
  private transient var notificationPreferences = HashMap.HashMap<UserId, NotificationPreferences>(10, Principal.equal, Principal.hash);
  private transient var pushSubscriptions = HashMap.HashMap<Text, PushSubscription>(100, Text.equal, Text.hash);
  private var nextNotificationId: Nat = 0;
  private var nextPushSubscriptionId: Nat = 0;

  // Notification indexes
  private transient var userNotifications = HashMap.HashMap<UserId, [Text]>(10, Principal.equal, Principal.hash); // userId -> notificationIds
  private transient var userPushSubscriptions = HashMap.HashMap<UserId, [Text]>(10, Principal.equal, Principal.hash); // userId -> subscriptionIds
  private transient var userNotificationIndex = HashMap.HashMap<UserId, [Text]>(10, Principal.equal, Principal.hash); // userId -> notificationIds (for vault invitations)

  
  
  // ===== DEFI TOOLS STORAGE =====
  private transient var defiTransactions = HashMap.HashMap<Text, DeFiTransaction>(200, Text.equal, Text.hash);
  private var nextDefiTransactionId: Nat = 0;
  
  // DeFi indexes
  private transient var userDefiTransactions = HashMap.HashMap<UserId, [Text]>(10, Principal.equal, Principal.hash);
  private transient var protocolTransactionIndex = HashMap.HashMap<Text, [Text]>(10, Text.equal, Text.hash); // protocol -> transactionIds
  
  // ===== AI ASSISTANT STORAGE =====
  private transient var aiMessages = HashMap.HashMap<Text, AIMessage>(500, Text.equal, Text.hash);
  private transient var aiInsights = HashMap.HashMap<Text, AIInsight>(100, Text.equal, Text.hash);
  private transient var aiRecommendations = HashMap.HashMap<Text, AIRecommendation>(100, Text.equal, Text.hash);
  private var nextAIMessageId: Nat = 0;
  private var nextAIInsightId: Nat = 0;
  private var nextAIRecommendationId: Nat = 0;
  
  // AI indexes
  private transient var userAIMessages = HashMap.HashMap<UserId, [Text]>(10, Principal.equal, Principal.hash);
  private transient var userAIInsights = HashMap.HashMap<UserId, [Text]>(10, Principal.equal, Principal.hash);
  private transient var userAIRecommendations = HashMap.HashMap<UserId, [Text]>(10, Principal.equal, Principal.hash);
  
  // ===== LOCAL PAYMENTS STORAGE =====
  private transient var localPayments = HashMap.HashMap<Text, LocalPayment>(200, Text.equal, Text.hash);
  private transient var paymentMethods = HashMap.HashMap<Text, PaymentMethod>(100, Text.equal, Text.hash);
  private var nextLocalPaymentId: Nat = 0;
  private var nextPaymentMethodId: Nat = 0;
  
  // Payment indexes
  private transient var userLocalPayments = HashMap.HashMap<UserId, [Text]>(10, Principal.equal, Principal.hash);
  private transient var userPaymentMethods = HashMap.HashMap<UserId, [Text]>(10, Principal.equal, Principal.hash);
  private transient var providerPaymentIndex = HashMap.HashMap<Text, [Text]>(10, Text.equal, Text.hash); // provider -> paymentIds

  
  
  // ============ HELPER FUNCTIONS ============
  
  private func generateId(prefix: Text, counter: Nat): Text {
    prefix # "_" # Int.toText(counter);
  };
  
  private func getCurrentTime(): Int {
    Time.now();
  };
  
  private func generateRandomCode(): Text {
    let charset = "0123456789";
    var code = "";
    // Simple random code generation (in production, use proper crypto random)
    let timestamp = Int.abs(Time.now());
    let baseCode = timestamp % 1000000;
    Int.toText(baseCode);
  };
  
  private func generateRecoveryToken(): Text {
    let timestamp = Int.toText(Int.abs(Time.now()));
    let random = Int.toText(Int.abs(Time.now()) % 999999);
    "recovery_" # timestamp # "_" # random;
  };
  
  private func hashPassword(password: Text): Text {
    // Simple hash for demo - in production use proper crypto
    let combined = password # "nesto_salt_2024";
    Nat32.toText(Text.hash(combined));
  };
  
  private func isCodeExpired(expiresAt: Int): Bool {
    getCurrentTime() > expiresAt;
  };
  
  private func getDefaultPreferences(): UserPreferences {
    {
      currency = "KES";
      language = "en";
      theme = "light";
      notifications = {
        email = true;
        push = true;
        transactions = true;
        goals = true;
        social = true;
        security = true;
      };
      privacy = {
        profileVisibility = "friends";
        transactionVisibility = "private";
        allowFriendRequests = true;
      };
      security = {
        twoFactorEnabled = false;
        loginNotifications = true;
        deviceTracking = true;
      };
    };
  };

  // ============ TYPE CONVERSION HELPERS ============
  
  // Vault type conversions
  private func vaultTypeToText(vaultType: VaultType): Text {
    switch (vaultType) {
      case (#Savings) { "Savings" };
      case (#Investment) { "Investment" };
      case (#Emergency) { "Emergency" };
      case (#Travel) { "Travel" };
      case (#Education) { "Education" };
      case (#Business) { "Business" };
      case (#Charity) { "Charity" };
      case (#Custom) { "Custom" };
    };
  };
  
  private func textToVaultType(text: Text): VaultType {
    switch (text) {
      case ("Savings") { #Savings };
      case ("Investment") { #Investment };
      case ("Emergency") { #Emergency };
      case ("Travel") { #Travel };
      case ("Education") { #Education };
      case ("Business") { #Business };
      case ("Charity") { #Charity };
      case (_) { #Custom };
    };
  };
  
  // Plugin category conversions
 // ========== PLUGIN SYSTEM HELPER FUNCTIONS ==========
  
  private func addToUserPluginIndex(userId: UserId, pluginId: Text) {
    switch (userPluginIndex.get(userId)) {
      case null {
        userPluginIndex.put(userId, [pluginId]);
      };
      case (?existingPlugins) {
        let updatedPlugins = Array.append<Text>(existingPlugins, [pluginId]);
        userPluginIndex.put(userId, updatedPlugins);
      };
    };
  };
  
  private func removeFromUserPluginIndex(userId: UserId, pluginId: Text) {
    switch (userPluginIndex.get(userId)) {
      case null { return; };
      case (?existingPlugins) {
        let filteredPlugins = Array.filter<Text>(existingPlugins, func(pid: Text): Bool { pid != pluginId });
        userPluginIndex.put(userId, filteredPlugins);
      };
    };
  };
  
  private func addToPluginCategoryIndex(category: Text, pluginId: Text) {
    switch (pluginCategoryIndex.get(category)) {
      case null {
        pluginCategoryIndex.put(category, [pluginId]);
      };
      case (?existingPlugins) {
        let updatedPlugins = Array.append<Text>(existingPlugins, [pluginId]);
        pluginCategoryIndex.put(category, updatedPlugins);
      };
    };
  };
  
  private func removeFromPluginCategoryIndex(category: Text, pluginId: Text) {
    switch (pluginCategoryIndex.get(category)) {
      case null { return; };
      case (?existingPlugins) {
        let filteredPlugins = Array.filter<Text>(existingPlugins, func(pid: Text): Bool { pid != pluginId });
        pluginCategoryIndex.put(category, filteredPlugins);
      };
    };
  };

  // Plugin category conversion
  private func pluginCategoryToText(category: PluginCategory): Text {
    switch (category) {
      case (#Finance) { "Finance" };
      case (#Social) { "Social" };
      case (#Gaming) { "Gaming" };
      case (#Productivity) { "Productivity" };
      case (#Entertainment) { "Entertainment" };
      case (#Education) { "Education" };
      case (#Health) { "Health" };
      case (#Custom) { "Custom" };
    };
  };

  
  // Game type conversions
  private func gameTypeToText(gameType: GameType): Text {
    switch (gameType) {
      case (#Trading) { "Trading" };
      case (#Prediction) { "Prediction" };
      case (#Quiz) { "Quiz" };
      case (#Challenge) { "Challenge" };
      case (#Tournament) { "Tournament" };
      case (#Lottery) { "Lottery" };
      case (#Custom) { "Custom" };
    };
  };
  
  private func textToGameType(text: Text): GameType {
    switch (text) {
      case ("Trading") { #Trading };
      case ("Prediction") { #Prediction };
      case ("Quiz") { #Quiz };
      case ("Challenge") { #Challenge };
      case ("Tournament") { #Tournament };
      case ("Lottery") { #Lottery };
      case (_) { #Custom };
    };
  };
  
  // Game status conversions
  private func gameStatusToText(status: GameStatus): Text {
    switch (status) {
      case (#Active) { "Active" };
      case (#Paused) { "Paused" };
      case (#Completed) { "Completed" };
      case (#Cancelled) { "Cancelled" };
    };
  };
  
  private func textToGameStatus(text: Text): GameStatus {
    switch (text) {
      case ("Active") { #Active };
      case ("Paused") { #Paused };
      case ("Completed") { #Completed };
      case ("Cancelled") { #Cancelled };
      case (_) { #Paused };
    };
  };
  
  // DeFi protocol conversions
  private func defiProtocolToText(protocol: DeFiProtocol): Text {
    switch (protocol) {
      case (#ICPSwap) { "ICPSwap" };
      case (#Sonic) { "Sonic" };
      case (#InfinitySwap) { "InfinitySwap" };
      case (#Neutrinite) { "Neutrinite" };
      case (#ICDex) { "ICDex" };
      case (#Custom) { "Custom" };
    };
  };
  
  private func textToDefiProtocol(text: Text): DeFiProtocol {
    switch (text) {
      case ("ICPSwap") { #ICPSwap };
      case ("Sonic") { #Sonic };
      case ("InfinitySwap") { #InfinitySwap };
      case ("Neutrinite") { #Neutrinite };
      case ("ICDex") { #ICDex };
      case (_) { #Custom };
    };
  };
  
  // DeFi product type conversions
  private func defiProductTypeToText(productType: DeFiProductType): Text {
    switch (productType) {
      case (#Swap) { "Swap" };
      case (#Liquidity) { "Liquidity" };
      case (#Staking) { "Staking" };
      case (#Lending) { "Lending" };
      case (#Borrowing) { "Borrowing" };
      case (#YieldFarming) { "YieldFarming" };
      case (#Governance) { "Governance" };
      case (#Custom) { "Custom" };
    };
  };
  
  private func textToDefiProductType(text: Text): DeFiProductType {
    switch (text) {
      case ("Swap") { #Swap };
      case ("Liquidity") { #Liquidity };
      case ("Staking") { #Staking };
      case ("Lending") { #Lending };
      case ("Borrowing") { #Borrowing };
      case ("YieldFarming") { #YieldFarming };
      case ("Governance") { #Governance };
      case (_) { #Custom };
    };
  };
  
  // Payment provider conversions
  private func paymentProviderToText(provider: PaymentProvider): Text {
    switch (provider) {
      case (#Mpesa) { "Mpesa" };
      case (#AirtelMoney) { "AirtelMoney" };
      case (#Equitel) { "Equitel" };
      case (#BankTransfer) { "BankTransfer" };
      case (#Card) { "Card" };
      case (#PayPal) { "PayPal" };
      case (#Custom) { "Custom" };
    };
  };
  
  private func textToPaymentProvider(text: Text): PaymentProvider {
    switch (text) {
      case ("Mpesa") { #Mpesa };
      case ("AirtelMoney") { #AirtelMoney };
      case ("Equitel") { #Equitel };
      case ("BankTransfer") { #BankTransfer };
      case ("Card") { #Card };
      case ("PayPal") { #PayPal };
      case (_) { #Custom };
    };
  };
  
  // Payment status conversions
  private func paymentStatusToText(status: PaymentStatus): Text {
    switch (status) {
      case (#Pending) { "Pending" };
      case (#Processing) { "Processing" };
      case (#Completed) { "Completed" };
      case (#Failed) { "Failed" };
      case (#Cancelled) { "Cancelled" };
      case (#Refunded) { "Refunded" };
    };
  };
  
  private func textToPaymentStatus(text: Text): PaymentStatus {
    switch (text) {
      case ("Pending") { #Pending };
      case ("Processing") { #Processing };
      case ("Completed") { #Completed };
      case ("Failed") { #Failed };
      case ("Cancelled") { #Cancelled };
      case ("Refunded") { #Refunded };
      case (_) { #Pending };
    };
  };

  // ============ CRYPTO WALLET HELPER FUNCTIONS ============

  // Generate a deterministic address for a user and wallet type
  private func generateWalletAddress(userId: UserId, walletType: CryptoWalletType): Text {
    let principalBytes = Principal.toBlob(userId);
    let principalText = Principal.toText(userId);
    let timestamp = Time.now();
    
    switch (walletType) {
      case (#ICP) {
        // ICP Account Identifier (32-byte format)
        generateICPAccountIdentifier(userId);
      };
      case (#ckBTC) {
        // Bitcoin-compatible address (P2WPKH format)
        generateBitcoinAddress(userId);
      };
      case (#ckETH) {
        // Ethereum-compatible address (42 characters, 0x prefix)
        generateEthereumAddress(userId);
      };
      case (#CHAT) {
        // OpenChat token address (ICP-based)
        generateICPTokenAddress(userId, "CHAT");
      };
      case (#SNS1) {
        // SNS DAO token address
        generateICPTokenAddress(userId, "SNS1");
      };
      case (#KINIC) {
        // Kinic token address
        generateICPTokenAddress(userId, "KINIC");
      };
      case (#MOD) {
        // Modclub token address
        generateICPTokenAddress(userId, "MOD");
      };
      case (#BOOM) {
        // Boom DAO token address
        generateICPTokenAddress(userId, "BOOM");
      };
      case (#DRAGGINZ) {
        // Dragginz token address
        generateICPTokenAddress(userId, "DRAGGINZ");
      };
      case (#ELNA) {
        // Elna token address
        generateICPTokenAddress(userId, "ELNA");
      };
      case (#GLDT) {
        // Gold DAO token address
        generateICPTokenAddress(userId, "GLDT");
      };
      case (#NANAS) {
        // Nanas token address
        generateICPTokenAddress(userId, "NANAS");
      };
      case (#PANDA) {
        // Panda DAO token address
        generateICPTokenAddress(userId, "PANDA");
      };
      case (#SEERS) {
        // Seers token address
        generateICPTokenAddress(userId, "SEERS");
      };
      case (#DSCVR) {
        // DSCVR token address
        generateICPTokenAddress(userId, "DSCVR");
      };
      case (#CYCLES) {
        // Cycles address (special format)
        generateCyclesAddress(userId);
      };
      case (#DKUMA) {
        // Dkuma token address
        generateICPTokenAddress(userId, "DKUMA");
      };
      case (#OPENCHAT) {
        // OpenChat token address
        generateICPTokenAddress(userId, "OPENCHAT");
      };
      case (_) {
        // Generic ICP-based token address
        generateICPTokenAddress(userId, cryptoWalletTypeToText(walletType));
      };
    };
  };

  // Generate ICP Account Identifier (32-byte format)
  private func generateICPAccountIdentifier(userId: UserId): Text {
    let principalBytes = Principal.toBlob(userId);
    let principalText = Principal.toText(userId);
    
    // Create a deterministic subaccount based on user principal
    let subaccount = generateSubaccountBytes(userId, "default");
    
    // Convert to hex format (32 bytes = 64 hex characters)
    let hexString = bytesToHex(subaccount);
    
    // Format as ICP account identifier
    "2vxsx-fae" # hexString;
  };

  // Generate Bitcoin-compatible address (P2WPKH)
  private func generateBitcoinAddress(userId: UserId): Text {
    let principalBytes = Principal.toBlob(userId);
    let principalText = Principal.toText(userId);
    
    // Create deterministic key material from principal
    let keyMaterial = generateKeyMaterial(userId, "btc");
    
    // Generate Bitcoin address format (simplified for demo)
    // In production, this would use proper Bitcoin address generation
    let hash = Text.hash(principalText # "btc");
    let addressPart = Nat32.toText(hash);
    
    // Format as Bitcoin address (bc1 prefix for native SegWit)
    "bc1" # addressPart # "q" # Int.toText(Time.now() % 1000000);
  };

  // Generate Ethereum-compatible address (42 characters)
  private func generateEthereumAddress(userId: UserId): Text {
    let principalBytes = Principal.toBlob(userId);
    let principalText = Principal.toText(userId);
    
    // Create deterministic key material from principal
    let keyMaterial = generateKeyMaterial(userId, "eth");
    
    // Generate Ethereum address format (simplified for demo)
    // In production, this would use proper Ethereum address generation
    let hash = Text.hash(principalText # "eth");
    let addressPart = Nat32.toText(hash);
    
    // Format as Ethereum address (0x prefix, 40 hex characters)
    "0x" # addressPart # Int.toText(Time.now() % 1000000);
  };

  // Generate ICP-based token address
  private func generateICPTokenAddress(userId: UserId, tokenSymbol: Text): Text {
    let principalBytes = Principal.toBlob(userId);
    let principalText = Principal.toText(userId);
    
    // Create token-specific subaccount
    let subaccount = generateSubaccountBytes(userId, tokenSymbol);
    
    // Convert to hex format
    let hexString = bytesToHex(subaccount);
    
    // Format as token address
    Text.toLowercase(tokenSymbol) # "_" # hexString;
  };

  // Generate Cycles address (special format for IC cycles)
  private func generateCyclesAddress(userId: UserId): Text {
    let principalText = Principal.toText(userId);
    let hash = Text.hash(principalText # "cycles");
    
    // Cycles are managed differently, use special format
    "cycles_" # Nat32.toText(hash) # "_" # Int.toText(Time.now() % 1000000);
  };

  // Generate subaccount bytes for deterministic address generation
  private func generateSubaccountBytes(userId: UserId, purpose: Text): [Nat8] {
    let principalBlob = Principal.toBlob(userId);
    let principalBytes = Blob.toArray(principalBlob);
    let purposeBytes = textToBytes(purpose);
    
    // Combine principal and purpose, then hash
    let combined = Array.append(principalBytes, purposeBytes);
    let hash = Text.hash(Array.foldLeft<Nat8, Text>(combined, "", func(acc, byte) {
      acc # Nat8.toText(byte);
    }));
    
    // Convert hash to 32 bytes
    hashToBytes(hash);
  };

  // Generate key material for address generation
  private func generateKeyMaterial(userId: UserId, purpose: Text): [Nat8] {
    let principalBlob = Principal.toBlob(userId);
    let principalBytes = Blob.toArray(principalBlob);
    let purposeBytes = textToBytes(purpose);
    let timestamp = Int.toText(Time.now());
    let timestampBytes = textToBytes(timestamp);
    
    // Combine all elements
    let combined = Array.append(principalBytes, Array.append(purposeBytes, timestampBytes));
    
    // Hash the combined data
    let hash = Text.hash(Array.foldLeft<Nat8, Text>(combined, "", func(acc, byte) {
      acc # Nat8.toText(byte);
    }));
    
    // Return as bytes
    hashToBytes(hash);
  };

  // Convert text to bytes
  private func textToBytes(text: Text): [Nat8] {
    let chars = Text.toIter(text);
    Array.map<Char, Nat8>(Iter.toArray(chars), func(char) {
      Nat8.fromNat(Nat32.toNat(Char.toNat32(char)));
    });
  };

  // Convert bytes to hex string
  private func bytesToHex(bytes: [Nat8]): Text {
    Array.foldLeft<Nat8, Text>(bytes, "", func(acc, byte) {
      acc # byteToHex(byte);
    });
  };

  // Convert single byte to hex
  private func byteToHex(byte: Nat8): Text {
    let high = byte >> 4;
    let low = byte & 15;
    hexDigit(high) # hexDigit(low);
  };

  // Convert 4-bit value to hex digit
  private func hexDigit(value: Nat8): Text {
    if (value < 10) {
      Nat8.toText(value);
    } else {
      switch (value) {
        case (10) { "a" };
        case (11) { "b" };
        case (12) { "c" };
        case (13) { "d" };
        case (14) { "e" };
        case (15) { "f" };
        case (_) { "0" };
      };
    };
  };

  // Convert hash to bytes (simplified)
  private func hashToBytes(hash: Nat32): [Nat8] {
    // Convert hash to 32 bytes (simplified implementation)
    let hashText = Nat32.toText(hash);
    let hashBytes = textToBytes(hashText);
    
    // Pad or truncate to 32 bytes
    if (Array.size(hashBytes) < 32) {
      // Pad with zeros - create a buffer and fill it
      let buffer = Buffer.Buffer<Nat8>(32);
      for (byte in hashBytes.vals()) {
        buffer.add(byte);
      };
      // Fill remaining with zeros
      let hashSize = Array.size(hashBytes);
      let remaining = if (hashSize < 32) 32 - hashSize else 0;
      if (remaining > 0) {
        let endIndex = if (remaining > 0) remaining - 1 else 0;
        for (i in Iter.range(0, endIndex)) {
        buffer.add(0);
        };
      };
      Buffer.toArray(buffer);
    } else if (Array.size(hashBytes) > 32) {
      // Truncate to 32 bytes by taking first 32 elements
      let buffer = Buffer.Buffer<Nat8>(32);
      var count = 0;
      for (byte in hashBytes.vals()) {
        if (count < 32) {
          buffer.add(byte);
          count := count + 1;
        };
      };
      Buffer.toArray(buffer);
    } else {
      hashBytes;
    };
  };

  // Generate account identifier from principal (for ICP ledger compatibility)
  private func generateAccountIdentifier(userId: UserId): Text {
    generateICPAccountIdentifier(userId);
  };

  // Generate subaccount for different purposes
  private func generateSubaccount(userId: UserId, purpose: Text): Text {
    let subaccountBytes = generateSubaccountBytes(userId, purpose);
    let hexString = bytesToHex(subaccountBytes);
    "sub_" # hexString;
  };

  // Convert CryptoWalletType to Text
  private func cryptoWalletTypeToText(walletType: CryptoWalletType): Text {
    switch (walletType) {
      case (#ICP) { "ICP" };
      case (#ckBTC) { "ckBTC" };
      case (#ckETH) { "ckETH" };
      case (#CHAT) { "CHAT" };
      case (#SNS1) { "SNS1" };
      case (#KINIC) { "KINIC" };
      case (#GHOST) { "GHOST" };
      case (#CAT) { "CAT" };
      case (#BOOM) { "BOOM" };
      case (#NTN) { "NTN" };
      case (#YUGE) { "YUGE" };
      case (#WUMBO) { "WUMBO" };
      case (#ALPACALB) { "ALPACALB" };
      case (#PARTY) { "PARTY" };
      case (#SNEED) { "SNEED" };
      case (#CLOWN) { "CLOWN" };
      case (#SHRIMP) { "SHRIMP" };
      case (#DOGMI) { "DOGMI" };
      case (#FOMO) { "FOMO" };
      case (#TRAX) { "TRAX" };
      case (#MOTOKO) { "MOTOKO" };
      case (#CKPEPE) { "CKPEPE" };
      case (#SONIC) { "SONIC" };
      case (#MOD) { "MOD" };
      case (#DAMONIC) { "DAMONIC" };
      case (#NICP) { "NICP" };
      case (#MEME) { "MEME" };
      case (#DRAGGINZ) { "DRAGGINZ" };
      case (#ELNA) { "ELNA" };
      case (#GLDT) { "GLDT" };
      case (#NANAS) { "NANAS" };
      case (#PANDA) { "PANDA" };
      case (#SEERS) { "SEERS" };
      case (#DSCVR) { "DSCVR" };
      case (#CYCLES) { "CYCLES" };
      case (#DKUMA) { "DKUMA" };
      case (#OPENCHAT) { "OPENCHAT" };
      case (#FIAT) { "FIAT" };
    };
  };

  // Convert Text to CryptoWalletType
  private func textToCryptoWalletType(text: Text): CryptoWalletType {
    switch (text) {
      case ("ICP") { #ICP };
      case ("ckBTC") { #ckBTC };
      case ("ckETH") { #ckETH };
      case ("CHAT") { #CHAT };
      case ("SNS1") { #SNS1 };
      case ("KINIC") { #KINIC };
      case ("GHOST") { #GHOST };
      case ("CAT") { #CAT };
      case ("BOOM") { #BOOM };
      case ("NTN") { #NTN };
      case ("YUGE") { #YUGE };
      case ("WUMBO") { #WUMBO };
      case ("ALPACALB") { #ALPACALB };
      case ("PARTY") { #PARTY };
      case ("SNEED") { #SNEED };
      case ("CLOWN") { #CLOWN };
      case ("SHRIMP") { #SHRIMP };
      case ("DOGMI") { #DOGMI };
      case ("FOMO") { #FOMO };
      case ("TRAX") { #TRAX };
      case ("MOTOKO") { #MOTOKO };
      case ("CKPEPE") { #CKPEPE };
      case ("SONIC") { #SONIC };
      case ("MOD") { #MOD };
      case ("DAMONIC") { #DAMONIC };
      case ("NICP") { #NICP };
      case ("MEME") { #MEME };
      case ("DRAGGINZ") { #DRAGGINZ };
      case ("ELNA") { #ELNA };
      case ("GLDT") { #GLDT };
      case ("NANAS") { #NANAS };
      case ("PANDA") { #PANDA };
      case ("SEERS") { #SEERS };
      case ("DSCVR") { #DSCVR };
      case ("CYCLES") { #CYCLES };
      case ("DKUMA") { #DKUMA };
      case ("OPENCHAT") { #OPENCHAT };
      case (_) { #FIAT };
    };
  };

  // Create default crypto wallet for a user - ONLY NST WALLET
  private func createDefaultCryptoWallets(userId: UserId): async () {
    let now = getCurrentTime();
    
    // Generate address for NST wallet
    let nstAddress = generateWalletAddress(userId, #ICP);
    let accountIdentifier = generateAccountIdentifier(userId);
    
    // Create ONLY the NISTO TOKEN (NST) wallet - this is the primary wallet
    let nstWalletId = generateId("crypto_wallet", nextCryptoWalletId);
    nextCryptoWalletId := nextCryptoWalletId + 1;
    
    let nstWallet: CryptoWallet = {
      id = nstWalletId;
      userId = userId;
      name = "Nisto Token";
      walletType = #ICP;
      currency = "NST";
      balance = 1000.0; // Give new users some initial NST tokens
      address = ?nstAddress;
      isExternal = false;
      externalWalletType = null;
      isActive = true;
      createdAt = now;
      updatedAt = now;
      lastSyncAt = null;
      metadata = ?("account_id:" # accountIdentifier # ",primary_wallet:true,auto_created:true");
    };
    
    cryptoWallets.put(nstWalletId, nstWallet);
    
    // Index the address
    addressToWallet.put(nstAddress, nstWalletId);
    
    // Update user's crypto wallets index - only NST wallet
    let currentCryptoWallets = Option.get(userCryptoWallets.get(userId), []);
    userCryptoWallets.put(userId, Array.append(currentCryptoWallets, [nstWalletId]));
  };

  // Generate deposit address for external wallets
  public shared(msg) func generateDepositAddress(
    walletType: Text
  ): async Result.Result<Text, Text> {
    let caller = msg.caller;
    
    // Validate wallet type
    let cryptoWalletType = textToCryptoWalletType(walletType);
    
    // Generate proper address
    let address = generateWalletAddress(caller, cryptoWalletType);
    
    #ok(address);
  };

  // Validate address format
  public query func validateAddress(address: Text, walletType: Text): async Bool {
    let cryptoWalletType = textToCryptoWalletType(walletType);
    
    switch (cryptoWalletType) {
      case (#ICP) {
        // ICP addresses start with "2vxsx-fae" and are 64+ characters
        Text.startsWith(address, #text("2vxsx-fae")) and Text.size(address) >= 64;
      };
      case (#ckBTC) {
        // Bitcoin addresses start with "bc1" and are 42+ characters
        Text.startsWith(address, #text("bc1")) and Text.size(address) >= 42;
      };
      case (#ckETH) {
        // Ethereum addresses start with "0x" and are 42 characters
        Text.startsWith(address, #text("0x")) and Text.size(address) == 42;
      };
      case (_) {
        // Generic validation for other tokens
        Text.size(address) >= 20 and not Text.startsWith(address, #text("0x"));
      };
    };
  };
  
  private func logAuditEvent(userId: ?UserId, action: Text, details: Text, success: Bool): async () {
    let auditId = generateId("audit", nextAuditLogId);
    nextAuditLogId += 1;
    
    let auditLog: AuditLog = {
      id = auditId;
      userId = userId;
      action = action;
      details = details;
      ipAddress = null; // Could be passed from request context
      userAgent = null; // Could be passed from request context
      timestamp = getCurrentTime();
      success = success;
    };
    
    auditLogs.put(auditId, auditLog);
  };

  // ============ USER MANAGEMENT WITH RECOVERY SUPPORT ============
  
  public shared(msg) func createUser(username: Text, displayName: Text, email: ?Text): async Result.Result<User, Text> {
    let caller = msg.caller;
    
    // Check if user already exists
    switch (users.get(caller)) {
      case (?existingUser) {
        return #err("User already exists");
      };
      case null {
        let now = getCurrentTime();
        let newUser: User = {
          id = caller;
          username = username;
          email = email;
          displayName = displayName;
          avatar = null;
          createdAt = now;
          updatedAt = now;
          preferences = getDefaultPreferences();
          isActive = true;
          recoverySetupCompleted = false;
          lastLoginAt = ?now;
          loginAttempts = 0;
          isLocked = false;
        };
        
        users.put(caller, newUser);
        
        // Index email if provided
        switch (email) {
          case (?emailAddr) {
            emailToUserId.put(emailAddr, caller);
          };
          case null {};
        };
        
        // Create a default wallet for the user
        let walletId = generateId("wallet", nextWalletId);
        nextWalletId += 1;
        
        let defaultWallet: Wallet = {
          id = walletId;
          userId = caller;
          name = "Main Wallet";
          type_ = "personal";
          currency = "KES";
          balance = 0.0;
          isActive = true;
          createdAt = now;
          updatedAt = now;
        };
        
        wallets.put(walletId, defaultWallet);
        
        // Update user's wallets index
        let currentWallets = Option.get(userWallets.get(caller), []);
        userWallets.put(caller, Array.append(currentWallets, [walletId]));
        
        // Create default crypto wallets
        await createDefaultCryptoWallets(caller);
        
        // Log audit event
        await logAuditEvent(?caller, "USER_CREATED", "User account created: " # username, true);
        
        return #ok(newUser);
      };
    };
  };
  
  public query(msg) func getUser(): async Result.Result<User, Text> {
    let caller = msg.caller;
    
    switch (users.get(caller)) {
      case (?user) { 
        #ok(user);
      };
      case null { #err("User not found") };
    };
  };

  // Auto-create user if they don't exist (for Internet Identity login)
  public shared(msg) func loginOrCreateUser(): async Result.Result<User, Text> {
    let caller = msg.caller;
    
    switch (users.get(caller)) {
      case (?user) { 
        // User exists, update last login
        let updatedUser: User = {
          id = user.id;
          username = user.username;
          email = user.email;
          displayName = user.displayName;
          avatar = user.avatar;
          createdAt = user.createdAt;
          updatedAt = user.updatedAt;
          preferences = user.preferences;
          isActive = user.isActive;
          recoverySetupCompleted = user.recoverySetupCompleted;
          lastLoginAt = ?getCurrentTime();
          loginAttempts = 0;
          isLocked = user.isLocked;
        };
        users.put(caller, updatedUser);
        await logAuditEvent(?caller, "USER_LOGIN", "User logged in", true);
        #ok(updatedUser);
      };
      case null { 
        // User doesn't exist, create new user automatically
        let now = getCurrentTime();
        let principalText = Principal.toText(caller);
        // Generate friendly username like "duck_sunset_1234"
        let animals: [Text] = ["duck","panda","lion","otter","eagle","whale","tiger","koala","rhino","fox","bear","owl","wolf"]; 
        let nouns: [Text] = ["sunset","river","forest","mountain","breeze","comet","ember","harbor","meadow","summit","valley","lagoon"]; 
        // Deterministic seed from principal
        let hash32: Nat32 = Text.hash(principalText);
        let aLen32 = Nat32.fromNat(animals.size());
        let nLen32 = Nat32.fromNat(nouns.size());
        let aIdx = Nat32.toNat(Nat32.rem(hash32, aLen32));
        let nIdx = Nat32.toNat(Nat32.rem(Nat32.div(hash32, 13), nLen32));
        let num = Nat32.toNat(Nat32.rem(Nat32.div(hash32, 17), 9000)) + 1000; // 1000-9999
        let username = animals[aIdx] # "_" # nouns[nIdx] # "_" # Nat.toText(num);
        let displayName = username;
        
        let newUser: User = {
          id = caller;
          username = username;
          email = null;
          displayName = displayName;
          avatar = null;
          createdAt = now;
          updatedAt = now;
          preferences = getDefaultPreferences();
          isActive = true;
          recoverySetupCompleted = false;
          lastLoginAt = ?now;
          loginAttempts = 0;
          isLocked = false;
        };
        
        users.put(caller, newUser);
        
        // Create a default wallet for the user
        let walletId = generateId("wallet", nextWalletId);
        nextWalletId += 1;
        
        let defaultWallet: Wallet = {
          id = walletId;
          userId = caller;
          name = "Main Wallet";
          type_ = "personal";
          currency = "KES";
          balance = 0.0;
          isActive = true;
          createdAt = now;
          updatedAt = now;
        };
        
        wallets.put(walletId, defaultWallet);
        
        // Update user's wallets index
        let currentWallets = Option.get(userWallets.get(caller), []);
        userWallets.put(caller, Array.append(currentWallets, [walletId]));
        
        // Create default crypto wallets
        await createDefaultCryptoWallets(caller);
        
        // Log audit event
        await logAuditEvent(?caller, "USER_AUTO_CREATED", "User account auto-created on login: " # username, true);
        
        #ok(newUser);
      };
    };
    };

  // Check if user exists (returns true/false)
  public shared(msg) func userExists(): async Bool {
    let caller = msg.caller;
    switch (users.get(caller)) {
      case (?user) { true };
      case null { false };
    };
  };

  // Get current user's principal ID
  public query(msg) func getPrincipalId(): async Text {
    Principal.toText(msg.caller);
  };

  // Link new Internet Identity to existing account after recovery
  public shared(msg) func linkRecoveredAccount(
    recoveryToken: Text,
    newPrincipalId: Principal
  ): async Result.Result<User, Text> {
    let caller = msg.caller;
    
    // Find recovery request by token
    let requests = recoveryRequests.entries() |> Iter.toArray(_);
    let matchingRequest = Array.find<(Text, RecoveryRequest)>(requests, func((id, req)) {
      switch (req.recoveryToken) {
        case (?token) { token == recoveryToken and req.status == "verified" };
        case null { false };
      };
    });
    
    switch (matchingRequest) {
      case null { return #err("Invalid recovery token"); };
      case (?(requestId, request)) {
        if (isCodeExpired(request.expiresAt)) {
          return #err("Recovery token has expired");
        };
        
        switch (request.userId) {
          case null { return #err("User not found for this recovery"); };
          case (?oldUserId) {
            // Get the old user data
            switch (users.get(oldUserId)) {
              case null { return #err("Original user data not found"); };
              case (?oldUser) {
                // Create new user with new principal ID but keep old data
                let now = getCurrentTime();
                let newUser: User = {
                  id = newPrincipalId;
                  username = oldUser.username;
                  email = oldUser.email;
                  displayName = oldUser.displayName;
                  avatar = oldUser.avatar;
                  createdAt = oldUser.createdAt;
                  updatedAt = now;
                  preferences = oldUser.preferences;
                  isActive = true;
                  recoverySetupCompleted = oldUser.recoverySetupCompleted;
                  lastLoginAt = ?now;
                  loginAttempts = 0;
                  isLocked = false;
                };
                
                // Store user with new principal ID
                users.put(newPrincipalId, newUser);
                
                // Transfer all wallets to new principal ID
                let oldWallets = Option.get(userWallets.get(oldUserId), []);
                for (walletId in oldWallets.vals()) {
                  switch (wallets.get(walletId)) {
                    case (?wallet) {
                      let updatedWallet: Wallet = {
                        id = wallet.id;
                        userId = newPrincipalId;
                        name = wallet.name;
                        type_ = wallet.type_;
                        currency = wallet.currency;
                        balance = wallet.balance;
                        isActive = wallet.isActive;
                        createdAt = wallet.createdAt;
                        updatedAt = now;
                      };
                      wallets.put(walletId, updatedWallet);
                    };
                    case null {};
                  };
                };
                
                // Transfer wallet ownership
                userWallets.put(newPrincipalId, oldWallets);
                
                // Transfer all transactions to new principal ID
                let oldTransactions = Option.get(userTransactions.get(oldUserId), []);
                for (txnId in oldTransactions.vals()) {
                  switch (transactions.get(txnId)) {
                    case (?txn) {
                      let updatedTxn: Transaction = {
                        id = txn.id;
                        walletId = txn.walletId;
                        userId = newPrincipalId;
                        type_ = txn.type_;
                        amount = txn.amount;
                        currency = txn.currency;
                        category = txn.category;
                        description = txn.description;
                        timestamp = txn.timestamp;
                        status = txn.status;
                        metadata = txn.metadata;
                      };
                      transactions.put(txnId, updatedTxn);
                    };
                    case null {};
                  };
                };
                
                // Transfer transaction ownership
                userTransactions.put(newPrincipalId, oldTransactions);
                
                // Transfer all recovery methods to new principal ID
                let oldRecoveryMethods = Option.get(userRecoveryMethods.get(oldUserId), []);
                for (methodId in oldRecoveryMethods.vals()) {
                  switch (recoveryMethods.get(methodId)) {
                    case (?method) {
                      let updatedMethod: RecoveryMethod = {
                        id = method.id;
                        userId = newPrincipalId;
                        methodType = method.methodType;
                        value = method.value;
                        isVerified = method.isVerified;
                        isActive = method.isActive;
                        createdAt = method.createdAt;
                        verifiedAt = method.verifiedAt;
                        metadata = method.metadata;
                      };
                      recoveryMethods.put(methodId, updatedMethod);
                    };
                    case null {};
                  };
                };
                
                // Transfer recovery methods ownership
                userRecoveryMethods.put(newPrincipalId, oldRecoveryMethods);
                
                // Mark recovery as completed
                let updatedRequest: RecoveryRequest = {
                  id = request.id;
                  userId = ?newPrincipalId; // Update to new principal ID
                  identifier = request.identifier;
                  recoveryMethod = request.recoveryMethod;
                  status = "completed";
                  verificationCode = request.verificationCode;
                  recoveryToken = request.recoveryToken;
                  expiresAt = request.expiresAt;
                  createdAt = request.createdAt;
                  verifiedAt = request.verifiedAt;
                  completedAt = ?now;
                  metadata = ?"Account linked to new Internet Identity";
                };
                
                recoveryRequests.put(requestId, updatedRequest);
                
                // Clean up old user data (optional - you might want to keep for audit)
                // users.delete(oldUserId);
                
                await logAuditEvent(?newPrincipalId, "ACCOUNT_RECOVERED_LINKED", "Account recovered and linked to new Internet Identity", true);
                
                return #ok(newUser);
              };
            };
          };
        };
      };
    };
  };
   
    public shared(msg) func updateUser(displayName: ?Text, avatar: ?Text): async Result.Result<User, Text> {
    let caller = msg.caller;
    
    switch (users.get(caller)) {
      case (?user) {
        let updatedUser: User = {
          id = user.id;
          username = user.username;
          email = user.email;
          displayName = switch (displayName) {
            case (?name) { name };
            case null { user.displayName };
          };
          avatar = switch (avatar) {
            case (?av) { ?av };
            case null { user.avatar };
          };
          createdAt = user.createdAt;
          updatedAt = getCurrentTime();
          preferences = user.preferences;
          isActive = user.isActive;
          recoverySetupCompleted = user.recoverySetupCompleted;
          lastLoginAt = user.lastLoginAt;
          loginAttempts = user.loginAttempts;
          isLocked = user.isLocked;
        };
        
        users.put(caller, updatedUser);
        await logAuditEvent(?caller, "USER_UPDATED", "User profile updated", true);
        #ok(updatedUser);
      };
      case null { #err("User not found") };
    };
  };
  
  // ============ RECOVERY METHODS MANAGEMENT ============
  
  public shared(msg) func addRecoveryMethod(
    methodType: Text,
    value: Text,
    metadata: ?Text
  ): async Result.Result<RecoveryMethod, Text> {
    let caller = msg.caller;
    
    // Check if user exists
    switch (users.get(caller)) {
      case null { return #err("User not found"); };
      case (?user) {
        let recoveryId = generateId("recovery", nextRecoveryMethodId);
        nextRecoveryMethodId += 1;
        
        let now = getCurrentTime();
        let newRecoveryMethod: RecoveryMethod = {
          id = recoveryId;
          userId = caller;
          methodType = methodType;
          value = value;
          isVerified = true; // No OTP required for now - directly verified
          isActive = true;
          createdAt = now;
          verifiedAt = ?now; // Set as verified immediately
          metadata = metadata;
        };
        
        recoveryMethods.put(recoveryId, newRecoveryMethod);
        
        // Update user's recovery methods index
        let currentMethods = Option.get(userRecoveryMethods.get(caller), []);
        userRecoveryMethods.put(caller, Array.append(currentMethods, [recoveryId]));
        
        // Index email/phone for user lookup
        switch (methodType) {
          case ("email" or "backup_email") {
            emailToUserId.put(value, caller);
          };
          case ("phone") {
            phoneToUserId.put(value, caller);
          };
          case (_) {};
        };
        
        await logAuditEvent(?caller, "RECOVERY_METHOD_ADDED", "Recovery method added: " # methodType, true);
        
        return #ok(newRecoveryMethod);
      };
    };
  };

  // Verify recovery method with OTP
  public shared(msg) func verifyRecoveryMethod(
    recoveryMethodId: Text,
    otpId: Text,
    otpCode: Text
  ): async Result.Result<RecoveryMethod, Text> {
    let caller = msg.caller;
    
    // Verify OTP first
    let otpVerifyResult = await verifyOTP(otpId, otpCode);
    switch (otpVerifyResult) {
      case (#err(error)) { return #err(error); };
      case (#ok(verified)) {
        // Update recovery method as verified
        switch (recoveryMethods.get(recoveryMethodId)) {
          case null { return #err("Recovery method not found"); };
          case (?method) {
            if (method.userId != caller) {
              return #err("Unauthorized");
            };
            
            let now = getCurrentTime();
            let verifiedMethod: RecoveryMethod = {
              id = method.id;
              userId = method.userId;
              methodType = method.methodType;
              value = method.value;
              isVerified = true;
              isActive = method.isActive;
              createdAt = method.createdAt;
              verifiedAt = ?now;
              metadata = method.metadata;
            };
            
            recoveryMethods.put(recoveryMethodId, verifiedMethod);
            
            await logAuditEvent(?caller, "RECOVERY_METHOD_VERIFIED", "Recovery method verified: " # method.methodType, true);
            
            return #ok(verifiedMethod);
          };
        };
      };
    };
  };


  
  public query(msg) func getUserRecoveryMethods(): async Result.Result<[RecoveryMethod], Text> {
    let caller = msg.caller;
    
    switch (userRecoveryMethods.get(caller)) {
      case null { #ok([]) };
      case (?methodIds) {
        let methods = Array.mapFilter<Text, RecoveryMethod>(methodIds, func(id) {
          recoveryMethods.get(id);
        });
        #ok(methods);
      };
    };
  };
  
  public shared(msg) func addSecurityQuestions(
    questions: [(Text, Text)] // (question, answer) pairs
  ): async Result.Result<[SecurityQuestion], Text> {
    let caller = msg.caller;
    
    // Check if user exists
    switch (users.get(caller)) {
      case null { return #err("User not found"); };
      case (?user) {
        let results = Buffer.Buffer<SecurityQuestion>(questions.size());
        
        for ((question, answer) in questions.vals()) {
          let questionId = generateId("security_q", nextSecurityQuestionId);
          nextSecurityQuestionId += 1;
          
          let now = getCurrentTime();
          let securityQuestion: SecurityQuestion = {
            id = questionId;
            userId = caller;
            question = question;
            answerHash = hashPassword(answer); // Hash the answer for security
            createdAt = now;
            isActive = true;
          };
          
          securityQuestions.put(questionId, securityQuestion);
          results.add(securityQuestion);
          
          // Update user's security questions index
          let currentQuestions = Option.get(userSecurityQuestions.get(caller), []);
          userSecurityQuestions.put(caller, Array.append(currentQuestions, [questionId]));
        };
        
        await logAuditEvent(?caller, "SECURITY_QUESTIONS_ADDED", "Security questions added: " # Int.toText(questions.size()), true);
        return #ok(Buffer.toArray(results));
      };
    };
  };
  
  public shared(msg) func addEmergencyContact(
    name: Text,
    email: Text,
    relationship: Text
  ): async Result.Result<EmergencyContact, Text> {
    let caller = msg.caller;
    
    // Check if user exists
    switch (users.get(caller)) {
      case null { return #err("User not found"); };
      case (?user) {
        let contactId = generateId("emergency", nextEmergencyContactId);
        nextEmergencyContactId += 1;
        
        let now = getCurrentTime();
        let emergencyContact: EmergencyContact = {
          id = contactId;
          userId = caller;
          name = name;
          email = email;
          relationship = relationship;
          isVerified = false; // Will be verified separately
          createdAt = now;
          verifiedAt = null;
        };
        
        emergencyContacts.put(contactId, emergencyContact);
        
        // Update user's emergency contacts index
        let currentContacts = Option.get(userEmergencyContacts.get(caller), []);
        userEmergencyContacts.put(caller, Array.append(currentContacts, [contactId]));
        
        await logAuditEvent(?caller, "EMERGENCY_CONTACT_ADDED", "Emergency contact added: " # name, true);
        return #ok(emergencyContact);
      };
    };
  };
  
  public shared(msg) func completeRecoverySetup(): async Result.Result<User, Text> {
    let caller = msg.caller;
    
    switch (users.get(caller)) {
      case null { return #err("User not found"); };
      case (?user) {
        let updatedUser: User = {
          id = user.id;
          username = user.username;
          email = user.email;
          displayName = user.displayName;
          avatar = user.avatar;
          createdAt = user.createdAt;
          updatedAt = getCurrentTime();
          preferences = user.preferences;
          isActive = user.isActive;
          recoverySetupCompleted = true;
          lastLoginAt = user.lastLoginAt;
          loginAttempts = user.loginAttempts;
          isLocked = user.isLocked;
        };
        
        users.put(caller, updatedUser);
        await logAuditEvent(?caller, "RECOVERY_SETUP_COMPLETED", "User completed recovery setup", true);
        return #ok(updatedUser);
      };
    };
  };
  
  // ============ VERIFICATION SYSTEM ============
  
  public func sendVerificationCode(
    identifier: Text, // email or phone
    codeType: Text
  ): async Result.Result<Text, Text> {
    let codeId = generateId("verify", nextVerificationCodeId);
    nextVerificationCodeId += 1;
    
    let code = generateRandomCode();
    let now = getCurrentTime();
    let expiresAt = now + (15 * 60 * 1000000000); // 15 minutes
    
    let verificationCode: VerificationCode = {
      id = codeId;
      userId = null; // Will be set when user is identified
      identifier = identifier;
      code = code;
      codeType = codeType;
      expiresAt = expiresAt;
      isUsed = false;
      attempts = 0;
      createdAt = now;
    };
    
    verificationCodes.put(codeId, verificationCode);
    
    // In production, send actual email/SMS here
    // For demo, we'll just log it
    await logAuditEvent(null, "VERIFICATION_CODE_SENT", "Code sent to: " # identifier # " (" # codeType # ")", true);
    
    return #ok(code); // In production, don't return the actual code
  };
  
  public func verifyCode(
    identifier: Text,
    code: Text,
    codeType: Text
  ): async Result.Result<Text, Text> {
    // Find the verification code
    let codes = verificationCodes.entries() |> Iter.toArray(_);
    let matchingCode = Array.find<(Text, VerificationCode)>(codes, func((id, vc)) {
      vc.identifier == identifier and vc.code == code and vc.codeType == codeType and not vc.isUsed
    });
    
    switch (matchingCode) {
      case null { 
        await logAuditEvent(null, "VERIFICATION_FAILED", "Invalid code for: " # identifier, false);
        return #err("Invalid or expired verification code");
      };
      case (?(id, vc)) {
        if (isCodeExpired(vc.expiresAt)) {
          await logAuditEvent(null, "VERIFICATION_FAILED", "Expired code for: " # identifier, false);
          return #err("Verification code has expired");
        };
        
        // Mark code as used
        let updatedCode: VerificationCode = {
          id = vc.id;
          userId = vc.userId;
          identifier = vc.identifier;
          code = vc.code;
          codeType = vc.codeType;
          expiresAt = vc.expiresAt;
          isUsed = true;
          attempts = vc.attempts + 1;
          createdAt = vc.createdAt;
        };
        
        verificationCodes.put(id, updatedCode);
        
        await logAuditEvent(vc.userId, "VERIFICATION_SUCCESS", "Code verified for: " # identifier, true);
        return #ok("Verification successful");
      };
    };
  };
  
  // ============ ACCOUNT RECOVERY SYSTEM ============
  
  public func initiateRecovery(
    identifier: Text,
    recoveryMethod: Text
  ): async Result.Result<{
    recoveryRequestId: Text;
    message: Text;
    securityQuestions: ?[(Text, Text)]; // (id, question) pairs if security method
  }, Text> {
    let requestId = generateId("recovery_req", nextRecoveryRequestId);
    nextRecoveryRequestId += 1;
    
    let now = getCurrentTime();
    let expiresAt = now + (24 * 60 * 60 * 1000000000); // 24 hours
    
    // Find user by identifier (email or phone)
    let userId = switch (recoveryMethod) {
      case ("email" or "backup_email") { emailToUserId.get(identifier) };
      case ("phone") { phoneToUserId.get(identifier) };
      case (_) { null };
    };
    
    let recoveryRequest: RecoveryRequest = {
      id = requestId;
      userId = userId;
      identifier = identifier;
      recoveryMethod = recoveryMethod;
      status = "pending";
      verificationCode = null;
      recoveryToken = null;
      expiresAt = expiresAt;
      createdAt = now;
      verifiedAt = null;
      completedAt = null;
      metadata = null;
    };
    
    recoveryRequests.put(requestId, recoveryRequest);
    
    switch (recoveryMethod) {
      case ("email" or "phone") {
        // Send verification code
        let codeResult = await sendVerificationCode(identifier, "recovery_request");
        switch (codeResult) {
          case (#ok(code)) {
            await logAuditEvent(userId, "RECOVERY_INITIATED", "Recovery initiated for: " # identifier, true);
            return #ok({
              recoveryRequestId = requestId;
              message = "Verification code sent to " # identifier;
              securityQuestions = null;
            });
          };
          case (#err(error)) {
            return #err("Failed to send verification code: " # error);
          };
        };
      };
      case ("security") {
        // Get security questions for the user
        switch (userId) {
          case null { return #err("No user found for this recovery method"); };
          case (?uid) {
            let questionIds = Option.get(userSecurityQuestions.get(uid), []);
            let questions = Array.mapFilter<Text, (Text, Text)>(questionIds, func(id) {
              switch (securityQuestions.get(id)) {
                case (?sq) { ?(sq.id, sq.question) };
                case null { null };
              };
            });
            
            return #ok({
              recoveryRequestId = requestId;
              message = "Please answer your security questions";
              securityQuestions = ?questions;
            });
          };
        };
      };
      case ("emergency") {
        // Notify emergency contacts (in production, send emails)
        await logAuditEvent(userId, "RECOVERY_EMERGENCY_INITIATED", "Emergency recovery initiated for: " # identifier, true);
        return #ok({
          recoveryRequestId = requestId;
          message = "Emergency contact has been notified. Recovery may take 24-48 hours.";
          securityQuestions = null;
        });
      };
      case (_) {
        return #err("Unsupported recovery method");
      };
    };
  };
  
  public func verifyRecovery(
    recoveryRequestId: Text,
    verificationCode: ?Text,
    securityAnswers: ?[(Text, Text)] // (questionId, answer) pairs
  ): async Result.Result<Text, Text> {
    switch (recoveryRequests.get(recoveryRequestId)) {
      case null { return #err("Recovery request not found"); };
      case (?request) {
        if (isCodeExpired(request.expiresAt)) {
          return #err("Recovery request has expired");
        };
        
        var verified = false;
        
        switch (request.recoveryMethod) {
          case ("email" or "phone") {
            // Verify code
            switch (verificationCode) {
              case null { return #err("Verification code required"); };
              case (?code) {
                let verifyResult = await verifyCode(request.identifier, code, "recovery_request");
                switch (verifyResult) {
                  case (#ok(_)) { verified := true; };
                  case (#err(error)) { return #err(error); };
                };
              };
            };
          };
          case ("security") {
            // Verify security answers
            switch (securityAnswers) {
              case null { return #err("Security answers required"); };
              case (?answers) {
                var correctAnswers = 0;
                for ((questionId, answer) in answers.vals()) {
                  switch (securityQuestions.get(questionId)) {
                    case (?sq) {
                      if (sq.answerHash == hashPassword(answer)) {
                        correctAnswers += 1;
                      };
                    };
                    case null {};
                  };
                };
                verified := correctAnswers >= answers.size();
              };
            };
          };
          case ("emergency") {
            // For emergency recovery, this would typically require manual approval
            verified := true; // Simplified for demo
          };
          case (_) {
            return #err("Unsupported recovery method");
          };
        };
        
        if (verified) {
          let recoveryToken = generateRecoveryToken();
          let updatedRequest: RecoveryRequest = {
            id = request.id;
            userId = request.userId;
            identifier = request.identifier;
            recoveryMethod = request.recoveryMethod;
            status = "verified";
            verificationCode = verificationCode;
            recoveryToken = ?recoveryToken;
            expiresAt = request.expiresAt;
            createdAt = request.createdAt;
            verifiedAt = ?getCurrentTime();
            completedAt = null;
            metadata = request.metadata;
          };
          
          recoveryRequests.put(recoveryRequestId, updatedRequest);
          
          await logAuditEvent(request.userId, "RECOVERY_VERIFIED", "Recovery verified for request: " # recoveryRequestId, true);
          return #ok(recoveryToken);
        } else {
          await logAuditEvent(request.userId, "RECOVERY_VERIFICATION_FAILED", "Recovery verification failed for request: " # recoveryRequestId, false);
          return #err("Verification failed");
        };
      };
    };
  };
  
  public func completeRecovery(
    recoveryToken: Text,
    newDeviceInfo: ?Text
  ): async Result.Result<{
    userId: Principal;
    instructions: Text;
  }, Text> {
    // Find recovery request by token
    let requests = recoveryRequests.entries() |> Iter.toArray(_);
    let matchingRequest = Array.find<(Text, RecoveryRequest)>(requests, func((id, req)) {
      switch (req.recoveryToken) {
        case (?token) { token == recoveryToken and req.status == "verified" };
        case null { false };
      };
    });
    
    switch (matchingRequest) {
      case null { return #err("Invalid recovery token"); };
      case (?(requestId, request)) {
        if (isCodeExpired(request.expiresAt)) {
          return #err("Recovery token has expired");
        };
        
        switch (request.userId) {
          case null { return #err("User not found for this recovery"); };
          case (?userId) {
            // Mark recovery as completed
            let updatedRequest: RecoveryRequest = {
              id = request.id;
              userId = request.userId;
              identifier = request.identifier;
              recoveryMethod = request.recoveryMethod;
              status = "completed";
              verificationCode = request.verificationCode;
              recoveryToken = request.recoveryToken;
              expiresAt = request.expiresAt;
              createdAt = request.createdAt;
              verifiedAt = request.verifiedAt;
              completedAt = ?getCurrentTime();
              metadata = newDeviceInfo;
            };
            
            recoveryRequests.put(requestId, updatedRequest);
            
            // Reset user login attempts
            switch (users.get(userId)) {
              case (?user) {
                let updatedUser: User = {
                  id = user.id;
                  username = user.username;
                  email = user.email;
                  displayName = user.displayName;
                  avatar = user.avatar;
                  createdAt = user.createdAt;
                  updatedAt = getCurrentTime();
                  preferences = user.preferences;
                  isActive = true;
                  recoverySetupCompleted = user.recoverySetupCompleted;
                  lastLoginAt = ?getCurrentTime();
                  loginAttempts = 0;
                  isLocked = false;
                };
                users.put(userId, updatedUser);
              };
              case null {};
            };
            
            await logAuditEvent(?userId, "RECOVERY_COMPLETED", "Account recovery completed for request: " # requestId, true);
            
            return #ok({
              userId = userId;
              instructions = "Account recovery completed successfully. You can now access your account with your Internet Identity. Please update your recovery methods if needed.";
            });
          };
        };
      };
    };
  };
  
  // ============ WALLET MANAGEMENT ============
  
  public shared(msg) func createWallet(name: Text, type_: Text, currency: Text): async Result.Result<Wallet, Text> {
    let caller = msg.caller;
    
    // Check if user exists
    switch (users.get(caller)) {
      case null { return #err("User not found"); };
      case (?user) {
        let walletId = generateId("wallet", nextWalletId);
        nextWalletId += 1;
        
        let now = getCurrentTime();
        let newWallet: Wallet = {
          id = walletId;
          userId = caller;
          name = name;
          type_ = type_;
          currency = currency;
          balance = 0.0;
          isActive = true;
          createdAt = now;
          updatedAt = now;
        };
        
        wallets.put(walletId, newWallet);
        
        // Update user's wallets index
        let currentWallets = Option.get(userWallets.get(caller), []);
        userWallets.put(caller, Array.append(currentWallets, [walletId]));
        
        await logAuditEvent(?caller, "WALLET_CREATED", "Wallet created: " # name, true);
        return #ok(newWallet);
      };
    };
  };
  
  public query(msg) func getUserWallets(): async Result.Result<[Wallet], Text> {
    let caller = msg.caller;
    
    switch (userWallets.get(caller)) {
      case null { #ok([]) };
      case (?walletIds) {
        let walletsArray = Array.mapFilter<Text, Wallet>(walletIds, func(id) {
          wallets.get(id);
        });
        #ok(walletsArray);
      };
    };
  };
  
  public shared(msg) func getWallet(walletId: Text): async Result.Result<Wallet, Text> {
    let caller = msg.caller;
    
    switch (wallets.get(walletId)) {
      case null { #err("Wallet not found") };
      case (?wallet) {
        if (wallet.userId != caller) {
          return #err("Unauthorized");
        };
        #ok(wallet);
      };
    };
  };
  
  // ============ TRANSACTION MANAGEMENT ============
  
  public shared(msg) func createTransaction(
    walletId: Text,
    type_: Text,
    amount: Float,
    category: Text,
    description: Text
  ): async Result.Result<Transaction, Text> {
    let caller = msg.caller;
    
    // Verify wallet ownership
    switch (wallets.get(walletId)) {
      case null { return #err("Wallet not found"); };
      case (?wallet) {
        if (wallet.userId != caller) {
          return #err("Unauthorized");
        };
        
        let transactionId = generateId("txn", nextTransactionId);
        nextTransactionId += 1;
        
        let now = getCurrentTime();
        let newTransaction: Transaction = {
          id = transactionId;
          walletId = walletId;
          userId = caller;
          type_ = type_;
          amount = amount;
          currency = wallet.currency;
          category = category;
          description = description;
          timestamp = now;
          status = "completed";
          metadata = null;
        };
        
        transactions.put(transactionId, newTransaction);
        
        // Update wallet balance
        let newBalance = switch (type_) {
          case ("income") { wallet.balance + amount };
          case ("expense") { wallet.balance - amount };
          case (_) { wallet.balance };
        };
        
        let updatedWallet: Wallet = {
          id = wallet.id;
          userId = wallet.userId;
          name = wallet.name;
          type_ = wallet.type_;
          currency = wallet.currency;
          balance = newBalance;
          isActive = wallet.isActive;
          createdAt = wallet.createdAt;
          updatedAt = now;
        };
        
        wallets.put(walletId, updatedWallet);
        
        // Update user's transactions index
        let currentTransactions = Option.get(userTransactions.get(caller), []);
        userTransactions.put(caller, Array.append(currentTransactions, [transactionId]));
        
        await logAuditEvent(?caller, "TRANSACTION_CREATED", "Transaction created: " # type_ # " " # Float.toText(amount), true);
        return #ok(newTransaction);
      };
    };
  };
  
  public query(msg) func getUserTransactions(): async Result.Result<[Transaction], Text> {
    let caller = msg.caller;
    
    switch (userTransactions.get(caller)) {
      case null { #ok([]) };
      case (?transactionIds) {
        let transactionsArray = Array.mapFilter<Text, Transaction>(transactionIds, func(id) {
          transactions.get(id);
        });
        #ok(Array.reverse(transactionsArray)); // Most recent first
      };
    };
  };
  
  // ============ BUDGET MANAGEMENT ============
  
  public shared(msg) func createBudget(
    name: Text,
    category: Text,
    amount: Float,
    period: Text,
    startDate: Int,
    endDate: Int
  ): async Result.Result<Budget, Text> {
    let caller = msg.caller;
    
    // Check if user exists
    switch (users.get(caller)) {
      case null { return #err("User not found"); };
      case (?user) {
        let budgetId = generateId("budget", nextBudgetId);
        nextBudgetId += 1;
        
        let newBudget: Budget = {
          id = budgetId;
          userId = caller;
          name = name;
          category = category;
          amount = amount;
          spent = 0.0;
          period = period;
          startDate = startDate;
          endDate = endDate;
          isActive = true;
        };
        
        budgets.put(budgetId, newBudget);
        await logAuditEvent(?caller, "BUDGET_CREATED", "Budget created: " # name, true);
        return #ok(newBudget);
      };
    };
  };
  
  public query(msg) func getUserBudgets(): async Result.Result<[Budget], Text> {
    let caller = msg.caller;
    
    let userBudgets = Array.mapFilter<(Text, Budget), Budget>(
      Array.filter<(Text, Budget)>(
        budgets.entries() |> Iter.toArray(_),
        func((id, budget)) { budget.userId == caller }
      ),
      func((id, budget)) { ?budget }
    );
    
    #ok(userBudgets);
  };
  
  // ============ GOAL MANAGEMENT ============
  
  public shared(msg) func createGoal(
    title: Text,
    description: Text,
    targetAmount: Float,
    currency: Text,
    targetDate: ?Int,
    category: Text
  ): async Result.Result<Goal, Text> {
    let caller = msg.caller;
    
    // Check if user exists
    switch (users.get(caller)) {
      case null { return #err("User not found"); };
      case (?user) {
        let goalId = generateId("goal", nextGoalId);
        nextGoalId += 1;
        
        let now = getCurrentTime();
        let newGoal: Goal = {
          id = goalId;
          userId = caller;
          title = title;
          description = description;
          targetAmount = targetAmount;
          currentAmount = 0.0;
          currency = currency;
          targetDate = targetDate;
          category = category;
          isActive = true;
          isAchieved = false;
          createdAt = now;
          updatedAt = now;
        };
        
        goals.put(goalId, newGoal);
        await logAuditEvent(?caller, "GOAL_CREATED", "Goal created: " # title, true);
        return #ok(newGoal);
      };
    };
  };
  
  public query(msg) func getUserGoals(): async Result.Result<[Goal], Text> {
    let caller = msg.caller;
    
    let userGoals = Array.mapFilter<(Text, Goal), Goal>(
      Array.filter<(Text, Goal)>(
        goals.entries() |> Iter.toArray(_),
        func((id, goal)) { goal.userId == caller }
      ),
      func((id, goal)) { ?goal }
    );
    
    #ok(userGoals);
  };
  
  public shared(msg) func updateGoalProgress(goalId: Text, amount: Float): async Result.Result<Goal, Text> {
    let caller = msg.caller;
    
    switch (goals.get(goalId)) {
      case null { return #err("Goal not found"); };
      case (?goal) {
        if (goal.userId != caller) {
          return #err("Unauthorized");
        };
        
        let newCurrentAmount = goal.currentAmount + amount;
        let isAchieved = newCurrentAmount >= goal.targetAmount;
        
        let updatedGoal: Goal = {
          id = goal.id;
          userId = goal.userId;
          title = goal.title;
          description = goal.description;
          targetAmount = goal.targetAmount;
          currentAmount = newCurrentAmount;
          currency = goal.currency;
          targetDate = goal.targetDate;
          category = goal.category;
          isActive = goal.isActive;
          isAchieved = isAchieved;
          createdAt = goal.createdAt;
          updatedAt = getCurrentTime();
        };
        
        goals.put(goalId, updatedGoal);
        await logAuditEvent(?caller, "GOAL_UPDATED", "Goal progress updated: " # goal.title, true);
        return #ok(updatedGoal);
      };
    };
  };
  
  // ============ ANALYTICS & INSIGHTS ============
  
  public query(msg) func getDashboardStats(): async Result.Result<{
    totalBalance: Float;
    monthlySpent: Float;
    activeWallets: Nat;
    goalsProgress: Float;
  }, Text> {
    let caller = msg.caller;
    
    // Check if user exists
    switch (users.get(caller)) {
      case null { return #err("User not found"); };
      case (?user) {
        // Calculate total balance across all wallets
        let userWalletsList = Option.get(userWallets.get(caller), []);
        var totalBalance: Float = 0.0;
        var activeWallets = 0;
        
        for (walletId in userWalletsList.vals()) {
          switch (wallets.get(walletId)) {
            case (?wallet) {
              if (wallet.isActive) {
                totalBalance += wallet.balance;
                activeWallets += 1;
              };
            };
            case null {};
          };
        };
        
        // Calculate monthly spending (simplified)
        let userTransactionsList = Option.get(userTransactions.get(caller), []);
        var monthlySpent: Float = 0.0;
        let currentTime = getCurrentTime();
        let monthAgo = currentTime - (30 * 24 * 60 * 60 * 1000000000); // 30 days ago
        
        for (transactionId in userTransactionsList.vals()) {
          switch (transactions.get(transactionId)) {
            case (?transaction) {
              if (transaction.timestamp >= monthAgo and transaction.type_ == "expense") {
                monthlySpent += transaction.amount;
              };
            };
            case null {};
          };
        };
        
        // Calculate goals progress
        let userGoalsList = Array.mapFilter<(Text, Goal), Goal>(
          Array.filter<(Text, Goal)>(
            goals.entries() |> Iter.toArray(_),
            func((id, goal)) { goal.userId == caller }
          ),
          func((id, goal)) { ?goal }
        );
        var goalsProgress: Float = 0.0;
        
        if (userGoalsList.size() > 0) {
          var totalProgress: Float = 0.0;
          var activeGoalsCount = 0;
          
          for (goal in userGoalsList.vals()) {
            if (goal.isActive and not goal.isAchieved) {
                totalProgress := totalProgress + (goal.currentAmount / goal.targetAmount) * 100.0;
                activeGoalsCount := activeGoalsCount + 1;
            };
          };
          
          if (activeGoalsCount > 0) {
            goalsProgress := totalProgress / Float.fromInt(activeGoalsCount);
          };
        };
        
        let stats = {
          totalBalance = totalBalance;
          monthlySpent = monthlySpent;
          activeWallets = activeWallets;
          goalsProgress = goalsProgress;
        };
        
        return #ok(stats);
      };
    };
  };
  
  // ============ AUDIT AND MONITORING ============
  
  public shared(msg) func getUserAuditLogs(): async Result.Result<[AuditLog], Text> {
    let caller = msg.caller;
    
    let userLogs = Array.mapFilter<(Text, AuditLog), AuditLog>(
      Array.filter<(Text, AuditLog)>(
        auditLogs.entries() |> Iter.toArray(_),
        func((id, log)) { 
          switch (log.userId) {
            case (?userId) { userId == caller };
            case null { false };
          };
        }
      ),
      func((id, log)) { ?log }
    );
    
    #ok(Array.reverse(userLogs)); // Most recent first
  };
  
  // ============ CRYPTO WALLET MANAGEMENT ============
  
  public shared(msg) func createCryptoWallet(
    name: Text,
    walletType: Text,
    isExternal: Bool,
    externalWalletType: ?Text,
    address: ?Text
  ): async Result.Result<CryptoWallet, Text> {
    let caller = msg.caller;
    
    // Check if user exists
    switch (users.get(caller)) {
      case null { return #err("User not found"); };
      case (?user) {
        let cryptoWalletId = generateId("crypto_wallet", nextCryptoWalletId);
        nextCryptoWalletId += 1;
        
        let now = getCurrentTime();
        let cryptoWalletTypeVar = textToCryptoWalletType(walletType);
        
        let newCryptoWallet: CryptoWallet = {
          id = cryptoWalletId;
          userId = caller;
          name = name;
          walletType = cryptoWalletTypeVar;
          currency = walletType;
          balance = 0.0;
          address = address;
          isExternal = isExternal;
          externalWalletType = externalWalletType;
          isActive = true;
          createdAt = now;
          updatedAt = now;
          lastSyncAt = null;
          metadata = null;
        };
        
        cryptoWallets.put(cryptoWalletId, newCryptoWallet);
        
        // Update user's crypto wallets index
        let currentCryptoWallets = Option.get(userCryptoWallets.get(caller), []);
        userCryptoWallets.put(caller, Array.append(currentCryptoWallets, [cryptoWalletId]));
        
        // Index by address if provided
        switch (address) {
          case (?addr) {
            addressToWallet.put(addr, cryptoWalletId);
          };
          case null {};
        };
        
        await logAuditEvent(?caller, "CRYPTO_WALLET_CREATED", "Crypto wallet created: " # name # " (" # walletType # ")", true);
        return #ok(newCryptoWallet);
      };
    };
  };
  
  public shared(msg) func connectExternalWallet(
    walletType: Text,
    principalId: ?Text,
    address: ?Text,
    permissions: [Text]
  ): async Result.Result<ExternalWalletConnection, Text> {
    let caller = msg.caller;
    
    // Check if user exists
    switch (users.get(caller)) {
      case null { return #err("User not found"); };
      case (?user) {
        let connectionId = generateId("external_connection", nextExternalConnectionId);
        nextExternalConnectionId += 1;
        
        let now = getCurrentTime();
        let newConnection: ExternalWalletConnection = {
          id = connectionId;
          userId = caller;
          walletType = walletType;
          principalId = principalId;
          address = address;
          isActive = true;
          connectedAt = now;
          lastUsedAt = now;
          permissions = permissions;
        };
        
        externalConnections.put(connectionId, newConnection);
        
        // Update user's external connections index
        let currentConnections = Option.get(userExternalConnections.get(caller), []);
        userExternalConnections.put(caller, Array.append(currentConnections, [connectionId]));
        
        // Index by principal ID if provided
        switch (principalId) {
          case (?pid) {
            principalToConnection.put(pid, connectionId);
          };
          case null {};
        };
        
        await logAuditEvent(?caller, "EXTERNAL_WALLET_CONNECTED", "External wallet connected: " # walletType, true);
        return #ok(newConnection);
      };
    };
  };
  
  public query(msg) func getUserCryptoWallets(): async Result.Result<[CryptoWallet], Text> {
    let caller = msg.caller;
    
    switch (userCryptoWallets.get(caller)) {
      case null { #ok([]) };
      case (?walletIds) {
        let walletsArray = Array.mapFilter<Text, CryptoWallet>(walletIds, func(id) {
          cryptoWallets.get(id);
        });
        #ok(walletsArray);
      };
    };
  };
  
  public shared(msg) func getUserExternalConnections(): async Result.Result<[ExternalWalletConnection], Text> {
    let caller = msg.caller;
    
    switch (userExternalConnections.get(caller)) {
      case null { #ok([]) };
      case (?connectionIds) {
        let connectionsArray = Array.mapFilter<Text, ExternalWalletConnection>(connectionIds, func(id) {
          externalConnections.get(id);
        });
        #ok(connectionsArray);
      };
    };
  };
  
  public shared(msg) func updateCryptoWalletBalance(
    walletId: Text,
    newBalance: Float
  ): async Result.Result<CryptoWallet, Text> {
    let caller = msg.caller;
    
    switch (cryptoWallets.get(walletId)) {
      case null { return #err("Crypto wallet not found"); };
      case (?wallet) {
        if (wallet.userId != caller) {
          return #err("Unauthorized");
        };
        
        let now = getCurrentTime();
        let updatedWallet: CryptoWallet = {
          id = wallet.id;
          userId = wallet.userId;
          name = wallet.name;
          walletType = wallet.walletType;
          currency = wallet.currency;
          balance = newBalance;
          address = wallet.address;
          isExternal = wallet.isExternal;
          externalWalletType = wallet.externalWalletType;
          isActive = wallet.isActive;
          createdAt = wallet.createdAt;
          updatedAt = now;
          lastSyncAt = ?now;
          metadata = wallet.metadata;
        };
        
        cryptoWallets.put(walletId, updatedWallet);
        await logAuditEvent(?caller, "CRYPTO_WALLET_BALANCE_UPDATED", "Crypto wallet balance updated: " # wallet.name, true);
        return #ok(updatedWallet);
      };
    };
  };
  
  public shared(msg) func createCryptoTransaction(
    walletId: Text,
    type_: Text,
    amount: Float,
    toAddress: ?Text,
    fromAddress: ?Text,
    txHash: ?Text,
    fee: Float
  ): async Result.Result<CryptoTransaction, Text> {
    let caller = msg.caller;
    
    // Verify wallet ownership
    switch (cryptoWallets.get(walletId)) {
      case null { return #err("Crypto wallet not found"); };
      case (?wallet) {
        if (wallet.userId != caller) {
          return #err("Unauthorized");
        };
        
        let transactionId = generateId("crypto_txn", nextCryptoTransactionId);
        nextCryptoTransactionId := nextCryptoTransactionId + 1;
        
        let now = getCurrentTime();
        let newTransaction: CryptoTransaction = {
          id = transactionId;
          walletId = walletId;
          userId = caller;
          type_ = type_;
          amount = amount;
          currency = wallet.currency;
          toAddress = toAddress;
          fromAddress = fromAddress;
          txHash = txHash;
          blockHeight = null;
          fees = ?fee;
          status = "pending";
          timestamp = now;
          metadata = null;
        };
        
        cryptoTransactions.put(transactionId, newTransaction);
        
        // Update user's crypto transactions index
        let currentTransactions = Option.get(userCryptoTransactions.get(caller), []);
        userCryptoTransactions.put(caller, Array.append(currentTransactions, [transactionId]));
        
        await logAuditEvent(?caller, "CRYPTO_TRANSACTION_CREATED", "Crypto transaction created: " # type_ # " " # Float.toText(amount) # " " # wallet.currency, true);
        return #ok(newTransaction);
      };
    };
  };
  
  public shared(msg) func getUserCryptoTransactions(): async Result.Result<[CryptoTransaction], Text> {
    let caller = msg.caller;
    
    switch (userCryptoTransactions.get(caller)) {
      case null { #ok([]) };
      case (?transactionIds) {
        let transactionsArray = Array.mapFilter<Text, CryptoTransaction>(transactionIds, func(id) {
          cryptoTransactions.get(id);
        });
        #ok(Array.reverse(transactionsArray)); // Most recent first
      };
    };
  };

  // ============ CRUCIAL WALLET TRANSFER FUNCTIONS ============
  
  // Send crypto from one wallet to another address
  public shared(msg) func sendCrypto(
    walletId: Text,
    toAddress: Text,
    amount: Float,
    memo: ?Text
  ): async Result.Result<CryptoTransaction, Text> {
    let caller = msg.caller;
    
    // Verify wallet ownership and get wallet
    switch (cryptoWallets.get(walletId)) {
      case null { return #err("Crypto wallet not found"); };
      case (?wallet) {
        if (wallet.userId != caller) {
          return #err("Unauthorized");
        };
        
        // Check if wallet has sufficient balance
        if (wallet.balance < amount) {
          return #err("Insufficient balance");
        };
        
        // Validate amount
        if (amount <= 0.0) {
          return #err("Amount must be greater than 0");
        };
        
        // Validate address format (basic validation)
        if (toAddress == "") {
          return #err("Invalid recipient address");
        };
        
        // Calculate fee (simplified - in production, use real network fees)
        let fee: Float = 0.0001; // Default fee
        let totalAmount = amount + fee;
        
        // Check if total amount (including fee) is available
        if (wallet.balance < totalAmount) {
          return #err("Insufficient balance for amount + fee");
        };
        
        let now = getCurrentTime();
        
        // Create transaction record
        let transactionId = generateId("crypto_txn", nextCryptoTransactionId);
        nextCryptoTransactionId := nextCryptoTransactionId + 1;
        
        let newTransaction: CryptoTransaction = {
          id = transactionId;
          walletId = walletId;
          userId = caller;
          type_ = "send";
          amount = amount;
          currency = wallet.currency;
          toAddress = ?toAddress;
          fromAddress = wallet.address;
          txHash = null; // Will be updated when transaction is confirmed
          blockHeight = null;
          fees = ?fee;
          status = "pending";
          timestamp = now;
          metadata = memo;
        };
        
        // Update wallet balance
        let newBalance = wallet.balance - totalAmount;
        let updatedWallet: CryptoWallet = {
          id = wallet.id;
          userId = wallet.userId;
          name = wallet.name;
          walletType = wallet.walletType;
          currency = wallet.currency;
          balance = newBalance;
          address = wallet.address;
          isExternal = wallet.isExternal;
          externalWalletType = wallet.externalWalletType;
          isActive = wallet.isActive;
          createdAt = wallet.createdAt;
          updatedAt = now;
          lastSyncAt = ?now;
          metadata = wallet.metadata;
        };
        
        // Store transaction and update wallet
        cryptoTransactions.put(transactionId, newTransaction);
        cryptoWallets.put(walletId, updatedWallet);
        
        // Update user's crypto transactions index
        let currentTransactions = Option.get(userCryptoTransactions.get(caller), []);
        userCryptoTransactions.put(caller, Array.append(currentTransactions, [transactionId]));
        
        await logAuditEvent(?caller, "CRYPTO_SEND", "Sent " # Float.toText(amount) # " " # wallet.currency # " to " # toAddress, true);
        return #ok(newTransaction);
      };
    };
  };
  
  // Transfer crypto between user's own wallets
  public shared(msg) func transferBetweenWallets(
    fromWalletId: Text,
    toWalletId: Text,
    amount: Float,
    memo: ?Text
  ): async Result.Result<CryptoTransaction, Text> {
    let caller = msg.caller;
    
    // Verify both wallets belong to user
    switch (cryptoWallets.get(fromWalletId)) {
      case null { return #err("Source wallet not found"); };
      case (?fromWallet) {
        if (fromWallet.userId != caller) {
          return #err("Unauthorized access to source wallet");
        };
        
        switch (cryptoWallets.get(toWalletId)) {
          case null { return #err("Destination wallet not found"); };
          case (?toWallet) {
            if (toWallet.userId != caller) {
              return #err("Unauthorized access to destination wallet");
            };
            
            // Check if wallets are same currency
            if (fromWallet.currency != toWallet.currency) {
              return #err("Cannot transfer between different currencies");
            };
            
            // Check if source wallet has sufficient balance
            if (fromWallet.balance < amount) {
              return #err("Insufficient balance in source wallet");
            };
            
            // Validate amount
            if (amount <= 0.0) {
              return #err("Amount must be greater than 0");
            };
            
            let now = getCurrentTime();
            let fee: Float = 0.0; // No fee for internal transfers
            
            // Create transaction record
            let transactionId = generateId("crypto_txn", nextCryptoTransactionId);
            nextCryptoTransactionId := nextCryptoTransactionId + 1;
            
            let newTransaction: CryptoTransaction = {
              id = transactionId;
              walletId = fromWalletId;
              userId = caller;
              type_ = "transfer";
              amount = amount;
              currency = fromWallet.currency;
              toAddress = toWallet.address;
              fromAddress = fromWallet.address;
              txHash = null;
              blockHeight = null;
              fees = ?fee;
              status = "completed"; // Internal transfers are immediate
              timestamp = now;
              metadata = memo;
            };
            
            // Update source wallet balance
            let updatedFromWallet: CryptoWallet = {
              id = fromWallet.id;
              userId = fromWallet.userId;
              name = fromWallet.name;
              walletType = fromWallet.walletType;
              currency = fromWallet.currency;
              balance = fromWallet.balance - amount;
              address = fromWallet.address;
              isExternal = fromWallet.isExternal;
              externalWalletType = fromWallet.externalWalletType;
              isActive = fromWallet.isActive;
              createdAt = fromWallet.createdAt;
              updatedAt = now;
              lastSyncAt = ?now;
              metadata = fromWallet.metadata;
            };
            
            // Update destination wallet balance
            let updatedToWallet: CryptoWallet = {
              id = toWallet.id;
              userId = toWallet.userId;
              name = toWallet.name;
              walletType = toWallet.walletType;
              currency = toWallet.currency;
              balance = toWallet.balance + amount;
              address = toWallet.address;
              isExternal = toWallet.isExternal;
              externalWalletType = toWallet.externalWalletType;
              isActive = toWallet.isActive;
              createdAt = toWallet.createdAt;
              updatedAt = now;
              lastSyncAt = ?now;
              metadata = toWallet.metadata;
            };
            
            // Store transaction and update both wallets
            cryptoTransactions.put(transactionId, newTransaction);
            cryptoWallets.put(fromWalletId, updatedFromWallet);
            cryptoWallets.put(toWalletId, updatedToWallet);
            
            // Update user's crypto transactions index
            let currentTransactions = Option.get(userCryptoTransactions.get(caller), []);
            userCryptoTransactions.put(caller, Array.append(currentTransactions, [transactionId]));
            
            await logAuditEvent(?caller, "CRYPTO_TRANSFER", "Transferred " # Float.toText(amount) # " " # fromWallet.currency # " between wallets", true);
            return #ok(newTransaction);
          };
        };
      };
    };
  };
  
  // Get wallet transaction history
  public shared(msg) func getWalletTransactionHistory(
    walletId: Text,
    limit: Nat,
    offset: Nat
  ): async Result.Result<[CryptoTransaction], Text> {
    let caller = msg.caller;
    
    // Verify wallet ownership
    switch (cryptoWallets.get(walletId)) {
      case null { return #err("Crypto wallet not found"); };
      case (?wallet) {
        if (wallet.userId != caller) {
          return #err("Unauthorized");
        };
        
        // Get all user transactions and filter by wallet
        switch (userCryptoTransactions.get(caller)) {
          case null { #ok([]) };
          case (?transactionIds) {
            let allTransactions = Array.mapFilter<Text, CryptoTransaction>(transactionIds, func(id) {
              cryptoTransactions.get(id);
            });
            
            let walletTransactions = Array.filter<CryptoTransaction>(allTransactions, func(tx) {
              tx.walletId == walletId
            });
            
            // Sort by timestamp (newest first) and apply pagination
            let sortedTransactions = Array.sort<CryptoTransaction>(walletTransactions, func(a, b) {
              if (a.timestamp > b.timestamp) #greater
              else if (a.timestamp < b.timestamp) #less
              else #equal
            });
            
            let startIndex = if (offset < sortedTransactions.size()) offset else sortedTransactions.size();
            let endIndex = if (offset + limit < sortedTransactions.size()) offset + limit else sortedTransactions.size();
            
            let paginatedTransactions = Array.subArray<CryptoTransaction>(sortedTransactions, startIndex, endIndex - startIndex);
            #ok(paginatedTransactions);
          };
        };
      };
    };
  };
  
  // Update transaction status (for external integrations)
  public shared(msg) func updateTransactionStatus(
    transactionId: Text,
    status: Text,
    txHash: ?Text,
    blockHeight: ?Nat
  ): async Result.Result<CryptoTransaction, Text> {
    let caller = msg.caller;
    
    switch (cryptoTransactions.get(transactionId)) {
      case null { return #err("Transaction not found"); };
      case (?transaction) {
        // Verify user owns the transaction
        switch (cryptoWallets.get(transaction.walletId)) {
          case null { return #err("Wallet not found"); };
          case (?wallet) {
            if (wallet.userId != caller) {
              return #err("Unauthorized");
            };
            
            let now = getCurrentTime();
            let updatedTransaction: CryptoTransaction = {
              id = transaction.id;
              walletId = transaction.walletId;
              userId = transaction.userId;
              type_ = transaction.type_;
              amount = transaction.amount;
              currency = transaction.currency;
              toAddress = transaction.toAddress;
              fromAddress = transaction.fromAddress;
              txHash = txHash;
              blockHeight = blockHeight;
              fees = transaction.fees;
              status = status;
              timestamp = transaction.timestamp;
              metadata = transaction.metadata;
            };
            
            cryptoTransactions.put(transactionId, updatedTransaction);
            await logAuditEvent(?caller, "TRANSACTION_STATUS_UPDATED", "Updated transaction " # transactionId # " status to " # status, true);
            return #ok(updatedTransaction);
          };
        };
      };
    };
  };
  
  public shared(msg) func getFullWalletPortfolio(): async Result.Result<WalletPortfolio, Text> {
    let caller = msg.caller;
    
    // Check if user exists
    switch (users.get(caller)) {
      case null { return #err("User not found"); };
      case (?user) {
        // Get fiat wallets
        let fiatWalletsResult = await getUserWallets();
        let fiatWallets = switch (fiatWalletsResult) {
          case (#ok(wallets)) { wallets };
          case (#err(_)) { [] };
        };
        
        // Get crypto wallets
        let cryptoWalletsResult = await getUserCryptoWallets();
        let cryptoWalletsArray = switch (cryptoWalletsResult) {
          case (#ok(wallets)) { wallets };
          case (#err(_)) { [] };
        };
        
        // Get external connections
        let externalConnectionsResult = await getUserExternalConnections();
        let externalConnectionsArray = switch (externalConnectionsResult) {
          case (#ok(connections)) { connections };
          case (#err(_)) { [] };
        };
        
        // Get DeFi positions
        let defiPositionsResult = await getUserDeFiPositions();
        let defiPositionsArray = switch (defiPositionsResult) {
          case (#ok(positions)) { positions };
          case (#err(_)) { [] };
        };
        
        // Calculate totals (simplified - in production, use real price feeds)
        var totalValueUSD: Float = 0.0;
        var totalValueKES: Float = 0.0;
        
        // Add fiat wallet values
        for (wallet in fiatWallets.vals()) {
          if (wallet.currency == "USD") {
            totalValueUSD += wallet.balance;
            totalValueKES += wallet.balance * 145.0; // Approximate USD to KES rate
          } else if (wallet.currency == "KES") {
            totalValueKES += wallet.balance;
            totalValueUSD += wallet.balance / 145.0;
          };
        };
        
        // Add crypto wallet values (simplified pricing)
        for (wallet in cryptoWalletsArray.vals()) {
          let usdValue = switch (wallet.currency) {
            case ("ICP") { wallet.balance * 12.0 }; // $12 per ICP
            case ("ckBTC") { wallet.balance * 45000.0 }; // $45k per BTC
            case ("ckETH") { wallet.balance * 3000.0 }; // $3k per ETH
            case (_) { wallet.balance }; // Default to 1:1 for other tokens
          };
          totalValueUSD += usdValue;
          totalValueKES += usdValue * 145.0;
        };
        
        let portfolio: WalletPortfolio = {
          userId = caller;
          totalValueUSD = totalValueUSD;
          totalValueKES = totalValueKES;
          cryptoWallets = cryptoWalletsArray;
          fiatWallets = fiatWallets;
          externalConnections = externalConnectionsArray;
          defiPositions = defiPositionsArray;
          lastUpdated = getCurrentTime();
        };
        
        return #ok(portfolio);
      };
    };
  };
  
  public shared(msg) func createDeFiPosition(
    protocol: Text,
    positionType: Text,
    tokenA: Text,
    tokenB: ?Text,
    amount: Float,
    apy: Float
  ): async Result.Result<DeFiPosition, Text> {
    let caller = msg.caller;
    
    // Check if user exists
    switch (users.get(caller)) {
      case null { return #err("User not found"); };
      case (?user) {
        let positionId = generateId("defi_position", nextDeFiPositionId);
        nextDeFiPositionId += 1;
        
        let now = getCurrentTime();
        
        // Convert text to enum types
        let protocolEnum = switch (protocol) {
          case "icpswap" { #ICPSwap };
          case "sonic" { #Sonic };
          case "infinityswap" { #InfinitySwap };
          case "neutrinite" { #Neutrinite };
          case "icdex" { #ICDex };
          case _ { #Custom };
        };
        
        let productTypeEnum = switch (positionType) {
          case "liquidity" { #Liquidity };
          case "staking" { #Staking };
          case "farming" { #YieldFarming };
          case "lending" { #Lending };
          case "borrowing" { #Borrowing };
          case "governance" { #Governance };
          case _ { #Custom };
        };
        
        let newPosition: DeFiPosition = {
          id = positionId;
          userId = caller;
          protocol = protocolEnum;
          productType = productTypeEnum;
          tokenA = tokenA;
          tokenB = tokenB;
          amount = amount;
          rewards = 0.0;
          apy = apy;
          isActive = true;
          createdAt = now;
          updatedAt = now;
          metadata = null;
        };
        
        defiPositions.put(positionId, newPosition);
        
        // Update user's DeFi positions index
        let currentPositions = Option.get(userDeFiPositions.get(caller), []);
        userDeFiPositions.put(caller, Array.append(currentPositions, [positionId]));
        
        await logAuditEvent(?caller, "DEFI_POSITION_CREATED", "DeFi position created: " # protocol # " " # positionType, true);
        return #ok(newPosition);
      };
    };
  };
  
  public shared(msg) func getUserDeFiPositions(): async Result.Result<[DeFiPosition], Text> {
    let caller = msg.caller;
    
    switch (userDeFiPositions.get(caller)) {
      case null { #ok([]) };
      case (?positionIds) {
        let positionsArray = Array.mapFilter<Text, DeFiPosition>(positionIds, func(id) {
          defiPositions.get(id);
        });
        #ok(positionsArray);
      };
    };
  };
  
  // ============ WALLET ADDRESS MANAGEMENT ============
  
  public shared(msg) func getUserWalletAddresses(): async Result.Result<{
    principalId: Text;
    accountIdentifier: Text;
    cryptoAddresses: [(Text, Text)]; // (currency, address) pairs
    allAddresses: [Text];
  }, Text> {
    let caller = msg.caller;
    
    // Check if user exists
    switch (users.get(caller)) {
      case null { return #err("User not found"); };
      case (?user) {
        let principalId = Principal.toText(caller);
        let accountIdentifier = generateAccountIdentifier(caller);
        let cryptoAddresses = Buffer.Buffer<(Text, Text)>(10);
        let allAddresses = Buffer.Buffer<Text>(10);
        
        // Add principal and account identifier
        allAddresses.add(principalId);
        allAddresses.add(accountIdentifier);
        
        // Get all user's crypto wallets and their addresses
        let userWalletIds = Option.get(userCryptoWallets.get(caller), []);
        for (walletId in userWalletIds.vals()) {
          switch (cryptoWallets.get(walletId)) {
            case (?wallet) {
              switch (wallet.address) {
                case (?address) {
                  cryptoAddresses.add((wallet.currency, address));
                  allAddresses.add(address);
                };
                case null {};
              };
            };
            case null {};
          };
        };
        
        return #ok({
          principalId = principalId;
          accountIdentifier = accountIdentifier;
          cryptoAddresses = Buffer.toArray(cryptoAddresses);
          allAddresses = Buffer.toArray(allAddresses);
        });
      };
    };
  };
  
  public query func getWalletByAddress(address: Text): async ?Text {
    addressToWallet.get(address);
  };
  
  public shared(msg) func regenerateWalletAddress(walletId: Text): async Result.Result<Text, Text> {
    let caller = msg.caller;
    
    // Verify wallet ownership
    switch (cryptoWallets.get(walletId)) {
      case null { return #err("Crypto wallet not found"); };
      case (?wallet) {
        if (wallet.userId != caller) {
          return #err("Unauthorized");
        };
        
        // Generate new address
        let newAddress = generateWalletAddress(caller, wallet.walletType);
        
        // Update wallet with new address
        let now = getCurrentTime();
        let updatedWallet: CryptoWallet = {
          id = wallet.id;
          userId = wallet.userId;
          name = wallet.name;
          walletType = wallet.walletType;
          currency = wallet.currency;
          balance = wallet.balance;
          address = ?newAddress;
          isExternal = wallet.isExternal;
          externalWalletType = wallet.externalWalletType;
          isActive = wallet.isActive;
          createdAt = wallet.createdAt;
          updatedAt = now;
          lastSyncAt = wallet.lastSyncAt;
          metadata = wallet.metadata;
        };
        
        cryptoWallets.put(walletId, updatedWallet);
        
        // Update address index
        // Remove old address if it exists
        switch (wallet.address) {
          case (?oldAddress) {
            addressToWallet.delete(oldAddress);
          };
          case null {};
        };
        
        // Add new address
        addressToWallet.put(newAddress, walletId);
        
        await logAuditEvent(?caller, "WALLET_ADDRESS_REGENERATED", "Address regenerated for wallet: " # wallet.name # " -> " # newAddress, true);
        return #ok(newAddress);
      };
    };
  };

  // ============ UTILITY FUNCTIONS ============
  
  public query func getUserByEmail(email: Text): async ?UserId {
    emailToUserId.get(email);
  };
  
  public query func getUserByPhone(phone: Text): async ?UserId {
    phoneToUserId.get(phone);
  };
  
  public query func getRecoveryRequestStatus(requestId: Text): async ?RecoveryRequest {
    recoveryRequests.get(requestId);
  };
  
  // ============ LEGACY FUNCTION (for compatibility) ============
  
  public query func greet(name : Text) : async Text {
    return "Hello, " # name # "! Welcome to Nesto - Your AI-Powered Social Finance Platform with Secure Account Recovery! 🚀🔐";
  };
  
  // ============ SYSTEM HEALTH ============
  
  public query func getSystemStats(): async {
    totalUsers: Nat;
    totalWallets: Nat;
    totalTransactions: Nat;
    totalRecoveryMethods: Nat;
    totalRecoveryRequests: Nat;
    totalCryptoWallets: Nat;
    totalExternalConnections: Nat;
    totalCryptoTransactions: Nat;
    totalDeFiPositions: Nat;
    totalOTPRequests: Nat;
  } {
    {
      totalUsers = users.size();
      totalWallets = wallets.size();
      totalTransactions = transactions.size();
      totalRecoveryMethods = recoveryMethods.size();
      totalRecoveryRequests = recoveryRequests.size();
      totalCryptoWallets = cryptoWallets.size();
      totalExternalConnections = externalConnections.size();
      totalCryptoTransactions = cryptoTransactions.size();
      totalDeFiPositions = defiPositions.size();
      totalOTPRequests = otpRequests.size();
    };
  };

  // ============ OTP SERVICE FUNCTIONS ============

  // Generate and send OTP
  public shared(msg) func sendOTP(
    recipient: Text,
    service: Text,
    provider: Text,
    purpose: Text
  ): async Result.Result<{
    otpId: Text;
    expiresIn: Int;
    message: Text;
  }, Text> {
    let caller = msg.caller;
    
    // Generate OTP code
    let otpCode = generateOTPCode();
    let otpId = generateId("otp", nextOTPRequestId);
    nextOTPRequestId += 1;
    
    let now = getCurrentTime();
    let expiresAt = now + (10 * 60 * 1000000000); // 10 minutes
    
    let otpRequest: OTPRequest = {
      id = otpId;
      userId = ?caller;
      recipient = recipient;
      code = otpCode;
      service = service;
      provider = provider;
      purpose = purpose;
      status = "pending";
      attempts = 0;
      expiresAt = expiresAt;
      createdAt = now;
      sentAt = null;
      deliveredAt = null;
      metadata = null;
    };
    
    otpRequests.put(otpId, otpRequest);
    
    // Update user's OTP requests index
    let currentRequests = Option.get(userOTPRequests.get(caller), []);
    userOTPRequests.put(caller, Array.append(currentRequests, [otpId]));
    
    // Send OTP based on service type
    let sendResult = await sendOTPViaService(otpRequest);
    
    switch (sendResult) {
      case (#ok(response)) {
        // Update OTP request status
        let updatedRequest: OTPRequest = {
          id = otpRequest.id;
          userId = otpRequest.userId;
          recipient = otpRequest.recipient;
          code = otpRequest.code;
          service = otpRequest.service;
          provider = otpRequest.provider;
          purpose = otpRequest.purpose;
          status = "sent";
          attempts = otpRequest.attempts + 1;
          expiresAt = otpRequest.expiresAt;
          createdAt = otpRequest.createdAt;
          sentAt = ?now;
          deliveredAt = null;
          metadata = ?response;
        };
        
        otpRequests.put(otpId, updatedRequest);
        
        await logAuditEvent(?caller, "OTP_SENT", "OTP sent via " # service # " to " # recipient, true);
        
        return #ok({
          otpId = otpId;
          expiresIn = (expiresAt - now) / 1000000000; // Convert to seconds
          message = "OTP sent successfully via " # service;
        });
      };
      case (#err(error)) {
        // Update OTP request status to failed
        let failedRequest: OTPRequest = {
          id = otpRequest.id;
          userId = otpRequest.userId;
          recipient = otpRequest.recipient;
          code = otpRequest.code;
          service = otpRequest.service;
          provider = otpRequest.provider;
          purpose = otpRequest.purpose;
          status = "failed";
          attempts = otpRequest.attempts + 1;
          expiresAt = otpRequest.expiresAt;
          createdAt = otpRequest.createdAt;
          sentAt = null;
          deliveredAt = null;
          metadata = ?error;
        };
        
        otpRequests.put(otpId, failedRequest);
        
        await logAuditEvent(?caller, "OTP_SEND_FAILED", "OTP send failed via " # service # " to " # recipient # ": " # error, false);
        
        return #err("Failed to send OTP: " # error);
      };
    };
  };

  // Verify OTP
  public shared(msg) func verifyOTP(
    otpId: Text,
    code: Text
  ): async Result.Result<{
    verified: Bool;
    purpose: Text;
    recipient: Text;
  }, Text> {
    let caller = msg.caller;
    
    switch (otpRequests.get(otpId)) {
      case null { return #err("OTP request not found"); };
      case (?otpRequest) {
        // Check if OTP belongs to user
        switch (otpRequest.userId) {
          case null { return #err("Invalid OTP request"); };
          case (?userId) {
            if (userId != caller) {
              return #err("Unauthorized");
            };
          };
        };
        
        let now = getCurrentTime();
        
        // Check if OTP is expired
        if (now > otpRequest.expiresAt) {
          await logAuditEvent(?caller, "OTP_VERIFY_FAILED", "OTP expired: " # otpId, false);
          return #err("OTP has expired");
        };
        
        // Check if OTP code matches
        if (otpRequest.code != code) {
          await logAuditEvent(?caller, "OTP_VERIFY_FAILED", "Invalid OTP code: " # otpId, false);
          return #err("Invalid OTP code");
        };
        
        // Mark OTP as used/delivered
        let verifiedRequest: OTPRequest = {
          id = otpRequest.id;
          userId = otpRequest.userId;
          recipient = otpRequest.recipient;
          code = otpRequest.code;
          service = otpRequest.service;
          provider = otpRequest.provider;
          purpose = otpRequest.purpose;
          status = "delivered";
          attempts = otpRequest.attempts;
          expiresAt = otpRequest.expiresAt;
          createdAt = otpRequest.createdAt;
          sentAt = otpRequest.sentAt;
          deliveredAt = ?now;
          metadata = otpRequest.metadata;
        };
        
        otpRequests.put(otpId, verifiedRequest);
        
        await logAuditEvent(?caller, "OTP_VERIFIED", "OTP verified successfully: " # otpId, true);
        
        return #ok({
          verified = true;
          purpose = otpRequest.purpose;
          recipient = otpRequest.recipient;
        });
      };
    };
  };

  // Send OTP via different services (placeholder - will be implemented with HTTP outcalls)
  private func sendOTPViaService(otpRequest: OTPRequest): async Result.Result<Text, Text> {
    // For now, this is a placeholder that simulates sending
    // In production, this would make HTTP outcalls to actual services
    
    switch (otpRequest.service) {
      case ("sms") {
        switch (otpRequest.provider) {
          case ("africas_talking") {
            // Simulate Africa's Talking SMS API call
            #ok("SMS sent via Africa's Talking - Message ID: AT_" # otpRequest.id);
          };
          case ("twilio") {
            // Simulate Twilio SMS API call
            #ok("SMS sent via Twilio - SID: TW_" # otpRequest.id);
          };
          case (_) {
            #err("Unsupported SMS provider: " # otpRequest.provider);
          };
        };
      };
      case ("email") {
        switch (otpRequest.provider) {
          case ("resend") {
            // Simulate Resend email API call
            #ok("Email sent via Resend - ID: RE_" # otpRequest.id);
          };
          case ("sendgrid") {
            // Simulate SendGrid email API call
            #ok("Email sent via SendGrid - ID: SG_" # otpRequest.id);
          };
          case (_) {
            #err("Unsupported email provider: " # otpRequest.provider);
          };
        };
      };
      case ("whatsapp") {
        // Simulate WhatsApp Business API call
        #ok("WhatsApp message sent - ID: WA_" # otpRequest.id);
      };
      case (_) {
        #err("Unsupported service: " # otpRequest.service);
      };
    };
  };

  // Generate 6-digit OTP code
  private func generateOTPCode(): Text {
    let timestamp = Int.abs(Time.now());
    let code = timestamp % 1000000;
    
    // Ensure it's always 6 digits
    let codeText = Int.toText(code);
    let codeSize = codeText.size();
    if (codeSize < 6) {
      // Pad with leading zeros
      let padding = if (codeSize < 6) 6 - codeSize else 0;
      var paddedCode = "";
      var i = 0;
      while (i < padding) {
        paddedCode := paddedCode # "0";
        i += 1;
      };
      paddedCode # codeText;
    } else if (codeSize > 6) {
      // Truncate to 6 digits by taking last 6 characters
      let chars = Text.toIter(codeText);
      var result = "";
      var count = 0;
      for (char in chars) {
        if (count >= (if (codeSize > 6) codeSize - 6 else 0)) {
          result := result # Text.fromChar(char);
        };
        count := count + 1;
      };
      result;
    } else {
      codeText;
    };
  };

  // Get user's OTP requests
  public shared(msg) func getUserOTPRequests(): async Result.Result<[OTPRequest], Text> {
    let caller = msg.caller;
    
    switch (userOTPRequests.get(caller)) {
      case null { #ok([]) };
      case (?requestIds) {
        let requests = Array.mapFilter<Text, OTPRequest>(requestIds, func(id) {
          otpRequests.get(id);
        });
        #ok(Array.reverse(requests)); // Most recent first
      };
    };
  };

  // Get deposit addresses for all user's crypto wallets
  public shared(msg) func getDepositAddresses(): async Result.Result<[(Text, Text)], Text> {
    let caller = msg.caller;
    
    // Get user's crypto wallets
    let walletsResult = await getUserCryptoWallets();
    let wallets = switch (walletsResult) {
      case (#ok(wallets)) { wallets };
      case (#err(error)) { return #err("Failed to get wallets: " # error) };
    };
    
    // Generate deposit addresses for each wallet
    let addresses = Array.map<CryptoWallet, (Text, Text)>(wallets, func(wallet) {
      let depositAddress = generateWalletAddress(caller, wallet.walletType);
      (wallet.currency, depositAddress);
    });
    
    #ok(addresses);
  };

  // Get deposit address for specific wallet type
  public shared(msg) func getDepositAddress(walletType: Text): async Result.Result<Text, Text> {
    let caller = msg.caller;
    
    // Validate wallet type
    let cryptoWalletType = textToCryptoWalletType(walletType);
    
    // Generate proper address
    let address = generateWalletAddress(caller, cryptoWalletType);
    
    #ok(address);
  };

  // ===== GROUP VAULTS TYPES =====
  
  public type VaultType = {
    #Savings;
    #Investment;
    #Emergency;
    #Travel;
    #Education;
    #Business;
    #Charity;
    #Custom;
  };

  public type VaultMember = {
    id: Text;
    vaultId: Text;
    userId: UserId;
    role: Text; // "owner" | "admin" | "member" | "viewer"
    joinedAt: Int;
    contributionLimit: ?Float;
    withdrawalLimit: ?Float;
    isActive: Bool;
    permissions: [Text]; // ["deposit", "withdraw", "invite", "manage"]
  };

  public type VaultTransaction = {
    id: Text;
    vaultId: Text;
    userId: UserId;
    type_: Text; // "deposit" | "withdraw" | "transfer" | "fee" | "interest"
    amount: Float;
    currency: Text;
    description: Text;
    timestamp: Int;
    status: Text; // "pending" | "completed" | "failed" | "cancelled"
    metadata: ?Text;
  };

  public type GroupVault = {
    id: Text;
    name: Text;
    description: ?Text;
    vaultType: VaultType;
    currency: Text;
    totalBalance: Float;
    targetAmount: ?Float;
    ownerId: UserId;
    members: [Text]; // Member IDs
    isPublic: Bool;
    isActive: Bool;
    createdAt: Int;
    updatedAt: Int;
    rules: ?Text; // JSON string for vault rules
    metadata: ?Text;
  };

  // ===== VAULT CHAT TYPES =====
  
  public type MessageType = {
    #Text;
    #System;
    #Transaction;
    #Image;
    #File;
    #Reaction;
  };

  public type MessageStatus = {
    #Sent;
    #Delivered;
    #Read;
    #Failed;
  };

  public type VaultMessage = {
    id: Text;
    vaultId: Text;
    userId: UserId;
    userName: Text;
    messageType: MessageType;
    content: Text;
    status: MessageStatus;
    timestamp: Int;
    editedAt: ?Int;
    replyTo: ?Text; // ID of message being replied to
    reactions: [MessageReaction];
    metadata: ?Text;
  };

  public type MessageReaction = {
    userId: UserId;
    reaction: Text; // emoji or reaction type
    timestamp: Int;
  };

  public type VaultChatRoom = {
    id: Text;
    vaultId: Text;
    name: Text;
    description: ?Text;
    isActive: Bool;
    createdAt: Int;
    updatedAt: Int;
    lastMessageAt: ?Int;
    memberCount: Nat;
    metadata: ?Text;
  };

  public type ChatMember = {
    userId: UserId;
    userName: Text;
    joinedAt: Int;
    lastSeenAt: Int;
    isTyping: Bool;
    typingSince: ?Int;
    unreadCount: Nat;
    isMuted: Bool;
    role: Text; // "member" | "admin" | "moderator"
  };

  public type TypingIndicator = {
    userId: UserId;
    userName: Text;
    isTyping: Bool;
    startedAt: Int;
  };

  public type ChatNotification = {
    id: Text;
    vaultId: Text;
    userId: UserId;
    notificationType: Text; // "message" | "reaction" | "member_joined" | "member_left"
    title: Text;
    body: Text;
    timestamp: Int;
    isRead: Bool;
    metadata: ?Text;
  };

  // ===== PLUGIN SYSTEM TYPES =====
  
  public type PluginCategory = {
    #Finance;
    #Social;
    #Gaming;
    #Productivity;
    #Entertainment;
    #Education;
    #Health;
    #Custom;
  };

  public type PluginStatus = {
    #Active;
    #Inactive;
    #Pending;
    #Suspended;
    #Deprecated;
  };

  public type PluginPermission = {
    #ReadWallets;
    #WriteWallets;
    #ReadTransactions;
    #WriteTransactions;
    #ReadProfile;
    #WriteProfile;
    #ReadContacts;
    #WriteContacts;
    #Notifications;
    #ExternalAPIs;
  };

  public type Plugin = {
    id: Text;
    name: Text;
    description: Text;
    version: Text;
    author: Text;
    category: PluginCategory;
    status: PluginStatus;
    permissions: [PluginPermission];
    icon: ?Text;
    entryPoint: Text; // URL or function name
    configSchema: ?Text; // JSON schema for configuration
    isEnabled: Bool;
    isInstalled: Bool;
    installCount: Nat;
    rating: Float;
    createdAt: Int;
    updatedAt: Int;
    metadata: ?Text;
  };

  public type UserPlugin = {
    id: Text;
    userId: UserId;
    pluginId: Text;
    isEnabled: Bool;
    config: ?Text; // JSON configuration
    installedAt: Int;
    lastUsedAt: Int;
    permissions: [PluginPermission];
    metadata: ?Text;
  };


  // ===== SOCIAL GAMES TYPES =====
  
  public type GameType = {
    #Trading;
    #Prediction;
    #Quiz;
    #Challenge;
    #Tournament;
    #Lottery;
    #Custom;
  };

  public type GameStatus = {
    #Active;
    #Paused;
    #Completed;
    #Cancelled;
  };

  public type GameParticipant = {
    id: Text;
    gameId: Text;
    userId: UserId;
    score: Float;
    rank: ?Nat;
    joinedAt: Int;
    isActive: Bool;
    metadata: ?Text;
  };

  public type GameReward = {
    id: Text;
    gameId: Text;
    userId: UserId;
    type_: Text; // "points" | "tokens" | "badge" | "nft"
    amount: Float;
    currency: ?Text;
    description: Text;
    claimedAt: ?Int;
    expiresAt: ?Int;
    metadata: ?Text;
  };

  public type SocialGame = {
    id: Text;
    name: Text;
    description: Text;
    gameType: GameType;
    status: GameStatus;
    startTime: Int;
    endTime: ?Int;
    maxParticipants: ?Nat;
    currentParticipants: Nat;
    entryFee: ?Float;
    prizePool: Float;
    currency: Text;
    rules: ?Text;
    isPublic: Bool;
    createdBy: UserId;
    createdAt: Int;
    updatedAt: Int;
    metadata: ?Text;
  };

  // ===== DEFI TOOLS TYPES =====
  
  public type DeFiProtocol = {
    #ICPSwap;
    #Sonic;
    #InfinitySwap;
    #Neutrinite;
    #ICDex;
    #Custom;
  };

  public type DeFiProductType = {
    #Swap;
    #Liquidity;
    #Staking;
    #Lending;
    #Borrowing;
    #YieldFarming;
    #Governance;
    #Custom;
  };

  public type DeFiPosition = {
    id: Text;
    userId: UserId;
    protocol: DeFiProtocol;
    productType: DeFiProductType;
    tokenA: Text;
    tokenB: ?Text;
    amount: Float;
    apy: Float;
    rewards: Float;
    isActive: Bool;
    createdAt: Int;
    updatedAt: Int;
    metadata: ?Text;
  };

  public type DeFiTransaction = {
    id: Text;
    userId: UserId;
    protocol: DeFiProtocol;
    type_: Text; // "swap" | "add_liquidity" | "remove_liquidity" | "stake" | "unstake"
    tokenA: Text;
    tokenB: ?Text;
    amountA: Float;
    amountB: ?Float;
    fee: Float;
    txHash: ?Text;
    status: Text; // "pending" | "completed" | "failed"
    timestamp: Int;
    metadata: ?Text;
  };

  // ===== AI ASSISTANT TYPES =====
  
  public type AIMessageType = {
    #User;
    #Assistant;
    #System;
    #Error;
  };

  public type AIMessage = {
    id: Text;
    userId: UserId;
    type_: AIMessageType;
    content: Text;
    timestamp: Int;
    metadata: ?Text;
  };

  public type AIInsight = {
    id: Text;
    userId: UserId;
    type_: Text; // "spending" | "saving" | "investment" | "budget" | "goal"
    title: Text;
    description: Text;
    confidence: Float;
    actionable: Bool;
    createdAt: Int;
    metadata: ?Text;
  };

  public type AIRecommendation = {
    id: Text;
    userId: UserId;
    category: Text; // "investment" | "saving" | "budget" | "debt" | "insurance"
    title: Text;
    description: Text;
    priority: Text; // "high" | "medium" | "low"
    estimatedImpact: Float;
    isImplemented: Bool;
    createdAt: Int;
    metadata: ?Text;
  };

  // ===== LOCAL PAYMENTS TYPES =====
  
  public type PaymentProvider = {
    #Mpesa;
    #AirtelMoney;
    #Equitel;
    #BankTransfer;
    #Card;
    #PayPal;
    #Custom;
  };

  public type PaymentStatus = {
    #Pending;
    #Processing;
    #Completed;
    #Failed;
    #Cancelled;
    #Refunded;
  };

  public type LocalPayment = {
    id: Text;
    userId: UserId;
    provider: PaymentProvider;
    type_: Text; // "send" | "receive" | "withdraw" | "deposit"
    amount: Float;
    currency: Text;
    recipientPhone: ?Text;
    recipientName: ?Text;
    reference: ?Text;
    status: PaymentStatus;
    fee: Float;
    timestamp: Int;
    completedAt: ?Int;
    metadata: ?Text;
  };

  public type PaymentMethod = {
    id: Text;
    userId: UserId;
    provider: PaymentProvider;
    accountNumber: ?Text;
    phoneNumber: ?Text;
    accountName: Text;
    isDefault: Bool;
    isActive: Bool;
    createdAt: Int;
    metadata: ?Text;
  };

  // ============ GROUP VAULTS MANAGEMENT ============
  
  // Create a new group vault
  public shared(msg) func createGroupVault(
    name: Text,
    description: ?Text,
    vaultType: Text,
    currency: Text,
    targetAmount: ?Float,
    isPublic: Bool,
    rules: ?Text
  ): async Result.Result<GroupVault, Text> {
    let caller = msg.caller;
    
    // Check if user exists
    switch (users.get(caller)) {
      case null { return #err("User not found"); };
      case (?user) {
        let vaultId = generateId("vault", nextVaultId);
        nextVaultId += 1;
        
        let now = getCurrentTime();
        let vaultTypeEnum = textToVaultType(vaultType);
        
        let newVault: GroupVault = {
          id = vaultId;
          name = name;
          description = description;
          vaultType = vaultTypeEnum;
          currency = currency;
          totalBalance = 0.0;
          targetAmount = targetAmount;
          ownerId = caller;
          members = [];
          isPublic = isPublic;
          isActive = true;
          createdAt = now;
          updatedAt = now;
          rules = rules;
          metadata = null;
        };
        
        groupVaults.put(vaultId, newVault);
        
        // Add owner as first member
        let memberId = generateId("vault_member", nextVaultMemberId);
        nextVaultMemberId += 1;
        
        let ownerMember: VaultMember = {
          id = memberId;
          vaultId = vaultId;
          userId = caller;
          role = "owner";
          joinedAt = now;
          contributionLimit = null;
          withdrawalLimit = null;
          isActive = true;
          permissions = ["deposit", "withdraw", "invite", "manage"];
        };
        
        vaultMembers.put(memberId, ownerMember);
        
        // Update indexes
        let currentUserVaults = Option.get(userVaults.get(caller), []);
        userVaults.put(caller, Array.append(currentUserVaults, [vaultId]));
        
        let currentVaultMembers = Option.get(vaultMemberIndex.get(vaultId), []);
        vaultMemberIndex.put(vaultId, Array.append(currentVaultMembers, [memberId]));
        
        // Automatically add vault creator to vault chat
        let memberKey = Text.concat(Principal.toText(caller), Text.concat("_", vaultId));
        let chatMember: ChatMember = {
          userId = caller;
          userName = user.username;
          joinedAt = now;
          lastSeenAt = now;
          isTyping = false;
          typingSince = null;
          unreadCount = 0;
          isMuted = false;
          role = "admin";
        };
        chatMembers.put(memberKey, chatMember);
        
        // Update chat member index
        let currentChatMembers = Option.get(vaultChatMemberIndex.get(vaultId), []);
        vaultChatMemberIndex.put(vaultId, Array.append(currentChatMembers, [Principal.toText(caller)]));
        
        await logAuditEvent(?caller, "VAULT_CREATED", "Group vault created: " # name, true);
        return #ok(newVault);
      };
    };
  };
  
  // Get user's group vaults
  public shared(msg) func getUserGroupVaults(): async Result.Result<[GroupVault], Text> {
    let caller = msg.caller;
    
    switch (userVaults.get(caller)) {
      case null { #ok([]) };
      case (?vaultIds) {
        let vaultsArray = Array.mapFilter<Text, GroupVault>(vaultIds, func(id) {
          groupVaults.get(id);
        });
        #ok(vaultsArray);
      };
    };
  };
  
  // Get vault details with members
  public shared(msg) func getVaultDetails(vaultId: Text): async Result.Result<{
    vault: GroupVault;
    members: [VaultMember];
    transactions: [VaultTransaction];
  }, Text> {
    let caller = msg.caller;
    
    switch (groupVaults.get(vaultId)) {
      case null { return #err("Vault not found"); };
      case (?vault) {
        // Check if user is a member
        let userMemberIds = Option.get(vaultMemberIndex.get(vaultId), []);
        let isMember = Option.isSome(Array.find<Text>(userMemberIds, func(memberId) {
          switch (vaultMembers.get(memberId)) {
            case (?member) { member.userId == caller };
            case null { false };
          };
        }));
        
        if (not isMember and not vault.isPublic) {
          return #err("Access denied");
        };
        
        // Get members
        let membersArray = Array.mapFilter<Text, VaultMember>(userMemberIds, func(id) {
          vaultMembers.get(id);
        });
        
        // Get transactions
        let transactionIds = Option.get(vaultTransactionIndex.get(vaultId), []);
        let transactionsArray = Array.mapFilter<Text, VaultTransaction>(transactionIds, func(id) {
          vaultTransactions.get(id);
        });
        
        return #ok({
          vault = vault;
          members = membersArray;
          transactions = transactionsArray;
        });
      };
    };
  };

  // Join a public vault
  public shared(msg) func joinVault(vaultId: Text): async Result.Result<VaultMember, Text> {
    let caller = msg.caller;
    
    switch (groupVaults.get(vaultId)) {
      case null { return #err("Vault not found"); };
      case (?vault) {
        if (not vault.isPublic) {
          return #err("Vault is not public");
        };
        
        // Check if user is already a member
        let userMemberIds = Option.get(vaultMemberIndex.get(vaultId), []);
        let isAlreadyMember = Option.isSome(Array.find<Text>(userMemberIds, func(memberId) {
          switch (vaultMembers.get(memberId)) {
            case (?member) { member.userId == caller };
            case null { false };
          };
        }));
        
        if (isAlreadyMember) {
          return #err("Already a member of this vault");
        };
        
        let memberId = generateId("vault_member", nextVaultMemberId);
        nextVaultMemberId += 1;
        
        let now = getCurrentTime();
        let newMember: VaultMember = {
          id = memberId;
          vaultId = vaultId;
          userId = caller;
          role = "member";
          joinedAt = now;
          contributionLimit = null;
          withdrawalLimit = null;
          isActive = true;
          permissions = ["deposit", "withdraw"];
        };
        
        vaultMembers.put(memberId, newMember);
        
        // Update indexes
        let currentUserVaults = Option.get(userVaults.get(caller), []);
        userVaults.put(caller, Array.append(currentUserVaults, [vaultId]));
        
        let currentVaultMembers = Option.get(vaultMemberIndex.get(vaultId), []);
        vaultMemberIndex.put(vaultId, Array.append(currentVaultMembers, [memberId]));
        
        // Automatically add new member to vault chat
        let memberKey = Text.concat(Principal.toText(caller), Text.concat("_", vaultId));
        let chatMember: ChatMember = {
          userId = caller;
          userName = "New Member"; // Will be updated when user joins chat
          joinedAt = now;
          lastSeenAt = now;
          isTyping = false;
          typingSince = null;
          unreadCount = 0;
          isMuted = false;
          role = "member";
        };
        chatMembers.put(memberKey, chatMember);
        
        // Update chat member index
        let currentChatMembers = Option.get(vaultChatMemberIndex.get(vaultId), []);
        vaultChatMemberIndex.put(vaultId, Array.append(currentChatMembers, [Principal.toText(caller)]));
        
        await logAuditEvent(?caller, "VAULT_JOINED", "Joined vault: " # vault.name, true);
        return #ok(newMember);
      };
    };
  };
   
  // Deposit to vault
  public shared(msg) func depositToVault(
    vaultId: Text,
    amount: Float,
    description: ?Text
  ): async Result.Result<VaultTransaction, Text> {
    let caller = msg.caller;
    
    // Check if user is a member
    let userMemberIds = Option.get(vaultMemberIndex.get(vaultId), []);
    let userMember = Array.find<Text>(userMemberIds, func(memberId) {
      switch (vaultMembers.get(memberId)) {
        case (?member) { member.userId == caller and member.isActive };
        case null { false };
      };
    });
    
    switch (userMember) {
      case null { return #err("Not a member of this vault"); };
      case (?memberId) {
        switch (vaultMembers.get(memberId)) {
          case null { return #err("Member not found"); };
          case (?member) {
            // Check contribution limit
            switch (member.contributionLimit) {
              case (?limit) {
                if (amount > limit) {
                  return #err("Amount exceeds contribution limit");
                };
              };
              case null {};
            };
            
            // Update vault balance
            switch (groupVaults.get(vaultId)) {
              case null { return #err("Vault not found"); };
              case (?vault) {
                let now = getCurrentTime();
                let updatedVault: GroupVault = {
                  id = vault.id;
                  name = vault.name;
                  description = vault.description;
                  vaultType = vault.vaultType;
                  currency = vault.currency;
                  totalBalance = vault.totalBalance + amount;
                  targetAmount = vault.targetAmount;
                  ownerId = vault.ownerId;
                  members = vault.members;
                  isPublic = vault.isPublic;
                  isActive = vault.isActive;
                  createdAt = vault.createdAt;
                  updatedAt = now;
                  rules = vault.rules;
                  metadata = vault.metadata;
                };
                
                groupVaults.put(vaultId, updatedVault);
                
                // Create transaction
                let transactionId = generateId("vault_txn", nextVaultTransactionId);
                nextVaultTransactionId += 1;
                
                let transaction: VaultTransaction = {
                  id = transactionId;
                  vaultId = vaultId;
                  userId = caller;
                  type_ = "deposit";
                  amount = amount;
                  currency = vault.currency;
                  description = Option.get(description, "Deposit to vault");
                  timestamp = now;
                  status = "completed";
                  metadata = null;
                };
                
                vaultTransactions.put(transactionId, transaction);
                
                // Update transaction index
                let currentTransactions = Option.get(vaultTransactionIndex.get(vaultId), []);
                vaultTransactionIndex.put(vaultId, Array.append(currentTransactions, [transactionId]));
                
                await logAuditEvent(?caller, "VAULT_DEPOSIT", "Deposited " # Float.toText(amount) # " to vault: " # vault.name, true);
                return #ok(transaction);
              };
            };
          };
        };
      };
    };
  };
  
  // Withdraw from vault
  public shared(msg) func withdrawFromVault(
    vaultId: Text,
    amount: Float,
    description: ?Text
  ): async Result.Result<VaultTransaction, Text> {
    let caller = msg.caller;
    
    // Check if user is a member
    let userMemberIds = Option.get(vaultMemberIndex.get(vaultId), []);
    let userMember = Array.find<Text>(userMemberIds, func(memberId) {
      switch (vaultMembers.get(memberId)) {
        case (?member) { member.userId == caller and member.isActive };
        case null { false };
      };
    });
    
    switch (userMember) {
      case null { return #err("Not a member of this vault"); };
      case (?memberId) {
        switch (vaultMembers.get(memberId)) {
          case null { return #err("Member not found"); };
          case (?member) {
            // Check withdrawal limit
            switch (member.withdrawalLimit) {
              case (?limit) {
                if (amount > limit) {
                  return #err("Amount exceeds withdrawal limit");
                };
              };
              case null {};
            };
            
            // Check vault balance
            switch (groupVaults.get(vaultId)) {
              case null { return #err("Vault not found"); };
              case (?vault) {
                if (vault.totalBalance < amount) {
                  return #err("Insufficient vault balance");
                };
                
                let now = getCurrentTime();
                let updatedVault: GroupVault = {
                  id = vault.id;
                  name = vault.name;
                  description = vault.description;
                  vaultType = vault.vaultType;
                  currency = vault.currency;
                  totalBalance = vault.totalBalance - amount;
                  targetAmount = vault.targetAmount;
                  ownerId = vault.ownerId;
                  members = vault.members;
                  isPublic = vault.isPublic;
                  isActive = vault.isActive;
                  createdAt = vault.createdAt;
                  updatedAt = now;
                  rules = vault.rules;
                  metadata = vault.metadata;
                };
                
                groupVaults.put(vaultId, updatedVault);
                
                // Create transaction
                let transactionId = generateId("vault_txn", nextVaultTransactionId);
                nextVaultTransactionId += 1;
                
                let transaction: VaultTransaction = {
                  id = transactionId;
                  vaultId = vaultId;
                  userId = caller;
                  type_ = "withdraw";
                  amount = amount;
                  currency = vault.currency;
                  description = Option.get(description, "Withdrawal from vault");
                  timestamp = now;
                  status = "completed";
                  metadata = null;
                };
                
                vaultTransactions.put(transactionId, transaction);
                
                // Update transaction index
                let currentTransactions = Option.get(vaultTransactionIndex.get(vaultId), []);
                vaultTransactionIndex.put(vaultId, Array.append(currentTransactions, [transactionId]));
                
                await logAuditEvent(?caller, "VAULT_WITHDRAWAL", "Withdrew " # Float.toText(amount) # " from vault: " # vault.name, true);
                return #ok(transaction);
              };
            };
          };
        };
      };
    };
  };
  
  // Invite user to vault
  public shared(msg) func inviteToVault(
    vaultId: Text,
    userId: UserId,
    role: Text
  ): async Result.Result<Text, Text> {
    let caller = msg.caller;
    
    // Check if caller is owner or admin
    let userMemberIds = Option.get(vaultMemberIndex.get(vaultId), []);
    let callerMember = Array.find<Text>(userMemberIds, func(memberId) {
      switch (vaultMembers.get(memberId)) {
        case (?member) { 
          member.userId == caller and member.isActive and 
          (member.role == "owner" or member.role == "admin")
        };
        case null { false };
      };
    });
    
    switch (callerMember) {
      case null { return #err("Not authorized to invite users"); };
      case (?memberId) {
        // Get vault details for notification
        let vaultDetails = groupVaults.get(vaultId);
        switch (vaultDetails) {
          case null { return #err("Vault not found"); };
          case (?vault) {
            // Check if user is already a member
            let isAlreadyMember = Option.isSome(Array.find<Text>(userMemberIds, func(memberId) {
              switch (vaultMembers.get(memberId)) {
                case (?member) { member.userId == userId };
                case null { false };
              };
            }));
            
            if (isAlreadyMember) {
              return #err("User is already a member");
            };
            
            // Check if there's already a pending invitation
            let existingInvitation = Option.isSome(Array.find<Text>(userMemberIds, func(memberId) {
              switch (vaultMembers.get(memberId)) {
                case (?member) { 
                  member.userId == userId and not member.isActive and member.role == "pending"
                };
                case null { false };
              };
            }));
            
            if (existingInvitation) {
              return #err("User already has a pending invitation");
            };
            
            let invitationId = generateId("vault_invitation", nextVaultMemberId);
            nextVaultMemberId += 1;
            
            let now = getCurrentTime();
            let pendingInvitation: VaultMember = {
              id = invitationId;
              vaultId = vaultId;
              userId = userId;
              role = "pending"; // Mark as pending until accepted
              joinedAt = now;
              contributionLimit = null;
              withdrawalLimit = null;
              isActive = false; // Not active until accepted
              permissions = []; // No permissions until accepted
            };
            
            vaultMembers.put(invitationId, pendingInvitation);
            
            // Update vault member index (for pending invitations)
            let currentVaultMembers = Option.get(vaultMemberIndex.get(vaultId), []);
            vaultMemberIndex.put(vaultId, Array.append(currentVaultMembers, [invitationId]));
            
            // Create notification for the invited user
            let notificationId = generateId("notif", nextNotificationId);
            nextNotificationId += 1;
            
            let vaultNotificationType: NotificationType = #Vault({
              vaultId = vaultId;
              action = "invite";
              amount = null;
            });
            
            let notification: Notification = {
              id = notificationId;
              userId = userId;
              notificationType = vaultNotificationType;
              title = "Vault Invitation";
              message = "You've been invited to join vault: " # vault.name # " as " # role # ". Click to accept or decline.";
              priority = "high";
              isRead = false;
              isArchived = false;
              createdAt = now;
              readAt = null;
              metadata = ?("{\"vaultId\":\"" # vaultId # "\",\"role\":\"" # role # "\",\"invitedBy\":\"" # Principal.toText(caller) # "\",\"invitationId\":\"" # invitationId # "\"}");
              actionUrl = ?("/vaults/" # vaultId);
              expiresAt = ?(now + 7 * 24 * 60 * 60 * 1_000_000_000); // 7 days
            };
            
            notifications.put(notificationId, notification);
            
            // Update user notification index
            let currentUserNotifications = Option.get(userNotificationIndex.get(userId), []);
            userNotificationIndex.put(userId, Array.append(currentUserNotifications, [notificationId]));
            
            // Create notification for the inviter (confirmation)
            let inviterNotificationId = generateId("notif", nextNotificationId);
            nextNotificationId += 1;
            
            let inviterNotification: Notification = {
              id = inviterNotificationId;
              userId = caller;
              notificationType = vaultNotificationType;
              title = "Invitation Sent";
              message = "You've successfully invited a user to vault: " # vault.name;
              priority = "medium";
              isRead = false;
              isArchived = false;
              createdAt = now;
              readAt = null;
              metadata = ?("{\"vaultId\":\"" # vaultId # "\",\"invitedUserId\":\"" # Principal.toText(userId) # "\",\"role\":\"" # role # "\"}");
              actionUrl = ?("/vaults/" # vaultId);
              expiresAt = ?(now + 24 * 60 * 60 * 1_000_000_000); // 24 hours
            };
            
            notifications.put(inviterNotificationId, inviterNotification);
            
            // Update inviter notification index
            let currentInviterNotifications = Option.get(userNotificationIndex.get(caller), []);
            userChatNotificationIndex.put(caller, Array.append(currentInviterNotifications, [inviterNotificationId]));
            
            await logAuditEvent(?caller, "VAULT_INVITE", "Invited user to vault", true);
            return #ok(newMember);
          };
        };
      };
    };
  };

  // Respond to vault invitation (accept/decline)
  public shared(msg) func respondToVaultInvitation(
    vaultId: Text,
    response: Text // "accept" or "decline"
  ): async Result.Result<Bool, Text> {
    let caller = msg.caller;
    
    // Find the pending invitation for this user
    let userMemberIds = Option.get(vaultMemberIndex.get(vaultId), []);
    let pendingInvitation = Array.find<Text>(userMemberIds, func(memberId) {
      switch (vaultMembers.get(memberId)) {
        case (?member) { 
          member.userId == caller and not member.isActive and member.role == "pending"
        };
        case null { false };
      };
    });
    
    switch (pendingInvitation) {
      case null { return #err("No pending invitation found"); };
      case (?invitationId) {
        switch (vaultMembers.get(invitationId)) {
          case null { return #err("Invitation not found"); };
          case (?invitation) {
            if (response == "accept") {
              // Get the original role from notification metadata (default to "member")
              let originalRole = "member"; // Default role
              
              let now = getCurrentTime();
              let acceptedMember: VaultMember = {
                id = invitation.id;
                vaultId = invitation.vaultId;
                userId = invitation.userId;
                role = originalRole;
                joinedAt = now;
                contributionLimit = null;
                withdrawalLimit = null;
                isActive = true;
                permissions = if (originalRole == "admin") {
                  ["deposit", "withdraw", "invite"];
                } else {
                  ["deposit", "withdraw"];
                };
              };
              
              vaultMembers.put(invitationId, acceptedMember);
              
              // Add user to vaults index
              let currentUserVaults = Option.get(userVaults.get(caller), []);
              userVaults.put(caller, Array.append(currentUserVaults, [vaultId]));
              
              // Create notification for vault owner
              let vaultDetails = groupVaults.get(vaultId);
              switch (vaultDetails) {
                case null { return #err("Vault not found"); };
                case (?vault) {
                  let notificationId = generateId("notif", nextNotificationId);
                  nextNotificationId += 1;
                  
                  let vaultNotificationType: NotificationType = #Vault({
                    vaultId = vaultId;
                    action = "member_joined";
                    amount = null;
                  });
                  
                  let notification: Notification = {
                    id = notificationId;
                    userId = vault.ownerId;
                    notificationType = vaultNotificationType;
                    title = "Member Joined";
                    message = "A new member has joined your vault: " # vault.name;
                    priority = "medium";
                    isRead = false;
                    isArchived = false;
                    createdAt = now;
                    readAt = null;
                    metadata = ?("{\"vaultId\":\"" # vaultId # "\",\"memberId\":\"" # Principal.toText(caller) # "\",\"role\":\"" # originalRole # "\"}");
                    actionUrl = ?("/vaults/" # vaultId);
                    expiresAt = ?(now + 24 * 60 * 60 * 1_000_000_000); // 24 hours
                  };
                  
                  notifications.put(notificationId, notification);
                  
                  // Update owner notification index
                  let currentOwnerNotifications = Option.get(userNotificationIndex.get(vault.ownerId), []);
                  userNotificationIndex.put(vault.ownerId, Array.append(currentOwnerNotifications, [notificationId]));
                };
              };
              
              await logAuditEvent(?caller, "VAULT_INVITATION_ACCEPTED", "Accepted invitation to vault: " # vaultId, true);
              return #ok(true);
              
            } else if (response == "decline") {
              // Remove the pending invitation
              vaultMembers.delete(invitationId);
              
              // Remove from vault member index
              let currentVaultMembers = Option.get(vaultMemberIndex.get(vaultId), []);
              let updatedVaultMembers = Array.filter<Text>(currentVaultMembers, func(id) { id != invitationId });
              vaultMemberIndex.put(vaultId, updatedVaultMembers);
              
              await logAuditEvent(?caller, "VAULT_INVITATION_DECLINED", "Declined invitation to vault: " # vaultId, true);
              return #ok(true);
              
            } else {
              return #err("Invalid response. Use 'accept' or 'decline'");
            };
          };
        };
      };
    };
  };
              
              await logAuditEvent(?caller, "VAULT_JOIN", "Joined vault", true);
              return #ok(true);
              
            } else if (response == "decline") {
              // Remove member from vault
              vaultMembers.delete(memberId);
              
              // Update indexes
              let currentUserVaults = Option.get(userVaults.get(caller), []);
              let filteredUserVaults = Array.filter<Text>(currentUserVaults, func(vid) { vid != vaultId });
              userVaults.put(caller, filteredUserVaults);
              
              let currentVaultMembers = Option.get(vaultMemberIndex.get(vaultId), []);
              let filteredVaultMembers = Array.filter<Text>(currentVaultMembers, func(mid) { mid != memberId });
              vaultMemberIndex.put(vaultId, filteredVaultMembers);
              
              await logAuditEvent(?caller, "VAULT_DECLINE", "Declined vault invitation", true);
              return #ok(true);
              
            } else {
              return #err("Invalid response. Use 'accept' or 'decline'");
            };
          };
        };
      };
    };
  };

  // ============ PLUGIN SYSTEM MANAGEMENT ============
  
  // ========== PLUGIN SYSTEM PUBLIC FUNCTIONS ==========
  
  public shared(msg) func addPlugin(plugin: Plugin): async Result.Result<Plugin, Text> {
    if (msg.caller != admin) {
      return #err("Only admin can add plugins");
    };
    
    let pluginId = generateId("plugin", nextPluginId);
    nextPluginId += 1;
    
    let newPlugin: Plugin = {
      id = pluginId;
      name = plugin.name;
      description = plugin.description;
      version = plugin.version;
      author = plugin.author;
      category = plugin.category;
      status = plugin.status;
      permissions = plugin.permissions;
      icon = plugin.icon;
      entryPoint = plugin.entryPoint;
      configSchema = plugin.configSchema;
      isEnabled = plugin.isEnabled;
      isInstalled = plugin.isInstalled;
      installCount = 0;
      rating = 0.0;
      createdAt = getCurrentTime();
      updatedAt = getCurrentTime();
      metadata = plugin.metadata;
    };
    
    pluginStore.put(pluginId, newPlugin);
    addToPluginCategoryIndex(pluginCategoryToText(plugin.category), pluginId);
    
    #ok(newPlugin)
  };

  // ============ VAULT CHAT MANAGEMENT ============
  
  // Create a chat room for a vault
  public shared(msg) func createVaultChatRoom(
    vaultId: Text,
    name: Text,
    description: ?Text
  ): async Result.Result<VaultChatRoom, Text> {
    let caller = msg.caller;
    
    // Check if user is a member of the vault
    let userMemberIds = Option.get(vaultMemberIndex.get(vaultId), []);
    let isMember = Array.find<Text>(userMemberIds, func(memberId) {
      switch (vaultMembers.get(memberId)) {
        case (?member) { member.userId == caller and member.isActive };
        case null { false };
      };
    });
    
    switch (isMember) {
      case null { return #err("Not a member of this vault"); };
      case (?memberId) {
        let chatRoomId = generateId("chat_room", nextVaultChatRoomId);
        nextVaultChatRoomId += 1;

        let chatRoom: VaultChatRoom = {
          id = chatRoomId;
          vaultId = vaultId;
          name = name;
          description = description;
          isActive = true;
          createdAt = getCurrentTime();
          updatedAt = getCurrentTime();
          lastMessageAt = null;
          memberCount = 0;
          metadata = null;
        };

        vaultChatRooms.put(chatRoomId, chatRoom);
        
        // Update chat room index
        let currentChatRooms = Option.get(vaultChatRoomIndex.get(vaultId), []);
        vaultChatRoomIndex.put(vaultId, Array.append(currentChatRooms, [chatRoomId]));

        #ok(chatRoom)
      };
    };
  };

  // Join a vault chat room
  public shared(msg) func joinVaultChat(
    vaultId: Text,
    userName: Text
  ): async Result.Result<Bool, Text> {
    let caller = msg.caller;
    
    // Check if user is a member of the vault
    let userMemberIds = Option.get(vaultMemberIndex.get(vaultId), []);
    let isMember = Array.find<Text>(userMemberIds, func(memberId) {
      switch (vaultMembers.get(memberId)) {
        case (?member) { member.userId == caller and member.isActive };
        case null { false };
      };
    });
    
    switch (isMember) {
      case null { return #err("Not a member of this vault"); };
      case (?memberId) {
        let memberKey = Text.concat(Principal.toText(caller), Text.concat("_", vaultId));
        
        // Check if user is already a chat member
        switch (chatMembers.get(memberKey)) {
          case (?existingMember) {
            // User is already a chat member, just update last seen
            let updatedMember: ChatMember = {
              userId = existingMember.userId;
              userName = existingMember.userName;
              joinedAt = existingMember.joinedAt;
              lastSeenAt = getCurrentTime();
              isTyping = existingMember.isTyping;
              typingSince = existingMember.typingSince;
              unreadCount = existingMember.unreadCount;
              isMuted = existingMember.isMuted;
              role = existingMember.role;
            };
            chatMembers.put(memberKey, updatedMember);
            return #ok(true);
          };
          case null {
            // User is not a chat member, add them
            let member: ChatMember = {
              userId = caller;
              userName = userName;
              joinedAt = getCurrentTime();
              lastSeenAt = getCurrentTime();
              isTyping = false;
              typingSince = null;
              unreadCount = 0;
              isMuted = false;
              role = "member";
            };

            chatMembers.put(memberKey, member);
            
            // Update chat member index
            let currentChatMembers = Option.get(vaultChatMemberIndex.get(vaultId), []);
            vaultChatMemberIndex.put(vaultId, Array.append(currentChatMembers, [Principal.toText(caller)]));

            // Create notification for other members
            let notificationId = generateId("notif", nextChatNotificationId);
            nextChatNotificationId += 1;

            let notification: ChatNotification = {
              id = notificationId;
              vaultId = vaultId;
              userId = caller;
              notificationType = "member_joined";
              title = "New Member";
              body = Text.concat(userName, Text.concat(" joined the vault chat", ""));
              timestamp = getCurrentTime();
              isRead = false;
              metadata = null;
            };
            
            chatNotifications.put(notificationId, notification);
            
            // Update user notification index
            let currentUserNotifications = Option.get(userChatNotificationIndex.get(caller), []);
            userChatNotificationIndex.put(caller, Array.append(currentUserNotifications, [notificationId]));

            #ok(true)
          };
        };
      };
    };
  };

  // Send a message to vault chat
  public shared(msg) func sendVaultMessage(
    vaultId: Text,
    content: Text,
    messageType: MessageType,
    replyTo: ?Text
  ): async Result.Result<VaultMessage, Text> {
    let caller = msg.caller;
    let memberKey = Text.concat(Principal.toText(caller), Text.concat("_", vaultId));
    
    // Check if user is a chat member
    switch (chatMembers.get(memberKey)) {
      case null { return #err("User is not a member of this vault chat"); };
      case (?member) {
        let messageId = generateId("msg", nextVaultMessageId);
        nextVaultMessageId += 1;

        let message: VaultMessage = {
          id = messageId;
          vaultId = vaultId;
          userId = caller;
          userName = member.userName;
          messageType = messageType;
          content = content;
          status = #Sent;
          timestamp = getCurrentTime();
          editedAt = null;
          replyTo = replyTo;
          reactions = [];
          metadata = null;
        };
        
        vaultMessages.put(messageId, message);
        
        // Update message index
        let currentMessages = Option.get(vaultMessageIndex.get(vaultId), []);
        vaultMessageIndex.put(vaultId, Array.append(currentMessages, [messageId]));

        // Update member's last seen
        let updatedMember: ChatMember = {
          userId = member.userId;
          userName = member.userName;
          joinedAt = member.joinedAt;
          lastSeenAt = getCurrentTime();
          isTyping = false;
          typingSince = null;
          unreadCount = member.unreadCount;
          isMuted = member.isMuted;
          role = member.role;
        };
        chatMembers.put(memberKey, updatedMember);

        // Create notification for other members
        let notificationId = generateId("notif", nextChatNotificationId);
        nextChatNotificationId += 1;

        let notification: ChatNotification = {
          id = notificationId;
          vaultId = vaultId;
          userId = caller;
          notificationType = "message";
          title = member.userName;
          body = content;
          timestamp = getCurrentTime();
          isRead = false;
          metadata = ?messageId;
        };

        chatNotifications.put(notificationId, notification);

        #ok(message)
      };
    };
  };
  
  // Get vault messages
  public shared(msg) func getVaultMessages(
    vaultId: Text,
    limit: Nat,
    offset: Nat
  ): async Result.Result<[VaultMessage], Text> {
    let caller = msg.caller;
    
    // Check if user is a member of the vault
    let userMemberIds = Option.get(vaultMemberIndex.get(vaultId), []);
    let isMember = Array.find<Text>(userMemberIds, func(memberId) {
      switch (vaultMembers.get(memberId)) {
        case (?member) { member.userId == caller and member.isActive };
            case null { false };
          };
    });
    
    switch (isMember) {
      case null { return #err("Not a member of this vault"); };
      case (?memberId) {
        switch (vaultMessageIndex.get(vaultId)) {
      case null { #ok([]) };
          case (?messageIds) {
            let allMessages = Array.mapFilter<Text, VaultMessage>(messageIds, func(id) {
              vaultMessages.get(id)
            });
            
            // Sort by timestamp (newest first) and apply pagination
            let sortedMessages = Array.sort<VaultMessage>(
              allMessages,
              func(a: VaultMessage, b: VaultMessage): { #less; #equal; #greater } {
                if (a.timestamp > b.timestamp) { #greater }
                else if (a.timestamp < b.timestamp) { #less }
                else { #equal }
              }
            );
            
            let startIndex = offset;
            let endIndex = Nat.min(startIndex + limit, sortedMessages.size());
            
            if (startIndex >= sortedMessages.size()) {
              #ok([])
            } else {
              let paginatedMessages = Array.subArray<VaultMessage>(sortedMessages, startIndex, endIndex - startIndex);
              #ok(paginatedMessages)
            }
          };
        };
      };
    };
  };

  // Update typing indicator
  public shared(msg) func updateTypingStatus(
    vaultId: Text,
    isTyping: Bool
  ): async Result.Result<Bool, Text> {
    let caller = msg.caller;
    let memberKey = Text.concat(Principal.toText(caller), Text.concat("_", vaultId));
    
    switch (chatMembers.get(memberKey)) {
      case null { return #err("User is not a member of this vault chat"); };
      case (?member) {
        let updatedMember: ChatMember = {
          userId = member.userId;
          userName = member.userName;
          joinedAt = member.joinedAt;
          lastSeenAt = getCurrentTime();
          isTyping = isTyping;
          typingSince = if (isTyping) ?getCurrentTime() else null;
          unreadCount = member.unreadCount;
          isMuted = member.isMuted;
          role = member.role;
        };
        
        chatMembers.put(memberKey, updatedMember);
        #ok(true)
      };
    };
  };
  
  // Get typing indicators for a vault
  public shared(msg) func getTypingIndicators(vaultId: Text): async Result.Result<[TypingIndicator], Text> {
    let caller = msg.caller;
    
    // Check if user is a member of the vault
    let userMemberIds = Option.get(vaultMemberIndex.get(vaultId), []);
    let isMember = Array.find<Text>(userMemberIds, func(memberId) {
      switch (vaultMembers.get(memberId)) {
        case (?member) { member.userId == caller and member.isActive };
        case null { false };
      };
    });
    
    switch (isMember) {
      case null { return #err("Not a member of this vault"); };
      case (?memberId) {
        switch (vaultChatMemberIndex.get(vaultId)) {
          case null { #ok([]) };
          case (?userIds) {
            let typingUsers = Array.filter<Text>(
              userIds,
              func(userId: Text): Bool {
                let memberKey = Text.concat(userId, Text.concat("_", vaultId));
                switch (chatMembers.get(memberKey)) {
                  case null { false };
                  case (?member) { member.isTyping };
                };
              }
            );
            
            let typingIndicators = Array.map<Text, TypingIndicator>(
              typingUsers,
              func(userId: Text): TypingIndicator {
                let memberKey = Text.concat(userId, Text.concat("_", vaultId));
                switch (chatMembers.get(memberKey)) {
                  case null {
                    {
                      userId = Principal.fromText("2vxsx-fae");
                      userName = "";
                      isTyping = false;
                      startedAt = 0;
                    }
                  };
                  case (?member) {
                    {
                      userId = member.userId;
                      userName = member.userName;
                      isTyping = member.isTyping;
                      startedAt = switch (member.typingSince) {
                        case null { 0 };
                        case (?time) { time };
                      };
                    }
                  };
                };
              }
            );
            
            #ok(typingIndicators)
          };
        };
      };
    };
  };
  
  // Mark messages as read
  public shared(msg) func markMessagesAsRead(
    vaultId: Text,
    messageIds: [Text]
  ): async Result.Result<Bool, Text> {
    let caller = msg.caller;
    let memberKey = Text.concat(Principal.toText(caller), Text.concat("_", vaultId));
    
    switch (chatMembers.get(memberKey)) {
      case null { return #err("User is not a member of this vault chat"); };
      case (?member) {
        // Update member's unread count
        let updatedMember: ChatMember = {
          userId = member.userId;
          userName = member.userName;
          joinedAt = member.joinedAt;
          lastSeenAt = getCurrentTime();
          isTyping = member.isTyping;
          typingSince = member.typingSince;
          unreadCount = 0; // Reset unread count
          isMuted = member.isMuted;
          role = member.role;
        };
        
        chatMembers.put(memberKey, updatedMember);
        #ok(true)
      };
    };
  };
  
  // Get user chat notifications
  public shared(msg) func getUserChatNotifications(
    limit: Nat,
    offset: Nat
  ): async Result.Result<[ChatNotification], Text> {
    let caller = msg.caller;
    
    switch (userChatNotificationIndex.get(caller)) {
      case null { #ok([]) };
      case (?notificationIds) {
        let allNotifications = Array.mapFilter<Text, ChatNotification>(notificationIds, func(id) {
          chatNotifications.get(id)
        });
        
        // Sort by timestamp (newest first) and apply pagination
        let sortedNotifications = Array.sort<ChatNotification>(
          allNotifications,
          func(a: ChatNotification, b: ChatNotification): { #less; #equal; #greater } {
            if (a.timestamp > b.timestamp) { #greater }
            else if (a.timestamp < b.timestamp) { #less }
            else { #equal }
          }
        );
        
        let startIndex = offset;
        let endIndex = Nat.min(startIndex + limit, sortedNotifications.size());
        
        if (startIndex >= sortedNotifications.size()) {
          #ok([])
        } else {
          let paginatedNotifications = Array.subArray<ChatNotification>(sortedNotifications, startIndex, endIndex - startIndex);
          #ok(paginatedNotifications)
        }
      };
    };
  };
  
  // Leave vault chat
  public shared(msg) func leaveVaultChat(vaultId: Text): async Result.Result<Bool, Text> {
    let caller = msg.caller;
    let memberKey = Text.concat(Principal.toText(caller), Text.concat("_", vaultId));
    
    switch (chatMembers.get(memberKey)) {
      case null { return #err("User is not a member of this vault chat"); };
      case (?member) {
        // Remove member
        chatMembers.delete(memberKey);
        
        // Update chat member index
        switch (vaultChatMemberIndex.get(vaultId)) {
          case null { };
          case (?userIds) {
            let filteredUserIds = Array.filter<Text>(userIds, func(id: Text): Bool { id != Principal.toText(caller) });
            vaultChatMemberIndex.put(vaultId, filteredUserIds);
          };
        };

        // Create notification for other members
        let notificationId = generateId("notif", nextChatNotificationId);
        nextChatNotificationId += 1;

        let notification: ChatNotification = {
          id = notificationId;
          vaultId = vaultId;
          userId = caller;
          notificationType = "member_left";
          title = "Member Left";
          body = Text.concat(member.userName, Text.concat(" left the vault chat", ""));
          timestamp = getCurrentTime();
          isRead = false;
          metadata = null;
        };

        chatNotifications.put(notificationId, notification);

        #ok(true)
      };
    };
  };
  
  // Get vault chat members
  public shared(msg) func getVaultChatMembers(vaultId: Text): async Result.Result<[ChatMember], Text> {
    let caller = msg.caller;
    
    // Check if user is a member of the vault
    let userMemberIds = Option.get(vaultMemberIndex.get(vaultId), []);
    let isMember = Array.find<Text>(userMemberIds, func(memberId) {
      switch (vaultMembers.get(memberId)) {
        case (?member) { member.userId == caller and member.isActive };
        case null { false };
      };
    });
    
    switch (isMember) {
      case null { return #err("Not a member of this vault"); };
      case (?memberId) {
        switch (vaultChatMemberIndex.get(vaultId)) {
          case null { #ok([]) };
          case (?userIds) {
            let members = Array.mapFilter<Text, ChatMember>(
              userIds,
              func(userId: Text): ?ChatMember {
                let memberKey = Text.concat(userId, Text.concat("_", vaultId));
                chatMembers.get(memberKey)
              }
            );
            
            #ok(members)
          };
        };
      };
    };
  };

  // ============ SOCIAL GAMES MANAGEMENT ============
  
  // Create a new social game
  public shared(msg) func createSocialGame(
    name: Text,
    description: Text,
    gameType: Text,
    startTime: Int,
    endTime: ?Int,
    maxParticipants: ?Nat,
    entryFee: ?Float,
    prizePool: Float,
    currency: Text,
    rules: ?Text,
    isPublic: Bool
  ): async Result.Result<SocialGame, Text> {
    let caller = msg.caller;
    
    // Check if user exists
    switch (users.get(caller)) {
      case null { return #err("User not found"); };
      case (?user) {
        let gameId = generateId("game", nextGameId);
        nextGameId += 1;
        
        let now = getCurrentTime();
        let gameTypeEnum = textToGameType(gameType);
        
        let newGame: SocialGame = {
          id = gameId;
          name = name;
          description = description;
          gameType = gameTypeEnum;
          status = #Active;
          startTime = startTime;
          endTime = endTime;
          maxParticipants = maxParticipants;
          currentParticipants = 0;
          entryFee = entryFee;
          prizePool = prizePool;
          currency = currency;
          rules = rules;
          isPublic = isPublic;
          createdBy = caller;
          createdAt = now;
          updatedAt = now;
          metadata = null;
        };
        
        socialGames.put(gameId, newGame);
        
        // Update user games index
        let currentUserGames = Option.get(userGames.get(caller), []);
        userGames.put(caller, Array.append(currentUserGames, [gameId]));
        
        await logAuditEvent(?caller, "GAME_CREATED", "Social game created: " # name, true);
        return #ok(newGame);
      };
    };
  };
  
  // Get all available games
  public shared(msg) func getAvailableGames(): async Result.Result<[SocialGame], Text> {
    let caller = msg.caller;
    
    let gamesArray = Array.mapFilter<(Text, SocialGame), SocialGame>(
      socialGames.entries() |> Iter.toArray(_),
      func((id, game)) { 
        if (game.status == #Active and game.isPublic) {
          ?game;
        } else {
          null;
        };
      }
    );
    
    #ok(gamesArray);
  };
  
  // Get user's games
  public shared(msg) func getUserGames(): async Result.Result<[SocialGame], Text> {
    let caller = msg.caller;
    
    switch (userGames.get(caller)) {
      case null { #ok([]) };
      case (?gameIds) {
        let gamesArray = Array.mapFilter<Text, SocialGame>(gameIds, func(id) {
          socialGames.get(id);
        });
        #ok(gamesArray);
      };
    };
  };
  
  // Join a game
  public shared(msg) func joinGame(gameId: Text): async Result.Result<GameParticipant, Text> {
    let caller = msg.caller;
    
    switch (socialGames.get(gameId)) {
      case null { return #err("Game not found"); };
      case (?game) {
        if (game.status != #Active) {
          return #err("Game is not active");
        };
        
        // Check if game is full
        switch (game.maxParticipants) {
          case (?max) {
            if (game.currentParticipants >= max) {
              return #err("Game is full");
            };
          };
          case null {};
        };
        
        // Check if user is already a participant
        let participantIds = Option.get(gameParticipantIndex.get(gameId), []);
        let isAlreadyParticipant = Option.isSome(Array.find<Text>(participantIds, func(participantId) {
          switch (gameParticipants.get(participantId)) {
            case (?participant) { participant.userId == caller };
            case null { false };
          };
        }));
        
        if (isAlreadyParticipant) {
          return #err("Already participating in this game");
        };
        
        let participantId = generateId("game_participant", nextGameParticipantId);
        nextGameParticipantId += 1;
        
        let now = getCurrentTime();
        let newParticipant: GameParticipant = {
          id = participantId;
          gameId = gameId;
          userId = caller;
          score = 0.0;
          rank = null;
          joinedAt = now;
          isActive = true;
          metadata = null;
        };
        
        gameParticipants.put(participantId, newParticipant);
        
        // Update game participant count
        let updatedGame: SocialGame = {
          id = game.id;
          name = game.name;
          description = game.description;
          gameType = game.gameType;
          status = game.status;
          startTime = game.startTime;
          endTime = game.endTime;
          maxParticipants = game.maxParticipants;
          currentParticipants = game.currentParticipants + 1;
          entryFee = game.entryFee;
          prizePool = game.prizePool;
          currency = game.currency;
          rules = game.rules;
          isPublic = game.isPublic;
          createdBy = game.createdBy;
          createdAt = game.createdAt;
          updatedAt = now;
          metadata = game.metadata;
        };
        
        socialGames.put(gameId, updatedGame);
        
        // Update indexes
        let currentUserGames = Option.get(userGames.get(caller), []);
        userGames.put(caller, Array.append(currentUserGames, [gameId]));
        
        let currentGameParticipants = Option.get(gameParticipantIndex.get(gameId), []);
        gameParticipantIndex.put(gameId, Array.append(currentGameParticipants, [participantId]));
        
        await logAuditEvent(?caller, "GAME_JOINED", "Joined game: " # game.name, true);
        return #ok(newParticipant);
      };
    };
  };
  
  // Update player score
  public shared(msg) func updateGameScore(
    gameId: Text,
    score: Float
  ): async Result.Result<GameParticipant, Text> {
    let caller = msg.caller;
    
    // Find user's participation
    let participantIds = Option.get(gameParticipantIndex.get(gameId), []);
    let participantId = Array.find<Text>(participantIds, func(id) {
      switch (gameParticipants.get(id)) {
        case (?participant) { participant.userId == caller and participant.isActive };
        case null { false };
      };
    });
    
    switch (participantId) {
      case null { return #err("Not participating in this game"); };
      case (?id) {
        switch (gameParticipants.get(id)) {
          case null { return #err("Participant not found"); };
          case (?participant) {
            let updatedParticipant: GameParticipant = {
              id = participant.id;
              gameId = participant.gameId;
              userId = participant.userId;
              score = score;
              rank = participant.rank;
              joinedAt = participant.joinedAt;
              isActive = participant.isActive;
              metadata = participant.metadata;
            };
            
            gameParticipants.put(id, updatedParticipant);
            
            await logAuditEvent(?caller, "GAME_SCORE_UPDATED", "Updated score: " # Float.toText(score), true);
            return #ok(updatedParticipant);
          };
        };
      };
    };
  };
  
  // Get game leaderboard
  public shared(msg) func getGameLeaderboard(gameId: Text): async Result.Result<[GameParticipant], Text> {
    let caller = msg.caller;
    
    let participantIds = Option.get(gameParticipantIndex.get(gameId), []);
    let participants = Array.mapFilter<Text, GameParticipant>(participantIds, func(id) {
      gameParticipants.get(id);
    });
    
    // Sort by score (descending)
    let sortedParticipants = Array.sort<GameParticipant>(participants, func(a, b) {
      if (a.score > b.score) #greater
      else if (a.score < b.score) #less
      else #equal
    });
    
    // Update ranks
    let rankedParticipants = Array.tabulate<GameParticipant>(sortedParticipants.size(), func(i) {
      let participant = sortedParticipants[i];
      {
        id = participant.id;
        gameId = participant.gameId;
        userId = participant.userId;
        score = participant.score;
        rank = ?i;
        joinedAt = participant.joinedAt;
        isActive = participant.isActive;
        metadata = participant.metadata;
      }
    });
    
    #ok(rankedParticipants);
  };
  
  // Award game rewards
  public shared(msg) func awardGameReward(
    gameId: Text,
    userId: UserId,
    rewardType: Text,
    amount: Float,
    currency: ?Text,
    description: Text
  ): async Result.Result<GameReward, Text> {
    let caller = msg.caller;
    
    // Check if caller is game creator
    switch (socialGames.get(gameId)) {
      case null { return #err("Game not found"); };
      case (?game) {
        if (game.createdBy != caller) {
          return #err("Not authorized to award rewards");
        };
        
        let rewardId = generateId("game_reward", nextGameRewardId);
        nextGameRewardId += 1;
        
        let now = getCurrentTime();
        let newReward: GameReward = {
          id = rewardId;
          gameId = gameId;
          userId = userId;
          type_ = rewardType;
          amount = amount;
          currency = currency;
          description = description;
          claimedAt = null;
          expiresAt = ?(now + 30 * 24 * 60 * 60 * 1_000_000_000); // 30 days
          metadata = null;
        };
        
        gameRewards.put(rewardId, newReward);
        
        // Update user rewards index
        let currentUserRewards = Option.get(gameRewardIndex.get(userId), []);
        gameRewardIndex.put(userId, Array.append(currentUserRewards, [rewardId]));
        
        await logAuditEvent(?caller, "GAME_REWARD_AWARDED", "Awarded reward: " # description, true);
        return #ok(newReward);
      };
    };
  };
  
  // Claim game reward
  public shared(msg) func claimGameReward(rewardId: Text): async Result.Result<GameReward, Text> {
    let caller = msg.caller;
    
    switch (gameRewards.get(rewardId)) {
      case null { return #err("Reward not found"); };
      case (?reward) {
        if (reward.userId != caller) {
          return #err("Not authorized to claim this reward");
        };
        
        if (Option.isSome(reward.claimedAt)) {
          return #err("Reward already claimed");
        };
        
        let now = getCurrentTime();
        switch (reward.expiresAt) {
          case (?expiresAt) {
            if (now > expiresAt) {
              return #err("Reward has expired");
            };
          };
          case null {};
        };
        
        let updatedReward: GameReward = {
          id = reward.id;
          gameId = reward.gameId;
          userId = reward.userId;
          type_ = reward.type_;
          amount = reward.amount;
          currency = reward.currency;
          description = reward.description;
          claimedAt = ?now;
          expiresAt = reward.expiresAt;
          metadata = reward.metadata;
        };
        
        gameRewards.put(rewardId, updatedReward);
        
        await logAuditEvent(?caller, "GAME_REWARD_CLAIMED", "Claimed reward: " # reward.description, true);
        return #ok(updatedReward);
      };
    };
  };
  
  // Get user's rewards
  public shared(msg) func getUserGameRewards(): async Result.Result<[GameReward], Text> {
    let caller = msg.caller;
    
    switch (gameRewardIndex.get(caller)) {
      case null { #ok([]) };
      case (?rewardIds) {
        let rewardsArray = Array.mapFilter<Text, GameReward>(rewardIds, func(id) {
          gameRewards.get(id);
        });
        #ok(rewardsArray);
      };
    };
  };
  
  // End a game
  public shared(msg) func endGame(gameId: Text): async Result.Result<SocialGame, Text> {
    let caller = msg.caller;
    
    switch (socialGames.get(gameId)) {
      case null { return #err("Game not found"); };
      case (?game) {
        if (game.createdBy != caller) {
          return #err("Not authorized to end this game");
        };
        
        if (game.status != #Active) {
          return #err("Game is not active");
        };
        
        let now = getCurrentTime();
        let updatedGame: SocialGame = {
          id = game.id;
          name = game.name;
          description = game.description;
          gameType = game.gameType;
          status = #Completed;
          startTime = game.startTime;
          endTime = ?now;
          maxParticipants = game.maxParticipants;
          currentParticipants = game.currentParticipants;
          entryFee = game.entryFee;
          prizePool = game.prizePool;
          currency = game.currency;
          rules = game.rules;
          isPublic = game.isPublic;
          createdBy = game.createdBy;
          createdAt = game.createdAt;
          updatedAt = now;
          metadata = game.metadata;
        };
        
        socialGames.put(gameId, updatedGame);
        
        await logAuditEvent(?caller, "GAME_ENDED", "Ended game: " # game.name, true);
        return #ok(updatedGame);
      };
    };
  };
  
  // Get games by type
  public shared(msg) func getGamesByType(gameType: Text): async Result.Result<[SocialGame], Text> {
    let caller = msg.caller;
    
    let gameTypeEnum = textToGameType(gameType);
    let allGames = Array.mapFilter<(Text, SocialGame), SocialGame>(
      socialGames.entries() |> Iter.toArray(_),
      func((id, game)) { ?game }
    );
    
    let filteredGames = Array.filter<SocialGame>(allGames, func(game) {
      game.gameType == gameTypeEnum and game.status == #Active and game.isPublic;
    });
    
    #ok(filteredGames);
  };

  // ============ DEFI TOOLS MANAGEMENT ============
  
  // Create a DeFi position
  public shared(msg) func createDefiPosition(
    protocol: Text,
    productType: Text,
    tokenA: Text,
    tokenB: ?Text,
    amount: Float,
    apy: Float
  ): async Result.Result<DeFiPosition, Text> {
    let caller = msg.caller;
    
    // Check if user exists
    switch (users.get(caller)) {
      case null { return #err("User not found"); };
      case (?user) {
        let positionId = generateId("defi_position", nextDeFiPositionId);
        nextDeFiPositionId += 1;
        
        let now = getCurrentTime();
        let protocolEnum = textToDefiProtocol(protocol);
        let productTypeEnum = textToDefiProductType(productType);
        
        let newPosition: DeFiPosition = {
          id = positionId;
          userId = caller;
          protocol = protocolEnum;
          productType = productTypeEnum;
          tokenA = tokenA;
          tokenB = tokenB;
          amount = amount;
          apy = apy;
          rewards = 0.0;
          isActive = true;
          createdAt = now;
          updatedAt = now;
          metadata = null;
        };
        
        defiPositions.put(positionId, newPosition);
        
        // Update user DeFi positions index
        let currentUserPositions = Option.get(userDeFiPositions.get(caller), []);
        userDeFiPositions.put(caller, Array.append(currentUserPositions, [positionId]));
        
        await logAuditEvent(?caller, "DEFI_POSITION_CREATED", "Created DeFi position on " # protocol, true);
        return #ok(newPosition);
      };
    };
  };
  
  // Get user's DeFi positions
  public shared(msg) func getUserDefiPositions(): async Result.Result<[DeFiPosition], Text> {
    let caller = msg.caller;
    
    switch (userDeFiPositions.get(caller)) {
      case null { #ok([]) };
      case (?positionIds) {
        let positionsArray = Array.mapFilter<Text, DeFiPosition>(positionIds, func(id) {
          defiPositions.get(id);
        });
        #ok(positionsArray);
      };
    };
  };
  
  // Update DeFi position
  public shared(msg) func updateDefiPosition(
    positionId: Text,
    amount: Float,
    apy: Float,
    rewards: Float
  ): async Result.Result<DeFiPosition, Text> {
    let caller = msg.caller;
    
    switch (defiPositions.get(positionId)) {
      case null { return #err("Position not found"); };
      case (?position) {
        if (position.userId != caller) {
          return #err("Not authorized to update this position");
        };
        
        let now = getCurrentTime();
        let updatedPosition: DeFiPosition = {
          id = position.id;
          userId = position.userId;
          protocol = position.protocol;
          productType = position.productType;
          tokenA = position.tokenA;
          tokenB = position.tokenB;
          amount = amount;
          apy = apy;
          rewards = rewards;
          isActive = position.isActive;
          createdAt = position.createdAt;
          updatedAt = now;
          metadata = position.metadata;
        };
        
        defiPositions.put(positionId, updatedPosition);
        
        await logAuditEvent(?caller, "DEFI_POSITION_UPDATED", "Updated DeFi position", true);
        return #ok(updatedPosition);
      };
    };
  };
  
  // Close DeFi position
  public shared(msg) func closeDefiPosition(positionId: Text): async Result.Result<DeFiPosition, Text> {
    let caller = msg.caller;
    
    switch (defiPositions.get(positionId)) {
      case null { return #err("Position not found"); };
      case (?position) {
        if (position.userId != caller) {
          return #err("Not authorized to close this position");
        };
        
        if (not position.isActive) {
          return #err("Position is already closed");
        };
        
        let now = getCurrentTime();
        let updatedPosition: DeFiPosition = {
          id = position.id;
          userId = position.userId;
          protocol = position.protocol;
          productType = position.productType;
          tokenA = position.tokenA;
          tokenB = position.tokenB;
          amount = position.amount;
          apy = position.apy;
          rewards = position.rewards;
          isActive = false;
          createdAt = position.createdAt;
          updatedAt = now;
          metadata = position.metadata;
        };
        
        defiPositions.put(positionId, updatedPosition);
        
        await logAuditEvent(?caller, "DEFI_POSITION_CLOSED", "Closed DeFi position", true);
        return #ok(updatedPosition);
      };
    };
  };
  
  // Record DeFi transaction
  public shared(msg) func recordDefiTransaction(
    protocol: Text,
    type_: Text,
    tokenA: Text,
    tokenB: ?Text,
    amountA: Float,
    amountB: ?Float,
    fee: Float,
    txHash: ?Text
  ): async Result.Result<DeFiTransaction, Text> {
    let caller = msg.caller;
    
    let transactionId = generateId("defi_txn", nextDefiTransactionId);
    nextDefiTransactionId += 1;
    
    let now = getCurrentTime();
    let protocolEnum = textToDefiProtocol(protocol);
    
    let newTransaction: DeFiTransaction = {
      id = transactionId;
      userId = caller;
      protocol = protocolEnum;
      type_ = type_;
      tokenA = tokenA;
      tokenB = tokenB;
      amountA = amountA;
      amountB = amountB;
      fee = fee;
      txHash = txHash;
      status = "completed";
      timestamp = now;
      metadata = null;
    };
    
    defiTransactions.put(transactionId, newTransaction);
    
    // Update indexes
    let currentUserTransactions = Option.get(userDefiTransactions.get(caller), []);
    userDefiTransactions.put(caller, Array.append(currentUserTransactions, [transactionId]));
    
    let protocolKey = defiProtocolToText(protocolEnum);
    let currentProtocolTransactions = Option.get(protocolTransactionIndex.get(protocolKey), []);
    protocolTransactionIndex.put(protocolKey, Array.append(currentProtocolTransactions, [transactionId]));
    
    await logAuditEvent(?caller, "DEFI_TRANSACTION_RECORDED", "Recorded DeFi transaction: " # type_, true);
    return #ok(newTransaction);
  };
  
  // Get user's DeFi transactions
  public shared(msg) func getUserDefiTransactions(): async Result.Result<[DeFiTransaction], Text> {
    let caller = msg.caller;
    
    switch (userDefiTransactions.get(caller)) {
      case null { #ok([]) };
      case (?transactionIds) {
        let transactionsArray = Array.mapFilter<Text, DeFiTransaction>(transactionIds, func(id) {
          defiTransactions.get(id);
        });
        #ok(transactionsArray);
      };
    };
  };
  
  // Get DeFi transactions by protocol
  public shared(msg) func getDefiTransactionsByProtocol(protocol: Text): async Result.Result<[DeFiTransaction], Text> {
    let caller = msg.caller;
    
    let protocolEnum = textToDefiProtocol(protocol);
    let protocolKey = defiProtocolToText(protocolEnum);
    
    switch (protocolTransactionIndex.get(protocolKey)) {
      case null { #ok([]) };
      case (?transactionIds) {
        let transactionsArray = Array.mapFilter<Text, DeFiTransaction>(transactionIds, func(id) {
          defiTransactions.get(id);
        });
        #ok(transactionsArray);
      };
    };
  };
  
  // Get DeFi analytics
  public shared(msg) func getDefiAnalytics(): async Result.Result<{
    totalPositions: Nat;
    totalValue: Float;
    totalRewards: Float;
    averageApy: Float;
    activeProtocols: [Text];
  }, Text> {
    let caller = msg.caller;
    
    let userPositions = Option.get(userDeFiPositions.get(caller), []);
    let positions = Array.mapFilter<Text, DeFiPosition>(userPositions, func(id) {
      defiPositions.get(id);
    });
    
    let activePositions = Array.filter<DeFiPosition>(positions, func(pos) { pos.isActive });
    let totalPositions = activePositions.size();
    
    let totalValue = Array.foldLeft<DeFiPosition, Float>(activePositions, 0.0, func(acc, pos) {
      acc + pos.amount;
    });
    
    let totalRewards = Array.foldLeft<DeFiPosition, Float>(activePositions, 0.0, func(acc, pos) {
      acc + pos.rewards;
    });
    
    let averageApy = if (totalPositions > 0) {
      let totalApy = Array.foldLeft<DeFiPosition, Float>(activePositions, 0.0, func(acc, pos) {
        acc + pos.apy;
      });
      totalApy / Float.fromInt(totalPositions);
    } else {
      0.0;
    };
    
    let protocols = Array.map<DeFiPosition, Text>(activePositions, func(pos) {
      defiProtocolToText(pos.protocol);
    });
    
    // Unique protocols using Buffer
    let seen = Buffer.Buffer<Text>(protocols.size());
    let uniqueProtocolsBuf = Buffer.Buffer<Text>(protocols.size());
    for (protocol in protocols.vals()) {
      if (not Buffer.contains<Text>(seen, protocol, Text.equal)) {
        seen.add(protocol);
        uniqueProtocolsBuf.add(protocol);
      }
    };
    let uniqueProtocols = Buffer.toArray(uniqueProtocolsBuf);
    
    return #ok({
      totalPositions = totalPositions;
      totalValue = totalValue;
      totalRewards = totalRewards;
      averageApy = averageApy;
      activeProtocols = uniqueProtocols;
    });
  };
  
  // Get DeFi position by protocol
  public shared(msg) func getDefiPositionsByProtocol(protocol: Text): async Result.Result<[DeFiPosition], Text> {
    let caller = msg.caller;
    
    let protocolEnum = textToDefiProtocol(protocol);
    let userPositions = Option.get(userDeFiPositions.get(caller), []);
    let positions = Array.mapFilter<Text, DeFiPosition>(userPositions, func(id) {
      defiPositions.get(id);
    });
    
    let filteredPositions = Array.filter<DeFiPosition>(positions, func(pos) {
      pos.protocol == protocolEnum and pos.isActive;
    });
    
    #ok(filteredPositions);
  };
  
  // Get DeFi position by product type
  public shared(msg) func getDefiPositionsByProductType(productType: Text): async Result.Result<[DeFiPosition], Text> {
    let caller = msg.caller;
    
    let productTypeEnum = textToDefiProductType(productType);
    let userPositions = Option.get(userDeFiPositions.get(caller), []);
    let positions = Array.mapFilter<Text, DeFiPosition>(userPositions, func(id) {
      defiPositions.get(id);
    });
    
    let filteredPositions = Array.filter<DeFiPosition>(positions, func(pos) {
      pos.productType == productTypeEnum and pos.isActive;
    });
    
    #ok(filteredPositions);
  };
  
  // Calculate DeFi rewards
  public shared(msg) func calculateDefiRewards(positionId: Text): async Result.Result<Float, Text> {
    let caller = msg.caller;
    
    switch (defiPositions.get(positionId)) {
      case null { return #err("Position not found"); };
      case (?position) {
        if (position.userId != caller) {
          return #err("Not authorized to access this position");
        };
        
        if (not position.isActive) {
          return #err("Position is not active");
        };
        
        let now = getCurrentTime();
        let timeElapsed = Float.fromInt(now - position.createdAt) / 1_000_000_000.0; // Convert to seconds
        let daysElapsed = timeElapsed / (24.0 * 60.0 * 60.0); // Convert to days
        
        let calculatedRewards = position.amount * (position.apy / 100.0) * (daysElapsed / 365.0);
        
        #ok(calculatedRewards);
      };
    };
  };
  
  // Get DeFi protocol statistics
  public shared(msg) func getDefiProtocolStats(protocol: Text): async Result.Result<{
    totalUsers: Nat;
    totalVolume: Float;
    averageApy: Float;
    totalPositions: Nat;
  }, Text> {
    let caller = msg.caller;
    
    let protocolEnum = textToDefiProtocol(protocol);
    let allPositions = Array.mapFilter<(Text, DeFiPosition), DeFiPosition>(
      defiPositions.entries() |> Iter.toArray(_),
      func((id, pos)) { ?pos }
    );
    
    let protocolPositions = Array.filter<DeFiPosition>(allPositions, func(pos) {
      pos.protocol == protocolEnum and pos.isActive;
    });
    
    let totalPositions = protocolPositions.size();
    let totalVolume = Array.foldLeft<DeFiPosition, Float>(protocolPositions, 0.0, func(acc, pos) {
      acc + pos.amount;
    });
    
    let averageApy = if (totalPositions > 0) {
      let totalApy = Array.foldLeft<DeFiPosition, Float>(protocolPositions, 0.0, func(acc, pos) {
        acc + pos.apy;
      });
      totalApy / Float.fromInt(totalPositions);
    } else {
      0.0;
    };
    
    let uniqueUsers = Array.map<DeFiPosition, UserId>(protocolPositions, func(pos) { pos.userId });
    let totalUsers = uniqueUsers.size();
    
    return #ok({
      totalUsers = totalUsers;
      totalVolume = totalVolume;
      averageApy = averageApy;
      totalPositions = totalPositions;
    });
  };

  // ============ AI ASSISTANT MANAGEMENT ============
  
  // Send a message to AI assistant
  public shared(msg) func sendAIMessage(content: Text): async Result.Result<AIMessage, Text> {
    let caller = msg.caller;
    
    // Check if user exists
    switch (users.get(caller)) {
      case null { return #err("User not found"); };
      case (?user) {
        let messageId = generateId("ai_message", nextAIMessageId);
        nextAIMessageId := nextAIMessageId + 1;
        
        let now = getCurrentTime();
        let userMessage: AIMessage = {
          id = messageId;
          userId = caller;
          type_ = #User;
          content = content;
          timestamp = now;
          metadata = null;
        };
        
        aiMessages.put(messageId, userMessage);
        
        // Update user messages index
        let currentUserMessages = Option.get(userAIMessages.get(caller), []);
        userAIMessages.put(caller, Array.append(currentUserMessages, [messageId]));
        
        // Generate AI response (simplified - in production, integrate with actual AI service)
        let aiResponseId = generateId("ai_message", nextAIMessageId);
        nextAIMessageId := nextAIMessageId + 1;
        
        let aiResponse = generateAIResponse(content, caller);
        let aiMessage: AIMessage = {
          id = aiResponseId;
          userId = caller;
          type_ = #Assistant;
          content = aiResponse;
          timestamp = now + 1; // Slightly after user message
          metadata = null;
        };
        
        aiMessages.put(aiResponseId, aiMessage);
        
        // Update user messages index
        let updatedUserMessages = Array.append(currentUserMessages, [messageId, aiResponseId]);
        userAIMessages.put(caller, updatedUserMessages);
        
        await logAuditEvent(?caller, "AI_MESSAGE_SENT", "Sent message to AI assistant", true);
        return #ok(userMessage);
      };
    };
  };
  
  // Get user's AI conversation history
  public shared(msg) func getAIConversationHistory(): async Result.Result<[AIMessage], Text> {
    let caller = msg.caller;
    
    switch (userAIMessages.get(caller)) {
      case null { #ok([]) };
      case (?messageIds) {
        let messagesArray = Array.mapFilter<Text, AIMessage>(messageIds, func(id) {
          aiMessages.get(id);
        });
        
        // Sort by timestamp
        let sortedMessages = Array.sort<AIMessage>(messagesArray, func(a, b) {
          if (a.timestamp < b.timestamp) #less
          else if (a.timestamp > b.timestamp) #greater
          else #equal
        });
        
        #ok(sortedMessages);
      };
    };
  };
  
  // Generate AI insights for user
  public shared(msg) func generateAIInsights(): async Result.Result<[AIInsight], Text> {
    let caller = msg.caller;
    
    // Check if user exists
    switch (users.get(caller)) {
      case null { return #err("User not found"); };
      case (?user) {
        let insights = generateUserInsights(caller);
        
        // Store insights
        let insightIds = Array.map<AIInsight, Text>(insights, func(insight) {
          let insightId = generateId("ai_insight", nextAIInsightId);
          nextAIInsightId := nextAIInsightId + 1;
          
          let now = getCurrentTime();
          let newInsight: AIInsight = {
            id = insightId;
            userId = caller;
            type_ = insight.type_;
            title = insight.title;
            description = insight.description;
            confidence = insight.confidence;
            actionable = insight.actionable;
            createdAt = now;
            metadata = insight.metadata;
          };
          
          aiInsights.put(insightId, newInsight);
          insightId;
        });
        
        // Update user insights index
        let currentUserInsights = Option.get(userAIInsights.get(caller), []);
        userAIInsights.put(caller, Array.append(currentUserInsights, insightIds));
        
        await logAuditEvent(?caller, "AI_INSIGHTS_GENERATED", "Generated AI insights", true);
        return #ok(insights);
      };
    };
  };
  
  // Get user's AI insights
  public shared(msg) func getUserAIInsights(): async Result.Result<[AIInsight], Text> {
    let caller = msg.caller;
    
    switch (userAIInsights.get(caller)) {
      case null { #ok([]) };
      case (?insightIds) {
        let insightsArray = Array.mapFilter<Text, AIInsight>(insightIds, func(id) {
          aiInsights.get(id);
        });
        
        // Sort by creation date (newest first)
        let sortedInsights = Array.sort<AIInsight>(insightsArray, func(a, b) {
          if (a.createdAt > b.createdAt) #greater
          else if (a.createdAt < b.createdAt) #less
          else #equal
        });
        
        #ok(sortedInsights);
      };
    };
  };
  
  // Generate AI recommendations
  public shared(msg) func generateAIRecommendations(): async Result.Result<[AIRecommendation], Text> {
    let caller = msg.caller;
    
    // Check if user exists
    switch (users.get(caller)) {
      case null { return #err("User not found"); };
      case (?user) {
        let recommendations = generateUserRecommendations(caller);
        
        // Store recommendations
        let recommendationIds = Array.map<AIRecommendation, Text>(recommendations, func(recommendation) {
          let recommendationId = generateId("ai_recommendation", nextAIRecommendationId);
          nextAIRecommendationId += 1;
          
          let now = getCurrentTime();
          let newRecommendation: AIRecommendation = {
            id = recommendationId;
            userId = caller;
            category = recommendation.category;
            title = recommendation.title;
            description = recommendation.description;
            priority = recommendation.priority;
            estimatedImpact = recommendation.estimatedImpact;
            isImplemented = false;
            createdAt = now;
            metadata = recommendation.metadata;
          };
          
          aiRecommendations.put(recommendationId, newRecommendation);
          recommendationId;
        });
        
        // Update user recommendations index
        let currentUserRecommendations = Option.get(userAIRecommendations.get(caller), []);
        userAIRecommendations.put(caller, Array.append(currentUserRecommendations, recommendationIds));
        
        await logAuditEvent(?caller, "AI_RECOMMENDATIONS_GENERATED", "Generated AI recommendations", true);
        return #ok(recommendations);
      };
    };
  };
  
  // Get user's AI recommendations
  public shared(msg) func getUserAIRecommendations(): async Result.Result<[AIRecommendation], Text> {
    let caller = msg.caller;
    
    switch (userAIRecommendations.get(caller)) {
      case null { #ok([]) };
      case (?recommendationIds) {
        let recommendationsArray = Array.mapFilter<Text, AIRecommendation>(recommendationIds, func(id) {
          aiRecommendations.get(id);
        });
        
        // Sort by priority and creation date
        let sortedRecommendations = Array.sort<AIRecommendation>(recommendationsArray, func(a, b) {
          let priorityOrder = switch (a.priority, b.priority) {
            case ("high", "high") { 0 };
            case ("high", "medium") { -1 };
            case ("high", "low") { -1 };
            case ("medium", "high") { 1 };
            case ("medium", "medium") { 0 };
            case ("medium", "low") { -1 };
            case ("low", "high") { 1 };
            case ("low", "medium") { 1 };
            case ("low", "low") { 0 };
            case (_, _) { 0 };
          };
          if (priorityOrder != 0) {
            if (priorityOrder < 0) #greater else #less
          } else {
            if (a.createdAt > b.createdAt) #greater
            else if (a.createdAt < b.createdAt) #less
            else #equal
          }
        });
        
        #ok(sortedRecommendations);
      };
    };
  };
  
  // Mark recommendation as implemented
  public shared(msg) func markRecommendationImplemented(recommendationId: Text): async Result.Result<AIRecommendation, Text> {
    let caller = msg.caller;
    
    switch (aiRecommendations.get(recommendationId)) {
      case null { return #err("Recommendation not found"); };
      case (?recommendation) {
        if (recommendation.userId != caller) {
          return #err("Not authorized to modify this recommendation");
        };
        
        let updatedRecommendation: AIRecommendation = {
          id = recommendation.id;
          userId = recommendation.userId;
          category = recommendation.category;
          title = recommendation.title;
          description = recommendation.description;
          priority = recommendation.priority;
          estimatedImpact = recommendation.estimatedImpact;
          isImplemented = true;
          createdAt = recommendation.createdAt;
          metadata = recommendation.metadata;
        };
        
        aiRecommendations.put(recommendationId, updatedRecommendation);
        
        await logAuditEvent(?caller, "AI_RECOMMENDATION_IMPLEMENTED", "Marked recommendation as implemented", true);
        return #ok(updatedRecommendation);
      };
    };
  };
  
  // Get AI analytics
  public shared(msg) func getAIAnalytics(): async Result.Result<{
    totalMessages: Nat;
    totalInsights: Nat;
    totalRecommendations: Nat;
    implementedRecommendations: Nat;
    averageConfidence: Float;
  }, Text> {
    let caller = msg.caller;
    
    let userMessages = Option.get(userAIMessages.get(caller), []);
    let userInsights = Option.get(userAIInsights.get(caller), []);
    let userRecommendations = Option.get(userAIRecommendations.get(caller), []);
    
    let totalMessages = userMessages.size();
    let totalInsights = userInsights.size();
    let totalRecommendations = userRecommendations.size();
    
    let recommendations = Array.mapFilter<Text, AIRecommendation>(userRecommendations, func(id) {
      aiRecommendations.get(id);
    });
    
    let implementedRecommendations = Array.filter<AIRecommendation>(recommendations, func(rec) {
      rec.isImplemented;
    }).size();
    
    let insights = Array.mapFilter<Text, AIInsight>(userInsights, func(id) {
      aiInsights.get(id);
    });
    
    let averageConfidence = if (totalInsights > 0) {
      let totalConfidence = Array.foldLeft<AIInsight, Float>(insights, 0.0, func(acc, insight) {
        acc + insight.confidence;
      });
      totalConfidence / Float.fromInt(totalInsights);
    } else {
      0.0;
    };
    
    return #ok({
      totalMessages = totalMessages;
      totalInsights = totalInsights;
      totalRecommendations = totalRecommendations;
      implementedRecommendations = implementedRecommendations;
      averageConfidence = averageConfidence;
    });
  };
  
  // Helper function to generate AI response (simplified)
  private func generateAIResponse(userMessage: Text, userId: UserId): Text {
    // Simple response generation based on keywords
    // In production, this would integrate with a real AI service
    if (Text.contains(userMessage, #text("balance")) or Text.contains(userMessage, #text("money"))) {
      "I can help you check your account balance and analyze your spending patterns. Would you like me to show you your recent transactions?";
    } else if (Text.contains(userMessage, #text("save")) or Text.contains(userMessage, #text("budget"))) {
      "I can help you create a budget and set savings goals. Based on your spending history, I can suggest ways to save more money.";
    } else if (Text.contains(userMessage, #text("invest")) or Text.contains(userMessage, #text("crypto"))) {
      "I can help you with investment strategies and crypto trading. Would you like me to show you your current portfolio performance?";
    } else if (Text.contains(userMessage, #text("game")) or Text.contains(userMessage, #text("play"))) {
      "I can help you find social games and challenges. There are several active games you can join to earn rewards!";
    } else if (Text.contains(userMessage, #text("vault")) or Text.contains(userMessage, #text("group"))) {
      "I can help you manage your group vaults. Would you like to see your vault balances or create a new group savings goal?";
    } else {
      "Hello! I'm your AI financial assistant. I can help you with budgeting, investing, crypto trading, social games, and group savings. What would you like to know?";
    };
  };
  
  // Helper function to generate user insights
  private func generateUserInsights(userId: UserId): [AIInsight] {
    // Generate insights based on user data
    // In production, this would analyze actual user data
    let insights: [AIInsight] = [
      {
        id = "";
        userId = userId;
        type_ = "spending";
        title = "High Entertainment Spending";
        description = "You've spent 30% more on entertainment this month compared to last month.";
        confidence = 0.85;
        actionable = true;
        createdAt = 0;
        metadata = null;
      },
      {
        id = "";
        userId = userId;
        type_ = "saving";
        title = "Good Savings Rate";
        description = "You're saving 15% of your income, which is above the recommended 10%.";
        confidence = 0.92;
        actionable = false;
        createdAt = 0;
        metadata = null;
      },
      {
        id = "";
        userId = userId;
        type_ = "investment";
        title = "Diversification Opportunity";
        description = "Your portfolio is heavily weighted in crypto. Consider diversifying with traditional investments.";
        confidence = 0.78;
        actionable = true;
        createdAt = 0;
        metadata = null;
      }
    ];
    
    insights;
  };
  
  // Helper function to generate user recommendations
  private func generateUserRecommendations(userId: UserId): [AIRecommendation] {
    // Generate recommendations based on user data
    // In production, this would analyze actual user data
    let recommendations: [AIRecommendation] = [
      {
        id = "";
        userId = userId;
        category = "budget";
        title = "Set Up Emergency Fund";
        description = "Create an emergency fund with 3-6 months of expenses.";
        priority = "high";
        estimatedImpact = 0.9;
        isImplemented = false;
        createdAt = 0;
        metadata = null;
      },
      {
        id = "";
        userId = userId;
        category = "investment";
        title = "Diversify Portfolio";
        description = "Add traditional investments to balance your crypto holdings.";
        priority = "medium";
        estimatedImpact = 0.7;
        isImplemented = false;
        createdAt = 0;
        metadata = null;
      },
      {
        id = "";
        userId = userId;
        category = "saving";
        title = "Automate Savings";
        description = "Set up automatic transfers to your savings account.";
        priority = "medium";
        estimatedImpact = 0.8;
        isImplemented = false;
        createdAt = 0;
        metadata = null;
      }
    ];
    
    recommendations;
  };

  // ============ LOCAL PAYMENTS MANAGEMENT ============
  
  // Add a payment method
  public shared(msg) func addPaymentMethod(
    provider: Text,
    accountNumber: ?Text,
    phoneNumber: ?Text,
    accountName: Text,
    isDefault: Bool
  ): async Result.Result<PaymentMethod, Text> {
    let caller = msg.caller;
    
    // Check if user exists
    switch (users.get(caller)) {
      case null { return #err("User not found"); };
      case (?user) {
        let methodId = generateId("payment_method", nextPaymentMethodId);
        nextPaymentMethodId += 1;
        
        let now = getCurrentTime();
        let providerEnum = textToPaymentProvider(provider);
        
        // If this is set as default, unset other default methods
        if (isDefault) {
          let userMethods = Option.get(userPaymentMethods.get(caller), []);
          let userMethodsArray = Array.mapFilter<Text, PaymentMethod>(userMethods, func(id) {
            paymentMethods.get(id);
          });
          
          for (method in userMethodsArray.vals()) {
            if (method.isDefault) {
              let updatedMethod: PaymentMethod = {
                id = method.id;
                userId = method.userId;
                provider = method.provider;
                accountNumber = method.accountNumber;
                phoneNumber = method.phoneNumber;
                accountName = method.accountName;
                isDefault = false;
                isActive = method.isActive;
                createdAt = method.createdAt;
                metadata = method.metadata;
              };
              paymentMethods.put(method.id, updatedMethod);
            };
          };
        };
        
        let newPaymentMethod: PaymentMethod = {
          id = methodId;
          userId = caller;
          provider = providerEnum;
          accountNumber = accountNumber;
          phoneNumber = phoneNumber;
          accountName = accountName;
          isDefault = isDefault;
          isActive = true;
          createdAt = now;
          metadata = null;
        };
        
        paymentMethods.put(methodId, newPaymentMethod);
        
        // Update user payment methods index
        let currentUserMethods = Option.get(userPaymentMethods.get(caller), []);
        userPaymentMethods.put(caller, Array.append(currentUserMethods, [methodId]));
        
        await logAuditEvent(?caller, "PAYMENT_METHOD_ADDED", "Added payment method: " # provider, true);
        return #ok(newPaymentMethod);
      };
    };
  };
  
  // Get user's payment methods
  public shared(msg) func getUserPaymentMethods(): async Result.Result<[PaymentMethod], Text> {
    let caller = msg.caller;
    
    switch (userPaymentMethods.get(caller)) {
      case null { #ok([]) };
      case (?methodIds) {
        let methodsArray = Array.mapFilter<Text, PaymentMethod>(methodIds, func(id) {
          paymentMethods.get(id);
        });
        #ok(methodsArray);
      };
    };
  };
  
  // Update payment method
  public shared(msg) func updatePaymentMethod(
    methodId: Text,
    accountNumber: ?Text,
    phoneNumber: ?Text,
    accountName: Text,
    isDefault: Bool
  ): async Result.Result<PaymentMethod, Text> {
    let caller = msg.caller;
    
    switch (paymentMethods.get(methodId)) {
      case null { return #err("Payment method not found"); };
      case (?method) {
        if (method.userId != caller) {
          return #err("Not authorized to update this payment method");
        };
        
        // If this is set as default, unset other default methods
        if (isDefault) {
          let userMethods = Option.get(userPaymentMethods.get(caller), []);
          let userMethodsArray = Array.mapFilter<Text, PaymentMethod>(userMethods, func(id) {
            paymentMethods.get(id);
          });
          
          for (userMethod in userMethodsArray.vals()) {
            if (userMethod.isDefault and userMethod.id != methodId) {
              let updatedMethod: PaymentMethod = {
                id = userMethod.id;
                userId = userMethod.userId;
                provider = userMethod.provider;
                accountNumber = userMethod.accountNumber;
                phoneNumber = userMethod.phoneNumber;
                accountName = userMethod.accountName;
                isDefault = false;
                isActive = userMethod.isActive;
                createdAt = userMethod.createdAt;
                metadata = userMethod.metadata;
              };
              paymentMethods.put(userMethod.id, updatedMethod);
            };
          };
        };
        
        let updatedMethod: PaymentMethod = {
          id = method.id;
          userId = method.userId;
          provider = method.provider;
          accountNumber = accountNumber;
          phoneNumber = phoneNumber;
          accountName = accountName;
          isDefault = isDefault;
          isActive = method.isActive;
          createdAt = method.createdAt;
          metadata = method.metadata;
        };
        
        paymentMethods.put(methodId, updatedMethod);
        
        await logAuditEvent(?caller, "PAYMENT_METHOD_UPDATED", "Updated payment method", true);
        return #ok(updatedMethod);
      };
    };
  };
  
  // Remove payment method
  public shared(msg) func removePaymentMethod(methodId: Text): async Result.Result<Bool, Text> {
    let caller = msg.caller;
    
    switch (paymentMethods.get(methodId)) {
      case null { return #err("Payment method not found"); };
      case (?method) {
        if (method.userId != caller) {
          return #err("Not authorized to remove this payment method");
        };
        
        // Remove payment method
        paymentMethods.delete(methodId);
        
        // Update user payment methods index
        let currentUserMethods = Option.get(userPaymentMethods.get(caller), []);
        let updatedUserMethods = Array.filter<Text>(currentUserMethods, func(id) {
          id != methodId;
        });
        userPaymentMethods.put(caller, updatedUserMethods);
        
        await logAuditEvent(?caller, "PAYMENT_METHOD_REMOVED", "Removed payment method", true);
        return #ok(true);
      };
    };
  };
  
  // Initiate a local payment
  public shared(msg) func initiateLocalPayment(
    provider: Text,
    type_: Text,
    amount: Float,
    currency: Text,
    recipientPhone: ?Text,
    recipientName: ?Text,
    reference: ?Text
  ): async Result.Result<LocalPayment, Text> {
    let caller = msg.caller;
    
    // Check if user exists
    switch (users.get(caller)) {
      case null { return #err("User not found"); };
      case (?user) {
        let paymentId = generateId("local_payment", nextLocalPaymentId);
        nextLocalPaymentId += 1;
        
        let now = getCurrentTime();
        let providerEnum = textToPaymentProvider(provider);
        
        // Calculate fee based on provider and amount
        let fee = calculatePaymentFee(providerEnum, amount);
        
        let newPayment: LocalPayment = {
          id = paymentId;
          userId = caller;
          provider = providerEnum;
          type_ = type_;
          amount = amount;
          currency = currency;
          recipientPhone = recipientPhone;
          recipientName = recipientName;
          reference = reference;
          status = #Pending;
          fee = fee;
          timestamp = now;
          completedAt = null;
          metadata = null;
        };
        
        localPayments.put(paymentId, newPayment);
        
        // Update indexes
        let currentUserPayments = Option.get(userLocalPayments.get(caller), []);
        userLocalPayments.put(caller, Array.append(currentUserPayments, [paymentId]));
        
        let providerKey = paymentProviderToText(providerEnum);
        let currentProviderPayments = Option.get(providerPaymentIndex.get(providerKey), []);
        providerPaymentIndex.put(providerKey, Array.append(currentProviderPayments, [paymentId]));
        
        await logAuditEvent(?caller, "LOCAL_PAYMENT_INITIATED", "Initiated payment: " # Float.toText(amount) # " " # currency, true);
        return #ok(newPayment);
      };
    };
  };
  
  // Process a payment (simulate payment processing)
  public shared(msg) func processPayment(paymentId: Text): async Result.Result<LocalPayment, Text> {
    let caller = msg.caller;
    
    switch (localPayments.get(paymentId)) {
      case null { return #err("Payment not found"); };
      case (?payment) {
        if (payment.userId != caller) {
          return #err("Not authorized to process this payment");
        };
        
        if (payment.status != #Pending) {
          return #err("Payment is not in pending status");
        };
        
        let now = getCurrentTime();
        
        // Simulate payment processing (in production, integrate with actual payment providers)
        let success = simulateLocalPaymentProcessing(payment);
        
        let updatedPayment: LocalPayment = {
          id = payment.id;
          userId = payment.userId;
          provider = payment.provider;
          type_ = payment.type_;
          amount = payment.amount;
          currency = payment.currency;
          recipientPhone = payment.recipientPhone;
          recipientName = payment.recipientName;
          reference = payment.reference;
          status = if (success) { #Completed } else { #Failed };
          fee = payment.fee;
          timestamp = payment.timestamp;
          completedAt = if (success) { ?now } else { null };
          metadata = payment.metadata;
        };
        
        localPayments.put(paymentId, updatedPayment);
        
        let statusText = if (success) { "completed" } else { "failed" };
        await logAuditEvent(?caller, "LOCAL_PAYMENT_PROCESSED", "Payment " # statusText, true);
        return #ok(updatedPayment);
      };
    };
  };
  
  // Get user's local payment history
  public shared(msg) func getUserLocalPaymentHistory(): async Result.Result<[LocalPayment], Text> {
    let caller = msg.caller;
    
    switch (userLocalPayments.get(caller)) {
      case null { #ok([]) };
      case (?paymentIds) {
        let paymentsArray = Array.mapFilter<Text, LocalPayment>(paymentIds, func(id) {
          localPayments.get(id);
        });
        
        // Sort by timestamp (newest first)
        let sortedPayments = Array.sort<LocalPayment>(paymentsArray, func(a, b) {
          if (a.timestamp > b.timestamp) #greater
          else if (a.timestamp < b.timestamp) #less
          else #equal
        });
        
        #ok(sortedPayments);
      };
    };
  };
  
  // Get payments by provider
  public shared(msg) func getPaymentsByProvider(provider: Text): async Result.Result<[LocalPayment], Text> {
    let caller = msg.caller;
    
    let providerEnum = textToPaymentProvider(provider);
    let providerKey = paymentProviderToText(providerEnum);
    
    switch (providerPaymentIndex.get(providerKey)) {
      case null { #ok([]) };
      case (?paymentIds) {
        let paymentsArray = Array.mapFilter<Text, LocalPayment>(paymentIds, func(id) {
          localPayments.get(id);
        });
        
        // Filter to only user's payments
        let userPayments = Array.filter<LocalPayment>(paymentsArray, func(payment) {
          payment.userId == caller;
        });
        
        #ok(userPayments);
      };
    };
  };
  
  // Get payment statistics
  public shared(msg) func getPaymentStats(): async Result.Result<{
    totalPayments: Nat;
    totalAmount: Float;
    totalFees: Float;
    successRate: Float;
    topProvider: ?Text;
  }, Text> {
    let caller = msg.caller;
    
    let userPayments = Option.get(userLocalPayments.get(caller), []);
    let payments = Array.mapFilter<Text, LocalPayment>(userPayments, func(id) {
      localPayments.get(id);
    });
    
    let totalPayments = payments.size();
    let totalAmount = Array.foldLeft<LocalPayment, Float>(payments, 0.0, func(acc, payment) {
      acc + payment.amount;
    });
    
    let totalFees = Array.foldLeft<LocalPayment, Float>(payments, 0.0, func(acc, payment) {
      acc + payment.fee;
    });
    
    let successfulPayments = Array.filter<LocalPayment>(payments, func(payment) {
      payment.status == #Completed;
    }).size();
    
    let successRate = if (totalPayments > 0) {
      Float.fromInt(successfulPayments) / Float.fromInt(totalPayments) * 100.0;
    } else {
      0.0;
    };
    
    // Find top provider
    let providerCounts = HashMap.HashMap<Text, Nat>(10, Text.equal, Text.hash);
    for (payment in payments.vals()) {
      let providerKey = paymentProviderToText(payment.provider);
      let currentCount = Option.get(providerCounts.get(providerKey), 0);
      providerCounts.put(providerKey, currentCount + 1);
    };
    
    let topProvider = Array.find<(Text, Nat)>(
      providerCounts.entries() |> Iter.toArray(_),
      func((provider, count)) { true }
    );
    
    return #ok({
      totalPayments = totalPayments;
      totalAmount = totalAmount;
      totalFees = totalFees;
      successRate = successRate;
      topProvider = switch (topProvider) {
        case (?top) { ?top.0 };
        case null { null };
      };
    });
  };
  
  // Cancel a payment
  public shared(msg) func cancelPayment(paymentId: Text): async Result.Result<LocalPayment, Text> {
    let caller = msg.caller;
    
    switch (localPayments.get(paymentId)) {
      case null { return #err("Payment not found"); };
      case (?payment) {
        if (payment.userId != caller) {
          return #err("Not authorized to cancel this payment");
        };
        
        if (payment.status != #Pending) {
          return #err("Payment cannot be cancelled");
        };
        
        let updatedPayment: LocalPayment = {
          id = payment.id;
          userId = payment.userId;
          provider = payment.provider;
          type_ = payment.type_;
          amount = payment.amount;
          currency = payment.currency;
          recipientPhone = payment.recipientPhone;
          recipientName = payment.recipientName;
          reference = payment.reference;
          status = #Cancelled;
          fee = payment.fee;
          timestamp = payment.timestamp;
          completedAt = null;
          metadata = payment.metadata;
        };
        
        localPayments.put(paymentId, updatedPayment);
        
        await logAuditEvent(?caller, "LOCAL_PAYMENT_CANCELLED", "Cancelled payment", true);
        return #ok(updatedPayment);
      };
    };
  };
  
  // Helper function to calculate payment fee
  private func calculatePaymentFee(provider: PaymentProvider, amount: Float): Float {
    switch (provider) {
      case (#Mpesa) {
        if (amount <= 100.0) { 0.0 }
        else if (amount <= 1000.0) { 10.0 }
        else if (amount <= 10000.0) { 25.0 }
        else { 50.0 };
      };
      case (#AirtelMoney) {
        if (amount <= 100.0) { 0.0 }
        else if (amount <= 1000.0) { 15.0 }
        else if (amount <= 10000.0) { 30.0 }
        else { 60.0 };
      };
      case (#Equitel) {
        if (amount <= 100.0) { 0.0 }
        else if (amount <= 1000.0) { 12.0 }
        else if (amount <= 10000.0) { 28.0 }
        else { 55.0 };
      };
      case (#BankTransfer) {
        amount * 0.01; // 1% fee
      };
      case (#Card) {
        amount * 0.025; // 2.5% fee
      };
      case (#PayPal) {
        amount * 0.029 + 0.30; // 2.9% + $0.30
      };
      case (#Custom) {
        0.0;
      };
    };
  };
  
  // Helper function to simulate local payment processing
  private func simulateLocalPaymentProcessing(payment: LocalPayment): Bool {
    // Simulate payment processing with 95% success rate
    // In production, this would integrate with actual payment providers
    let randomValue = Int.abs(Time.now()) % 100;
    randomValue < 95; // 95% success rate
  };

  // ============ NISTO TOKEN TYPES ============
  public type TokenTransfer = {
    id: Text;
    from: UserId;
    to: UserId;
    amount: Nat;
    timestamp: Int;
    transactionHash: Text;
    blockNumber: Nat;
  };
  public type TokenMint = {
    id: Text;
    to: UserId;
    amount: Nat;
    reason: Text;
    timestamp: Int;
    blockNumber: Nat;
  };
  public type TokenBurn = {
    id: Text;
    from: UserId;
    amount: Nat;
    reason: Text;
    timestamp: Int;
    blockNumber: Nat;
  };
  public type TokenBalance = {
    owner: UserId;
    balance: Nat;
    lockedBalance: Nat;
    stakedBalance: Nat;
    lastUpdated: Int;
  };
  public type TokenAllowance = {
    owner: UserId;
    spender: UserId;
    amount: Nat;
    lastUpdated: Int;
  };
  public type TokenMetadata = {
    name: Text;
    symbol: Text;
    decimals: Nat8;
    totalSupply: Nat;
    circulatingSupply: Nat;
    treasuryAddress: UserId;
    burnAddress: UserId;
    isPaused: Bool;
    maxTransactionLimit: Nat;
    maxWalletLimit: Nat;
    createdAt: Int;
    updatedAt: Int;
  };
  public type StakingInfo = {
    userId: UserId;
    stakedAmount: Nat;
    stakingStartTime: Int;
    lastRewardTime: Int;
    totalRewardsEarned: Nat;
    isStaking: Bool;
  };
  public type GovernanceVote = {
    proposalId: Text;
    userId: UserId;
    vote: Bool;
    votingPower: Nat;
    timestamp: Int;
  };

  // ============ NISTO TOKEN STATE ============
  private transient var tokenName: Text = "Nisto Token";
  private transient var tokenSymbol: Text = "NST";
  private transient var tokenDecimals: Nat8 = 8;
  private transient var totalSupply: Nat = 1_000_000_000_000_000;
  private transient var circulatingSupply: Nat = 0;
  private transient var treasuryAddress: UserId = Principal.fromText("2vxsx-fae");
  private transient var burnAddress: UserId = Principal.fromText("2vxsx-fae");
  private transient var isPaused: Bool = false;
  private transient var maxTransactionLimit: Nat = 10_000_000_000_000;
  private transient var maxWalletLimit: Nat = 100_000_000_000_000;
  private transient var tokenBalances = HashMap.HashMap<UserId, Nat>(0, Principal.equal, Principal.hash);
  private transient var tokenAllowances = HashMap.HashMap<Text, Nat>(0, Text.equal, Text.hash);
  private transient var lockedBalances = HashMap.HashMap<UserId, Nat>(0, Principal.equal, Principal.hash);
  private transient var stakedBalances = HashMap.HashMap<UserId, Nat>(0, Principal.equal, Principal.hash);
  private transient var tokenTransfers = Buffer.Buffer<TokenTransfer>(0);
  private transient var tokenMints = Buffer.Buffer<TokenMint>(0);
  private transient var tokenBurns = Buffer.Buffer<TokenBurn>(0);
  private transient var stakingInfo = HashMap.HashMap<UserId, StakingInfo>(0, Principal.equal, Principal.hash);
  private transient var stakingRewardRate: Float = 0.05;
  private transient var totalStaked: Nat = 0;
  private transient var governanceVotes = HashMap.HashMap<Text, [GovernanceVote]>(0, Text.equal, Text.hash);
  private transient var minVotingPower: Nat = 1_000_000_000;
  private transient var currentBlockNumber: Nat = 0;

  // ============ NISTO TOKEN HELPER FUNCTIONS ============
  private func generateTokenId(prefix: Text, counter: Nat): Text {
    Text.concat(prefix, Text.concat("_", Nat.toText(counter)));
  };
  private func getCurrentBlock(): Nat {
    currentBlockNumber;
  };
  private func incrementBlock(): Nat {
    currentBlockNumber += 1;
    currentBlockNumber;
  };
  private func generateTransactionHash(from: UserId, to: UserId, amount: Nat, timestamp: Int): Text {
    let fromText = Principal.toText(from);
    let toText = Principal.toText(to);
    let amountText = Nat.toText(amount);
    let timestampText = Int.toText(timestamp);
    let blockText = Nat.toText(getCurrentBlock());
    Text.concat(fromText, Text.concat("_", Text.concat(toText, Text.concat("_", Text.concat(amountText, Text.concat("_", Text.concat(timestampText, Text.concat("_", blockText))))))));
  };
  private func getAllowanceKey(owner: UserId, spender: UserId): Text {
    Text.concat(Principal.toText(owner), Text.concat("_", Principal.toText(spender)));
  };
  private func calculateStakingRewards(userId: UserId): Nat {
    switch (stakingInfo.get(userId)) {
      case null { 0 };
      case (?info) {
        if (not info.isStaking) { 
          0 
        } else {
          let currentTime = Time.now();
          let timeStaked = currentTime - info.lastRewardTime;
          // TODO: Implement proper staking rewards calculation
          0;
        };
      };
    };
  };

  // ============ NISTO TOKEN PUBLIC FUNCTIONS ============
  public query func getTokenMetadata(): async TokenMetadata {
    {
      name = tokenName;
      symbol = tokenSymbol;
      decimals = tokenDecimals;
      totalSupply = totalSupply;
      circulatingSupply = circulatingSupply;
      treasuryAddress = treasuryAddress;
      burnAddress = burnAddress;
      isPaused = isPaused;
      maxTransactionLimit = maxTransactionLimit;
      maxWalletLimit = maxWalletLimit;
      createdAt = Time.now();
          updatedAt = Time.now();
    }
  };
  public query func balanceOf(owner: UserId): async Nat {
    Option.get(tokenBalances.get(owner), 0)
  };
  public query func getTotalBalance(owner: UserId): async TokenBalance {
    let balance = Option.get(tokenBalances.get(owner), 0);
    let locked = Option.get(lockedBalances.get(owner), 0);
    let staked = Option.get(stakedBalances.get(owner), 0);
    {
      owner = owner;
      balance = balance;
      lockedBalance = locked;
      stakedBalance = staked;
      lastUpdated = Time.now();
    }
  };
  public query func allowance(owner: UserId, spender: UserId): async Nat {
    let key = getAllowanceKey(owner, spender);
    Option.get(tokenAllowances.get(key), 0)
  };
  public shared(msg) func transfer(to: UserId, amount: Nat): async Result.Result<Bool, Text> {
    let caller = msg.caller;
    if (isPaused) {
      return #err("Token transfers are currently paused");
    };
    if (amount == 0) {
      return #err("Transfer amount must be greater than 0");
    };
    if (amount > maxTransactionLimit) {
      return #err("Transfer amount exceeds maximum transaction limit");
    };
    let callerBalance = Option.get(tokenBalances.get(caller), 0);
    if (callerBalance < amount) {
      return #err("Insufficient balance");
    };
    let toBalance = Option.get(tokenBalances.get(to), 0);
    if (toBalance + amount > maxWalletLimit) {
      return #err("Recipient would exceed maximum wallet limit");
    };
    // Update balances
    tokenBalances.put(caller, callerBalance - amount);
    tokenBalances.put(to, toBalance + amount);
    // Record transfer
    let blockNumber = incrementBlock();
    let timestamp = Time.now();
    let transactionHash = generateTransactionHash(caller, to, amount, timestamp);
    let transfer: TokenTransfer = {
      id = generateTokenId("transfer", tokenTransfers.size());
      from = caller;
      to = to;
      amount = amount;
      timestamp = timestamp;
      transactionHash = transactionHash;
      blockNumber = blockNumber;
    };
    tokenTransfers.add(transfer);
  #ok(true)
};
  public shared(msg) func approve(spender: UserId, amount: Nat): async Result.Result<Bool, Text> {
    let caller = msg.caller;
    let key = getAllowanceKey(caller, spender);
    tokenAllowances.put(key, amount);
    #ok(true)
  };
  public shared(msg) func transferFrom(from: UserId, to: UserId, amount: Nat): async Result.Result<Bool, Text> {
    let caller = msg.caller;
    if (isPaused) {
      return #err("Token transfers are currently paused");
    };
    let key = getAllowanceKey(from, caller);
    let allowance = Option.get(tokenAllowances.get(key), 0);
    if (allowance < amount) {
      return #err("Insufficient allowance");
    };
    let fromBalance = Option.get(tokenBalances.get(from), 0);
    if (fromBalance < amount) {
      return #err("Insufficient balance");
    };
    // Update balances and allowance
    tokenBalances.put(from, fromBalance - amount);
    let toBalance = Option.get(tokenBalances.get(to), 0);
    tokenBalances.put(to, toBalance + amount);
    tokenAllowances.put(key, allowance - amount);
    // Record transfer
    let blockNumber = incrementBlock();
    let timestamp = Time.now();
    let transactionHash = generateTransactionHash(from, to, amount, timestamp);
    let transfer: TokenTransfer = {
      id = generateTokenId("transfer", tokenTransfers.size());
      from = from;
      to = to;
      amount = amount;
      timestamp = timestamp;
      transactionHash = transactionHash;
      blockNumber = blockNumber;
    };
    tokenTransfers.add(transfer);
    #ok(true)
  };
  public shared(msg) func mint(to: UserId, amount: Nat, reason: Text): async Result.Result<Bool, Text> {
    let caller = msg.caller;
    // Only treasury or authorized addresses can mint
    if (caller != treasuryAddress) {
      return #err("Only treasury can mint tokens");
    };
    if (amount == 0) {
      return #err("Mint amount must be greater than 0");
    };
    if (circulatingSupply + amount > totalSupply) {
      return #err("Mint would exceed total supply");
    };
    let toBalance = Option.get(tokenBalances.get(to), 0);
    tokenBalances.put(to, toBalance + amount);
    circulatingSupply += amount;
    // Record mint
    let blockNumber = incrementBlock();
    let timestamp = Time.now();
    let mint: TokenMint = {
      id = generateTokenId("mint", tokenMints.size());
      to = to;
      amount = amount;
      reason = reason;
      timestamp = timestamp;
      blockNumber = blockNumber;
    };
    tokenMints.add(mint);
    #ok(true)
  };
  public shared(msg) func burn(amount: Nat, reason: Text): async Result.Result<Bool, Text> {
    let caller = msg.caller;
    if (amount == 0) {
      return #err("Burn amount must be greater than 0");
    };
    let callerBalance = Option.get(tokenBalances.get(caller), 0);
    if (callerBalance < amount) {
      return #err("Insufficient balance to burn");
    };
    tokenBalances.put(caller, callerBalance - amount);
    circulatingSupply -= amount;
    // Record burn
    let blockNumber = incrementBlock();
    let timestamp = Time.now();
    let burn: TokenBurn = {
      id = generateTokenId("burn", tokenBurns.size());
      from = caller;
      amount = amount;
      reason = reason;
      timestamp = timestamp;
      blockNumber = blockNumber;
    };
    tokenBurns.add(burn);
    #ok(true)
  };
  public shared(msg) func stake(amount: Nat): async Result.Result<Bool, Text> {
    let caller = msg.caller;
    if (amount == 0) {
      return #err("Stake amount must be greater than 0");
    };
    let callerBalance = Option.get(tokenBalances.get(caller), 0);
    if (callerBalance < amount) {
      return #err("Insufficient balance to stake");
    };
    // Calculate and distribute existing rewards
    let existingRewards = calculateStakingRewards(caller);
    if (existingRewards > 0) {
      tokenBalances.put(caller, callerBalance + existingRewards);
      circulatingSupply += existingRewards;
    };
    // Update staking info
    let currentTime = Time.now();
    let currentStaked = Option.get(stakedBalances.get(caller), 0);
    let newStakedAmount = currentStaked + amount;
    stakedBalances.put(caller, newStakedAmount);
    tokenBalances.put(caller, callerBalance - amount);
    let newStakingInfo: StakingInfo = {
      userId = caller;
      stakedAmount = newStakedAmount;
      stakingStartTime = currentTime;
      lastRewardTime = currentTime;
      totalRewardsEarned = existingRewards;
      isStaking = true;
    };
    stakingInfo.put(caller, newStakingInfo);
    totalStaked += amount;
    #ok(true)
  };
  public shared(msg) func unstake(amount: Nat): async Result.Result<Bool, Text> {
    let caller = msg.caller;
    if (amount == 0) {
      return #err("Unstake amount must be greater than 0");
    };
    switch (stakingInfo.get(caller)) {
      case null { return #err("No staking found for user"); };
      case (?info) {
        if (not info.isStaking) {
          return #err("User is not currently staking");
        };
        if (info.stakedAmount < amount) {
          return #err("Insufficient staked amount");
        };
        // Calculate and distribute rewards
        let rewards = calculateStakingRewards(caller);
        let callerBalance = Option.get(tokenBalances.get(caller), 0);
        let newBalance = callerBalance + amount;
        tokenBalances.put(caller, newBalance + rewards);
        circulatingSupply += rewards;
        let newStakedAmount = if (info.stakedAmount >= amount) info.stakedAmount - amount else 0;
        let currentTime = Time.now();
        stakedBalances.put(caller, newStakedAmount);
        totalStaked := if (totalStaked >= amount) totalStaked - amount else 0;
        let updatedInfo: StakingInfo = {
          userId = caller;
          stakedAmount = newStakedAmount;
          stakingStartTime = info.stakingStartTime;
          lastRewardTime = currentTime;
          totalRewardsEarned = info.totalRewardsEarned + rewards;
          isStaking = newStakedAmount > 0;
        };
        stakingInfo.put(caller, updatedInfo);
        #ok(true);
      };
    };
  };
  public shared(msg) func claimRewards(): async Result.Result<Nat, Text> {
    let caller = msg.caller;
    let rewards = calculateStakingRewards(caller);
    if (rewards == 0) {
      return #err("No rewards to claim");
    };
    let callerBalance = Option.get(tokenBalances.get(caller), 0);
    tokenBalances.put(caller, callerBalance + rewards);
    circulatingSupply += rewards;
    // Update last reward time
    switch (stakingInfo.get(caller)) {
      case null { return #err("No staking found for user"); };
      case (?info) {
        let updatedInfo: StakingInfo = {
          userId = caller;
          stakedAmount = info.stakedAmount;
          stakingStartTime = info.stakingStartTime;
          lastRewardTime = Time.now();
          totalRewardsEarned = info.totalRewardsEarned + rewards;
          isStaking = info.isStaking;
        };
        stakingInfo.put(caller, updatedInfo);
      };
    };
    #ok(rewards)
  };
  public query func getStakingInfo(userId: UserId): async ?StakingInfo {
    stakingInfo.get(userId);
  };
  public query func getTotalStaked(): async Nat {
    totalStaked;
  };
  public query func getTransferHistory(limit: Nat, offset: Nat): async [TokenTransfer] {
    let size = tokenTransfers.size();
    let start = if (offset < size) offset else size;
    let end = if (start + limit < size) start + limit else size;
    let result = Buffer.Buffer<TokenTransfer>(0);
    var i = start;
    while (i < end) {
      result.add(tokenTransfers.get(i));
      i += 1;
    };
    Buffer.toArray(result)
  };
  public query func getMintHistory(limit: Nat, offset: Nat): async [TokenMint] {
    let size = tokenMints.size();
    let start = if (offset < size) offset else size;
    let end = if (start + limit < size) start + limit else size;
    let result = Buffer.Buffer<TokenMint>(0);
    var i = start;
    while (i < end) {
      result.add(tokenMints.get(i));
      i += 1;
    };
    Buffer.toArray(result)
  };
  public query func getBurnHistory(limit: Nat, offset: Nat): async [TokenBurn] {
    let size = tokenBurns.size();
    let start = if (offset < size) offset else size;
    let end = if (start + limit < size) start + limit else size;
    let result = Buffer.Buffer<TokenBurn>(0);
    var i = start;
    while (i < end) {
      result.add(tokenBurns.get(i));
      i += 1;
    };
    Buffer.toArray(result)
  };
  public shared(msg) func setTreasuryAddress(newTreasury: UserId): async Result.Result<Bool, Text> {
    let caller = msg.caller;
    if (caller != treasuryAddress) {
      return #err("Only current treasury can change treasury address");
    };
    treasuryAddress := newTreasury;
    #ok(true)
  };
  public shared(msg) func setPaused(paused: Bool): async Result.Result<Bool, Text> {
    let caller = msg.caller;
    if (caller != treasuryAddress) {
      return #err("Only treasury can pause/unpause transfers");
    };
    isPaused := paused;
    #ok(true)
  };
  public shared(msg) func setTransactionLimits(maxTransaction: Nat, maxWallet: Nat): async Result.Result<Bool, Text> {
    let caller = msg.caller;
    if (caller != treasuryAddress) {
      return #err("Only treasury can set transaction limits");
    };
    maxTransactionLimit := maxTransaction;
    maxWalletLimit := maxWallet;
    #ok(true)
  };
  public shared(msg) func setStakingRewardRate(rate: Float): async Result.Result<Bool, Text> {
    let caller = msg.caller;
    if (caller != treasuryAddress) {
      return #err("Only treasury can set staking reward rate");
    };
    if (rate < 0.0 or rate > 1.0) {
      return #err("Reward rate must be between 0 and 1");
    };
    stakingRewardRate := rate;
    #ok(true)
  };

  // ===== SIMPLE PAYMENT PROCESSING =====
  
  public type SimplePayment = {
    id: Text;
    userId: UserId;
    paymentType: Text; // "paybill" | "buygoods"
    localAmount: Float;
    localCurrency: Text;
    usdAmount: Float;
    exchangeRate: Float;
    status: Text; // "pending" | "processing" | "completed" | "failed"
    location: ?Text;
    createdAt: Int;
    updatedAt: Int;
  };

  private stable var simplePayments: [(Text, SimplePayment)] = [];
  private transient var simplePaymentsMap = HashMap.HashMap<Text, SimplePayment>(0, Text.equal, Text.hash);
  private var nextSimplePaymentId: Nat = 1;

  // Process simple payment
  public shared(msg) func processSimplePayment(
    paymentType: Text,
    localAmount: Float,
    localCurrency: Text,
    usdAmount: Float,
    exchangeRate: Float,
    location: ?Text
  ): async Result.Result<SimplePayment, Text> {
    let caller = msg.caller;
    
    // Validate input
    if (localAmount <= 0) {
      return #err("Amount must be greater than 0");
    };
    
    if (usdAmount <= 0) {
      return #err("USD amount must be greater than 0");
    };
    
    if (exchangeRate <= 0) {
      return #err("Exchange rate must be greater than 0");
    };
    
    let paymentId = generateId("payment", nextSimplePaymentId);
    nextSimplePaymentId += 1;
    
    let now = getCurrentTime();
    
    let payment: SimplePayment = {
      id = paymentId;
      userId = caller;
      paymentType = paymentType;
      localAmount = localAmount;
      localCurrency = localCurrency;
      usdAmount = usdAmount;
      exchangeRate = exchangeRate;
      status = "processing";
      location = location;
      createdAt = now;
      updatedAt = now;
    };
    
    simplePaymentsMap.put(paymentId, payment);
    
    // Simulate payment processing
    // In production, this would integrate with actual payment providers
    let processingResult = await simulateSimplePaymentProcessing(payment);
    
    let updatedPayment: SimplePayment = {
      id = payment.id;
      userId = payment.userId;
      paymentType = payment.paymentType;
      localAmount = payment.localAmount;
      localCurrency = payment.localCurrency;
      usdAmount = payment.usdAmount;
      exchangeRate = payment.exchangeRate;
      status = if (processingResult) { "completed" } else { "failed" };
      location = payment.location;
      createdAt = payment.createdAt;
      updatedAt = getCurrentTime();
    };
    
    simplePaymentsMap.put(paymentId, updatedPayment);
    
    await logAuditEvent(?caller, "SIMPLE_PAYMENT_PROCESSED", "Processed simple payment", processingResult);
    
    #ok(updatedPayment);
  };

  // Get user's simple payment history
  public shared(msg) func getUserSimplePaymentHistory(): async Result.Result<[SimplePayment], Text> {
    let caller = msg.caller;
    
    let userPayments = Array.filter<SimplePayment>(
      Array.map<(Text, SimplePayment), SimplePayment>(simplePayments, func(pair) { pair.1 }),
      func(payment) { payment.userId == caller }
    );
    
    #ok(Array.reverse(userPayments)); // Most recent first
  };

  // Get payment by ID
  public shared(msg) func getPaymentById(paymentId: Text): async Result.Result<SimplePayment, Text> {
    let caller = msg.caller;
    
    switch (simplePaymentsMap.get(paymentId)) {
      case null { #err("Payment not found") };
      case (?payment) {
        if (payment.userId != caller) {
          return #err("Not authorized to access this payment");
        };
        #ok(payment);
      };
    };
  };

  // Simulate simple payment processing
  private func simulateSimplePaymentProcessing(payment: SimplePayment): async Bool {
    // Simulate 95% success rate
    let randomValue = Int.abs(Time.now()) % 100;
    randomValue < 95; // 95% success rate
  };

  // ===== PAY BILLS SYSTEM =====
  
  public type PaybillBill = {
    id: Text;
    name: Text;
    description: Text;
    paybillNumber: Text;
    accountType: Text; // "Paybill" | "Till"
    status: Text; // "active" | "inactive"
    icon: Text;
    createdAt: Int;
  };
  
  public type PaybillTransaction = {
    id: Text;
    userId: UserId;
    billId: Text;
    usdtAmount: Float;
    kesAmount: Float;
    phoneNumber: Text;
    paybillNumber: Text;
    accountReference: Text;
    status: Text; // "pending" | "processing" | "completed" | "failed"
    mpesaReceipt: ?Text;
    mpesaTransactionId: ?Text;
    createdAt: Int;
    updatedAt: Int;
    completedAt: ?Int;
  };
  
  public type PaybillPaymentRequest = {
    billId: Text;
    usdtAmount: Float;
    kesAmount: Float;
    phoneNumber: Text;
    paybillNumber: Text;
    accountReference: Text;
  };

  // ===== DEPOSIT SYSTEM =====
  
  public type DepositTransaction = {
    id: Text;
    userId: UserId;
    kesAmount: Float;
    usdtAmount: Float;
    phoneNumber: Text;
    conversionRate: Float;
    status: Text; // "pending" | "processing" | "completed" | "failed"
    mpesaReceipt: ?Text;
    mpesaTransactionId: ?Text;
    createdAt: Int;
    updatedAt: Int;
    completedAt: ?Int;
  };
  
  public type DepositRequest = {
    kesAmount: Float;
    usdtAmount: Float;
    phoneNumber: Text;
    conversionRate: Float;
  };
  
  // Paybill storage
  private var nextPaybillTransactionId: Nat = 1;
  private transient var paybillTransactionsMap = HashMap.HashMap<Text, PaybillTransaction>(0, Text.equal, Text.hash);
  
  // Deposit storage
  private var nextDepositTransactionId: Nat = 1;
  private transient var depositTransactionsMap = HashMap.HashMap<Text, DepositTransaction>(0, Text.equal, Text.hash);
  
  // Available bills (in production, this would be fetched from a database)
  private transient let availableBills: [PaybillBill] = [
    {
      id = "mpesa-paybill";
      name = "Mpesa Paybill";
      description = "Pay bills using Mpesa";
      paybillNumber = "174379";
      accountType = "Paybill";
      status = "active";
      icon = "FiSmartphone";
      createdAt = getCurrentTime();
    },
    {
      id = "electricity";
      name = "Electricity Bill";
      description = "Kenya Power & Lighting Co.";
      paybillNumber = "888888";
      accountType = "Paybill";
      status = "active";
      icon = "FiCreditCard";
      createdAt = getCurrentTime();
    },
    {
      id = "water";
      name = "Water Bill";
      description = "Nairobi Water & Sewerage Co.";
      paybillNumber = "888999";
      accountType = "Paybill";
      status = "active";
      icon = "FiCreditCard";
      createdAt = getCurrentTime();
    }
  ];
  
  // Get USDT to KES conversion rate
  public shared(msg) func getUSDTtoKESRate(): async Result.Result<Float, Text> {
    let caller = msg.caller;
    
    // Call Binance API to get real USDT to KES rate
    // We'll use USDT/NGN rate and convert to KES (1 NGN ≈ 0.25 KES)
    let binanceApiKey = "l7vVjSBprwpm5immi3iMJ8T26V7i55KHQH1yDtE4JDfVfbICPIUmOfOQk5IZLLXQ";
    let binanceUrl = "https://api.binance.com/api/v3/ticker/price?symbol=USDTNGN";
    
    // For now, we'll simulate the API call since Motoko doesn't have direct HTTP client
    // In production, you'd use a canister that can make HTTP requests
    let mockRate: Float = 135.50; // 1 USDT = 135.50 KES
    
    // TODO: Implement real Binance API call using HTTP canister
    // This would require setting up an HTTP canister or using a service like:
    // - Internet Computer's HTTP canister
    // - External API service
    // - Backend proxy service
    
    await logAuditEvent(?caller, "CONVERSION_RATE_FETCHED", "Fetched USDT to KES rate from Binance", true);
    
    #ok(mockRate);
  };
  
  // Get available bills
  public shared(msg) func getAvailableBills(): async Result.Result<[PaybillBill], Text> {
    let caller = msg.caller;
    
    await logAuditEvent(?caller, "BILLS_FETCHED", "Fetched available bills", true);
    
    #ok(availableBills);
  };
  
  // Process paybill payment
  public shared(msg) func processPaybillPayment(paymentRequest: PaybillPaymentRequest): async Result.Result<PaybillTransaction, Text> {
    let caller = msg.caller;
    
    // Validate input
    if (paymentRequest.usdtAmount <= 0) {
      return #err("USDT amount must be greater than 0");
    };
    
    if (paymentRequest.kesAmount <= 0) {
      return #err("KES amount must be greater than 0");
    };
    
    if (paymentRequest.phoneNumber == "") {
      return #err("Phone number is required");
    };
    
    if (paymentRequest.paybillNumber == "") {
      return #err("Paybill number is required");
    };
    
    let transactionId = generateId("paybill", nextPaybillTransactionId);
    nextPaybillTransactionId += 1;
    
    let now = getCurrentTime();
    
    let transaction: PaybillTransaction = {
      id = transactionId;
      userId = caller;
      billId = paymentRequest.billId;
      usdtAmount = paymentRequest.usdtAmount;
      kesAmount = paymentRequest.kesAmount;
      phoneNumber = paymentRequest.phoneNumber;
      paybillNumber = paymentRequest.paybillNumber;
      accountReference = paymentRequest.accountReference;
      status = "processing";
      mpesaReceipt = null;
      mpesaTransactionId = null;
      createdAt = now;
      updatedAt = now;
      completedAt = null;
    };
    
    paybillTransactionsMap.put(transactionId, transaction);
    
    // Simulate Mpesa API call
    let processingResult = await simulateMpesaPayment(transaction);
    
    let updatedTransaction: PaybillTransaction = {
      id = transaction.id;
      userId = transaction.userId;
      billId = transaction.billId;
      usdtAmount = transaction.usdtAmount;
      kesAmount = transaction.kesAmount;
      phoneNumber = transaction.phoneNumber;
      paybillNumber = transaction.paybillNumber;
      accountReference = transaction.accountReference;
      status = if (processingResult.success) { "completed" } else { "failed" };
      mpesaReceipt = processingResult.receipt;
      mpesaTransactionId = processingResult.transactionId;
      createdAt = transaction.createdAt;
      updatedAt = getCurrentTime();
      completedAt = if (processingResult.success) { ?getCurrentTime() } else { null };
    };
    
    paybillTransactionsMap.put(transactionId, updatedTransaction);
    
    await logAuditEvent(?caller, "PAYBILL_PAYMENT_PROCESSED", "Processed paybill payment", processingResult.success);
    
    #ok(updatedTransaction);
  };
  
  // Get user's paybill transaction history
  public shared(msg) func getPaybillTransactionHistory(): async Result.Result<[PaybillTransaction], Text> {
    let caller = msg.caller;
    
    let userTransactions = Array.filter<PaybillTransaction>(
      Array.map<(Text, PaybillTransaction), PaybillTransaction>(paybillTransactions(), func(pair) { pair.1 }),
      func(transaction) { transaction.userId == caller }
    );
    
    #ok(Array.reverse(userTransactions)); // Most recent first
  };
  
  // Get paybill transaction by ID
  public shared(msg) func getPaybillTransactionById(transactionId: Text): async Result.Result<PaybillTransaction, Text> {
    let caller = msg.caller;
    
    switch (paybillTransactionsMap.get(transactionId)) {
      case null { #err("Transaction not found") };
      case (?transaction) {
        if (transaction.userId != caller) {
          return #err("Not authorized to access this transaction");
        };
        #ok(transaction);
      };
    };
  };
  
  // Simulate Mpesa payment processing
  private func simulateMpesaPayment(transaction: PaybillTransaction): async {
    success: Bool;
    receipt: ?Text;
    transactionId: ?Text;
  } {
    // Simulate 90% success rate
    let randomValue = Int.abs(Time.now()) % 100;
    let success = randomValue < 90; // 90% success rate
    
    if (success) {
      let receipt = "MPESA_" # Int.toText(Int.abs(Time.now()));
      let transactionId = "TXN_" # Int.toText(Int.abs(Time.now()));
      
      {
        success = true;
        receipt = ?receipt;
        transactionId = ?transactionId;
      };
    } else {
      {
        success = false;
        receipt = null;
        transactionId = null;
      };
    };
  };
  
  // Helper function to get paybill transactions
  private func paybillTransactions(): [(Text, PaybillTransaction)] {
    Iter.toArray(paybillTransactionsMap.entries());
  };

  // ===== DEPOSIT FUNCTIONS =====
  
  // Process deposit request
  public shared(msg) func processDeposit(depositRequest: DepositRequest): async Result.Result<DepositTransaction, Text> {
    let caller = msg.caller;
    let now = getCurrentTime();
    let transactionId = "DEP_" # Int.toText(nextDepositTransactionId);
    nextDepositTransactionId += 1;
    
    let transaction: DepositTransaction = {
      id = transactionId;
      userId = caller;
      kesAmount = depositRequest.kesAmount;
      usdtAmount = depositRequest.usdtAmount;
      phoneNumber = depositRequest.phoneNumber;
      conversionRate = depositRequest.conversionRate;
      status = "pending";
      mpesaReceipt = null;
      mpesaTransactionId = null;
      createdAt = now;
      updatedAt = now;
      completedAt = null;
    };
    
    depositTransactionsMap.put(transactionId, transaction);
    
    // Simulate Mpesa API call
    let processingResult = await simulateMpesaDeposit(transaction);
    
    let updatedTransaction: DepositTransaction = {
      id = transaction.id;
      userId = transaction.userId;
      kesAmount = transaction.kesAmount;
      usdtAmount = transaction.usdtAmount;
      phoneNumber = transaction.phoneNumber;
      conversionRate = transaction.conversionRate;
      status = if (processingResult.success) { "completed" } else { "failed" };
      mpesaReceipt = processingResult.receipt;
      mpesaTransactionId = processingResult.transactionId;
      createdAt = transaction.createdAt;
      updatedAt = getCurrentTime();
      completedAt = if (processingResult.success) { ?getCurrentTime() } else { null };
    };
    
    depositTransactionsMap.put(transactionId, updatedTransaction);
    
    await logAuditEvent(?caller, "DEPOSIT_PROCESSED", "Processed deposit request", processingResult.success);
    
    #ok(updatedTransaction);
  };
  
  // Get user's deposit history
  public shared(msg) func getDepositHistory(): async Result.Result<[DepositTransaction], Text> {
    let caller = msg.caller;
    
    let userTransactions = Array.filter<DepositTransaction>(
      Array.map<(Text, DepositTransaction), DepositTransaction>(depositTransactions(), func(pair) { pair.1 }),
      func(transaction) { transaction.userId == caller }
    );
    
    #ok(Array.reverse(userTransactions)); // Most recent first
  };
  
  // Get deposit transaction by ID
  public shared(msg) func getDepositTransactionById(transactionId: Text): async Result.Result<DepositTransaction, Text> {
    let caller = msg.caller;
    
    switch (depositTransactionsMap.get(transactionId)) {
      case null { #err("Transaction not found") };
      case (?transaction) {
        if (transaction.userId != caller) {
          return #err("Not authorized to access this transaction");
        };
        #ok(transaction);
      };
    };
  };
  
  // Simulate Mpesa deposit processing
  private func simulateMpesaDeposit(transaction: DepositTransaction): async {
    success: Bool;
    receipt: ?Text;
    transactionId: ?Text;
  } {
    // Simulate 95% success rate for deposits
    let randomValue = Int.abs(Time.now()) % 100;
    let success = randomValue < 95; // 95% success rate
    
    if (success) {
      let receipt = "MPESA_DEP_" # Int.toText(Int.abs(Time.now()));
      let transactionId = "DEP_TXN_" # Int.toText(Int.abs(Time.now()));
      
      {
        success = true;
        receipt = ?receipt;
        transactionId = ?transactionId;
      };
    } else {
      {
        success = false;
        receipt = null;
        transactionId = null;
      };
    };
  };
  
  // Helper function to get deposit transactions
  private func depositTransactions(): [(Text, DepositTransaction)] {
    Iter.toArray(depositTransactionsMap.entries());
  };

  // ===== NOTIFICATION SYSTEM FUNCTIONS =====

  // Create a new notification
  public shared(msg) func createNotification(
    notificationTypeText: Text,
    title: Text,
    message: Text,
    priority: Text, // "low" | "medium" | "high" | "critical"
    actionUrl: ?Text,
    expiresAt: ?Int
  ): async Result.Result<Notification, Text> {
    let caller = msg.caller;
    
    // Check if user exists
    switch (users.get(caller)) {
      case null { return #err("User not found"); };
      case (?user) {
        let notificationId = generateId("notif", nextNotificationId);
        nextNotificationId += 1;
        
        let now = getCurrentTime();
        
        // Convert text to NotificationType
        let notificationType: NotificationType = switch (notificationTypeText) {
          case "Transaction" { #Transaction({ amount = 0.0; currency = ""; status = "" }) };
          case "Security" { #Security({ event = ""; severity = ""; action = null }) };
          case "Vault" { #Vault({ vaultId = ""; action = ""; amount = null }) };
          case "Social" { #Social({ event = ""; userId = ""; metadata = null }) };
          case "System" { #System({ message = ""; priority = "" }) };
          case "Payment" { #Payment({ provider = ""; amount = 0.0; status = "" }) };
          case "Recovery" { #Recovery({ method = ""; status = "" }) };
          case _ { #System({ message = ""; priority = "" }) }; // Default to System
        };
        
        let newNotification: Notification = {
          id = notificationId;
          userId = caller;
          notificationType = notificationType;
          title = title;
          message = message;
          priority = priority;
          isRead = false;
          isArchived = false;
          createdAt = now;
          readAt = null;
          metadata = null;
          actionUrl = actionUrl;
          expiresAt = expiresAt;
        };
        
        notifications.put(notificationId, newNotification);
        
        // Update user notification index
        let currentUserNotifications = Option.get(userNotifications.get(caller), []);
        userNotifications.put(caller, Array.append(currentUserNotifications, [notificationId]));
        
        await logAuditEvent(?caller, "NOTIFICATION_CREATED", "Created notification: " # title, true);
        return #ok(newNotification);
      };
    };
  };

  // Get user notifications
  public shared(msg) func getUserNotifications(limit: Nat, offset: Nat): async Result.Result<[Notification], Text> {
    let caller = msg.caller;
    
    switch (userNotifications.get(caller)) {
      case null { #ok([]) };
      case (?notificationIds) {
        let allNotifications = Array.mapFilter<Text, Notification>(notificationIds, func(id) {
          notifications.get(id);
        });
        
        // Filter out expired notifications
        let now = getCurrentTime();
        let validNotifications = Array.filter<Notification>(allNotifications, func(notif) {
          switch (notif.expiresAt) {
            case null { true };
            case (?expiry) { expiry > now };
          };
        });
        
        // Sort by creation time (newest first)
        let sortedNotifications = Array.sort<Notification>(validNotifications, func(a, b) {
          if (a.createdAt > b.createdAt) #greater
          else if (a.createdAt < b.createdAt) #less
          else #equal
        });
        
        // Apply pagination
        let totalCount = sortedNotifications.size();
        if (offset >= totalCount) {
          return #ok([]);
        };
        
        let endIndex = Nat.min(offset + limit, totalCount);
        let paginatedNotifications = Array.tabulate<Notification>(endIndex - offset, func(i) {
          sortedNotifications[offset + i];
        });
        
        #ok(paginatedNotifications);
      };
    };
  };

  // Mark notification as read
  public shared(msg) func markNotificationAsRead(notificationId: Text): async Result.Result<Notification, Text> {
    let caller = msg.caller;
    
    switch (notifications.get(notificationId)) {
      case null { return #err("Notification not found"); };
      case (?notification) {
        if (notification.userId != caller) {
          return #err("Not authorized to access this notification");
        };
        
        if (notification.isRead) {
          return #ok(notification); // Already read
        };
        
        let now = getCurrentTime();
        let updatedNotification: Notification = {
          id = notification.id;
          userId = notification.userId;
          notificationType = notification.notificationType;
          title = notification.title;
          message = notification.message;
          priority = notification.priority;
          isRead = true;
          isArchived = notification.isArchived;
          createdAt = notification.createdAt;
          readAt = ?now;
          metadata = notification.metadata;
          actionUrl = notification.actionUrl;
          expiresAt = notification.expiresAt;
        };
        
        notifications.put(notificationId, updatedNotification);
        return #ok(updatedNotification);
      };
    };
  };

  // Mark all notifications as read
  public shared(msg) func markAllNotificationsAsRead(): async Result.Result<Nat, Text> {
    let caller = msg.caller;
    
    switch (userNotifications.get(caller)) {
      case null { #ok(0) };
      case (?notificationIds) {
        let now = getCurrentTime();
        var updatedCount: Nat = 0;
        
        for (notificationId in notificationIds.vals()) {
          switch (notifications.get(notificationId)) {
            case null { /* Skip deleted notifications */ };
            case (?notification) {
              if (not notification.isRead) {
                let updatedNotification: Notification = {
                  id = notification.id;
                  userId = notification.userId;
                  notificationType = notification.notificationType;
                  title = notification.title;
                  message = notification.message;
                  priority = notification.priority;
                  isRead = true;
                  isArchived = notification.isArchived;
                  createdAt = notification.createdAt;
                  readAt = ?now;
                  metadata = notification.metadata;
                  actionUrl = notification.actionUrl;
                  expiresAt = notification.expiresAt;
                };
                
                notifications.put(notificationId, updatedNotification);
                updatedCount += 1;
              };
            };
          };
        };
        
        #ok(updatedCount);
      };
    };
  };

  // Delete notification
  public shared(msg) func deleteNotification(notificationId: Text): async Result.Result<Bool, Text> {
    let caller = msg.caller;
    
    switch (notifications.get(notificationId)) {
      case null { return #err("Notification not found"); };
      case (?notification) {
        if (notification.userId != caller) {
          return #err("Not authorized to delete this notification");
        };
        
        notifications.delete(notificationId);
        
        // Remove from user notification index
        switch (userNotifications.get(caller)) {
          case null { /* Nothing to remove */ };
          case (?notificationIds) {
            let updatedIds = Array.filter<Text>(notificationIds, func(id) { id != notificationId });
            userNotifications.put(caller, updatedIds);
          };
        };
        
        #ok(true);
      };
    };
  };

  // Get unread notification count
  public shared query(msg) func getUnreadNotificationCount(): async Nat {
    let caller = msg.caller;
    
    switch (userNotifications.get(caller)) {
      case null { 0 };
      case (?notificationIds) {
        let now = getCurrentTime();
        var unreadCount: Nat = 0;
        
        for (notificationId in notificationIds.vals()) {
          switch (notifications.get(notificationId)) {
            case null { /* Skip deleted notifications */ };
            case (?notification) {
              // Check if notification is not read and not expired
              let isExpired = switch (notification.expiresAt) {
                case null { false };
                case (?expiry) { expiry <= now };
              };
              
              if (not notification.isRead and not isExpired) {
                unreadCount += 1;
              };
            };
          };
        };
        
        unreadCount;
      };
    };
  };

  // Get notification preferences
  public shared(msg) func getNotificationPreferences(): async Result.Result<NotificationPreferences, Text> {
    let caller = msg.caller;
    
    switch (notificationPreferences.get(caller)) {
      case null {
        // Return default preferences
        let defaultPrefs: NotificationPreferences = {
          userId = caller;
          email = true;
          push = true;
          inApp = true;
          transactionNotifications = true;
          securityNotifications = true;
          vaultNotifications = true;
          socialNotifications = true;
          systemNotifications = true;
          paymentNotifications = true;
          recoveryNotifications = true;
          quietHours = null;
          timezone = "UTC";
          updatedAt = getCurrentTime();
        };
        
        notificationPreferences.put(caller, defaultPrefs);
        #ok(defaultPrefs);
      };
      case (?prefs) { #ok(prefs) };
    };
  };

  // Update notification preferences
  public shared(msg) func updateNotificationPreferences(
    email: Bool,
    push: Bool,
    inApp: Bool,
    transactionNotifications: Bool,
    securityNotifications: Bool,
    vaultNotifications: Bool,
    socialNotifications: Bool,
    systemNotifications: Bool,
    paymentNotifications: Bool,
    recoveryNotifications: Bool,
    quietHours: ?{ start: Text; end: Text },
    timezone: Text
  ): async Result.Result<NotificationPreferences, Text> {
    let caller = msg.caller;
    
    let now = getCurrentTime();
    let updatedPrefs: NotificationPreferences = {
      userId = caller;
      email = email;
      push = push;
      inApp = inApp;
      transactionNotifications = transactionNotifications;
      securityNotifications = securityNotifications;
      vaultNotifications = vaultNotifications;
      socialNotifications = socialNotifications;
      systemNotifications = systemNotifications;
      paymentNotifications = paymentNotifications;
      recoveryNotifications = recoveryNotifications;
      quietHours = quietHours;
      timezone = timezone;
      updatedAt = now;
    };
    
    notificationPreferences.put(caller, updatedPrefs);
    #ok(updatedPrefs);
  };

  // Add push subscription
  public shared(msg) func addPushSubscription(
    endpoint: Text,
    p256dh: Text,
    auth: Text,
    deviceInfo: ?Text
  ): async Result.Result<PushSubscription, Text> {
    let caller = msg.caller;
    
    let subscriptionId = generateId("push_sub", nextPushSubscriptionId);
    nextPushSubscriptionId += 1;
    
    let now = getCurrentTime();
    let newSubscription: PushSubscription = {
      id = subscriptionId;
      userId = caller;
      endpoint = endpoint;
      p256dh = p256dh;
      auth = auth;
      deviceInfo = deviceInfo;
      isActive = true;
      createdAt = now;
      lastUsed = now;
    };
    
    pushSubscriptions.put(subscriptionId, newSubscription);
    
    // Update user push subscription index
    let currentUserSubscriptions = Option.get(userPushSubscriptions.get(caller), []);
    userPushSubscriptions.put(caller, Array.append(currentUserSubscriptions, [subscriptionId]));
    
    await logAuditEvent(?caller, "PUSH_SUBSCRIPTION_ADDED", "Added push notification subscription", true);
    #ok(newSubscription);
  };

  // Remove push subscription
  public shared(msg) func removePushSubscription(subscriptionId: Text): async Result.Result<Bool, Text> {
    let caller = msg.caller;
    
    switch (pushSubscriptions.get(subscriptionId)) {
      case null { return #err("Push subscription not found"); };
      case (?subscription) {
        if (subscription.userId != caller) {
          return #err("Not authorized to remove this subscription");
        };
        
        pushSubscriptions.delete(subscriptionId);
        
        // Remove from user push subscription index
        switch (userPushSubscriptions.get(caller)) {
          case null { /* Nothing to remove */ };
          case (?subscriptionIds) {
            let updatedIds = Array.filter<Text>(subscriptionIds, func(id) { id != subscriptionId });
            userPushSubscriptions.put(caller, updatedIds);
          };
        };
        
        #ok(true);
      };
    };
  };

  // Send cross-canister notification (placeholder for future implementation)
  public shared(msg) func sendCrossCanisterNotification(
    targetCanisterId: Text,
    notificationData: Text
  ): async Result.Result<Text, Text> {
    let caller = msg.caller;
    
    // For now, just return success - this would be implemented with inter-canister calls
    await logAuditEvent(?caller, "CROSS_CANISTER_NOTIFICATION", "Sent cross-canister notification to " # targetCanisterId, true);
    #ok("Cross-canister notification sent (placeholder implementation)");
  };

  // ===== SYSTEM FUNCTIONS =====

};