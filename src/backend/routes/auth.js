const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const walletService = require('../services/walletService');
const { aiAPI } = require('../utils/api');

const router = express.Router();

// 模拟用户数据库（实际应该使用真实数据库）
const users = new Map();

/**
 * 邮箱注册 - 自动创建钱包
 * POST /api/auth/email-register
 */
router.post('/email-register', async (req, res) => {
  try {
    const { email, password, confirmPassword } = req.body;

    // 验证输入
    if (!email || !password || !confirmPassword) {
      return res.status(400).json({
        success: false,
        error: '请填写所有必填字段'
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        error: '密码确认不匹配'
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        error: '密码长度至少为8位'
      });
    }

    // 检查邮箱是否已存在
    if (users.has(email)) {
      return res.status(400).json({
        success: false,
        error: '该邮箱已被注册'
      });
    }

    // 加密密码
    const hashedPassword = await bcrypt.hash(password, 10);

    // 自动创建钱包
    console.log('为用户创建钱包:', email);
    const walletInfo = await walletService.createWalletForEmail(email, password);

    // 生成安全建议
    const securityAdvice = walletService.generateSecurityAdvice(email);
    const usageGuide = walletService.generateUsageGuide();

    // 保存用户信息
    const user = {
      id: Date.now(),
      email,
      password: hashedPassword,
      walletAddress: walletInfo.address,
      encryptedPrivateKey: walletInfo.encryptedPrivateKey,
      mnemonic: walletInfo.mnemonic,
      loginType: 'email',
      createdAt: new Date().toISOString(),
      isEmailVerified: false // 实际应该发送验证邮件
    };

    users.set(email, user);

    // 生成 JWT token
    const token = jwt.sign(
      { 
        userId: user.id, 
        email: user.email,
        walletAddress: user.walletAddress,
        loginType: 'email'
      },
      process.env.JWT_SECRET || 'whichWitch-secret',
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      message: '注册成功，钱包已自动创建',
      user: {
        id: user.id,
        email: user.email,
        walletAddress: user.walletAddress,
        loginType: user.loginType,
        createdAt: user.createdAt
      },
      wallet: {
        address: walletInfo.address,
        mnemonic: walletInfo.mnemonic, // 注意：实际生产中应该安全处理
        createdAt: walletInfo.createdAt
      },
      securityAdvice,
      usageGuide,
      token
    });

  } catch (error) {
    console.error('邮箱注册失败:', error);
    res.status(500).json({
      success: false,
      error: '注册失败: ' + error.message
    });
  }
});

/**
 * 邮箱登录
 * POST /api/auth/email-login
 */
router.post('/email-login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: '请输入邮箱和密码'
      });
    }

    // 查找用户
    const user = users.get(email);
    if (!user) {
      return res.status(401).json({
        success: false,
        error: '邮箱或密码错误'
      });
    }

    // 验证密码
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        error: '邮箱或密码错误'
      });
    }

    // 获取钱包余额
    const balance = await walletService.getWalletBalance(user.walletAddress);

    // 生成 JWT token
    const token = jwt.sign(
      { 
        userId: user.id, 
        email: user.email,
        walletAddress: user.walletAddress,
        loginType: 'email'
      },
      process.env.JWT_SECRET || 'whichWitch-secret',
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      message: '登录成功',
      user: {
        id: user.id,
        email: user.email,
        walletAddress: user.walletAddress,
        loginType: user.loginType,
        balance: balance,
        createdAt: user.createdAt
      },
      token
    });

  } catch (error) {
    console.error('邮箱登录失败:', error);
    res.status(500).json({
      success: false,
      error: '登录失败: ' + error.message
    });
  }
});

/**
 * 钱包登录
 * POST /api/auth/wallet-login
 */
