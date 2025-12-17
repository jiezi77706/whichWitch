import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

/**
 * 同步NFT状态到数据库
 * 更新nft_cache表和work_stats表
 */
export async function POST(request: NextRequest) {
  try {
    const {
      workId,
      tokenId,
      isMinted,
      ownerAddress,
      tokenURI,
      mintTxHash,
      isListed,
      listPrice,
      marketplaceListingId
    } = await request.json();

    console.log('🔄 同步NFT状态到数据库:', {
      workId,
      tokenId,
      isMinted,
      ownerAddress
    });

    // 验证必要参数
    if (!workId || tokenId === undefined) {
      return NextResponse.json(
        { error: 'workId and tokenId are required' },
        { status: 400 }
      );
    }

    // 使用数据库函数同步NFT状态
    const { error: syncError } = await supabaseAdmin.rpc('sync_nft_status', {
      p_work_id: workId,
      p_token_id: tokenId ? parseInt(tokenId) : null,
      p_is_minted: isMinted || false,
      p_owner_address: ownerAddress || null,
      p_is_listed: isListed || false,
      p_list_price: listPrice || null
    });

    if (syncError) {
      console.error('❌ 数据库同步函数调用失败:', syncError);
      return NextResponse.json(
        { error: 'Failed to sync NFT status: ' + syncError.message },
        { status: 500 }
      );
    }

    // 如果有NFT交易信息，记录到交易历史
    if (mintTxHash && isMinted) {
      const { error: txError } = await supabaseAdmin.rpc('record_nft_transaction', {
        p_work_id: workId,
        p_token_id: parseInt(tokenId),
        p_transaction_type: 'mint',
        p_from_address: '0x0000000000000000000000000000000000000000', // mint from zero address
        p_to_address: ownerAddress,
        p_price: '0',
        p_tx_hash: mintTxHash,
        p_block_number: null, // 可以后续通过事件监听获取
        p_platform_fee: null,
        p_royalty_amount: null
      });

      if (txError) {
        console.error('❌ NFT交易记录失败:', txError);
        // 不返回错误，因为主要的状态同步已经成功
      } else {
        console.log('✅ NFT交易记录成功');
      }
    }

    console.log('✅ NFT状态同步完成');

    return NextResponse.json({
      success: true,
      message: 'NFT status synced successfully'
    });

  } catch (error) {
    console.error('❌ NFT状态同步API错误:', error);
    return NextResponse.json(
      { error: 'Failed to sync NFT status' },
      { status: 500 }
    );
  }
}

/**
 * 获取作品的NFT状态
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const workId = searchParams.get('workId');

    if (!workId) {
      return NextResponse.json(
        { error: 'workId is required' },
        { status: 400 }
      );
    }

    // 从nft_cache表获取NFT状态
    const { data: nftStatus, error } = await supabaseAdmin
      .from('nft_cache')
      .select('*')
      .eq('work_id', parseInt(workId))
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('❌ 获取NFT状态失败:', error);
      return NextResponse.json(
        { error: 'Failed to get NFT status' },
        { status: 500 }
      );
    }

    // 如果没有缓存记录，返回默认状态
    if (!nftStatus) {
      return NextResponse.json({
        workId: parseInt(workId),
        tokenId: null,
        isMinted: false,
        ownerAddress: null,
        isListed: false,
        listPrice: null,
        marketplaceListingId: null,
        lastSync: null
      });
    }

    return NextResponse.json({
      workId: nftStatus.work_id,
      tokenId: nftStatus.token_id,
      isMinted: nftStatus.is_minted,
      ownerAddress: nftStatus.owner_address,
      isListed: nftStatus.is_listed,
      listPrice: nftStatus.list_price,
      marketplaceListingId: nftStatus.marketplace_listing_id,
      lastSync: nftStatus.last_sync
    });

  } catch (error) {
    console.error('❌ 获取NFT状态API错误:', error);
    return NextResponse.json(
      { error: 'Failed to get NFT status' },
      { status: 500 }
    );
  }
}