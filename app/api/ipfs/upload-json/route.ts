import { NextRequest, NextResponse } from 'next/server';

/**
 * 服务端IPFS JSON上传API
 * 安全地处理Pinata API密钥，不暴露给客户端
 */

const PINATA_JWT = process.env.PINATA_JWT;
const PINATA_API_URL = 'https://api.pinata.cloud';

export async function POST(request: NextRequest) {
  try {
    // 检查API密钥配置
    if (!PINATA_JWT) {
      console.error('❌ Pinata JWT not configured');
      return NextResponse.json(
        { error: 'Pinata configuration missing' },
        { status: 500 }
      );
    }

    // 获取JSON数据
    const { jsonData, name } = await request.json();
    
    if (!jsonData) {
      return NextResponse.json(
        { error: 'No JSON data provided' },
        { status: 400 }
      );
    }

    console.log('📤 上传JSON到Pinata:', {
      name: name || 'metadata.json',
      dataKeys: Object.keys(jsonData)
    });

    // 上传到Pinata
    const response = await fetch(`${PINATA_API_URL}/pinning/pinJSONToIPFS`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${PINATA_JWT}`,
      },
      body: JSON.stringify({
        pinataContent: jsonData,
        pinataMetadata: {
          name: name || 'metadata.json',
          keyvalues: {
            uploadedBy: 'WhichWitch-v2.0',
            timestamp: new Date().toISOString(),
          }
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Pinata JSON上传失败:', errorText);
      return NextResponse.json(
        { error: `Pinata JSON upload failed: ${response.status} ${response.statusText}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log('✅ Pinata JSON上传成功:', data.IpfsHash);

    return NextResponse.json({
      success: true,
      ipfsHash: data.IpfsHash,
      ipfsUrl: `https://gateway.pinata.cloud/ipfs/${data.IpfsHash}`,
      pinataUrl: `https://gateway.pinata.cloud/ipfs/${data.IpfsHash}`,
      timestamp: data.Timestamp,
    });

  } catch (error) {
    console.error('❌ IPFS JSON上传API错误:', error);
    return NextResponse.json(
      { error: 'Failed to upload JSON to IPFS' },
      { status: 500 }
    );
  }
}

// 支持OPTIONS请求（CORS预检）
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}