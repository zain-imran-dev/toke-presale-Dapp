# 🚀 Presale DApp

A modern, secure, and feature-rich decentralized application for token presales with a beautiful React frontend and robust smart contracts.

![WhatsApp Image 2025-08-02 at 10 20 28_118a5a01](https://github.com/user-attachments/assets/71c9f7fe-15c4-4cdd-ad77-95130d894742)

)

## ✨ Features

### 🏗️ Smart Contracts
- **MyToken**: ERC20 token with minting and burning capabilities
- **Presale**: Advanced presale contract with comprehensive features
  - Whitelist support using Merkle trees
  - Reentrancy protection
  - Pausable functionality
  - Refund mechanism for failed presales
  - Configurable caps and limits

### 🎨 Frontend
- **Modern UI**: Beautiful gradient design with Tailwind CSS
- **Wallet Integration**: Seamless MetaMask connection via RainbowKit
- **Real-time Updates**: Live presale progress and countdown timer
- **Responsive Design**: Works perfectly on desktop and mobile
- **Interactive Elements**: Dynamic token calculation and purchase interface

### 🔒 Security Features
- **ReentrancyGuard**: Protection against reentrancy attacks
- **Ownable**: Secure access control for admin functions
- **Pausable**: Emergency pause functionality
- **Input Validation**: Comprehensive parameter validation
- **Whitelist Support**: Merkle tree-based whitelisting

## 📊 Presale Parameters

| Parameter | Value | Description |
|-----------|-------|-------------|
| **Token Name** | MyPresaleToken | ERC20 token name |
| **Token Symbol** | MPT | Token symbol |
| **Initial Supply** | 1,000,000 | Total tokens minted |
| **Token Price** | 0.001 ETH | Price per token |
| **Hard Cap** | 100 ETH | Maximum presale amount |
| **Soft Cap** | 10 ETH | Minimum for successful presale |
| **Min Purchase** | 0.01 ETH | Minimum per transaction |
| **Max Purchase** | 5 ETH | Maximum per address |
| **Duration** | 10 minutes | Presale duration |

🚀 Token Presale DApp - Quick Guide

📦 Prerequisites
- Node.js v18+
- Git
- MetaMask

🔧 Setup & Installation
git clone https://github.com/yourusername/presale-dapp.git
cd presale-dapp
npm install
cd frontend && npm install

📤 Deploy Contracts
npx hardhat node          # In Terminal 1
npx hardhat ignition deploy ignition/modules/DeployPresale.js --network localhost  # In Terminal 2

Then update frontend/src/contracts/config.js with deployed addresses.

💻 Start Frontend
cd frontend
npm run dev

App runs at: http://localhost:3000

🦊 Connect MetaMask
1. RPC URL: http://127.0.0.1:8545
2. Chain ID: 31337
3. Import accounts from Hardhat terminal
4. Connect to dApp

📱 For Users
- Click Connect Wallet
- View presale stats
- Buy or claim tokens

🧪 Testing
npx hardhat test

Covers deployment, whitelist, admin & user flows.

🎯 Smart Contracts Overview
Presale.sol
- buyTokens()
- claimTokens()
- refund()
- Admin: finalizePresale(), withdrawFunds(), pause(), setMerkleRoot() etc.

MyToken.sol
- mint(), burn(), standard ERC20

🖼 Frontend Features
- Real-time progress bar
- Buy & claim interface
- Dashboard
- Error handling
- Wallet detection

🔐 Security Highlights
- ReentrancyGuard
- Merkle tree whitelist
- Owner-only admin functions
- Emergency pause

🛠 Customize
- Smart contracts in /contracts
- Presale params in DeployPresale.js
- Frontend logic in /frontend
- Styling via Tailwind CSS

🧠 License
MIT — use freely.

Made with ❤️ using Hardhat, OpenZeppelin, Tailwind, and MetaMask


