import HashMap "mo:base/HashMap";
import Principal "mo:base/Principal";
import Text "mo:base/Text";
import Nat "mo:base/Nat";
import Int "mo:base/Int";
import Array "mo:base/Array";
import Option "mo:base/Option";
import Time "mo:base/Time";

persistent actor MPCService {
  
  // ============ TYPES ============
  
  public type UserId = Principal;
  public type MPCWalletId = Text;
  public type PartyId = Text;
  public type TransactionId = Text;
  
  public type Party = {
    id: PartyId;
    userId: UserId;
    role: Text; // "admin", "member", "viewer"
    joinedAt: Int;
  };
  
  public type MPCKeyShare = {
    partyId: PartyId;
    walletId: MPCWalletId;
    share: Text; // Encrypted key share
    createdAt: Int;
  };
  
  public type MPCWallet = {
    id: MPCWalletId;
    name: Text;
    description: Text;
    parties: [PartyId];
    threshold: Nat; // Minimum parties needed to sign
    totalParties: Nat;
    balance: Nat; // In smallest unit
    currency: Text; // "NST", "KES", etc.
    createdAt: Int;
    isActive: Bool;
  };
  
  public type Approval = {
    partyId: PartyId;
    approved: Bool;
    timestamp: Int;
    signature: ?Text;
  };
  
  public type MPCTransaction = {
    id: TransactionId;
    walletId: MPCWalletId;
    from: UserId;
    to: UserId;
    amount: Nat;
    currency: Text;
    description: Text;
    approvals: [Approval];
    status: Text; // "pending", "approved", "rejected", "executed"
    createdAt: Int;
    executedAt: ?Int;
  };
  
  public type SocialTransfer = {
    id: TransactionId;
    from: UserId;
    to: UserId;
    amount: Nat;
    currency: Text;
    platform: Text; // "instagram", "whatsapp", "twitter", etc.
    message: Text;
    approvals: [Approval];
    status: Text;
    createdAt: Int;
  };
  
  // ============ STORAGE ============
  
  private transient var nextMPCWalletId: Nat = 1;
  private transient var nextMPCTransactionId: Nat = 1;
  private transient var nextPartyId: Nat = 1;
  
  private transient let mpcWallets = HashMap.HashMap<MPCWalletId, MPCWallet>(0, Text.equal, Text.hash);
  private transient let userMPCWallets = HashMap.HashMap<UserId, [MPCWalletId]>(0, Principal.equal, Principal.hash);
  private transient let mpcTransactions = HashMap.HashMap<Text, MPCTransaction>(0, Text.equal, Text.hash);
  private transient let userMPCTransactions = HashMap.HashMap<UserId, [Text]>(0, Principal.equal, Principal.hash);
  private transient let keyShares = HashMap.HashMap<PartyId, MPCKeyShare>(0, Text.equal, Text.hash);
  private transient let socialTransfers = HashMap.HashMap<Text, SocialTransfer>(0, Text.equal, Text.hash);
  private transient let partyIndex = HashMap.HashMap<PartyId, Party>(0, Text.equal, Text.hash);
  
  // ============ MPC WALLET MANAGEMENT ============
  
  public shared(msg) func createMPCWallet(
    name: Text,
    description: Text,
    parties: [UserId],
    threshold: Nat
  ): async MPCWalletId {
    let caller = msg.caller;
    let walletId = "mpc_" # Nat.toText(nextMPCWalletId);
    nextMPCWalletId += 1;
    
    // Create party objects
    let partyObjects: [Party] = Array.map<UserId, Party>(parties, func(userId) {
      let partyId = "party_" # Nat.toText(nextPartyId);
      nextPartyId += 1;
      
      let party: Party = {
        id = partyId;
        userId = userId;
        role = if (userId == caller) "admin" else "member";
        joinedAt = Time.now();
      };
      
      partyIndex.put(partyId, party);
      party;
    });
    
    let partyIds = Array.map<Party, PartyId>(partyObjects, func(p) = p.id);
    
    let wallet: MPCWallet = {
      id = walletId;
      name = name;
      description = description;
      parties = partyIds;
      threshold = threshold;
      totalParties = partyObjects.size();
      balance = 0;
      currency = "NST";
      createdAt = Time.now();
      isActive = true;
    };
    
    mpcWallets.put(walletId, wallet);
    
    // Add wallet to each user's list
    for (userId in parties.vals()) {
      switch (userMPCWallets.get(userId)) {
        case null { userMPCWallets.put(userId, [walletId]); };
        case (?wallets) { 
          userMPCWallets.put(userId, Array.append(wallets, [walletId]));
        };
      };
    };
    
    walletId;
  };
  
  public query func getMPCWallet(walletId: MPCWalletId): async ?MPCWallet {
    mpcWallets.get(walletId);
  };
  
  public query func getUserMPCWallets(userId: UserId): async [MPCWallet] {
    switch (userMPCWallets.get(userId)) {
      case null { [] };
      case (?walletIds) {
        Array.mapFilter<MPCWalletId, MPCWallet>(walletIds, func(id) = mpcWallets.get(id));
      };
    };
  };
  
  // ============ MPC TRANSACTIONS ============
  
  public shared(msg) func createMPCTransaction(
    walletId: MPCWalletId,
    to: UserId,
    amount: Nat,
    currency: Text,
    description: Text
  ): async ?TransactionId {
    let caller = msg.caller;
    
    switch (mpcWallets.get(walletId)) {
      case null { null };
      case (?wallet) {
        // Check if caller is a party in this wallet
        let isParty = Array.find<PartyId>(wallet.parties, func(partyId) = 
          switch (partyIndex.get(partyId)) {
            case null { false };
            case (?party) { party.userId == caller };
          }
        ) != null;
        
        if (not isParty) { return null; };
        
        let transactionId = "tx_" # Nat.toText(nextMPCTransactionId);
        nextMPCTransactionId += 1;
        
        let transaction: MPCTransaction = {
          id = transactionId;
          walletId = walletId;
          from = caller;
          to = to;
          amount = amount;
          currency = currency;
          description = description;
          approvals = [];
          status = "pending";
          createdAt = Time.now();
          executedAt = null;
        };
        
        mpcTransactions.put(transactionId, transaction);
        
        // Add to user's transaction list
        switch (userMPCTransactions.get(caller)) {
          case null { userMPCTransactions.put(caller, [transactionId]); };
          case (?txs) { 
            userMPCTransactions.put(caller, Array.append(txs, [transactionId]));
          };
        };
        
        ?transactionId;
      };
    };
  };
  
  public shared(msg) func approveMPCTransaction(
    transactionId: TransactionId,
    approved: Bool
  ): async Bool {
    let caller = msg.caller;
    
    switch (mpcTransactions.get(transactionId)) {
      case null { false };
      case (?transaction) {
        switch (mpcWallets.get(transaction.walletId)) {
          case null { false };
          case (?wallet) {
            // Check if caller is a party in this wallet
            let isParty = Array.find<PartyId>(wallet.parties, func(partyId) = 
              switch (partyIndex.get(partyId)) {
                case null { false };
                case (?party) { party.userId == caller };
              }
            ) != null;
            
            if (not isParty) { return false; };
            
            // Check if already approved by this party
            let alreadyApproved = Array.find<Approval>(transaction.approvals, func(approval) = 
              switch (partyIndex.get(approval.partyId)) {
                case null { false };
                case (?party) { party.userId == caller };
              }
            ) != null;
            
            if (alreadyApproved) { return false; };
            
            // Add approval
            let partyId = Array.find<PartyId>(wallet.parties, func(pid) = 
              switch (partyIndex.get(pid)) {
                case null { false };
                case (?party) { party.userId == caller };
              }
            );
            
            switch (partyId) {
              case null { false };
              case (?pid) {
                let approval: Approval = {
                  partyId = pid;
                  approved = approved;
                  timestamp = Time.now();
                  signature = null;
                };
                
                let newApprovals = Array.append(transaction.approvals, [approval]);
                let approvedCount = Array.filter<Approval>(newApprovals, func(a) = a.approved).size();
                
                let newStatus = if (approvedCount >= wallet.threshold) {
                  "approved"
                } else {
                  "pending"
                };
                
                let updatedTransaction: MPCTransaction = {
                  transaction with
                  approvals = newApprovals;
                  status = newStatus;
                };
                
                mpcTransactions.put(transactionId, updatedTransaction);
                true;
              };
            };
          };
        };
      };
    };
  };
  
  public query func getMPCTransactions(walletId: MPCWalletId): async [MPCTransaction] {
    let allTransactions = mpcTransactions.vals();
    let transactions = Array.tabulate<MPCTransaction>(mpcTransactions.size(), func(i) = {
      let iter = mpcTransactions.vals();
      var count = 0;
      for (tx in iter) {
        if (count == i) return tx;
        count += 1;
      };
      // This should never happen, but return a dummy transaction
      {
        id = "";
        walletId = "";
        from = Principal.fromText("aaaaa-aa");
        to = Principal.fromText("aaaaa-aa");
        amount = 0;
        currency = "";
        description = "";
        approvals = [];
        status = "";
        createdAt = 0;
        executedAt = null;
      }
    });
    Array.filter<MPCTransaction>(transactions, func(tx) = tx.walletId == walletId);
  };
  
  // ============ SOCIAL MEDIA INTEGRATION ============
  
  public shared(msg) func createSocialTransfer(
    to: UserId,
    amount: Nat,
    currency: Text,
    platform: Text,
    message: Text
  ): async ?TransactionId {
    let caller = msg.caller;
    
    let transferId = "social_" # Nat.toText(nextMPCTransactionId);
    nextMPCTransactionId += 1;
    
    let transfer: SocialTransfer = {
      id = transferId;
      from = caller;
      to = to;
      amount = amount;
      currency = currency;
      platform = platform;
      message = message;
      approvals = [];
      status = "pending";
      createdAt = Time.now();
    };
    
    socialTransfers.put(transferId, transfer);
    ?transferId;
  };
  
  public shared(msg) func approveSocialTransfer(
    transferId: TransactionId,
    approved: Bool
  ): async Bool {
    let caller = msg.caller;
    
    switch (socialTransfers.get(transferId)) {
      case null { false };
      case (?transfer) {
        // For social transfers, we'll use a simple approval system
        // In a real implementation, this would integrate with the MPC wallet system
        
        let approval: Approval = {
          partyId = "social_" # Principal.toText(caller);
          approved = approved;
          timestamp = Time.now();
          signature = null;
        };
        
        let newApprovals = Array.append(transfer.approvals, [approval]);
        let approvedCount = Array.filter<Approval>(newApprovals, func(a) = a.approved).size();
        
        let newStatus = if (approvedCount >= 1) { // Simple 1-of-1 approval for social transfers
          "approved"
        } else {
          "pending"
        };
        
        let updatedTransfer: SocialTransfer = {
          transfer with
          approvals = newApprovals;
          status = newStatus;
        };
        
        socialTransfers.put(transferId, updatedTransfer);
        true;
      };
    };
  };
  
  public query func getSocialTransfers(userId: UserId): async [SocialTransfer] {
    let allTransfers = socialTransfers.vals();
    let transfers = Array.tabulate<SocialTransfer>(socialTransfers.size(), func(i) = {
      let iter = socialTransfers.vals();
      var count = 0;
      for (transfer in iter) {
        if (count == i) return transfer;
        count += 1;
      };
      // This should never happen, but return a dummy transfer
      {
        id = "";
        from = Principal.fromText("aaaaa-aa");
        to = Principal.fromText("aaaaa-aa");
        amount = 0;
        currency = "";
        platform = "";
        message = "";
        approvals = [];
        status = "";
        createdAt = 0;
      }
    });
    Array.filter<SocialTransfer>(transfers, func(transfer) = 
      transfer.from == userId or transfer.to == userId
    );
  };
  
  // ============ UTILITY FUNCTIONS ============
  
  public query func getMPCStats(): async {
    totalWallets: Nat;
    totalTransactions: Nat;
    totalSocialTransfers: Nat;
  } {
    {
      totalWallets = mpcWallets.size();
      totalTransactions = mpcTransactions.size();
      totalSocialTransfers = socialTransfers.size();
    };
  };
  
  public query func healthCheck(): async Text {
    "MPC Service is running";
  };
}