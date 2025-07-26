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
export type Result_10 = {
    'ok' : { 'expiresIn' : bigint, 'otpId' : string, 'message' : string }
  } |
  { 'err' : string };
export type Result_11 = { 'ok' : AIMessage } |
  { 'err' : string };
export type Result_12 = { 'ok' : boolean } |
  { 'err' : string };
export type Result_13 = { 'ok' : DeFiTransaction } |
  { 'err' : string };
export type Result_14 = { 'ok' : LocalPayment } |
  { 'err' : string };
export type Result_15 = { 'ok' : AIRecommendation } |
  { 'err' : string };
export type Result_16 = { 'ok' : VaultMember } |
  { 'err' : string };
export type Result_17 = {
    'ok' : {
      'recoveryRequestId' : string,
      'message' : string,
      'securityQuestions' : [] | [Array<[string, string]>],
    }
  } |
  { 'err' : string };
export type Result_18 = { 'ok' : Wallet } |
  { 'err' : string };
export type Result_19 = {
    'ok' : {
      'members' : Array<VaultMember>,
      'vault' : GroupVault,
      'transactions' : Array<VaultTransaction>,
    }
  } |
  { 'err' : string };
export type Result_2 = { 'ok' : string } |
  { 'err' : string };
export type Result_20 = { 'ok' : Array<Wallet> } |
  { 'err' : string };
export type Result_21 = {
    'ok' : {
      'allAddresses' : Array<string>,
      'principalId' : string,
      'accountIdentifier' : string,
      'cryptoAddresses' : Array<[string, string]>,
    }
  } |
  { 'err' : string };
export type Result_22 = { 'ok' : Array<Transaction> } |
  { 'err' : string };
export type Result_23 = { 'ok' : Array<RecoveryMethod> } |
  { 'err' : string };
export type Result_24 = { 'ok' : Array<PaymentMethod> } |
  { 'err' : string };
export type Result_25 = { 'ok' : Array<LocalPayment> } |
  { 'err' : string };
export type Result_26 = { 'ok' : Array<OTPRequest> } |
  { 'err' : string };
export type Result_27 = { 'ok' : Array<GroupVault> } |
  { 'err' : string };
export type Result_28 = { 'ok' : Array<Goal> } |
  { 'err' : string };
export type Result_29 = { 'ok' : Array<SocialGame> } |
  { 'err' : string };
export type Result_3 = {
    'ok' : { 'verified' : boolean, 'recipient' : string, 'purpose' : string }
  } |
  { 'err' : string };
export type Result_30 = { 'ok' : Array<GameReward> } |
  { 'err' : string };
export type Result_31 = { 'ok' : Array<ExternalWalletConnection> } |
  { 'err' : string };
export type Result_32 = { 'ok' : Array<DeFiTransaction> } |
  { 'err' : string };
export type Result_33 = { 'ok' : Array<DeFiPosition> } |
  { 'err' : string };
export type Result_34 = { 'ok' : Array<CryptoWallet> } |
  { 'err' : string };
export type Result_35 = { 'ok' : Array<CryptoTransaction> } |
  { 'err' : string };
export type Result_36 = { 'ok' : Array<Budget> } |
  { 'err' : string };
export type Result_37 = { 'ok' : Array<AuditLog> } |
  { 'err' : string };
export type Result_38 = { 'ok' : Array<AIRecommendation> } |
  { 'err' : string };
export type Result_39 = { 'ok' : Array<AIInsight> } |
  { 'err' : string };
export type Result_4 = { 'ok' : User } |
  { 'err' : string };
export type Result_40 = {
    'ok' : {
      'topProvider' : [] | [string],
      'successRate' : number,
      'totalFees' : number,
      'totalPayments' : bigint,
      'totalAmount' : number,
    }
  } |
  { 'err' : string };
export type Result_41 = { 'ok' : Array<GameParticipant> } |
  { 'err' : string };
export type Result_42 = { 'ok' : WalletPortfolio } |
  { 'err' : string };
export type Result_43 = { 'ok' : Array<[string, string]> } |
  { 'err' : string };
export type Result_44 = {
    'ok' : {
      'totalVolume' : number,
      'averageApy' : number,
      'totalPositions' : bigint,
      'totalUsers' : bigint,
    }
  } |
  { 'err' : string };
export type Result_45 = {
    'ok' : {
      'totalValue' : number,
      'totalRewards' : number,
      'averageApy' : number,
      'activeProtocols' : Array<string>,
      'totalPositions' : bigint,
    }
  } |
  { 'err' : string };
