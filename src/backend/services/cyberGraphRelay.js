const { ethers } = require('ethers');
const axios = require('axios');

/**
 * CyberGraph 中继服务
 * 负责处理 whichWitch 平台与 CyberGraph 之间的数据同步
 */
class CyberGraphRelay {
  constructor(config) {
    this.config = {
      privateKey: config.privateKey,
      rpcUrl: config.rpcUrl,
      cyberGraphSyncAddress: config.cyberGraphSyncAddress,
      cyberGraphApiUrl: config.cyberGraphApiUrl || 'https://api.cybergraph.io',
      cyberGraphApiKey: config.cyberGraphApiKey,
      ...config
    };

    // 初始化以太坊提供者和钱包
    this.provider = new ethers.JsonRpcProvider(this.config.rpcUrl);
    this.wallet = new ethers.Wallet(this.config.privateKey, this.provider);
    
    // CyberGraphSync 合约 ABI（简化版）
    this.contractABI = [
      "function confirmCyberGraphSync(uint256 syncId, string calldata cyberGraphId) external",
      "function markSyncFailed(uint256 syncId, string calldata reason) external",
      "event ContentSyncInitiated(uint256 indexed syncId, uint256 indexed workId, address indexed creator, uint8 contentType, string contentHash)"
    ];
    
    this.contract = new ethers.Contract(
      this.config.cyberGraphSyncAddress,
      this.contractABI,
      this.wallet
    );
  }

  /**
   * 启动中继服务，监听同步事件
   */
  async start() {
    console.log('🚀 启动 CyberGraph 中继服务...');
    console.log('合约地址:', this.config.cyberGraphSyncAddress);
    console.log('CyberGraph API:', this.config.cyberGraphApiUrl);

    // 监听 ContentSyncInitiated 事件
    this.contract.on('ContentSyncInitiated', async (syncId, workId, creator, contentType, contentHash, event) => {
      console.log(`📡 收到同步请求: syncId=${syncId}, workId=${workId}`);
      
      try {
        await this.processSyncRequest({
          syncId: syncId.toString(),
          workId: workId.toString(),
          creator,
          contentType: parseInt(contentType),
          contentHash,
          blockNumber: event.blockNumber,
          transactionHash: event.transactionHash
        });
      } catch (error) {
        console.error(`❌ 处理同步请求失败 (syncId: ${syncId}):`, error);
        await this.markSyncFailed(syncId.toString(), error.message);
      }
    });

    console.log('✅ 中继服务已启动，正在监听同步事件...');
  }

  /**
   * 处理同步请求
   */
  async processSyncRequest(syncData) {
    console.log(`🔄 处理同步请求: ${syncData.syncId}`);

    try {
      // 1. 获取作品详细信息
      const workDetails = await this.getWorkDetails(syncData.workId);
      
      // 2. 准备 CyberGraph 数据
      const cyberGraphData = this.prepareCyberGraphData(syncData, workDetails);
      
      // 3. 同步到 CyberGraph
      const cyberGraphId = await this.syncToCyberGraph(cyberGraphData);
      
      // 4. 确认同步完成
      await this.confirmSync(syncData.syncId, cyberGraphId);
      
      console.log(`✅ 同步完成: syncId=${syncData.syncId}, cyberGraphId=${cyberGraphId}`);
      
    } catch (error) {
      console.error(`❌ 同步失败: ${syncData.syncId}`, error);
      await this.markSyncFailed(syncData.syncId, error.message);
    }
  }

  /**
   * 获取作品详细信息
   */
  async getWorkDetails(workId) {
    // 这里应该调用 CreationManager 合约获取作品信息
    // 或者从数据库中获取
    try {
      // 示例实现 - 实际应该从合约或数据库获取
      return {
        id: workId,
        title: `Work ${workId}`,
        description: `Description for work ${workId}`,
        creator: '0x...',
        contentHash: 'Qm...',
        metadata: {},
        createdAt: Date.now()
      };
    } catch (error) {
      throw new Error(`获取作品信息失败: ${error.message}`);
    }
  }

  /**
   * 准备 CyberGraph 数据格式
   */
  prepareCyberGraphData(syncData, workDetails) {
    const contentTypeMap = {
      0: 'OriginalWork',
      1: 'DerivativeWork', 
      2: 'CreatorProfile',
      3: 'SocialPost'
    };

    return {
      type: contentTypeMap[syncData.contentType] || 'OriginalWork',
      title: workDetails.title,
      description: workDetails.description,
      creator: syncData.creator,
      contentHash: syncData.contentHash,
      metadata: {
        whichWitchWorkId: syncData.workId,
        whichWitchSyncId: syncData.syncId,
        blockNumber: syncData.blockNumber,
        transactionHash: syncData.transactionHash,
        ...workDetails.metadata
      },
      timestamp: new Date().toISOString()
    };
  }

  /**
   * 同步数据到 CyberGraph
   */
  async syncToCyberGraph(data) {
    try {
      console.log('📤 同步到 CyberGraph...');
      
      // 实际的 CyberGraph API 调用
      const response = await axios.post(`${this.config.cyberGraphApiUrl}/content`, data, {
        headers: {
          'Authorization': `Bearer ${this.config.cyberGraphApiKey}`,
          'Content-Type': 'application/json'
        },
        timeout: 30000
      });

      if (response.data && response.data.id) {
        return response.data.id;
      } else {
        throw new Error('CyberGraph API 返回无效响应');
      }
      
    } catch (error) {
      if (error.response) {
        throw new Error(`CyberGraph API 错误: ${error.response.status} - ${error.response.data?.message || error.message}`);
      } else {
        throw new Error(`网络错误: ${error.message}`);
      }
    }
  }

  /**
   * 确认同步完成
   */
  async confirmSync(syncId, cyberGraphId) {
    try {
      console.log(`✅ 确认同步完成: syncId=${syncId}, cyberGraphId=${cyberGraphId}`);
      
      const tx = await this.contract.confirmCyberGraphSync(syncId, cyberGraphId);
      await tx.wait();
      
      console.log(`📝 交易已确认: ${tx.hash}`);
      
    } catch (error) {
      throw new Error(`确认同步失败: ${error.message}`);
    }
  }

  /**
   * 标记同步失败
   */
  async markSyncFailed(syncId, reason) {
    try {
      console.log(`❌ 标记同步失败: syncId=${syncId}, reason=${reason}`);
      
      const tx = await this.contract.markSyncFailed(syncId, reason);
      await tx.wait();
      
      console.log(`📝 失败标记已确认: ${tx.hash}`);
      
    } catch (error) {
      console.error(`标记失败状态时出错: ${error.message}`);
    }
  }

  /**
   * 停止中继服务
   */
  stop() {
    console.log('🛑 停止 CyberGraph 中继服务...');
    this.contract.removeAllListeners();
  }
}

module.exports = CyberGraphRelay;