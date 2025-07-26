import Debug "mo:base/Debug";
import HashMap "mo:base/HashMap";
import Text "mo:base/Text";
import Array "mo:base/Array";
import Time "mo:base/Time";
import Int "mo:base/Int";
import Nat32 "mo:base/Nat32";
import Nat8 "mo:base/Nat8";
import Float "mo:base/Float";
import Result "mo:base/Result";
import Option "mo:base/Option";
import Principal "mo:base/Principal";
import Iter "mo:base/Iter";
import Random "mo:base/Random";
import Blob "mo:base/Blob";
import Buffer "mo:base/Buffer";
import Char "mo:base/Char";
import Nat "mo:base/Nat";
import PluginMarketplace "modules/PluginMarketplace";

actor Nisto {
  
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
    toAddress: ?Text;
    fromAddress: ?Text;
    txHash: ?Text; // Blockchain transaction hash
    blockHeight: ?Nat;
    fee: Float;
    status: Text; // "pending" | "confirmed" | "failed"
    timestamp: Int;
    metadata: ?Text; // JSON string for additional data
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
    userId: UserId;
    walletId: Text;
    type_: Text; // "income" | "expense" | "transfer" | "investment"
    amount: Float;
    currency: Text;
    category: Text;
    description: Text;
    timestamp: Int;
    status: Text; // "pending" | "completed" | "failed" | "cancelled"
    metadata: ?Text;
  };

  public type Budget = {
    id: Text;
    userId: UserId;
    name: Text;
    category: Text;
    amount: Float;
    spent: Float;
    currency: Text;
    period: Text; // "daily" | "weekly" | "monthly" | "yearly"
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

  // ===== VAULT TYPES =====
  
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

  public type Vault = {
    id: Text;
    name: Text;
    description: Text;
    owner: Principal;
    members: [Principal];
    createdAt: Int;
    updatedAt: Int;
    isPublic: Bool;
    vaultType: VaultType;
    currency: Text;
    balance: Float;
    targetAmount: ?Float;
    rules: ?Text;
    status: Text;
    metadata: ?Text;
  };

  // ===== GROUP VAULTS TYPES =====

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

  // ============ STATE VARIABLES ============
  
  let admin : Principal = Principal.fromText("2vxsx-fae"); // Anonymous principal for development
  
  // Core counters
  private stable var nextUserId: Nat = 0;
  private stable var nextWalletId: Nat = 0;
  private stable var nextTransactionId: Nat = 0;
  private stable var nextBudgetId: Nat = 0;
  private stable var nextGoalId: Nat = 0;
  private stable var nextRecoveryMethodId: Nat = 0;
  private stable var nextSecurityQuestionId: Nat = 0;
  private stable var nextEmergencyContactId: Nat = 0;
  private stable var nextVerificationCodeId: Nat = 0;
  private stable var nextRecoveryRequestId: Nat = 0;
  private stable var nextSessionId: Nat = 0;
  private stable var nextAuditLogId: Nat = 0;
  
  // Crypto wallet counters
  private stable var nextCryptoWalletId: Nat = 0;
  private stable var nextExternalConnectionId: Nat = 0;
  private stable var nextCryptoTransactionId: Nat = 0;
  private stable var nextDeFiPositionId: Nat = 0;
  
  // Core data storage
  private var users = HashMap.HashMap<UserId, User>(10, Principal.equal, Principal.hash);
  private var wallets = HashMap.HashMap<Text, Wallet>(10, Text.equal, Text.hash);
  private var transactions = HashMap.HashMap<Text, Transaction>(50, Text.equal, Text.hash);
  private var budgets = HashMap.HashMap<Text, Budget>(20, Text.equal, Text.hash);
  private var goals = HashMap.HashMap<Text, Goal>(20, Text.equal, Text.hash);
  
  // Crypto wallet storage
  private var cryptoWallets = HashMap.HashMap<Text, CryptoWallet>(50, Text.equal, Text.hash);
  private var externalConnections = HashMap.HashMap<Text, ExternalWalletConnection>(20, Text.equal, Text.hash);
  private var cryptoTransactions = HashMap.HashMap<Text, CryptoTransaction>(100, Text.equal, Text.hash);
  private var defiPositions = HashMap.HashMap<Text, DeFiPosition>(50, Text.equal, Text.hash);
  
  // Recovery system storage
  private var recoveryMethods = HashMap.HashMap<Text, RecoveryMethod>(20, Text.equal, Text.hash);
  private var securityQuestions = HashMap.HashMap<Text, SecurityQuestion>(20, Text.equal, Text.hash);
  private var emergencyContacts = HashMap.HashMap<Text, EmergencyContact>(10, Text.equal, Text.hash);
  private var verificationCodes = HashMap.HashMap<Text, VerificationCode>(50, Text.equal, Text.hash);
  private var recoveryRequests = HashMap.HashMap<Text, RecoveryRequest>(20, Text.equal, Text.hash);
  private var loginSessions = HashMap.HashMap<Text, LoginSession>(50, Text.equal, Text.hash);
  private var auditLogs = HashMap.HashMap<Text, AuditLog>(100, Text.equal, Text.hash);
  
  // Indexes
  private var userWallets = HashMap.HashMap<UserId, [Text]>(10, Principal.equal, Principal.hash);
  private var userTransactions = HashMap.HashMap<UserId, [Text]>(10, Principal.equal, Principal.hash);
  private var userRecoveryMethods = HashMap.HashMap<UserId, [Text]>(10, Principal.equal, Principal.hash);
  private var userSecurityQuestions = HashMap.HashMap<UserId, [Text]>(10, Principal.equal, Principal.hash);
  private var userEmergencyContacts = HashMap.HashMap<UserId, [Text]>(10, Principal.equal, Principal.hash);
  private var userSessions = HashMap.HashMap<UserId, [Text]>(10, Principal.equal, Principal.hash);
  private var emailToUserId = HashMap.HashMap<Text, UserId>(20, Text.equal, Text.hash);
  private var phoneToUserId = HashMap.HashMap<Text, UserId>(20, Text.equal, Text.hash);
  
  // Crypto wallet indexes
  private var userCryptoWallets = HashMap.HashMap<UserId, [Text]>(10, Principal.equal, Principal.hash);
  private var userExternalConnections = HashMap.HashMap<UserId, [Text]>(10, Principal.equal, Principal.hash);
  private var userCryptoTransactions = HashMap.HashMap<UserId, [Text]>(10, Principal.equal, Principal.hash);
  private var userDeFiPositions = HashMap.HashMap<UserId, [Text]>(10, Principal.equal, Principal.hash);
  private var addressToWallet = HashMap.HashMap<Text, Text>(50, Text.equal, Text.hash);
  private var principalToConnection = HashMap.HashMap<Text, Text>(20, Text.equal, Text.hash);
  
  // OTP storage
  private var otpRequests = HashMap.HashMap<Text, OTPRequest>(100, Text.equal, Text.hash);
  private var userOTPRequests = HashMap.HashMap<UserId, [Text]>(10, Principal.equal, Principal.hash);
  private stable var nextOTPRequestId: Nat = 0;
  
  // ===== GROUP VAULTS STORAGE =====
  private var vaults = HashMap.HashMap<Text, Vault>(100, Text.equal, Text.hash);
  private stable var nextVaultId: Nat = 0;
  
  // Group vault storage
  private var groupVaults = HashMap.HashMap<Text, GroupVault>(100, Text.equal, Text.hash);
  private var vaultMembers = HashMap.HashMap<Text, VaultMember>(200, Text.equal, Text.hash);
  private var vaultTransactions = HashMap.HashMap<Text, VaultTransaction>(500, Text.equal, Text.hash);
  private stable var nextVaultMemberId: Nat = 0;
  private stable var nextVaultTransactionId: Nat = 0;
  
  // Group vault indexes
  private var userVaults = HashMap.HashMap<UserId, [Text]>(10, Principal.equal, Principal.hash);
  private var vaultMemberIndex = HashMap.HashMap<Text, [Text]>(50, Text.equal, Text.hash); // vaultId -> memberIds
  private var vaultTransactionIndex = HashMap.HashMap<Text, [Text]>(50, Text.equal, Text.hash); // vaultId -> transactionIds
  
  // ===== PLUGIN SYSTEM STORAGE =====
  private var pluginStore = HashMap.HashMap<Text, Plugin>(100, Text.equal, Text.hash);
  private var userPluginStore = HashMap.HashMap<Text, UserPlugin>(200, Text.equal, Text.hash);
  private stable var nextPluginId: Nat = 0;
  private stable var nextUserPluginId: Nat = 0;
  
  // Plugin indexes
  private var userPluginIndex = HashMap.HashMap<UserId, [Text]>(10, Principal.equal, Principal.hash);
  private var pluginCategoryIndex = HashMap.HashMap<Text, [Text]>(10, Text.equal, Text.hash); // category -> pluginIds
  

  
  // ===== SOCIAL GAMES STORAGE =====
  private var socialGames = HashMap.HashMap<Text, SocialGame>(50, Text.equal, Text.hash);
  private var gameParticipants = HashMap.HashMap<Text, GameParticipant>(200, Text.equal, Text.hash);
  private var gameRewards = HashMap.HashMap<Text, GameReward>(100, Text.equal, Text.hash);
  private stable var nextGameId: Nat = 0;
  private stable var nextGameParticipantId: Nat = 0;
  private stable var nextGameRewardId: Nat = 0;
  
  // Game indexes
  private var userGames = HashMap.HashMap<UserId, [Text]>(10, Principal.equal, Principal.hash);
  private var gameParticipantIndex = HashMap.HashMap<Text, [Text]>(50, Text.equal, Text.hash); // gameId -> participantIds
  private var gameRewardIndex = HashMap.HashMap<UserId, [Text]>(10, Principal.equal, Principal.hash); // userId -> rewardIds
  
  // ===== DEFI TOOLS STORAGE =====
  private var defiTransactions = HashMap.HashMap<Text, DeFiTransaction>(200, Text.equal, Text.hash);
  private stable var nextDefiTransactionId: Nat = 0;
  
  // DeFi indexes
  private var userDefiTransactions = HashMap.HashMap<UserId, [Text]>(10, Principal.equal, Principal.hash);
  private var protocolTransactionIndex = HashMap.HashMap<Text, [Text]>(10, Text.equal, Text.hash); // protocol -> transactionIds
  
  // ===== AI ASSISTANT STORAGE =====
  private var aiMessages = HashMap.HashMap<Text, AIMessage>(500, Text.equal, Text.hash);
  private var aiInsights = HashMap.HashMap<Text, AIInsight>(100, Text.equal, Text.hash);
  private var aiRecommendations = HashMap.HashMap<Text, AIRecommendation>(100, Text.equal, Text.hash);
  private stable var nextAIMessageId: Nat = 0;
  private stable var nextAIInsightId: Nat = 0;
  private stable var nextAIRecommendationId: Nat = 0;
  
  // AI indexes
  private var userAIMessages = HashMap.HashMap<UserId, [Text]>(10, Principal.equal, Principal.hash);
  private var userAIInsights = HashMap.HashMap<UserId, [Text]>(10, Principal.equal, Principal.hash);
  private var userAIRecommendations = HashMap.HashMap<UserId, [Text]>(10, Principal.equal, Principal.hash);
  
  // ===== LOCAL PAYMENTS STORAGE =====
  private var localPayments = HashMap.HashMap<Text, LocalPayment>(200, Text.equal, Text.hash);
  private var paymentMethods = HashMap.HashMap<Text, PaymentMethod>(100, Text.equal, Text.hash);
  private stable var nextLocalPaymentId: Nat = 0;
  private stable var nextPaymentMethodId: Nat = 0;
  
  // Payment indexes
  private var userLocalPayments = HashMap.HashMap<UserId, [Text]>(10, Principal.equal, Principal.hash);
  private var userPaymentMethods = HashMap.HashMap<UserId, [Text]>(10, Principal.equal, Principal.hash);
  private var providerPaymentIndex = HashMap.HashMap<Text, [Text]>(10, Text.equal, Text.hash); // provider -> paymentIds

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


}