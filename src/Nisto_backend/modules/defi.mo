import Principal "mo:base/Principal";
import Text "mo:base/Text";

module {
  public type DeFiProtocol = {
    #ICPSwap;
    #Sonic;
    #InfinitySwap;
    #Neutrinite;
    #ICDex;
    #Custom;
  };

  public type DeFiProductType = {
    #Swap;
    #Liquidity;
    #Staking;
    #Lending;
    #Borrowing;
    #YieldFarming;
    #Governance;
    #Custom;
  };

  public type DeFiPosition = {
    id: Text;
    userId: Principal;
    protocol: DeFiProtocol;
    productType: DeFiProductType;
    tokenA: Text;
    tokenB: ?Text;
    amount: Float;
    apy: Float;
    rewards: Float;
    isActive: Bool;
    createdAt: Int;
    updatedAt: Int;
    metadata: ?Text;
  };

  public type DeFiTransaction = {
    id: Text;
    userId: Principal;
    protocol: DeFiProtocol;
    type_: Text;
    tokenA: Text;
    tokenB: ?Text;
    amountA: Float;
    amountB: ?Float;
    fee: Float;
    txHash: ?Text;
    status: Text;
    timestamp: Int;
    metadata: ?Text;
  };
} 