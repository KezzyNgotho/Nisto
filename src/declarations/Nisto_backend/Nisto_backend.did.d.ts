import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';

export interface AIInsight {
  'id' : string,
  'title' : string,
  'metadata' : [] | [string],
  'userId' : UserId,
  'createdAt' : bigint,
  'type' : string,
  'description' : string,
  'actionable' : boolean,
  'confidence' : number,
}
export interface AIMessage {
  'id' : string,
  'content' : string,
  'metadata' : [] | [string],
  'userId' : UserId,
  'type' : AIMessageType,
  'timestamp' : bigint,
}
export type AIMessageType = { 'Error' : null } |
  { 'System' : null } |
  { 'User' : null } |
  { 'Assistant' : null };
export interface AIRecommendation {
  'id' : string,
  'title' : string,
  'estimatedImpact' : number,
  'metadata' : [] | [string],
  'userId' : UserId,
  'createdAt' : bigint,
  'description' : string,
  'isImplemented' : boolean,
  'category' : string,
  'priority' : string,
}
export interface AuditLog {
  'id' : string,
  'action' : string,
  'userId' : [] | [UserId],
  'timestamp' : bigint,
  'details' : string,
  'success' : boolean,
  'userAgent' : [] | [string],
  'ipAddress' : [] | [string],
}
export interface Budget {
  'id' : string,
  'endDate' : bigint,
  'period' : string,
  'userId' : UserId,
  'name' : string,
  'isActive' : boolean,
  'spent' : number,
  'category' : string,
  'amount' : number,
  'startDate' : bigint,
}
export interface CryptoTransaction {
  'id' : string,
  'fee' : number,
  'status' : string,
  'fromAddress' : [] | [string],
  'metadata' : [] | [string],
  'userId' : UserId,
  'type' : string,
  'currency' : string,
  'blockHeight' : [] | [bigint],
  'timestamp' : bigint,
  'txHash' : [] | [string],
  'toAddress' : [] | [string],
  'amount' : number,
  'walletId' : string,
}
export interface CryptoWallet {
  'id' : string,
  'balance' : number,
  'metadata' : [] | [string],
  'userId' : UserId,
  'name' : string,
  'createdAt' : bigint,
  'isExternal' : boolean,
  'walletType' : CryptoWalletType,
  'isActive' : boolean,
  'updatedAt' : bigint,
  'currency' : string,
  'address' : [] | [string],
  'lastSyncAt' : [] | [bigint],
  'externalWalletType' : [] | [string],
}
export type CryptoWalletType = { 'CAT' : null } |
  { 'ICP' : null } |
  { 'MOD' : null } |
  { 'NTN' : null } |
  { 'GHOST' : null } |
  { 'NANAS' : null } |
  { 'BOOM' : null } |
  { 'CHAT' : null } |
  { 'ELNA' : null } |
  { 'CKPEPE' : null } |
  { 'FIAT' : null } |
  { 'FOMO' : null } |
  { 'GLDT' : null } |
  { 'MEME' : null } |
  { 'NICP' : null } |
  { 'CYCLES' : null } |
  { 'SNS1' : null } |
  { 'TRAX' : null } |
  { 'YUGE' : null } |
  { 'PANDA' : null } |
  { 'PARTY' : null } |
  { 'ckBTC' : null } |
  { 'ckETH' : null } |
  { 'WUMBO' : null } |
  { 'OPENCHAT' : null } |
  { 'DKUMA' : null } |
  { 'DOGMI' : null } |
  { 'DSCVR' : null } |
  { 'KINIC' : null } |
  { 'ALPACALB' : null } |
  { 'MOTOKO' : null } |
  { 'DRAGGINZ' : null } |
  { 'DAMONIC' : null } |
  { 'CLOWN' : null } |
  { 'SHRIMP' : null } |
  { 'SEERS' : null } |
  { 'SNEED' : null } |
  { 'SONIC' : null };
