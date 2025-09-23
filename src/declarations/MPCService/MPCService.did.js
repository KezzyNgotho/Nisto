export const idlFactory = ({ IDL }) => {
  const TransactionId = IDL.Text;
  const MPCWalletId = IDL.Text;
  const UserId = IDL.Principal;
  const PartyId = IDL.Text;
  const Approval = IDL.Record({
    'signature' : IDL.Opt(IDL.Text),
    'approved' : IDL.Bool,
    'timestamp' : IDL.Int,
    'partyId' : PartyId,
  });
  const MPCTransaction = IDL.Record({
    'id' : TransactionId,
    'to' : UserId,
    'status' : IDL.Text,
    'executedAt' : IDL.Opt(IDL.Int),
    'from' : UserId,
    'createdAt' : IDL.Int,
    'description' : IDL.Text,
    'currency' : IDL.Text,
    'amount' : IDL.Nat,
    'approvals' : IDL.Vec(Approval),
    'walletId' : MPCWalletId,
  });
  const MPCWallet = IDL.Record({
    'id' : MPCWalletId,
    'balance' : IDL.Nat,
    'threshold' : IDL.Nat,
    'name' : IDL.Text,
    'createdAt' : IDL.Int,
    'description' : IDL.Text,
    'isActive' : IDL.Bool,
    'totalParties' : IDL.Nat,
    'currency' : IDL.Text,
    'parties' : IDL.Vec(PartyId),
  });
  const SocialTransfer = IDL.Record({
    'id' : TransactionId,
    'to' : UserId,
    'status' : IDL.Text,
    'from' : UserId,
    'createdAt' : IDL.Int,
    'platform' : IDL.Text,
    'message' : IDL.Text,
    'currency' : IDL.Text,
    'amount' : IDL.Nat,
    'approvals' : IDL.Vec(Approval),
  });
  return IDL.Service({
    'approveMPCTransaction' : IDL.Func(
        [TransactionId, IDL.Bool],
        [IDL.Bool],
        [],
      ),
    'approveSocialTransfer' : IDL.Func(
        [TransactionId, IDL.Bool],
        [IDL.Bool],
        [],
      ),
    'createMPCTransaction' : IDL.Func(
        [MPCWalletId, UserId, IDL.Nat, IDL.Text, IDL.Text],
        [IDL.Opt(TransactionId)],
        [],
      ),
    'createMPCWallet' : IDL.Func(
        [IDL.Text, IDL.Text, IDL.Vec(UserId), IDL.Nat],
        [MPCWalletId],
        [],
      ),
    'createSocialTransfer' : IDL.Func(
        [UserId, IDL.Nat, IDL.Text, IDL.Text, IDL.Text],
        [IDL.Opt(TransactionId)],
        [],
      ),
    'getMPCStats' : IDL.Func(
        [],
        [
          IDL.Record({
            'totalSocialTransfers' : IDL.Nat,
            'totalWallets' : IDL.Nat,
            'totalTransactions' : IDL.Nat,
          }),
        ],
        ['query'],
      ),
    'getMPCTransactions' : IDL.Func(
        [MPCWalletId],
        [IDL.Vec(MPCTransaction)],
        ['query'],
      ),
    'getMPCWallet' : IDL.Func([MPCWalletId], [IDL.Opt(MPCWallet)], ['query']),
    'getSocialTransfers' : IDL.Func(
        [UserId],
        [IDL.Vec(SocialTransfer)],
        ['query'],
      ),
    'getUserMPCWallets' : IDL.Func([UserId], [IDL.Vec(MPCWallet)], ['query']),
    'healthCheck' : IDL.Func([], [IDL.Text], ['query']),
  });
};
export const init = ({ IDL }) => { return []; };
