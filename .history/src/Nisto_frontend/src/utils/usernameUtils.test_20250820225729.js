/**
 * Tests for username utility functions
 * Run with: node usernameUtils.test.js
 */

import { 
  formatUsername, 
  getUsernameColor, 
  getInitials, 
  validateDisplayName,
  getUserDisplayName,
  hasCustomDisplayName,
  getUsernamePreview,
  getUsernameAnimal,
  getUsernameNoun,
  getUsernameNumber
} from './usernameUtils.js';

// Mock test data
const testUser = {
  username: 'duck_sunset_1234',
  displayName: 'John Doe'
};

const testUserNoDisplayName = {
  username: 'panda_river_5678'
};

// Test functions
function testFormatUsername() {
  console.log('Testing formatUsername...');
  
  const result1 = formatUsername('duck_sunset_1234');
  const expected1 = 'Duck Sunset 1234';
  console.assert(result1 === expected1, `Expected "${expected1}", got "${result1}"`);
  
  const result2 = formatUsername('');
  const expected2 = '—';
  console.assert(result2 === expected2, `Expected "${expected2}", got "${result2}"`);
  
  const result3 = formatUsername(null);
  const expected3 = '—';
  console.assert(result3 === expected3, `Expected "${expected3}", got "${result3}"`);
  
  console.log('✅ formatUsername tests passed');
}

function testGetUsernameColor() {
  console.log('Testing getUsernameColor...');
  
  const result1 = getUsernameColor('duck_sunset_1234');
  console.assert(typeof result1 === 'string' && result1.startsWith('#'), 
    `Expected hex color, got "${result1}"`);
  
  const result2 = getUsernameColor('');
  console.assert(result2 === '#6b7280', `Expected "#6b7280", got "${result2}"`);
  
  console.log('✅ getUsernameColor tests passed');
}

function testGetInitials() {
  console.log('Testing getInitials...');
  
  const result1 = getInitials('John Doe', 'duck_sunset_1234');
  console.assert(result1 === 'JD', `Expected "JD", got "${result1}"`);
  
  const result2 = getInitials('', 'duck_sunset_1234');
  console.assert(result2 === 'D', `Expected "D", got "${result2}"`);
  
  const result3 = getInitials('', '');
  console.assert(result3 === 'U', `Expected "U", got "${result3}"`);
  
  console.log('✅ getInitials tests passed');
}

function testValidateDisplayName() {
  console.log('Testing validateDisplayName...');
  
  const result1 = validateDisplayName('John Doe');
  console.assert(result1.isValid === true, `Expected valid, got ${result1.isValid}`);
  
  const result2 = validateDisplayName('');
  console.assert(result2.isValid === false, `Expected invalid, got ${result2.isValid}`);
  
  const result3 = validateDisplayName('Jo');
  console.assert(result3.isValid === false, `Expected invalid, got ${result3.isValid}`);
  
  const result4 = validateDisplayName('John@Doe');
  console.assert(result4.isValid === false, `Expected invalid, got ${result4.isValid}`);
  
  console.log('✅ validateDisplayName tests passed');
}

function testGetUserDisplayName() {
  console.log('Testing getUserDisplayName...');
  
  const result1 = getUserDisplayName(testUser);
  console.assert(result1 === 'John Doe', `Expected "John Doe", got "${result1}"`);
  
  const result2 = getUserDisplayName(testUserNoDisplayName);
  console.assert(result2 === 'Panda River 5678', `Expected "Panda River 5678", got "${result2}"`);
  
  const result3 = getUserDisplayName(null);
  console.assert(result3 === 'User', `Expected "User", got "${result3}"`);
  
  console.log('✅ getUserDisplayName tests passed');
}

function testHasCustomDisplayName() {
  console.log('Testing hasCustomDisplayName...');
  
  const result1 = hasCustomDisplayName(testUser);
  console.assert(result1 === true, `Expected true, got ${result1}`);
  
  const result2 = hasCustomDisplayName(testUserNoDisplayName);
  console.assert(result2 === false, `Expected false, got ${result2}`);
  
  console.log('✅ hasCustomDisplayName tests passed');
}

function testUsernameParts() {
  console.log('Testing username part extraction...');
  
  const username = 'duck_sunset_1234';
  
  const animal = getUsernameAnimal(username);
  console.assert(animal === 'duck', `Expected "duck", got "${animal}"`);
  
  const noun = getUsernameNoun(username);
  console.assert(noun === 'sunset', `Expected "sunset", got "${noun}"`);
  
  const number = getUsernameNumber(username);
  console.assert(number === '1234', `Expected "1234", got "${number}"`);
  
  console.log('✅ username part extraction tests passed');
}

// Run all tests
function runAllTests() {
  console.log('🧪 Running username utility tests...\n');
  
  try {
    testFormatUsername();
    testGetUsernameColor();
    testGetInitials();
    testValidateDisplayName();
    testGetUserDisplayName();
    testHasCustomDisplayName();
    testUsernameParts();
    
    console.log('\n🎉 All tests passed!');
  } catch (error) {
    console.error('\n❌ Test failed:', error);
  }
}

// Export for use in other files
export { runAllTests };

// Run tests if this file is executed directly
if (typeof window === 'undefined' && typeof process !== 'undefined') {
  runAllTests();
}