export interface DeFiPosition {
  'id' : string,
  'apy' : number,
  'protocol' : DeFiProtocol,
  'metadata' : [] | [string],
  'userId' : UserId,
  'createdAt' : bigint,
  'productType' : DeFiProductType,
  'isActive' : boolean,
  'updatedAt' : bigint,
  'tokenA' : string,
  'tokenB' : [] | [string],
  'rewards' : number,
  'amount' : number,
}
export type DeFiProductType = { 'Swap' : null } |
  { 'Lending' : null } |
  { 'Custom' : null } |
  { 'Borrowing' : null } |
  { 'Governance' : null } |
  { 'Liquidity' : null } |
  { 'YieldFarming' : null } |
  { 'Staking' : null };
export type DeFiProtocol = { 'Sonic' : null } |
  { 'Neutrinite' : null } |
  { 'InfinitySwap' : null } |
  { 'ICDex' : null } |
  { 'Custom' : null } |
  { 'ICPSwap' : null };
export interface DeFiTransaction {
  'id' : string,
  'fee' : number,
  'protocol' : DeFiProtocol,
  'status' : string,
  'metadata' : [] | [string],
  'userId' : UserId,
  'type' : string,
  'amountA' : number,
  'amountB' : [] | [number],
  'tokenA' : string,
  'tokenB' : [] | [string],
  'timestamp' : bigint,
  'txHash' : [] | [string],
}
export interface EmergencyContact {
  'id' : string,
  'relationship' : string,
  'userId' : UserId,
  'name' : string,
  'createdAt' : bigint,
  'email' : string,
  'isVerified' : boolean,
  'verifiedAt' : [] | [bigint],
}
export interface ExternalWalletConnection {
  'id' : string,
  'lastUsedAt' : bigint,
  'permissions' : Array<string>,
  'userId' : UserId,
  'walletType' : string,
  'isActive' : boolean,
  'connectedAt' : bigint,
  'address' : [] | [string],
  'principalId' : [] | [string],
}
export interface GameParticipant {
  'id' : string,
  'metadata' : [] | [string],
  'userId' : UserId,
  'joinedAt' : bigint,
  'rank' : [] | [bigint],
  'gameId' : string,
  'isActive' : boolean,
  'score' : number,
}
export interface GameReward {
  'id' : string,
  'expiresAt' : [] | [bigint],
  'metadata' : [] | [string],
  'userId' : UserId,
  'type' : string,
  'gameId' : string,
  'description' : string,
  'claimedAt' : [] | [bigint],
  'currency' : [] | [string],
  'amount' : number,
}
export type GameStatus = { 'Paused' : null } |
  { 'Active' : null } |
  { 'Cancelled' : null } |
  { 'Completed' : null };
export type GameType = { 'Prediction' : null } |
  { 'Quiz' : null } |
  { 'Tournament' : null } |
  { 'Trading' : null } |
  { 'Custom' : null } |
  { 'Lottery' : null } |
  { 'Challenge' : null };
export interface Goal {
  'id' : string,
  'title' : string,
  'userId' : UserId,
  'createdAt' : bigint,
  'description' : string,
  'isActive' : boolean,
  'updatedAt' : bigint,
  'isAchieved' : boolean,
  'targetAmount' : number,
  'currency' : string,
  'targetDate' : [] | [bigint],
  'category' : string,
  'currentAmount' : number,
}
export interface GroupVault {
  'id' : string,
  'vaultType' : VaultType,
  'members' : Array<string>,
  'ownerId' : UserId,
  'metadata' : [] | [string],
  'name' : string,
  'createdAt' : bigint,
  'description' : [] | [string],
  'isActive' : boolean,
  'updatedAt' : bigint,
  'targetAmount' : [] | [number],
  'currency' : string,
  'isPublic' : boolean,
  'totalBalance' : number,
  'rules' : [] | [string],
}
export interface LocalPayment {
  'id' : string,
  'fee' : number,
  'status' : PaymentStatus,
  'completedAt' : [] | [bigint],
  'provider' : PaymentProvider,
  'metadata' : [] | [string],
  'userId' : UserId,
  'recipientPhone' : [] | [string],
  'type' : string,
  'reference' : [] | [string],
  'currency' : string,
  'timestamp' : bigint,
  'amount' : number,
  'recipientName' : [] | [string],
}
export interface NotificationSettings {
  'social' : boolean,
  'push' : boolean,
  'security' : boolean,
  'email' : boolean,
  'goals' : boolean,
  'transactions' : boolean,
}
export interface OTPRequest {
  'id' : string,
  'service' : string,
  'status' : string,
  'deliveredAt' : [] | [bigint],
  'expiresAt' : bigint,
  'provider' : string,
  'metadata' : [] | [string],
  'code' : string,
  'userId' : [] | [UserId],
  'createdAt' : bigint,
  'recipient' : string,
  'attempts' : bigint,
  'sentAt' : [] | [bigint],
  'purpose' : string,
}
export interface PaymentMethod {
  'id' : string,
  'provider' : PaymentProvider,
  'metadata' : [] | [string],
  'userId' : UserId,
  'createdAt' : bigint,
  'isActive' : boolean,
  'accountName' : string,
  'isDefault' : boolean,
  'accountNumber' : [] | [string],
  'phoneNumber' : [] | [string],
}
export type PaymentProvider = { 'Equitel' : null } |
  { 'PayPal' : null } |
  { 'Card' : null } |
  { 'BankTransfer' : null } |
  { 'Custom' : null } |
  { 'Mpesa' : null } |
  { 'AirtelMoney' : null };
