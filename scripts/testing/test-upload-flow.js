#!/usr/bin/env node

/**
 * WhichWitch v2.0 Upload Flow Test
 * 测试新的分离式上传流程
 */

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function testUploadFlow() {
  console.log('🧪 Testing WhichWitch v2.0 Upload Flow...\n')

  try {
    // 1. 测试数据库连接
    console.log('1️⃣ Testing database connection...')
    const { data: testData, error: testError } = await supabase
      .from('works')
      .select('count')
      .limit(1)
    
    if (testError) {
      throw new Error(`Database connection failed: ${testError.message}`)
    }
    console.log('✅ Database connection successful\n')

    // 2. 测试创建数据库记录（模拟上传到数据库）
    console.log('2️⃣ Testing database-only upload...')
    const tempWorkId = Date.now() + Math.floor(Math.random() * 1000)
    
    const mockWork = {
      work_id: tempWorkId,
      creator_address: '0x1234567890123456789012345678901234567890',
      title: 'Test Upload Flow Work',
      description: 'Testing the new separated upload flow',
      story: 'This is a test work to verify the upload flow works correctly',
      image_url: 'https://gateway.pinata.cloud/ipfs/QmTestHash123',
      images: ['https://gateway.pinata.cloud/ipfs/QmTestHash123'],
      metadata_uri: 'ipfs://QmTestMetadataHash456',
      material: ['Digital', 'Test'],
      tags: ['test', 'upload-flow'],
      allow_remix: true,
      license_fee: '0.05',
      is_remix: false,
      parent_work_id: null,
      is_on_chain: false,
      upload_status: 'database_only',
      temp_work_id: tempWorkId
    }

    const { data: createdWork, error: createError } = await supabase
      .from('works')
      .insert(mockWork)
      .select()
      .single()

    if (createError) {
      throw new Error(`Failed to create work: ${createError.message}`)
    }
    console.log('✅ Database-only upload successful:', {
      workId: createdWork.work_id,
      status: createdWork.upload_status,
      isOnChain: createdWork.is_on_chain
    })
    console.log('')

    // 3. 测试更新区块链信息（模拟mint到区块链）
    console.log('3️⃣ Testing blockchain mint update...')
    const blockchainWorkId = 12345
    const txHash = '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890'

    const { data: updatedWork, error: updateError } = await supabase
      .from('works')
      .update({
        work_id: blockchainWorkId,
        blockchain_tx_hash: txHash,
        is_on_chain: true,
        upload_status: 'minted'
      })
      .eq('work_id', tempWorkId)
      .select()
      .single()

    if (updateError) {
      throw new Error(`Failed to update blockchain info: ${updateError.message}`)
    }
    console.log('✅ Blockchain mint update successful:', {
      oldWorkId: tempWorkId,
      newWorkId: updatedWork.work_id,
      txHash: updatedWork.blockchain_tx_hash,
      status: updatedWork.upload_status,
      isOnChain: updatedWork.is_on_chain
    })
    console.log('')

    // 4. 测试查询不同状态的作品
    console.log('4️⃣ Testing work status queries...')
    
    // 查询数据库作品
    const { data: databaseWorks, error: dbError } = await supabase
      .from('works')
      .select('work_id, title, upload_status, is_on_chain')
      .eq('upload_status', 'database_only')
      .limit(5)

    if (dbError) {
      console.warn('⚠️ Failed to query database works:', dbError.message)
    } else {
      console.log(`📊 Found ${databaseWorks.length} database-only works`)
    }

    // 查询已mint作品
    const { data: mintedWorks, error: mintError } = await supabase
      .from('works')
      .select('work_id, title, upload_status, is_on_chain')
      .eq('upload_status', 'minted')
      .limit(5)

    if (mintError) {
      console.warn('⚠️ Failed to query minted works:', mintError.message)
    } else {
      console.log(`⛓️ Found ${mintedWorks.length} minted works`)
    }
    console.log('')

    // 5. 清理测试数据
    console.log('5️⃣ Cleaning up test data...')
    const { error: deleteError } = await supabase
      .from('works')
      .delete()
      .eq('work_id', blockchainWorkId)

    if (deleteError) {
      console.warn('⚠️ Failed to clean up test data:', deleteError.message)
    } else {
      console.log('✅ Test data cleaned up')
    }

    console.log('\n🎉 Upload flow test completed successfully!')
    console.log('\n📋 Test Summary:')
    console.log('✅ Database connection')
    console.log('✅ Database-only upload')
    console.log('✅ Blockchain mint update')
    console.log('✅ Status queries')
    console.log('✅ Data cleanup')

  } catch (error) {
    console.error('\n❌ Upload flow test failed:', error.message)
    process.exit(1)
  }
}

// 运行测试
if (require.main === module) {
  testUploadFlow()
}

module.exports = { testUploadFlow }