const express = require('express');
const router = express.Router();
const web3Service = require('../services/web3Service');

/**
 * 区块链相关 API 路由
 */

// 获取网络状态
router.get('/network/status', async (req, res) => {
  try {
    const balance = await web3Service.getBalance(await web3Service.signer?.getAddress());
    const platformFee = await web3Service.getPlatformFee();
    
    res.json({
      success: true,
      data: {
        network: 'ZetaChain Testnet',
        chainId: 7001,
        rpcUrl: process.env.RPC_URL,
        walletAddress: await web3Service.signer?.getAddress(),
        balance: balance,
        platformFee: platformFee,
        contracts: {
          CreationManager: process.env.CREATION_MANAGER_ADDRESS,
          NFTManager: process.env.NFT_MANAGER_ADDRESS,
          NFTMarketplace: process.env.MARKETPLACE_ADDRESS,
          PaymentManager: process.env.PAYMENT_MANAGER_ADDRESS,
          AuthorizationManager: process.env.AUTHORIZATION_MANAGER_ADDRESS,
          ZetaChainBridge: process.env.ZETA_BRIDGE_ADDRESS
        }
      }
    });
  } catch (error) {
    console.error('获取网络状态失败:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// 创建作品
router.post('/works', async (req, res) => {
  try {
    const { title, description, contentHash, price, isPublic = true } = req.body;
    
    if (!title || !description || !contentHash || !price) {
      return res.status(400).json({
        success: false,
        error: '缺少必要参数'
      });
    }
    
    const result = await web3Service.createWork(title, description, contentHash, price, isPublic);
    
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('创建作品失败:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// 获取作品信息
router.get('/works/:workId', async (req, res) => {
  try {
    const { workId } = req.params;
    const work = await web3Service.getWork(workId);
    
    res.json({
      success: true,
      data: work
    });
  } catch (error) {
    console.error('获取作品信息失败:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// 获取用户作品列表
router.get('/users/:address/works', async (req, res) => {
  try {
    const { address } = req.params;
    const works = await web3Service.getUserWorks(address);
    
    res.json({
      success: true,
      data: works
    });
  } catch (error) {
    console.error('获取用户作品列表失败:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// 铸造 NFT
router.post('/nfts/mint', async (req, res) => {
  try {
    const { to, workId, tokenURI } = req.body;
    
    if (!to || !workId || !tokenURI) {
      return res.status(400).json({
        success: false,
        error: '缺少必要参数'
      });
    }
    
    const result = await web3Service.mintNFT(to, workId, tokenURI);
    
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('铸造 NFT 失败:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// 获取 NFT 信息
router.get('/nfts/:tokenId', async (req, res) => {
  try {
    const { tokenId } = req.params;
    const nft = await web3Service.getNFTInfo(tokenId);
    
    res.json({
      success: true,
      data: nft
    });
  } catch (error) {
    console.error('获取 NFT 信息失败:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// 上架 NFT
router.post('/marketplace/list', async (req, res) => {
  try {
    const { tokenId, price } = req.body;
    
    if (!tokenId || !price) {
      return res.status(400).json({
        success: false,
        error: '缺少必要参数'
      });
    }
    
    const result = await web3Service.listNFT(tokenId, price);
    
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('上架 NFT 失败:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// 购买 NFT
router.post('/marketplace/buy', async (req, res) => {
  try {
    const { tokenId, price } = req.body;
    
    if (!tokenId || !price) {
      return res.status(400).json({
        success: false,
        error: '缺少必要参数'
      });
    }
    
    const result = await web3Service.buyNFT(tokenId, price);
    
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('购买 NFT 失败:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// 获取市场上架列表
router.get('/marketplace/listings', async (req, res) => {
  try {
    const listings = await web3Service.getActiveListings();
    
    res.json({
      success: true,
      data: listings
    });
  } catch (error) {
    console.error('获取市场上架列表失败:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// 处理支付
router.post('/payments/process', async (req, res) => {
  try {
    const { buyer, seller, amount, workId } = req.body;
    
    if (!buyer || !seller || !amount || !workId) {
      return res.status(400).json({
        success: false,
        error: '缺少必要参数'
      });
    }
    
    const result = await web3Service.processPayment(buyer, seller, amount, workId);
    
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('处理支付失败:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// 获取交易状态
router.get('/transactions/:txHash', async (req, res) => {
  try {
    const { txHash } = req.params;
    const status = await web3Service.getTransactionStatus(txHash);
    
    res.json({
      success: true,
      data: status
    });
  } catch (error) {
    console.error('获取交易状态失败:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// 获取账户余额
router.get('/accounts/:address/balance', async (req, res) => {
  try {
    const { address } = req.params;
    const balance = await web3Service.getBalance(address);
    
    res.json({
      success: true,
      data: {
        address,
        balance,
        currency: 'ZETA'
      }
    });
  } catch (error) {
    console.error('获取账户余额失败:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;