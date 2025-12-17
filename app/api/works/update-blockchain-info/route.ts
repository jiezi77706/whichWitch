import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

export async function POST(request: NextRequest) {
  try {
    const { tempWorkId, blockchainWorkId, txHash } = await request.json();
    
    console.log('🔄 Updating blockchain info:', { tempWorkId, blockchainWorkId, txHash });

    // 验证参数
    if (!tempWorkId || !blockchainWorkId || !txHash) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    // 更新数据库记录
    const { data, error } = await supabaseAdmin
      .from('works')
      .update({
        work_id: blockchainWorkId,
        blockchain_tx_hash: txHash,
        is_on_chain: true,
        updated_at: new Date().toISOString()
      })
      .eq('work_id', tempWorkId)
      .select()
      .single();

    if (error) {
      console.error('Error updating blockchain info:', error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    console.log('✅ Blockchain info updated successfully');
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in update blockchain info API:', error);
    return NextResponse.json(
      { error: 'Failed to update blockchain info' },
      { status: 500 }
    );
  }
}