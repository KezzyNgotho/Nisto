import Principal "mo:base/Principal";
import Text "mo:base/Text";

module {
  public type UserId = Principal;

  public type User = {
    id: UserId;
    username: Text;
    email: ?Text;
    displayName: Text;
    avatar: ?Text;
    createdAt: Int;
    updatedAt: Int;
    preferences: UserPreferences;
    isActive: Bool;
    recoverySetupCompleted: Bool;
    lastLoginAt: ?Int;
    loginAttempts: Nat;
    isLocked: Bool;
  };

  public type UserPreferences = {
    currency: Text;
    language: Text;
    theme: Text;
    notifications: NotificationSettings;
    privacy: PrivacySettings;
    security: SecuritySettings;
  };

  public type NotificationSettings = {
    email: Bool;
    push: Bool;
    transactions: Bool;
    goals: Bool;
    social: Bool;
    security: Bool;
  };

  public type PrivacySettings = {
    profileVisibility: Text;
    transactionVisibility: Text;
    allowFriendRequests: Bool;
  };

  public type SecuritySettings = {
    twoFactorEnabled: Bool;
    loginNotifications: Bool;
    deviceTracking: Bool;
  };

  public type RecoveryMethod = {
    id: Text;
    userId: UserId;
    methodType: Text;
    value: Text;
    isVerified: Bool;
    isActive: Bool;
    createdAt: Int;
    verifiedAt: ?Int;
    metadata: ?Text;
  };

  public type SecurityQuestion = {
    id: Text;
    userId: UserId;
    question: Text;
    answerHash: Text;
    createdAt: Int;
    isActive: Bool;
  };

  public type EmergencyContact = {
    id: Text;
    userId: UserId;
    name: Text;
    email: Text;
    relationship: Text;
    isVerified: Bool;
    createdAt: Int;
    verifiedAt: ?Int;
  };

  public type VerificationCode = {
    id: Text;
    userId: ?UserId;
    identifier: Text;
    code: Text;
    codeType: Text;
    expiresAt: Int;
    isUsed: Bool;
    attempts: Nat;
    createdAt: Int;
  };

  public type RecoveryRequest = {
    id: Text;
    userId: ?UserId;
    identifier: Text;
    recoveryMethod: Text;
    status: Text;
    verificationCode: ?Text;
    recoveryToken: ?Text;
    expiresAt: Int;
    createdAt: Int;
    verifiedAt: ?Int;
    completedAt: ?Int;
    metadata: ?Text;
  };

  public type LoginSession = {
    id: Text;
    userId: UserId;
    deviceInfo: ?Text;
    ipAddress: ?Text;
    userAgent: ?Text;
    isActive: Bool;
    createdAt: Int;
    lastAccessAt: Int;
    expiresAt: Int;
  };

  public type AuditLog = {
    id: Text;
    userId: ?UserId;
    action: Text;
    details: Text;
    ipAddress: ?Text;
    userAgent: ?Text;
    timestamp: Int;
    success: Bool;
  };
} 