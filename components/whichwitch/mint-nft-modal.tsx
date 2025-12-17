"use client"

import React, { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Loader2, Sparkles, CheckCircle2, X } from "lucide-react"
import { useAccount, useChainId } from "wagmi"
import { sepolia } from "wagmi/chains"
import { mintNFTForExistingWork } from "@/lib/services/work-nft-integration.service"
import { NetworkSwitcher } from "./network-switcher"

interface MintNFTModalProps {
  isOpen: boolean
  onClose: () => void
  work: {
    work_id: number
    title: string
    description?: string
    image_url: string
    creator_address: string
    material?: string[]
    tags?: string[]
  }
  onSuccess?: (nftData: {
    tokenId: string
    tokenURI: string
    mintTxHash: string
  }) => void
}

export function MintNFTModal({ isOpen, onClose, work, onSuccess }: MintNFTModalProps) {
  const { address } = useAccount()
  const chainId = useChainId()
  const [status, setStatus] = useState<"idle" | "minting" | "success" | "error">("idle")
  const [errorMessage, setErrorMessage] = useState("")
  const [nftData, setNftData] = useState({
    name: work.title,
    description: work.description || "",
  })
  const [mintResult, setMintResult] = useState<{
    tokenId: string
    tokenURI: string
    mintTxHash: string
  } | null>(null)

  const isCorrectNetwork = chainId === sepolia.id
  const canMint = address && work.creator_address.toLowerCase() === address.toLowerCase() && isCorrectNetwork

  const handleMint = async () => {
    if (!address || !canMint) return

    setStatus("minting")
    setErrorMessage("")

    try {
      console.log('🎨 开始为现有作品铸造NFT:', work.work_id)

      const result = await mintNFTForExistingWork(
        work.work_id,
        address,
        {
          name: nftData.name || work.title,
          description: nftData.description || work.description,
          attributes: [
            { trait_type: 'Mint Method', value: 'Retroactive Mint' },
            { trait_type: 'Original Creator', value: 'Yes' },
          ]
        }
      )

      console.log('✅ NFT铸造成功:', result)
      setMintResult(result)
      setStatus("success")

      if (onSuccess) {
        onSuccess(result)
      }

    } catch (error) {
      console.error('❌ NFT铸造失败:', error)
      setErrorMessage(error instanceof Error ? error.message : "NFT铸造失败，请重试")
      setStatus("error")
    }
  }

  const handleClose = () => {
    setStatus("idle")
    setErrorMessage("")
    setMintResult(null)
    setNftData({
      name: work.title,
      description: work.description || "",
    })
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            铸造NFT
          </DialogTitle>
        </DialogHeader>

        {status === "success" && mintResult ? (
          <div className="space-y-4 text-center">
            <div className="w-16 h-16 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">NFT铸造成功！</h3>
              <p className="text-sm text-muted-foreground">
                你的作品已成功铸造为NFT
              </p>
            </div>

            <div className="p-3 bg-primary/10 border border-primary/20 rounded-lg text-left">
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Token ID:</span>
                  <span className="font-mono">{mintResult.tokenId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">交易哈希:</span>
                  <span className="font-mono text-[10px] truncate max-w-[120px]">
                    {mintResult.mintTxHash}
                  </span>
                </div>
              </div>
            </div>

            <Button onClick={handleClose} className="w-full">
              完成
            </Button>
          </div>
        ) : status === "error" ? (
          <div className="space-y-4 text-center">
            <div className="w-16 h-16 bg-red-500/20 text-red-500 rounded-full flex items-center justify-center mx-auto">
              <X className="w-8 h-8" />
            </div>
            
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">铸造失败</h3>
              <p className="text-sm text-muted-foreground">
                {errorMessage}
              </p>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" onClick={handleClose} className="flex-1">
                取消
              </Button>
              <Button onClick={() => setStatus("idle")} className="flex-1">
                重试
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* 网络状态检查 */}
            <NetworkSwitcher />
            
            {/* 作品预览 */}
            <div className="flex gap-3 p-3 bg-muted/50 rounded-lg">
              <div className="w-16 h-16 rounded-md overflow-hidden bg-muted flex-shrink-0">
                <img 
                  src={work.image_url} 
                  alt={work.title}
                  className="w-full h-full object-cover" 
                />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-sm truncate">{work.title}</h4>
                <p className="text-xs text-muted-foreground truncate">
                  {work.description}
                </p>
                <div className="flex gap-1 mt-1">
                  {work.material?.slice(0, 2).map((mat) => (
                    <Badge key={mat} variant="secondary" className="text-[10px] px-1 py-0">
                      {mat}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            {/* 权限检查 */}
            {!isCorrectNetwork && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                <p className="text-sm text-red-700 dark:text-red-300">
                  ⚠️ 请先切换到Sepolia测试网
                </p>
              </div>
            )}
            
            {isCorrectNetwork && address && work.creator_address.toLowerCase() !== address.toLowerCase() && (
              <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                <p className="text-sm text-yellow-700 dark:text-yellow-300">
                  ⚠️ 只有作品的原创作者可以铸造NFT
                </p>
              </div>
            )}

            {canMint && (
              <>
                {/* NFT元数据 */}
                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label className="text-sm">NFT名称</Label>
                    <Input
                      value={nftData.name}
                      onChange={(e) => setNftData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder={work.title}
                      disabled={status === "minting"}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm">NFT描述</Label>
                    <Textarea
                      value={nftData.description}
                      onChange={(e) => setNftData(prev => ({ ...prev, description: e.target.value }))}
                      placeholder={work.description || "描述你的NFT..."}
                      className="min-h-[80px]"
                      disabled={status === "minting"}
                    />
                  </div>
                </div>

                {/* 自动生成的属性预览 */}
                <div className="p-3 bg-muted/30 rounded-lg">
                  <p className="text-xs font-medium mb-2">✨ 自动生成的NFT属性:</p>
                  <div className="grid grid-cols-2 gap-1 text-[10px]">
                    {work.material?.map((mat) => (
                      <div key={mat} className="flex justify-between">
                        <span className="text-muted-foreground">Material:</span>
                        <span>{mat}</span>
                      </div>
                    ))}
                    {work.tags?.slice(0, 2).map((tag) => (
                      <div key={tag} className="flex justify-between">
                        <span className="text-muted-foreground">Tag:</span>
                        <span>{tag}</span>
                      </div>
                    ))}
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Creator:</span>
                      <span className="font-mono">{address?.slice(0, 6)}...{address?.slice(-4)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Work ID:</span>
                      <span>{work.work_id}</span>
                    </div>
                  </div>
                </div>

                {/* 操作按钮 */}
                <div className="flex gap-2 pt-2">
                  <Button 
                    variant="outline" 
                    onClick={handleClose} 
                    className="flex-1"
                    disabled={status === "minting"}
                  >
                    取消
                  </Button>
                  <Button 
                    onClick={handleMint} 
                    className="flex-1"
                    disabled={status === "minting" || !nftData.name.trim()}
                  >
                    {status === "minting" ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        铸造中...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 mr-2" />
                        铸造NFT
                      </>
                    )}
                  </Button>
                </div>
              </>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}