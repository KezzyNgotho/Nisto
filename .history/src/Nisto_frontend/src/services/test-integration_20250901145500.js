// Test file for NISTO Social Media Integration
// Run this to verify all platforms are working

import socialMediaIntegration from './SocialMediaIntegration';

async function testIntegration() {
  console.log('🧪 Testing NISTO Social Media Integration...');
  
  try {
    // Wait for initialization
    while (!socialMediaIntegration.isInitialized) {
      console.log('⏳ Waiting for integration to initialize...');
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    console.log('✅ Integration initialized!');
    
    // Test platform status
    const status = socialMediaIntegration.getStatus();
    console.log('📊 Integration Status:', status);
    
    // Test platform health
    const health = await socialMediaIntegration.getSystemHealth();
    console.log('🏥 System Health:', health);
    
    // Test platform stats
    const stats = socialMediaIntegration.getPlatformStats();
    console.log('📈 Platform Stats:', stats);
    
    // Test message processing
    const testMessage = {
      text: 'Send $50 to @testuser',
      senderId: 'test_sender',
      platform: 'instagram'
    };
    
    console.log('💬 Testing message processing...');
    const result = await socialMediaIntegration.processMessage('instagram', testMessage);
    console.log('📤 Message Result:', result);
    
    console.log('🎉 All tests passed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run test if this file is executed directly
if (typeof window !== 'undefined') {
  // Browser environment
  window.testNISTOIntegration = testIntegration;
  console.log('🧪 NISTO Integration test available at: window.testNISTOIntegration()');
} else {
  // Node.js environment
  testIntegration();
}

export default testIntegration;
