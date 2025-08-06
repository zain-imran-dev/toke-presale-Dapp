# 🚀 Presale DApp

A modern, secure, and feature-rich decentralized application for token presales with a beautiful React frontend and robust smart contracts.

![Presale DApp Screenshot](https://i.imgur.com/example-screenshot.png)

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

## 🏗️ Project Structure

```
presale-dapp/
├── contracts/
│   ├── MyToken.sol          # ERC20 token contract
│   └── Presale.sol          # Presale contract with advanced features
├── ignition/
│   └── modules/
│       └── DeployPresale.js # Hardhat Ignition deployment script
├── frontend/
│   ├── src/
│   │   ├── app/             # Next.js app directory
│   │   ├── components/
│   │   │   └── PresaleCard.js # Main presale component
│   │   └── contracts/
│   │       ├── abi/         # Contract ABIs
│   │       │   ├── MyToken.json
│   │       │   └── Presale.json
│   │       └── config.js    # Contract configuration
│   └── package.json
├── test/
│   └── Presale.test.js      # Comprehensive test suite
└── package.json
```

## 🚀 Quick Start

### Prerequisites
- Node.js (v18 or higher)
- MetaMask wallet
- Git

### 1. Clone and Install

```bash
# Clone the repository
git clone https://github.com/yourusername/presale-dapp.git
cd presale-dapp

# Install dependencies
npm install
cd frontend && npm install
cd ..
```

### 2. Deploy Smart Contracts

```bash
# Start local Hardhat node
npx hardhat node

# In a new terminal, deploy contracts
npx hardhat ignition deploy ignition/modules/DeployPresale.js --network localhost
```

After deployment, update the contract addresses in `frontend/src/contracts/config.js`:

```javascript
export const CONTRACT_ADDRESSES = {
  MY_TOKEN: "0x...", // Your deployed MyToken address
  PRESALE: "0x...",  // Your deployed Presale address
};
```

### 3. Start the Frontend

```bash
# Navigate to frontend directory
cd frontend

# Start development server
npm run dev
```

The dapp will be available at `http://localhost:3000`

### 4. Connect MetaMask

1. **Install MetaMask** if you haven't already
2. **Add Hardhat Network** to MetaMask:
   - Network Name: `Hardhat`
   - RPC URL: `http://127.0.0.1:8545`
   - Chain ID: `31337`
   - Currency: `ETH`
3. **Import test accounts** from the Hardhat node output
4. **Connect MetaMask** to the dapp

## 🎯 Smart Contract Functions

### Presale Contract

#### User Functions
- `buyTokens(bytes32[] merkleProof)`: Purchase tokens with ETH
- `claimTokens()`: Claim purchased tokens after presale ends
- `refund()`: Get refund if soft cap not reached

#### Admin Functions
- `finalizePresale()`: End the presale (owner only)
- `withdrawFunds()`: Withdraw raised ETH (owner only)
- `pause()/unpause()`: Emergency pause functionality
- `setMerkleRoot(bytes32)`: Update whitelist
- `updatePresaleTimes(uint256, uint256)`: Modify presale duration
- `updateCaps(uint256, uint256)`: Update hard/soft caps
- `updatePurchaseLimits(uint256, uint256)`: Modify purchase limits
- `updateTokenPrice(uint256)`: Change token price

#### View Functions
- `getPresaleInfo()`: Get all presale parameters
- `getContribution(address)`: Check user contribution
- `getClaimStatus(address)`: Check if user claimed tokens
- `calculateTokensForEth(uint256)`: Calculate tokens for ETH amount
- `isWhitelisted(address, bytes32[])`: Verify whitelist status

### MyToken Contract

- `mint(address, uint256)`: Mint new tokens (owner only)
- `burn(uint256)`: Burn tokens
- Standard ERC20 functions

## 🎨 Frontend Features

### UI Components

1. **Progress Bar**: Animated gradient progress indicator
2. **Info Cards**: Key presale metrics with emojis
3. **Buy Interface**: Clean form for purchasing tokens
4. **Claim Interface**: Simple claiming process
5. **User Dashboard**: Contribution and claim status

### Key Features

- **Real-time Updates**: All data updates automatically
- **Responsive Design**: Works on all devices
- **Wallet Integration**: Easy MetaMask connection
- **Transaction Status**: Loading states and feedback
- **Error Handling**: User-friendly error messages
- **Network Validation**: Ensures correct network connection

## 🧪 Testing

Run the comprehensive test suite:

```bash
npx hardhat test
```

The test suite covers:
- Contract deployment
- Whitelist functionality
- Presale operations
- Admin functions
- Security features
- Edge cases

## 🔧 Configuration

### Smart Contract Configuration

Edit `ignition/modules/DeployPresale.js` to modify presale parameters:

```javascript
const presaleStartTime = Math.floor(Date.now() / 1000); // Start immediately
const presaleEndTime = presaleStartTime + (10 * 60); // 10 minutes
const tokenPrice = ethers.parseEther("0.001"); // 0.001 ETH per token
const hardCap = ethers.parseEther("100"); // 100 ETH hard cap
const softCap = ethers.parseEther("10"); // 10 ETH soft cap
```

### Frontend Configuration

Update contract addresses in `frontend/src/contracts/config.js` after deployment.

## 📱 Usage Guide

### For Users

1. **Connect Wallet**: Click "Connect Wallet" and approve MetaMask
2. **View Presale Info**: See progress, time remaining, and statistics
3. **Buy Tokens**: Enter ETH amount and click "Buy Tokens"
4. **Claim Tokens**: After presale ends, click "Claim Tokens"

### For Developers

1. **Customize Parameters**: Modify deployment script for your needs
2. **Add Features**: Extend contracts with additional functionality
3. **Style Changes**: Update Tailwind classes for custom design
4. **Deploy to Mainnet**: Update network configuration for production

## 🔒 Security Considerations

- **Reentrancy Protection**: Using OpenZeppelin's ReentrancyGuard
- **Access Control**: Owner-only functions for admin operations
- **Input Validation**: Comprehensive parameter checks
- **Emergency Functions**: Pause and emergency withdrawal capabilities
- **Whitelist Support**: Merkle tree for secure whitelisting

## 📈 Monitoring

The dapp provides real-time monitoring of:
- Total ETH raised
- Progress percentage
- Time remaining
- User contributions
- Claim status
- Network connection status

## 🚀 Deployment

### Local Development

```bash
# Start local blockchain
npx hardhat node

# Deploy contracts
npx hardhat ignition deploy ignition/modules/DeployPresale.js --network localhost

# Start frontend
cd frontend && npm run dev
```

### Production Deployment

1. **Deploy contracts** to your target network (Ethereum, Polygon, etc.)
2. **Update contract addresses** in frontend config
3. **Build and deploy frontend**:

```bash
cd frontend
npm run build
npm run start
```

## 🛠️ Development

### Adding New Features

1. **Smart Contracts**: Add functions to contracts in `contracts/`
2. **Frontend**: Create new components in `frontend/src/components/`
3. **Styling**: Use Tailwind CSS classes for consistent design

### Customization

- **Colors**: Modify gradient classes in components
- **Layout**: Adjust grid and flex layouts
- **Animations**: Add CSS transitions and transforms
- **Parameters**: Update presale configuration

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [OpenZeppelin](https://openzeppelin.com/) for secure smart contract libraries
- [Hardhat](https://hardhat.org/) for development framework
- [RainbowKit](https://rainbowkit.com/) for wallet integration
- [Tailwind CSS](https://tailwindcss.com/) for styling
- [Next.js](https://nextjs.org/) for React framework

---

Made with ❤️ for the blockchain community

