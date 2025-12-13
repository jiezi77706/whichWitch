#!/usr/bin/env node

/**
 * 部署前安全检查脚本
 * 检查代码中是否存在安全问题
 */

const fs = require('fs');
const path = require('path');

const SECURITY_PATTERNS = [
  {
    pattern: /sk-[a-zA-Z0-9]{32,}/g,
    description: 'API密钥泄露',
    severity: 'HIGH'
  },
  {
    pattern: /(password|secret|key|token)\s*[:=]\s*['"][^'"]{20,}['"]/gi,
    description: '硬编码敏感信息',
    severity: 'HIGH'
  },
  {
    pattern: /console\.(log|error|warn|info)\(/g,
    description: '生产环境console输出',
    severity: 'MEDIUM'
  },
  {
    pattern: /debugger;/g,
    description: 'debugger语句',
    severity: 'MEDIUM'
  }
];

const EXCLUDE_DIRS = ['node_modules', '.git', '.next', 'dist', 'build'];
const EXCLUDE_FILES = ['.env.example', 'pre-deploy-check.js'];

function scanFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const issues = [];
  
  SECURITY_PATTERNS.forEach(({ pattern, description, severity }) => {
    const matches = content.match(pattern);
    if (matches) {
      issues.push({
        file: filePath,
        description,
        severity,
        matches: matches.slice(0, 3) // 只显示前3个匹配
      });
    }
  });
  
  return issues;
}

function scanDirectory(dir) {
  let allIssues = [];
  
  const items = fs.readdirSync(dir);
  
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory() && !EXCLUDE_DIRS.includes(item)) {
      allIssues = allIssues.concat(scanDirectory(fullPath));
    } else if (stat.isFile() && !EXCLUDE_FILES.includes(item)) {
      const ext = path.extname(item);
      if (['.js', '.ts', '.tsx', '.jsx', '.json', '.md'].includes(ext)) {
        allIssues = allIssues.concat(scanFile(fullPath));
      }
    }
  }
  
  return allIssues;
}

function main() {
  console.log('🔍 开始部署前安全检查...\n');
  
  const issues = scanDirectory('.');
  
  if (issues.length === 0) {
    console.log('✅ 未发现安全问题，可以安全部署！');
    process.exit(0);
  }
  
  console.log(`❌ 发现 ${issues.length} 个安全问题:\n`);
  
  const highSeverityIssues = issues.filter(issue => issue.severity === 'HIGH');
  const mediumSeverityIssues = issues.filter(issue => issue.severity === 'MEDIUM');
  
  if (highSeverityIssues.length > 0) {
    console.log('🚨 高危问题 (必须修复):');
    highSeverityIssues.forEach(issue => {
      console.log(`   📁 ${issue.file}`);
      console.log(`   ⚠️  ${issue.description}`);
      console.log(`   🔍 匹配: ${issue.matches.join(', ')}\n`);
    });
  }
  
  if (mediumSeverityIssues.length > 0) {
    console.log('⚠️  中等问题 (建议修复):');
    mediumSeverityIssues.forEach(issue => {
      console.log(`   📁 ${issue.file}`);
      console.log(`   ⚠️  ${issue.description}`);
      console.log(`   🔍 匹配: ${issue.matches.join(', ')}\n`);
    });
  }
  
  if (highSeverityIssues.length > 0) {
    console.log('❌ 存在高危安全问题，请修复后再部署！');
    process.exit(1);
  } else {
    console.log('⚠️  存在中等安全问题，建议修复后部署');
    process.exit(0);
  }
}

main();