export type PaymentStatus = { 'Failed' : null } |
  { 'Refunded' : null } |
  { 'Cancelled' : null } |
  { 'Processing' : null } |
  { 'Completed' : null } |
  { 'Pending' : null };
export interface Plugin {
  'id' : string,
  'status' : PluginStatus,
  'permissions' : Array<PluginPermission>,
  'isInstalled' : boolean,
  'metadata' : [] | [string],
  'icon' : [] | [string],
  'name' : string,
  'createdAt' : bigint,
  'description' : string,
  'author' : string,
  'version' : string,
  'isEnabled' : boolean,
  'updatedAt' : bigint,
  'installCount' : bigint,
  'configSchema' : [] | [string],
  'entryPoint' : string,
  'category' : PluginCategory,
  'rating' : number,
}
export type PluginCategory = { 'Productivity' : null } |
  { 'Health' : null } |
  { 'Social' : null } |
  { 'Custom' : null } |
  { 'Entertainment' : null } |
  { 'Gaming' : null } |
  { 'Education' : null } |
  { 'Finance' : null };
export type PluginPermission = { 'WriteWallets' : null } |
  { 'ReadTransactions' : null } |
  { 'ReadProfile' : null } |
  { 'ReadContacts' : null } |
  { 'WriteContacts' : null } |
  { 'Notifications' : null } |
  { 'WriteProfile' : null } |
  { 'WriteTransactions' : null } |
  { 'ReadWallets' : null } |
  { 'ExternalAPIs' : null };
export type PluginStatus = { 'Inactive' : null } |
  { 'Active' : null } |
  { 'Suspended' : null } |
  { 'Deprecated' : null } |
  { 'Pending' : null };
export interface PrivacySettings {
  'profileVisibility' : string,
  'allowFriendRequests' : boolean,
  'transactionVisibility' : string,
}
export interface RecoveryMethod {
  'id' : string,
  'methodType' : string,
  'value' : string,
  'metadata' : [] | [string],
  'userId' : UserId,
  'createdAt' : bigint,
  'isActive' : boolean,
  'isVerified' : boolean,
  'verifiedAt' : [] | [bigint],
}
export interface RecoveryRequest {
  'id' : string,
  'status' : string,
  'completedAt' : [] | [bigint],
  'verificationCode' : [] | [string],
  'expiresAt' : bigint,
  'metadata' : [] | [string],
  'userId' : [] | [UserId],
  'createdAt' : bigint,
  'recoveryToken' : [] | [string],
  'recoveryMethod' : string,
  'identifier' : string,
  'verifiedAt' : [] | [bigint],
}
export type Result = { 'ok' : VaultTransaction } |
  { 'err' : string };
export type Result_1 = { 'ok' : RecoveryMethod } |
  { 'err' : string };
export type Result_10 = { 'ok' : CryptoWallet } |
  { 'err' : string };
export type Result_11 = { 'ok' : boolean } |
  { 'err' : string };
