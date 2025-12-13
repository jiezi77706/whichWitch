import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import web3Utils from '../src/utils/web3';

/**
 * Web3 React Hook
 */
export function useWeb3() {
  const [isConnected, setIsConnected] = useState(false);
  const [account, setAccount] = useState(null);
  const [balance, setBalance] = useState('0');
  const [chainId, setChainId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // 检查钱包连接状态
  const checkConnection = useCallback(async () => {
    try {
      if (typeof window !== 'undefined' && window.ethereum) {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        
        if (accounts.length > 0) {
          await web3Utils.initProvider();
          const address = await web3Utils.getAddress();
          const balance = await web3Utils.getBalance();
          const network = await web3Utils.provider.getNetwork();
          
          setAccount(address);
          setBalance(balance);
          setChainId(Number(network.chainId));
          setIsConnected(true);
        }
      }
    } catch (error) {
      console.error('检查连接状态失败:', error);
      setError(error.message);
    }
  }, []);

  // 连接钱包
  const connect = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      if (typeof window === 'undefined' || !window.ethereum) {
        throw new Error('请安装 MetaMask 钱包');
      }

      // 请求连接钱包
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      
      // 初始化 Web3
      await web3Utils.initProvider();
      
      // 检查并切换到 ZetaChain 网络
      const network = await web3Utils.provider.getNetwork();
      if (Number(network.chainId) !== 7001) {
        await web3Utils.switchToZetaChain();
      }
      
      // 获取账户信息
      const address = await web3Utils.getAddress();
      const balance = await web3Utils.getBalance();
      
      setAccount(address);
      setBalance(balance);
      setChainId(7001);
      setIsConnected(true);
      
      console.log('✅ 钱包连接成功:', address);
      
    } catch (error) {
      console.error('连接钱包失败:', error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 断开连接
  const disconnect = useCallback(() => {
    setAccount(null);
    setBalance('0');
    setChainId(null);
    setIsConnected(false);
    setError(null);
    
    console.log('🔌 钱包已断开连接');
  }, []);

  // 切换网络
  const switchNetwork = useCallback(async () => {
    try {
      await web3Utils.switchToZetaChain();
      setChainId(7001);
      setError(null);
    } catch (error) {
      console.error('切换网络失败:', error);
      setError(error.message);
    }
  }, []);

  // 刷新余额
  const refreshBalance = useCallback(async () => {
    if (account) {
      try {
        const newBalance = await web3Utils.getBalance();
        setBalance(newBalance);
      } catch (error) {
        console.error('刷新余额失败:', error);
      }
    }
  }, [account]);

  // 监听账户变化
  useEffect(() => {
    if (typeof window !== 'undefined' && window.ethereum) {
      const handleAccountsChanged = (accounts) => {
        if (accounts.length === 0) {
          disconnect();
        } else {
          checkConnection();
        }
      };

      const handleChainChanged = (chainId) => {
        setChainId(parseInt(chainId, 16));
        checkConnection();
      };

      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);

      return () => {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      };
    }
  }, [checkConnection, disconnect]);

  // 初始化检查
  useEffect(() => {
    checkConnection();
  }, [checkConnection]);

  return {
    // 状态
    isConnected,
    account,
    balance,
    chainId,
    isLoading,
    error,
    
    // 方法
    connect,
    disconnect,
    switchNetwork,
    refreshBalance,
    
    // 工具
    web3Utils,
    
    // 检查是否在正确网络
    isCorrectNetwork: chainId === 7001,
    
    // 格式化地址
    shortAddress: account ? `${account.slice(0, 6)}...${account.slice(-4)}` : null
  };
}

/**
 * 合约操作 Hook
 */
export function useContract(contractName) {
  const { isConnected, account, web3Utils } = useWeb3();
  const [contract, setContract] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isConnected && web3Utils) {
      try {
        const contractInstance = web3Utils.getContract(contractName);
        setContract(contractInstance);
      } catch (error) {
        console.error(`获取合约 ${contractName} 失败:`, error);
      }
    }
  }, [isConnected, contractName, web3Utils]);

  // 调用合约方法
  const call = useCallback(async (method, params = [], options = {}) => {
    if (!contract) {
      throw new Error('合约未初始化');
    }

    setIsLoading(true);
    try {
      const result = await contract[method](...params, options);
      return result;
    } catch (error) {
      console.error(`调用合约方法 ${method} 失败:`, error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [contract]);

  // 发送交易
  const send = useCallback(async (method, params = [], options = {}) => {
    if (!contract) {
      throw new Error('合约未初始化');
    }

    setIsLoading(true);
    try {
      const tx = await contract[method](...params, options);
      const receipt = await tx.wait();
      return { tx, receipt };
    } catch (error) {
      console.error(`发送交易 ${method} 失败:`, error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [contract]);

  // 估算 Gas
  const estimateGas = useCallback(async (method, params = [], options = {}) => {
    if (!contract) {
      throw new Error('合约未初始化');
    }

    try {
      return await contract[method].estimateGas(...params, options);
    } catch (error) {
      console.error(`估算 Gas 失败:`, error);
      throw error;
    }
  }, [contract]);

  return {
    contract,
    isLoading,
    call,
    send,
    estimateGas,
    isReady: !!contract && isConnected
  };
}

/**
 * 交易状态 Hook
 */
export function useTransaction() {
  const [transactions, setTransactions] = useState({});

  const addTransaction = useCallback((txHash, description) => {
    setTransactions(prev => ({
      ...prev,
      [txHash]: {
        hash: txHash,
        description,
        status: 'pending',
        timestamp: Date.now()
      }
    }));
  }, []);

  const updateTransaction = useCallback((txHash, updates) => {
    setTransactions(prev => ({
      ...prev,
      [txHash]: {
        ...prev[txHash],
        ...updates
      }
    }));
  }, []);

  const removeTransaction = useCallback((txHash) => {
    setTransactions(prev => {
      const newTransactions = { ...prev };
      delete newTransactions[txHash];
      return newTransactions;
    });
  }, []);

  return {
    transactions,
    addTransaction,
    updateTransaction,
    removeTransaction,
    pendingTransactions: Object.values(transactions).filter(tx => tx.status === 'pending')
  };
}