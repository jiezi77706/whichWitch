import { supabase } from '../client';

// ============================================
// NFT Marketplace Service
// 处理所有marketplace相关的数据库操作
// ============================================

export interface MarketplaceNFT {
  listing_id: number;
  work_id: number;
  token_id: number;
  seller_address: string;
  price: string;
  currency: string;
  listing_type: string;
  listed_at: string;
  
  // 作品信息
  title: string;
  creator_address: string;
  image_url: string;
  tags: string[];
  material: string[];
  description?: string;
  story?: string;
  allow_remix: boolean;
  is_remix: boolean;
  
  // 统计信息
  like_count: number;
  remix_count: number;
  view_count: number;
  nft_sales_count: number;
  nft_total_volume: string;
  nft_last_sale_price?: string;
  
  // 市场信息
  listing_status: string;
  auction_end_time?: string;
  highest_bid?: string;
  highest_bidder?: string;
  active_offers_count: number;
  highest_offer?: number;
}

export interface NFTListing {
  id: number;
  work_id: number;
  token_id: number;
  seller_address: string;
  price: string;
  currency: string;
  listing_type: string;
  is_active: boolean;
  is_sold: boolean;
  created_at: string;
  updated_at: string;
}

export interface NFTOffer {
  id: number;
  work_id: number;
  token_id: number;
  bidder_address: string;
  offer_price: string;
  currency: string;
  status: string;
  expiry_time?: string;
  created_at: string;
}

export interface MintingRequest {
  id: number;
  work_id: number;
  creator_address: string;
  ipfs_hash: string;
  metadata_ipfs_hash?: string;
  minting_status: string;
  mint_tx_hash?: string;
  token_id?: number;
  requested_at: string;
  minted_at?: string;
}

// ============================================
// Marketplace Listings
// ============================================

/**
 * 获取所有活跃的marketplace listings
 */
