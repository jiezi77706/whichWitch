import { ethers } from 'ethers';
import { getNetworkConfig, getContractAddress } from '../config/contracts.js';
import { ABIS } from '../config/abis.js';

/**
 * Web3 工具类
 */
class Web3Utils {
  constructor() {
    this.provider = null;
    this.signer = null;
    this.contracts = {};
    this.chainId = 7001; // 默认 ZetaChain 测试网
  }

  /**
   * 初始化 Provider
   */
  async initProvider(rpcUrl = null) {
    try {
      if (typeof window !== 'undefined' && window.ethereum) {
        // 浏览器环境，使用 MetaMask
        this.provider = new ethers.BrowserProvider(window.ethereum);
        this.signer = await this.provider.getSigner();
        
        // 获取当前网络
        const network = await this.provider.getNetwork();
        this.chainId = Number(network.chainId);
        
        console.log('✅ Web3 Provider 初始化成功 (MetaMask)');
        console.log('当前网络:', this.chainId);
        
      } else if (rpcUrl) {
        // 服务器环境，使用 RPC
        this.provider = new ethers.JsonRpcProvider(rpcUrl);
        
        if (process.env.PRIVATE_KEY) {
          this.signer = new ethers.Wallet(process.env.PRIVATE_KEY, this.provider);
        }
        
        console.log('✅ Web3 Provider 初始化成功 (RPC)');
        
      } else {
        throw new Error('无法初始化 Web3 Provider');
      }
      
      return true;
    } catch (error) {
      console.error('❌ Web3 Provider 初始化失败:', error);
      return false;
    }
  }

  /**
   * 切换网络到 ZetaChain 测试网
   */
  async switchToZetaChain() {
    if (typeof window === 'undefined' || !window.ethereum) {
      throw new Error('MetaMask 未安装');
    }

    try {
      // 尝试切换到 ZetaChain 测试网
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0x1B59' }], // 7001 的十六进制
      });
      
      this.chainId = 7001;
      console.log('✅ 已切换到 ZetaChain 测试网');
      
    } catch (switchError) {
      // 如果网络不存在，添加网络
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: '0x1B59',
              chainName: 'ZetaChain Athens Testnet',
              nativeCurrency: {
                name: 'ZETA',
                symbol: 'ZETA',
                decimals: 18
              },
              rpcUrls: ['https://zetachain-athens-evm.blockpi.network/v1/rpc/public'],
              blockExplorerUrls: ['https://zetachain-athens-3.blockscout.com']
            }]
          });
          
          this.chainId = 7001;
          console.log('✅ ZetaChain 测试网已添加并切换');
          
        } catch (addError) {
          console.error('❌ 添加 ZetaChain 网络失败:', addError);
          throw addError;
        }
      } else {
        console.error('❌ 切换网络失败:', switchError);
        throw switchError;
      }
    }
  }

  /**
   * 获取合约实例
   */
  getContract(contractName, chainId = null) {
    const currentChainId = chainId || this.chainId;
    const contractKey = `${contractName}_${currentChainId}`;
    
    if (this.contracts[contractKey]) {
      return this.contracts[contractKey];
    }

    const address = getContractAddress(contractName, currentChainId);
    const abi = ABIS[contractName];
    
    if (!address || !abi) {
      throw new Error(`合约 ${contractName} 配置不完整`);
    }

    const signerOrProvider = this.signer || this.provider;
    if (!signerOrProvider) {
      throw new Error('Provider 未初始化');
    }

    this.contracts[contractKey] = new ethers.Contract(address, abi, signerOrProvider);
    return this.contracts[contractKey];
  }

  /**
   * 获取账户地址
   */
  async getAddress() {
    if (!this.signer) {
      throw new Error('Signer 未初始化');
    }
    return await this.signer.getAddress();
  }

  /**
   * 获取账户余额
   */
  async getBalance(address = null) {
    if (!this.provider) {
      throw new Error('Provider 未初始化');
    }
    
    const targetAddress = address || await this.getAddress();
    const balance = await this.provider.getBalance(targetAddress);
    return ethers.formatEther(balance);
  }

  /**
   * 格式化金额
   */
  formatEther(value) {
    return ethers.formatEther(value);
  }

  /**
   * 解析金额
   */
  parseEther(value) {
    return ethers.parseEther(value.toString());
  }

  /**
   * 等待交易确认
   */
  async waitForTransaction(txHash, confirmations = 1) {
    if (!this.provider) {
      throw new Error('Provider 未初始化');
    }
    
    return await this.provider.waitForTransaction(txHash, confirmations);
  }

  /**
   * 获取交易收据
   */
  async getTransactionReceipt(txHash) {
    if (!this.provider) {
      throw new Error('Provider 未初始化');
    }
    
    return await this.provider.getTransactionReceipt(txHash);
  }

  /**
   * 估算 Gas
   */
  async estimateGas(contract, method, params = [], overrides = {}) {
    try {
      return await contract[method].estimateGas(...params, overrides);
    } catch (error) {
      console.error('Gas 估算失败:', error);
      throw error;
    }
  }

  /**
   * 检查网络连接
   */
  async checkConnection() {
    try {
      if (!this.provider) return false;
      
      const network = await this.provider.getNetwork();
      return network.chainId === BigInt(this.chainId);
    } catch (error) {
      console.error('网络连接检查失败:', error);
      return false;
    }
  }

  /**
   * 监听合约事件
   */
  listenToEvent(contractName, eventName, callback, fromBlock = 'latest') {
    try {
      const contract = this.getContract(contractName);
      
      contract.on(eventName, (...args) => {
        const event = args[args.length - 1]; // 最后一个参数是事件对象
        callback({
          ...event,
          args: args.slice(0, -1)
        });
      });
      
      console.log(`✅ 开始监听 ${contractName}.${eventName} 事件`);
      
      return () => {
        contract.removeAllListeners(eventName);
        console.log(`🛑 停止监听 ${contractName}.${eventName} 事件`);
      };
      
    } catch (error) {
      console.error('事件监听设置失败:', error);
      throw error;
    }
  }

  /**
   * 获取历史事件
   */
  async getEvents(contractName, eventName, fromBlock = 0, toBlock = 'latest') {
    try {
      const contract = this.getContract(contractName);
      const filter = contract.filters[eventName]();
      
      return await contract.queryFilter(filter, fromBlock, toBlock);
    } catch (error) {
      console.error('获取历史事件失败:', error);
      throw error;
    }
  }
}

// 创建全局实例
const web3Utils = new Web3Utils();

export default web3Utils;
export { Web3Utils };