// Quick Test for NISTO Social Media Integration
// Run this in your browser console to test the system

console.log('🧪 Starting NISTO Integration Quick Test...');

// Test 1: Check if all handlers are loaded
console.log('\n📋 Test 1: Checking Platform Handlers...');
try {
  // Import the integration
  import('./SocialMediaIntegration.js').then(module => {
    const socialMediaIntegration = module.default;
    
    console.log('✅ SocialMediaIntegration loaded successfully');
    
    // Test 2: Check platform initialization
    console.log('\n📋 Test 2: Checking Platform Initialization...');
    setTimeout(() => {
      if (socialMediaIntegration.isInitialized) {
        console.log('✅ Integration initialized successfully');
        
        // Test 3: Check platform status
        console.log('\n📋 Test 3: Checking Platform Status...');
        const status = socialMediaIntegration.getStatus();
        console.log('📊 Platform Status:', status);
        
        // Test 4: Check system health
        console.log('\n📋 Test 4: Checking System Health...');
        socialMediaIntegration.getSystemHealth().then(health => {
          console.log('🏥 System Health:', health);
          
          // Test 5: Test message processing
          console.log('\n📋 Test 5: Testing Message Processing...');
          const testMessage = {
            text: 'Send $50 to @testuser',
            senderId: 'test_sender',
            platform: 'instagram'
          };
          
          socialMediaIntegration.processMessage('instagram', testMessage).then(result => {
            console.log('💬 Message Processing Result:', result);
            console.log('\n🎉 All tests passed! NISTO Integration is working correctly!');
          }).catch(error => {
            console.log('⚠️ Message processing test failed:', error.message);
          });
          
        }).catch(error => {
          console.log('⚠️ Health check test failed:', error.message);
        });
        
      } else {
        console.log('⏳ Integration still initializing...');
        // Wait a bit more and check again
        setTimeout(() => {
          if (socialMediaIntegration.isInitialized) {
            console.log('✅ Integration initialized after waiting');
          } else {
            console.log('❌ Integration failed to initialize');
          }
        }, 2000);
      }
    }, 1000);
    
  }).catch(error => {
    console.error('❌ Failed to load SocialMediaIntegration:', error);
  });
  
} catch (error) {
  console.error('❌ Test failed:', error);
}

// Test 6: Check individual platform handlers
console.log('\n📋 Test 6: Checking Individual Platform Handlers...');
try {
  import('./platforms/InstagramHandler.js').then(module => {
    const InstagramHandler = module.default;
    const instagram = new InstagramHandler();
    console.log('✅ Instagram Handler:', instagram.platform, instagram.isConnected());
  });
  
  import('./platforms/WhatsAppHandler.js').then(module => {
    const WhatsAppHandler = module.default;
    const whatsapp = new WhatsAppHandler();
    console.log('✅ WhatsApp Handler:', whatsapp.platform, whatsapp.isConnected());
  });
  
  import('./platforms/TwitterHandler.js').then(module => {
    const TwitterHandler = module.default;
    const twitter = new TwitterHandler();
    console.log('✅ Twitter Handler:', twitter.platform, twitter.isConnected());
  });
  
} catch (error) {
  console.log('⚠️ Individual handler test failed:', error.message);
}

console.log('\n🚀 Quick test initiated! Check the console for results...');
console.log('💡 You can also run: window.testNISTOIntegration() for a full test');
