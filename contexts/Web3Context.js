import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { useWeb3, useTransaction } from '../lib/useWeb3';
import { transactionAPI, marketplaceAPI } from '../lib/api';

/**
 * Web3 上下文状态管理
 */

// 初始状态
const initialState = {
  // 网络状态
  networkStatus: null,
  
  // 用户数据
  userWorks: [],
  userNFTs: [],
  
  // 市场数据
  marketplaceListings: [],
  
  // 加载状态
  loading: {
    works: false,
    nfts: false,
    marketplace: false,
    transactions: false,
  },
  
  // 错误状态
  errors: {},
};

// Action 类型
const ActionTypes = {
  SET_NETWORK_STATUS: 'SET_NETWORK_STATUS',
  SET_USER_WORKS: 'SET_USER_WORKS',
  SET_USER_NFTS: 'SET_USER_NFTS',
  SET_MARKETPLACE_LISTINGS: 'SET_MARKETPLACE_LISTINGS',
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR',
  ADD_USER_WORK: 'ADD_USER_WORK',
  ADD_USER_NFT: 'ADD_USER_NFT',
  UPDATE_LISTING: 'UPDATE_LISTING',
};

// Reducer
function web3Reducer(state, action) {
  switch (action.type) {
    case ActionTypes.SET_NETWORK_STATUS:
      return {
        ...state,
        networkStatus: action.payload,
      };
      
    case ActionTypes.SET_USER_WORKS:
      return {
        ...state,
        userWorks: action.payload,
      };
      
    case ActionTypes.SET_USER_NFTS:
      return {
        ...state,
        userNFTs: action.payload,
      };
      
    case ActionTypes.SET_MARKETPLACE_LISTINGS:
      return {
        ...state,
        marketplaceListings: action.payload,
      };
      
    case ActionTypes.SET_LOADING:
      return {
        ...state,
        loading: {
          ...state.loading,
          [action.payload.key]: action.payload.value,
        },
      };
      
    case ActionTypes.SET_ERROR:
      return {
        ...state,
        errors: {
          ...state.errors,
          [action.payload.key]: action.payload.error,
        },
      };
      
    case ActionTypes.CLEAR_ERROR:
      const newErrors = { ...state.errors };
      delete newErrors[action.payload];
      return {
        ...state,
        errors: newErrors,
      };
      
    case ActionTypes.ADD_USER_WORK:
      return {
        ...state,
        userWorks: [...state.userWorks, action.payload],
      };
      
    case ActionTypes.ADD_USER_NFT:
      return {
        ...state,
        userNFTs: [...state.userNFTs, action.payload],
      };
      
    case ActionTypes.UPDATE_LISTING:
      return {
        ...state,
        marketplaceListings: state.marketplaceListings.map(listing =>
          listing.tokenId === action.payload.tokenId
            ? { ...listing, ...action.payload.updates }
            : listing
        ),
      };
      
    default:
      return state;
  }
}

// 创建上下文
const Web3Context = createContext();

