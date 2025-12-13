const { ethers } = require('ethers');
const { getNetworkConfig, getContractAddress } = require('../config/contracts');
const { ABIS } = require('../config/abis');

/**
 * 后端 Web3 服务
 */
class Web3Service {
  constructor() {
    this.provider = null;
    this.signer = null;
    this.contracts = {};
    this.chainId = 7001; // ZetaChain 测试网
    
    this.init();
  }

  /**
   * 初始化服务
   */
  async init() {
    try {
      // 初始化 Provider
      const rpcUrl = process.env.RPC_URL || 'https://zetachain-athens-evm.blockpi.network/v1/rpc/public';
      this.provider = new ethers.JsonRpcProvider(rpcUrl);
      
      // 初始化 Signer
      if (process.env.PRIVATE_KEY) {
        this.signer = new ethers.Wallet(process.env.PRIVATE_KEY, this.provider);
        console.log('✅ Web3Service 初始化成功');
        console.log('钱包地址:', await this.signer.getAddress());
      } else {
        console.warn('⚠️ 未设置 PRIVATE_KEY，只能进行只读操作');
      }
      
      // 验证网络连接
      const network = await this.provider.getNetwork();
      console.log('连接网络:', network.name, 'ChainId:', network.chainId.toString());
      
    } catch (error) {
      console.error('❌ Web3Service 初始化失败:', error);
      throw error;
    }
  }

  /**
   * 获取合约实例
   */
  getContract(contractName) {
    if (this.contracts[contractName]) {
      return this.contracts[contractName];
    }

    const address = getContractAddress(contractName, this.chainId);
    const abi = ABIS[contractName];
    
    if (!address || !abi) {
      throw new Error(`合约 ${contractName} 配置不完整`);
    }

    const signerOrProvider = this.signer || this.provider;
    this.contracts[contractName] = new ethers.Contract(address, abi, signerOrProvider);
    
    return this.contracts[contractName];
  }

  /**
   * 创建作品
   */
  async createWork(title, description, contentHash, price, isPublic = true) {
    try {
      const creationManager = this.getContract('CreationManager');
      
      const tx = await creationManager.createWork(
        title,
        description,
        contentHash,
        ethers.parseEther(price.toString()),
        isPublic
      );
      
      const receipt = await tx.wait();
      
      // 解析事件获取 workId
      const event = receipt.logs.find(log => {
        try {
          const parsed = creationManager.interface.parseLog(log);
          return parsed.name === 'WorkCreated';
        } catch {
          return false;
        }
      });
      
      if (event) {
        const parsed = creationManager.interface.parseLog(event);
        return {
          success: true,
          workId: parsed.args.workId.toString(),
          txHash: tx.hash,
          blockNumber: receipt.blockNumber
        };
      }
      
      throw new Error('未找到 WorkCreated 事件');
      
    } catch (error) {
      console.error('创建作品失败:', error);
      throw error;
    }
  }

  /**
   * 获取作品信息
   */
  async getWork(workId) {
    try {
      const creationManager = this.getContract('CreationManager');
      const result = await creationManager.getWork(workId);
      
      return {
        id: result[0].toString(),
        creator: result[1],
        price: ethers.formatEther(result[2]),
        createdAt: new Date(Number(result[3]) * 1000),
        updatedAt: new Date(Number(result[4]) * 1000),
        isPublic: result[5],
        exists: result[6]
      };
    } catch (error) {
      console.error('获取作品信息失败:', error);
      throw error;
    }
  }

  /**
   * 获取用户作品列表
   */
  async getUserWorks(userAddress) {
    try {
      const creationManager = this.getContract('CreationManager');
      const workIds = await creationManager.getUserWorks(userAddress);
      
      const works = [];
      for (const workId of workIds) {
        try {
          const work = await this.getWork(workId.toString());
          works.push(work);
        } catch (error) {
          console.error(`获取作品 ${workId} 失败:`, error);
        }
      }
      
      return works;
    } catch (error) {
      console.error('获取用户作品列表失败:', error);
      throw error;
    }
  }

  /**
   * 铸造 NFT
   */
  async mintNFT(to, workId, tokenURI) {
    try {
      const nftManager = this.getContract('NFTManager');
      
      const tx = await nftManager.mintNFT(to, workId, tokenURI);
      const receipt = await tx.wait();
      
      // 解析 Transfer 事件获取 tokenId
      const event = receipt.logs.find(log => {
        try {
          const parsed = nftManager.interface.parseLog(log);
          return parsed.name === 'Transfer';
        } catch {
          return false;
        }
      });
      
      if (event) {
        const parsed = nftManager.interface.parseLog(event);
        return {
          success: true,
          tokenId: parsed.args.tokenId.toString(),
          txHash: tx.hash,
          blockNumber: receipt.blockNumber
        };
      }
      
      throw new Error('未找到 Transfer 事件');
      
    } catch (error) {
      console.error('铸造 NFT 失败:', error);
      throw error;
    }
  }

  /**
   * 获取 NFT 信息
   */
  async getNFTInfo(tokenId) {
    try {
      const nftManager = this.getContract('NFTManager');
      
      const [owner, tokenURI, workId] = await Promise.all([
        nftManager.ownerOf(tokenId),
        nftManager.tokenURI(tokenId),
        nftManager.getTokenWork(tokenId)
      ]);
      
      return {
        tokenId: tokenId.toString(),
        owner,
        tokenURI,
        workId: workId.toString()
      };
    } catch (error) {
      console.error('获取 NFT 信息失败:', error);
      throw error;
    }
  }

