import fs from 'fs';
import path from 'path';
import { config } from './config.js';

export class CsvExporter {
  constructor() {
    this.outputDir = config.outputDir;
    this.ensureOutputDir();
  }

  /**
   * 确保输出目录存在
   */
  ensureOutputDir() {
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }
  }

  /**
   * 导出代币交易数据到CSV
   * @param {string} tokenAddress - 代币地址
   * @param {Array} data - 交易数据
   * @param {number} profitPercent - 盈亏百分比
   */
  exportTokenData(tokenAddress, data, profitPercent) {
    const sign = profitPercent >= 0 ? '+' : '';
    const filename = `${tokenAddress.substring(0, 10)}...${tokenAddress.substring(tokenAddress.length - 8)}(${sign}${profitPercent.toFixed(2)}%).csv`;
    const filepath = path.join(this.outputDir, filename);

    // CSV 表头
    const headers = [
      '序号',
      'Slot(区块号)',
      '时间戳',
      '交易类型',
      '交易地址',
      '交易数量(SOL)',
      '封盘价',
      '盈亏率(%)',
      '成交量',
      '时间差(秒)',
      '涨跌趋势(%)',
      '买单笔数',
      '买单金额',
      '卖单笔数',
      '卖单金额',
      '持币地址',
      '净买入'
    ];

    // 构建CSV内容
    let csvContent = headers.join(',') + '\n';

    data.forEach(row => {
      const values = [
        row.index || '',
        row.slot || '',
        row.timestamp || '',
        row.type || '',
        row.address || '',
        row.amount || '',
        row.closePrice || '',
        row.profitLoss || '',
        row.volume || '',
        row.timeDiff || '',
        row.priceChange || '',
        row.buyCount || '',
        row.buyAmount || '',
        row.sellCount || '',
        row.sellAmount || '',
        row.holderCount || '',
        row.netBuy || ''
      ];

      csvContent += values.map(v => this.escapeCsvValue(v)).join(',') + '\n';
    });

    // 写入文件
    fs.writeFileSync(filepath, csvContent, 'utf8');
    console.log(`✅ 已导出: ${filepath}`);

    return filepath;
  }

  /**
   * 转义CSV值
   * @param {any} value - 值
   * @returns {string} 转义后的值
   */
  escapeCsvValue(value) {
    if (value === null || value === undefined) {
      return '';
    }

    const stringValue = String(value);

    // 如果包含逗号、引号或换行符，需要用引号包裹并转义引号
    if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
      return `"${stringValue.replace(/"/g, '""')}"`;
    }

    return stringValue;
  }

  /**
   * 导出交易摘要
   * @param {Object} summary - 摘要数据
   */
  exportSummary(summary) {
    const filepath = path.join(this.outputDir, 'summary.json');
    fs.writeFileSync(filepath, JSON.stringify(summary, null, 2), 'utf8');
    console.log(`✅ 已导出摘要: ${filepath}`);
    return filepath;
  }

  /**
   * 导出原始交易数据（调试用）
   * @param {string} walletAddress - 钱包地址
   * @param {Array} transactions - 交易数据
   */
  exportRawTransactions(walletAddress, transactions) {
    const filename = `${walletAddress}_raw_transactions.json`;
    const filepath = path.join(this.outputDir, filename);
    fs.writeFileSync(filepath, JSON.stringify(transactions, null, 2), 'utf8');
    console.log(`✅ 已导出原始数据: ${filepath}`);
    return filepath;
  }
}