export async function getActiveMarketplaceListings(filters?: {
  priceMin?: string;
  priceMax?: string;
  tags?: string[];
  listingType?: string;
  limit?: number;
  offset?: number;
}): Promise<MarketplaceNFT[]> {
  try {
    let query = supabase
      .from('marketplace_active_listings')
      .select('*');

    // 应用过滤器
    if (filters?.priceMin) {
      query = query.gte('price::decimal', parseFloat(filters.priceMin));
    }
    if (filters?.priceMax) {
      query = query.lte('price::decimal', parseFloat(filters.priceMax));
    }
    if (filters?.tags && filters.tags.length > 0) {
      query = query.overlaps('tags', filters.tags);
    }
    if (filters?.listingType) {
      query = query.eq('listing_type', filters.listingType);
    }

    // 分页
    if (filters?.limit) {
      query = query.limit(filters.limit);
    }
    if (filters?.offset) {
      query = query.range(filters.offset, (filters.offset + (filters.limit || 20)) - 1);
    }

    const { data, error } = await query.order('listed_at', { ascending: false });

    if (error) {
      console.error('Error fetching marketplace listings:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error in getActiveMarketplaceListings:', error);
    throw error;
  }
}

/**
 * 根据work_id获取marketplace listing
 */
export async function getMarketplaceListingByWorkId(workId: number): Promise<MarketplaceNFT | null> {
  try {
    const { data, error } = await supabase
      .from('marketplace_active_listings')
      .select('*')
      .eq('work_id', workId)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('Error fetching marketplace listing:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error in getMarketplaceListingByWorkId:', error);
    throw error;
  }
}

/**
 * 创建NFT listing
 */
export async function createNFTListing(params: {
  workId: number;
  tokenId: number;
  sellerAddress: string;
  price: string;
  currency?: string;
  listingType?: string;
}): Promise<number> {
  try {
    const { data, error } = await supabase.rpc('create_nft_listing', {
      p_work_id: params.workId,
      p_token_id: params.tokenId,
      p_seller_address: params.sellerAddress,
      p_price: params.price,
      p_currency: params.currency || 'ETH',
      p_listing_type: params.listingType || 'fixed_price'
    });

    if (error) {
      console.error('Error creating NFT listing:', error);
      throw error;
    }

    console.log('✅ NFT listing created successfully:', data);
    return data;
  } catch (error) {
    console.error('Error in createNFTListing:', error);
    throw error;
  }
}

/**
 * 取消NFT listing
 */
export async function cancelNFTListing(listingId: number, sellerAddress: string): Promise<void> {
  try {
    // 更新listing状态
    const { error: listingError } = await supabase
      .from('nft_marketplace_listings')
      .update({ 
        is_active: false,
        updated_at: new Date().toISOString()
      })
      .eq('id', listingId)
      .eq('seller_address', sellerAddress)
      .eq('is_active', true);

    if (listingError) {
      console.error('Error canceling listing:', listingError);
      throw listingError;
    }

    // 更新NFT缓存状态
    const { data: listing } = await supabase
      .from('nft_marketplace_listings')
      .select('work_id')
      .eq('id', listingId)
      .single();

    if (listing) {
      const { error: cacheError } = await supabase
        .from('nft_cache')
        .update({ 
          is_listed: false,
          list_price: null,
          updated_at: new Date().toISOString()
        })
        .eq('work_id', listing.work_id);

      if (cacheError) {
        console.error('Error updating NFT cache:', cacheError);
      }
    }

    console.log('✅ NFT listing canceled successfully');
  } catch (error) {
    console.error('Error in cancelNFTListing:', error);
    throw error;
  }
}

// ============================================
// NFT Purchase
// ============================================

/**
 * 完成NFT购买
 */
export async function completeNFTPurchase(params: {
  listingId: number;
  buyerAddress: string;
  salePrice: string;
  txHash: string;
}): Promise<void> {
  try {
    const { error } = await supabase.rpc('complete_nft_sale', {
      p_listing_id: params.listingId,
      p_buyer_address: params.buyerAddress,
      p_sale_price: params.salePrice,
      p_tx_hash: params.txHash
    });

    if (error) {
      console.error('Error completing NFT purchase:', error);
      throw error;
    }

    console.log('✅ NFT purchase completed successfully');
  } catch (error) {
    console.error('Error in completeNFTPurchase:', error);
    throw error;
  }
}

// ============================================
// NFT Minting
// ============================================

/**
 * 请求NFT铸造
 */
export async function requestNFTMinting(params: {
  workId: number;
  creatorAddress: string;
  ipfsHash: string;
  metadataIpfsHash?: string;
}): Promise<number> {
  try {
    const { data, error } = await supabase.rpc('request_nft_minting', {
      p_work_id: params.workId,
      p_creator_address: params.creatorAddress,
      p_ipfs_hash: params.ipfsHash,
      p_metadata_ipfs_hash: params.metadataIpfsHash
    });

    if (error) {
      console.error('Error requesting NFT minting:', error);
      throw error;
    }

    console.log('✅ NFT minting requested successfully:', data);
    return data;
  } catch (error) {
    console.error('Error in requestNFTMinting:', error);
    throw error;
  }
}

/**
 * 更新NFT铸造状态
 */
export async function updateNFTMintingStatus(params: {
  queueId: number;
  status: string;
  tokenId?: number;
  txHash?: string;
  contractAddress?: string;
  errorMessage?: string;
}): Promise<void> {
  try {
    const updateData: any = {
      minting_status: params.status,
      updated_at: new Date().toISOString()
    };

    if (params.tokenId) updateData.token_id = params.tokenId;
    if (params.txHash) updateData.mint_tx_hash = params.txHash;
    if (params.contractAddress) updateData.contract_address = params.contractAddress;
    if (params.errorMessage) updateData.error_message = params.errorMessage;
    if (params.status === 'completed') updateData.minted_at = new Date().toISOString();

    const { error } = await supabase
      .from('nft_minting_queue')
      .update(updateData)
      .eq('id', params.queueId);

    if (error) {
      console.error('Error updating minting status:', error);
      throw error;
    }

    // 如果铸造完成，更新NFT缓存
    if (params.status === 'completed' && params.tokenId) {
      const { data: queueItem } = await supabase
        .from('nft_minting_queue')
        .select('work_id, creator_address')
        .eq('id', params.queueId)
        .single();

      if (queueItem) {
        await supabase.rpc('sync_nft_status', {
          p_work_id: queueItem.work_id,
          p_token_id: params.tokenId,
          p_is_minted: true,
          p_owner_address: queueItem.creator_address,
          p_is_listed: false
        });
      }
    }

    console.log('✅ NFT minting status updated successfully');
  } catch (error) {
    console.error('Error in updateNFTMintingStatus:', error);
    throw error;
  }
}

/**
 * 获取用户的铸造队列
 */
export async function getUserMintingQueue(creatorAddress: string): Promise<MintingRequest[]> {
  try {
    const { data, error } = await supabase
      .from('nft_minting_queue')
      .select('*')
      .eq('creator_address', creatorAddress)
      .order('requested_at', { ascending: false });

    if (error) {
      console.error('Error fetching minting queue:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error in getUserMintingQueue:', error);
    throw error;
  }
}

// ============================================
// User Portfolio
// ============================================

/**
 * 获取用户的NFT组合
 */
export async function getUserNFTPortfolio(userAddress: string): Promise<any[]> {
  try {
    const { data, error } = await supabase
      .from('user_nft_portfolio_extended')
      .select('*')
      .eq('user_address', userAddress)
      .order('listed_at', { ascending: false, nullsLast: true });

    if (error) {
      console.error('Error fetching user NFT portfolio:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error in getUserNFTPortfolio:', error);
    throw error;
  }
}

// ============================================
// Marketplace Statistics
// ============================================

/**
 * 获取marketplace统计信息
 */
export async function getMarketplaceStats(): Promise<{
  totalListings: number;
  totalVolume: string;
  floorPrice: string;
  averagePrice: string;
}> {
  try {
    // 获取活跃listings数量
    const { count: totalListings } = await supabase
      .from('marketplace_active_listings')
      .select('*', { count: 'exact', head: true });

    // 获取价格统计
    const { data: priceStats } = await supabase
      .from('marketplace_active_listings')
      .select('price')
      .order('price::decimal', { ascending: true });

    let floorPrice = '0';
    let averagePrice = '0';
    let totalVolume = '0';

    if (priceStats && priceStats.length > 0) {
      // 地板价（最低价格）
      floorPrice = priceStats[0].price;

      // 计算平均价格和总价值
      const prices = priceStats.map(item => parseFloat(item.price));
      const sum = prices.reduce((acc, price) => acc + price, 0);
      averagePrice = (sum / prices.length).toFixed(4);
      totalVolume = sum.toFixed(2);
    }

    return {
      totalListings: totalListings || 0,
      totalVolume,
      floorPrice,
      averagePrice
    };
  } catch (error) {
    console.error('Error in getMarketplaceStats:', error);
    return {
      totalListings: 0,
      totalVolume: '0',
      floorPrice: '0',
      averagePrice: '0'
    };
  }
}

// ============================================
// Search and Filter
// ============================================

/**
 * 搜索marketplace NFTs
 */
export async function searchMarketplaceNFTs(params: {
  query?: string;
  tags?: string[];
  priceMin?: string;
  priceMax?: string;
  sortBy?: 'price_asc' | 'price_desc' | 'newest' | 'oldest' | 'popular';
  limit?: number;
  offset?: number;
}): Promise<MarketplaceNFT[]> {
  try {
    let query = supabase
      .from('marketplace_active_listings')
      .select('*');

    // 文本搜索
    if (params.query) {
      query = query.or(`title.ilike.%${params.query}%,creator_address.ilike.%${params.query}%`);
    }

    // 标签过滤
    if (params.tags && params.tags.length > 0) {
      query = query.overlaps('tags', params.tags);
    }

    // 价格范围
    if (params.priceMin) {
      query = query.gte('price::decimal', parseFloat(params.priceMin));
    }
    if (params.priceMax) {
      query = query.lte('price::decimal', parseFloat(params.priceMax));
    }

    // 排序
    switch (params.sortBy) {
      case 'price_asc':
        query = query.order('price::decimal', { ascending: true });
        break;
      case 'price_desc':
        query = query.order('price::decimal', { ascending: false });
        break;
      case 'oldest':
        query = query.order('listed_at', { ascending: true });
        break;
      case 'popular':
        query = query.order('like_count', { ascending: false });
        break;
      case 'newest':
      default:
        query = query.order('listed_at', { ascending: false });
        break;
    }

    // 分页
    if (params.limit) {
      query = query.limit(params.limit);
    }
    if (params.offset) {
      query = query.range(params.offset, (params.offset + (params.limit || 20)) - 1);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error searching marketplace NFTs:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error in searchMarketplaceNFTs:', error);
    throw error;
  }
}