export type Result_12 = {
    'ok' : { 'expiresIn' : bigint, 'otpId' : string, 'message' : string }
  } |
  { 'err' : string };
export type Result_13 = { 'ok' : AIMessage } |
  { 'err' : string };
export type Result_14 = { 'ok' : Array<Plugin> } |
  { 'err' : string };
export type Result_15 = { 'ok' : DeFiTransaction } |
  { 'err' : string };
export type Result_16 = { 'ok' : Plugin } |
  { 'err' : string };
export type Result_17 = { 'ok' : LocalPayment } |
  { 'err' : string };
export type Result_18 = { 'ok' : AIRecommendation } |
  { 'err' : string };
export type Result_19 = { 'ok' : VaultMember } |
  { 'err' : string };
export type Result_2 = { 'ok' : string } |
  { 'err' : string };
export type Result_20 = {
    'ok' : {
      'recoveryRequestId' : string,
      'message' : string,
      'securityQuestions' : [] | [Array<[string, string]>],
    }
  } |
  { 'err' : string };
export type Result_21 = { 'ok' : Wallet } |
  { 'err' : string };
export type Result_22 = {
    'ok' : {
      'members' : Array<VaultMember>,
      'vault' : GroupVault,
      'transactions' : Array<VaultTransaction>,
    }
  } |
  { 'err' : string };
export type Result_23 = { 'ok' : Array<Wallet> } |
  { 'err' : string };
export type Result_24 = {
    'ok' : {
      'allAddresses' : Array<string>,
      'principalId' : string,
      'accountIdentifier' : string,
      'cryptoAddresses' : Array<[string, string]>,
    }
  } |
  { 'err' : string };
export type Result_25 = { 'ok' : Array<Transaction> } |
  { 'err' : string };
export type Result_26 = { 'ok' : Array<RecoveryMethod> } |
  { 'err' : string };
export type Result_27 = { 'ok' : Array<UserPlugin> } |
  { 'err' : string };
export type Result_28 = { 'ok' : Array<PaymentMethod> } |
  { 'err' : string };
export type Result_29 = { 'ok' : Array<LocalPayment> } |
  { 'err' : string };
export type Result_3 = {
    'ok' : { 'verified' : boolean, 'recipient' : string, 'purpose' : string }
  } |
  { 'err' : string };
export type Result_30 = { 'ok' : Array<OTPRequest> } |
  { 'err' : string };
export type Result_31 = { 'ok' : Array<GroupVault> } |
  { 'err' : string };
export type Result_32 = { 'ok' : Array<Goal> } |
  { 'err' : string };
export type Result_33 = { 'ok' : Array<SocialGame> } |
  { 'err' : string };
export type Result_34 = { 'ok' : Array<GameReward> } |
  { 'err' : string };
export type Result_35 = { 'ok' : Array<ExternalWalletConnection> } |
  { 'err' : string };
export type Result_36 = { 'ok' : Array<DeFiTransaction> } |
  { 'err' : string };
export type Result_37 = { 'ok' : Array<DeFiPosition> } |
  { 'err' : string };
export type Result_38 = { 'ok' : Array<CryptoWallet> } |
  { 'err' : string };
export type Result_39 = { 'ok' : Array<CryptoTransaction> } |
  { 'err' : string };
export type Result_4 = { 'ok' : User } |
  { 'err' : string };
export type Result_40 = { 'ok' : Array<Budget> } |
  { 'err' : string };
export type Result_41 = { 'ok' : Array<AuditLog> } |
  { 'err' : string };
export type Result_42 = { 'ok' : Array<AIRecommendation> } |
  { 'err' : string };
export type Result_43 = { 'ok' : Array<AIInsight> } |
  { 'err' : string };
export type Result_44 = {
    'ok' : {
      'topProvider' : [] | [string],
      'successRate' : number,
      'totalFees' : number,
      'totalPayments' : bigint,
      'totalAmount' : number,
    }
  } |
  { 'err' : string };
export type Result_45 = { 'ok' : Array<GameParticipant> } |
  { 'err' : string };
export type Result_46 = { 'ok' : WalletPortfolio } |
  { 'err' : string };
