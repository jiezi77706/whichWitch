// API 响应类型定义
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// AI API 响应类型
export interface AIResponse extends ApiResponse {
  response?: string;
  ideas?: string[];
  description?: string;
  analysis?: any;
  advice?: string;
  walletData?: any;
  marketData?: any;
  explanation?: string;
  usage?: any;
}

// 市场 API 响应类型
export interface MarketplaceResponse extends ApiResponse {
  listings?: any[];
  stats?: any;
}

// 认证 API 响应类型
export interface AuthResponse extends ApiResponse {
  user?: any;
  token?: string;
}

// 扩展 Axios 模块
declare module 'axios' {
  export interface AxiosResponse<T = any> extends ApiResponse<T> {}
}