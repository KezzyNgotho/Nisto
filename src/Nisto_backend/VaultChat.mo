import Principal "mo:base/Principal";
import Text "mo:base/Text";
import Int "mo:base/Int";
import Nat "mo:base/Nat";
import Float "mo:base/Float";
import Bool "mo:base/Bool";
import Array "mo:base/Array";
import HashMap "mo:base/HashMap";
import Result "mo:base/Result";
import Time "mo:base/Time";
import Error "mo:base/Error";

shared({ caller = initializer }) actor class VaultChat() = {

  // ===== VAULT CHAT TYPES =====
  
  public type UserId = Principal;
  
  public type MessageType = {
    #Text;
    #System;
    #Transaction;
    #Image;
    #File;
    #Reaction;
  };

  public type MessageStatus = {
    #Sent;
    #Delivered;
    #Read;
    #Failed;
  };

  public type VaultMessage = {
    id: Text;
    vaultId: Text;
    userId: UserId;
    userName: Text;
    messageType: MessageType;
    content: Text;
    status: MessageStatus;
    timestamp: Int;
    editedAt: ?Int;
    replyTo: ?Text; // ID of message being replied to
    reactions: [MessageReaction];
    metadata: ?Text;
  };

  public type MessageReaction = {
    userId: UserId;
    reaction: Text; // emoji or reaction type
    timestamp: Int;
  };

  public type VaultChatRoom = {
    id: Text;
    vaultId: Text;
    name: Text;
    description: ?Text;
    isActive: Bool;
    createdAt: Int;
    updatedAt: Int;
    lastMessageAt: ?Int;
    memberCount: Nat;
    metadata: ?Text;
  };

  public type ChatMember = {
    userId: UserId;
    userName: Text;
    joinedAt: Int;
    lastSeenAt: Int;
    isTyping: Bool;
    typingSince: ?Int;
    unreadCount: Nat;
    isMuted: Bool;
    role: Text; // "member" | "admin" | "moderator"
  };

  public type TypingIndicator = {
    userId: UserId;
    userName: Text;
    isTyping: Bool;
    startedAt: Int;
  };

  public type ChatNotification = {
    id: Text;
    vaultId: Text;
    userId: UserId;
    notificationType: Text; // "message" | "reaction" | "member_joined" | "member_left"
    title: Text;
    body: Text;
    timestamp: Int;
    isRead: Bool;
    metadata: ?Text;
  };

  // ===== STORAGE =====
  
  private stable var nextMessageId: Nat = 0;
  private stable var nextChatRoomId: Nat = 0;
  private stable var nextNotificationId: Nat = 0;
  
  // Message storage
  private var messages = HashMap.HashMap<Text, VaultMessage>(0, Text.equal, Text.hash);
  private var vaultMessages = HashMap.HashMap<Text, [Text]>(0, Text.equal, Text.hash); // vaultId -> messageIds
  
  // Chat room storage
  private var chatRooms = HashMap.HashMap<Text, VaultChatRoom>(0, Text.equal, Text.hash);
  private var vaultChatRooms = HashMap.HashMap<Text, [Text]>(0, Text.equal, Text.hash); // vaultId -> chatRoomIds
  
  // Member storage
  private var chatMembers = HashMap.HashMap<Text, ChatMember>(0, Text.equal, Text.hash); // userId_vaultId -> ChatMember
  private var vaultMembers = HashMap.HashMap<Text, [Text]>(0, Text.equal, Text.hash); // vaultId -> userIds
  
  // Typing indicators
  private var typingIndicators = HashMap.HashMap<Text, [TypingIndicator]>(0, Text.equal, Text.hash); // vaultId -> typing users
  
  // Notifications
  private var notifications = HashMap.HashMap<Text, ChatNotification>(0, Text.equal, Text.hash);
  private var userNotifications = HashMap.HashMap<Text, [Text]>(0, Text.equal, Text.hash); // userId -> notificationIds

  // ===== HELPER FUNCTIONS =====
  
  private func generateId(prefix: Text, counter: Nat): Text {
    Text.concat(prefix, Nat.toText(counter))
  };

  private func getCurrentTime(): Int {
    Time.now()
  };

  private func addToVaultMessages(vaultId: Text, messageId: Text) {
    switch (vaultMessages.get(vaultId)) {
      case null {
        vaultMessages.put(vaultId, [messageId]);
      };
      case (?existingMessages) {
        let updatedMessages = Array.append<Text>(existingMessages, [messageId]);
        vaultMessages.put(vaultId, updatedMessages);
      };
    };
  };

  private func addToVaultChatRooms(vaultId: Text, chatRoomId: Text) {
    switch (vaultChatRooms.get(vaultId)) {
      case null {
        vaultChatRooms.put(vaultId, [chatRoomId]);
      };
      case (?existingRooms) {
        let updatedRooms = Array.append<Text>(existingRooms, [chatRoomId]);
        vaultChatRooms.put(vaultId, updatedRooms);
      };
    };
  };

  private func addToVaultMembers(vaultId: Text, userId: Text) {
    switch (vaultMembers.get(vaultId)) {
      case null {
        vaultMembers.put(vaultId, [userId]);
      };
      case (?existingMembers) {
        if (not Array.find<Text>(existingMembers, func(id: Text): Bool { id == userId }) != null) {
          let updatedMembers = Array.append<Text>(existingMembers, [userId]);
          vaultMembers.put(vaultId, updatedMembers);
        };
      };
    };
  };

  private func removeFromVaultMembers(vaultId: Text, userId: Text) {
    switch (vaultMembers.get(vaultId)) {
      case null { return; };
      case (?existingMembers) {
        let filteredMembers = Array.filter<Text>(existingMembers, func(id: Text): Bool { id != userId });
        vaultMembers.put(vaultId, filteredMembers);
      };
    };
  };

  private func addToUserNotifications(userId: Text, notificationId: Text) {
    switch (userNotifications.get(userId)) {
      case null {
        userNotifications.put(userId, [notificationId]);
      };
      case (?existingNotifications) {
        let updatedNotifications = Array.append<Text>(existingNotifications, [notificationId]);
        userNotifications.put(userId, updatedNotifications);
      };
    };
  };

  // ===== PUBLIC FUNCTIONS =====

  // Create a chat room for a vault
  public shared({ caller }) func createVaultChatRoom(
    vaultId: Text,
    name: Text,
    description: ?Text
  ): async Result.Result<VaultChatRoom, Text> {
    let chatRoomId = generateId("chat_room_", nextChatRoomId);
    nextChatRoomId += 1;

    let chatRoom: VaultChatRoom = {
      id = chatRoomId;
      vaultId = vaultId;
      name = name;
      description = description;
      isActive = true;
      createdAt = getCurrentTime();
      updatedAt = getCurrentTime();
      lastMessageAt = null;
      memberCount = 0;
      metadata = null;
    };

    chatRooms.put(chatRoomId, chatRoom);
    addToVaultChatRooms(vaultId, chatRoomId);

    #ok(chatRoom)
  };

  // Join a vault chat room
  public shared({ caller }) func joinVaultChat(
    vaultId: Text,
    userName: Text
  ): async Result.Result<Bool, Text> {
    let memberKey = Text.concat(Principal.toText(caller), "_", vaultId);
    
    let member: ChatMember = {
      userId = caller;
      userName = userName;
      joinedAt = getCurrentTime();
      lastSeenAt = getCurrentTime();
      isTyping = false;
      typingSince = null;
      unreadCount = 0;
      isMuted = false;
      role = "member";
    };

    chatMembers.put(memberKey, member);
    addToVaultMembers(vaultId, Principal.toText(caller));

    // Create notification for other members
    let notificationId = generateId("notif_", nextNotificationId);
    nextNotificationId += 1;

    let notification: ChatNotification = {
      id = notificationId;
      vaultId = vaultId;
      userId = caller;
      notificationType = "member_joined";
      title = "New Member";
      body = Text.concat(userName, " joined the vault chat");
      timestamp = getCurrentTime();
      isRead = false;
      metadata = null;
    };

    notifications.put(notificationId, notification);
    addToUserNotifications(Principal.toText(caller), notificationId);

    #ok(true)
  };

  // Send a message to vault chat
  public shared({ caller }) func sendVaultMessage(
    vaultId: Text,
    content: Text,
    messageType: MessageType,
    replyTo: ?Text
  ): async Result.Result<VaultMessage, Text> {
    let memberKey = Text.concat(Principal.toText(caller), "_", vaultId);
    
    // Check if user is a member
    switch (chatMembers.get(memberKey)) {
      case null { return #err("User is not a member of this vault chat"); };
      case (?member) {
        let messageId = generateId("msg_", nextMessageId);
        nextMessageId += 1;

        let message: VaultMessage = {
          id = messageId;
          vaultId = vaultId;
          userId = caller;
          userName = member.userName;
          messageType = messageType;
          content = content;
          status = #Sent;
          timestamp = getCurrentTime();
          editedAt = null;
          replyTo = replyTo;
          reactions = [];
          metadata = null;
        };

        messages.put(messageId, message);
        addToVaultMessages(vaultId, messageId);

        // Update member's last seen
        let updatedMember: ChatMember = {
          userId = member.userId;
          userName = member.userName;
          joinedAt = member.joinedAt;
          lastSeenAt = getCurrentTime();
          isTyping = false;
          typingSince = null;
          unreadCount = member.unreadCount;
          isMuted = member.isMuted;
          role = member.role;
        };
        chatMembers.put(memberKey, updatedMember);

        // Create notification for other members
        let notificationId = generateId("notif_", nextNotificationId);
        nextNotificationId += 1;

            let notification: ChatNotification = {
      id = notificationId;
      vaultId = vaultId;
      userId = caller;
      notificationType = "message";
      title = member.userName;
      body = content;
      timestamp = getCurrentTime();
      isRead = false;
      metadata = ?messageId;
    };

        notifications.put(notificationId, notification);

        #ok(message)
      };
    };
  };

  // Get vault messages
  public query func getVaultMessages(
    vaultId: Text,
    limit: Nat,
    offset: Nat
  ): async Result.Result<[VaultMessage], Text> {
    switch (vaultMessages.get(vaultId)) {
      case null { #ok([]) };
      case (?messageIds) {
        let allMessages = Array.map<Text, ?VaultMessage>(
          messageIds,
          func(id: Text): ?VaultMessage { messages.get(id) }
        );
        
        let validMessages = Array.filter<?VaultMessage>(
          allMessages,
          func(msg: ?VaultMessage): Bool { msg != null }
        );
        
        let typedMessages = Array.map<?VaultMessage, VaultMessage>(
          validMessages,
          func(msg: ?VaultMessage): VaultMessage { 
            switch (msg) {
              case null { 
                // This should never happen due to the filter above
                {
                  id = "";
                  vaultId = "";
                  userId = Principal.fromText("2vxsx-fae");
                  userName = "";
                  messageType = #Text;
                  content = "";
                  status = #Sent;
                  timestamp = 0;
                  editedAt = null;
                  replyTo = null;
                  reactions = [];
                  metadata = null;
                }
              };
              case (?m) { m };
            }
          }
        );
        
        // Sort by timestamp (newest first) and apply pagination
        let sortedMessages = Array.sort<VaultMessage>(
          typedMessages,
          func(a: VaultMessage, b: VaultMessage): { less: Bool; equal: Bool; greater: Bool } {
            if (a.timestamp > b.timestamp) { { less = false; equal = false; greater = true } }
            else if (a.timestamp < b.timestamp) { { less = true; equal = false; greater = false } }
            else { { less = false; equal = true; greater = false } }
          }
        );
        
        let startIndex = offset;
        let endIndex = Nat.min(startIndex + limit, sortedMessages.size());
        
        if (startIndex >= sortedMessages.size()) {
          #ok([])
        } else {
          let paginatedMessages = Array.subArray<VaultMessage>(sortedMessages, startIndex, endIndex - startIndex);
          #ok(Array.toArray(paginatedMessages))
        }
      };
    };
  };

  // Update typing indicator
  public shared({ caller }) func updateTypingStatus(
    vaultId: Text,
    isTyping: Bool
  ): async Result.Result<Bool, Text> {
    let memberKey = Text.concat(Principal.toText(caller), "_", vaultId);
    
    switch (chatMembers.get(memberKey)) {
      case null { return #err("User is not a member of this vault chat"); };
      case (?member) {
        let updatedMember: ChatMember = {
          userId = member.userId;
          userName = member.userName;
          joinedAt = member.joinedAt;
          lastSeenAt = getCurrentTime();
          isTyping = isTyping;
          typingSince = if (isTyping) ?getCurrentTime() else null;
          unreadCount = member.unreadCount;
          isMuted = member.isMuted;
          role = member.role;
        };
        
        chatMembers.put(memberKey, updatedMember);
        #ok(true)
      };
    };
  };

  // Get typing indicators for a vault
  public query func getTypingIndicators(vaultId: Text): async [TypingIndicator] {
    switch (vaultMembers.get(vaultId)) {
      case null { [] };
      case (?userIds) {
        let typingUsers = Array.filter<Text>(
          userIds,
          func(userId: Text): Bool {
            let memberKey = Text.concat(userId, "_", vaultId);
            switch (chatMembers.get(memberKey)) {
              case null { false };
              case (?member) { member.isTyping };
            };
          }
        );
        
        Array.map<Text, TypingIndicator>(
          typingUsers,
          func(userId: Text): TypingIndicator {
            let memberKey = Text.concat(userId, "_", vaultId);
            switch (chatMembers.get(memberKey)) {
              case null {
                {
                  userId = Principal.fromText("2vxsx-fae");
                  userName = "";
                  isTyping = false;
                  startedAt = 0;
                }
              };
              case (?member) {
                {
                  userId = member.userId;
                  userName = member.userName;
                  isTyping = member.isTyping;
                  startedAt = switch (member.typingSince) {
                    case null { 0 };
                    case (?time) { time };
                  };
                }
              };
            };
          }
        )
      };
    };
  };

  // Mark messages as read
  public shared({ caller }) func markMessagesAsRead(
    vaultId: Text,
    messageIds: [Text]
  ): async Result.Result<Bool, Text> {
    let memberKey = Text.concat(Principal.toText(caller), "_", vaultId);
    
    switch (chatMembers.get(memberKey)) {
      case null { return #err("User is not a member of this vault chat"); };
      case (?member) {
        // Update member's unread count
        let updatedMember: ChatMember = {
          userId = member.userId;
          userName = member.userName;
          joinedAt = member.joinedAt;
          lastSeenAt = getCurrentTime();
          isTyping = member.isTyping;
          typingSince = member.typingSince;
          unreadCount = 0; // Reset unread count
          isMuted = member.isMuted;
          role = member.role;
        };
        
        chatMembers.put(memberKey, updatedMember);
        #ok(true)
      };
    };
  };

  // Get user notifications
  public query func getUserNotifications(
    userId: UserId,
    limit: Nat,
    offset: Nat
  ): async Result.Result<[ChatNotification], Text> {
    switch (userNotifications.get(Principal.toText(userId))) {
      case null { #ok([]) };
      case (?notificationIds) {
        let allNotifications = Array.map<Text, ?ChatNotification>(
          notificationIds,
          func(id: Text): ?ChatNotification { notifications.get(id) }
        );
        
        let validNotifications = Array.filter<?ChatNotification>(
          allNotifications,
          func(notif: ?ChatNotification): Bool { notif != null }
        );
        
        let typedNotifications = Array.map<?ChatNotification, ChatNotification>(
          validNotifications,
          func(notif: ?ChatNotification): ChatNotification { 
            switch (notif) {
              case null { 
                {
                  id = "";
                  vaultId = "";
                  userId = Principal.fromText("2vxsx-fae");
                  type = "";
                  title = "";
                  body = "";
                  timestamp = 0;
                  isRead = false;
                  metadata = null;
                }
              };
              case (?n) { n };
            }
          }
        );
        
        // Sort by timestamp (newest first) and apply pagination
        let sortedNotifications = Array.sort<ChatNotification>(
          typedNotifications,
          func(a: ChatNotification, b: ChatNotification): { less: Bool; equal: Bool; greater: Bool } {
            if (a.timestamp > b.timestamp) { { less = false; equal = false; greater = true } }
            else if (a.timestamp < b.timestamp) { { less = true; equal = false; greater = false } }
            else { { less = false; equal = true; greater = false } }
          }
        );
        
        let startIndex = offset;
        let endIndex = Nat.min(startIndex + limit, sortedNotifications.size());
        
        if (startIndex >= sortedNotifications.size()) {
          #ok([])
        } else {
          let paginatedNotifications = Array.subArray<ChatNotification>(sortedNotifications, startIndex, endIndex - startIndex);
          #ok(Array.toArray(paginatedNotifications))
        }
      };
    };
  };

  // Leave vault chat
  public shared({ caller }) func leaveVaultChat(vaultId: Text): async Result.Result<Bool, Text> {
    let memberKey = Text.concat(Principal.toText(caller), "_", vaultId);
    
    switch (chatMembers.get(memberKey)) {
      case null { return #err("User is not a member of this vault chat"); };
      case (?member) {
        // Remove member
        chatMembers.delete(memberKey);
        removeFromVaultMembers(vaultId, Principal.toText(caller));

        // Create notification for other members
        let notificationId = generateId("notif_", nextNotificationId);
        nextNotificationId += 1;

            let notification: ChatNotification = {
      id = notificationId;
      vaultId = vaultId;
      userId = caller;
      notificationType = "member_left";
      title = "Member Left";
      body = Text.concat(member.userName, " left the vault chat");
      timestamp = getCurrentTime();
      isRead = false;
      metadata = null;
    };

        notifications.put(notificationId, notification);

        #ok(true)
      };
    };
  };

  // Get vault chat members
  public query func getVaultChatMembers(vaultId: Text): async Result.Result<[ChatMember], Text> {
    switch (vaultMembers.get(vaultId)) {
      case null { #ok([]) };
      case (?userIds) {
        let members = Array.map<Text, ?ChatMember>(
          userIds,
          func(userId: Text): ?ChatMember {
            let memberKey = Text.concat(userId, "_", vaultId);
            chatMembers.get(memberKey)
          }
        );
        
        let validMembers = Array.filter<?ChatMember>(
          members,
          func(member: ?ChatMember): Bool { member != null }
        );
        
        let typedMembers = Array.map<?ChatMember, ChatMember>(
          validMembers,
          func(member: ?ChatMember): ChatMember { 
            switch (member) {
              case null { 
                {
                  userId = Principal.fromText("2vxsx-fae");
                  userName = "";
                  joinedAt = 0;
                  lastSeenAt = 0;
                  isTyping = false;
                  typingSince = null;
                  unreadCount = 0;
                  isMuted = false;
                  role = "";
                }
              };
              case (?m) { m };
            }
          }
        );
        
        #ok(Array.toArray(typedMembers))
      };
    };
  };

  // System functions for canister management
  public shared({ caller }) func whoami(): async Principal {
    caller
  };

  public query func getCanisterId(): async Text {
    Principal.toText(Principal.fromActor(VaultChat))
  };
}; 