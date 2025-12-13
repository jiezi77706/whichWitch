'use client';

import React, { useState } from 'react';
import { authAPI } from '../../src/utils/api';
import { useRouter } from 'next/navigation';

export default function AuthPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('email-register');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // 邮箱注册表单
  const [registerForm, setRegisterForm] = useState({
    email: '',
    password: '',
    confirmPassword: ''
  });

  // 邮箱登录表单
  const [loginForm, setLoginForm] = useState({
    email: '',
    password: ''
  });

  // 钱包登录表单
  const [walletForm, setWalletForm] = useState({
    address: '',
    signature: '',
    message: ''
  });

  // 处理邮箱注册
  const handleEmailRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const response = await authAPI.emailRegister(registerForm);
      
      if (response.success) {
        setMessage('注册成功！钱包已自动创建。');
        
        // 显示钱包信息
        const walletInfo = `
🎉 注册成功！

📧 邮箱: ${response.user.email}
💰 钱包地址: ${response.wallet.address}
🔑 助记词: ${response.wallet.mnemonic}

⚠️ 重要提醒：
${response.securityAdvice.securityTips.join('\n')}

请妥善保管您的助记词，这是恢复钱包的唯一方式！
        `;
        
        alert(walletInfo);
        
        // 保存 token
        localStorage.setItem('whichWitch_token', response.token);
        
        // 跳转到主页
        setTimeout(() => {
          router.push('/');
        }, 2000);
      } else {
        setError(response.error || '注册失败');
      }
    } catch (error) {
      console.error('注册失败:', error);
      setError('注册失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  // 处理邮箱登录
  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const response = await authAPI.emailLogin(loginForm);
      
      if (response.success) {
        setMessage('登录成功！');
        
        // 保存 token
        localStorage.setItem('whichWitch_token', response.token);
        
        // 跳转到主页
        setTimeout(() => {
          router.push('/');
        }, 1000);
      } else {
        setError(response.error || '登录失败');
      }
    } catch (error) {
      console.error('登录失败:', error);
      setError('登录失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  // 处理钱包登录
  const handleWalletLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      // 这里应该集成 MetaMask 签名
      if (typeof window !== 'undefined' && window.ethereum) {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        const address = accounts[0];
        
        // 生成签名消息
        const message = `欢迎登录 whichWitch 平台！\n\n时间戳: ${Date.now()}`;
        
        // 请求用户签名
        const signature = await window.ethereum.request({
          method: 'personal_sign',
          params: [message, address],
        });

        const response = await authAPI.walletLogin({
          address,
          signature,
          message
        });
        
        if (response.success) {
          setMessage('钱包登录成功！');
          
          // 保存 token
          localStorage.setItem('whichWitch_token', response.token);
          
          // 跳转到主页
          setTimeout(() => {
            router.push('/');
          }, 1000);
        } else {
          setError(response.error || '钱包登录失败');
        }
      } else {
        setError('请安装 MetaMask 钱包');
      }
    } catch (error) {
      console.error('钱包登录失败:', error);
      setError('钱包登录失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'email-register', name: '邮箱注册', icon: '📧' },
    { id: 'email-login', name: '邮箱登录', icon: '🔑' },
    { id: 'wallet-login', name: '钱包登录', icon: '💰' }
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h1 className="text-center text-3xl font-extrabold text-gray-900">
            whichWitch
          </h1>
          <p className="mt-2 text-center text-sm text-gray-600">
            去中心化创作平台
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md">
          {/* 标签页导航 */}
          <div className="border-b border-gray-200">
            <nav className="flex">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 py-3 px-1 text-center border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <span className="mr-1">{tab.icon}</span>
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {/* 消息显示 */}
            {message && (
              <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
                {message}
              </div>
            )}

            {error && (
              <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                {error}
              </div>
            )}

            {/* 邮箱注册 */}
            {activeTab === 'email-register' && (
              <form onSubmit={handleEmailRegister} className="space-y-4">
                <div>
                  <h2 className="text-lg font-semibold mb-4">📧 邮箱注册</h2>
                  <p className="text-sm text-gray-600 mb-4">
                    注册后将自动为您创建专属钱包，享受完整的 Web3 创作体验。
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    邮箱地址
                  </label>
                  <input
                    type="email"
                    required
                    value={registerForm.email}
                    onChange={(e) => setRegisterForm(prev => ({
                      ...prev,
                      email: e.target.value
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="输入您的邮箱地址"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    密码
                  </label>
                  <input
                    type="password"
                    required
                    minLength={8}
                    value={registerForm.password}
                    onChange={(e) => setRegisterForm(prev => ({
                      ...prev,
                      password: e.target.value
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="至少8位密码"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    确认密码
                  </label>
                  <input
                    type="password"
                    required
                    value={registerForm.confirmPassword}
                    onChange={(e) => setRegisterForm(prev => ({
                      ...prev,
                      confirmPassword: e.target.value
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="再次输入密码"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 disabled:opacity-50"
                >
                  {loading ? '注册中...' : '注册并创建钱包'}
                </button>

                <div className="text-xs text-gray-500">
                  <p>注册即表示您同意我们的服务条款和隐私政策</p>
                  <p>钱包将使用您的密码进行加密保护</p>
                </div>
              </form>
            )}

            {/* 邮箱登录 */}
            {activeTab === 'email-login' && (
              <form onSubmit={handleEmailLogin} className="space-y-4">
                <div>
                  <h2 className="text-lg font-semibold mb-4">🔑 邮箱登录</h2>
                  <p className="text-sm text-gray-600 mb-4">
                    使用您的邮箱和密码登录，自动连接您的专属钱包。
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    邮箱地址
                  </label>
                  <input
                    type="email"
                    required
                    value={loginForm.email}
                    onChange={(e) => setLoginForm(prev => ({
                      ...prev,
                      email: e.target.value
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="输入您的邮箱地址"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    密码
                  </label>
                  <input
                    type="password"
                    required
                    value={loginForm.password}
                    onChange={(e) => setLoginForm(prev => ({
                      ...prev,
                      password: e.target.value
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="输入您的密码"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-600 disabled:opacity-50"
                >
                  {loading ? '登录中...' : '登录'}
                </button>

                <div className="text-center">
                  <button
                    type="button"
                    className="text-sm text-blue-500 hover:text-blue-700"
                    onClick={() => setActiveTab('email-register')}
                  >
                    还没有账户？立即注册
                  </button>
                </div>
              </form>
            )}

            {/* 钱包登录 */}
            {activeTab === 'wallet-login' && (
              <form onSubmit={handleWalletLogin} className="space-y-4">
                <div>
                  <h2 className="text-lg font-semibold mb-4">💰 钱包登录</h2>
                  <p className="text-sm text-gray-600 mb-4">
                    使用 MetaMask 等钱包直接登录，无需注册。
                  </p>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-medium text-blue-800 mb-2">连接步骤：</h3>
                  <ol className="text-sm text-blue-700 space-y-1">
                    <li>1. 确保已安装 MetaMask 钱包</li>
                    <li>2. 切换到 ZetaChain 测试网</li>
                    <li>3. 点击下方按钮连接钱包</li>
                    <li>4. 在钱包中确认签名</li>
                  </ol>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-orange-500 text-white py-2 px-4 rounded-md hover:bg-orange-600 disabled:opacity-50"
                >
                  {loading ? '连接中...' : '连接 MetaMask 钱包'}
                </button>

                <div className="text-center">
                  <button
                    type="button"
                    className="text-sm text-blue-500 hover:text-blue-700"
                    onClick={() => setActiveTab('email-register')}
                  >
                    没有钱包？使用邮箱注册
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        <div className="text-center text-sm text-gray-500">
          <p>© 2024 whichWitch. 去中心化创作平台</p>
        </div>
      </div>
    </div>
  );
}