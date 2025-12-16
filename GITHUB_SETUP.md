# GitHub 推送指南

## 🚀 推送到 GitHub 的步骤

### 1. 检查当前状态
```bash
# 查看当前分支和状态
git status

# 查看所有文件
git ls-files
```

### 2. 添加所有新文件
```bash
# 添加所有新文件到暂存区
git add .

# 或者选择性添加
git add src/contracts/
git add CHANGELOG.md
git add LICENSE
git add README.md
```

### 3. 提交更改
```bash
# 提交更改
git commit -m "feat: v2.0 - NFT integration and cross-chain support

- Add complete NFT system (mint, trade, instant royalties)
- Implement cross-chain payment via ZetaChain
- Enhance smart contract architecture (6 contracts)
- Optimize fee structure (2.5% NFT trading, 3.5% withdrawal)
- Add comprehensive deployment scripts and documentation"
```

### 4. 设置远程仓库 (如果还没有)
```bash
# 添加 GitHub 远程仓库
git remote add origin https://github.com/jiezi77706/whichWitch.git

# 或者如果已经存在，更新 URL
git remote set-url origin https://github.com/jiezi77706/whichWitch.git
```

### 5. 创建并推送到 v2 分支
```bash
# 创建并切换到 v2 分支
git checkout -b v2

# 推送到 v2 分支
git push -u origin v2
```

## 📋 推送前检查清单

### ✅ 文件检查
- [ ] 所有敏感信息已从代码中移除
- [ ] `.env.local` 和 `.env` 文件已在 `.gitignore` 中
- [ ] 合约代码已完成并测试
- [ ] README.md 已更新到最新版本
- [ ] CHANGELOG.md 已记录所有更改

### ✅ 代码质量
- [ ] 所有合约编译通过
- [ ] 部署脚本可以正常运行
- [ ] 文档完整且准确
- [ ] 没有调试代码或临时文件

### ✅ 安全检查
- [ ] 私钥和 API 密钥不在代码中
- [ ] 合约地址使用占位符
- [ ] 敏感配置在环境变量中

## 🔧 如果遇到问题

### 问题1: 推送被拒绝
```bash
# 如果远程有更新，先拉取
git pull origin main --rebase

# 然后再推送
git push origin main
```

### 问题2: 文件太大
```bash
# 检查大文件
git ls-files | xargs ls -lh | sort -k5 -hr | head -10

# 移除大文件并添加到 .gitignore
echo "large-file.tar.gz" >> .gitignore
git rm --cached large-file.tar.gz
```

### 问题3: 合并冲突
```bash
# 查看冲突文件
git status

# 手动解决冲突后
git add .
git commit -m "resolve merge conflicts"
git push origin main
```

## 📁 推送后的项目结构

推送成功后，GitHub 上的项目结构应该是：

```
whichWitch/
├── src/
│   ├── ui/                  # 前端代码
│   ├── backend/             # 后端和数据库
│   └── contracts/           # 智能合约 (v2.0)
│       ├── src/             # 合约源码
│       ├── deploy/          # 部署脚本
│       └── README.md        # 合约文档
├── .env.example             # 环境变量模板
├── .gitignore              # Git 忽略文件
├── CHANGELOG.md            # 版本更新日志
├── LICENSE                 # MIT 许可证
├── README.md               # 项目主文档
└── package.json            # 项目配置
```

## 🎉 推送成功后

1. **检查 GitHub 页面**: 确保所有文件都正确上传
2. **更新项目描述**: 在 GitHub 项目设置中添加描述和标签
3. **设置 GitHub Pages**: 如果需要展示文档
4. **创建 Release**: 为 v2.0 创建正式发布版本
5. **更新 README 链接**: 确保所有链接指向正确的 GitHub 地址

## 🏷️ 建议的 GitHub 项目设置

### 项目描述
```
On-chain creation platform with NFT integration and cross-chain support. Automatic revenue sharing for derivative works.
```

### 标签 (Topics)
```
blockchain, nft, ethereum, solidity, nextjs, web3, creator-economy, royalties, cross-chain, zetachain
```

### 分支保护
建议为 `main` 分支设置保护规则：
- 要求 PR 审查
- 要求状态检查通过
- 限制推送到主分支

---

**准备好了吗？运行上面的命令开始推送到 GitHub！** 🚀