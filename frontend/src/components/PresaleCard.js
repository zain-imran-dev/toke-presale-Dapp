'use client';

import { useState, useEffect } from 'react';
import { useAccount, useContractRead, useContractWrite, useWaitForTransactionReceipt, useConnect } from 'wagmi';
import { CONTRACT_ADDRESSES, CONTRACT_ABIS, formatETH, formatTokens, parseETH, getTimeRemaining, formatTime } from '../contracts/config';

export default function PresaleCard() {
  const { address, isConnected, chainId } = useAccount();
  const { connect, connectors } = useConnect();
  const [ethAmount, setEthAmount] = useState('');
  const [tokenAmount, setTokenAmount] = useState('0');
  const [timeRemaining, setTimeRemaining] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [userContribution, setUserContribution] = useState('0');
  const [hasClaimed, setHasClaimed] = useState(false);

  // Read presale info
  const { data: presaleInfo, refetch: refetchPresaleInfo, isLoading: isLoadingPresaleInfo } = useContractRead({
    address: CONTRACT_ADDRESSES.PRESALE,
    abi: CONTRACT_ABIS.PRESALE,
    functionName: 'getPresaleInfo',
    watch: true,
    cacheTime: 0, // Disable caching
    staleTime: 0, // Always consider data stale
  });

  // Read user contribution
  const { data: contribution } = useContractRead({
    address: CONTRACT_ADDRESSES.PRESALE,
    abi: CONTRACT_ABIS.PRESALE,
    functionName: 'getContribution',
    args: [address],
    enabled: !!address,
    watch: true,
  });

  // Read claim status
  const { data: claimStatus } = useContractRead({
    address: CONTRACT_ADDRESSES.PRESALE,
    abi: CONTRACT_ABIS.PRESALE,
    functionName: 'getClaimStatus',
    args: [address],
    enabled: !!address,
    watch: true,
  });

  // Calculate tokens for ETH
  const { data: calculatedTokens } = useContractRead({
    address: CONTRACT_ADDRESSES.PRESALE,
    abi: CONTRACT_ABIS.PRESALE,
    functionName: 'calculateTokensForEth',
    args: [parseETH(ethAmount)],
    enabled: !!ethAmount && parseFloat(ethAmount) > 0,
  });

  // Buy tokens transaction - conditional initialization
  const { write: buyTokens, data: buyData, isPending: isBuying, error: buyError } = useContractWrite({
    address: CONTRACT_ADDRESSES.PRESALE,
    abi: CONTRACT_ABIS.PRESALE,
    functionName: 'buyTokens',
    enabled: isConnected && chainId === 31337, // Only enable when connected to Hardhat
    onSuccess: () => {
      setEthAmount('');
      setTokenAmount('0');
      refetchPresaleInfo();
    },
    onError: (error) => {
      console.error('Buy tokens error:', error);
    },
  });

  // Debug: Log contract write status
  console.log('Contract Write Debug:', {
    buyTokens: typeof buyTokens,
    buyTokensValue: buyTokens,
    isBuying,
    buyError,
    isConnected,
    chainId,
    address,
    expectedChainId: 31337,
    isCorrectNetwork: chainId === 31337,
    contractAddress: CONTRACT_ADDRESSES.PRESALE,
    expectedAddress: "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512",
    isCorrectAddress: CONTRACT_ADDRESSES.PRESALE === "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512",
    abi: CONTRACT_ABIS.PRESALE,
    abiLength: CONTRACT_ABIS.PRESALE.length,
    hasBuyTokensFunction: CONTRACT_ABIS.PRESALE.some(item => item.name === 'buyTokens'),
    networkInfo: {
      hardhatId: 31337,
      isHardhat: chainId === 31337,
      chainIdType: typeof chainId,
      chainIdValue: chainId
    },
    // Additional debugging
    abiFunctions: CONTRACT_ABIS.PRESALE.map(item => item.name),
    buyTokensFunction: CONTRACT_ABIS.PRESALE.find(item => item.name === 'buyTokens')
  });

  // Manual contract write function as fallback
  const manualBuyTokens = async (ethAmount) => {
    if (typeof window !== 'undefined' && window.ethereum) {
      try {
        const { parseEther, encodeFunctionData } = await import('viem');
        
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (accounts.length === 0) {
          throw new Error('No accounts found');
        }

        const account = accounts[0];
        const value = parseEther(ethAmount);
        
        // Encode the function call data
        const data = encodeFunctionData({
          abi: CONTRACT_ABIS.PRESALE,
          functionName: 'buyTokens',
          args: [[]], // Empty merkle proof
        });
        
        // Convert value to hex with '0x' prefix
        const valueHex = '0x' + value.toString(16);
        
        // Debug: Log transaction parameters
        console.log('Manual transaction parameters:', {
          from: account,
          to: CONTRACT_ADDRESSES.PRESALE,
          value: valueHex,
          valueOriginal: value.toString(),
          data: data,
          ethAmount
        });
        
        // Use MetaMask to send the transaction
        const hash = await window.ethereum.request({
          method: 'eth_sendTransaction',
          params: [{
            from: account,
            to: CONTRACT_ADDRESSES.PRESALE,
            value: valueHex,
            data: data,
          }],
        });
        
        console.log('Manual transaction sent via MetaMask:', hash);
        return hash;
      } catch (error) {
        console.error('Manual buy tokens error:', error);
        console.error('Error details:', {
          message: error.message,
          code: error.code,
          data: error.data,
          stack: error.stack
        });
        throw error;
      }
    }
  };

  // Claim tokens transaction
  const { write: claimTokens, data: claimData, isPending: isClaiming } = useContractWrite({
    address: CONTRACT_ADDRESSES.PRESALE,
    abi: CONTRACT_ABIS.PRESALE,
    functionName: 'claimTokens',
    onSuccess: () => {
      refetchPresaleInfo();
    },
  });

  // Update token amount when ETH amount changes
  useEffect(() => {
    if (calculatedTokens) {
      setTokenAmount(formatTokens(calculatedTokens.toString()));
    }
  }, [calculatedTokens]);

  // Update user contribution
  useEffect(() => {
    if (contribution) {
      setUserContribution(formatETH(contribution.toString()));
    }
  }, [contribution]);

  // Update claim status
  useEffect(() => {
    if (claimStatus !== undefined) {
      setHasClaimed(claimStatus);
    }
  }, [claimStatus]);

  // Update countdown timer
  useEffect(() => {
    if (presaleInfo) {
      const updateTimer = () => {
        setTimeRemaining(getTimeRemaining(presaleInfo[1])); // endTime
      };
      
      updateTimer();
      const interval = setInterval(updateTimer, 1000);
      
      return () => clearInterval(interval);
    }
  }, [presaleInfo]);

  // Monitor network changes and force re-initialization
  useEffect(() => {
    console.log('Network changed:', { isConnected, chainId });
    if (isConnected && chainId === 31337) {
      console.log('Connected to Hardhat network - buyTokens should be available');
    }
  }, [isConnected, chainId]);

  const handleBuyTokens = async () => {
    if (!ethAmount || parseFloat(ethAmount) <= 0) {
      alert('Please enter a valid ETH amount.');
      return;
    }
    
    if (!isConnected) {
      alert('Please connect your wallet first.');
      return;
    }
    
    if (chainId !== 31337) {
      alert('Please switch to Hardhat network (Chain ID: 31337) in MetaMask to buy tokens.');
      return;
    }
    
    console.log('Attempting to buy tokens with:', {
      ethAmount,
      buyTokens: typeof buyTokens,
      chainId,
      isConnected,
      contractAddress: CONTRACT_ADDRESSES.PRESALE
    });
    
    try {
      if (typeof buyTokens === 'function') {
        // Use useContractWrite hook
        buyTokens({
          args: [[]], // Empty merkle proof for no whitelist
          value: BigInt(parseETH(ethAmount)),
        });
      } else {
        // Fallback to manual transaction
        console.log('useContractWrite failed, using manual transaction...');
        const hash = await manualBuyTokens(ethAmount);
        alert(`Transaction sent! Hash: ${hash}`);
        setEthAmount('');
        setTokenAmount('0');
        refetchPresaleInfo();
      }
    } catch (error) {
      console.error('Error calling buyTokens:', error);
      alert('Error calling buyTokens function. Please check console for details.');
    }
  };

  const handleClaimTokens = () => {
    claimTokens();
  };

  if (!presaleInfo) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading presale information...</p>
        </div>
      </div>
    );
  }

  const [
    startTime,
    endTime,
    currentTime,
    price,
    hardCapAmount,
    softCapAmount,
    raised,
    maxPurchase,
    minPurchase,
    isActive,
    isFinalized
  ] = presaleInfo;

  const progress = (parseFloat(raised) / parseFloat(hardCapAmount)) * 100;

  // Debug: Log the presale status
  console.log('Presale Debug:', {
    startTime: Number(startTime),
    endTime: Number(endTime),
    currentTime: Number(currentTime),
    isActive,
    isFinalized,
    now: Math.floor(Date.now() / 1000),
    shouldBeActive: Number(startTime) <= Math.floor(Date.now() / 1000) && Number(endTime) > Math.floor(Date.now() / 1000),
    timeDifference: Math.floor(Date.now() / 1000) - Number(currentTime),
    isLoadingPresaleInfo
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-50 to-indigo-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">🚀 Presale DApp</h1>
          <p className="text-gray-600">Join our amazing token presale!</p>
        </div>

        {/* Wallet Connection */}
        <div className="flex justify-center mb-8">
          {!isConnected ? (
            <div className="bg-white rounded-2xl px-6 py-4 shadow-lg text-center">
              <div className="text-2xl mb-2">🔗</div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Connect Your Wallet</h3>
              <p className="text-gray-600 mb-4 text-sm">
                To participate in the presale, please connect your MetaMask wallet
              </p>
              <div className="space-y-3">
                <div className="text-left">
                  <h4 className="font-medium text-gray-800 mb-2">Steps to connect:</h4>
                  <ol className="text-sm text-gray-600 space-y-1">
                    <li>1. Install MetaMask if you haven't already</li>
                    <li>2. Add Hardhat network to MetaMask:</li>
                    <li className="ml-4">• Network Name: Hardhat</li>
                    <li className="ml-4">• RPC URL: http://127.0.0.1:8545</li>
                    <li className="ml-4">• Chain ID: 31337</li>
                    <li className="ml-4">• Currency: ETH</li>
                    <li>3. Start Hardhat node: <code className="bg-gray-100 px-1 rounded">npx hardhat node</code></li>
                    <li>4. Import a test account from the Hardhat output</li>
                    <li>5. Connect MetaMask to this page</li>
                  </ol>
                </div>
                <div className="mt-4">
                  <button
                    onClick={() => connect({ connector: connectors[0] })}
                    className="bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold py-2 px-4 rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all duration-200"
                  >
                    Connect Wallet
                  </button>
                </div>
              </div>
            </div>
                     ) : (
             <div className="bg-white rounded-2xl px-6 py-3 shadow-lg">
               <div className="flex items-center gap-3">
                 <div className="w-3 h-3 rounded-full bg-green-500"></div>
                 <span className="text-gray-700 font-medium">Wallet Connected</span>
               </div>
               <div className="text-xs text-gray-500 mt-1">
                 {address?.slice(0, 6)}...{address?.slice(-4)}
               </div>
               {chainId !== 31337 && (
                 <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded-lg">
                   <div className="flex items-center gap-2">
                     <div className="w-2 h-2 rounded-full bg-red-500"></div>
                     <span className="text-xs text-red-700 font-medium">Wrong Network</span>
                   </div>
                   <p className="text-xs text-red-600 mt-1">
                     Current: {chainId} | Required: 31337 (Hardhat)
                   </p>
                   <p className="text-xs text-red-600">
                     Please switch to Hardhat network in MetaMask
                   </p>
                   <div className="mt-2 text-xs text-red-600">
                     <strong>Steps to switch:</strong>
                     <ol className="mt-1 ml-2 space-y-1">
                       <li>1. Open MetaMask</li>
                       <li>2. Click the network dropdown</li>
                       <li>3. Select "Hardhat" or add it manually</li>
                       <li>4. RPC URL: http://127.0.0.1:8545</li>
                       <li>5. Chain ID: 31337</li>
                     </ol>
                   </div>
                 </div>
               )}
             </div>
           )}
        </div>

        {/* Main Presale Card */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 mb-8">
          {/* Progress Bar */}
          <div className="mb-6">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Progress</span>
              <span>{progress.toFixed(2)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className="bg-gradient-to-r from-purple-500 to-pink-500 h-3 rounded-full transition-all duration-300"
                style={{ width: `${Math.min(progress, 100)}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-sm text-gray-500 mt-2">
              <span>{formatETH(raised)} ETH raised</span>
              <span>{formatETH(hardCapAmount)} ETH goal</span>
            </div>
          </div>

          {/* Presale Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-4 text-center">
              <div className="text-2xl font-bold text-purple-600 mb-1">⏰</div>
              <div className="text-sm text-gray-600 mb-1">Time Remaining</div>
              <div className="text-lg font-semibold text-gray-800">{formatTime(timeRemaining)}</div>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-4 text-center">
              <div className="text-2xl font-bold text-blue-600 mb-1">💰</div>
              <div className="text-sm text-gray-600 mb-1">Token Price</div>
              <div className="text-lg font-semibold text-gray-800">{formatETH(price)} ETH</div>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-4 text-center">
              <div className="text-2xl font-bold text-green-600 mb-1">🎯</div>
              <div className="text-sm text-gray-600 mb-1">Soft Cap</div>
              <div className="text-lg font-semibold text-gray-800">{formatETH(softCapAmount)} ETH</div>
            </div>

            <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-2xl p-4 text-center">
              <div className="text-2xl font-bold text-orange-600 mb-1">🏆</div>
              <div className="text-sm text-gray-600 mb-1">Hard Cap</div>
              <div className="text-lg font-semibold text-gray-800">{formatETH(hardCapAmount)} ETH</div>
            </div>
          </div>

          {/* Buy Tokens Section */}
          {isConnected && !isFinalized && Number(startTime) <= Math.floor(Date.now() / 1000) && Number(endTime) > Math.floor(Date.now() / 1000) && (
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6 mb-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">🎁 Buy Tokens</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ETH Amount
                  </label>
                  <input
                    type="number"
                    value={ethAmount}
                    onChange={(e) => setEthAmount(e.target.value)}
                    placeholder="0.01"
                    min={formatETH(minPurchase)}
                    max={formatETH(maxPurchase)}
                    step="0.01"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Min: {formatETH(minPurchase)} ETH | Max: {formatETH(maxPurchase)} ETH
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tokens You'll Receive
                  </label>
                  <div className="w-full px-4 py-3 bg-gray-100 border border-gray-300 rounded-xl">
                    <span className="text-lg font-semibold text-gray-800">{tokenAmount} MPT</span>
                  </div>
                </div>
              </div>

              <button
                onClick={handleBuyTokens}
                disabled={isBuying || !ethAmount || parseFloat(ethAmount) <= 0}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold py-3 px-6 rounded-xl hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                {isBuying ? '🔄 Processing...' : '🚀 Buy Tokens'}
              </button>
            </div>
          )}

          {/* Claim Tokens Section */}
          {isConnected && isFinalized && parseFloat(userContribution) > 0 && !hasClaimed && (
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 mb-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">🎉 Claim Your Tokens</h3>
              <p className="text-gray-600 mb-4">
                Your contribution: {userContribution} ETH
              </p>
              <button
                onClick={handleClaimTokens}
                disabled={isClaiming}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold py-3 px-6 rounded-xl hover:from-green-600 hover:to-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                {isClaiming ? '🔄 Claiming...' : '🎁 Claim Tokens'}
              </button>
            </div>
          )}

          {/* Status Messages */}
          {!isConnected && (
            <div className="text-center py-8">
              <div className="text-4xl mb-4">🔗</div>
              <p className="text-gray-600">Please connect your wallet to participate in the presale</p>
            </div>
          )}

          {isConnected && isFinalized && (
            <div className="text-center py-8">
              <div className="text-4xl mb-4">✅</div>
              <p className="text-gray-600">Presale has been finalized!</p>
            </div>
          )}

          {isConnected && !isFinalized && Number(endTime) < Math.floor(Date.now() / 1000) && (
            <div className="text-center py-8">
              <div className="text-4xl mb-4">⏰</div>
              <p className="text-gray-600">Presale has ended. You can no longer buy tokens.</p>
            </div>
          )}

          {isConnected && !isFinalized && Number(startTime) <= Math.floor(Date.now() / 1000) && Number(endTime) > Math.floor(Date.now() / 1000) && (
            <div className="text-center py-8">
              <div className="text-4xl mb-4">🚀</div>
              <p className="text-gray-600">Presale is active! You can now buy tokens.</p>
            </div>
          )}

          {isConnected && !isFinalized && Number(startTime) > Math.floor(Date.now() / 1000) && (
            <div className="text-center py-8">
              <div className="text-4xl mb-4">⏳</div>
              <p className="text-gray-600">
                Presale is not active yet. Please wait for the start time.
                <span className="block text-sm text-gray-500 mt-2">
                  Starts in {Math.max(0, Number(startTime) - Math.floor(Date.now() / 1000))} seconds
                </span>
              </p>
            </div>
          )}

          {/* User Info */}
          {isConnected && parseFloat(userContribution) > 0 && (
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">👤 Your Contribution</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Your ETH Contribution</p>
                  <p className="text-lg font-semibold text-gray-800">{userContribution} ETH</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Claim Status</p>
                  <p className="text-lg font-semibold text-gray-800">
                    {hasClaimed ? '✅ Claimed' : '⏳ Not Claimed'}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-center text-gray-500">
          <p>Made with ❤️ for the blockchain community</p>
        </div>
      </div>
    </div>
  );
} 