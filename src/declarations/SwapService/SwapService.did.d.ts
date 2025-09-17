import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';

export interface Currency {
  'id' : string,
  'change24h' : number,
  'marketCap' : [] | [number],
  'icon' : string,
  'name' : string,
  'color' : string,
  'volume' : [] | [number],
  'image' : string,
  'price' : number,
  'symbol' : string,
}
export interface _SERVICE {
  'calculateExchangeRate' : ActorMethod<[string, string], number>,
  'getAllCurrencies' : ActorMethod<[], Array<Currency>>,
  'getStats' : ActorMethod<
    [],
    { 'totalCurrencies' : bigint, 'totalSwaps' : bigint, 'totalUsers' : bigint }
  >,
  'searchCurrencies' : ActorMethod<[string], Array<Currency>>,
}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