export type Result_46 = {
    'ok' : {
      'activeWallets' : bigint,
      'monthlySpent' : number,
      'goalsProgress' : number,
      'totalBalance' : number,
    }
  } |
  { 'err' : string };
export type Result_47 = { 'ok' : Array<AIMessage> } |
  { 'err' : string };
export type Result_48 = {
    'ok' : {
      'implementedRecommendations' : bigint,
      'totalRecommendations' : bigint,
      'totalInsights' : bigint,
      'averageConfidence' : number,
      'totalMessages' : bigint,
    }
  } |
  { 'err' : string };
export type Result_49 = { 'ok' : SocialGame } |
  { 'err' : string };
export type Result_5 = { 'ok' : PaymentMethod } |
  { 'err' : string };
export type Result_50 = { 'ok' : Transaction } |
  { 'err' : string };
export type Result_51 = { 'ok' : GroupVault } |
  { 'err' : string };
export type Result_52 = { 'ok' : CryptoTransaction } |
  { 'err' : string };
export type Result_53 = { 'ok' : Budget } |
  { 'err' : string };
export type Result_54 = { 'ok' : ExternalWalletConnection } |
  { 'err' : string };
export type Result_55 = {
    'ok' : { 'userId' : Principal, 'instructions' : string }
  } |
  { 'err' : string };
export type Result_56 = { 'ok' : GameReward } |
  { 'err' : string };
export type Result_57 = { 'ok' : number } |
  { 'err' : string };
export type Result_58 = { 'ok' : Array<SecurityQuestion> } |
  { 'err' : string };
export type Result_59 = { 'ok' : Plugin } |
  { 'err' : string };
export type Result_6 = { 'ok' : Goal } |
  { 'err' : string };
export type Result_60 = { 'ok' : EmergencyContact } |
  { 'err' : string };
export type Result_7 = { 'ok' : GameParticipant } |
  { 'err' : string };
export type Result_8 = { 'ok' : DeFiPosition } |
  { 'err' : string };
