# Nesto Browser Extension

A MetaMask-like browser extension for the Internet Computer ecosystem, providing secure identity management, wallet functionality, and seamless dapp integration.

## 🚀 Features

### **Core Functionality**
- **Identity Management**: Create, import, and manage Internet Computer identities
- **Wallet Operations**: Send/receive ICP, view balances, transaction history
- **Dapp Integration**: One-click connection to any IC dapp
- **Transaction Signing**: Secure signing of IC transactions
- **Cross-tab Sync**: Identity state synchronized across all browser tabs

### **Security Features**
- **Encrypted Storage**: All sensitive data encrypted locally
- **Secure Key Management**: Private keys never leave the extension
- **Recovery Options**: Multiple recovery methods for identity restoration
- **Permission System**: Granular permissions for dapp access

### **User Experience**
- **MetaMask-like Interface**: Familiar wallet interface for users
- **Real-time Notifications**: Transaction status and dapp connection alerts
- **Dark/Light Themes**: Customizable appearance
- **Multi-language Support**: Internationalization ready

## 📁 File Structure

```
public/
├── manifest-v3.json          # Extension manifest (Manifest V3)
├── background.js             # Background service worker
├── content.js                # Content script for dapp injection
├── injected.js               # Wallet provider injection
├── popup.html                # Extension popup interface
├── popup.js                  # Popup functionality
├── welcome.html              # First-time user welcome page
├── icons/                    # Extension icons
│   ├── icon-16x16.png
│   ├── icon-32x32.png
│   ├── icon-48x48.png
│   └── icon-128x128.png
└── pages/                    # Additional extension pages
    ├── create-identity.html
    ├── import-identity.html
    ├── send.html
    ├── receive.html
    └── settings.html
```

## 🔧 Installation & Development

### **For Development**

1. **Build the extension**:
   ```bash
   cd src/Nisto_frontend
   npm run build
   ```

2. **Load in Chrome**:
   - Open Chrome and go to `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select the `public` folder

3. **Test the extension**:
   - Click the Nesto icon in the toolbar
   - Visit any IC dapp (e.g., `https://nns.ic0.app`)
   - The extension will automatically inject the wallet provider

### **For Production**

1. **Package the extension**:
   ```bash
   # Create a zip file of the public folder
   zip -r nesto-extension.zip public/
   ```

2. **Publish to Chrome Web Store**:
   - Upload the zip file to the Chrome Web Store
   - Follow the review process

## 🌐 Dapp Integration

### **For Dapp Developers**

The Nesto extension provides a familiar wallet interface for IC dapps:

```javascript
// Check if Nesto is available
if (window.nesto) {
  // Connect to wallet
  const identity = await window.nesto.connect();
  console.log('Connected:', identity.principal);
  
  // Sign a transaction
  const signedTx = await window.nesto.signTransaction({
    type: 'icp_transfer',
    to: 'recipient_principal',
    amount: '1.5'
  });
  
  // Call a canister
  const result = await window.nesto.callCanister(
    'canister_id',
    'method_name',
    { arg1: 'value1' }
  );
}
```

### **Provider Events**

```javascript
// Listen for connection events
window.nesto.on('accountsChanged', (accounts) => {
  console.log('Accounts changed:', accounts);
});

window.nesto.on('connect', (identity) => {
  console.log('Connected to:', identity);
});

window.nesto.on('disconnect', () => {
  console.log('Disconnected');
});
```

## 🔐 Security Considerations

### **Data Storage**
- **Local Storage**: All data stored locally in Chrome's secure storage
- **Encryption**: Sensitive data encrypted before storage
- **No Cloud Sync**: No data sent to external servers

### **Key Management**
- **Private Keys**: Never exposed to dapps or external scripts
- **Signing**: All signing operations performed in isolated context
- **Recovery**: Multiple recovery methods available

### **Permissions**
- **Minimal Permissions**: Only requests necessary permissions
- **Host Permissions**: Limited to IC domains
- **User Control**: Users can revoke permissions anytime

## 🎨 Customization

### **Themes**
The extension supports custom themes:

```javascript
// In popup.js
const themes = {
  light: {
    background: '#ffffff',
    text: '#000000',
    primary: '#075B5E'
  },
  dark: {
    background: '#1a1a1a',
    text: '#ffffff',
    primary: '#075B5E'
  }
};
```

### **Styling**
All styles are in the HTML files and can be customized:
- `popup.html` - Main popup interface
- `welcome.html` - Welcome page
- Additional pages in `pages/` folder

## 🧪 Testing

### **Manual Testing**
1. **Install extension** in development mode
2. **Create an identity** through the popup
3. **Visit IC dapps** and test connection
4. **Test transactions** and signing
5. **Verify cross-tab sync**

### **Automated Testing**
```bash
# Run extension tests (when implemented)
npm run test:extension

# Test dapp integration
npm run test:integration
```

## 📦 Distribution

### **Chrome Web Store**
1. Create developer account
2. Package extension as zip
3. Submit for review
4. Publish when approved

### **Firefox Add-ons**
1. Convert manifest to V2 (if needed)
2. Submit to Firefox Add-ons
3. Follow review process

### **Edge Add-ons**
1. Submit to Microsoft Edge Add-ons
2. Follow review process

## 🔄 Updates

### **Version Management**
- Update version in `manifest-v3.json`
- Update version in popup interface
- Document changes in changelog

### **Auto-updates**
- Chrome Web Store handles updates automatically
- Users receive updates when available

## 🐛 Troubleshooting

### **Common Issues**

1. **Extension not loading**:
   - Check manifest syntax
   - Verify all files exist
   - Check Chrome console for errors

2. **Dapp integration failing**:
   - Verify content script injection
   - Check host permissions
   - Test with simple dapp first

3. **Identity not connecting**:
   - Check storage permissions
   - Verify identity creation
   - Check background script logs

### **Debug Mode**
Enable debug logging in `background.js`:
```javascript
const DEBUG = true;
if (DEBUG) console.log('Debug message');
```

## 📚 API Reference

### **Background Script API**
- `GET_IDENTITIES` - Retrieve stored identities
- `CONNECT_IDENTITY` - Connect to specific identity
- `DISCONNECT_IDENTITY` - Disconnect current identity
- `SIGN_TRANSACTION` - Sign a transaction
- `SHOW_NOTIFICATION` - Display notification

### **Content Script API**
- `window.nestoWallet` - Direct wallet interface
- `window.nesto` - Provider interface
- `window.ethereum` - Compatibility interface

### **Popup API**
- Identity management
- Balance display
- Quick actions
- Settings access

## 🤝 Contributing

1. **Fork the repository**
2. **Create feature branch**
3. **Make changes**
4. **Test thoroughly**
5. **Submit pull request**

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

- **Documentation**: Check this README and inline comments
- **Issues**: Report bugs on GitHub
- **Discussions**: Use GitHub Discussions for questions
- **Community**: Join the IC community for help

---

**Nesto Browser Extension** - Making the Internet Computer accessible to everyone! 🚀