export type Result_47 = { 'ok' : Array<[string, string]> } |
  { 'err' : string };
export type Result_48 = {
    'ok' : {
      'totalVolume' : number,
      'averageApy' : number,
      'totalPositions' : bigint,
      'totalUsers' : bigint,
    }
  } |
  { 'err' : string };
export type Result_49 = {
    'ok' : {
      'totalValue' : number,
      'totalRewards' : number,
      'averageApy' : number,
      'activeProtocols' : Array<string>,
      'totalPositions' : bigint,
    }
  } |
  { 'err' : string };
export type Result_5 = { 'ok' : UserPlugin } |
  { 'err' : string };
export type Result_50 = {
    'ok' : {
      'activeWallets' : bigint,
      'monthlySpent' : number,
      'goalsProgress' : number,
      'totalBalance' : number,
    }
  } |
  { 'err' : string };
export type Result_51 = { 'ok' : Array<AIMessage> } |
  { 'err' : string };
export type Result_52 = {
    'ok' : {
      'implementedRecommendations' : bigint,
      'totalRecommendations' : bigint,
      'totalInsights' : bigint,
      'averageConfidence' : number,
      'totalMessages' : bigint,
    }
  } |
  { 'err' : string };
export type Result_53 = { 'ok' : SocialGame } |
  { 'err' : string };
export type Result_54 = { 'ok' : Transaction } |
  { 'err' : string };
export type Result_55 = { 'ok' : GroupVault } |
  { 'err' : string };
export type Result_56 = { 'ok' : CryptoTransaction } |
  { 'err' : string };
export type Result_57 = { 'ok' : Budget } |
  { 'err' : string };
export type Result_58 = { 'ok' : ExternalWalletConnection } |
  { 'err' : string };
export type Result_59 = {
    'ok' : { 'userId' : Principal, 'instructions' : string }
  } |
  { 'err' : string };
export type Result_6 = { 'ok' : PaymentMethod } |
  { 'err' : string };
export type Result_60 = { 'ok' : GameReward } |
  { 'err' : string };
export type Result_61 = { 'ok' : number } |
  { 'err' : string };
export type Result_62 = { 'ok' : Array<SecurityQuestion> } |
  { 'err' : string };
export type Result_63 = { 'ok' : EmergencyContact } |
  { 'err' : string };
export type Result_7 = { 'ok' : Goal } |
  { 'err' : string };
export type Result_8 = { 'ok' : GameParticipant } |
  { 'err' : string };
export type Result_9 = { 'ok' : DeFiPosition } |
  { 'err' : string };
export interface SecurityQuestion {
  'id' : string,
  'question' : string,
  'userId' : UserId,
  'createdAt' : bigint,
  'isActive' : boolean,
  'answerHash' : string,
}
export interface SecuritySettings {
  'twoFactorEnabled' : boolean,
  'deviceTracking' : boolean,
  'loginNotifications' : boolean,
}
export interface SocialGame {
  'id' : string,
  'startTime' : bigint,
  'status' : GameStatus,
  'endTime' : [] | [bigint],
  'metadata' : [] | [string],
  'currentParticipants' : bigint,
  'name' : string,
  'createdAt' : bigint,
  'createdBy' : UserId,
  'description' : string,
  'updatedAt' : bigint,
  'currency' : string,
  'gameType' : GameType,
  'maxParticipants' : [] | [bigint],
  'isPublic' : boolean,
  'entryFee' : [] | [number],
  'rules' : [] | [string],
  'prizePool' : number,
}
export interface Transaction {
  'id' : string,
  'status' : string,
  'metadata' : [] | [string],
  'userId' : UserId,
  'type' : string,
  'description' : string,
  'currency' : string,
  'timestamp' : bigint,
  'category' : string,
  'amount' : number,
  'walletId' : string,
}
export interface User {
  'id' : UserId,
  'username' : string,
  'displayName' : string,
  'lastLoginAt' : [] | [bigint],
  'createdAt' : bigint,
  'isActive' : boolean,
  'email' : [] | [string],
  'preferences' : UserPreferences,
  'recoverySetupCompleted' : boolean,
  'loginAttempts' : bigint,
  'updatedAt' : bigint,
  'isLocked' : boolean,
  'avatar' : [] | [string],
}
export type UserId = Principal;
export interface UserPlugin {
  'id' : string,
  'lastUsedAt' : bigint,
  'permissions' : Array<PluginPermission>,
  'metadata' : [] | [string],
  'userId' : UserId,
  'isEnabled' : boolean,
  'installedAt' : bigint,
  'config' : [] | [string],
  'pluginId' : string,
}
export interface UserPreferences {
  'theme' : string,
  'notifications' : NotificationSettings,
  'security' : SecuritySettings,
  'language' : string,
  'privacy' : PrivacySettings,
  'currency' : string,
}
export interface VaultMember {
  'id' : string,
  'permissions' : Array<string>,
  'userId' : UserId,
  'joinedAt' : bigint,
  'role' : string,
  'isActive' : boolean,
  'contributionLimit' : [] | [number],
  'vaultId' : string,
  'withdrawalLimit' : [] | [number],
}
export interface VaultTransaction {
  'id' : string,
  'status' : string,
  'metadata' : [] | [string],
  'userId' : UserId,
  'type' : string,
  'description' : string,
  'vaultId' : string,
  'currency' : string,
  'timestamp' : bigint,
  'amount' : number,
}
export type VaultType = { 'Investment' : null } |
  { 'Custom' : null } |
  { 'Business' : null } |
  { 'Travel' : null } |
  { 'Savings' : null } |
  { 'Charity' : null } |
  { 'Emergency' : null } |
  { 'Education' : null };
