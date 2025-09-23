# 🏦 Nisto — AI-Powered Social Finance on the Internet Computer

Nisto is an AI-powered social finance platform on the Internet Computer (ICP). It unifies smart wallets, collaborative vaults, intelligent swaps, and real-time market insights—wrapped in a beautiful, secure, and scalable experience.

• Live Frontend: https://ti5uq-nqaaa-aaaau-abyhq-cai.icp0.io/
• Backend Candid: https://a4gq6-oaaaa-aaaab-qaa4q-cai.raw.icp0.io/?id=tp4se-aiaaa-aaaau-abyha-cai
• Internet Identity: https://a4gq6-oaaaa-aaaab-qaa4q-cai.raw.icp0.io/?id=r3cxq-fiaaa-aaaau-abyja-cai

---

## ✨ Highlights

- **AI Smart Wallet**: Portfolio analysis, risk scoring, auto-hedging, and smart swap routing
- **Social Finance**: Group vaults, roles, voting, and transparent collaboration
- **Unified DeFi**: Multi-token wallets, multi-provider swaps, live rates, portfolio analytics
- **Production Ready**: Deployed on ICP mainnet with Internet Identity auth
- **Modern UX**: Responsive, accessible, and fast (Vite + React)

Quick links: [`PROJECT_DESCRIPTION.md`](PROJECT_DESCRIPTION.md) · [`FUTURE_PLANS.md`](FUTURE_PLANS.md) · [`NISTO_PITCH_DECK.md`](NISTO_PITCH_DECK.md)

---

## 🚀 Quick Start

Prerequisites
- Node.js 18+
- dfx (Internet Computer SDK)
- Git

Frontend
```bash
cd src/Nisto_frontend
npm install
npm run dev
```

Backend (local)
```bash
cd src/Nisto_backend
dfx start --background
dfx deploy
```

Environment
```bash
cp .env.example .env
# Required
VITE_BACKEND_CANISTER_ID=your_canister_id
VITE_INTERNET_IDENTITY_URL=https://identity.ic0.app
# Optional (never commit secrets)
VITE_MAILGUN_API_KEY=
VITE_MAILGUN_DOMAIN=
```

---

## 🧠 Core Features

AI Smart Wallet
- Risk assessment, predictive insights, portfolio optimization
- Auto-swapping with hedging strategies and configurable thresholds

Group Vaults
- Roles, permissions, proposals, and voting
- Public/private vaults, analytics, fee-sharing foundations

Unified DeFi Interface
- Multi-token wallets (NST, ICP, BTC, ETH)
- Multi-provider swaps (1inch, ICP DEX), best-rate routing
- Real-time market and FX data, portfolio analytics

MPC Wallets (concept stage UI in repo)
- Threshold signatures, multi-party approvals, secure key shares
- Social transfers with privacy controls

---

## 🏗 Architecture Overview

Frontend (React + Vite)
```
src/Nisto_frontend/
  src/
    components/        # UI components
    pages/             # App pages
    contexts/          # Providers
    services/          # API clients and integrations
    utils/             # Helpers
    App.jsx
```

Backend (ICP / Motoko)
```
src/Nisto_backend/
  main.mo              # Core canister logic
  MPCService.mo        # MPC service (foundation)
```

Tech Stack
- Frontend: React 18, Vite, React Router, SCSS
- Backend: Motoko, Candid, ICP
- Tooling: TypeScript, ESLint, Prettier

---

## 🔐 Security & Compliance

- Internet Identity authentication
- Input validation across layers
- Encrypted storage for sensitive data
- GitHub push protection respected; secrets are not committed
- Use `.env` (already gitignored). If you leak a key, rotate it and rewrite history.

---

## 📦 Production

- Deployed on ICP mainnet (see links above)
- Multi-provider swaps and live market data
- Mobile-ready responsive UI

---

## 🛠 Development

Scripts
```bash
# Frontend
npm run dev    # start dev server
npm run build  # build

# Backend
dfx start --background
dfx deploy
```

Contributing
1) Fork ➜ branch ➜ PR
2) Follow code style and add tests for features
3) Never commit secrets. Use `.env`.

---

## 🗺 Roadmap

Short term (0–3 months)
- Chrome extension: wallet connect, signing, notifications
- AI auto-swap: thresholds, execution engine
- Vaults: roles, invites, multisig, voting

Mid term (4–9 months)
- On/Off-ramp integrations
- Social trading and vault templates
- Mobile apps (iOS/Android)

Long term (10–12 months)
- Enterprise white-label & APIs
- Advanced DeFi integrations (lending, derivatives)
- AI strategy marketplace

See details in [`FUTURE_PLANS.md`](FUTURE_PLANS.md).

---

## 📄 License

MIT — see [`LICENSE`](LICENSE).

---

Built with ❤️ on the Internet Computer
