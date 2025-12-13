// Wagmi v2 类型兼容性修复
declare module 'wagmi' {
  interface Register {
    config: typeof import('../config/wagmi').config
  }
}

// 扩展 Window 类型以支持 ethereum
declare global {
  interface Window {
    ethereum?: {
      isMetaMask?: boolean
      request: (args: { method: string; params?: any[] }) => Promise<any>
      on: (event: string, callback: (...args: any[]) => void) => void
      removeListener: (event: string, callback: (...args: any[]) => void) => void
      removeAllListeners: (event?: string) => void
    }
  }
}

export {}