  /**
   * 上架 NFT
   */
  async listNFT(tokenId, price) {
    try {
      const marketplace = this.getContract('NFTMarketplace');
      
      const tx = await marketplace.listNFT(tokenId, ethers.parseEther(price.toString()));
      const receipt = await tx.wait();
      
      return {
        success: true,
        txHash: tx.hash,
        blockNumber: receipt.blockNumber
      };
    } catch (error) {
      console.error('上架 NFT 失败:', error);
      throw error;
    }
  }

  /**
   * 购买 NFT
   */
  async buyNFT(tokenId, price) {
    try {
      const marketplace = this.getContract('NFTMarketplace');
      
      const tx = await marketplace.buyNFT(tokenId, {
        value: ethers.parseEther(price.toString())
      });
      const receipt = await tx.wait();
      
      return {
        success: true,
        txHash: tx.hash,
        blockNumber: receipt.blockNumber
      };
    } catch (error) {
      console.error('购买 NFT 失败:', error);
      throw error;
    }
  }

  /**
   * 获取市场上架列表
   */
  async getActiveListings() {
    try {
      const marketplace = this.getContract('NFTMarketplace');
      const tokenIds = await marketplace.getActiveListings();
      
      const listings = [];
      for (const tokenId of tokenIds) {
        try {
          const [seller, price, isActive] = await marketplace.getListing(tokenId);
          if (isActive) {
            const nftInfo = await this.getNFTInfo(tokenId);
            listings.push({
              ...nftInfo,
              seller,
              price: ethers.formatEther(price),
              isActive
            });
          }
        } catch (error) {
          console.error(`获取上架信息 ${tokenId} 失败:`, error);
        }
      }
      
      return listings;
    } catch (error) {
      console.error('获取市场上架列表失败:', error);
      throw error;
    }
  }

  /**
   * 处理支付
   */
  async processPayment(buyer, seller, amount, workId) {
    try {
      const paymentManager = this.getContract('PaymentManager');
      
      const tx = await paymentManager.processPayment(
        buyer,
        seller,
        ethers.parseEther(amount.toString()),
        workId
      );
      const receipt = await tx.wait();
      
      return {
        success: true,
        txHash: tx.hash,
        blockNumber: receipt.blockNumber
      };
    } catch (error) {
      console.error('处理支付失败:', error);
      throw error;
    }
  }

  /**
   * 获取平台费率
   */
  async getPlatformFee() {
    try {
      const paymentManager = this.getContract('PaymentManager');
      const fee = await paymentManager.getPlatformFee();
      return Number(fee);
    } catch (error) {
      console.error('获取平台费率失败:', error);
      throw error;
    }
  }

  /**
   * 监听合约事件
   */
  listenToEvents() {
    try {
      const creationManager = this.getContract('CreationManager');
      const nftManager = this.getContract('NFTManager');
      const marketplace = this.getContract('NFTMarketplace');
      
      // 监听作品创建事件
      creationManager.on('WorkCreated', (workId, creator, title, price, event) => {
        console.log('📝 新作品创建:', {
          workId: workId.toString(),
          creator,
          title,
          price: ethers.formatEther(price),
          txHash: event.transactionHash
        });
      });
      
      // 监听 NFT 转移事件
      nftManager.on('Transfer', (from, to, tokenId, event) => {
        if (from === ethers.ZeroAddress) {
          console.log('🎨 NFT 铸造:', {
            tokenId: tokenId.toString(),
            to,
            txHash: event.transactionHash
          });
        } else {
          console.log('🔄 NFT 转移:', {
            tokenId: tokenId.toString(),
            from,
            to,
            txHash: event.transactionHash
          });
        }
      });
      
      // 监听市场交易事件
      marketplace.on('NFTSold', (tokenId, buyer, seller, price, event) => {
        console.log('💰 NFT 售出:', {
          tokenId: tokenId.toString(),
          buyer,
          seller,
          price: ethers.formatEther(price),
          txHash: event.transactionHash
        });
      });
      
      console.log('✅ 开始监听合约事件');
      
    } catch (error) {
      console.error('❌ 事件监听设置失败:', error);
    }
  }

  /**
   * 获取账户余额
   */
  async getBalance(address) {
    try {
      const balance = await this.provider.getBalance(address);
      return ethers.formatEther(balance);
    } catch (error) {
      console.error('获取余额失败:', error);
      throw error;
    }
  }

  /**
   * 获取交易状态
   */
  async getTransactionStatus(txHash) {
    try {
      const receipt = await this.provider.getTransactionReceipt(txHash);
      if (!receipt) {
        return { status: 'pending' };
      }
      
      return {
        status: receipt.status === 1 ? 'success' : 'failed',
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString(),
        effectiveGasPrice: receipt.effectiveGasPrice?.toString()
      };
    } catch (error) {
      console.error('获取交易状态失败:', error);
      throw error;
    }
  }
}

// 创建单例实例
const web3Service = new Web3Service();

module.exports = web3Service;