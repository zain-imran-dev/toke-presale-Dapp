const { ethers } = require("hardhat");

async function main() {
  console.log("🚀 Starting Presale DApp deployment...");

  // Get deployer account
  const [deployer] = await ethers.getSigners();
  console.log("📝 Deploying contracts with account:", deployer.address);

  // Deploy MyToken
  console.log("📦 Deploying MyToken...");
  const MyToken = await ethers.getContractFactory("MyToken");
  const myToken = await MyToken.deploy(
    "MyPresaleToken", // name
    "MPT", // symbol
    1000000 // initial supply (1 million tokens)
  );
  await myToken.waitForDeployment();
  const myTokenAddress = await myToken.getAddress();
  console.log("✅ MyToken deployed to:", myTokenAddress);

  // Calculate presale parameters
  const currentTime = Math.floor(Date.now() / 1000);
  const presaleStartTime = currentTime; // Start immediately
  const presaleEndTime = presaleStartTime + (10 * 60); // 10 minutes duration
  const tokenPrice = ethers.parseEther("0.001"); // 0.001 ETH per token
  const hardCap = ethers.parseEther("100"); // 100 ETH hard cap
  const softCap = ethers.parseEther("10"); // 10 ETH soft cap
  const maxPurchasePerAddress = ethers.parseEther("5"); // 5 ETH max per address
  const minPurchasePerAddress = ethers.parseEther("0.01"); // 0.01 ETH min per address

  // Deploy Presale
  console.log("🎯 Deploying Presale contract...");
  const Presale = await ethers.getContractFactory("Presale");
  const presale = await Presale.deploy(
    myTokenAddress, // token address
    presaleStartTime,
    presaleEndTime,
    tokenPrice,
    hardCap,
    softCap,
    maxPurchasePerAddress,
    minPurchasePerAddress
  );
  await presale.waitForDeployment();
  const presaleAddress = await presale.getAddress();
  console.log("✅ Presale deployed to:", presaleAddress);

  // Transfer tokens to presale contract
  console.log("💰 Transferring tokens to presale contract...");
  const tokensForPresale = ethers.parseEther("500000"); // 500k tokens for presale
  const transferTx = await myToken.transfer(presaleAddress, tokensForPresale);
  await transferTx.wait();
  console.log("✅ Tokens transferred to presale contract");

  // Verify deployment
  console.log("\n🔍 Verifying deployment...");
  const presaleInfo = await presale.getPresaleInfo();
  console.log("📊 Presale Info:");
  console.log("  - Start Time:", new Date(Number(presaleInfo[0]) * 1000).toLocaleString());
  console.log("  - End Time:", new Date(Number(presaleInfo[1]) * 1000).toLocaleString());
  console.log("  - Token Price:", ethers.formatEther(presaleInfo[3]), "ETH");
  console.log("  - Hard Cap:", ethers.formatEther(presaleInfo[4]), "ETH");
  console.log("  - Soft Cap:", ethers.formatEther(presaleInfo[5]), "ETH");
  console.log("  - Max Purchase:", ethers.formatEther(presaleInfo[7]), "ETH");
  console.log("  - Min Purchase:", ethers.formatEther(presaleInfo[8]), "ETH");

  // Generate configuration for frontend
  console.log("\n📝 Frontend Configuration:");
  console.log("Update frontend/src/contracts/config.js with:");
  console.log(`export const CONTRACT_ADDRESSES = {`);
  console.log(`  MY_TOKEN: "${myTokenAddress}",`);
  console.log(`  PRESALE: "${presaleAddress}",`);
  console.log(`};`);

  console.log("\n🎉 Deployment completed successfully!");
  console.log("\n📋 Next steps:");
  console.log("1. Update contract addresses in frontend/src/contracts/config.js");
  console.log("2. Start the frontend: cd frontend && npm run dev");
  console.log("3. Connect MetaMask to Hardhat network (Chain ID: 31337)");
  console.log("4. Import test accounts from Hardhat node output");

  return {
    myToken: myTokenAddress,
    presale: presaleAddress
  };
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  }); 