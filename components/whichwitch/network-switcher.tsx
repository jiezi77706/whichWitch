"use client"

import React, { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Wifi, WifiOff, AlertTriangle, CheckCircle2 } from "lucide-react"
import { useAccount, useChainId, useSwitchChain } from "wagmi"
import { sepolia } from "wagmi/chains"

// 获取当前网络名称
function getCurrentNetworkName(chainId: number): string {
  const networks: Record<number, string> = {
    1: "Ethereum Mainnet",
    11155111: "Sepolia Testnet",
    5: "Goerli Testnet",
    137: "Polygon Mainnet",
    80001: "Polygon Mumbai",
    56: "BSC Mainnet",
    97: "BSC Testnet",
  }
  
  return networks[chainId] || `Unknown Network (${chainId})`
}

// 添加Sepolia网络到MetaMask
async function addSepoliaNetwork() {
  if (typeof window === 'undefined' || !window.ethereum) {
    return
  }

  try {
    await window.ethereum.request({
      method: 'wallet_addEthereumChain',
      params: [{
        chainId: '0xaa36a7', // 11155111 in hex
        chainName: 'Sepolia Testnet',
        nativeCurrency: {
          name: 'Sepolia ETH',
          symbol: 'SEP',
          decimals: 18,
        },
        rpcUrls: [
          'https://rpc.sepolia.org',
          'https://eth-sepolia.g.alchemy.com/v2/demo',
        ],
        blockExplorerUrls: ['https://sepolia.etherscan.io'],
      }],
    })
  } catch (error) {
    console.error('Failed to add Sepolia network:', error)
  }
}

export function NetworkSwitcher() {
  const { isConnected } = useAccount()
  const chainId = useChainId()
  const { switchChain, isPending } = useSwitchChain()
  const [showAlert, setShowAlert] = useState(false)

  const isCorrectNetwork = chainId === sepolia.id
  const currentNetworkName = getCurrentNetworkName(chainId)

  useEffect(() => {
    if (isConnected && !isCorrectNetwork) {
      setShowAlert(true)
    } else {
      setShowAlert(false)
    }
  }, [isConnected, isCorrectNetwork])

  const handleSwitchNetwork = async () => {
    try {
      switchChain({ chainId: sepolia.id })
    } catch (error) {
      console.error('Failed to switch network:', error)
      // 如果切换失败，尝试添加网络
      await addSepoliaNetwork()
    }
  }

  if (!isConnected) {
    return null
  }

  return (
    <div className="space-y-3">
      {/* 网络状态显示 */}
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2">
          {isCorrectNetwork ? (
            <CheckCircle2 className="w-4 h-4 text-green-500" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-yellow-500" />
          )}
          <span className="text-sm font-medium">当前网络:</span>
        </div>
        <Badge 
          variant={isCorrectNetwork ? "default" : "destructive"}
          className="flex items-center gap-1"
        >
          {isCorrectNetwork ? (
            <Wifi className="w-3 h-3" />
          ) : (
            <WifiOff className="w-3 h-3" />
          )}
          {currentNetworkName}
        </Badge>
      </div>

      {/* 网络切换提醒 */}
      {showAlert && (
        <div className="p-4 border border-yellow-200 bg-yellow-50 rounded-lg">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
            <div className="space-y-2 flex-1">
              <p className="font-medium text-yellow-800">
                需要切换到Sepolia测试网才能进行NFT铸造
              </p>
              <p className="text-sm text-yellow-700">
                当前连接: <strong>{currentNetworkName}</strong> | 
                需要: <strong>Sepolia Testnet</strong>
              </p>
              <Button 
                onClick={handleSwitchNetwork}
                disabled={isPending}
                size="sm"
                className="mt-2"
              >
                {isPending ? "切换中..." : "切换到Sepolia测试网"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* 成功状态 */}
      {isCorrectNetwork && (
        <div className="p-4 border border-green-200 bg-green-50 rounded-lg">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="h-5 w-5 text-green-600" />
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="font-medium text-green-800">✅ 已连接到Sepolia测试网，可以进行NFT铸造</span>
                <Badge variant="outline" className="text-green-700 border-green-300">
                  Chain ID: {sepolia.id}
                </Badge>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 测试网信息 */}
      {isCorrectNetwork && (
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">🧪 Sepolia测试网信息</h4>
          <div className="space-y-1 text-sm text-blue-800">
            <p>• 网络名称: Sepolia Testnet</p>
            <p>• Chain ID: 11155111</p>
            <p>• 区块浏览器: <a href="https://sepolia.etherscan.io" target="_blank" rel="noopener noreferrer" className="underline">sepolia.etherscan.io</a></p>
            <p>• 获取测试ETH: <a href="https://sepoliafaucet.com" target="_blank" rel="noopener noreferrer" className="underline">sepoliafaucet.com</a></p>
          </div>
        </div>
      )}
    </div>
  )
}