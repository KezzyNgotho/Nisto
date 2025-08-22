// Test functions for username utilities

import { 
  formatUsername, 
  getUsernameColor, 
  getInitials, 
  validateUsername, 
  generateUsernameSuggestion 
} from './usernameUtils';

// Test runner function
export const runAllTests = async () => {
  const results = [];
  
  // Test formatUsername
  try {
    const test1 = formatUsername('testUser123');
    const test2 = formatUsername('TEST_USER');
    const test3 = formatUsername(null);
    
    if (test1 === 'Testuser123' && test2 === 'Test User' && test3 === 'Anonymous') {
      results.push({ test: 'formatUsername', passed: true });
    } else {
      results.push({ test: 'formatUsername', passed: false, error: 'Unexpected output' });
    }
  } catch (error) {
    results.push({ test: 'formatUsername', passed: false, error: error.message });
  }
  
  // Test getUsernameColor
  try {
    const color1 = getUsernameColor('testUser');
    const color2 = getUsernameColor('anotherUser');
    const color3 = getUsernameColor(null);
    
    if (color1 && color2 && color3 && color1 !== color2 && color3 === '#6b7280') {
      results.push({ test: 'getUsernameColor', passed: true });
    } else {
      results.push({ test: 'getUsernameColor', passed: false, error: 'Unexpected color output' });
    }
  } catch (error) {
    results.push({ test: 'getUsernameColor', passed: false, error: error.message });
  }
  
  // Test getInitials
  try {
    const initials1 = getInitials('John Doe', 'testuser');
    const initials2 = getInitials('Alice', 'alice123');
    const initials3 = getInitials(null, 'testuser');
    const initials4 = getInitials(null, null);
    
    if (initials1 === 'JD' && initials2 === 'A' && initials3 === 'TE' && initials4 === '?') {
      results.push({ test: 'getInitials', passed: true });
    } else {
      results.push({ test: 'getInitials', passed: false, error: 'Unexpected initials output' });
    }
  } catch (error) {
    results.push({ test: 'getInitials', passed: false, error: error.message });
  }
  
  // Test validateUsername
  try {
    const valid1 = validateUsername('testuser');
    const valid2 = validateUsername('test_user_123');
    const invalid1 = validateUsername('te'); // too short
    const invalid2 = validateUsername(''); // empty
    const invalid3 = validateUsername('test@user'); // invalid chars
    
    if (valid1.valid && valid2.valid && !invalid1.valid && !invalid2.valid && !invalid3.valid) {
      results.push({ test: 'validateUsername', passed: true });
    } else {
      results.push({ test: 'validateUsername', passed: false, error: 'Validation logic incorrect' });
    }
  } catch (error) {
    results.push({ test: 'validateUsername', passed: false, error: error.message });
  }
  
  // Test generateUsernameSuggestion
  try {
    const suggestion1 = generateUsernameSuggestion('John Doe');
    const suggestion2 = generateUsernameSuggestion(null);
    
    if (suggestion1 && suggestion2 && suggestion1.includes('john') && suggestion2.startsWith('user_')) {
      results.push({ test: 'generateUsernameSuggestion', passed: true });
    } else {
      results.push({ test: 'generateUsernameSuggestion', passed: false, error: 'Unexpected suggestion format' });
    }
  } catch (error) {
    results.push({ test: 'generateUsernameSuggestion', passed: false, error: error.message });
  }
  
  return results;
};

// Individual test functions
export const testFormatUsername = () => {
  const tests = [
    { input: 'testUser123', expected: 'Testuser123' },
    { input: 'TEST_USER', expected: 'Test User' },
    { input: null, expected: 'Anonymous' },
    { input: '', expected: 'Anonymous' }
  ];
  
  return tests.map(test => {
    const result = formatUsername(test.input);
    return {
      input: test.input,
      expected: test.expected,
      actual: result,
      passed: result === test.expected
    };
  });
};

export const testGetUsernameColor = () => {
  const usernames = ['testUser', 'anotherUser', 'user123', null];
  const colors = usernames.map(username => getUsernameColor(username));
  
  return {
    usernames,
    colors,
    passed: colors.every(color => color && typeof color === 'string')
  };
};

export const testGetInitials = () => {
  const tests = [
    { displayName: 'John Doe', username: 'testuser', expected: 'JD' },
    { displayName: 'Alice', username: 'alice123', expected: 'A' },
    { displayName: null, username: 'testuser', expected: 'TE' },
    { displayName: null, username: null, expected: '?' }
  ];
  
  return tests.map(test => {
    const result = getInitials(test.displayName, test.username);
    return {
      ...test,
      actual: result,
      passed: result === test.expected
    };
  });
};

export const testValidateUsername = () => {
  const tests = [
    { input: 'testuser', expected: true },
    { input: 'test_user_123', expected: true },
    { input: 'te', expected: false },
    { input: '', expected: false },
    { input: 'test@user', expected: false },
    { input: 'a'.repeat(25), expected: false }
  ];
  
  return tests.map(test => {
    const result = validateUsername(test.input);
    return {
      input: test.input,
      expected: test.expected,
      actual: result.valid,
      passed: result.valid === test.expected
    };
  });
};
