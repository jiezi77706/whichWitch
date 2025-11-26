#!/bin/bash

# WhichWitch Vercel 部署脚本
echo "🚀 准备部署 WhichWitch 到 Vercel..."

# 检查是否有未提交的更改
if [[ -n $(git status -s) ]]; then
    echo "📝 发现未提交的更改，正在提交..."
    git add .
    git commit -m "Deploy: $(date '+%Y-%m-%d %H:%M:%S')"
else
    echo "✅ 没有未提交的更改"
fi

# 推送到 GitHub
echo "📤 推送到 GitHub..."
git push origin main

echo "✅ 代码已推送到 GitHub"
echo ""
echo "🌐 下一步："
echo "1. 访问 https://vercel.com"
echo "2. 使用 GitHub 登录"
echo "3. 点击 'New Project'"
echo "4. 选择 whichWitch 仓库"
echo "5. 配置环境变量（参考 Vercel部署指南.md）"
echo "6. 点击 Deploy"
echo ""
echo "📖 详细步骤请查看 Vercel部署指南.md"