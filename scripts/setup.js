#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Setting up Presale DApp...\n');

// Check if Node.js version is compatible
const nodeVersion = process.version;
const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);
if (majorVersion < 18) {
  console.error('❌ Node.js version 18 or higher is required');
  console.error(`Current version: ${nodeVersion}`);
  process.exit(1);
}

console.log('✅ Node.js version check passed');

// Install dependencies
console.log('\n📦 Installing dependencies...');
try {
  execSync('npm install', { stdio: 'inherit' });
  console.log('✅ Root dependencies installed');
  
  // Install frontend dependencies
  console.log('📦 Installing frontend dependencies...');
  execSync('cd frontend && npm install', { stdio: 'inherit' });
  console.log('✅ Frontend dependencies installed');
} catch (error) {
  console.error('❌ Failed to install dependencies:', error.message);
  process.exit(1);
}

// Create .env file if it doesn't exist
const envPath = path.join(__dirname, '..', '.env');
if (!fs.existsSync(envPath)) {
  console.log('\n📝 Creating .env file...');
  const envContent = `# Environment variables for Presale DApp
# Add your configuration here

# Network configuration
NETWORK_ID=31337
RPC_URL=http://127.0.0.1:8545

# Contract addresses (will be updated after deployment)
MY_TOKEN_ADDRESS=
PRESALE_ADDRESS=

# Frontend configuration
NEXT_PUBLIC_NETWORK_ID=31337
NEXT_PUBLIC_RPC_URL=http://127.0.0.1:8545
`;
  fs.writeFileSync(envPath, envContent);
  console.log('✅ .env file created');
}

// Create deployment info file
const deploymentInfoPath = path.join(__dirname, '..', 'deployment-info.md');
if (!fs.existsSync(deploymentInfoPath)) {
  console.log('\n📝 Creating deployment info file...');
  const deploymentInfo = `# Deployment Information

This file will be updated with contract addresses after deployment.

## Contract Addresses

- **MyToken**: \`\`
- **Presale**: \`\`

## Network Configuration

- **Network**: Hardhat Local
- **Chain ID**: 31337
- **RPC URL**: http://127.0.0.1:8545

## Deployment Commands

\`\`\`bash
# Start Hardhat node
npx hardhat node

# Deploy contracts (in new terminal)
npx hardhat run scripts/deploy.js --network localhost

# Or use Ignition
npx hardhat ignition deploy ignition/modules/DeployPresale.js --network localhost
\`\`\`

## Frontend Setup

\`\`\`bash
cd frontend
npm run dev
\`\`\`

## MetaMask Configuration

1. Add Hardhat network to MetaMask:
   - Network Name: Hardhat
   - RPC URL: http://127.0.0.1:8545
   - Chain ID: 31337
   - Currency: ETH

2. Import test accounts from Hardhat node output

3. Connect MetaMask to the dapp
`;
  fs.writeFileSync(deploymentInfoPath, deploymentInfo);
  console.log('✅ Deployment info file created');
}

console.log('\n🎉 Setup completed successfully!');
console.log('\n📋 Next steps:');
console.log('1. Start Hardhat node: npx hardhat node');
console.log('2. Deploy contracts: npx hardhat run scripts/deploy.js --network localhost');
console.log('3. Update contract addresses in frontend/src/contracts/config.js');
console.log('4. Start frontend: cd frontend && npm run dev');
console.log('5. Configure MetaMask for Hardhat network');
console.log('\n📚 Check README.md for detailed instructions'); 