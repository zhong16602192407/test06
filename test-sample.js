#!/usr/bin/env node

/**
 * 创建模拟数据来展示程序输出格式
 * 用于在没有网络连接时演示功能
 */

import fs from 'fs';
import path from 'path';

console.log('🔍 创建示例数据来演示程序功能...\n');

// 模拟交易数据
const mockTokenAddress = '6TqkYbXN3H7bYZ4YmQGxdL8kLjDc5fPWJGhR9Fp3pump';
const mockTransactions = [
  {
    index: 1,
    slot: 280123456,
    timestamp: '2024-11-06T10:15:30Z',
    type: 'Buy',
    address: 'txAbc123...',
    amount: '0.500000',
    closePrice: 0.000015,
    profitLoss: '0.00',
    volume: 125.5,
    timeDiff: 0,
    priceChange: '0.00',
    buyCount: 1,
    buyAmount: '0.500000',
    sellCount: 0,
    sellAmount: 0,
    holderCount: 245,
    netBuy: '0.500000'
  },
  {
    index: 2,
    slot: 280123458,
    timestamp: '2024-11-06T10:15:35Z',
    type: 'Buy',
    address: 'txDef456...',
    amount: '1.200000',
    closePrice: 0.000018,
    profitLoss: '20.00',
    volume: 234.8,
    timeDiff: 5,
    priceChange: '20.00',
    buyCount: 2,
    buyAmount: '1.200000',
    sellCount: 0,
    sellAmount: 0,
    holderCount: 256,
    netBuy: '1.200000'
  },
  {
    index: 3,
    slot: 280123465,
    timestamp: '2024-11-06T10:16:10Z',
    type: 'Buy',
    address: 'txGhi789...',
    amount: '0.800000',
    closePrice: 0.000022,
    profitLoss: '46.67',
    volume: 456.2,
    timeDiff: 35,
    priceChange: '22.22',
    buyCount: 3,
    buyAmount: '2.500000',
    sellCount: 0,
    sellAmount: 0,
    holderCount: 289,
    netBuy: '2.500000'
  },
  {
    index: 4,
    slot: 280123480,
    timestamp: '2024-11-06T10:18:45Z',
    type: 'Sell',
    address: 'txJkl012...',
    amount: '1.000000',
    closePrice: 0.000019,
    profitLoss: '26.67',
    volume: 312.5,
    timeDiff: 155,
    priceChange: '-13.64',
    buyCount: 1,
    buyAmount: '0.300000',
    sellCount: 1,
    sellAmount: '1.000000',
    holderCount: 278,
    netBuy: '-0.700000'
  },
  {
    index: 5,
    slot: 280123495,
    timestamp: '2024-11-06T10:20:20Z',
    type: 'Sell',
    address: 'txMno345...',
    amount: '1.500000',
    closePrice: 0.000021,
    profitLoss: '40.00',
    volume: 567.8,
    timeDiff: 95,
    priceChange: '10.53',
    buyCount: 2,
    buyAmount: '0.800000',
    sellCount: 2,
    sellAmount: '2.500000',
    holderCount: 265,
    netBuy: '-1.700000'
  }
];

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

// 构建 CSV 内容
let csvContent = headers.join(',') + '\n';

mockTransactions.forEach(row => {
  const values = [
    row.index,
    row.slot,
    row.timestamp,
    row.type,
    row.address,
    row.amount,
    row.closePrice,
    row.profitLoss,
    row.volume,
    row.timeDiff,
    row.priceChange,
    row.buyCount,
    row.buyAmount,
    row.sellCount,
    row.sellAmount,
    row.holderCount,
    row.netBuy
  ];
  csvContent += values.join(',') + '\n';
});

// 确保输出目录存在
const outputDir = './output';
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// 保存 CSV 文件
const profitPercent = 42.5;
const filename = `${mockTokenAddress.substring(0, 10)}...${mockTokenAddress.substring(mockTokenAddress.length - 8)}(+${profitPercent.toFixed(2)}%).csv`;
const filepath = path.join(outputDir, filename);
fs.writeFileSync(filepath, csvContent, 'utf8');

console.log('✅ 示例 CSV 文件已创建:');
console.log(`   ${filepath}\n`);

// 创建摘要 JSON
const summary = {
  wallet: 'DDDD2zvzaPMLuZiC2Vos2i6TLFjJJ3bi1pN7kXQc3R5R',
  timestamp: new Date().toISOString(),
  note: '这是模拟数据，用于演示程序功能',
  totalTokens: 1,
  exportedFiles: 1,
  tokens: [
    {
      mint: mockTokenAddress,
      totalBuys: 3,
      totalSells: 2,
      profitPercent: profitPercent
    }
  ]
};

const summaryPath = path.join(outputDir, 'summary_sample.json');
fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2), 'utf8');

console.log('✅ 示例摘要文件已创建:');
console.log(`   ${summaryPath}\n`);

// 显示数据预览
console.log('📊 数据预览（前 3 行）:');
console.log('='.repeat(80));
const lines = csvContent.split('\n');
lines.slice(0, 4).forEach(line => {
  if (line) console.log(line);
});
console.log('='.repeat(80));
console.log();

// 文件统计
const stats = fs.statSync(filepath);
console.log('📁 文件信息:');
console.log(`   大小: ${stats.size} 字节`);
console.log(`   行数: ${mockTransactions.length + 1} 行（包含表头）`);
console.log(`   列数: ${headers.length} 列`);
console.log();

console.log('💡 说明:');
console.log('   这是模拟数据，展示了程序的输出格式');
console.log('   在真实环境中，程序会从 Solana 链上获取实际交易数据');
console.log('   CSV 文件可以直接在 Excel 中打开查看');
console.log();

console.log('✅ 示例文件生成完成！');
console.log('   可以查看 output/ 目录中的文件');
