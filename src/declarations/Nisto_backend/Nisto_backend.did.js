export const idlFactory = ({ IDL }) => {
  const UserId = IDL.Principal;
  const EmergencyContact = IDL.Record({
    'id' : IDL.Text,
    'relationship' : IDL.Text,
    'userId' : UserId,
    'name' : IDL.Text,
    'createdAt' : IDL.Int,
    'email' : IDL.Text,
    'isVerified' : IDL.Bool,
    'verifiedAt' : IDL.Opt(IDL.Int),
  });
  const Result_63 = IDL.Variant({ 'ok' : EmergencyContact, 'err' : IDL.Text });
  const PaymentProvider = IDL.Variant({
    'Equitel' : IDL.Null,
    'PayPal' : IDL.Null,
    'Card' : IDL.Null,
    'BankTransfer' : IDL.Null,
    'Custom' : IDL.Null,
    'Mpesa' : IDL.Null,
    'AirtelMoney' : IDL.Null,
  });
  const PaymentMethod = IDL.Record({
    'id' : IDL.Text,
    'provider' : PaymentProvider,
    'metadata' : IDL.Opt(IDL.Text),
    'userId' : UserId,
    'createdAt' : IDL.Int,
    'isActive' : IDL.Bool,
    'accountName' : IDL.Text,
    'isDefault' : IDL.Bool,
    'accountNumber' : IDL.Opt(IDL.Text),
    'phoneNumber' : IDL.Opt(IDL.Text),
  });
  const Result_6 = IDL.Variant({ 'ok' : PaymentMethod, 'err' : IDL.Text });
  const RecoveryMethod = IDL.Record({
    'id' : IDL.Text,
    'methodType' : IDL.Text,
    'value' : IDL.Text,
    'metadata' : IDL.Opt(IDL.Text),
    'userId' : UserId,
    'createdAt' : IDL.Int,
    'isActive' : IDL.Bool,
    'isVerified' : IDL.Bool,
    'verifiedAt' : IDL.Opt(IDL.Int),
  });
  const Result_1 = IDL.Variant({ 'ok' : RecoveryMethod, 'err' : IDL.Text });
  const SecurityQuestion = IDL.Record({
    'id' : IDL.Text,
    'question' : IDL.Text,
    'userId' : UserId,
    'createdAt' : IDL.Int,
    'isActive' : IDL.Bool,
    'answerHash' : IDL.Text,
  });
  const Result_62 = IDL.Variant({
    'ok' : IDL.Vec(SecurityQuestion),
    'err' : IDL.Text,
  });
  const GameReward = IDL.Record({
    'id' : IDL.Text,
    'expiresAt' : IDL.Opt(IDL.Int),
    'metadata' : IDL.Opt(IDL.Text),
    'userId' : UserId,
    'type' : IDL.Text,
    'gameId' : IDL.Text,
    'description' : IDL.Text,
    'claimedAt' : IDL.Opt(IDL.Int),
    'currency' : IDL.Opt(IDL.Text),
    'amount' : IDL.Float64,
  });
  const Result_60 = IDL.Variant({ 'ok' : GameReward, 'err' : IDL.Text });
  const Result_61 = IDL.Variant({ 'ok' : IDL.Float64, 'err' : IDL.Text });
  const PaymentStatus = IDL.Variant({
    'Failed' : IDL.Null,
    'Refunded' : IDL.Null,
    'Cancelled' : IDL.Null,
    'Processing' : IDL.Null,
    'Completed' : IDL.Null,
    'Pending' : IDL.Null,
  });
  const LocalPayment = IDL.Record({
    'id' : IDL.Text,
    'fee' : IDL.Float64,
    'status' : PaymentStatus,
    'completedAt' : IDL.Opt(IDL.Int),
    'provider' : PaymentProvider,
    'metadata' : IDL.Opt(IDL.Text),
    'userId' : UserId,
    'recipientPhone' : IDL.Opt(IDL.Text),
    'type' : IDL.Text,
    'reference' : IDL.Opt(IDL.Text),
    'currency' : IDL.Text,
    'timestamp' : IDL.Int,
    'amount' : IDL.Float64,
    'recipientName' : IDL.Opt(IDL.Text),
  });
  const Result_17 = IDL.Variant({ 'ok' : LocalPayment, 'err' : IDL.Text });
  const DeFiProtocol = IDL.Variant({
    'Sonic' : IDL.Null,
    'Neutrinite' : IDL.Null,
    'InfinitySwap' : IDL.Null,
    'ICDex' : IDL.Null,
    'Custom' : IDL.Null,
    'ICPSwap' : IDL.Null,
  });
  const DeFiProductType = IDL.Variant({
    'Swap' : IDL.Null,
    'Lending' : IDL.Null,
    'Custom' : IDL.Null,
    'Borrowing' : IDL.Null,
    'Governance' : IDL.Null,
    'Liquidity' : IDL.Null,
    'YieldFarming' : IDL.Null,
    'Staking' : IDL.Null,
  });
  const DeFiPosition = IDL.Record({
    'id' : IDL.Text,
    'apy' : IDL.Float64,
    'protocol' : DeFiProtocol,
    'metadata' : IDL.Opt(IDL.Text),
    'userId' : UserId,
    'createdAt' : IDL.Int,
    'productType' : DeFiProductType,
    'isActive' : IDL.Bool,
    'updatedAt' : IDL.Int,
    'tokenA' : IDL.Text,
    'tokenB' : IDL.Opt(IDL.Text),
    'rewards' : IDL.Float64,
    'amount' : IDL.Float64,
  });
  const Result_9 = IDL.Variant({ 'ok' : DeFiPosition, 'err' : IDL.Text });
  const Result_59 = IDL.Variant({
    'ok' : IDL.Record({ 'userId' : IDL.Principal, 'instructions' : IDL.Text }),
    'err' : IDL.Text,
  });
  const NotificationSettings = IDL.Record({
    'social' : IDL.Bool,
    'push' : IDL.Bool,
    'security' : IDL.Bool,
    'email' : IDL.Bool,
    'goals' : IDL.Bool,
    'transactions' : IDL.Bool,
  });
  const SecuritySettings = IDL.Record({
    'twoFactorEnabled' : IDL.Bool,
    'deviceTracking' : IDL.Bool,
    'loginNotifications' : IDL.Bool,
  });
  const PrivacySettings = IDL.Record({
    'profileVisibility' : IDL.Text,
    'allowFriendRequests' : IDL.Bool,
    'transactionVisibility' : IDL.Text,
  });
  const UserPreferences = IDL.Record({
    'theme' : IDL.Text,
    'notifications' : NotificationSettings,
    'security' : SecuritySettings,
    'language' : IDL.Text,
    'privacy' : PrivacySettings,
    'currency' : IDL.Text,
  });
  const User = IDL.Record({
    'id' : UserId,
    'username' : IDL.Text,
    'displayName' : IDL.Text,
    'lastLoginAt' : IDL.Opt(IDL.Int),
    'createdAt' : IDL.Int,
    'isActive' : IDL.Bool,
    'email' : IDL.Opt(IDL.Text),
    'preferences' : UserPreferences,
    'recoverySetupCompleted' : IDL.Bool,
    'loginAttempts' : IDL.Nat,
    'updatedAt' : IDL.Int,
    'isLocked' : IDL.Bool,
    'avatar' : IDL.Opt(IDL.Text),
  });
  const Result_4 = IDL.Variant({ 'ok' : User, 'err' : IDL.Text });
  const ExternalWalletConnection = IDL.Record({
    'id' : IDL.Text,
    'lastUsedAt' : IDL.Int,
    'permissions' : IDL.Vec(IDL.Text),
    'userId' : UserId,
    'walletType' : IDL.Text,
    'isActive' : IDL.Bool,
    'connectedAt' : IDL.Int,
    'address' : IDL.Opt(IDL.Text),
    'principalId' : IDL.Opt(IDL.Text),
  });
  const Result_58 = IDL.Variant({
    'ok' : ExternalWalletConnection,
    'err' : IDL.Text,
  });
  const Budget = IDL.Record({
    'id' : IDL.Text,
    'endDate' : IDL.Int,
    'period' : IDL.Text,
    'userId' : UserId,
    'name' : IDL.Text,
    'isActive' : IDL.Bool,
    'spent' : IDL.Float64,
    'category' : IDL.Text,
    'amount' : IDL.Float64,
    'startDate' : IDL.Int,
  });
  const Result_57 = IDL.Variant({ 'ok' : Budget, 'err' : IDL.Text });
  const CryptoTransaction = IDL.Record({
    'id' : IDL.Text,
    'fee' : IDL.Float64,
    'status' : IDL.Text,
    'fromAddress' : IDL.Opt(IDL.Text),
    'metadata' : IDL.Opt(IDL.Text),
    'userId' : UserId,
    'type' : IDL.Text,
    'currency' : IDL.Text,
    'blockHeight' : IDL.Opt(IDL.Nat),
    'timestamp' : IDL.Int,
    'txHash' : IDL.Opt(IDL.Text),
    'toAddress' : IDL.Opt(IDL.Text),
    'amount' : IDL.Float64,
    'walletId' : IDL.Text,
  });
  const Result_56 = IDL.Variant({ 'ok' : CryptoTransaction, 'err' : IDL.Text });
  const CryptoWalletType = IDL.Variant({
    'CAT' : IDL.Null,
    'ICP' : IDL.Null,
    'MOD' : IDL.Null,
    'NTN' : IDL.Null,
    'GHOST' : IDL.Null,
    'NANAS' : IDL.Null,
    'BOOM' : IDL.Null,
    'CHAT' : IDL.Null,
    'ELNA' : IDL.Null,
    'CKPEPE' : IDL.Null,
    'FIAT' : IDL.Null,
    'FOMO' : IDL.Null,
    'GLDT' : IDL.Null,
    'MEME' : IDL.Null,
    'NICP' : IDL.Null,
    'CYCLES' : IDL.Null,
    'SNS1' : IDL.Null,
    'TRAX' : IDL.Null,
    'YUGE' : IDL.Null,
    'PANDA' : IDL.Null,
    'PARTY' : IDL.Null,
    'ckBTC' : IDL.Null,
    'ckETH' : IDL.Null,
    'WUMBO' : IDL.Null,
    'OPENCHAT' : IDL.Null,
    'DKUMA' : IDL.Null,
    'DOGMI' : IDL.Null,
    'DSCVR' : IDL.Null,
    'KINIC' : IDL.Null,
    'ALPACALB' : IDL.Null,
    'MOTOKO' : IDL.Null,
    'DRAGGINZ' : IDL.Null,
    'DAMONIC' : IDL.Null,
    'CLOWN' : IDL.Null,
    'SHRIMP' : IDL.Null,
    'SEERS' : IDL.Null,
    'SNEED' : IDL.Null,
    'SONIC' : IDL.Null,
  });
  const CryptoWallet = IDL.Record({
    'id' : IDL.Text,
    'balance' : IDL.Float64,
    'metadata' : IDL.Opt(IDL.Text),
    'userId' : UserId,
    'name' : IDL.Text,
    'createdAt' : IDL.Int,
    'isExternal' : IDL.Bool,
    'walletType' : CryptoWalletType,
    'isActive' : IDL.Bool,
    'updatedAt' : IDL.Int,
    'currency' : IDL.Text,
    'address' : IDL.Opt(IDL.Text),
    'lastSyncAt' : IDL.Opt(IDL.Int),
    'externalWalletType' : IDL.Opt(IDL.Text),
  });
  const Result_10 = IDL.Variant({ 'ok' : CryptoWallet, 'err' : IDL.Text });
  const Goal = IDL.Record({
    'id' : IDL.Text,
    'title' : IDL.Text,
    'userId' : UserId,
    'createdAt' : IDL.Int,
    'description' : IDL.Text,
    'isActive' : IDL.Bool,
    'updatedAt' : IDL.Int,
    'isAchieved' : IDL.Bool,
    'targetAmount' : IDL.Float64,
    'currency' : IDL.Text,
    'targetDate' : IDL.Opt(IDL.Int),
    'category' : IDL.Text,
    'currentAmount' : IDL.Float64,
  });
  const Result_7 = IDL.Variant({ 'ok' : Goal, 'err' : IDL.Text });
  const VaultType = IDL.Variant({
    'Investment' : IDL.Null,
    'Custom' : IDL.Null,
    'Business' : IDL.Null,
    'Travel' : IDL.Null,
    'Savings' : IDL.Null,
    'Charity' : IDL.Null,
    'Emergency' : IDL.Null,
    'Education' : IDL.Null,
  });
  const GroupVault = IDL.Record({
    'id' : IDL.Text,
    'vaultType' : VaultType,
    'members' : IDL.Vec(IDL.Text),
    'ownerId' : UserId,
    'metadata' : IDL.Opt(IDL.Text),
    'name' : IDL.Text,
    'createdAt' : IDL.Int,
    'description' : IDL.Opt(IDL.Text),
    'isActive' : IDL.Bool,
    'updatedAt' : IDL.Int,
    'targetAmount' : IDL.Opt(IDL.Float64),
    'currency' : IDL.Text,
    'isPublic' : IDL.Bool,
    'totalBalance' : IDL.Float64,
    'rules' : IDL.Opt(IDL.Text),
  });
  const Result_55 = IDL.Variant({ 'ok' : GroupVault, 'err' : IDL.Text });
  const PluginStatus = IDL.Variant({
    'Inactive' : IDL.Null,
    'Active' : IDL.Null,
    'Suspended' : IDL.Null,
    'Deprecated' : IDL.Null,
    'Pending' : IDL.Null,
  });
  const PluginPermission = IDL.Variant({
    'WriteWallets' : IDL.Null,
    'ReadTransactions' : IDL.Null,
    'ReadProfile' : IDL.Null,
    'ReadContacts' : IDL.Null,
    'WriteContacts' : IDL.Null,
    'Notifications' : IDL.Null,
    'WriteProfile' : IDL.Null,
    'WriteTransactions' : IDL.Null,
    'ReadWallets' : IDL.Null,
    'ExternalAPIs' : IDL.Null,
  });
  const PluginCategory = IDL.Variant({
    'Productivity' : IDL.Null,
    'Health' : IDL.Null,
    'Social' : IDL.Null,
    'Custom' : IDL.Null,
    'Entertainment' : IDL.Null,
    'Gaming' : IDL.Null,
    'Education' : IDL.Null,
    'Finance' : IDL.Null,
  });
  const Plugin = IDL.Record({
    'id' : IDL.Text,
    'status' : PluginStatus,
    'permissions' : IDL.Vec(PluginPermission),
    'isInstalled' : IDL.Bool,
    'metadata' : IDL.Opt(IDL.Text),
    'icon' : IDL.Opt(IDL.Text),
    'name' : IDL.Text,
    'createdAt' : IDL.Int,
    'description' : IDL.Text,
    'author' : IDL.Text,
    'version' : IDL.Text,
    'isEnabled' : IDL.Bool,
    'updatedAt' : IDL.Int,
    'installCount' : IDL.Nat,
    'configSchema' : IDL.Opt(IDL.Text),
    'entryPoint' : IDL.Text,
    'category' : PluginCategory,
    'rating' : IDL.Float64,
  });
  const Result_16 = IDL.Variant({ 'ok' : Plugin, 'err' : IDL.Text });
  const GameStatus = IDL.Variant({
    'Paused' : IDL.Null,
    'Active' : IDL.Null,
    'Cancelled' : IDL.Null,
    'Completed' : IDL.Null,
  });
  const GameType = IDL.Variant({
    'Prediction' : IDL.Null,
    'Quiz' : IDL.Null,
    'Tournament' : IDL.Null,
    'Trading' : IDL.Null,
    'Custom' : IDL.Null,
    'Lottery' : IDL.Null,
    'Challenge' : IDL.Null,
  });
  const SocialGame = IDL.Record({
    'id' : IDL.Text,
    'startTime' : IDL.Int,
    'status' : GameStatus,
    'endTime' : IDL.Opt(IDL.Int),
    'metadata' : IDL.Opt(IDL.Text),
    'currentParticipants' : IDL.Nat,
    'name' : IDL.Text,
    'createdAt' : IDL.Int,
    'createdBy' : UserId,
    'description' : IDL.Text,
    'updatedAt' : IDL.Int,
    'currency' : IDL.Text,
    'gameType' : GameType,
    'maxParticipants' : IDL.Opt(IDL.Nat),
    'isPublic' : IDL.Bool,
    'entryFee' : IDL.Opt(IDL.Float64),
    'rules' : IDL.Opt(IDL.Text),
    'prizePool' : IDL.Float64,
  });
  const Result_53 = IDL.Variant({ 'ok' : SocialGame, 'err' : IDL.Text });
  const Transaction = IDL.Record({
    'id' : IDL.Text,
    'status' : IDL.Text,
    'metadata' : IDL.Opt(IDL.Text),
    'userId' : UserId,
    'type' : IDL.Text,
    'description' : IDL.Text,
    'currency' : IDL.Text,
    'timestamp' : IDL.Int,
    'category' : IDL.Text,
    'amount' : IDL.Float64,
    'walletId' : IDL.Text,
  });
  const Result_54 = IDL.Variant({ 'ok' : Transaction, 'err' : IDL.Text });
  const Wallet = IDL.Record({
    'id' : IDL.Text,
    'balance' : IDL.Float64,
    'userId' : UserId,
    'name' : IDL.Text,
    'createdAt' : IDL.Int,
    'type' : IDL.Text,
    'isActive' : IDL.Bool,
    'updatedAt' : IDL.Int,
    'currency' : IDL.Text,
  });
  const Result_21 = IDL.Variant({ 'ok' : Wallet, 'err' : IDL.Text });
  const VaultTransaction = IDL.Record({
    'id' : IDL.Text,
    'status' : IDL.Text,
    'metadata' : IDL.Opt(IDL.Text),
    'userId' : UserId,
    'type' : IDL.Text,
    'description' : IDL.Text,
    'vaultId' : IDL.Text,
    'currency' : IDL.Text,
    'timestamp' : IDL.Int,
    'amount' : IDL.Float64,
  });
  const Result = IDL.Variant({ 'ok' : VaultTransaction, 'err' : IDL.Text });
  const AIInsight = IDL.Record({
    'id' : IDL.Text,
    'title' : IDL.Text,
    'metadata' : IDL.Opt(IDL.Text),
    'userId' : UserId,
    'createdAt' : IDL.Int,
    'type' : IDL.Text,
    'description' : IDL.Text,
    'actionable' : IDL.Bool,
    'confidence' : IDL.Float64,
  });
  const Result_43 = IDL.Variant({
    'ok' : IDL.Vec(AIInsight),
    'err' : IDL.Text,
  });
  const AIRecommendation = IDL.Record({
    'id' : IDL.Text,
    'title' : IDL.Text,
    'estimatedImpact' : IDL.Float64,
    'metadata' : IDL.Opt(IDL.Text),
    'userId' : UserId,
    'createdAt' : IDL.Int,
    'description' : IDL.Text,
    'isImplemented' : IDL.Bool,
    'category' : IDL.Text,
    'priority' : IDL.Text,
  });
  const Result_42 = IDL.Variant({
    'ok' : IDL.Vec(AIRecommendation),
    'err' : IDL.Text,
  });
  const Result_2 = IDL.Variant({ 'ok' : IDL.Text, 'err' : IDL.Text });
  const Result_52 = IDL.Variant({
    'ok' : IDL.Record({
      'implementedRecommendations' : IDL.Nat,
      'totalRecommendations' : IDL.Nat,
      'totalInsights' : IDL.Nat,
      'averageConfidence' : IDL.Float64,
      'totalMessages' : IDL.Nat,
    }),
    'err' : IDL.Text,
  });
  const AIMessageType = IDL.Variant({
    'Error' : IDL.Null,
    'System' : IDL.Null,
    'User' : IDL.Null,
    'Assistant' : IDL.Null,
  });
  const AIMessage = IDL.Record({
    'id' : IDL.Text,
    'content' : IDL.Text,
    'metadata' : IDL.Opt(IDL.Text),
    'userId' : UserId,
    'type' : AIMessageType,
    'timestamp' : IDL.Int,
  });
  const Result_51 = IDL.Variant({
    'ok' : IDL.Vec(AIMessage),
    'err' : IDL.Text,
  });
  const Result_33 = IDL.Variant({
    'ok' : IDL.Vec(SocialGame),
    'err' : IDL.Text,
  });
  const Result_14 = IDL.Variant({ 'ok' : IDL.Vec(Plugin), 'err' : IDL.Text });
  const Result_50 = IDL.Variant({
    'ok' : IDL.Record({
      'activeWallets' : IDL.Nat,
      'monthlySpent' : IDL.Float64,
      'goalsProgress' : IDL.Float64,
      'totalBalance' : IDL.Float64,
    }),
    'err' : IDL.Text,
  });
  const Result_49 = IDL.Variant({
    'ok' : IDL.Record({
      'totalValue' : IDL.Float64,
      'totalRewards' : IDL.Float64,
      'averageApy' : IDL.Float64,
      'activeProtocols' : IDL.Vec(IDL.Text),
      'totalPositions' : IDL.Nat,
    }),
    'err' : IDL.Text,
  });
  const Result_37 = IDL.Variant({
    'ok' : IDL.Vec(DeFiPosition),
    'err' : IDL.Text,
  });
  const Result_48 = IDL.Variant({
    'ok' : IDL.Record({
      'totalVolume' : IDL.Float64,
      'averageApy' : IDL.Float64,
      'totalPositions' : IDL.Nat,
      'totalUsers' : IDL.Nat,
    }),
    'err' : IDL.Text,
  });
  const DeFiTransaction = IDL.Record({
    'id' : IDL.Text,
    'fee' : IDL.Float64,
    'protocol' : DeFiProtocol,
    'status' : IDL.Text,
    'metadata' : IDL.Opt(IDL.Text),
    'userId' : UserId,
    'type' : IDL.Text,
    'amountA' : IDL.Float64,
    'amountB' : IDL.Opt(IDL.Float64),
    'tokenA' : IDL.Text,
    'tokenB' : IDL.Opt(IDL.Text),
    'timestamp' : IDL.Int,
    'txHash' : IDL.Opt(IDL.Text),
  });
  const Result_36 = IDL.Variant({
    'ok' : IDL.Vec(DeFiTransaction),
    'err' : IDL.Text,
  });
  const Result_47 = IDL.Variant({
    'ok' : IDL.Vec(IDL.Tuple(IDL.Text, IDL.Text)),
    'err' : IDL.Text,
  });
  const WalletPortfolio = IDL.Record({
    'cryptoWallets' : IDL.Vec(CryptoWallet),
    'externalConnections' : IDL.Vec(ExternalWalletConnection),
    'totalValueKES' : IDL.Float64,
    'totalValueUSD' : IDL.Float64,
    'userId' : UserId,
    'lastUpdated' : IDL.Int,
    'fiatWallets' : IDL.Vec(Wallet),
    'defiPositions' : IDL.Vec(DeFiPosition),
  });
  const Result_46 = IDL.Variant({ 'ok' : WalletPortfolio, 'err' : IDL.Text });
  const GameParticipant = IDL.Record({
    'id' : IDL.Text,
    'metadata' : IDL.Opt(IDL.Text),
    'userId' : UserId,
    'joinedAt' : IDL.Int,
    'rank' : IDL.Opt(IDL.Nat),
    'gameId' : IDL.Text,
    'isActive' : IDL.Bool,
    'score' : IDL.Float64,
  });
  const Result_45 = IDL.Variant({
    'ok' : IDL.Vec(GameParticipant),
    'err' : IDL.Text,
  });
  const Result_44 = IDL.Variant({
    'ok' : IDL.Record({
      'topProvider' : IDL.Opt(IDL.Text),
      'successRate' : IDL.Float64,
      'totalFees' : IDL.Float64,
      'totalPayments' : IDL.Nat,
      'totalAmount' : IDL.Float64,
    }),
    'err' : IDL.Text,
  });
  const Result_29 = IDL.Variant({
    'ok' : IDL.Vec(LocalPayment),
    'err' : IDL.Text,
  });
  const RecoveryRequest = IDL.Record({
    'id' : IDL.Text,
    'status' : IDL.Text,
    'completedAt' : IDL.Opt(IDL.Int),
    'verificationCode' : IDL.Opt(IDL.Text),
    'expiresAt' : IDL.Int,
    'metadata' : IDL.Opt(IDL.Text),
    'userId' : IDL.Opt(UserId),
    'createdAt' : IDL.Int,
    'recoveryToken' : IDL.Opt(IDL.Text),
    'recoveryMethod' : IDL.Text,
    'identifier' : IDL.Text,
    'verifiedAt' : IDL.Opt(IDL.Int),
  });
  const AuditLog = IDL.Record({
    'id' : IDL.Text,
    'action' : IDL.Text,
    'userId' : IDL.Opt(UserId),
    'timestamp' : IDL.Int,
    'details' : IDL.Text,
    'success' : IDL.Bool,
    'userAgent' : IDL.Opt(IDL.Text),
    'ipAddress' : IDL.Opt(IDL.Text),
  });
  const Result_41 = IDL.Variant({ 'ok' : IDL.Vec(AuditLog), 'err' : IDL.Text });
  const Result_40 = IDL.Variant({ 'ok' : IDL.Vec(Budget), 'err' : IDL.Text });
  const Result_39 = IDL.Variant({
    'ok' : IDL.Vec(CryptoTransaction),
    'err' : IDL.Text,
  });
  const Result_38 = IDL.Variant({
    'ok' : IDL.Vec(CryptoWallet),
    'err' : IDL.Text,
  });
  const Result_35 = IDL.Variant({
    'ok' : IDL.Vec(ExternalWalletConnection),
    'err' : IDL.Text,
  });
  const Result_34 = IDL.Variant({
    'ok' : IDL.Vec(GameReward),
    'err' : IDL.Text,
  });
  const Result_32 = IDL.Variant({ 'ok' : IDL.Vec(Goal), 'err' : IDL.Text });
  const Result_31 = IDL.Variant({
    'ok' : IDL.Vec(GroupVault),
    'err' : IDL.Text,
  });
  const OTPRequest = IDL.Record({
    'id' : IDL.Text,
    'service' : IDL.Text,
    'status' : IDL.Text,
    'deliveredAt' : IDL.Opt(IDL.Int),
    'expiresAt' : IDL.Int,
    'provider' : IDL.Text,
    'metadata' : IDL.Opt(IDL.Text),
    'code' : IDL.Text,
    'userId' : IDL.Opt(UserId),
    'createdAt' : IDL.Int,
    'recipient' : IDL.Text,
    'attempts' : IDL.Nat,
    'sentAt' : IDL.Opt(IDL.Int),
    'purpose' : IDL.Text,
  });
  const Result_30 = IDL.Variant({
    'ok' : IDL.Vec(OTPRequest),
    'err' : IDL.Text,
  });
  const Result_28 = IDL.Variant({
    'ok' : IDL.Vec(PaymentMethod),
    'err' : IDL.Text,
  });
  const UserPlugin = IDL.Record({
    'id' : IDL.Text,
    'lastUsedAt' : IDL.Int,
    'permissions' : IDL.Vec(PluginPermission),
    'metadata' : IDL.Opt(IDL.Text),
    'userId' : UserId,
    'isEnabled' : IDL.Bool,
    'installedAt' : IDL.Int,
    'config' : IDL.Opt(IDL.Text),
    'pluginId' : IDL.Text,
  });
  const Result_27 = IDL.Variant({
    'ok' : IDL.Vec(UserPlugin),
    'err' : IDL.Text,
  });
  const Result_26 = IDL.Variant({
    'ok' : IDL.Vec(RecoveryMethod),
    'err' : IDL.Text,
  });
  const Result_25 = IDL.Variant({
    'ok' : IDL.Vec(Transaction),
    'err' : IDL.Text,
  });
  const Result_24 = IDL.Variant({
    'ok' : IDL.Record({
      'allAddresses' : IDL.Vec(IDL.Text),
      'principalId' : IDL.Text,
      'accountIdentifier' : IDL.Text,
      'cryptoAddresses' : IDL.Vec(IDL.Tuple(IDL.Text, IDL.Text)),
    }),
    'err' : IDL.Text,
  });
  const Result_23 = IDL.Variant({ 'ok' : IDL.Vec(Wallet), 'err' : IDL.Text });
  const VaultMember = IDL.Record({
    'id' : IDL.Text,
    'permissions' : IDL.Vec(IDL.Text),
    'userId' : UserId,
    'joinedAt' : IDL.Int,
    'role' : IDL.Text,
    'isActive' : IDL.Bool,
    'contributionLimit' : IDL.Opt(IDL.Float64),
    'vaultId' : IDL.Text,
    'withdrawalLimit' : IDL.Opt(IDL.Float64),
  });
  const Result_22 = IDL.Variant({
    'ok' : IDL.Record({
      'members' : IDL.Vec(VaultMember),
      'vault' : GroupVault,
      'transactions' : IDL.Vec(VaultTransaction),
    }),
    'err' : IDL.Text,
  });
  const Result_20 = IDL.Variant({
    'ok' : IDL.Record({
      'recoveryRequestId' : IDL.Text,
      'message' : IDL.Text,
      'securityQuestions' : IDL.Opt(IDL.Vec(IDL.Tuple(IDL.Text, IDL.Text))),
    }),
    'err' : IDL.Text,
  });
  const Result_5 = IDL.Variant({ 'ok' : UserPlugin, 'err' : IDL.Text });
  const Result_19 = IDL.Variant({ 'ok' : VaultMember, 'err' : IDL.Text });
  const Result_8 = IDL.Variant({ 'ok' : GameParticipant, 'err' : IDL.Text });
  const Result_18 = IDL.Variant({ 'ok' : AIRecommendation, 'err' : IDL.Text });
  const Result_15 = IDL.Variant({ 'ok' : DeFiTransaction, 'err' : IDL.Text });
  const Result_11 = IDL.Variant({ 'ok' : IDL.Bool, 'err' : IDL.Text });
  const Result_13 = IDL.Variant({ 'ok' : AIMessage, 'err' : IDL.Text });
  const Result_12 = IDL.Variant({
    'ok' : IDL.Record({
      'expiresIn' : IDL.Int,
      'otpId' : IDL.Text,
      'message' : IDL.Text,
    }),
    'err' : IDL.Text,
  });
  const Result_3 = IDL.Variant({
    'ok' : IDL.Record({
      'verified' : IDL.Bool,
      'recipient' : IDL.Text,
      'purpose' : IDL.Text,
    }),
    'err' : IDL.Text,
  });
  return IDL.Service({
    'addEmergencyContact' : IDL.Func(
        [IDL.Text, IDL.Text, IDL.Text],
        [Result_63],
        [],
      ),
    'addPaymentMethod' : IDL.Func(
        [IDL.Text, IDL.Opt(IDL.Text), IDL.Opt(IDL.Text), IDL.Text, IDL.Bool],
        [Result_6],
        [],
      ),
    'addRecoveryMethod' : IDL.Func(
        [IDL.Text, IDL.Text, IDL.Opt(IDL.Text)],
        [Result_1],
        [],
      ),
    'addSecurityQuestions' : IDL.Func(
        [IDL.Vec(IDL.Tuple(IDL.Text, IDL.Text))],
        [Result_62],
        [],
      ),
    'awardGameReward' : IDL.Func(
        [IDL.Text, UserId, IDL.Text, IDL.Float64, IDL.Opt(IDL.Text), IDL.Text],
        [Result_60],
        [],
      ),
    'calculateDefiRewards' : IDL.Func([IDL.Text], [Result_61], []),
    'cancelPayment' : IDL.Func([IDL.Text], [Result_17], []),
    'claimGameReward' : IDL.Func([IDL.Text], [Result_60], []),
    'closeDefiPosition' : IDL.Func([IDL.Text], [Result_9], []),
    'completeRecovery' : IDL.Func(
        [IDL.Text, IDL.Opt(IDL.Text)],
        [Result_59],
        [],
      ),
    'completeRecoverySetup' : IDL.Func([], [Result_4], []),
    'connectExternalWallet' : IDL.Func(
        [IDL.Text, IDL.Opt(IDL.Text), IDL.Opt(IDL.Text), IDL.Vec(IDL.Text)],
        [Result_58],
        [],
      ),
    'createBudget' : IDL.Func(
        [IDL.Text, IDL.Text, IDL.Float64, IDL.Text, IDL.Int, IDL.Int],
        [Result_57],
        [],
      ),
    'createCryptoTransaction' : IDL.Func(
        [
          IDL.Text,
          IDL.Text,
          IDL.Float64,
          IDL.Opt(IDL.Text),
          IDL.Opt(IDL.Text),
          IDL.Opt(IDL.Text),
          IDL.Float64,
        ],
        [Result_56],
        [],
      ),
    'createCryptoWallet' : IDL.Func(
        [IDL.Text, IDL.Text, IDL.Bool, IDL.Opt(IDL.Text), IDL.Opt(IDL.Text)],
        [Result_10],
        [],
      ),
    'createDeFiPosition' : IDL.Func(
        [
          IDL.Text,
          IDL.Text,
          IDL.Text,
          IDL.Opt(IDL.Text),
          IDL.Float64,
          IDL.Float64,
        ],
        [Result_9],
        [],
      ),
    'createDefiPosition' : IDL.Func(
        [
          IDL.Text,
          IDL.Text,
          IDL.Text,
          IDL.Opt(IDL.Text),
          IDL.Float64,
          IDL.Float64,
        ],
        [Result_9],
        [],
      ),
    'createGoal' : IDL.Func(
        [IDL.Text, IDL.Text, IDL.Float64, IDL.Text, IDL.Opt(IDL.Int), IDL.Text],
        [Result_7],
        [],
      ),
    'createGroupVault' : IDL.Func(
        [
          IDL.Text,
          IDL.Opt(IDL.Text),
          IDL.Text,
          IDL.Text,
          IDL.Opt(IDL.Float64),
          IDL.Bool,
          IDL.Opt(IDL.Text),
        ],
        [Result_55],
        [],
      ),
    'createPlugin' : IDL.Func(
        [
          IDL.Text,
          IDL.Text,
          IDL.Text,
          IDL.Text,
          IDL.Vec(IDL.Text),
          IDL.Opt(IDL.Text),
          IDL.Text,
          IDL.Opt(IDL.Text),
        ],
        [Result_16],
        [],
      ),
    'createSocialGame' : IDL.Func(
        [
          IDL.Text,
          IDL.Text,
          IDL.Text,
          IDL.Int,
          IDL.Opt(IDL.Int),
          IDL.Opt(IDL.Nat),
          IDL.Opt(IDL.Float64),
          IDL.Float64,
          IDL.Text,
          IDL.Opt(IDL.Text),
          IDL.Bool,
        ],
        [Result_53],
        [],
      ),
    'createTransaction' : IDL.Func(
        [IDL.Text, IDL.Text, IDL.Float64, IDL.Text, IDL.Text],
        [Result_54],
        [],
      ),
    'createUser' : IDL.Func(
        [IDL.Text, IDL.Text, IDL.Opt(IDL.Text)],
        [Result_4],
        [],
      ),
    'createWallet' : IDL.Func([IDL.Text, IDL.Text, IDL.Text], [Result_21], []),
    'depositToVault' : IDL.Func(
        [IDL.Text, IDL.Float64, IDL.Opt(IDL.Text)],
        [Result],
        [],
      ),
    'endGame' : IDL.Func([IDL.Text], [Result_53], []),
    'generateAIInsights' : IDL.Func([], [Result_43], []),
    'generateAIRecommendations' : IDL.Func([], [Result_42], []),
    'generateDepositAddress' : IDL.Func([IDL.Text], [Result_2], []),
    'getAIAnalytics' : IDL.Func([], [Result_52], []),
    'getAIConversationHistory' : IDL.Func([], [Result_51], []),
    'getAvailableGames' : IDL.Func([], [Result_33], []),
    'getAvailablePlugins' : IDL.Func([], [Result_14], []),
    'getDashboardStats' : IDL.Func([], [Result_50], ['query']),
    'getDefiAnalytics' : IDL.Func([], [Result_49], []),
    'getDefiPositionsByProductType' : IDL.Func([IDL.Text], [Result_37], []),
    'getDefiPositionsByProtocol' : IDL.Func([IDL.Text], [Result_37], []),
    'getDefiProtocolStats' : IDL.Func([IDL.Text], [Result_48], []),
    'getDefiTransactionsByProtocol' : IDL.Func([IDL.Text], [Result_36], []),
    'getDepositAddress' : IDL.Func([IDL.Text], [Result_2], []),
    'getDepositAddresses' : IDL.Func([], [Result_47], []),
    'getFullWalletPortfolio' : IDL.Func([], [Result_46], []),
    'getGameLeaderboard' : IDL.Func([IDL.Text], [Result_45], []),
    'getGamesByType' : IDL.Func([IDL.Text], [Result_33], []),
    'getPaymentStats' : IDL.Func([], [Result_44], []),
    'getPaymentsByProvider' : IDL.Func([IDL.Text], [Result_29], []),
    'getPluginsByCategory' : IDL.Func([IDL.Text], [Result_14], []),
    'getPrincipalId' : IDL.Func([], [IDL.Text], ['query']),
    'getRecoveryRequestStatus' : IDL.Func(
        [IDL.Text],
        [IDL.Opt(RecoveryRequest)],
        ['query'],
      ),
    'getSystemStats' : IDL.Func(
        [],
        [
          IDL.Record({
            'totalExternalConnections' : IDL.Nat,
            'totalWallets' : IDL.Nat,
            'totalCryptoWallets' : IDL.Nat,
            'totalRecoveryRequests' : IDL.Nat,
            'totalOTPRequests' : IDL.Nat,
            'totalCryptoTransactions' : IDL.Nat,
            'totalUsers' : IDL.Nat,
            'totalRecoveryMethods' : IDL.Nat,
            'totalTransactions' : IDL.Nat,
            'totalDeFiPositions' : IDL.Nat,
          }),
        ],
        ['query'],
      ),
    'getUser' : IDL.Func([], [Result_4], ['query']),
    'getUserAIInsights' : IDL.Func([], [Result_43], []),
    'getUserAIRecommendations' : IDL.Func([], [Result_42], []),
    'getUserAuditLogs' : IDL.Func([], [Result_41], []),
    'getUserBudgets' : IDL.Func([], [Result_40], ['query']),
    'getUserByEmail' : IDL.Func([IDL.Text], [IDL.Opt(UserId)], ['query']),
    'getUserByPhone' : IDL.Func([IDL.Text], [IDL.Opt(UserId)], ['query']),
    'getUserCryptoTransactions' : IDL.Func([], [Result_39], []),
    'getUserCryptoWallets' : IDL.Func([], [Result_38], ['query']),
    'getUserDeFiPositions' : IDL.Func([], [Result_37], []),
    'getUserDefiPositions' : IDL.Func([], [Result_37], []),
    'getUserDefiTransactions' : IDL.Func([], [Result_36], []),
    'getUserExternalConnections' : IDL.Func([], [Result_35], []),
    'getUserGameRewards' : IDL.Func([], [Result_34], []),
    'getUserGames' : IDL.Func([], [Result_33], []),
    'getUserGoals' : IDL.Func([], [Result_32], ['query']),
    'getUserGroupVaults' : IDL.Func([], [Result_31], []),
    'getUserOTPRequests' : IDL.Func([], [Result_30], []),
    'getUserPaymentHistory' : IDL.Func([], [Result_29], []),
    'getUserPaymentMethods' : IDL.Func([], [Result_28], []),
    'getUserPlugins' : IDL.Func([], [Result_27], []),
    'getUserRecoveryMethods' : IDL.Func([], [Result_26], ['query']),
    'getUserTransactions' : IDL.Func([], [Result_25], ['query']),
    'getUserWalletAddresses' : IDL.Func([], [Result_24], []),
    'getUserWallets' : IDL.Func([], [Result_23], ['query']),
    'getVaultDetails' : IDL.Func([IDL.Text], [Result_22], []),
    'getWallet' : IDL.Func([IDL.Text], [Result_21], []),
    'getWalletByAddress' : IDL.Func([IDL.Text], [IDL.Opt(IDL.Text)], ['query']),
    'greet' : IDL.Func([IDL.Text], [IDL.Text], ['query']),
    'initiateLocalPayment' : IDL.Func(
        [
          IDL.Text,
          IDL.Text,
          IDL.Float64,
          IDL.Text,
          IDL.Opt(IDL.Text),
          IDL.Opt(IDL.Text),
          IDL.Opt(IDL.Text),
        ],
        [Result_17],
        [],
      ),
    'initiateRecovery' : IDL.Func([IDL.Text, IDL.Text], [Result_20], []),
    'installPlugin' : IDL.Func([IDL.Text, IDL.Opt(IDL.Text)], [Result_5], []),
    'inviteToVault' : IDL.Func([IDL.Text, UserId, IDL.Text], [Result_19], []),
    'joinGame' : IDL.Func([IDL.Text], [Result_8], []),
    'joinVault' : IDL.Func([IDL.Text], [Result_19], []),
    'linkRecoveredAccount' : IDL.Func(
        [IDL.Text, IDL.Principal],
        [Result_4],
        [],
      ),
    'loginOrCreateUser' : IDL.Func([], [Result_4], []),
    'markRecommendationImplemented' : IDL.Func([IDL.Text], [Result_18], []),
    'processPayment' : IDL.Func([IDL.Text], [Result_17], []),
    'ratePlugin' : IDL.Func([IDL.Text, IDL.Float64], [Result_16], []),
    'recordDefiTransaction' : IDL.Func(
        [
          IDL.Text,
          IDL.Text,
          IDL.Text,
          IDL.Opt(IDL.Text),
          IDL.Float64,
          IDL.Opt(IDL.Float64),
          IDL.Float64,
          IDL.Opt(IDL.Text),
        ],
        [Result_15],
        [],
      ),
    'regenerateWalletAddress' : IDL.Func([IDL.Text], [Result_2], []),
    'removePaymentMethod' : IDL.Func([IDL.Text], [Result_11], []),
    'searchPlugins' : IDL.Func([IDL.Text], [Result_14], []),
    'sendAIMessage' : IDL.Func([IDL.Text], [Result_13], []),
    'sendOTP' : IDL.Func(
        [IDL.Text, IDL.Text, IDL.Text, IDL.Text],
        [Result_12],
        [],
      ),
    'sendVerificationCode' : IDL.Func([IDL.Text, IDL.Text], [Result_2], []),
    'togglePlugin' : IDL.Func([IDL.Text, IDL.Bool], [Result_5], []),
    'uninstallPlugin' : IDL.Func([IDL.Text], [Result_11], []),
    'updateCryptoWalletBalance' : IDL.Func(
        [IDL.Text, IDL.Float64],
        [Result_10],
        [],
      ),
    'updateDefiPosition' : IDL.Func(
        [IDL.Text, IDL.Float64, IDL.Float64, IDL.Float64],
        [Result_9],
        [],
      ),
    'updateGameScore' : IDL.Func([IDL.Text, IDL.Float64], [Result_8], []),
    'updateGoalProgress' : IDL.Func([IDL.Text, IDL.Float64], [Result_7], []),
    'updatePaymentMethod' : IDL.Func(
        [IDL.Text, IDL.Opt(IDL.Text), IDL.Opt(IDL.Text), IDL.Text, IDL.Bool],
        [Result_6],
        [],
      ),
    'updatePluginConfig' : IDL.Func([IDL.Text, IDL.Text], [Result_5], []),
    'updateUser' : IDL.Func(
        [IDL.Opt(IDL.Text), IDL.Opt(IDL.Text)],
        [Result_4],
        [],
      ),
    'userExists' : IDL.Func([], [IDL.Bool], []),
    'validateAddress' : IDL.Func([IDL.Text, IDL.Text], [IDL.Bool], ['query']),
    'verifyCode' : IDL.Func([IDL.Text, IDL.Text, IDL.Text], [Result_2], []),
    'verifyOTP' : IDL.Func([IDL.Text, IDL.Text], [Result_3], []),
    'verifyRecovery' : IDL.Func(
        [
          IDL.Text,
          IDL.Opt(IDL.Text),
          IDL.Opt(IDL.Vec(IDL.Tuple(IDL.Text, IDL.Text))),
        ],
        [Result_2],
        [],
      ),
    'verifyRecoveryMethod' : IDL.Func(
        [IDL.Text, IDL.Text, IDL.Text],
        [Result_1],
        [],
      ),
    'withdrawFromVault' : IDL.Func(
        [IDL.Text, IDL.Float64, IDL.Opt(IDL.Text)],
        [Result],
        [],
      ),
  });
};
export const init = ({ IDL }) => { return []; };
