'use client';

import { WagmiProvider, createConfig, http } from 'wagmi';
import { mainnet, sepolia, hardhat } from 'wagmi/chains';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RainbowKitProvider, getDefaultConfig } from '@rainbow-me/rainbowkit';
import '@rainbow-me/rainbowkit/styles.css';

const config = createConfig(
  getDefaultConfig({
    chains: [mainnet, sepolia, hardhat],
    transports: {
      [mainnet.id]: http(),
      [sepolia.id]: http(),
      [hardhat.id]: http('http://127.0.0.1:8545'),
    },
    // WalletConnect Cloud projectId - you can get a free one at https://cloud.walletconnect.com/
    projectId: 'YOUR_WALLETCONNECT_PROJECT_ID', // Replace with your actual projectId
  })
);

const queryClient = new QueryClient();

export function Providers({ children }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
} 