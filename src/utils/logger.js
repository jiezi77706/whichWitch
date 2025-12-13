/**
 * 生产环境安全日志工具
 * 在生产环境中禁用console输出，使用结构化日志
 */

const isProduction = process.env.NODE_ENV === 'production';

class Logger {
  static log(...args) {
    if (!isProduction) {
      console.log(...args);
    }
  }

  static error(...args) {
    if (!isProduction) {
      console.error(...args);
    } else {
      // 生产环境中可以发送到日志服务
      // 例如: sendToLogService('error', args);
    }
  }

  static warn(...args) {
    if (!isProduction) {
      console.warn(...args);
    }
  }

  static info(...args) {
    if (!isProduction) {
      console.info(...args);
    }
  }
}

module.exports = Logger;