# Nisto

A next-generation social finance platform on the Internet Computer, combining DeFi, social trading, AI-powered insights, and a developer mini-app ecosystem.

---

## 🚀 Overview
Nisto is a modern, modular, and extensible platform for managing digital assets, group vaults, payments, and more. It features a beautiful dashboard, seamless onboarding, robust recovery, and a plugin/mini-app marketplace for developers.

---

## ✨ Key Features

- **Unified Dashboard**: Clean, modern UI with stats, recent activity, and quick actions.
- **Crypto Wallets**: Multi-currency support, deposit/withdraw, balance tracking, and address management.
- **DeFi Tools**: Portfolio overview, asset analytics, staking, lending, yield farming, and more.
- **Group Vaults**: Create, join, and manage group savings/investment vaults with member roles and permissions.
- **Local Payments**: Integrate with M-Pesa, Airtel Money, and more for fiat on/off ramps.
- **Social Games**: Participate in trading games, challenges, and leaderboards.
- **AI Assistant**: Get personalized financial insights and recommendations.
- **Plugin/Mini-App Marketplace**: Discover, install, and build mini-apps for trading, analytics, NFTs, and more.
- **Account Recovery**: Multi-method recovery (email, SMS, security questions, emergency contact) with a modern, interactive setup flow.
- **Notifications**: Real-time notifications and activity tracking.
- **Onboarding**: Seamless, multi-step onboarding with modals for profile, wallets, and recovery.
- **Responsive Design**: Works beautifully on desktop and mobile.

---

## 🛠️ Developer Guide

### Getting Started
```bash
git clone https://github.com/KezzyNgotho/Nisto.git
cd Nisto
npm install
npm run dev  # or yarn dev
```

### Building & Running
- **Frontend**: React + Vite + SCSS (in `src/Nisto_frontend`)
- **Backend**: Motoko canisters (in `src/Nisto_backend`)
- **Start local IC replica**: `dfx start`
- **Deploy canisters**: `dfx deploy`

### Contributing
- Fork the repo, create a feature branch, and submit a pull request.
- Follow the code style and add tests where possible.

### Creating Mini-Apps/Plugins
- See the `src/Nisto_frontend/src/components/PluginSystem.jsx` for plugin architecture.
- Plugins are React components with a defined API and metadata.
- Submit your mini-app/plugin via pull request or contact the maintainers.

---

## 🏆 Milestones

- **MVP**: Unified dashboard, wallets, group vaults, onboarding, recovery, notifications.
- **DeFi Launch**: Portfolio analytics, staking, lending, yield farming, DeFi product cards.
- **Social Layer**: Social games, leaderboards, group challenges.
- **Plugin Ecosystem**: Mini-app marketplace, developer APIs, plugin management UI.
- **Mobile & Extension**: Responsive mobile UI, browser extension, push notifications.
- **Advanced Recovery**: Multi-method, social recovery, and backup options.
- **AI & Analytics**: AI assistant, smart alerts, risk analysis, portfolio insights.

---

## 📸 Screenshots

> _Add screenshots/gifs of the dashboard, DeFi tools, group vaults, plugin marketplace, and onboarding modals here._

---

## 📄 License
MIT License

---

## 📬 Contact
- **Lead Developer:** Kezzy Ngotho ([GitHub](https://github.com/KezzyNgotho))
- **Issues & Support:** Use the [GitHub Issues](https://github.com/KezzyNgotho/Nisto/issues) page.
- **Contributions:** PRs welcome!
