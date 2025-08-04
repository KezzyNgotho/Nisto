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
export interface ChatMember {
  'userName' : string,
  'typingSince' : [] | [bigint],
  'lastSeenAt' : bigint,
  'userId' : UserId,
  'joinedAt' : bigint,
  'role' : string,
  'unreadCount' : bigint,
  'isMuted' : boolean,
  'isTyping' : boolean,
}
export interface ChatNotification {
  'id' : string,
  'title' : string,
  'metadata' : [] | [string],
  'body' : string,
  'userId' : UserId,
  'notificationType' : string,
  'isRead' : boolean,
  'vaultId' : string,
  'timestamp' : bigint,
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
export interface MessageReaction {
  'userId' : UserId,
  'timestamp' : bigint,
  'reaction' : string,
}
export type MessageStatus = { 'Failed' : null } |
  { 'Read' : null } |
  { 'Sent' : null } |
  { 'Delivered' : null };
export type MessageType = { 'System' : null } |
  { 'File' : null } |
  { 'Transaction' : null } |
  { 'Text' : null } |
  { 'Image' : null } |
  { 'Reaction' : null };
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
export type Result_11 = { 'ok' : VaultMessage } |
  { 'err' : string };
export type Result_12 = {
    'ok' : { 'expiresIn' : bigint, 'otpId' : string, 'message' : string }
  } |
  { 'err' : string };
export type Result_13 = { 'ok' : AIMessage } |
  { 'err' : string };
export type Result_14 = { 'ok' : DeFiTransaction } |
  { 'err' : string };
export type Result_15 = { 'ok' : LocalPayment } |
  { 'err' : string };
export type Result_16 = { 'ok' : AIRecommendation } |
  { 'err' : string };
export type Result_17 = { 'ok' : VaultMember } |
  { 'err' : string };
export type Result_18 = {
    'ok' : {
      'recoveryRequestId' : string,
      'message' : string,
      'securityQuestions' : [] | [Array<[string, string]>],
    }
  } |
  { 'err' : string };
export type Result_19 = { 'ok' : Wallet } |
  { 'err' : string };
export type Result_2 = { 'ok' : string } |
  { 'err' : string };
export type Result_20 = { 'ok' : Array<VaultMessage> } |
  { 'err' : string };
export type Result_21 = {
    'ok' : {
      'members' : Array<VaultMember>,
      'vault' : GroupVault,
      'transactions' : Array<VaultTransaction>,
    }
  } |
  { 'err' : string };
export type Result_22 = { 'ok' : Array<ChatMember> } |
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
export type Result_27 = { 'ok' : Array<PaymentMethod> } |
  { 'err' : string };
export type Result_28 = { 'ok' : Array<LocalPayment> } |
  { 'err' : string };
export type Result_29 = { 'ok' : Array<OTPRequest> } |
  { 'err' : string };
export type Result_3 = {
    'ok' : { 'verified' : boolean, 'recipient' : string, 'purpose' : string }
  } |
  { 'err' : string };
export type Result_30 = { 'ok' : Array<GroupVault> } |
  { 'err' : string };
export type Result_31 = { 'ok' : Array<Goal> } |
  { 'err' : string };
export type Result_32 = { 'ok' : Array<SocialGame> } |
  { 'err' : string };
export type Result_33 = { 'ok' : Array<GameReward> } |
  { 'err' : string };
export type Result_34 = { 'ok' : Array<ExternalWalletConnection> } |
  { 'err' : string };
export type Result_35 = { 'ok' : Array<DeFiTransaction> } |
  { 'err' : string };
export type Result_36 = { 'ok' : Array<DeFiPosition> } |
  { 'err' : string };
export type Result_37 = { 'ok' : Array<CryptoWallet> } |
  { 'err' : string };
export type Result_38 = { 'ok' : Array<CryptoTransaction> } |
  { 'err' : string };
export type Result_39 = { 'ok' : Array<ChatNotification> } |
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
export type Result_44 = { 'ok' : Array<TypingIndicator> } |
  { 'err' : string };
export type Result_45 = {
    'ok' : {
      'topProvider' : [] | [string],
      'successRate' : number,
      'totalFees' : number,
      'totalPayments' : bigint,
      'totalAmount' : number,
    }
  } |
  { 'err' : string };
export type Result_46 = { 'ok' : Array<GameParticipant> } |
  { 'err' : string };
export type Result_47 = { 'ok' : WalletPortfolio } |
  { 'err' : string };
export type Result_48 = { 'ok' : Array<[string, string]> } |
  { 'err' : string };
export type Result_49 = {
    'ok' : {
      'totalVolume' : number,
      'averageApy' : number,
      'totalPositions' : bigint,
      'totalUsers' : bigint,
    }
  } |
  { 'err' : string };
export type Result_5 = { 'ok' : boolean } |
  { 'err' : string };
export type Result_50 = {
    'ok' : {
      'totalValue' : number,
      'totalRewards' : number,
      'averageApy' : number,
      'activeProtocols' : Array<string>,
      'totalPositions' : bigint,
    }
  } |
  { 'err' : string };
export type Result_51 = {
    'ok' : {
      'activeWallets' : bigint,
      'monthlySpent' : number,
      'goalsProgress' : number,
      'totalBalance' : number,
    }
  } |
  { 'err' : string };
export type Result_52 = { 'ok' : Array<AIMessage> } |
  { 'err' : string };
export type Result_53 = {
    'ok' : {
      'implementedRecommendations' : bigint,
      'totalRecommendations' : bigint,
      'totalInsights' : bigint,
      'averageConfidence' : number,
      'totalMessages' : bigint,
    }
  } |
  { 'err' : string };
export type Result_54 = { 'ok' : SocialGame } |
  { 'err' : string };
export type Result_55 = { 'ok' : VaultChatRoom } |
  { 'err' : string };
export type Result_56 = { 'ok' : Transaction } |
  { 'err' : string };
export type Result_57 = { 'ok' : GroupVault } |
  { 'err' : string };
export type Result_58 = { 'ok' : CryptoTransaction } |
  { 'err' : string };
export type Result_59 = { 'ok' : Budget } |
  { 'err' : string };
export type Result_6 = { 'ok' : PaymentMethod } |
  { 'err' : string };
export type Result_60 = { 'ok' : ExternalWalletConnection } |
  { 'err' : string };
export type Result_61 = {
    'ok' : { 'userId' : Principal, 'instructions' : string }
  } |
  { 'err' : string };
export type Result_62 = { 'ok' : bigint } |
  { 'err' : string };
export type Result_63 = { 'ok' : GameReward } |
  { 'err' : string };
export type Result_64 = { 'ok' : number } |
  { 'err' : string };
export type Result_65 = { 'ok' : Array<SecurityQuestion> } |
  { 'err' : string };
export type Result_66 = { 'ok' : Plugin } |
  { 'err' : string };
export type Result_67 = { 'ok' : EmergencyContact } |
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
export interface StakingInfo {
  'lastRewardTime' : bigint,
  'isStaking' : boolean,
  'userId' : UserId,
  'stakingStartTime' : bigint,
  'totalRewardsEarned' : bigint,
  'stakedAmount' : bigint,
}
export interface TokenBalance {
  'balance' : bigint,
  'owner' : UserId,
  'lastUpdated' : bigint,
  'lockedBalance' : bigint,
  'stakedBalance' : bigint,
}
export interface TokenBurn {
  'id' : string,
  'blockNumber' : bigint,
  'from' : UserId,
  'timestamp' : bigint,
  'amount' : bigint,
  'reason' : string,
}
export interface TokenMetadata {
  'decimals' : number,
  'burnAddress' : UserId,
  'circulatingSupply' : bigint,
  'isPaused' : boolean,
  'name' : string,
  'createdAt' : bigint,
  'totalSupply' : bigint,
  'updatedAt' : bigint,
  'maxWalletLimit' : bigint,
  'maxTransactionLimit' : bigint,
  'treasuryAddress' : UserId,
  'symbol' : string,
}
export interface TokenMint {
  'id' : string,
  'to' : UserId,
  'blockNumber' : bigint,
  'timestamp' : bigint,
  'amount' : bigint,
  'reason' : string,
}
export interface TokenTransfer {
  'id' : string,
  'to' : UserId,
  'transactionHash' : string,
  'blockNumber' : bigint,
  'from' : UserId,
  'timestamp' : bigint,
  'amount' : bigint,
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
export interface TypingIndicator {
  'userName' : string,
  'startedAt' : bigint,
  'userId' : UserId,
  'isTyping' : boolean,
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
export interface VaultChatRoom {
  'id' : string,
  'lastMessageAt' : [] | [bigint],
  'metadata' : [] | [string],
  'name' : string,
  'createdAt' : bigint,
  'memberCount' : bigint,
  'description' : [] | [string],
  'isActive' : boolean,
  'updatedAt' : bigint,
  'vaultId' : string,
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
export interface VaultMessage {
  'id' : string,
  'status' : MessageStatus,
  'userName' : string,
  'content' : string,
  'metadata' : [] | [string],
  'userId' : UserId,
  'messageType' : MessageType,
  'vaultId' : string,
  'timestamp' : bigint,
  'replyTo' : [] | [string],
  'editedAt' : [] | [bigint],
  'reactions' : Array<MessageReaction>,
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
  'addEmergencyContact' : ActorMethod<[string, string, string], Result_67>,
  'addPaymentMethod' : ActorMethod<
    [string, [] | [string], [] | [string], string, boolean],
    Result_6
  >,
  'addPlugin' : ActorMethod<[Plugin], Result_66>,
  'addRecoveryMethod' : ActorMethod<[string, string, [] | [string]], Result_1>,
  'addSecurityQuestions' : ActorMethod<[Array<[string, string]>], Result_65>,
  'allowance' : ActorMethod<[UserId, UserId], bigint>,
  'approve' : ActorMethod<[UserId, bigint], Result_5>,
  'awardGameReward' : ActorMethod<
    [string, UserId, string, number, [] | [string], string],
    Result_63
  >,
  'balanceOf' : ActorMethod<[UserId], bigint>,
  'burn' : ActorMethod<[bigint, string], Result_5>,
  'calculateDefiRewards' : ActorMethod<[string], Result_64>,
  'cancelPayment' : ActorMethod<[string], Result_15>,
  'claimGameReward' : ActorMethod<[string], Result_63>,
  'claimRewards' : ActorMethod<[], Result_62>,
  'closeDefiPosition' : ActorMethod<[string], Result_9>,
  'completeRecovery' : ActorMethod<[string, [] | [string]], Result_61>,
  'completeRecoverySetup' : ActorMethod<[], Result_4>,
  'connectExternalWallet' : ActorMethod<
    [string, [] | [string], [] | [string], Array<string>],
    Result_60
  >,
  'createBudget' : ActorMethod<
    [string, string, number, string, bigint, bigint],
    Result_59
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
    Result_58
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
    Result_57
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
    Result_54
  >,
  'createTransaction' : ActorMethod<
    [string, string, number, string, string],
    Result_56
  >,
  'createUser' : ActorMethod<[string, string, [] | [string]], Result_4>,
  'createVaultChatRoom' : ActorMethod<
    [string, string, [] | [string]],
    Result_55
  >,
  'createWallet' : ActorMethod<[string, string, string], Result_19>,
  'depositToVault' : ActorMethod<[string, number, [] | [string]], Result>,
  'endGame' : ActorMethod<[string], Result_54>,
  'generateAIInsights' : ActorMethod<[], Result_43>,
  'generateAIRecommendations' : ActorMethod<[], Result_42>,
  'generateDepositAddress' : ActorMethod<[string], Result_2>,
  'getAIAnalytics' : ActorMethod<[], Result_53>,
  'getAIConversationHistory' : ActorMethod<[], Result_52>,
  'getAvailableGames' : ActorMethod<[], Result_32>,
  'getBurnHistory' : ActorMethod<[bigint, bigint], Array<TokenBurn>>,
  'getDashboardStats' : ActorMethod<[], Result_51>,
  'getDefiAnalytics' : ActorMethod<[], Result_50>,
  'getDefiPositionsByProductType' : ActorMethod<[string], Result_36>,
  'getDefiPositionsByProtocol' : ActorMethod<[string], Result_36>,
  'getDefiProtocolStats' : ActorMethod<[string], Result_49>,
  'getDefiTransactionsByProtocol' : ActorMethod<[string], Result_35>,
  'getDepositAddress' : ActorMethod<[string], Result_2>,
  'getDepositAddresses' : ActorMethod<[], Result_48>,
  'getFullWalletPortfolio' : ActorMethod<[], Result_47>,
  'getGameLeaderboard' : ActorMethod<[string], Result_46>,
  'getGamesByType' : ActorMethod<[string], Result_32>,
  'getMintHistory' : ActorMethod<[bigint, bigint], Array<TokenMint>>,
  'getPaymentStats' : ActorMethod<[], Result_45>,
  'getPaymentsByProvider' : ActorMethod<[string], Result_28>,
  'getPrincipalId' : ActorMethod<[], string>,
  'getRecoveryRequestStatus' : ActorMethod<[string], [] | [RecoveryRequest]>,
  'getStakingInfo' : ActorMethod<[UserId], [] | [StakingInfo]>,
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
  'getTokenMetadata' : ActorMethod<[], TokenMetadata>,
  'getTotalBalance' : ActorMethod<[UserId], TokenBalance>,
  'getTotalStaked' : ActorMethod<[], bigint>,
  'getTransferHistory' : ActorMethod<[bigint, bigint], Array<TokenTransfer>>,
  'getTypingIndicators' : ActorMethod<[string], Result_44>,
  'getUser' : ActorMethod<[], Result_4>,
  'getUserAIInsights' : ActorMethod<[], Result_43>,
  'getUserAIRecommendations' : ActorMethod<[], Result_42>,
  'getUserAuditLogs' : ActorMethod<[], Result_41>,
  'getUserBudgets' : ActorMethod<[], Result_40>,
  'getUserByEmail' : ActorMethod<[string], [] | [UserId]>,
  'getUserByPhone' : ActorMethod<[string], [] | [UserId]>,
  'getUserChatNotifications' : ActorMethod<[bigint, bigint], Result_39>,
  'getUserCryptoTransactions' : ActorMethod<[], Result_38>,
  'getUserCryptoWallets' : ActorMethod<[], Result_37>,
  'getUserDeFiPositions' : ActorMethod<[], Result_36>,
  'getUserDefiPositions' : ActorMethod<[], Result_36>,
  'getUserDefiTransactions' : ActorMethod<[], Result_35>,
  'getUserExternalConnections' : ActorMethod<[], Result_34>,
  'getUserGameRewards' : ActorMethod<[], Result_33>,
  'getUserGames' : ActorMethod<[], Result_32>,
  'getUserGoals' : ActorMethod<[], Result_31>,
  'getUserGroupVaults' : ActorMethod<[], Result_30>,
  'getUserOTPRequests' : ActorMethod<[], Result_29>,
  'getUserPaymentHistory' : ActorMethod<[], Result_28>,
  'getUserPaymentMethods' : ActorMethod<[], Result_27>,
  'getUserRecoveryMethods' : ActorMethod<[], Result_26>,
  'getUserTransactions' : ActorMethod<[], Result_25>,
  'getUserWalletAddresses' : ActorMethod<[], Result_24>,
  'getUserWallets' : ActorMethod<[], Result_23>,
  'getVaultChatMembers' : ActorMethod<[string], Result_22>,
  'getVaultDetails' : ActorMethod<[string], Result_21>,
  'getVaultMessages' : ActorMethod<[string, bigint, bigint], Result_20>,
  'getWallet' : ActorMethod<[string], Result_19>,
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
    Result_15
  >,
  'initiateRecovery' : ActorMethod<[string, string], Result_18>,
  'inviteToVault' : ActorMethod<[string, UserId, string], Result_17>,
  'joinGame' : ActorMethod<[string], Result_8>,
  'joinVault' : ActorMethod<[string], Result_17>,
  'joinVaultChat' : ActorMethod<[string, string], Result_5>,
  'leaveVaultChat' : ActorMethod<[string], Result_5>,
  'linkRecoveredAccount' : ActorMethod<[string, Principal], Result_4>,
  'loginOrCreateUser' : ActorMethod<[], Result_4>,
  'markMessagesAsRead' : ActorMethod<[string, Array<string>], Result_5>,
  'markRecommendationImplemented' : ActorMethod<[string], Result_16>,
  'mint' : ActorMethod<[UserId, bigint, string], Result_5>,
  'processPayment' : ActorMethod<[string], Result_15>,
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
    Result_14
  >,
  'regenerateWalletAddress' : ActorMethod<[string], Result_2>,
  'removePaymentMethod' : ActorMethod<[string], Result_5>,
  'sendAIMessage' : ActorMethod<[string], Result_13>,
  'sendOTP' : ActorMethod<[string, string, string, string], Result_12>,
  'sendVaultMessage' : ActorMethod<
    [string, string, MessageType, [] | [string]],
    Result_11
  >,
  'sendVerificationCode' : ActorMethod<[string, string], Result_2>,
  'setPaused' : ActorMethod<[boolean], Result_5>,
  'setStakingRewardRate' : ActorMethod<[number], Result_5>,
  'setTransactionLimits' : ActorMethod<[bigint, bigint], Result_5>,
  'setTreasuryAddress' : ActorMethod<[UserId], Result_5>,
  'stake' : ActorMethod<[bigint], Result_5>,
  'transfer' : ActorMethod<[UserId, bigint], Result_5>,
  'transferFrom' : ActorMethod<[UserId, UserId, bigint], Result_5>,
  'unstake' : ActorMethod<[bigint], Result_5>,
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
  'updateTypingStatus' : ActorMethod<[string, boolean], Result_5>,
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