router.post('/wallet-login', async (req, res) => {
  try {
    const { address, signature, message } = req.body;

    if (!address || !signature || !message) {
      return res.status(400).json({
        success: false,
        error: '缺少必要的验证信息'
      });
    }

    // 验证钱包地址格式
    if (!walletService.isValidAddress(address)) {
      return res.status(400).json({
        success: false,
        error: '无效的钱包地址'
      });
    }

    // TODO: 验证签名
    // 这里应该验证用户使用私钥对消息的签名
    
    // 获取钱包余额
    const balance = await walletService.getWalletBalance(address);

    // 查找或创建用户记录
    let user = Array.from(users.values()).find(u => u.walletAddress === address);
    
    if (!user) {
      // 创建新的钱包用户记录
      user = {
        id: Date.now(),
        email: null,
        walletAddress: address,
        loginType: 'wallet',
        createdAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString()
      };
      
      users.set(address, user);
    } else {
      user.lastLoginAt = new Date().toISOString();
    }

    // 生成 JWT token
    const token = jwt.sign(
      { 
        userId: user.id, 
        walletAddress: user.walletAddress,
        loginType: 'wallet'
      },
      process.env.JWT_SECRET || 'whichWitch-secret',
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      message: '钱包登录成功',
      user: {
        id: user.id,
        walletAddress: user.walletAddress,
        loginType: user.loginType,
        balance: balance,
        createdAt: user.createdAt,
        lastLoginAt: user.lastLoginAt
      },
      token
    });

  } catch (error) {
    console.error('钱包登录失败:', error);
    res.status(500).json({
      success: false,
      error: '登录失败: ' + error.message
    });
  }
});

/**
 * 获取当前用户信息
 * GET /api/auth/me
 */
router.get('/me', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        error: '未提供认证令牌'
      });
    }

    // 验证 JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'whichWitch-secret');
    
    // 查找用户
    let user;
    if (decoded.email) {
      user = users.get(decoded.email);
    } else {
      user = Array.from(users.values()).find(u => u.walletAddress === decoded.walletAddress);
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        error: '用户不存在'
      });
    }

    // 获取最新余额
    const balance = await walletService.getWalletBalance(user.walletAddress);

    res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        walletAddress: user.walletAddress,
        loginType: user.loginType,
        balance: balance,
        createdAt: user.createdAt,
        lastLoginAt: user.lastLoginAt
      }
    });

  } catch (error) {
    console.error('获取用户信息失败:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        error: '无效的认证令牌'
      });
    }

    res.status(500).json({
      success: false,
      error: '获取用户信息失败'
    });
  }
});

/**
 * 获取钱包安全建议
 * GET /api/auth/wallet-security
 */
router.get('/wallet-security', (req, res) => {
  try {
    const securityAdvice = walletService.generateSecurityAdvice('user@example.com');
    const usageGuide = walletService.generateUsageGuide();

    res.json({
      success: true,
      securityAdvice,
      usageGuide
    });
  } catch (error) {
    console.error('获取安全建议失败:', error);
    res.status(500).json({
      success: false,
      error: '获取安全建议失败'
    });
  }
});

/**
 * 重置密码（邮箱用户）
 * POST /api/auth/reset-password
 */
router.post('/reset-password', async (req, res) => {
  try {
    const { email, oldPassword, newPassword } = req.body;

    if (!email || !oldPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        error: '请填写所有必填字段'
      });
    }

    const user = users.get(email);
    if (!user || user.loginType !== 'email') {
      return res.status(404).json({
        success: false,
        error: '用户不存在或不是邮箱用户'
      });
    }

    // 验证旧密码
    const isOldPasswordValid = await bcrypt.compare(oldPassword, user.password);
    if (!isOldPasswordValid) {
      return res.status(401).json({
        success: false,
        error: '旧密码错误'
      });
    }

    // 加密新密码
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    
    // 重新加密私钥
    const decryptedPrivateKey = await walletService.decryptPrivateKey(
      user.encryptedPrivateKey, 
      oldPassword
    );
    const newEncryptedPrivateKey = await walletService.encryptPrivateKey(
      decryptedPrivateKey, 
      newPassword
    );

    // 更新用户信息
    user.password = hashedNewPassword;
    user.encryptedPrivateKey = newEncryptedPrivateKey;
    user.updatedAt = new Date().toISOString();

    res.json({
      success: true,
      message: '密码重置成功'
    });

  } catch (error) {
    console.error('重置密码失败:', error);
    res.status(500).json({
      success: false,
      error: '重置密码失败: ' + error.message
    });
  }
});

module.exports = router;