# Nisto Username System

This document explains the username system implementation in the Nisto application, covering both backend and frontend components.

## Overview

The Nisto username system consists of two distinct identifiers:
1. **System Username** - Automatically generated, unique identifier (cannot be changed)
2. **Display Name** - User-customizable name shown to others (can be changed)

## Backend Implementation

### User Data Structure

```motoko
public type User = {
  id: UserId;
  username: Text;        // System username (auto-generated)
  email: ?Text;
  displayName: Text;     // User-customizable display name
  avatar: ?Text;
  createdAt: Int;
  updatedAt: Int;
  // ... other fields
};
```

### Username Generation Algorithm

The backend automatically generates friendly usernames using the pattern: `{animal}_{noun}_{number}`

**Components:**
- **Animals**: duck, panda, lion, otter, eagle, whale, tiger, koala, rhino, fox, bear, owl, wolf
- **Nouns**: sunset, river, forest, mountain, breeze, comet, ember, harbor, meadow, summit, valley, lagoon
- **Numbers**: 1000-9999 (deterministic based on principal)

**Example usernames:**
- `duck_sunset_1234`
- `panda_river_5678`
- `lion_forest_9012`

### Backend Methods

#### `loginOrCreateUser()`
- Automatically creates new users on first login
- Generates unique username using deterministic algorithm
- Sets both `username` and `displayName` to the generated username initially

#### `updateUser(displayName, avatar)`
- Allows updating `displayName` and `avatar`
- **Preserves** the system `username` (cannot be changed)
- Updates `updatedAt` timestamp

## Frontend Implementation

### Components

#### 1. UsernameManager Component
**Location**: `src/Nisto_frontend/src/components/UsernameManager.jsx`

**Features:**
- Displays both system username and display name
- Allows editing display name with validation
- Shows formatted username (e.g., "Duck Sunset 1234")
- Copy-to-clipboard functionality
- Information tooltip explaining the system

#### 2. UserDisplay Component
**Location**: `src/Nisto_frontend/src/components/UserDisplay.jsx`

**Features:**
- Compact user display with avatar
- Interactive tooltip with detailed user info
- Copy functionality for all user identifiers
- Responsive design for mobile/desktop

#### 3. Username Utilities
**Location**: `src/Nisto_frontend/src/utils/usernameUtils.js`

**Key Functions:**
- `formatUsername(username)` - Converts "duck_sunset_1234" to "Duck Sunset 1234"
- `getUsernameColor(username)` - Generates consistent color for username
- `getInitials(displayName, username)` - Creates avatar initials
- `validateDisplayName(displayName)` - Validates display name format
- `getUserDisplayName(user)` - Gets user-friendly display name

### Display Name Validation

**Rules:**
- 3-30 characters
- Letters, numbers, spaces, dash, underscore, dot only
- Cannot be empty

**Regex Pattern:**
```javascript
/^[-a-zA-Z0-9_\.\s]{3,30}$/
```

### User Interface Flow

1. **First Login**: User sees auto-generated username (e.g., "Duck Sunset 1234")
2. **Profile Page**: User can customize their display name
3. **Dashboard**: Shows display name with option to show system username
4. **Chat/Vaults**: Uses display name for user identification

## Usage Examples

### Backend (Motoko)

```motoko
// Create user automatically on login
let result = await actor.loginOrCreateUser();

// Update display name
let updateResult = await actor.updateUser(?displayName, null);
```

### Frontend (React)

```javascript
import { useAuth } from '../contexts/AuthContext';
import { getUserDisplayName, formatUsername } from '../utils/usernameUtils';

function MyComponent() {
  const { user } = useAuth();
  
  // Get user-friendly display name
  const displayName = getUserDisplayName(user);
  
  // Format system username
  const formattedUsername = formatUsername(user?.username);
  
  return (
    <div>
      <h1>Welcome, {displayName}!</h1>
      <p>System ID: {formattedUsername}</p>
    </div>
  );
}
```

## Security Considerations

1. **System Username Immutability**: System usernames cannot be changed to prevent confusion
2. **Display Name Validation**: Strict validation prevents malicious input
3. **Principal-Based Generation**: Usernames are deterministically generated from principal ID
4. **Audit Logging**: All username changes are logged for security

## Testing

Run username utility tests:
```bash
cd src/Nisto_frontend/src/utils
node usernameUtils.test.js
```

## Future Enhancements

1. **Username Reservations**: Allow users to reserve custom usernames
2. **Username History**: Track display name changes
3. **Username Suggestions**: AI-powered display name suggestions
4. **Username Verification**: Email/phone verification for custom usernames

## Migration Notes

For existing users:
- System usernames remain unchanged
- Display names can be updated through the profile interface
- Backward compatibility maintained for all existing functionality

## Troubleshooting

### Common Issues

1. **Username not displaying**: Check if user object is properly loaded
2. **Display name validation failing**: Ensure input matches validation rules
3. **Color not consistent**: Verify username is being passed correctly to color function

### Debug Commands

```javascript
// Check user object structure
console.log('User:', user);

// Test username formatting
console.log('Formatted:', formatUsername(user?.username));

// Validate display name
console.log('Validation:', validateDisplayName(displayName));
```
