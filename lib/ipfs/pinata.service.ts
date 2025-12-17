/**
 * Pinata IPFS 服务 - 通过安全API处理文件上传到 IPFS
 * v2.0: 使用服务端API确保API密钥安全
 */

const PINATA_GATEWAY = 'https://gateway.pinata.cloud/ipfs';

/**
 * 上传文件到 Pinata (通过安全API)
 */
export async function uploadFileToPinata(file: File): Promise<string> {
  try {
    console.log('📤 通过安全API上传文件到IPFS...', {
      name: file.name,
      size: file.size,
      type: file.type
    });

    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch('/api/ipfs/upload-file', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('❌ IPFS上传API错误:', errorData);
      throw new Error(`IPFS upload failed: ${errorData.error || response.statusText}`);
    }

    const data = await response.json();
    console.log('✅ IPFS上传成功:', data.ipfsHash);
    return data.ipfsHash;
  } catch (error) {
    console.error('❌ 文件上传到IPFS失败:', error);
    throw error;
  }
}

/**
 * 上传 JSON 数据到 Pinata (通过安全API)
 */
export async function uploadJSONToPinata(jsonData: any, name?: string): Promise<string> {
  try {
    console.log('📤 通过安全API上传JSON到IPFS...', {
      name: name || 'metadata.json',
      dataKeys: Object.keys(jsonData)
    });

    const response = await fetch('/api/ipfs/upload-json', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        jsonData,
        name: name || 'metadata.json',
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('❌ IPFS JSON上传API错误:', errorData);
      throw new Error(`IPFS JSON upload failed: ${errorData.error || response.statusText}`);
    }

    const data = await response.json();
    console.log('✅ IPFS JSON上传成功:', data.ipfsHash);
    return data.ipfsHash;
  } catch (error) {
    console.error('❌ JSON上传到IPFS失败:', error);
    throw error;
  }
}

/**
 * 创建作品 metadata 并上传
 */
export async function createAndUploadMetadata(workData: {
  title: string;
  description?: string;
  story?: string;
  imageHash: string; // IPFS hash of the image
  images?: string[]; // Array of IPFS URLs for multiple images
  material?: string[];
  tags?: string[];
  creator: string;
  parentWorkId?: number;
}): Promise<string> {
  const metadata = {
    name: workData.title,
    description: workData.description || '',
    image: `ipfs://${workData.imageHash}`,
    images: workData.images || [],
    attributes: [
      ...(workData.material?.map(m => ({ trait_type: 'Material', value: m })) || []),
      ...(workData.tags?.map(t => ({ trait_type: 'Tag', value: t })) || []),
    ],
    properties: {
      story: workData.story || '',
      creator: workData.creator,
      parentWorkId: workData.parentWorkId || null,
      createdAt: new Date().toISOString(),
    },
  };

  const metadataHash = await uploadJSONToPinata(metadata, `${workData.title}-metadata`);
  return metadataHash;
}

/**
 * 获取 IPFS URL
 */
export function getIPFSUrl(hash: string): string {
  return `${PINATA_GATEWAY}/${hash}`;
}

/**
 * 从 IPFS URI 获取 HTTP URL
 */
export function ipfsToHttp(uri: string): string {
  if (uri.startsWith('ipfs://')) {
    const hash = uri.replace('ipfs://', '');
    return getIPFSUrl(hash);
  }
  return uri;
}

/**
 * 批量上传文件
 */
export async function uploadMultipleFiles(files: File[]): Promise<string[]> {
  try {
    const uploadPromises = files.map(file => uploadFileToPinata(file));
    const hashes = await Promise.all(uploadPromises);
    return hashes;
  } catch (error) {
    console.error('Error uploading multiple files:', error);
    throw error;
  }
}

/**
 * 检查 Pinata 配置是否有效
 * v2.0: 通过API检查服务端配置
 */
export async function isPinataConfigured(): Promise<boolean> {
  try {
    const response = await fetch('/api/ipfs/upload-json', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        jsonData: { test: true },
        name: 'config-test.json',
      }),
    });
    
    // 如果返回配置错误，说明未配置
    if (response.status === 500) {
      const errorData = await response.json();
      if (errorData.error?.includes('configuration')) {
        return false;
      }
    }
    
    return true;
  } catch (error) {
    console.error('检查Pinata配置失败:', error);
    return false;
  }
}
