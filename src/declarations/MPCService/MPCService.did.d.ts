import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';

export interface Approval {
  'signature' : [] | [string],
  'approved' : boolean,
  'timestamp' : bigint,
  'partyId' : PartyId,
}
export interface MPCTransaction {
  'id' : TransactionId,
  'to' : UserId,
  'status' : string,
  'executedAt' : [] | [bigint],
  'from' : UserId,
  'createdAt' : bigint,
  'description' : string,
  'currency' : string,
  'amount' : bigint,
  'approvals' : Array<Approval>,
  'walletId' : MPCWalletId,
}
export interface MPCWallet {
  'id' : MPCWalletId,
  'balance' : bigint,
  'threshold' : bigint,
  'name' : string,
  'createdAt' : bigint,
  'description' : string,
  'isActive' : boolean,
  'totalParties' : bigint,
  'currency' : string,
  'parties' : Array<PartyId>,
}
export type MPCWalletId = string;
export type PartyId = string;
export interface SocialTransfer {
  'id' : TransactionId,
  'to' : UserId,
  'status' : string,
  'from' : UserId,
  'createdAt' : bigint,
  'platform' : string,
  'message' : string,
  'currency' : string,
  'amount' : bigint,
  'approvals' : Array<Approval>,
}
export type TransactionId = string;
export type UserId = Principal;
export interface _SERVICE {
  'approveMPCTransaction' : ActorMethod<[TransactionId, boolean], boolean>,
  'approveSocialTransfer' : ActorMethod<[TransactionId, boolean], boolean>,
  'createMPCTransaction' : ActorMethod<
    [MPCWalletId, UserId, bigint, string, string],
    [] | [TransactionId]
  >,
  'createMPCWallet' : ActorMethod<
    [string, string, Array<UserId>, bigint],
    MPCWalletId
  >,
  'createSocialTransfer' : ActorMethod<
    [UserId, bigint, string, string, string],
    [] | [TransactionId]
  >,
  'getMPCStats' : ActorMethod<
    [],
    {
      'totalSocialTransfers' : bigint,
      'totalWallets' : bigint,
      'totalTransactions' : bigint,
    }
  >,
  'getMPCTransactions' : ActorMethod<[MPCWalletId], Array<MPCTransaction>>,
  'getMPCWallet' : ActorMethod<[MPCWalletId], [] | [MPCWallet]>,
  'getSocialTransfers' : ActorMethod<[UserId], Array<SocialTransfer>>,
  'getUserMPCWallets' : ActorMethod<[UserId], Array<MPCWallet>>,
  'healthCheck' : ActorMethod<[], string>,
}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
