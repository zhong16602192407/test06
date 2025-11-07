#!/usr/bin/env node

import { TransactionAnalyzer } from './transaction-analyzer.js';
import { CsvExporter } from './csv-exporter.js';
import { SolanaClient } from './solana-client.js';
import { config } from './config.js';

/**
 * 实时监控模式
 */
class WalletMonitor {
  constructor() {
    this.analyzer = new TransactionAnalyzer();
    this.exporter = new CsvExporter();
    this.solanaClient = new SolanaClient();
    this.lastSignature = null;
    this.isRunning = false;
  }

  /**
   * 开始监控
   * @param {string} walletAddress - 钱包地址
   * @param {number} interval - 轮询间隔（毫秒）
   */
  async start(walletAddress, interval = 10000) {
    console.log('='.repeat(80));
    console.log('实时监控模式');
    console.log('='.repeat(80));
    console.log();
    console.log('监控地址:', walletAddress);
    console.log('轮询间隔:', interval / 1000, '秒');
    console.log('按 Ctrl+C 停止监控');
    console.log();

    this.isRunning = true;

    // 设置中断处理
    process.on('SIGINT', () => {
      console.log('\n\n停止监控...');
      this.isRunning = false;
      process.exit(0);
    });

    // 初始化：获取最新交易签名
    const signatures = await this.solanaClient.getSignaturesForAddress(walletAddress, 1);
    if (signatures.length > 0) {
      this.lastSignature = signatures[0].signature;
      console.log(`初始化完成，最新交易: ${this.lastSignature.substring(0, 20)}...`);
    }

    // 开始轮询
    while (this.isRunning) {
      await this.checkNewTransactions(walletAddress);
      await this.sleep(interval);
    }
  }

  /**
   * 检查新交易
   * @param {string} walletAddress - 钱包地址
   */
  async checkNewTransactions(walletAddress) {
    try {
      const signatures = await this.solanaClient.getSignaturesForAddress(walletAddress, 10);

      if (signatures.length === 0) {
        return;
      }

      // 查找新交易
      const newTransactions = [];
      for (const sig of signatures) {
        if (sig.signature === this.lastSignature) {
          break;
        }
        newTransactions.push(sig);
      }

      if (newTransactions.length === 0) {
        process.stdout.write('.');
        return;
      }

      // 更新最新签名
      this.lastSignature = newTransactions[0].signature;

      console.log(`\n\n🔔 发现 ${newTransactions.length} 笔新交易!`);
      console.log('时间:', new Date().toISOString());
      console.log('-'.repeat(80));

      // 获取交易详情
      for (const sig of newTransactions.reverse()) {
        const tx = await this.solanaClient.getTransaction(sig.signature);
        if (tx) {
          await this.processNewTransaction(sig, tx, walletAddress);
        }
        await this.sleep(1000);
      }

    } catch (error) {
      console.error('\n检查交易时出错:', error.message);
    }
  }

  /**
   * 处理新交易
   * @param {Object} signature - 交易签名信息
   * @param {Object} transaction - 交易详情
   * @param {string} walletAddress - 钱包地址
   */
  async processNewTransaction(signature, transaction, walletAddress) {
    const transfers = this.solanaClient.parseTokenTransfers(transaction);

    console.log(`\n交易签名: ${signature.signature.substring(0, 20)}...`);
    console.log(`区块: ${signature.slot}`);
    console.log(`时间: ${new Date(signature.blockTime * 1000).toISOString()}`);

    if (transfers.length === 0) {
      console.log('类型: 非代币交易（可能是SOL转账或其他操作）');
      return;
    }

    transfers.forEach(transfer => {
      if (transfer.owner === walletAddress) {
        console.log(`\n代币: ${transfer.mint}`);
        console.log(`类型: ${transfer.type === 'Buy' ? '🟢 买入' : '🔴 卖出'}`);
        console.log(`数量: ${transfer.amount}`);
      }
    });

    // 可以在这里添加自动导出逻辑
  }

  /**
   * 延迟函数
   * @param {number} ms - 毫秒
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

/**
 * 主函数
 */
async function main() {
  const walletAddress = process.argv[2] || config.targetWallet;

  if (!walletAddress) {
    console.error('错误: 请提供钱包地址');
    console.error('用法: npm run monitor [钱包地址]');
    process.exit(1);
  }

  const monitor = new WalletMonitor();
  await monitor.start(walletAddress, 10000); // 每10秒检查一次
}

// 运行主函数
main().catch(error => {
  console.error('致命错误:', error);
  process.exit(1);
});
