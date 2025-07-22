// ===== IMPORTS =====
import Principal "mo:base/Principal";
import Result "mo:base/Result";
import Int "mo:base/Int";
import Text "mo:base/Text";

// ===== VAULT MODULE =====
module {

  // ===== VAULT ACTION TYPES =====
  /// The type of action that can be proposed for a vault.
  public type VaultActionType = {
    #DeleteVault;
    #RemoveMember;
    #ChangeRole;
    #TogglePrivacy;
  };

  /// A proposal for a vault action.
  public type VaultActionProposal = {
    id: Text;
    vaultId: Text;
    actionType: VaultActionType;
    proposerId: Principal;
    targetId: ?Principal;
    newRole: ?Text;
    votes: [(Principal, Bool)];
    status: Text;
    createdAt: Int;
    metadata: ?Text;
  };

  /// An appeal for a vault action proposal.
  public type VaultActionAppeal = {
    id: Text;
    proposalId: Text;
    appellantId: Principal;
    reason: Text;
    status: Text;
    createdAt: Int;
  };

  // ===== CONSTANTS =====
  public let PROPOSAL_EXPIRATION: Int = 259200; // 3 days in seconds

  // ===== HELPERS =====
  /// Returns true if the proposal is expired.
  public func isProposalExpired(proposal: VaultActionProposal, now: Int): Bool {
    now - proposal.createdAt > PROPOSAL_EXPIRATION;
  };

  // ===== NOTE =====
  // All stateful logic (storage, counters, etc.) must be managed in the actor, not in this module.
  // This module is for types, constants, and pure helper functions only.
} 