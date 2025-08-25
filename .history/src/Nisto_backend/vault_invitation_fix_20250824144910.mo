// Clean vault invitation functions

// Invite user to vault
public shared(msg) func inviteToVault(
  vaultId: Text,
  userId: UserId,
  role: Text
): async Result.Result<Text, Text> {
  let caller = msg.caller;
  
  // Check if caller is owner or admin
  let userMemberIds = Option.get(vaultMemberIndex.get(vaultId), []);
  let callerMember = Array.find<Text>(userMemberIds, func(memberId) {
    switch (vaultMembers.get(memberId)) {
      case (?member) { 
        member.userId == caller and member.isActive and 
        (member.role == "owner" or member.role == "admin")
      };
      case null { false };
    };
  });
  
  switch (callerMember) {
    case null { return #err("Not authorized to invite users"); };
    case (?memberId) {
      // Get vault details for notification
      let vaultDetails = groupVaults.get(vaultId);
      switch (vaultDetails) {
        case null { return #err("Vault not found"); };
        case (?vault) {
          // Check if user is already a member
          let isAlreadyMember = Option.isSome(Array.find<Text>(userMemberIds, func(memberId) {
            switch (vaultMembers.get(memberId)) {
              case (?member) { member.userId == userId };
              case null { false };
            };
          }));
          
          if (isAlreadyMember) {
            return #err("User is already a member");
          };
          
          // Check if there's already a pending invitation
          let existingInvitation = Option.isSome(Array.find<Text>(userMemberIds, func(memberId) {
            switch (vaultMembers.get(memberId)) {
              case (?member) { 
                member.userId == userId and not member.isActive and member.role == "pending"
              };
              case null { false };
            };
          }));
          
          if (existingInvitation) {
            return #err("User already has a pending invitation");
          };
          
          let invitationId = generateId("vault_invitation", nextVaultMemberId);
          nextVaultMemberId += 1;
          
          let now = getCurrentTime();
          let pendingInvitation: VaultMember = {
            id = invitationId;
            vaultId = vaultId;
            userId = userId;
            role = "pending"; // Mark as pending until accepted
            joinedAt = now;
            contributionLimit = null;
            withdrawalLimit = null;
            isActive = false; // Not active until accepted
            permissions = []; // No permissions until accepted
          };
          
          vaultMembers.put(invitationId, pendingInvitation);
          
          // Update vault member index (for pending invitations)
          let currentVaultMembers = Option.get(vaultMemberIndex.get(vaultId), []);
          vaultMemberIndex.put(vaultId, Array.append(currentVaultMembers, [invitationId]));
          
          // Create notification for the invited user
          let notificationId = generateId("notif", nextNotificationId);
          nextNotificationId += 1;
          
          let vaultNotificationType: NotificationType = #Vault({
            vaultId = vaultId;
            action = "invite";
            amount = null;
          });
          
          let notification: Notification = {
            id = notificationId;
            userId = userId;
            notificationType = vaultNotificationType;
            title = "Vault Invitation";
            message = "You've been invited to join vault: " # vault.name # " as " # role # ". Click to accept or decline.";
            priority = "high";
            isRead = false;
            isArchived = false;
            createdAt = now;
            readAt = null;
            metadata = ?("{\"vaultId\":\"" # vaultId # "\",\"role\":\"" # role # "\",\"invitedBy\":\"" # Principal.toText(caller) # "\",\"invitationId\":\"" # invitationId # "\"}");
            actionUrl = ?("/vaults/" # vaultId);
            expiresAt = ?(now + 7 * 24 * 60 * 60 * 1_000_000_000); // 7 days
          };
          
          notifications.put(notificationId, notification);
          
          // Update user notification index
          let currentUserNotifications = Option.get(userNotificationIndex.get(userId), []);
          userNotificationIndex.put(userId, Array.append(currentUserNotifications, [notificationId]));
          
          // Create notification for the inviter (confirmation)
          let inviterNotificationId = generateId("notif", nextNotificationId);
          nextNotificationId += 1;
          
          let inviterNotification: Notification = {
            id = inviterNotificationId;
            userId = caller;
            notificationType = vaultNotificationType;
            title = "Invitation Sent";
            message = "You've successfully invited a user to vault: " # vault.name;
            priority = "medium";
            isRead = false;
            isArchived = false;
            createdAt = now;
            readAt = null;
            metadata = ?("{\"vaultId\":\"" # vaultId # "\",\"invitedUserId\":\"" # Principal.toText(userId) # "\",\"role\":\"" # role # "\"}");
            actionUrl = ?("/vaults/" # vaultId);
            expiresAt = ?(now + 24 * 60 * 60 * 1_000_000_000); // 24 hours
          };
          
          notifications.put(inviterNotificationId, inviterNotification);
          
          // Update inviter notification index
          let currentInviterNotifications = Option.get(userNotificationIndex.get(caller), []);
          userNotificationIndex.put(caller, Array.append(currentInviterNotifications, [inviterNotificationId]));
          
          await logAuditEvent(?caller, "VAULT_INVITE", "Invited user to vault", true);
          return #ok(invitationId);
        };
      };
    };
  };
};

// Respond to vault invitation (accept/decline)
public shared(msg) func respondToVaultInvitation(
  vaultId: Text,
  response: Text // "accept" or "decline"
): async Result.Result<Bool, Text> {
  let caller = msg.caller;
  
  // Find the pending invitation for this user
  let userMemberIds = Option.get(vaultMemberIndex.get(vaultId), []);
  let pendingInvitation = Array.find<Text>(userMemberIds, func(memberId) {
    switch (vaultMembers.get(memberId)) {
      case (?member) { 
        member.userId == caller and not member.isActive and member.role == "pending"
      };
      case null { false };
    };
  });
  
  switch (pendingInvitation) {
    case null { return #err("No pending invitation found"); };
    case (?invitationId) {
      switch (vaultMembers.get(invitationId)) {
        case null { return #err("Invitation not found"); };
        case (?invitation) {
          if (response == "accept") {
            // Get the original role from notification metadata (default to "member")
            let originalRole = "member"; // Default role
            
            let now = getCurrentTime();
            let acceptedMember: VaultMember = {
              id = invitation.id;
              vaultId = invitation.vaultId;
              userId = invitation.userId;
              role = originalRole;
              joinedAt = now;
              contributionLimit = null;
              withdrawalLimit = null;
              isActive = true;
              permissions = if (originalRole == "admin") {
                ["deposit", "withdraw", "invite"];
              } else {
                ["deposit", "withdraw"];
              };
            };
            
            vaultMembers.put(invitationId, acceptedMember);
            
            // Add user to vaults index
            let currentUserVaults = Option.get(userVaults.get(caller), []);
            userVaults.put(caller, Array.append(currentUserVaults, [vaultId]));
            
            // Create notification for vault owner
            let vaultDetails = groupVaults.get(vaultId);
            switch (vaultDetails) {
              case null { return #err("Vault not found"); };
              case (?vault) {
                let notificationId = generateId("notif", nextNotificationId);
                nextNotificationId += 1;
                
                let vaultNotificationType: NotificationType = #Vault({
                  vaultId = vaultId;
                  action = "member_joined";
                  amount = null;
                });
                
                let notification: Notification = {
                  id = notificationId;
                  userId = vault.ownerId;
                  notificationType = vaultNotificationType;
                  title = "Member Joined";
                  message = "A new member has joined your vault: " # vault.name;
                  priority = "medium";
                  isRead = false;
                  isArchived = false;
                  createdAt = now;
                  readAt = null;
                  metadata = ?("{\"vaultId\":\"" # vaultId # "\",\"memberId\":\"" # Principal.toText(caller) # "\",\"role\":\"" # originalRole # "\"}");
                  actionUrl = ?("/vaults/" # vaultId);
                  expiresAt = ?(now + 24 * 60 * 60 * 1_000_000_000); // 24 hours
                };
                
                notifications.put(notificationId, notification);
                
                // Update owner notification index
                let currentOwnerNotifications = Option.get(userNotificationIndex.get(vault.ownerId), []);
                userNotificationIndex.put(vault.ownerId, Array.append(currentOwnerNotifications, [notificationId]));
              };
            };
            
            await logAuditEvent(?caller, "VAULT_INVITATION_ACCEPTED", "Accepted invitation to vault: " # vaultId, true);
            return #ok(true);
            
          } else if (response == "decline") {
            // Remove the pending invitation
            vaultMembers.delete(invitationId);
            
            // Remove from vault member index
            let currentVaultMembers = Option.get(vaultMemberIndex.get(vaultId), []);
            let updatedVaultMembers = Array.filter<Text>(currentVaultMembers, func(id) { id != invitationId });
            vaultMemberIndex.put(vaultId, updatedVaultMembers);
            
            await logAuditEvent(?caller, "VAULT_INVITATION_DECLINED", "Declined invitation to vault: " # vaultId, true);
            return #ok(true);
            
          } else {
            return #err("Invalid response. Use 'accept' or 'decline'");
          };
        };
      };
    };
  };
};
