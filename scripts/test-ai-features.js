const axios = require('axios');

const API_BASE_URL = 'http://localhost:3001';

/**
 * 测试 AI Agent 功能
 */
async function testAIFeatures() {
  console.log('🧪 开始测试 AI Agent 功能...\n');

  try {
    // 1. 测试创作助手 - 生成作品简介
    console.log('1️⃣ 测试创作助手 - 生成作品简介');
    const descriptionResponse = await axios.post(`${API_BASE_URL}/api/ai/generate-description`, {
      workTitle: '数字艺术：未来城市',
      workType: '数字艺术',
      userInput: '一幅描绘2050年智慧城市的数字插画',
      userProfile: { experience: 'beginner', style: 'futuristic' }
    });
    
    if (descriptionResponse.data.success) {
      console.log('✅ 作品简介生成成功');
      console.log('📝 生成的简介:', descriptionResponse.data.description.substring(0, 100) + '...');
    } else {
      console.log('❌ 作品简介生成失败:', descriptionResponse.data.error);
    }
    console.log();

    // 2. 测试创作助手 - 头脑风暴
    console.log('2️⃣ 测试创作助手 - 头脑风暴');
    const brainstormResponse = await axios.post(`${API_BASE_URL}/api/ai/brainstorm`, {
      workTitle: '数字艺术：未来城市',
      currentDescription: '一幅描绘2050年智慧城市的数字插画',
      creativeGoals: '希望作品能够引发人们对未来科技的思考'
    });
    
    if (brainstormResponse.data.success) {
      console.log('✅ 头脑风暴成功');
      console.log('💡 创作建议:', brainstormResponse.data.ideas.substring(0, 100) + '...');
    } else {
      console.log('❌ 头脑风暴失败:', brainstormResponse.data.error);
    }
    console.log();

    // 3. 测试交易助手 - 市场分析
    console.log('3️⃣ 测试交易助手 - 市场分析');
    const marketResponse = await axios.get(`${API_BASE_URL}/api/ai/market-analysis`, {
      params: {
        userPreferences: JSON.stringify({
          riskLevel: 'medium',
          investmentGoal: 'long-term'
        })
      }
    });
    
    if (marketResponse.data.success) {
      console.log('✅ 市场分析成功');
      console.log('📊 市场数据:', JSON.stringify(marketResponse.data.marketData, null, 2));
      console.log('📈 分析结果:', marketResponse.data.analysis.substring(0, 100) + '...');
    } else {
      console.log('❌ 市场分析失败:', marketResponse.data.error);
    }
    console.log();

    // 4. 测试交易助手 - 个性化建议
    console.log('4️⃣ 测试交易助手 - 个性化建议');
    const tradingResponse = await axios.post(`${API_BASE_URL}/api/ai/trading-advice`, {
      walletAddress: '0x1234567890123456789012345678901234567890',
      userPreferences: {
        riskLevel: 'medium',
        investmentGoal: 'long-term'
      }
    });
    
    if (tradingResponse.data.success) {
      console.log('✅ 交易建议生成成功');
      console.log('💰 钱包数据:', JSON.stringify(tradingResponse.data.walletData, null, 2));
      console.log('💡 交易建议:', tradingResponse.data.advice.substring(0, 100) + '...');
    } else {
      console.log('❌ 交易建议生成失败:', tradingResponse.data.error);
    }
    console.log();

    // 5. 测试钱包管理助手 - Web3 教育
    console.log('5️⃣ 测试钱包管理助手 - Web3 教育');
    const educationResponse = await axios.post(`${API_BASE_URL}/api/ai/web3-education`, {
      question: '什么是私钥？如何安全保管？',
      userLevel: 'beginner'
    });
    
    if (educationResponse.data.success) {
      console.log('✅ Web3 教育成功');
      console.log('🎓 教育内容:', educationResponse.data.explanation.substring(0, 100) + '...');
    } else {
      console.log('❌ Web3 教育失败:', educationResponse.data.error);
    }
    console.log();

    // 6. 测试钱包管理助手 - 财务管理
    console.log('6️⃣ 测试钱包管理助手 - 财务管理');
    const walletResponse = await axios.post(`${API_BASE_URL}/api/ai/wallet-management`, {
      walletAddress: '0x1234567890123456789012345678901234567890',
      userGoals: {
        securityLevel: 'high',
        profitTarget: 'moderate'
      }
    });
    
    if (walletResponse.data.success) {
      console.log('✅ 钱包管理建议成功');
      console.log('💼 管理建议:', walletResponse.data.advice.substring(0, 100) + '...');
    } else {
      console.log('❌ 钱包管理建议失败:', walletResponse.data.error);
    }
    console.log();

    // 7. 测试通用聊天
    console.log('7️⃣ 测试通用聊天');
    const chatResponse = await axios.post(`${API_BASE_URL}/api/ai/chat`, {
      query: '我是新手，如何开始在 whichWitch 平台创作？',
      userContext: {
        userLevel: 'beginner',
        interests: ['digital art', 'photography']
      }
    });
    
    if (chatResponse.data.success) {
      console.log('✅ 通用聊天成功');
      console.log('💬 AI 回复:', chatResponse.data.response.substring(0, 100) + '...');
    } else {
      console.log('❌ 通用聊天失败:', chatResponse.data.error);
    }
    console.log();

    // 8. 测试邮箱注册（钱包自动创建）
    console.log('8️⃣ 测试邮箱注册（钱包自动创建）');
    const registerResponse = await axios.post(`${API_BASE_URL}/api/auth/email-register`, {
      email: `test${Date.now()}@example.com`,
      password: 'testpassword123',
      confirmPassword: 'testpassword123'
    });
    
    if (registerResponse.data.success) {
      console.log('✅ 邮箱注册成功');
      console.log('👤 用户信息:', JSON.stringify(registerResponse.data.user, null, 2));
      console.log('💰 钱包信息:', JSON.stringify(registerResponse.data.wallet, null, 2));
      console.log('🔒 安全建议数量:', registerResponse.data.securityAdvice.securityTips.length);
    } else {
      console.log('❌ 邮箱注册失败:', registerResponse.data.error);
    }
    console.log();

    console.log('🎉 所有 AI Agent 功能测试完成！');

  } catch (error) {
    console.error('❌ 测试过程中发生错误:', error.message);
    
    if (error.response) {
      console.error('响应状态:', error.response.status);
      console.error('响应数据:', error.response.data);
    }
    
    if (error.code === 'ECONNREFUSED') {
      console.error('\n💡 提示: 请确保后端服务器正在运行');
      console.error('启动命令: npm run start:api 或 npm run dev:full');
    }
  }
}

// 运行测试
testAIFeatures();