export interface Wallet {
  'id' : string,
  'balance' : number,
  'userId' : UserId,
  'name' : string,
  'createdAt' : bigint,
  'type' : string,
  'isActive' : boolean,
  'updatedAt' : bigint,
  'currency' : string,
}
export interface WalletPortfolio {
  'cryptoWallets' : Array<CryptoWallet>,
  'externalConnections' : Array<ExternalWalletConnection>,
  'totalValueKES' : number,
  'totalValueUSD' : number,
  'userId' : UserId,
  'lastUpdated' : bigint,
  'fiatWallets' : Array<Wallet>,
  'defiPositions' : Array<DeFiPosition>,
}
export interface _SERVICE {
  'addEmergencyContact' : ActorMethod<[string, string, string], Result_63>,
  'addPaymentMethod' : ActorMethod<
    [string, [] | [string], [] | [string], string, boolean],
    Result_6
  >,
  'addRecoveryMethod' : ActorMethod<[string, string, [] | [string]], Result_1>,
  'addSecurityQuestions' : ActorMethod<[Array<[string, string]>], Result_62>,
  'awardGameReward' : ActorMethod<
    [string, UserId, string, number, [] | [string], string],
    Result_60
  >,
  'calculateDefiRewards' : ActorMethod<[string], Result_61>,
  'cancelPayment' : ActorMethod<[string], Result_17>,
  'claimGameReward' : ActorMethod<[string], Result_60>,
  'closeDefiPosition' : ActorMethod<[string], Result_9>,
  'completeRecovery' : ActorMethod<[string, [] | [string]], Result_59>,
  'completeRecoverySetup' : ActorMethod<[], Result_4>,
  'connectExternalWallet' : ActorMethod<
    [string, [] | [string], [] | [string], Array<string>],
    Result_58
  >,
  'createBudget' : ActorMethod<
    [string, string, number, string, bigint, bigint],
    Result_57
  >,
  'createCryptoTransaction' : ActorMethod<
    [
      string,
      string,
      number,
      [] | [string],
      [] | [string],
      [] | [string],
      number,
    ],
    Result_56
  >,
  'createCryptoWallet' : ActorMethod<
    [string, string, boolean, [] | [string], [] | [string]],
    Result_10
  >,
  'createDeFiPosition' : ActorMethod<
    [string, string, string, [] | [string], number, number],
    Result_9
  >,
  'createDefiPosition' : ActorMethod<
    [string, string, string, [] | [string], number, number],
    Result_9
  >,
  'createGoal' : ActorMethod<
    [string, string, number, string, [] | [bigint], string],
    Result_7
  >,
  'createGroupVault' : ActorMethod<
    [
      string,
      [] | [string],
      string,
      string,
      [] | [number],
      boolean,
      [] | [string],
    ],
    Result_55
  >,
  'createPlugin' : ActorMethod<
    [
      string,
      string,
      string,
      string,
      Array<string>,
      [] | [string],
      string,
      [] | [string],
    ],
    Result_16
  >,
  'createSocialGame' : ActorMethod<
    [
      string,
      string,
      string,
      bigint,
      [] | [bigint],
      [] | [bigint],
      [] | [number],
      number,
      string,
      [] | [string],
      boolean,
    ],
    Result_53
  >,
  'createTransaction' : ActorMethod<
    [string, string, number, string, string],
    Result_54
  >,
  'createUser' : ActorMethod<[string, string, [] | [string]], Result_4>,
  'createWallet' : ActorMethod<[string, string, string], Result_21>,
  'depositToVault' : ActorMethod<[string, number, [] | [string]], Result>,
  'endGame' : ActorMethod<[string], Result_53>,
  'generateAIInsights' : ActorMethod<[], Result_43>,
  'generateAIRecommendations' : ActorMethod<[], Result_42>,
  'generateDepositAddress' : ActorMethod<[string], Result_2>,
  'getAIAnalytics' : ActorMethod<[], Result_52>,
  'getAIConversationHistory' : ActorMethod<[], Result_51>,
  'getAvailableGames' : ActorMethod<[], Result_33>,
  'getAvailablePlugins' : ActorMethod<[], Result_14>,
  'getDashboardStats' : ActorMethod<[], Result_50>,
  'getDefiAnalytics' : ActorMethod<[], Result_49>,
  'getDefiPositionsByProductType' : ActorMethod<[string], Result_37>,
  'getDefiPositionsByProtocol' : ActorMethod<[string], Result_37>,
  'getDefiProtocolStats' : ActorMethod<[string], Result_48>,
  'getDefiTransactionsByProtocol' : ActorMethod<[string], Result_36>,
  'getDepositAddress' : ActorMethod<[string], Result_2>,
  'getDepositAddresses' : ActorMethod<[], Result_47>,
  'getFullWalletPortfolio' : ActorMethod<[], Result_46>,
  'getGameLeaderboard' : ActorMethod<[string], Result_45>,
  'getGamesByType' : ActorMethod<[string], Result_33>,
  'getPaymentStats' : ActorMethod<[], Result_44>,
  'getPaymentsByProvider' : ActorMethod<[string], Result_29>,
  'getPluginsByCategory' : ActorMethod<[string], Result_14>,
  'getPrincipalId' : ActorMethod<[], string>,
  'getRecoveryRequestStatus' : ActorMethod<[string], [] | [RecoveryRequest]>,
  'getSystemStats' : ActorMethod<
    [],
    {
      'totalExternalConnections' : bigint,
      'totalWallets' : bigint,
      'totalCryptoWallets' : bigint,
      'totalRecoveryRequests' : bigint,
      'totalOTPRequests' : bigint,
      'totalCryptoTransactions' : bigint,
      'totalUsers' : bigint,
      'totalRecoveryMethods' : bigint,
      'totalTransactions' : bigint,
      'totalDeFiPositions' : bigint,
    }
  >,
  'getUser' : ActorMethod<[], Result_4>,
  'getUserAIInsights' : ActorMethod<[], Result_43>,
  'getUserAIRecommendations' : ActorMethod<[], Result_42>,
  'getUserAuditLogs' : ActorMethod<[], Result_41>,
  'getUserBudgets' : ActorMethod<[], Result_40>,
  'getUserByEmail' : ActorMethod<[string], [] | [UserId]>,
  'getUserByPhone' : ActorMethod<[string], [] | [UserId]>,
  'getUserCryptoTransactions' : ActorMethod<[], Result_39>,
  'getUserCryptoWallets' : ActorMethod<[], Result_38>,
  'getUserDeFiPositions' : ActorMethod<[], Result_37>,
  'getUserDefiPositions' : ActorMethod<[], Result_37>,
  'getUserDefiTransactions' : ActorMethod<[], Result_36>,
  'getUserExternalConnections' : ActorMethod<[], Result_35>,
  'getUserGameRewards' : ActorMethod<[], Result_34>,
  'getUserGames' : ActorMethod<[], Result_33>,
  'getUserGoals' : ActorMethod<[], Result_32>,
  'getUserGroupVaults' : ActorMethod<[], Result_31>,
  'getUserOTPRequests' : ActorMethod<[], Result_30>,
  'getUserPaymentHistory' : ActorMethod<[], Result_29>,
  'getUserPaymentMethods' : ActorMethod<[], Result_28>,
  'getUserPlugins' : ActorMethod<[], Result_27>,
  'getUserRecoveryMethods' : ActorMethod<[], Result_26>,
  'getUserTransactions' : ActorMethod<[], Result_25>,
  'getUserWalletAddresses' : ActorMethod<[], Result_24>,
  'getUserWallets' : ActorMethod<[], Result_23>,
  'getVaultDetails' : ActorMethod<[string], Result_22>,
  'getWallet' : ActorMethod<[string], Result_21>,
  'getWalletByAddress' : ActorMethod<[string], [] | [string]>,
  'greet' : ActorMethod<[string], string>,
  'initiateLocalPayment' : ActorMethod<
    [
      string,
      string,
      number,
      string,
      [] | [string],
      [] | [string],
      [] | [string],
    ],
    Result_17
  >,
  'initiateRecovery' : ActorMethod<[string, string], Result_20>,
  'installPlugin' : ActorMethod<[string, [] | [string]], Result_5>,
  'inviteToVault' : ActorMethod<[string, UserId, string], Result_19>,
  'joinGame' : ActorMethod<[string], Result_8>,
  'joinVault' : ActorMethod<[string], Result_19>,
  'linkRecoveredAccount' : ActorMethod<[string, Principal], Result_4>,
  'loginOrCreateUser' : ActorMethod<[], Result_4>,
  'markRecommendationImplemented' : ActorMethod<[string], Result_18>,
  'processPayment' : ActorMethod<[string], Result_17>,
  'ratePlugin' : ActorMethod<[string, number], Result_16>,
  'recordDefiTransaction' : ActorMethod<
    [
      string,
      string,
      string,
      [] | [string],
      number,
      [] | [number],
      number,
      [] | [string],
    ],
    Result_15
  >,
  'regenerateWalletAddress' : ActorMethod<[string], Result_2>,
  'removePaymentMethod' : ActorMethod<[string], Result_11>,
  'searchPlugins' : ActorMethod<[string], Result_14>,
  'sendAIMessage' : ActorMethod<[string], Result_13>,
  'sendOTP' : ActorMethod<[string, string, string, string], Result_12>,
  'sendVerificationCode' : ActorMethod<[string, string], Result_2>,
  'togglePlugin' : ActorMethod<[string, boolean], Result_5>,
  'uninstallPlugin' : ActorMethod<[string], Result_11>,
  'updateCryptoWalletBalance' : ActorMethod<[string, number], Result_10>,
  'updateDefiPosition' : ActorMethod<
    [string, number, number, number],
    Result_9
  >,
  'updateGameScore' : ActorMethod<[string, number], Result_8>,
  'updateGoalProgress' : ActorMethod<[string, number], Result_7>,
  'updatePaymentMethod' : ActorMethod<
    [string, [] | [string], [] | [string], string, boolean],
    Result_6
  >,
  'updatePluginConfig' : ActorMethod<[string, string], Result_5>,
  'updateUser' : ActorMethod<[[] | [string], [] | [string]], Result_4>,
  'userExists' : ActorMethod<[], boolean>,
  'validateAddress' : ActorMethod<[string, string], boolean>,
  'verifyCode' : ActorMethod<[string, string, string], Result_2>,
  'verifyOTP' : ActorMethod<[string, string], Result_3>,
  'verifyRecovery' : ActorMethod<
    [string, [] | [string], [] | [Array<[string, string]>]],
    Result_2
  >,
  'verifyRecoveryMethod' : ActorMethod<[string, string, string], Result_1>,
  'withdrawFromVault' : ActorMethod<[string, number, [] | [string]], Result>,
}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
