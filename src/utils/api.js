/**
 * API 客户端工具
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

class ApiClient {
  constructor(baseURL = API_BASE_URL) {
    this.baseURL = baseURL;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
    };
  }

  /**
   * 发送 HTTP 请求
   */
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: { ...this.defaultHeaders, ...options.headers },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      return data;
    } catch (error) {
      console.error(`API 请求失败 [${options.method || 'GET'}] ${endpoint}:`, error);
      throw error;
    }
  }

  /**
   * GET 请求
   */
  async get(endpoint, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `${endpoint}?${queryString}` : endpoint;
    
    return this.request(url, { method: 'GET' });
  }

  /**
   * POST 请求
   */
  async post(endpoint, data = {}) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  /**
   * PUT 请求
   */
  async put(endpoint, data = {}) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  /**
   * DELETE 请求
   */
  async delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  }

  // ==================== 区块链 API ====================

  /**
   * 获取网络状态
   */
  async getNetworkStatus() {
    return this.get('/api/blockchain/network/status');
  }

  /**
   * 创建作品
   */
  async createWork(workData) {
    return this.post('/api/blockchain/works', workData);
  }

  /**
   * 获取作品信息
   */
  async getWork(workId) {
    return this.get(`/api/blockchain/works/${workId}`);
  }

  /**
   * 获取用户作品列表
   */
  async getUserWorks(address) {
    return this.get(`/api/blockchain/users/${address}/works`);
  }

  /**
   * 铸造 NFT
   */
  async mintNFT(mintData) {
    return this.post('/api/blockchain/nfts/mint', mintData);
  }

  /**
   * 获取 NFT 信息
   */
  async getNFT(tokenId) {
    return this.get(`/api/blockchain/nfts/${tokenId}`);
  }

  /**
   * 上架 NFT
   */
  async listNFT(listingData) {
    return this.post('/api/blockchain/marketplace/list', listingData);
  }

  /**
   * 购买 NFT
   */
  async buyNFT(purchaseData) {
    return this.post('/api/blockchain/marketplace/buy', purchaseData);
  }

  /**
   * 获取市场上架列表
   */
  async getMarketplaceListings() {
    return this.get('/api/blockchain/marketplace/listings');
  }

  /**
   * 处理支付
   */
  async processPayment(paymentData) {
    return this.post('/api/blockchain/payments/process', paymentData);
  }

  /**
   * 获取交易状态
   */
  async getTransactionStatus(txHash) {
    return this.get(`/api/blockchain/transactions/${txHash}`);
  }

  /**
   * 获取账户余额
   */
  async getAccountBalance(address) {
    return this.get(`/api/blockchain/accounts/${address}/balance`);
  }

  // ==================== AI API ====================

  /**
   * AI 通用查询
   */
  async aiChat(queryData) {
    return this.post('/api/ai/chat', queryData);
  }

  /**
   * 创作助手 - 生成作品简介
   */
  async generateWorkDescription(workData) {
    return this.post('/api/ai/generate-description', workData);
  }

  /**
   * 创作助手 - 头脑风暴
   */
  async brainstormIdeas(ideaData) {
    return this.post('/api/ai/brainstorm', ideaData);
  }

  /**
   * 交易助手 - 市场分析
   */
  async getMarketAnalysis(preferences = {}) {
    return this.get('/api/ai/market-analysis', { userPreferences: JSON.stringify(preferences) });
  }

  /**
   * 交易助手 - 个性化交易建议
   */
  async getTradingAdvice(tradingData) {
    return this.post('/api/ai/trading-advice', tradingData);
  }

  /**
   * 钱包管理助手 - Web3 教育
   */
  async getWeb3Education(educationData) {
    return this.post('/api/ai/web3-education', educationData);
  }

  /**
   * 钱包管理助手 - 财务管理建议
   */
  async getWalletManagement(walletData) {
    return this.post('/api/ai/wallet-management', walletData);
  }

  /**
   * 获取市场数据
   */
  async getMarketData() {
    return this.get('/api/ai/market-data');
  }

  // ==================== 认证 API ====================

  /**
   * 邮箱注册（自动创建钱包）
   */
  async emailRegister(registerData) {
    return this.post('/api/auth/email-register', registerData);
  }

  /**
   * 邮箱登录
   */
  async emailLogin(loginData) {
    return this.post('/api/auth/email-login', loginData);
  }

  /**
   * 钱包登录
   */
  async walletLogin(loginData) {
    return this.post('/api/auth/wallet-login', loginData);
  }

  /**
   * 获取当前用户信息
   */
  async getCurrentUser() {
    return this.get('/api/auth/me');
  }

  /**
   * 获取钱包安全建议
   */
  async getWalletSecurity() {
    return this.get('/api/auth/wallet-security');
  }

  /**
   * 重置密码
   */
  async resetPassword(resetData) {
    return this.post('/api/auth/reset-password', resetData);
  }

  // ==================== 健康检查 ====================

  /**
   * 健康检查
   */
  async healthCheck() {
    return this.get('/api/health');
  }
}

// 创建默认实例
const apiClient = new ApiClient();

// 导出具体的 API 方法
export const blockchainAPI = {
  getNetworkStatus: () => apiClient.getNetworkStatus(),
  createWork: (data) => apiClient.createWork(data),
  getWork: (workId) => apiClient.getWork(workId),
  getUserWorks: (address) => apiClient.getUserWorks(address),
  mintNFT: (data) => apiClient.mintNFT(data),
  getNFT: (tokenId) => apiClient.getNFT(tokenId),
  listNFT: (data) => apiClient.listNFT(data),
  buyNFT: (data) => apiClient.buyNFT(data),
  getMarketplaceListings: () => apiClient.getMarketplaceListings(),
  processPayment: (data) => apiClient.processPayment(data),
  getTransactionStatus: (txHash) => apiClient.getTransactionStatus(txHash),
  getAccountBalance: (address) => apiClient.getAccountBalance(address),
};

export const aiAPI = {
  chat: (data) => apiClient.aiChat(data),
  generateWorkDescription: (data) => apiClient.generateWorkDescription(data),
  brainstormIdeas: (data) => apiClient.brainstormIdeas(data),
  getMarketAnalysis: (preferences) => apiClient.getMarketAnalysis(preferences),
  getTradingAdvice: (data) => apiClient.getTradingAdvice(data),
  getWeb3Education: (data) => apiClient.getWeb3Education(data),
  getWalletManagement: (data) => apiClient.getWalletManagement(data),
  getMarketData: () => apiClient.getMarketData(),
};

export const authAPI = {
  emailRegister: (data) => apiClient.emailRegister(data),
  emailLogin: (data) => apiClient.emailLogin(data),
  walletLogin: (data) => apiClient.walletLogin(data),
  getCurrentUser: () => apiClient.getCurrentUser(),
  getWalletSecurity: () => apiClient.getWalletSecurity(),
  resetPassword: (data) => apiClient.resetPassword(data),
};

export const systemAPI = {
  healthCheck: () => apiClient.healthCheck(),
};

export default apiClient;