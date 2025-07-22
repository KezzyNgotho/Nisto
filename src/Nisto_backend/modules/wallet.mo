import Principal "mo:base/Principal";
import Text "mo:base/Text";

module {
  public type Wallet = {
    id: Text;
    userId: Principal;
    name: Text;
    type_: Text; // "personal" | "shared" | "business"
    currency: Text;
    balance: Float;
    isActive: Bool;
    createdAt: Int;
    updatedAt: Int;
  };

  public type CryptoWalletType = {
    #ICP;
    #ckBTC;
    #ckETH;
    #CHAT;
    #SNS1;
    #KINIC;
    #GHOST;
    #CAT;
    #BOOM;
    #NTN;
    #YUGE;
    #WUMBO;
    #ALPACALB;
    #PARTY;
    #SNEED;
    #CLOWN;
    #SHRIMP;
    #DOGMI;
    #FOMO;
    #TRAX;
    #MOTOKO;
    #CKPEPE;
    #SONIC;
    #MOD;
    #DAMONIC;
    #NICP;
    #MEME;
    #DRAGGINZ;
    #ELNA;
    #GLDT;
    #NANAS;
    #PANDA;
    #SEERS;
    #DSCVR;
    #CYCLES;
    #DKUMA;
    #OPENCHAT;
    #FIAT;
  };

  public type CryptoWallet = {
    id: Text;
    userId: Principal;
    name: Text;
    walletType: CryptoWalletType;
    currency: Text; // Token symbol
    balance: Float;
    address: ?Text; // Wallet address/account identifier
    isExternal: Bool; // True for external wallets (Plug, Stoic, etc.)
    externalWalletType: ?Text; // "plug" | "stoic" | "nfid" | "metamask" | "walletconnect"
    isActive: Bool;
    createdAt: Int;
    updatedAt: Int;
    lastSyncAt: ?Int;
    metadata: ?Text; // JSON string for additional data
  };

  public type ExternalWalletConnection = {
    id: Text;
    userId: Principal;
    walletType: Text; // "plug" | "stoic" | "nfid" | "metamask" | "walletconnect"
    principalId: ?Text; // For IC wallets
    address: ?Text; // For Ethereum wallets
    isActive: Bool;
    connectedAt: Int;
    lastUsedAt: Int;
    permissions: [Text]; // List of permissions granted
  };

  public type CryptoTransaction = {
    id: Text;
    walletId: Text;
    userId: Principal;
    type_: Text; // "send" | "receive" | "swap" | "stake" | "unstake" | "claim"
    amount: Float;
    currency: Text;
    toAddress: ?Text;
    fromAddress: ?Text;
    txHash: ?Text; // Blockchain transaction hash
    blockHeight: ?Nat;
    fee: Float;
    status: Text; // "pending" | "confirmed" | "failed"
    timestamp: Int;
    metadata: ?Text; // JSON string for additional data
  };

  public type WalletPortfolio = {
    userId: Principal;
    totalValueUSD: Float;
    totalValueKES: Float;
    cryptoWallets: [CryptoWallet];
    fiatWallets: [Wallet];
    externalConnections: [ExternalWalletConnection];
    defiPositions: [Text]; // Use DeFiPosition from defi.mo
    lastUpdated: Int;
  };
} 