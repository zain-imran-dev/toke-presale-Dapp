import MyTokenABI from './abi/MyToken.json';
import PresaleABI from './abi/Presale.json';

// Contract addresses - these will be updated after deployment
export const CONTRACT_ADDRESSES = {
  // Update these addresses after deploying with Ignition
  MY_TOKEN: "0x5FbDB2315678afecb367f032d93F642f64180aa3", // Deployed 10-minute presale
  PRESALE: "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512", // Deployed 10-minute presale
};

export const CONTRACT_ABIS = {
  MY_TOKEN: MyTokenABI,
  PRESALE: PresaleABI,
};

// Utility function to format ETH values
export const formatETH = (wei) => {
  if (!wei) return "0";
  // Convert BigInt to string if needed
  const weiStr = typeof wei === 'bigint' ? wei.toString() : wei.toString();
  return (parseFloat(weiStr) / 1e18).toFixed(4);
};

// Utility function to format token amounts
export const formatTokens = (amount, decimals = 18) => {
  if (!amount) return "0";
  // Convert BigInt to string if needed
  const amountStr = typeof amount === 'bigint' ? amount.toString() : amount.toString();
  return (parseFloat(amountStr) / Math.pow(10, decimals)).toFixed(2);
};

// Utility function to parse ETH to Wei
export const parseETH = (eth) => {
  return (parseFloat(eth) * 1e18).toString();
};

// Utility function to get time remaining
export const getTimeRemaining = (endTime) => {
  const now = Math.floor(Date.now() / 1000);
  // Convert BigInt to number if needed
  const endTimeNum = typeof endTime === 'bigint' ? Number(endTime) : endTime;
  const remaining = endTimeNum - now;
  
  if (remaining <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  
  const days = Math.floor(remaining / 86400);
  const hours = Math.floor((remaining % 86400) / 3600);
  const minutes = Math.floor((remaining % 3600) / 60);
  const seconds = remaining % 60;
  
  return { days, hours, minutes, seconds };
};

// Utility function to format time
export const formatTime = (timeObj) => {
  const { days, hours, minutes, seconds } = timeObj;
  return `${days}d ${hours}h ${minutes}m ${seconds}s`;
}; 