// 上下文提供者
export function Web3Provider({ children }) {
  const [state, dispatch] = useReducer(web3Reducer, initialState);
  const web3 = useWeb3();
  const transactions = useTransaction();

  // 设置加载状态
  const setLoading = (key, value) => {
    dispatch({
      type: ActionTypes.SET_LOADING,
      payload: { key, value },
    });
  };

  // 设置错误
  const setError = (key, error) => {
    dispatch({
      type: ActionTypes.SET_ERROR,
      payload: { key, error: error.message || error },
    });
  };

  // 清除错误
  const clearError = (key) => {
    dispatch({
      type: ActionTypes.CLEAR_ERROR,
      payload: key,
    });
  };

  // 获取网络状态
  const fetchNetworkStatus = async () => {
    try {
      const response = await transactionAPI.getBalance();
      dispatch({
        type: ActionTypes.SET_NETWORK_STATUS,
        payload: response.data,
      });
    } catch (error) {
      console.error('获取网络状态失败:', error);
      setError('network', error);
    }
  };

  // 获取用户作品
  const fetchUserWorks = async (address) => {
    if (!address) return;
    
    setLoading('works', true);
    clearError('works');
    
    try {
      const response = await transactionAPI.getBalance();
      dispatch({
        type: ActionTypes.SET_USER_WORKS,
        payload: response.data,
      });
    } catch (error) {
      console.error('获取用户作品失败:', error);
      setError('works', error);
    } finally {
      setLoading('works', false);
    }
  };

  // 获取市场列表
  const fetchMarketplaceListings = async () => {
    setLoading('marketplace', true);
    clearError('marketplace');
    
    try {
      const response = await marketplaceAPI.searchNFTs({});
      dispatch({
        type: ActionTypes.SET_MARKETPLACE_LISTINGS,
        payload: response.data,
      });
    } catch (error) {
      console.error('获取市场列表失败:', error);
      setError('marketplace', error);
    } finally {
      setLoading('marketplace', false);
    }
  };

  // 创建作品
  const createWork = async (workData) => {
    setLoading('transactions', true);
    clearError('createWork');
    
    try {
      // 使用前端 Web3 直接调用合约
      const contract = web3.web3Utils.getContract('CreationManager');
      const tx = await contract.createWork(
        workData.title,
        workData.description,
        workData.contentHash,
        web3.web3Utils.parseEther(workData.price.toString()),
        workData.isPublic || true
      );
      
      // 添加交易到跟踪列表
      transactions.addTransaction(tx.hash, `创建作品: ${workData.title}`);
      
      // 等待交易确认
      const receipt = await tx.wait();
      
      // 解析事件获取 workId
      const event = receipt.logs.find(log => {
        try {
          const parsed = contract.interface.parseLog(log);
          return parsed.name === 'WorkCreated';
        } catch {
          return false;
        }
      });
      
      if (event) {
        const parsed = contract.interface.parseLog(event);
        const newWork = {
          id: parsed.args.workId.toString(),
          title: workData.title,
          description: workData.description,
          contentHash: workData.contentHash,
          price: workData.price,
          creator: web3.account,
          isPublic: workData.isPublic,
          createdAt: new Date(),
        };
        
        dispatch({
          type: ActionTypes.ADD_USER_WORK,
          payload: newWork,
        });
        
        transactions.updateTransaction(tx.hash, { status: 'success' });
        
        return {
          success: true,
          workId: parsed.args.workId.toString(),
          txHash: tx.hash,
        };
      }
      
      throw new Error('未找到 WorkCreated 事件');
      
    } catch (error) {
      console.error('创建作品失败:', error);
      setError('createWork', error);
      throw error;
    } finally {
      setLoading('transactions', false);
    }
  };

  // 铸造 NFT
  const mintNFT = async (workId, tokenURI) => {
    setLoading('transactions', true);
    clearError('mintNFT');
    
    try {
      const contract = web3.web3Utils.getContract('NFTManager');
      const tx = await contract.mintNFT(web3.account, workId, tokenURI);
      
      transactions.addTransaction(tx.hash, `铸造 NFT: Work #${workId}`);
      
      const receipt = await tx.wait();
      
      // 解析 Transfer 事件获取 tokenId
      const event = receipt.logs.find(log => {
        try {
          const parsed = contract.interface.parseLog(log);
          return parsed.name === 'Transfer';
        } catch {
          return false;
        }
      });
      
      if (event) {
        const parsed = contract.interface.parseLog(event);
        const newNFT = {
          tokenId: parsed.args.tokenId.toString(),
          workId,
          owner: web3.account,
          tokenURI,
        };
        
        dispatch({
          type: ActionTypes.ADD_USER_NFT,
          payload: newNFT,
        });
        
        transactions.updateTransaction(tx.hash, { status: 'success' });
        
        return {
          success: true,
          tokenId: parsed.args.tokenId.toString(),
          txHash: tx.hash,
        };
      }
      
      throw new Error('未找到 Transfer 事件');
      
    } catch (error) {
      console.error('铸造 NFT 失败:', error);
      setError('mintNFT', error);
      throw error;
    } finally {
      setLoading('transactions', false);
    }
  };

  // 上架 NFT
  const listNFT = async (tokenId, price) => {
    setLoading('transactions', true);
    clearError('listNFT');
    
    try {
      const contract = web3.web3Utils.getContract('NFTMarketplace');
      const tx = await contract.listNFT(tokenId, web3.web3Utils.parseEther(price.toString()));
      
      transactions.addTransaction(tx.hash, `上架 NFT #${tokenId}`);
      
      await tx.wait();
      
      transactions.updateTransaction(tx.hash, { status: 'success' });
      
      // 刷新市场列表
      await fetchMarketplaceListings();
      
      return {
        success: true,
        txHash: tx.hash,
      };
      
    } catch (error) {
      console.error('上架 NFT 失败:', error);
      setError('listNFT', error);
      throw error;
    } finally {
      setLoading('transactions', false);
    }
  };

  // 购买 NFT
  const buyNFT = async (tokenId, price) => {
    setLoading('transactions', true);
    clearError('buyNFT');
    
    try {
      const contract = web3.web3Utils.getContract('NFTMarketplace');
      const tx = await contract.buyNFT(tokenId, {
        value: web3.web3Utils.parseEther(price.toString())
      });
      
      transactions.addTransaction(tx.hash, `购买 NFT #${tokenId}`);
      
      await tx.wait();
      
      transactions.updateTransaction(tx.hash, { status: 'success' });
      
      // 刷新市场列表和用户 NFT
      await Promise.all([
        fetchMarketplaceListings(),
        web3.refreshBalance(),
      ]);
      
      return {
        success: true,
        txHash: tx.hash,
      };
      
    } catch (error) {
      console.error('购买 NFT 失败:', error);
      setError('buyNFT', error);
      throw error;
    } finally {
      setLoading('transactions', false);
    }
  };

  // 当账户变化时刷新数据
  useEffect(() => {
    if (web3.account) {
      fetchUserWorks(web3.account);
    }
  }, [web3.account]);

  // 初始化时获取网络状态和市场数据
  useEffect(() => {
    fetchNetworkStatus();
    fetchMarketplaceListings();
  }, []);

  const contextValue = {
    // 状态
    ...state,
    
    // Web3 状态
    ...web3,
    
    // 交易状态
    ...transactions,
    
    // 方法
    fetchNetworkStatus,
    fetchUserWorks,
    fetchMarketplaceListings,
    createWork,
    mintNFT,
    listNFT,
    buyNFT,
    
    // 工具方法
    setLoading,
    setError,
    clearError,
  };

  return (
    <Web3Context.Provider value={contextValue}>
      {children}
    </Web3Context.Provider>
  );
}

// 使用上下文的 Hook
export function useWeb3Context() {
  const context = useContext(Web3Context);
  if (!context) {
    throw new Error('useWeb3Context must be used within a Web3Provider');
  }
  return context;
}

export default Web3Context;