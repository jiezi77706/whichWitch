import { NextRequest, NextResponse } from 'next/server';

/**
 * 服务端IPFS文件上传API
 * 安全地处理Pinata API密钥，不暴露给客户端
 */

const PINATA_API_KEY = process.env.PINATA_API_KEY;
const PINATA_SECRET = process.env.PINATA_API_SECRET;
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

    // 获取上传的文件
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    console.log('📤 上传文件到Pinata:', {
      name: file.name,
      size: file.size,
      type: file.type
    });

    // 准备上传到Pinata的FormData
    const pinataFormData = new FormData();
    pinataFormData.append('file', file);

    const metadata = JSON.stringify({
      name: file.name,
      keyvalues: {
        uploadedBy: 'WhichWitch-v2.0',
        timestamp: new Date().toISOString(),
      }
    });
    pinataFormData.append('pinataMetadata', metadata);

    // 上传到Pinata
    const response = await fetch(`${PINATA_API_URL}/pinning/pinFileToIPFS`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${PINATA_JWT}`,
      },
      body: pinataFormData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Pinata上传失败:', errorText);
      return NextResponse.json(
        { error: `Pinata upload failed: ${response.status} ${response.statusText}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log('✅ Pinata上传成功:', data.IpfsHash);

    return NextResponse.json({
      success: true,
      ipfsHash: data.IpfsHash,
      ipfsUrl: `https://gateway.pinata.cloud/ipfs/${data.IpfsHash}`,
      pinataUrl: `https://gateway.pinata.cloud/ipfs/${data.IpfsHash}`,
      timestamp: data.Timestamp,
    });

  } catch (error) {
    console.error('❌ IPFS上传API错误:', error);
    return NextResponse.json(
      { error: 'Failed to upload file to IPFS' },
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