import Principal "mo:base/Principal";
import Array "mo:base/Array";
import Option "mo:base/Option";
import Result "mo:base/Result";
import Text "mo:base/Text";
import Nat "mo:base/Nat";
import Int "mo:base/Int";
import HashMap "mo:base/HashMap";
import Iter "mo:base/Iter";
import Time "mo:base/Time";
import Debug "mo:base/Debug";

actor MPCService {
  
  // ============ MPC TYPES ============
  
  public type UserId = Principal;
  public type WalletId = Text;
  public type MPCWalletId = Text;
  public type PartyId = Text;
  
  public type MPCWallet = {
    id: MPCWalletId;
    userId: UserId;
    name: Text;
    threshold: Nat; // Number of parties required to sign
    totalParties: Nat; // Total number of parties
    parties: [Party]; // List of parties involved
    status: Text; // "active" | "pending" | "suspended"
    createdAt: Int;
    updatedAt: Int;
    lastUsedAt: ?Int;
    metadata: ?Text;
  };
  
  public type Party = {
    id: PartyId;
    userId: UserId;
    role: Text; // "owner" | "guardian" | "backup" | "family" | "business"
    weight: Nat; // Voting weight (for weighted thresholds)
    isActive: Bool;
    joinedAt: Int;
    lastActiveAt: ?Int;
    deviceInfo: ?Text; // Device fingerprint for security
  };
  
  public type MPCTransaction = {
    id: Text;
    mpcWalletId: MPCWalletId;
    type_: Text; // "send" | "receive" | "vault_deposit" | "vault_withdraw" | "social_transfer"
    amount: Float;
    currency: Text;
    toAddress: ?Text;
    fromAddress: ?Text;
    description: ?Text;
    status: Text; // "pending_approval" | "approved" | "executed" | "rejected" | "expired"
    approvals: [Approval];
    requiredApprovals: Nat;
    expiresAt: Int;
    createdAt: Int;
    executedAt: ?Int;
    txHash: ?Text;
    metadata: ?Text;
  };
  
  public type Approval = {
    partyId: PartyId;
    userId: UserId;
    approved: Bool;
    timestamp: Int;
    signature: ?Text; // Cryptographic signature
    deviceInfo: ?Text;
  };
  
  public type MPCKeyShare = {
    partyId: PartyId;
    userId: UserId;
    share: Text; // Encrypted key share
    index: Nat; // Position in the polynomial
    isActive: Bool;
    createdAt: Int;
    lastRotatedAt: ?Int;
  };
  
  public type SocialTransfer = {
    id: Text;
    mpcWalletId: MPCWalletId;
    platform: Text; // "instagram" | "whatsapp" | "twitter" | "telegram"
    recipient: Text; // Username or phone number
    amount: Float;
    currency: Text;
    message: ?Text;
    isPrivate: Bool; // Hide amount from recipient
    status: Text;
    approvals: [Approval];
    createdAt: Int;
  };
  
  // ============ STORAGE ============
  
  private var nextMPCWalletId: Nat = 1;
  private var nextMPCTransactionId: Nat = 1;
  private var nextPartyId: Nat = 1;
  
  private let mpcWallets = HashMap.HashMap<MPCWalletId, MPCWallet>(0, Text.equal, Text.hash);
  private let userMPCWallets = HashMap.HashMap<UserId, [MPCWalletId]>(0, Principal.equal, Principal.hash);
  private let mpcTransactions = HashMap.HashMap<Text, MPCTransaction>(0, Text.equal, Text.hash);
  private let userMPCTransactions = HashMap.HashMap<UserId, [Text]>(0, Principal.equal, Principal.hash);
  private let keyShares = HashMap.HashMap<PartyId, MPCKeyShare>(0, Text.equal, Text.hash);
  private let socialTransfers = HashMap.HashMap<Text, SocialTransfer>(0, Text.equal, Text.hash);
  private let partyIndex = HashMap.HashMap<PartyId, Party>(0, Text.equal, Text.hash);
  
  // ============ MPC WALLET MANAGEMENT ============
  
  // Create a new MPC wallet
  public shared(msg) func createMPCWallet(
    name: Text,
    threshold: Nat,
    parties: [UserId],
    description: ?Text
  ): async Result.Result<MPCWallet, Text> {
    let caller = msg.caller;
    
    // Validate inputs
    if (threshold < 2) {
      return #err("Threshold must be at least 2");
    };
    if (threshold > parties.size()) {
      return #err("Threshold cannot exceed number of parties");
    };
    if (parties.size() < 2) {
      return #err("At least 2 parties required");
    };
    let isCallerInParties = Array.find<UserId>(parties, func(userId) = Principal.equal(userId, caller));
    if (isCallerInParties == null) {
      return #err("Caller must be one of the parties");
    };
    
    let mpcWalletId = generateId("mpc_wallet", nextMPCWalletId);
    nextMPCWalletId += 1;
    
    let now = getCurrentTime();
    
    // Create party objects
    let partyObjects = Array.map<UserId, Party>(parties, func(userId) {
      let partyId = generateId("party", nextPartyId);
      nextPartyId += 1;
      
      {
        id = partyId;
        userId = userId;
        role = if (Principal.equal(userId, caller)) "owner" else "guardian";
        weight = 1;
        isActive = true;
        joinedAt = now;
        lastActiveAt = ?now;
        deviceInfo = null;
      }
    });
    
    let mpcWallet: MPCWallet = {
      id = mpcWalletId;
      userId = caller;
      name = name;
      threshold = threshold;
      totalParties = parties.size();
      parties = partyObjects;
      status = "active";
      createdAt = now;
      updatedAt = now;
      lastUsedAt = null;
      metadata = description;
    };
    
    // Store the wallet
    mpcWallets.put(mpcWalletId, mpcWallet);
    
    // Index by user
    let currentWallets = Option.get(userMPCWallets.get(caller), []);
    userMPCWallets.put(caller, Array.append(currentWallets, [mpcWalletId]));
    
    // Index parties
    for (party in partyObjects.vals()) {
      partyIndex.put(party.id, party);
    };
    
    // Generate key shares (simplified - in production, use real MPC)
    await generateKeyShares(mpcWalletId, partyObjects);
    
    return #ok(mpcWallet);
  };
  
  // Add a party to existing MPC wallet
  public shared(msg) func addPartyToMPCWallet(
    mpcWalletId: MPCWalletId,
    newUserId: UserId,
    role: Text
  ): async Result.Result<Party, Text> {
    let caller = msg.caller;
    
    switch (mpcWallets.get(mpcWalletId)) {
      case null { return #err("MPC wallet not found"); };
      case (?wallet) {
        if (wallet.userId != caller) {
          return #err("Only wallet owner can add parties");
        };
        
        let now = getCurrentTime();
        let partyId = generateId("party", nextPartyId);
        nextPartyId += 1;
        
        let newParty: Party = {
          id = partyId;
          userId = newUserId;
          role = role;
          weight = 1;
          isActive = true;
          joinedAt = now;
          lastActiveAt = ?now;
          deviceInfo = null;
        };
        
        // Update wallet
        let updatedParties = Array.append(wallet.parties, [newParty]);
        let updatedWallet: MPCWallet = {
          id = wallet.id;
          userId = wallet.userId;
          name = wallet.name;
          threshold = wallet.threshold;
          totalParties = updatedParties.size();
          parties = updatedParties;
          status = wallet.status;
          createdAt = wallet.createdAt;
          updatedAt = now;
          lastUsedAt = wallet.lastUsedAt;
          metadata = wallet.metadata;
        };
        
        mpcWallets.put(mpcWalletId, updatedWallet);
        partyIndex.put(partyId, newParty);
        
        // Generate key share for new party
        await generateKeyShare(partyId, mpcWalletId);
        
        return #ok(newParty);
      };
    };
  };
  
  // ============ MPC TRANSACTION MANAGEMENT ============
  
  // Create a transaction requiring MPC approval
  public shared(msg) func createMPCTransaction(
    mpcWalletId: MPCWalletId,
    type_: Text,
    amount: Float,
    currency: Text,
    toAddress: ?Text,
    description: ?Text,
    expiresInHours: Nat
  ): async Result.Result<MPCTransaction, Text> {
    let caller = msg.caller;
    
    switch (mpcWallets.get(mpcWalletId)) {
      case null { return #err("MPC wallet not found"); };
      case (?wallet) {
        // Check if caller is a party
        let callerParty = Array.find<Party>(wallet.parties, func(party) {
          Principal.equal(party.userId, caller) and party.isActive
        });
        let isParty = callerParty != null;
        
        if (not isParty) {
          return #err("Only wallet parties can create transactions");
        };
        
        let transactionId = generateId("mpc_txn", nextMPCTransactionId);
        nextMPCTransactionId += 1;
        
        let now = getCurrentTime();
        let expiresAt = now + (expiresInHours * 3600 * 1000000000); // Convert hours to nanoseconds
        
        let mpcTransaction: MPCTransaction = {
          id = transactionId;
          mpcWalletId = mpcWalletId;
          type_ = type_;
          amount = amount;
          currency = currency;
          toAddress = toAddress;
          fromAddress = null;
          description = description;
          status = "pending_approval";
          approvals = [];
          requiredApprovals = wallet.threshold;
          expiresAt = expiresAt;
          createdAt = now;
          executedAt = null;
          txHash = null;
          metadata = null;
        };
        
        mpcTransactions.put(transactionId, mpcTransaction);
        
        // Index by user
        let currentTransactions = Option.get(userMPCTransactions.get(caller), []);
        userMPCTransactions.put(caller, Array.append(currentTransactions, [transactionId]));
        
        return #ok(mpcTransaction);
      };
    };
  };
  
  // Approve or reject a transaction
  public shared(msg) func approveMPCTransaction(
    transactionId: Text,
    approved: Bool,
    signature: ?Text
  ): async Result.Result<MPCTransaction, Text> {
    let caller = msg.caller;
    
    switch (mpcTransactions.get(transactionId)) {
      case null { return #err("Transaction not found"); };
      case (?transaction) {
        // Check if transaction is still pending
        if (transaction.status != "pending_approval") {
          return #err("Transaction is no longer pending approval");
        };
        
        // Check if transaction has expired
        let now = getCurrentTime();
        if (now > transaction.expiresAt) {
          let expiredTransaction: MPCTransaction = {
            id = transaction.id;
            mpcWalletId = transaction.mpcWalletId;
            type_ = transaction.type_;
            amount = transaction.amount;
            currency = transaction.currency;
            toAddress = transaction.toAddress;
            fromAddress = transaction.fromAddress;
            description = transaction.description;
            status = "expired";
            approvals = transaction.approvals;
            requiredApprovals = transaction.requiredApprovals;
            expiresAt = transaction.expiresAt;
            createdAt = transaction.createdAt;
            executedAt = null;
            txHash = transaction.txHash;
            metadata = transaction.metadata;
          };
          mpcTransactions.put(transactionId, expiredTransaction);
          return #err("Transaction has expired");
        };
        
        // Get wallet to check if caller is a party
        switch (mpcWallets.get(transaction.mpcWalletId)) {
          case null { return #err("MPC wallet not found"); };
          case (?wallet) {
            let callerParty = Array.find<Party>(wallet.parties, func(party) {
              Principal.equal(party.userId, caller) and party.isActive
            });
            
            switch (callerParty) {
              case null { return #err("You are not a party to this wallet"); };
              case (?party) {
                // Check if already approved/rejected
                let existingApproval = Array.find<Approval>(transaction.approvals, func(approval) {
                  Text.equal(approval.partyId, party.id)
                });
                
                switch (existingApproval) {
                  case (?_) { return #err("You have already voted on this transaction"); };
                  case null {
                    // Create new approval
                    let newApproval: Approval = {
                      partyId = party.id;
                      userId = caller;
                      approved = approved;
                      timestamp = now;
                      signature = signature;
                      deviceInfo = null;
                    };
                    
                    let updatedApprovals = Array.append(transaction.approvals, [newApproval]);
                    
                    // Check if we have enough approvals
                    let approvedCount = Array.filter<Approval>(updatedApprovals, func(approval) {
                      approval.approved
                    }).size();
                    
                    let newStatus = if (approvedCount >= transaction.requiredApprovals) {
                      "approved"
                    } else {
                      "pending_approval"
                    };
                    
                    let updatedTransaction: MPCTransaction = {
                      id = transaction.id;
                      mpcWalletId = transaction.mpcWalletId;
                      type_ = transaction.type_;
                      amount = transaction.amount;
                      currency = transaction.currency;
                      toAddress = transaction.toAddress;
                      fromAddress = transaction.fromAddress;
                      description = transaction.description;
                      status = newStatus;
                      approvals = updatedApprovals;
                      requiredApprovals = transaction.requiredApprovals;
                      expiresAt = transaction.expiresAt;
                      createdAt = transaction.createdAt;
                      executedAt = if (newStatus == "approved") ?now else null;
                      txHash = transaction.txHash;
                      metadata = transaction.metadata;
                    };
                    
                    mpcTransactions.put(transactionId, updatedTransaction);
                    
                    // If approved, execute the transaction
                    if (newStatus == "approved") {
                      await executeMPCTransaction(transactionId);
                    };
                    
                    return #ok(updatedTransaction);
                  };
                };
              };
            };
          };
        };
      };
    };
  };
  
  // ============ SOCIAL MEDIA MPC TRANSFERS ============
  
  // Create a social media money transfer with MPC approval
  public shared(msg) func createSocialTransfer(
    mpcWalletId: MPCWalletId,
    platform: Text,
    recipient: Text,
    amount: Float,
    currency: Text,
    message: ?Text,
    isPrivate: Bool
  ): async Result.Result<SocialTransfer, Text> {
    let caller = msg.caller;
    
    // Validate platform
    let validPlatforms = ["instagram", "whatsapp", "twitter", "telegram", "discord", "slack"];
    if (not Array.contains<Text>(platform, validPlatforms, Text.equal)) {
      return #err("Unsupported platform");
    };
    
    switch (mpcWallets.get(mpcWalletId)) {
      case null { return #err("MPC wallet not found"); };
      case (?wallet) {
        // Check if caller is a party
        let callerParty = Array.find<Party>(wallet.parties, func(party) {
          Principal.equal(party.userId, caller) and party.isActive
        });
        let isParty = callerParty != null;
        
        if (not isParty) {
          return #err("Only wallet parties can create social transfers");
        };
        
        let transferId = generateId("social_transfer", nextMPCTransactionId);
        nextMPCTransactionId += 1;
        
        let now = getCurrentTime();
        
        let socialTransfer: SocialTransfer = {
          id = transferId;
          mpcWalletId = mpcWalletId;
          platform = platform;
          recipient = recipient;
          amount = amount;
          currency = currency;
          message = message;
          isPrivate = isPrivate;
          status = "pending_approval";
          approvals = [];
          createdAt = now;
        };
        
        socialTransfers.put(transferId, socialTransfer);
        
        // Create corresponding MPC transaction
        let transactionId = generateId("mpc_txn", nextMPCTransactionId);
        nextMPCTransactionId += 1;
        
        let mpcTransaction: MPCTransaction = {
          id = transactionId;
          mpcWalletId = mpcWalletId;
          type_ = "social_transfer";
          amount = amount;
          currency = currency;
          toAddress = ?recipient;
          fromAddress = null;
          description = ?("Social transfer to " # platform # " user: " # recipient);
          status = "pending_approval";
          approvals = [];
          requiredApprovals = wallet.threshold;
          expiresAt = now + (24 * 3600 * 1000000000); // 24 hours
          createdAt = now;
          executedAt = null;
          txHash = null;
          metadata = ?("social_transfer_id:" # transferId);
        };
        
        mpcTransactions.put(transactionId, mpcTransaction);
        
        return #ok(socialTransfer);
      };
    };
  };
  
  // ============ QUERY FUNCTIONS ============
  
  public query func getMPCWallets(userId: UserId): async [MPCWallet] {
    switch (userMPCWallets.get(userId)) {
      case null { [] };
      case (?walletIds) {
        Array.mapFilter<MPCWalletId, MPCWallet>(walletIds, func(id) {
          mpcWallets.get(id);
        });
      };
    };
  };
  
  public query func getMPCWallet(mpcWalletId: MPCWalletId): async ?MPCWallet {
    mpcWallets.get(mpcWalletId);
  };
  
  public query func getMPCTransactions(userId: UserId): async [MPCTransaction] {
    switch (userMPCTransactions.get(userId)) {
      case null { [] };
      case (?transactionIds) {
        Array.mapFilter<Text, MPCTransaction>(transactionIds, func(id) {
          mpcTransactions.get(id);
        });
      };
    };
  };
  
  public query func getSocialTransfers(userId: UserId): async [SocialTransfer] {
    // Get all social transfers for user's MPC wallets
    let userWalletIds = Option.get(userMPCWallets.get(userId), []);
    let allTransfers = Iter.toArray(socialTransfers.entries());
    
    Array.filter<SocialTransfer>(Array.map<(Text, SocialTransfer), SocialTransfer>(allTransfers, func((_, transfer)) = transfer), func(transfer) {
      Array.contains<MPCWalletId>(transfer.mpcWalletId, userWalletIds, Text.equal)
    });
  };
  
  // ============ PRIVATE FUNCTIONS ============
  
  private func generateId(prefix: Text, counter: Nat): Text {
    prefix # "_" # Nat.toText(counter) # "_" # Int.toText(getCurrentTime());
  };
  
  private func getCurrentTime(): Int {
    Time.now();
  };
  
  private func generateKeyShares(mpcWalletId: MPCWalletId, parties: [Party]): async () {
    // Simplified key share generation
    // In production, implement proper threshold cryptography
    for (party in parties.vals()) {
      let keyShare: MPCKeyShare = {
        partyId = party.id;
        userId = party.userId;
        share = "encrypted_key_share_" # party.id; // Placeholder
        index = 0;
        isActive = true;
        createdAt = getCurrentTime();
        lastRotatedAt = null;
      };
      keyShares.put(party.id, keyShare);
    };
  };
  
  private func generateKeyShare(partyId: PartyId, mpcWalletId: MPCWalletId): async () {
    let keyShare: MPCKeyShare = {
      partyId = partyId;
      userId = Principal.fromText("anonymous"); // Will be updated
      share = "encrypted_key_share_" # partyId;
      index = 0;
      isActive = true;
      createdAt = getCurrentTime();
      lastRotatedAt = null;
    };
    keyShares.put(partyId, keyShare);
  };
  
  private func executeMPCTransaction(transactionId: Text): async () {
    // Execute the approved transaction
    // This would integrate with the main Nisto backend
    Debug.print("Executing MPC transaction: " # transactionId);
  };
  
  // ============ ADMIN FUNCTIONS ============
  
  public shared(msg) func getSystemStats(): async {
    totalMPCWallets: Nat;
    totalMPCTransactions: Nat;
    totalParties: Nat;
    activeWallets: Nat;
  } {
    let totalWallets = mpcWallets.size();
    let totalTransactions = mpcTransactions.size();
    let totalPartiesCount = partyIndex.size();
    
    let activeWalletsCount = Array.filter<MPCWallet>(Iter.toArray(mpcWallets.vals()), func(wallet) {
      Text.equal(wallet.status, "active")
    }).size();
    
    {
      totalMPCWallets = totalWallets;
      totalMPCTransactions = totalTransactions;
      totalParties = totalPartiesCount;
      activeWallets = activeWalletsCount;
    };
  };
}