export type Result_9 = { 'ok' : CryptoWallet } |
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
  'addEmergencyContact' : ActorMethod<[string, string, string], Result_60>,
  'addPaymentMethod' : ActorMethod<
    [string, [] | [string], [] | [string], string, boolean],
    Result_5
  >,
  'addPlugin' : ActorMethod<[Plugin], Result_59>,
  'addRecoveryMethod' : ActorMethod<[string, string, [] | [string]], Result_1>,
  'addSecurityQuestions' : ActorMethod<[Array<[string, string]>], Result_58>,
  'awardGameReward' : ActorMethod<
    [string, UserId, string, number, [] | [string], string],
    Result_56
  >,
  'calculateDefiRewards' : ActorMethod<[string], Result_57>,
  'cancelPayment' : ActorMethod<[string], Result_14>,
  'claimGameReward' : ActorMethod<[string], Result_56>,
  'closeDefiPosition' : ActorMethod<[string], Result_8>,
  'completeRecovery' : ActorMethod<[string, [] | [string]], Result_55>,
  'completeRecoverySetup' : ActorMethod<[], Result_4>,
  'connectExternalWallet' : ActorMethod<
    [string, [] | [string], [] | [string], Array<string>],
    Result_54
  >,
  'createBudget' : ActorMethod<
    [string, string, number, string, bigint, bigint],
    Result_53
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
    Result_52
  >,
  'createCryptoWallet' : ActorMethod<
    [string, string, boolean, [] | [string], [] | [string]],
    Result_9
  >,
  'createDeFiPosition' : ActorMethod<
    [string, string, string, [] | [string], number, number],
    Result_8
  >,
  'createDefiPosition' : ActorMethod<
    [string, string, string, [] | [string], number, number],
    Result_8
  >,
  'createGoal' : ActorMethod<
    [string, string, number, string, [] | [bigint], string],
    Result_6
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
    Result_51
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
    Result_49
  >,
  'createTransaction' : ActorMethod<
    [string, string, number, string, string],
    Result_50
  >,
  'createUser' : ActorMethod<[string, string, [] | [string]], Result_4>,
  'createWallet' : ActorMethod<[string, string, string], Result_18>,
  'depositToVault' : ActorMethod<[string, number, [] | [string]], Result>,
  'endGame' : ActorMethod<[string], Result_49>,
  'generateAIInsights' : ActorMethod<[], Result_39>,
  'generateAIRecommendations' : ActorMethod<[], Result_38>,
  'generateDepositAddress' : ActorMethod<[string], Result_2>,
  'getAIAnalytics' : ActorMethod<[], Result_48>,
  'getAIConversationHistory' : ActorMethod<[], Result_47>,
  'getAvailableGames' : ActorMethod<[], Result_29>,
  'getDashboardStats' : ActorMethod<[], Result_46>,
  'getDefiAnalytics' : ActorMethod<[], Result_45>,
  'getDefiPositionsByProductType' : ActorMethod<[string], Result_33>,
  'getDefiPositionsByProtocol' : ActorMethod<[string], Result_33>,
  'getDefiProtocolStats' : ActorMethod<[string], Result_44>,
  'getDefiTransactionsByProtocol' : ActorMethod<[string], Result_32>,
  'getDepositAddress' : ActorMethod<[string], Result_2>,
  'getDepositAddresses' : ActorMethod<[], Result_43>,
  'getFullWalletPortfolio' : ActorMethod<[], Result_42>,
  'getGameLeaderboard' : ActorMethod<[string], Result_41>,
  'getGamesByType' : ActorMethod<[string], Result_29>,
  'getPaymentStats' : ActorMethod<[], Result_40>,
  'getPaymentsByProvider' : ActorMethod<[string], Result_25>,
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
  'getUserAIInsights' : ActorMethod<[], Result_39>,
  'getUserAIRecommendations' : ActorMethod<[], Result_38>,
  'getUserAuditLogs' : ActorMethod<[], Result_37>,
  'getUserBudgets' : ActorMethod<[], Result_36>,
  'getUserByEmail' : ActorMethod<[string], [] | [UserId]>,
  'getUserByPhone' : ActorMethod<[string], [] | [UserId]>,
  'getUserCryptoTransactions' : ActorMethod<[], Result_35>,
  'getUserCryptoWallets' : ActorMethod<[], Result_34>,
  'getUserDeFiPositions' : ActorMethod<[], Result_33>,
  'getUserDefiPositions' : ActorMethod<[], Result_33>,
  'getUserDefiTransactions' : ActorMethod<[], Result_32>,
  'getUserExternalConnections' : ActorMethod<[], Result_31>,
  'getUserGameRewards' : ActorMethod<[], Result_30>,
  'getUserGames' : ActorMethod<[], Result_29>,
  'getUserGoals' : ActorMethod<[], Result_28>,
  'getUserGroupVaults' : ActorMethod<[], Result_27>,
  'getUserOTPRequests' : ActorMethod<[], Result_26>,
  'getUserPaymentHistory' : ActorMethod<[], Result_25>,
  'getUserPaymentMethods' : ActorMethod<[], Result_24>,
  'getUserRecoveryMethods' : ActorMethod<[], Result_23>,
  'getUserTransactions' : ActorMethod<[], Result_22>,
  'getUserWalletAddresses' : ActorMethod<[], Result_21>,
  'getUserWallets' : ActorMethod<[], Result_20>,
  'getVaultDetails' : ActorMethod<[string], Result_19>,
  'getWallet' : ActorMethod<[string], Result_18>,
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
    Result_14
  >,
  'initiateRecovery' : ActorMethod<[string, string], Result_17>,
  'inviteToVault' : ActorMethod<[string, UserId, string], Result_16>,
  'joinGame' : ActorMethod<[string], Result_7>,
  'joinVault' : ActorMethod<[string], Result_16>,
  'linkRecoveredAccount' : ActorMethod<[string, Principal], Result_4>,
  'loginOrCreateUser' : ActorMethod<[], Result_4>,
  'markRecommendationImplemented' : ActorMethod<[string], Result_15>,
  'processPayment' : ActorMethod<[string], Result_14>,
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
    Result_13
  >,
  'regenerateWalletAddress' : ActorMethod<[string], Result_2>,
  'removePaymentMethod' : ActorMethod<[string], Result_12>,
  'sendAIMessage' : ActorMethod<[string], Result_11>,
  'sendOTP' : ActorMethod<[string, string, string, string], Result_10>,
  'sendVerificationCode' : ActorMethod<[string, string], Result_2>,
  'updateCryptoWalletBalance' : ActorMethod<[string, number], Result_9>,
  'updateDefiPosition' : ActorMethod<
    [string, number, number, number],
    Result_8
  >,
  'updateGameScore' : ActorMethod<[string, number], Result_7>,
  'updateGoalProgress' : ActorMethod<[string, number], Result_6>,
  'updatePaymentMethod' : ActorMethod<
    [string, [] | [string], [] | [string], string, boolean],
    Result_5
  >,
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
