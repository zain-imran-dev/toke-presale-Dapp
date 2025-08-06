// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
import "./MyToken.sol";

contract Presale is Ownable, ReentrancyGuard, Pausable {
    MyToken public token;
    
    // Presale parameters
    uint256 public presaleStartTime;
    uint256 public presaleEndTime;
    uint256 public tokenPrice; // Price in ETH per token (in wei)
    uint256 public hardCap; // Maximum ETH to be raised
    uint256 public softCap; // Minimum ETH to be raised
    uint256 public maxPurchasePerAddress; // Maximum ETH per address
    uint256 public minPurchasePerAddress; // Minimum ETH per address
    
    // State variables
    uint256 public totalRaised;
    bool public presaleFinalized;
    bytes32 public merkleRoot;
    
    // Mapping to track contributions
    mapping(address => uint256) public contributions;
    mapping(address => bool) public hasClaimed;
    
    // Events
    event TokensPurchased(address indexed buyer, uint256 ethAmount, uint256 tokenAmount);
    event TokensClaimed(address indexed buyer, uint256 tokenAmount);
    event PresaleFinalized(uint256 totalRaised, uint256 totalTokensSold);
    event WhitelistUpdated(bytes32 merkleRoot);
    
    // Errors
    error PresaleNotStarted();
    error PresaleEnded();
    error PresalePaused();
    error InvalidAmount();
    error ExceedsMaxPurchase();
    error BelowMinPurchase();
    error HardCapReached();
    error NotWhitelisted();
    error AlreadyClaimed();
    error PresaleNotFinalized();
    error SoftCapNotReached();
    error NoContribution();
    
    constructor(
        address _token,
        uint256 _presaleStartTime,
        uint256 _presaleEndTime,
        uint256 _tokenPrice,
        uint256 _hardCap,
        uint256 _softCap,
        uint256 _maxPurchasePerAddress,
        uint256 _minPurchasePerAddress
    ) Ownable(msg.sender) {
        token = MyToken(_token);
        presaleStartTime = _presaleStartTime;
        presaleEndTime = _presaleEndTime;
        tokenPrice = _tokenPrice;
        hardCap = _hardCap;
        softCap = _softCap;
        maxPurchasePerAddress = _maxPurchasePerAddress;
        minPurchasePerAddress = _minPurchasePerAddress;
    }
    
    modifier presaleActive() {
        if (block.timestamp < presaleStartTime) revert PresaleNotStarted();
        if (block.timestamp > presaleEndTime) revert PresaleEnded();
        if (paused()) revert PresalePaused();
        _;
    }
    
    function buyTokens(bytes32[] calldata merkleProof) 
        external 
        payable 
        nonReentrant 
        presaleActive 
    {
        if (msg.value == 0) revert InvalidAmount();
        if (msg.value > maxPurchasePerAddress) revert ExceedsMaxPurchase();
        if (msg.value < minPurchasePerAddress) revert BelowMinPurchase();
        if (totalRaised + msg.value > hardCap) revert HardCapReached();
        
        // Check whitelist if merkle root is set
        if (merkleRoot != bytes32(0)) {
            bytes32 leaf = keccak256(abi.encodePacked(msg.sender));
            if (!MerkleProof.verify(merkleProof, merkleRoot, leaf)) {
                revert NotWhitelisted();
            }
        }
        
        // Check if user hasn't exceeded max purchase
        if (contributions[msg.sender] + msg.value > maxPurchasePerAddress) {
            revert ExceedsMaxPurchase();
        }
        
        contributions[msg.sender] += msg.value;
        totalRaised += msg.value;
        
        uint256 tokenAmount = (msg.value * 10**token.decimals()) / tokenPrice;
        
        emit TokensPurchased(msg.sender, msg.value, tokenAmount);
    }
    
    function claimTokens() external nonReentrant {
        if (!presaleFinalized) revert PresaleNotFinalized();
        if (hasClaimed[msg.sender]) revert AlreadyClaimed();
        if (contributions[msg.sender] == 0) revert NoContribution();
        
        uint256 tokenAmount = (contributions[msg.sender] * 10**token.decimals()) / tokenPrice;
        hasClaimed[msg.sender] = true;
        
        require(token.transfer(msg.sender, tokenAmount), "Token transfer failed");
        
        emit TokensClaimed(msg.sender, tokenAmount);
    }
    
    function finalizePresale() external onlyOwner {
        if (presaleFinalized) revert("Presale already finalized");
        if (block.timestamp < presaleEndTime && totalRaised < hardCap) {
            revert("Presale not ended and hard cap not reached");
        }
        
        presaleFinalized = true;
        
        uint256 totalTokensSold = (totalRaised * 10**token.decimals()) / tokenPrice;
        
        // Transfer unsold tokens back to owner if soft cap not reached
        if (totalRaised < softCap) {
            uint256 remainingTokens = token.balanceOf(address(this));
            if (remainingTokens > 0) {
                require(token.transfer(owner(), remainingTokens), "Token transfer failed");
            }
        }
        
        emit PresaleFinalized(totalRaised, totalTokensSold);
    }
    
    function withdrawFunds() external onlyOwner {
        if (!presaleFinalized) revert PresaleNotFinalized();
        if (totalRaised < softCap) revert SoftCapNotReached();
        
        uint256 balance = address(this).balance;
        require(balance > 0, "No funds to withdraw");
        
        (bool success, ) = payable(owner()).call{value: balance}("");
        require(success, "Withdrawal failed");
    }
    
    function refund() external nonReentrant {
        if (!presaleFinalized) revert PresaleNotFinalized();
        if (totalRaised >= softCap) revert("Soft cap reached, no refunds");
        if (contributions[msg.sender] == 0) revert NoContribution();
        
        uint256 refundAmount = contributions[msg.sender];
        contributions[msg.sender] = 0;
        
        (bool success, ) = payable(msg.sender).call{value: refundAmount}("");
        require(success, "Refund failed");
    }
    
    // Admin functions
    function setMerkleRoot(bytes32 _merkleRoot) external onlyOwner {
        merkleRoot = _merkleRoot;
        emit WhitelistUpdated(_merkleRoot);
    }
    
    function pause() external onlyOwner {
        _pause();
    }
    
    function unpause() external onlyOwner {
        _unpause();
    }
    
    function updatePresaleTimes(uint256 _startTime, uint256 _endTime) external onlyOwner {
        presaleStartTime = _startTime;
        presaleEndTime = _endTime;
    }
    
    function updateCaps(uint256 _hardCap, uint256 _softCap) external onlyOwner {
        hardCap = _hardCap;
        softCap = _softCap;
    }
    
    function updatePurchaseLimits(uint256 _maxPurchase, uint256 _minPurchase) external onlyOwner {
        maxPurchasePerAddress = _maxPurchase;
        minPurchasePerAddress = _minPurchase;
    }
    
    function updateTokenPrice(uint256 _tokenPrice) external onlyOwner {
        tokenPrice = _tokenPrice;
    }
    
    // View functions
    function getPresaleInfo() external view returns (
        uint256 startTime,
        uint256 endTime,
        uint256 currentTime,
        uint256 price,
        uint256 hardCapAmount,
        uint256 softCapAmount,
        uint256 raised,
        uint256 maxPurchase,
        uint256 minPurchase,
        bool isActive,
        bool isFinalized
    ) {
        return (
            presaleStartTime,
            presaleEndTime,
            block.timestamp,
            tokenPrice,
            hardCap,
            softCap,
            totalRaised,
            maxPurchasePerAddress,
            minPurchasePerAddress,
            block.timestamp >= presaleStartTime && block.timestamp <= presaleEndTime && !paused(),
            presaleFinalized
        );
    }
    
    function getContribution(address user) external view returns (uint256) {
        return contributions[user];
    }
    
    function getClaimStatus(address user) external view returns (bool) {
        return hasClaimed[user];
    }
    
    function calculateTokensForEth(uint256 ethAmount) external view returns (uint256) {
        return (ethAmount * 10**token.decimals()) / tokenPrice;
    }
    
    function isWhitelisted(address user, bytes32[] calldata merkleProof) external view returns (bool) {
        if (merkleRoot == bytes32(0)) return true;
        bytes32 leaf = keccak256(abi.encodePacked(user));
        return MerkleProof.verify(merkleProof, merkleRoot, leaf);
    }
    
    // Emergency functions
    function emergencyWithdraw() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No funds to withdraw");
        
        (bool success, ) = payable(owner()).call{value: balance}("");
        require(success, "Emergency withdrawal failed");
    }
    
    function emergencyTokenWithdraw() external onlyOwner {
        uint256 tokenBalance = token.balanceOf(address(this));
        require(tokenBalance > 0, "No tokens to withdraw");
        
        require(token.transfer(owner(), tokenBalance), "Emergency token withdrawal failed");
    }
} 