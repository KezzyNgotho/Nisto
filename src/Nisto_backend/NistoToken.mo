import Debug "mo:base/Debug";
import HashMap "mo:base/HashMap";
import Text "mo:base/Text";
import Array "mo:base/Array";
import Time "mo:base/Time";
import Int "mo:base/Int";
import Nat "mo:base/Nat";
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

shared({ caller = initializer }) actor class NistoToken() = {

  // ============ DATA TYPES ============
  public type UserId = Principal;
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

  // ============ STATE VARIABLES ============
  private var tokenName: Text = "Nisto Token";
  private var tokenSymbol: Text = "NST";
  private var tokenDecimals: Nat8 = 8;
  private var totalSupply: Nat = 1_000_000_000_000_000;
  private var circulatingSupply: Nat = 0;
  private var treasuryAddress: UserId = Principal.fromText("2vxsx-fae");
  private var burnAddress: UserId = Principal.fromText("2vxsx-fae");
  private var isPaused: Bool = false;
  private var maxTransactionLimit: Nat = 10_000_000_000_000;
  private var maxWalletLimit: Nat = 100_000_000_000_000;
  private var balances = HashMap.HashMap<UserId, Nat>(0, Principal.equal, Principal.hash);
  private var allowances = HashMap.HashMap<Text, Nat>(0, Text.equal, Text.hash);
  private var lockedBalances = HashMap.HashMap<UserId, Nat>(0, Principal.equal, Principal.hash);
  private var stakedBalances = HashMap.HashMap<UserId, Nat>(0, Principal.equal, Principal.hash);
  private var transfers = Buffer.Buffer<TokenTransfer>(0);
  private var mints = Buffer.Buffer<TokenMint>(0);
  private var burns = Buffer.Buffer<TokenBurn>(0);
  private var stakingInfo = HashMap.HashMap<UserId, StakingInfo>(0, Principal.equal, Principal.hash);
  private var stakingRewardRate: Float = 0.05;
  private var totalStaked: Nat = 0;
  private var governanceVotes = HashMap.HashMap<Text, [GovernanceVote]>(0, Text.equal, Text.hash);
  private var minVotingPower: Nat = 1_000_000_000;
  private var currentBlockNumber: Nat = 0;

  // ============ HELPER FUNCTIONS ============
  private func generateId(prefix: Text, counter: Nat): Text {
    Text.concat(prefix, Text.concat("_", Nat.toText(counter)));
  };
  private func getCurrentTime(): Int {
    Time.now();
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
        if (not info.isStaking) { return 0; };
        let currentTime = getCurrentTime();
        let timeStaked = currentTime - info.lastRewardTime;
        let rewardRatePerSecond = stakingRewardRate / 365.0 / 24.0 / 60.0 / 60.0;
        let rewardsFloat = Float.fromInt(info.stakedAmount) * rewardRatePerSecond * Float.fromInt(timeStaked);
        let rewards = Float.toInt(rewardsFloat);
        let natRewards = switch (rewards) {
          case null { 0 };
          case (?r) { if (r < 0) 0 else Nat.abs(r) };
        };
        natRewards
      };
    };
  };

  // ============ PUBLIC FUNCTIONS ============
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
      createdAt = getCurrentTime();
      updatedAt = getCurrentTime();
    }
  };
  public query func balanceOf(owner: UserId): async Nat {
    Option.get(balances.get(owner), 0)
  };
  public query func getTotalBalance(owner: UserId): async TokenBalance {
    let balance = Option.get(balances.get(owner), 0);
    let locked = Option.get(lockedBalances.get(owner), 0);
    let staked = Option.get(stakedBalances.get(owner), 0);
    {
      owner = owner;
      balance = balance;
      lockedBalance = locked;
      stakedBalance = staked;
      lastUpdated = getCurrentTime();
    }
  };
  public query func allowance(owner: UserId, spender: UserId): async Nat {
    let key = getAllowanceKey(owner, spender);
    Option.get(allowances.get(key), 0)
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
    let callerBalance = Option.get(balances.get(caller), 0);
    if (callerBalance < amount) {
      return #err("Insufficient balance");
    };
    let toBalance = Option.get(balances.get(to), 0);
    if (toBalance + amount > maxWalletLimit) {
      return #err("Recipient would exceed maximum wallet limit");
    };
    // Update balances
    balances.put(caller, callerBalance - amount);
    balances.put(to, toBalance + amount);
    // Record transfer
    let blockNumber = incrementBlock();
    let timestamp = getCurrentTime();
    let transactionHash = generateTransactionHash(caller, to, amount, timestamp);
    let transfer: TokenTransfer = {
      id = generateId("transfer", transfers.size());
      from = caller;
      to = to;
      amount = amount;
      timestamp = timestamp;
      transactionHash = transactionHash;
      blockNumber = blockNumber;
    };
    transfers.add(transfer);
    #ok(true)
  };
  public shared(msg) func approve(spender: UserId, amount: Nat): async Result.Result<Bool, Text> {
    let caller = msg.caller;
    let key = getAllowanceKey(caller, spender);
    allowances.put(key, amount);
    #ok(true)
  };
  public shared(msg) func transferFrom(from: UserId, to: UserId, amount: Nat): async Result.Result<Bool, Text> {
    let caller = msg.caller;
    if (isPaused) {
      return #err("Token transfers are currently paused");
    };
    let key = getAllowanceKey(from, caller);
    let allowance = Option.get(allowances.get(key), 0);
    if (allowance < amount) {
      return #err("Insufficient allowance");
    };
    let fromBalance = Option.get(balances.get(from), 0);
    if (fromBalance < amount) {
      return #err("Insufficient balance");
    };
    // Update balances and allowance
    balances.put(from, fromBalance - amount);
    let toBalance = Option.get(balances.get(to), 0);
    balances.put(to, toBalance + amount);
    allowances.put(key, allowance - amount);
    // Record transfer
    let blockNumber = incrementBlock();
    let timestamp = getCurrentTime();
    let transactionHash = generateTransactionHash(from, to, amount, timestamp);
    let transfer: TokenTransfer = {
      id = generateId("transfer", transfers.size());
      from = from;
      to = to;
      amount = amount;
      timestamp = timestamp;
      transactionHash = transactionHash;
      blockNumber = blockNumber;
    };
    transfers.add(transfer);
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
    let toBalance = Option.get(balances.get(to), 0);
    balances.put(to, toBalance + amount);
    circulatingSupply += amount;
    // Record mint
    let blockNumber = incrementBlock();
    let timestamp = getCurrentTime();
    let mint: TokenMint = {
      id = generateId("mint", mints.size());
      to = to;
      amount = amount;
      reason = reason;
      timestamp = timestamp;
      blockNumber = blockNumber;
    };
    mints.add(mint);
    #ok(true)
  };
  public shared(msg) func burn(amount: Nat, reason: Text): async Result.Result<Bool, Text> {
    let caller = msg.caller;
    if (amount == 0) {
      return #err("Burn amount must be greater than 0");
    };
    let callerBalance = Option.get(balances.get(caller), 0);
    if (callerBalance < amount) {
      return #err("Insufficient balance to burn");
    };
    balances.put(caller, callerBalance - amount);
    circulatingSupply -= amount;
    // Record burn
    let blockNumber = incrementBlock();
    let timestamp = getCurrentTime();
    let burn: TokenBurn = {
      id = generateId("burn", burns.size());
      from = caller;
      amount = amount;
      reason = reason;
      timestamp = timestamp;
      blockNumber = blockNumber;
    };
    burns.add(burn);
    #ok(true)
  };
  public shared(msg) func stake(amount: Nat): async Result.Result<Bool, Text> {
    let caller = msg.caller;
    if (amount == 0) {
      return #err("Stake amount must be greater than 0");
    };
    let callerBalance = Option.get(balances.get(caller), 0);
    if (callerBalance < amount) {
      return #err("Insufficient balance to stake");
    };
    // Calculate and distribute existing rewards
    let existingRewards = calculateStakingRewards(caller);
    if (existingRewards > 0) {
      balances.put(caller, callerBalance + existingRewards);
      circulatingSupply += existingRewards;
    };
    // Update staking info
    let currentTime = getCurrentTime();
    let currentStaked = Option.get(stakedBalances.get(caller), 0);
    let newStakedAmount = currentStaked + amount;
    stakedBalances.put(caller, newStakedAmount);
    balances.put(caller, callerBalance - amount);
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
        let callerBalance = Option.get(balances.get(caller), 0);
        balances.put(caller, callerBalance + amount + rewards);
        circulatingSupply += rewards;
        let newStakedAmount = info.stakedAmount - amount;
        let currentTime = getCurrentTime();
        stakedBalances.put(caller, newStakedAmount);
        totalStaked -= amount;
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
    let callerBalance = Option.get(balances.get(caller), 0);
    balances.put(caller, callerBalance + rewards);
    circulatingSupply += rewards;
    // Update last reward time
    switch (stakingInfo.get(caller)) {
      case null { return #err("No staking found for user"); };
      case (?info) {
        let updatedInfo: StakingInfo = {
          userId = caller;
          stakedAmount = info.stakedAmount;
          stakingStartTime = info.stakingStartTime;
          lastRewardTime = getCurrentTime();
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
    let size = transfers.size();
    let start = if (offset < size) offset else size;
    let end = if (start + limit < size) start + limit else size;
    let result = Buffer.Buffer<TokenTransfer>(0);
    var i = start;
    while (i < end) {
      result.add(transfers.get(i));
      i += 1;
    };
    Buffer.toArray(result)
  };
  public query func getMintHistory(limit: Nat, offset: Nat): async [TokenMint] {
    let size = mints.size();
    let start = if (offset < size) offset else size;
    let end = if (start + limit < size) start + limit else size;
    let result = Buffer.Buffer<TokenMint>(0);
    var i = start;
    while (i < end) {
      result.add(mints.get(i));
      i += 1;
    };
    Buffer.toArray(result)
  };
  public query func getBurnHistory(limit: Nat, offset: Nat): async [TokenBurn] {
    let size = burns.size();
    let start = if (offset < size) offset else size;
    let end = if (start + limit < size) start + limit else size;
    let result = Buffer.Buffer<TokenBurn>(0);
    var i = start;
    while (i < end) {
      result.add(burns.get(i));
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
}; 