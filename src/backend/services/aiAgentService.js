const axios = require('axios');
const web3Service = require('./web3Service');

const QWEN_API_KEY = process.env.QWEN_API_KEY;
const QWEN_BASE_URL = process.env.QWEN_BASE_URL || 'https://dashscope.aliyuncs.com/compatible-mode/v1';

/**
 * 调用 Qwen API
 */
async function callQwenAPI(messages, temperature = 0.7) {
  try {
    const response = await axios.post(
      `${QWEN_BASE_URL}/chat/completions`,
      {
        model: 'qwen-turbo',
        messages: messages,
        temperature: temperature,
        max_tokens: 2000,
        stream: false
      },
      {
        headers: {
          'Authorization': `Bearer ${QWEN_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return {
      success: true,
      content: response.data.choices[0].message.content,
      usage: response.data.usage
    };
  } catch (error) {
    console.error('Qwen API error:', error.response?.data || error.message);
    return {
      success: false,
      error: error.response?.data?.error?.message || error.message
    };
  }
}

/**
 * 1. 创作助手 - 生成作品简介
 */
async function generateWorkDescription(workTitle, workType, userInput = '', userProfile = {}) {
  const messages = [
    {
      role: 'system',
      content: `你是 whichWitch 平台的专业创作助手。你的任务是帮助创作者：
1. 为作品生成吸引人的简介
2. 提供创作建议和灵感
3. 建议合适的授权方式

平台支持的作品类型：
- 原创作品：完全原创的内容
- 衍生作品：基于现有作品的再创作
- 数字艺术：插画、设计、摄影等
- 文字作品：小说、诗歌、剧本等
- 音频作品：音乐、播客、音效等
- 视频作品：短片、动画、教程等

授权方式建议：
- 完全开放：允许任何人免费使用和修改
- 署名授权：要求使用时署名原作者
- 商业授权：允许商业使用但需付费
- 非商业授权：仅允许非商业用途
- 限制性授权：特定条件下的使用权限

请用专业且富有创意的语言回复。`
    },
    {
      role: 'user',
      content: `作品标题: ${workTitle}
作品类型: ${workType}
用户描述: ${userInput || '用户未提供具体描述'}
创作者信息: ${JSON.stringify(userProfile)}

请为这个作品提供：
1. 一个吸引人的作品简介（100-200字）
2. 3-5个后续创作建议
3. 推荐的授权方式及理由
4. 市场定位建议

请用中文回复，语言要专业且富有创意。`
    }
  ];

  return await callQwenAPI(messages, 0.8);
}

/**
 * 2. 创作助手 - 头脑风暴和创作建议
 */
async function brainstormCreativeIdeas(workTitle, currentDescription, creativeGoals = '') {
  const messages = [
    {
      role: 'system',
      content: `你是 whichWitch 平台的创意顾问，专门帮助创作者进行头脑风暴和创作规划。

你的专长包括：
- 创意发散思维
- 作品系列规划
- 跨媒体创作建议
- 市场趋势分析
- 创作技巧指导

请提供具体可行的创作建议，激发创作者的灵感。`
    },
    {
      role: 'user',
      content: `作品标题: ${workTitle}
当前描述: ${currentDescription}
创作目标: ${creativeGoals}

请为创作者提供：
1. 5个创意发展方向
2. 可能的系列作品规划
3. 跨媒体创作机会
4. 与其他创作者的合作建议
5. 提升作品价值的具体方法

请用中文回复，提供具体可执行的建议。`
    }
  ];

  return await callQwenAPI(messages, 0.9);
}

/**
 * 3. 交易助手 - NFT 市场分析和建议
 */
async function analyzeNFTMarket(marketData, userPreferences = {}) {
  const messages = [
    {
      role: 'system',
      content: `你是 whichWitch 平台的 NFT 交易分析师，专门分析市场数据并提供交易建议。

分析维度：
- 价格趋势分析
- 交易量变化
- 热门作品类型
- 创作者表现
- 市场情绪指标

交易建议类型：
- 购买时机建议
- 定价策略
- 销售策略
- 风险控制
- 投资组合优化

请提供基于数据的客观分析和建议。`
    },
    {
      role: 'user',
      content: `市场数据: ${JSON.stringify(marketData)}
用户偏好: ${JSON.stringify(userPreferences)}

请基于当前市场数据提供：
1. 市场趋势分析
2. 推荐的购买机会（包括价格区间）
3. 销售策略建议
4. 风险提醒
5. 短期和长期投资建议

请用中文回复，提供具体的数据支撑和可操作的建议。`
    }
  ];

  return await callQwenAPI(messages, 0.6);
}

/**
 * 4. 交易助手 - 个性化交易建议
 */
async function generateTradingAdvice(userPortfolio, transactionHistory, marketConditions) {
  const messages = [
    {
      role: 'system',
      content: `你是 whichWitch 平台的个人交易顾问，根据用户的投资组合和交易历史提供个性化建议。

分析要素：
- 用户风险偏好
- 历史交易表现
- 当前持仓分析
- 市场机会识别
- 资产配置优化

建议类型：
- 买入/卖出时机
- 价格策略
- 风险管理
- 收益优化
- 长期规划`
    },
    {
      role: 'user',
      content: `用户投资组合: ${JSON.stringify(userPortfolio)}
交易历史: ${JSON.stringify(transactionHistory)}
市场条件: ${JSON.stringify(marketConditions)}

请提供个性化的交易建议：
1. 当前投资组合分析
2. 推荐的交易操作
3. 风险控制措施
4. 收益优化策略
5. 下一步行动计划

请用中文回复，确保建议符合用户的风险承受能力。`
    }
  ];

  return await callQwenAPI(messages, 0.5);
}

/**
 * 5. 钱包管理助手 - Web3 基础知识普及
 */
async function explainWeb3Basics(userQuestion, userLevel = 'beginner') {
  const messages = [
    {
      role: 'system',
      content: `你是 whichWitch 平台的 Web3 教育专家，专门为新用户普及区块链和钱包知识。

教育内容包括：
- 区块链基础概念
- 钱包类型和安全
- 私钥和助记词管理
- Gas 费用机制
- DeFi 基础知识
- NFT 原理和价值
- 安全防护措施

请用通俗易懂的语言解释复杂概念，并提供实用的操作指导。`
    },
    {
      role: 'user',
      content: `用户问题: ${userQuestion}
用户水平: ${userLevel}

请针对用户的问题提供：
1. 清晰的概念解释
2. 实际操作指导
3. 安全注意事项
4. 常见误区提醒
5. 进一步学习建议

请用中文回复，语言要通俗易懂，避免过多技术术语。`
    }
  ];

  return await callQwenAPI(messages, 0.3);
}

/**
 * 6. 钱包管理助手 - 个人财务管理建议
 */
async function generateWalletManagementAdvice(walletData, userGoals = {}) {
  const messages = [
    {
      role: 'system',
      content: `你是 whichWitch 平台的数字资产管理顾问，帮助用户优化钱包管理和资产配置。

管理领域：
- 资产安全保护
- 收益最大化
- 风险分散
- 流动性管理
- 税务规划
- 长期投资策略

请提供实用的财务管理建议，帮助用户实现财务目标。`
    },
    {
      role: 'user',
      content: `钱包数据: ${JSON.stringify(walletData)}
用户目标: ${JSON.stringify(userGoals)}

请提供个性化的钱包管理建议：
1. 当前资产状况分析
2. 安全防护措施
3. 收益优化策略
4. 风险管理建议
5. 长期财务规划

请用中文回复，提供具体可执行的管理策略。`
    }
  ];

  return await callQwenAPI(messages, 0.4);
}

/**
 * 7. 智能助手 - 综合查询处理
 */
async function handleGeneralQuery(userQuery, userContext = {}) {
  // 根据查询内容判断应该调用哪个专门的助手
  const queryLower = userQuery.toLowerCase();
  
  if (queryLower.includes('创作') || queryLower.includes('作品') || queryLower.includes('简介')) {
    return await generateWorkDescription(
      userContext.workTitle || '未指定作品',
      userContext.workType || '原创作品',
      userQuery,
      userContext
    );
  }
  
  if (queryLower.includes('交易') || queryLower.includes('买') || queryLower.includes('卖') || queryLower.includes('价格')) {
    const marketData = await getLatestMarketData();
    return await analyzeNFTMarket(marketData, userContext);
  }
  
  if (queryLower.includes('钱包') || queryLower.includes('web3') || queryLower.includes('区块链')) {
    return await explainWeb3Basics(userQuery, userContext.userLevel || 'beginner');
  }

  // 通用查询处理
  const messages = [
    {
      role: 'system',
      content: `你是 whichWitch 平台的 AI 助手，专门帮助用户解决平台相关问题。

平台功能：
- 邮箱登录自动创建钱包
- 作品注册和 NFT 铸造
- 创作助手和市场分析
- 交易建议和风险评估
- 钱包管理和 Web3 教育

请根据用户问题提供准确、有帮助的回答。`
    },
    {
      role: 'user',
      content: `用户问题: ${userQuery}
用户上下文: ${JSON.stringify(userContext)}

请回答用户的问题，如果需要更多信息，请引导用户提供。`
    }
  ];

  return await callQwenAPI(messages, 0.7);
}

/**
 * 获取最新市场数据（模拟）
 */
async function getLatestMarketData() {
  try {
    // 从区块链获取实际市场数据
    const listings = await web3Service.getActiveListings();
    
    // 计算市场统计
    const totalListings = listings.length;
    const averagePrice = listings.length > 0 
      ? listings.reduce((sum, item) => sum + parseFloat(item.price), 0) / listings.length 
      : 0;
    
    const priceRanges = {
      low: Math.min(...listings.map(item => parseFloat(item.price))) || 0,
      high: Math.max(...listings.map(item => parseFloat(item.price))) || 0,
      average: averagePrice
    };

    return {
      totalListings,
      priceRanges,
      recentSales: listings.slice(0, 5), // 最近5个上架
      marketTrend: 'stable', // 这里可以添加趋势分析逻辑
      lastUpdated: new Date().toISOString()
    };
  } catch (error) {
    console.error('获取市场数据失败:', error);
    return {
      totalListings: 0,
      priceRanges: { low: 0, high: 0, average: 0 },
      recentSales: [],
      marketTrend: 'unknown',
      lastUpdated: new Date().toISOString()
    };
  }
}

/**
 * 获取用户钱包数据
 */
async function getUserWalletData(walletAddress) {
  try {
    const balance = await web3Service.getBalance(walletAddress);
    const userWorks = await web3Service.getUserWorks(walletAddress);
    
    return {
      address: walletAddress,
      balance: balance,
      worksCount: userWorks.length,
      totalValue: userWorks.reduce((sum, work) => sum + parseFloat(work.price || 0), 0),
      lastActivity: new Date().toISOString()
    };
  } catch (error) {
    console.error('获取钱包数据失败:', error);
    return {
      address: walletAddress,
      balance: '0',
      worksCount: 0,
      totalValue: 0,
      lastActivity: null
    };
  }
}

module.exports = {
  // 创作助手
  generateWorkDescription,
  brainstormCreativeIdeas,
  
  // 交易助手
  analyzeNFTMarket,
  generateTradingAdvice,
  
  // 钱包管理助手
  explainWeb3Basics,
  generateWalletManagementAdvice,
  
  // 通用助手
  handleGeneralQuery,
  
  // 工具函数
  getLatestMarketData,
  getUserWalletData
};