'use client';

import React, { useState, useEffect } from 'react';
import { useWeb3Context } from '../../contexts/Web3Context';
import { transactionAPI } from '../../lib/api';

export default function TestWeb3Page() {
  const {
    isConnected,
    account,
    balance,
    chainId,
    isCorrectNetwork,
    shortAddress,
    connect,
    disconnect,
    switchNetwork,
    refreshBalance,
    networkStatus,
    userWorks,
    marketplaceListings,
    loading,
    errors,
    createWork,
    mintNFT,
    listNFT,
    buyNFT,
    fetchNetworkStatus,
    fetchUserWorks,
    fetchMarketplaceListings,
  } = useWeb3Context();

  const [testResults, setTestResults] = useState({});
  const [isRunningTests, setIsRunningTests] = useState(false);

  // 测试 API 连接
  const testAPIConnection = async () => {
    try {
      const health = await systemAPI.healthCheck();
      const network = await blockchainAPI.getNetworkStatus();
      
      setTestResults(prev => ({
        ...prev,
        api: {
          health: health.success,
          network: network.success,
          details: { health, network }
        }
      }));
    } catch (error) {
      setTestResults(prev => ({
        ...prev,
        api: { error: error.message }
      }));
    }
  };

  // 测试创建作品
  const testCreateWork = async () => {
    if (!isConnected) {
      alert('请先连接钱包');
      return;
    }

    try {
      const workData = {
        title: `测试作品 ${Date.now()}`,
        description: '这是一个测试作品',
        contentHash: `QmTest${Date.now()}`,
        price: '0.001',
        isPublic: true
      };

      const result = await createWork(workData);
      
      setTestResults(prev => ({
        ...prev,
        createWork: { success: true, result }
      }));
    } catch (error) {
      setTestResults(prev => ({
        ...prev,
        createWork: { error: error.message }
      }));
    }
  };

  // 测试铸造 NFT
  const testMintNFT = async () => {
    if (!isConnected || userWorks.length === 0) {
      alert('请先连接钱包并创建作品');
      return;
    }

    try {
      const workId = userWorks[0].id;
      const tokenURI = `https://api.whichwitch.com/metadata/${workId}`;
      
      const result = await mintNFT(workId, tokenURI);
      
      setTestResults(prev => ({
        ...prev,
        mintNFT: { success: true, result }
      }));
    } catch (error) {
      setTestResults(prev => ({
        ...prev,
        mintNFT: { error: error.message }
      }));
    }
  };

  // 运行所有测试
  const runAllTests = async () => {
    setIsRunningTests(true);
    setTestResults({});

    try {
      await testAPIConnection();
      
      if (isConnected) {
        await fetchNetworkStatus();
        await fetchUserWorks(account);
        await fetchMarketplaceListings();
      }
    } catch (error) {
      console.error('测试失败:', error);
    } finally {
      setIsRunningTests(false);
    }
  };

  useEffect(() => {
    runAllTests();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Web3 功能测试</h1>

        {/* 钱包连接状态 */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">钱包连接状态</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <p><strong>连接状态:</strong> {isConnected ? '✅ 已连接' : '❌ 未连接'}</p>
              <p><strong>账户地址:</strong> {shortAddress || '未连接'}</p>
              <p><strong>余额:</strong> {balance} ZETA</p>
            </div>
            <div>
              <p><strong>网络 ID:</strong> {chainId || '未知'}</p>
              <p><strong>正确网络:</strong> {isCorrectNetwork ? '✅ ZetaChain 测试网' : '❌ 错误网络'}</p>
            </div>
          </div>

          <div className="flex gap-2">
            {!isConnected ? (
              <button
                onClick={connect}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                连接钱包
              </button>
            ) : (
              <>
                <button
                  onClick={disconnect}
                  className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                >
                  断开连接
                </button>
                <button
                  onClick={refreshBalance}
                  className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                >
                  刷新余额
                </button>
                {!isCorrectNetwork && (
                  <button
                    onClick={switchNetwork}
                    className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600"
                  >
                    切换到 ZetaChain
                  </button>
                )}
              </>
            )}
          </div>
        </div>

        {/* 网络状态 */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">网络状态</h2>
          
          {networkStatus ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p><strong>网络:</strong> {networkStatus.network}</p>
                <p><strong>Chain ID:</strong> {networkStatus.chainId}</p>
                <p><strong>RPC URL:</strong> {networkStatus.rpcUrl}</p>
              </div>
              <div>
                <p><strong>平台费率:</strong> {networkStatus.platformFee}%</p>
                <p><strong>钱包余额:</strong> {networkStatus.balance} ZETA</p>
              </div>
            </div>
          ) : (
            <p>加载中...</p>
          )}
        </div>

        {/* API 测试结果 */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">API 测试结果</h2>
          
          <button
            onClick={testAPIConnection}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 mb-4"
          >
            测试 API 连接
          </button>

          {testResults.api && (
            <div className="bg-gray-100 p-4 rounded">
              <pre className="text-sm overflow-auto">
                {JSON.stringify(testResults.api, null, 2)}
              </pre>
            </div>
          )}
        </div>

        {/* 合约交互测试 */}
        {isConnected && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">合约交互测试</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <button
                onClick={testCreateWork}
                disabled={loading.transactions}
                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:opacity-50"
              >
                {loading.transactions ? '处理中...' : '创建测试作品'}
              </button>
              
              <button
                onClick={testMintNFT}
                disabled={loading.transactions || userWorks.length === 0}
                className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600 disabled:opacity-50"
              >
                {loading.transactions ? '处理中...' : '铸造测试 NFT'}
              </button>
              
              <button
                onClick={fetchMarketplaceListings}
                disabled={loading.marketplace}
                className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600 disabled:opacity-50"
              >
                {loading.marketplace ? '加载中...' : '刷新市场数据'}
              </button>
            </div>

            {/* 测试结果 */}
            {Object.keys(testResults).filter(key => key !== 'api').map(key => (
              <div key={key} className="mb-4">
                <h3 className="font-semibold">{key} 测试结果:</h3>
                <div className="bg-gray-100 p-2 rounded text-sm">
                  <pre>{JSON.stringify(testResults[key], null, 2)}</pre>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 用户作品列表 */}
        {isConnected && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">我的作品 ({userWorks.length})</h2>
            
            {loading.works ? (
              <p>加载中...</p>
            ) : userWorks.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {userWorks.map((work, index) => (
                  <div key={work.id || index} className="border rounded p-4">
                    <h3 className="font-semibold">{work.title}</h3>
                    <p className="text-sm text-gray-600">{work.description}</p>
                    <p className="text-sm"><strong>价格:</strong> {work.price} ZETA</p>
                    <p className="text-sm"><strong>ID:</strong> {work.id}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p>暂无作品</p>
            )}
          </div>
        )}

        {/* 市场列表 */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">市场列表 ({marketplaceListings.length})</h2>
          
          {loading.marketplace ? (
            <p>加载中...</p>
          ) : marketplaceListings.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {marketplaceListings.map((listing, index) => (
                <div key={listing.tokenId || index} className="border rounded p-4">
                  <h3 className="font-semibold">NFT #{listing.tokenId}</h3>
                  <p className="text-sm"><strong>价格:</strong> {listing.price} ZETA</p>
                  <p className="text-sm"><strong>卖家:</strong> {listing.seller?.slice(0, 10)}...</p>
                  <p className="text-sm"><strong>作品 ID:</strong> {listing.workId}</p>
                </div>
              ))}
            </div>
          ) : (
            <p>暂无上架商品</p>
          )}
        </div>

        {/* 错误信息 */}
        {Object.keys(errors).length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-red-800 mb-4">错误信息</h2>
            {Object.entries(errors).map(([key, error]) => (
              <div key={key} className="mb-2">
                <strong className="text-red-700">{key}:</strong>
                <span className="text-red-600 ml-2">{error}</span>
              </div>
            ))}
          </div>
        )}

        {/* 重新运行测试 */}
        <div className="text-center">
          <button
            onClick={runAllTests}
            disabled={isRunningTests}
            className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 disabled:opacity-50"
          >
            {isRunningTests ? '运行测试中...' : '重新运行所有测试'}
          </button>
        </div>
      </div>
    </div>
  );
}