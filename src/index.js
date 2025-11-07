#!/usr/bin/env node

import { TransactionAnalyzer } from './transaction-analyzer.js';
import { CsvExporter } from './csv-exporter.js';
import { config } from './config.js';

/**
 * 主函数
 */
async function main() {
  console.log('='.repeat(80));
  console.log('Solana 钱包交易监控工具');
  console.log('='.repeat(80));
  console.log();
  console.log('目标钱包:', config.targetWallet);
  console.log('输出目录:', config.outputDir);
  console.log('Solana RPC:', config.solanaRpcUrl);
  console.log('Birdeye API:', config.birdeyeApiKey ? '已配置 ✅' : '未配置 ⚠️  (可选)');
  console.log();

  // 创建分析器和导出器
  const analyzer = new TransactionAnalyzer();
  const exporter = new CsvExporter();

  try {
    // 分析钱包交易
    const results = await analyzer.analyzeWalletTransactions(
      config.targetWallet,
      1000 // 最多获取1000笔交易
    );

    // 导出数据
    console.log('\n开始导出数据...');
    console.log('='.repeat(80));

    let exportCount = 0;

    for (const [tokenMint, analysis] of Object.entries(results)) {
      if (analysis && analysis.dataRows && analysis.dataRows.length > 0) {
        try {
          exporter.exportTokenData(
            tokenMint,
            analysis.dataRows,
            analysis.profitPercent
          );
          exportCount++;
        } catch (error) {
          console.error(`导出代币 ${tokenMint} 数据失败:`, error.message);
        }
      }
    }

    // 导出摘要
    const summary = {
      wallet: config.targetWallet,
      timestamp: new Date().toISOString(),
      totalTokens: Object.keys(results).length,
      exportedFiles: exportCount,
      tokens: Object.entries(results).map(([mint, analysis]) => ({
        mint: mint,
        totalBuys: analysis?.totalBuys || 0,
        totalSells: analysis?.totalSells || 0,
        profitPercent: analysis?.profitPercent || 0
      }))
    };

    exporter.exportSummary(summary);

    console.log('\n✅ 完成!');
    console.log(`   导出了 ${exportCount} 个代币的数据`);
    console.log(`   输出目录: ${config.outputDir}`);

  } catch (error) {
    console.error('\n❌ 错误:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// 运行主函数
main().catch(error => {
  console.error('致命错误:', error);
  process.exit(1);
});
