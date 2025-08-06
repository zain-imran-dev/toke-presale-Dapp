'use client';

import { WagmiProvider, createConfig, http } from 'wagmi';
import { hardhat } from 'wagmi/chains';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const config = createConfig({
  chains: [hardhat],
  transports: {
    [hardhat.id]: http('http://127.0.0.1:8545', {
      retryCount: 5,
      retryDelay: 1000,
      timeout: 10000,
    }),
  },
  ssr: false,
  pollingInterval: 1000,
});

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 5,
      retryDelay: 1000,
      staleTime: 1000,
      gcTime: 1000,
    },
  },
});

export function Providers({ children }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  );
} 