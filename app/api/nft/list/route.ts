import { NextRequest, NextResponse } from 'next/server'
import { createNFTListing } from '@/lib/supabase/services/marketplace.service'

/**
 * NFT上架销售API端点
 * POST /api/nft/list
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { workId, tokenId, sellerAddress, listingData } = body

    // 验证必需参数
    if (!workId || !tokenId || !sellerAddress || !listingData) {
      return NextResponse.json(
        { error: 'Missing required parameters: workId, tokenId, sellerAddress, listingData' },
        { status: 400 }
      )
    }

    const { price, currency, listingType, duration } = listingData

    if (!price || parseFloat(price) <= 0) {
      return NextResponse.json(
        { error: 'Invalid price' },
        { status: 400 }
      )
    }

    console.log('🛒 NFT List Request:', {
      workId,
      tokenId,
      sellerAddress,
      listingData
    })

    // TODO: 实现实际的NFT上架逻辑
    // 1. 验证NFT所有权
    // 2. 检查NFT状态（未上架）
    // 3. 创建marketplace listing
    // 4. 调用智能合约设置授权
    // 5. 更新数据库状态

    // 暂时返回模拟响应
    const mockResponse = {
      success: true,
      message: 'NFT listed successfully',
      data: {
        listingId: Math.floor(Math.random() * 10000),
        workId,
        tokenId,
        price,
        currency: currency || 'ETH',
        listingType: listingType || 'fixed_price',
        duration,
        status: 'active',
        listedAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + (duration || 7) * 24 * 60 * 60 * 1000).toISOString()
      }
    }

    // 模拟创建listing
    try {
      // 这里暂时注释掉实际的数据库操作，等合约部署完成后启用
      // const listingId = await createNFTListing({
      //   workId,
      //   tokenId,
      //   sellerAddress,
      //   price,
      //   currency: currency || 'ETH',
      //   listingType: listingType || 'fixed_price'
      // })
      
      console.log('✅ NFT listing created (mock)')
    } catch (error) {
      console.error('❌ Database error (expected in mock mode):', error)
    }

    return NextResponse.json(mockResponse)

  } catch (error) {
    console.error('Error in NFT list API:', error)
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}