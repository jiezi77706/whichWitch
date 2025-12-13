const express = require('express');
const web3Service = require('../services/web3Service');
const {
  generateWorkDescription,
  brainstormCreativeIdeas,
  analyzeNFTMarket,
  generateTradingAdvice,
  explainWeb3Basics,
  generateWalletManagementAdvice,
  handleGeneralQuery,
  getLatestMarketData,
  getUserWalletData
} = require('../services/aiAgentService');

const router = express.Router();

/**
 * AI助手 - 通用查询处理
 * POST /api/ai/chat
 */
router.post('/chat', async (req, res) => {
  try {
    const { query, userContext = {} } = req.body;

    if (!query) {
      return res.status(400).json({
        success: false,
        error: 'Query is required'
      });
    }

    const result = await handleGeneralQuery(query, userContext);

    if (result.success) {
      res.json({
        success: true,
        response: result.content,
        usage: result.usage
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error
      });
    }
  } catch (error) {
    console.error('AI chat route error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

/**
 * 创作助手 - 生成作品简介
 * POST /api/ai/generate-description
 */
router.post('/generate-description', async (req, res) => {
  try {
    const { workTitle, workType, userInput, userProfile } = req.body;

    if (!workTitle) {
      return res.status(400).json({
        success: false,
        error: 'Work title is required'
      });
    }

    const result = await generateWorkDescription(
      workTitle,
      workType || '原创作品',
      userInput || '',
      userProfile || {}
    );

    if (result.success) {
      res.json({
        success: true,
        description: result.content,
        usage: result.usage
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error
      });
    }
  } catch (error) {
    console.error('Generate description route error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

/**
 * 创作助手 - 头脑风暴和创作建议
 * POST /api/ai/brainstorm
 */
router.post('/brainstorm', async (req, res) => {
  try {
    const { workTitle, currentDescription, creativeGoals } = req.body;

    if (!workTitle) {
      return res.status(400).json({
        success: false,
        error: 'Work title is required'
      });
    }

    const result = await brainstormCreativeIdeas(
      workTitle,
      currentDescription || '',
      creativeGoals || ''
    );

    if (result.success) {
      res.json({
        success: true,
        ideas: result.content,
        usage: result.usage
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error
      });
    }
  } catch (error) {
    console.error('Brainstorm route error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

/**
 * 交易助手 - NFT 市场分析
 * GET /api/ai/market-analysis
 */
router.get('/market-analysis', async (req, res) => {
  try {
    const { userPreferences } = req.query;
    
    const marketData = await getLatestMarketData();
    const preferences = userPreferences ? JSON.parse(userPreferences) : {};

    const result = await analyzeNFTMarket(marketData, preferences);

    if (result.success) {
      res.json({
        success: true,
        analysis: result.content,
        marketData: marketData,
        usage: result.usage
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error
      });
    }
  } catch (error) {
    console.error('Market analysis route error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

/**
 * 交易助手 - 个性化交易建议
 * POST /api/ai/trading-advice
 */
router.post('/trading-advice', async (req, res) => {
  try {
    const { walletAddress, userPreferences } = req.body;

    if (!walletAddress) {
      return res.status(400).json({
        success: false,
        error: 'Wallet address is required'
      });
    }

    // 获取用户投资组合和交易历史
    const walletData = await getUserWalletData(walletAddress);
    const marketData = await getLatestMarketData();
    
    // 模拟交易历史（实际应该从数据库获取）
    const transactionHistory = {
      totalTransactions: walletData.worksCount,
      averageAmount: walletData.totalValue / Math.max(walletData.worksCount, 1),
      recentActivity: walletData.lastActivity
    };

    const result = await generateTradingAdvice(
      walletData,
      transactionHistory,
      marketData
    );

    if (result.success) {
      res.json({
        success: true,
        advice: result.content,
        walletData: walletData,
        usage: result.usage
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error
      });
    }
  } catch (error) {
    console.error('Trading advice route error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

/**
 * 钱包管理助手 - Web3 基础知识普及
 * POST /api/ai/web3-education
 */
router.post('/web3-education', async (req, res) => {
  try {
    const { question, userLevel } = req.body;

    if (!question) {
      return res.status(400).json({
        success: false,
        error: 'Question is required'
      });
    }

    const result = await explainWeb3Basics(
      question,
      userLevel || 'beginner'
    );

    if (result.success) {
      res.json({
        success: true,
        explanation: result.content,
        usage: result.usage
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error
      });
    }
  } catch (error) {
    console.error('Web3 education route error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

/**
 * 钱包管理助手 - 个人财务管理建议
 * POST /api/ai/wallet-management
 */
router.post('/wallet-management', async (req, res) => {
  try {
    const { walletAddress, userGoals } = req.body;

    if (!walletAddress) {
      return res.status(400).json({
        success: false,
        error: 'Wallet address is required'
      });
    }

    const walletData = await getUserWalletData(walletAddress);

    const result = await generateWalletManagementAdvice(
      walletData,
      userGoals || {}
    );

    if (result.success) {
      res.json({
        success: true,
        advice: result.content,
        walletData: walletData,
        usage: result.usage
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error
      });
    }
  } catch (error) {
    console.error('Wallet management route error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

/**
 * 获取市场数据
 * GET /api/ai/market-data
 */
router.get('/market-data', async (req, res) => {
  try {
    const marketData = await getLatestMarketData();
    
    res.json({
      success: true,
      data: marketData
    });
  } catch (error) {
    console.error('Market data route error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

module.exports = router;