import Text "mo:base/Text";

module {
  public type PluginCategory = {
    #Finance;
    #Social;
    #Gaming;
    #Productivity;
    #Entertainment;
    #Education;
    #Health;
    #Custom;
  };

  public type PluginStatus = {
    #Active;
    #Inactive;
    #Pending;
    #Suspended;
    #Deprecated;
  };

  public type PluginPermission = {
    #ReadWallets;
    #WriteWallets;
    #ReadTransactions;
    #WriteTransactions;
    #ReadProfile;
    #WriteProfile;
    #ReadContacts;
    #WriteContacts;
    #Notifications;
    #ExternalAPIs;
  };

  public type Plugin = {
    id: Text;
    name: Text;
    description: Text;
    version: Text;
    author: Text;
    category: PluginCategory;
    status: PluginStatus;
    permissions: [PluginPermission];
    icon: ?Text;
    entryPoint: Text;
    configSchema: ?Text;
    isEnabled: Bool;
    isInstalled: Bool;
    installCount: Nat;
    rating: Float;
    createdAt: Int;
    updatedAt: Int;
    metadata: ?Text;
  };

  public type UserPlugin = {
    id: Text;
    userId: Text;
    pluginId: Text;
    isEnabled: Bool;
    config: ?Text;
    installedAt: Int;
    lastUsedAt: Int;
    permissions: [PluginPermission];
    metadata: ?Text;
  };
} 