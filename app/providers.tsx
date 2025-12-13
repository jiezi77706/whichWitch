'use client'

import { WagmiProvider, createConfig, http } from 'wagmi'
import { sepolia, hardhat } from 'wagmi/chains'
import { RainbowKitProvider, getDefaultConfig } from '@rainbow-me/rainbowkit'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from '../contexts/AuthContext'
import { AIProvider } from '../contexts/AIContext'
import { Web3Provider } from '../src/contexts/Web3Context'
import '@rainbow-me/rainbowkit/styles.css'

// ZetaChain 测试网配置
const zetaTestnet = {
  id: 7001,
  name: 'ZetaChain Athens Testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'ZETA',
    symbol: 'ZETA',
  },
  rpcUrls: {
    default: { http: ['https://zetachain-athens-evm.blockpi.network/v1/rpc/public'] },
  },
  blockExplorers: {
    default: { name: 'ZetaChain Explorer', url: 'https://zetachain-athens-3.blockscout.com' },
  },
  testnet: true,
} as const

// 创建 wagmi 配置
const wagmiConfig = getDefaultConfig({
  appName: 'whichWitch',
  projectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || 'default-project-id',
  chains: [zetaTestnet, sepolia, hardhat],
  transports: {
    [zetaTestnet.id]: http('https://zetachain-athens-evm.blockpi.network/v1/rpc/public'),
    [sepolia.id]: http(`https://sepolia.infura.io/v3/${process.env.NEXT_PUBLIC_INFURA_KEY || ''}`),
    [hardhat.id]: http('http://127.0.0.1:8545'),
  },
})

// 创建 React Query 客户端
const queryClient = new QueryClient()

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <WagmiProvider config={wagmiConfig}>
        <RainbowKitProvider>
          <Web3Provider>
            <AuthProvider>
              <AIProvider>
                {children}
              </AIProvider>
            </AuthProvider>
          </Web3Provider>
        </RainbowKitProvider>
      </WagmiProvider>
    </QueryClientProvider>
  )
}