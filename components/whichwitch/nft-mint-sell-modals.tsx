"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Coins, Upload, ShoppingCart, AlertCircle, CheckCircle2 } from "lucide-react"

// ============================================
// NFT铸造模态框
// ============================================
export function MintNFTModal({
  open,
  onOpenChange,
  work,
  onMint,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  work: any
  onMint: (nftData: {
    name: string
    description: string
    attributes: Array<{ trait_type: string; value: string }>
  }) => Promise<void>
}) {
  const [nftData, setNftData] = useState({
    name: work?.title || "",
    description: work?.story || work?.description || "",
  })
  const [status, setStatus] = useState<"idle" | "minting" | "success" | "error">("idle")
  const [errorMessage, setErrorMessage] = useState("")

  const handleMint = async () => {
    setStatus("minting")
    setErrorMessage("")

    try {
      // 构建NFT属性
      const attributes = [
        { trait_type: "Creator", value: work.creator_address || work.author },
        { trait_type: "Work ID", value: work.id?.toString() || work.work_id?.toString() },
        { trait_type: "Material", value: Array.isArray(work.material) ? work.material.join(", ") : work.material || "Digital" },
        { trait_type: "Allow Remix", value: work.allow_remix ? "Yes" : "No" },
        { trait_type: "Is Remix", value: work.is_remix ? "Yes" : "No" },
        { trait_type: "Upload Method", value: "WhichWitch Platform" },
        ...((work.tags || []).slice(0, 3).map((tag: string) => ({ trait_type: "Tag", value: tag }))),
      ]

      await onMint({
        name: nftData.name,
        description: nftData.description,
        attributes,
      })

      setStatus("success")
      setTimeout(() => {
        onOpenChange(false)
        setStatus("idle")
      }, 2000)
    } catch (error) {
      console.error("NFT minting failed:", error)
      setErrorMessage(error instanceof Error ? error.message : "Failed to mint NFT")
      setStatus("error")
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5 text-blue-500" />
            Mint as NFT
          </DialogTitle>
          <DialogDescription>
            Convert your work into a tradeable NFT on the blockchain
          </DialogDescription>
        </DialogHeader>

        {status === "success" ? (
          <div className="py-8 text-center">
            <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-green-600 mb-2">NFT Minted Successfully!</h3>
            <p className="text-sm text-muted-foreground">
              Your work is now a tradeable NFT on the blockchain
            </p>
          </div>
        ) : status === "error" ? (
          <div className="py-8 text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-red-600 mb-2">Minting Failed</h3>
            <p className="text-sm text-muted-foreground">{errorMessage}</p>
            <Button 
              onClick={() => setStatus("idle")} 
              variant="outline" 
              className="mt-4"
            >
              Try Again
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* 作品预览 */}
            <div className="flex gap-4 p-4 bg-muted/30 rounded-lg border">
              <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                <img 
                  src={work?.image_url || work?.image || "/placeholder.svg"} 
                  alt={work?.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold">{work?.title}</h4>
                <p className="text-sm text-muted-foreground">
                  by {work?.creator_address?.slice(0, 6)}...{work?.creator_address?.slice(-4)}
                </p>
                <div className="flex gap-1 mt-1">
                  {(work?.tags || []).slice(0, 2).map((tag: string) => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            {/* NFT元数据 */}
            <div className="space-y-3">
              <div>
                <Label htmlFor="nft-name">NFT Name</Label>
                <Input
                  id="nft-name"
                  value={nftData.name}
                  onChange={(e) => setNftData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter NFT name"
                />
              </div>

              <div>
                <Label htmlFor="nft-description">NFT Description</Label>
                <Textarea
                  id="nft-description"
                  value={nftData.description}
                  onChange={(e) => setNftData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe your NFT"
                  className="min-h-[80px]"
                />
              </div>
            </div>

            {/* 费用说明 */}
            <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
              <p className="text-sm font-medium text-blue-600 mb-1">⛽ Gas Fee Required</p>
              <p className="text-xs text-muted-foreground">
                Minting requires blockchain gas fees (~0.005-0.02 ETH depending on network congestion)
              </p>
            </div>
          </div>
        )}

        {status === "idle" && (
          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleMint}
              disabled={!nftData.name.trim()}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Upload className="w-4 h-4 mr-2" />
              Mint NFT
            </Button>
          </DialogFooter>
        )}

        {status === "minting" && (
          <div className="py-4 text-center">
            <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-sm text-muted-foreground">
              Minting NFT... Please confirm the transaction in your wallet
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

// ============================================
// NFT出售模态框
// ============================================
export function SellNFTModal({
  open,
  onOpenChange,
  work,
  onList,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  work: any
  onList: (listingData: {
    price: string
    currency: string
    listingType: string
    duration?: number
  }) => Promise<void>
}) {
  const [listingData, setListingData] = useState({
    price: "",
    currency: "ETH",
    listingType: "fixed_price", // fixed_price, auction
    duration: 7, // days
  })
  const [status, setStatus] = useState<"idle" | "listing" | "success" | "error">("idle")
  const [errorMessage, setErrorMessage] = useState("")

  const handleList = async () => {
    if (!listingData.price || parseFloat(listingData.price) <= 0) {
      setErrorMessage("Please enter a valid price")
      return
    }

    setStatus("listing")
    setErrorMessage("")

    try {
      await onList(listingData)
      setStatus("success")
      setTimeout(() => {
        onOpenChange(false)
        setStatus("idle")
        setListingData({ price: "", currency: "ETH", listingType: "fixed_price", duration: 7 })
      }, 2000)
    } catch (error) {
      console.error("NFT listing failed:", error)
      setErrorMessage(error instanceof Error ? error.message : "Failed to list NFT")
      setStatus("error")
    }
  }

  const calculateFees = () => {
    const price = parseFloat(listingData.price) || 0
    const platformFee = price * 0.025 // 2.5%
    const royaltyFee = price * 0.05 // 5%
    const sellerReceives = price - platformFee - royaltyFee
    
    return {
      price,
      platformFee,
      royaltyFee,
      sellerReceives
    }
  }

  const fees = calculateFees()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-green-500" />
            List NFT for Sale
          </DialogTitle>
          <DialogDescription>
            Set your price and list your NFT on the marketplace
          </DialogDescription>
        </DialogHeader>

        {status === "success" ? (
          <div className="py-8 text-center">
            <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-green-600 mb-2">Listed Successfully!</h3>
            <p className="text-sm text-muted-foreground">
              Your NFT is now available on the marketplace
            </p>
          </div>
        ) : status === "error" ? (
          <div className="py-8 text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-red-600 mb-2">Listing Failed</h3>
            <p className="text-sm text-muted-foreground">{errorMessage}</p>
            <Button 
              onClick={() => setStatus("idle")} 
              variant="outline" 
              className="mt-4"
            >
              Try Again
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* NFT预览 */}
            <div className="flex gap-4 p-4 bg-muted/30 rounded-lg border">
              <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                <img 
                  src={work?.image_url || work?.image || "/placeholder.svg"} 
                  alt={work?.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold">{work?.title}</h4>
                <p className="text-sm text-muted-foreground">
                  Token ID: #{work?.token_id || "TBD"}
                </p>
                <Badge className="mt-1">NFT</Badge>
              </div>
            </div>

            {/* 定价设置 */}
            <div className="space-y-3">
              <div>
                <Label htmlFor="price">Price</Label>
                <div className="flex gap-2">
                  <Input
                    id="price"
                    type="number"
                    step="0.001"
                    value={listingData.price}
                    onChange={(e) => setListingData(prev => ({ ...prev, price: e.target.value }))}
                    placeholder="0.00"
                    className="flex-1"
                  />
                  <div className="flex items-center px-3 border rounded-md bg-muted text-sm">
                    ETH
                  </div>
                </div>
              </div>

              {/* 销售类型 */}
              <div>
                <Label>Sale Type</Label>
                <div className="grid grid-cols-2 gap-2 mt-1">
                  <Button
                    type="button"
                    variant={listingData.listingType === "fixed_price" ? "default" : "outline"}
                    onClick={() => setListingData(prev => ({ ...prev, listingType: "fixed_price" }))}
                    className="h-12"
                  >
                    <div className="text-center">
                      <div className="font-medium">Fixed Price</div>
                      <div className="text-xs opacity-70">Sell immediately</div>
                    </div>
                  </Button>
                  <Button
                    type="button"
                    variant={listingData.listingType === "auction" ? "default" : "outline"}
                    onClick={() => setListingData(prev => ({ ...prev, listingType: "auction" }))}
                    className="h-12"
                    disabled
                  >
                    <div className="text-center">
                      <div className="font-medium">Auction</div>
                      <div className="text-xs opacity-70">Coming Soon</div>
                    </div>
                  </Button>
                </div>
              </div>

              {/* 持续时间 */}
              <div>
                <Label htmlFor="duration">Listing Duration</Label>
                <select
                  id="duration"
                  value={listingData.duration}
                  onChange={(e) => setListingData(prev => ({ ...prev, duration: parseInt(e.target.value) }))}
                  className="w-full h-10 px-3 border rounded-md bg-background"
                >
                  <option value={1}>1 day</option>
                  <option value={3}>3 days</option>
                  <option value={7}>7 days</option>
                  <option value={14}>14 days</option>
                  <option value={30}>30 days</option>
                </select>
              </div>
            </div>

            {/* 费用明细 */}
            {listingData.price && parseFloat(listingData.price) > 0 && (
              <div className="p-4 bg-muted/30 rounded-lg border">
                <h4 className="font-medium mb-3">Fee Breakdown</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Listing Price</span>
                    <span>{fees.price.toFixed(4)} ETH</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Platform Fee (2.5%)</span>
                    <span>-{fees.platformFee.toFixed(4)} ETH</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Creator Royalty (5%)</span>
                    <span>-{fees.royaltyFee.toFixed(4)} ETH</span>
                  </div>
                  <div className="border-t pt-2 flex justify-between font-medium">
                    <span>You Receive</span>
                    <span className="text-green-600">{fees.sellerReceives.toFixed(4)} ETH</span>
                  </div>
                </div>
              </div>
            )}

            {/* 注意事项 */}
            <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
              <p className="text-sm font-medium text-yellow-600 mb-1">📝 Important Notes</p>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• Listing requires a small gas fee</li>
                <li>• You can cancel anytime before sale</li>
                <li>• Funds are held in escrow until sale</li>
              </ul>
            </div>
          </div>
        )}

        {status === "idle" && (
          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleList}
              disabled={!listingData.price || parseFloat(listingData.price) <= 0}
              className="bg-green-600 hover:bg-green-700"
            >
              <ShoppingCart className="w-4 h-4 mr-2" />
              List for Sale
            </Button>
          </DialogFooter>
        )}

        {status === "listing" && (
          <div className="py-4 text-center">
            <div className="animate-spin w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-sm text-muted-foreground">
              Creating listing... Please confirm the transaction in your wallet
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}