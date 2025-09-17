export const idlFactory = ({ IDL }) => {
  const Currency = IDL.Record({
    'id' : IDL.Text,
    'change24h' : IDL.Float64,
    'marketCap' : IDL.Opt(IDL.Float64),
    'icon' : IDL.Text,
    'name' : IDL.Text,
    'color' : IDL.Text,
    'volume' : IDL.Opt(IDL.Float64),
    'image' : IDL.Text,
    'price' : IDL.Float64,
    'symbol' : IDL.Text,
  });
  return IDL.Service({
    'calculateExchangeRate' : IDL.Func([IDL.Text, IDL.Text], [IDL.Float64], []),
    'getAllCurrencies' : IDL.Func([], [IDL.Vec(Currency)], []),
    'getStats' : IDL.Func(
        [],
        [
          IDL.Record({
            'totalCurrencies' : IDL.Nat,
            'totalSwaps' : IDL.Nat,
            'totalUsers' : IDL.Nat,
          }),
        ],
        ['query'],
      ),
    'searchCurrencies' : IDL.Func([IDL.Text], [IDL.Vec(Currency)], []),
  });
};
export const init = ({ IDL }) => { return []; };
