const { expect } = require("chai");
const { ethers } = require("hardhat");
const { MerkleTree } = require("merkletreejs");

describe("Token Sale / Presale - Alternative", function () {
  let MyToken, token, Presale, presale;
  let owner, user1, user2, user3;
  let whitelistAddresses, tree, merkleRoot;

  beforeEach(async function () {
    [owner, user1, user2, user3] = await ethers.getSigners();

    // Deploy token
    MyToken = await ethers.getContractFactory("MyToken");
    token = await MyToken.deploy("MyToken", "MTK", 1000000);
    await token.waitForDeployment();

    // Setup whitelist using merkletreejs (alternative approach)
    whitelistAddresses = [user1.address, user2.address, user3.address];
    
    // Create leaves - this matches what your contract expects
    const leaves = whitelistAddresses.map(addr => 
      ethers.keccak256(ethers.solidityPacked(["address"], [addr]))
    );
    
    // Create tree
    tree = new MerkleTree(leaves, ethers.keccak256, { sortPairs: true });
    merkleRoot = tree.getHexRoot();

    // Calculate presale parameters
    const currentTime = Math.floor(Date.now() / 1000);
    const presaleStartTime = currentTime + 60;
    const presaleEndTime = currentTime + (7 * 24 * 60 * 60);
    
    const tokenPrice = ethers.parseEther("0.001");
    const hardCap = ethers.parseEther("100");
    const softCap = ethers.parseEther("10");
    const maxPurchasePerAddress = ethers.parseEther("5");
    const minPurchasePerAddress = ethers.parseEther("0.1");

    // Deploy presale
    Presale = await ethers.getContractFactory("Presale");
    presale = await Presale.deploy(
      await token.getAddress(),
      presaleStartTime,
      presaleEndTime,
      tokenPrice,
      hardCap,
      softCap,
      maxPurchasePerAddress,
      minPurchasePerAddress
    );
    await presale.waitForDeployment();

    // Transfer tokens to presale contract
    const presaleAddress = await presale.getAddress();
    const tokensForPresale = (hardCap * ethers.parseUnits("1", 18)) / tokenPrice;
    await token.transfer(presaleAddress, tokensForPresale);

    // Set whitelist
    await presale.setMerkleRoot(merkleRoot);
  });

  describe("Deployment", function () {
    it("Should deploy token and presale contracts", async function () {
      expect(await token.getAddress()).to.be.properAddress;
      expect(await presale.getAddress()).to.be.properAddress;
    });

    it("Should set correct token in presale contract", async function () {
      expect(await presale.token()).to.equal(await token.getAddress());
    });

    it("Should set whitelist merkle root", async function () {
      expect(await presale.merkleRoot()).to.equal(merkleRoot);
    });
  });

  describe("Whitelisting with MerkleTreeJS", function () {
    it("Should verify whitelisted addresses", async function () {
      // Create leaf for user1
      const leaf = ethers.keccak256(ethers.solidityPacked(["address"], [user1.address]));
      const proof = tree.getHexProof(leaf);
      
      const isWhitelisted = await presale.isWhitelisted(user1.address, proof);
      expect(isWhitelisted).to.be.true;
    });

    it("Should verify all whitelisted addresses", async function () {
      for (const address of whitelistAddresses) {
        const leaf = ethers.keccak256(ethers.solidityPacked(["address"], [address]));
        const proof = tree.getHexProof(leaf);
        
        const isWhitelisted = await presale.isWhitelisted(address, proof);
        expect(isWhitelisted).to.be.true;
      }
    });

    it("Should reject non-whitelisted addresses", async function () {
      const emptyProof = [];
      const isWhitelisted = await presale.isWhitelisted(owner.address, emptyProof);
      expect(isWhitelisted).to.be.false;
    });

    it("Should reject whitelisted address with wrong proof", async function () {
      // Create proof for user2 but use it for user1
      const leaf2 = ethers.keccak256(ethers.solidityPacked(["address"], [user2.address]));
      const wrongProof = tree.getHexProof(leaf2);
      
      const isWhitelisted = await presale.isWhitelisted(user1.address, wrongProof);
      expect(isWhitelisted).to.be.false;
    });
  });

  describe("Presale Info", function () {
    it("Should return correct presale information", async function () {
      const info = await presale.getPresaleInfo();
      expect(info[4]).to.equal(ethers.parseEther("100")); // hard cap
      expect(info[5]).to.equal(ethers.parseEther("10")); // soft cap
      expect(info[7]).to.equal(ethers.parseEther("5")); // max purchase
      expect(info[8]).to.equal(ethers.parseEther("0.1")); // min purchase
    });
  });

  describe("Token Calculations", function () {
    it("Should calculate correct tokens for ETH amount", async function () {
      const ethAmount = ethers.parseEther("1");
      const tokens = await presale.calculateTokensForEth(ethAmount);
      const expectedTokens = (ethAmount * ethers.parseUnits("1", 18)) / ethers.parseEther("0.001");
      expect(tokens).to.equal(expectedTokens);
    });
  });

  describe("User Contributions", function () {
    it("Should track user contributions", async function () {
      const contribution = await presale.getContribution(user1.address);
      expect(contribution).to.equal(0);
    });

    it("Should track claim status", async function () {
      const claimed = await presale.getClaimStatus(user1.address);
      expect(claimed).to.be.false;
    });
  });

  describe("Admin Functions", function () {
    it("Should allow owner to pause/unpause", async function () {
      await presale.pause();
      expect(await presale.paused()).to.be.true;
      
      await presale.unpause();
      expect(await presale.paused()).to.be.false;
    });

    it("Should allow owner to update merkle root", async function () {
      const newRoot = "0x0000000000000000000000000000000000000000000000000000000000000001";
      await presale.setMerkleRoot(newRoot);
      expect(await presale.merkleRoot()).to.equal(newRoot);
    });

    it("Should allow owner to update presale times", async function () {
      const currentTime = Math.floor(Date.now() / 1000);
      const newStartTime = currentTime + 3600; // 1 hour from now
      const newEndTime = currentTime + (14 * 24 * 60 * 60); // 14 days
      
      await presale.updatePresaleTimes(newStartTime, newEndTime);
      
      const info = await presale.getPresaleInfo();
      expect(info[0]).to.equal(newStartTime); // start time
      expect(info[1]).to.equal(newEndTime); // end time
    });

    it("Should allow owner to update caps", async function () {
      const newHardCap = ethers.parseEther("200");
      const newSoftCap = ethers.parseEther("20");
      
      await presale.updateCaps(newHardCap, newSoftCap);
      
      const info = await presale.getPresaleInfo();
      expect(info[4]).to.equal(newHardCap); // hard cap
      expect(info[5]).to.equal(newSoftCap); // soft cap
    });

    it("Should allow owner to update purchase limits", async function () {
      const newMaxPurchase = ethers.parseEther("10");
      const newMinPurchase = ethers.parseEther("0.05");
      
      await presale.updatePurchaseLimits(newMaxPurchase, newMinPurchase);
      
      const info = await presale.getPresaleInfo();
      expect(info[7]).to.equal(newMaxPurchase); // max purchase
      expect(info[8]).to.equal(newMinPurchase); // min purchase
    });

    it("Should allow owner to update token price", async function () {
      const newTokenPrice = ethers.parseEther("0.002");
      
      await presale.updateTokenPrice(newTokenPrice);
      
      const info = await presale.getPresaleInfo();
      expect(info[3]).to.equal(newTokenPrice); // token price
    });
  });
});