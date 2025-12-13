const { ethers } = require('ethers');
const crypto = require('crypto');

/**
 * 钱包服务 - 处理邮箱登录自动创建钱包
 */
class WalletService {
  constructor() {
    this.provider = new ethers.JsonRpcProvider(
      process.env.RPC_URL || 'https://zetachain-athens-evm.blockpi.network/v1/rpc/public'
    );
  }

  /**
   * 为邮箱用户生成钱包
   * @param {string} email - 用户邮箱
   * @param {string} password - 用户密码（用于加密私钥）
   * @returns {Object} 钱包信息
   */
  async createWalletForEmail(email, password) {
    try {
      // 生成随机钱包
      const wallet = ethers.Wallet.createRandom();
      
      // 使用密码加密私钥
      const encryptedPrivateKey = await this.encryptPrivateKey(wallet.privateKey, password);
      
      // 生成助记词
      const mnemonic = wallet.mnemonic;
      
      return {
        address: wallet.address,
        encryptedPrivateKey,
        mnemonic: mnemonic ? mnemonic.phrase : null,
        publicKey: wallet.publicKey,
        createdAt: new Date().toISOString()
      };
    } catch (error) {
      console.error('创建钱包失败:', error);
      throw new Error('钱包创建失败: ' + error.message);
    }
  }

  /**
   * 加密私钥
   * @param {string} privateKey - 私钥
   * @param {string} password - 密码
   * @returns {Object} 加密后的私钥数据
   */
  async encryptPrivateKey(privateKey, password) {
    try {
      const algorithm = 'aes-256-gcm';
      const key = crypto.scryptSync(password, 'whichWitch-salt', 32);
      const iv = crypto.randomBytes(16);
      
      const cipher = crypto.createCipherGCM(algorithm, key, iv);
      
      let encrypted = cipher.update(privateKey, 'utf8', 'hex');
      encrypted += cipher.final('hex');
      
      const authTag = cipher.getAuthTag();
      
      return {
        encrypted,
        iv: iv.toString('hex'),
        authTag: authTag.toString('hex'),
        algorithm
      };
    } catch (error) {
      console.error('私钥加密失败:', error);
      throw new Error('私钥加密失败');
    }
  }

  /**
   * 解密私钥
   * @param {Object} encryptedData - 加密数据
   * @param {string} password - 密码
   * @returns {string} 解密后的私钥
   */
  async decryptPrivateKey(encryptedData, password) {
    try {
      const { encrypted, iv, authTag, algorithm } = encryptedData;
      const key = crypto.scryptSync(password, 'whichWitch-salt', 32);
      
      const decipher = crypto.createDecipherGCM(algorithm, key, Buffer.from(iv, 'hex'));
      decipher.setAuthTag(Buffer.from(authTag, 'hex'));
      
      let decrypted = decipher.update(encrypted, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      
      return decrypted;
    } catch (error) {
      console.error('私钥解密失败:', error);
      throw new Error('私钥解密失败，请检查密码');
    }
  }

  /**
   * 从加密私钥创建钱包实例
   * @param {Object} encryptedData - 加密的私钥数据
   * @param {string} password - 密码
   * @returns {ethers.Wallet} 钱包实例
   */
  async createWalletFromEncrypted(encryptedData, password) {
    try {
      const privateKey = await this.decryptPrivateKey(encryptedData, password);
      return new ethers.Wallet(privateKey, this.provider);
    } catch (error) {
      console.error('从加密私钥创建钱包失败:', error);
      throw error;
    }
  }

  /**
   * 验证钱包地址
   * @param {string} address - 钱包地址
   * @returns {boolean} 是否有效
   */
  isValidAddress(address) {
    try {
      return ethers.isAddress(address);
    } catch (error) {
      return false;
    }
  }

  /**
   * 获取钱包余额
   * @param {string} address - 钱包地址
   * @returns {string} 余额（以 ETH 为单位）
   */
  async getWalletBalance(address) {
    try {
      if (!this.isValidAddress(address)) {
        throw new Error('无效的钱包地址');
      }
      
      const balance = await this.provider.getBalance(address);
      return ethers.formatEther(balance);
    } catch (error) {
      console.error('获取钱包余额失败:', error);
      throw error;
    }
  }

  /**
   * 生成钱包安全建议
   * @param {string} email - 用户邮箱
   * @returns {Object} 安全建议
   */
  generateSecurityAdvice(email) {
    return {
      securityTips: [
        '🔐 请妥善保管您的密码，它是访问钱包的唯一凭证',
        '📝 建议将助记词写在纸上并存放在安全的地方',
        '🚫 永远不要与他人分享您的私钥或助记词',
        '💻 定期更新密码，使用强密码组合',
        '🔒 启用双重验证以增强账户安全性'
      ],
      backupInstructions: [
        '1. 记录您的助记词（12个单词）',
        '2. 将助记词存储在离线环境中',
        '3. 考虑使用硬件钱包存储大额资产',
        '4. 定期检查钱包活动记录',
        '5. 了解常见的钓鱼攻击手段'
      ],
      emergencyContacts: {
        support: 'support@whichwitch.com',
        security: 'security@whichwitch.com'
      }
    };
  }

  /**
   * 生成钱包使用指南
   * @returns {Object} 使用指南
   */
  generateUsageGuide() {
    return {
      basicOperations: [
        '💰 查看余额：在钱包页面查看您的 ZETA 余额',
        '📤 发送交易：输入接收地址和金额进行转账',
        '📥 接收资金：分享您的钱包地址给他人',
        '🎨 创建作品：使用钱包签名注册您的原创作品',
        '🛒 购买 NFT：在市场中购买其他创作者的作品'
      ],
      advancedFeatures: [
        '🔗 连接 DApp：将钱包连接到其他去中心化应用',
        '💱 代币交换：在支持的交易所交换不同代币',
        '📊 投资组合：跟踪您的数字资产表现',
        '🎯 DeFi 参与：参与去中心化金融协议',
        '🌐 跨链操作：在不同区块链间转移资产'
      ],
      troubleshooting: [
        '❓ 忘记密码：联系客服进行账户恢复',
        '🔄 交易失败：检查 Gas 费用和网络状态',
        '⏰ 交易延迟：等待网络确认或提高 Gas 价格',
        '🚨 可疑活动：立即更改密码并联系客服',
        '📱 设备丢失：使用助记词在新设备上恢复钱包'
      ]
    };
  }
}

// 创建单例实例
const walletService = new WalletService();

module.exports = walletService;