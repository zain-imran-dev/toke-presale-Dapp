const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

module.exports = buildModule("DeployPresaleActive", (m) => {
  // Deploy MyToken first
  const myToken = m.contract("MyToken", [
    "MyPresaleToken", // name
    "MPT", // symbol
    1000000 // initial supply (1 million tokens)
  ]);

  // Calculate presale parameters - start immediately and run for 10 minutes
  const currentTime = Math.floor(Date.now() / 1000);
  const presaleStartTime = currentTime; // Start immediately
  const presaleEndTime = presaleStartTime + (10 * 60); // 10 minutes duration
  const tokenPrice = ethers.parseEther("0.001"); // 0.001 ETH per token
  const hardCap = ethers.parseEther("100"); // 100 ETH hard cap
  const softCap = ethers.parseEther("10"); // 10 ETH soft cap
  const maxPurchasePerAddress = ethers.parseEther("5"); // 5 ETH max per address
  const minPurchasePerAddress = ethers.parseEther("0.01"); // 0.01 ETH min per address

  // Deploy Presale contract
  const presale = m.contract("Presale", [
    myToken, // token address
    presaleStartTime,
    presaleEndTime,
    tokenPrice,
    hardCap,
    softCap,
    maxPurchasePerAddress,
    minPurchasePerAddress
  ]);

  // Transfer tokens to presale contract for distribution
  const tokensForPresale = ethers.parseEther("500000"); // 500k tokens for presale
  m.call(myToken, "transfer", [presale, tokensForPresale]);

  return { myToken, presale };
}); 