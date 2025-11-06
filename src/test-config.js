#!/usr/bin/env node

import { Connection, PublicKey } from '@solana/web3.js';
import { config } from './config.js';

/**
 * 测试配置是否正确
 */
async function testConfig() {
  console.log('🔍 测试配置...\n');

  // 测试 1: 检查环境变量
  console.log('1️⃣  检查配置:');
  console.log(`   Solana RPC: ${config.solanaRpcUrl}`);
  console.log(`   目标钱包: ${config.targetWallet}`);
  console.log(`   输出目录: ${config.outputDir}`);
  console.log(`   Birdeye API: ${config.birdeyeApiKey ? '✅ 已配置' : '⚠️  未配置（可选）'}\n`);

  // 测试 2: 检查 RPC 连接
  console.log('2️⃣  测试 Solana RPC 连接...');
  try {
    const connection = new Connection(config.solanaRpcUrl, 'confirmed');

    // 获取版本信息
    const version = await connection.getVersion();
    console.log(`   ✅ 连接成功！`);
    console.log(`   Solana 版本: ${version['solana-core']}`);

    // 获取当前 slot
    const slot = await connection.getSlot();
    console.log(`   当前 Slot: ${slot}\n`);
  } catch (error) {
    console.error(`   ❌ 连接失败: ${error.message}`);
    console.error('\n请检查：');
    console.error('   1. SOLANA_RPC_URL 是否配置正确');
    console.error('   2. Helius API Key 是否有效');
    console.error('   3. 网络连接是否正常\n');
    process.exit(1);
  }

  // 测试 3: 验证钱包地址
  console.log('3️⃣  验证目标钱包地址...');
  try {
    const pubKey = new PublicKey(config.targetWallet);
    console.log(`   ✅ 地址格式正确`);
    console.log(`   地址: ${pubKey.toBase58()}\n`);
  } catch (error) {
    console.error(`   ❌ 地址格式错误: ${error.message}\n`);
    process.exit(1);
  }

  // 测试 4: 获取钱包信息
  console.log('4️⃣  获取钱包信息...');
  try {
    const connection = new Connection(config.solanaRpcUrl, 'confirmed');
    const pubKey = new PublicKey(config.targetWallet);

    // 获取余额
    const balance = await connection.getBalance(pubKey);
    console.log(`   SOL 余额: ${balance / 1e9} SOL`);

    // 获取最近的交易签名
    const signatures = await connection.getSignaturesForAddress(pubKey, { limit: 5 });
    console.log(`   最近交易数: ${signatures.length} 笔`);

    if (signatures.length > 0) {
      console.log(`   最新交易: ${signatures[0].signature.substring(0, 20)}...`);
      const txTime = new Date(signatures[0].blockTime * 1000);
      console.log(`   交易时间: ${txTime.toISOString()}`);
    }

    console.log(`   ✅ 钱包数据获取成功\n`);
  } catch (error) {
    console.error(`   ❌ 获取钱包信息失败: ${error.message}\n`);
    if (error.message.includes('429')) {
      console.error('   速率限制：请稍后重试\n');
    }
    process.exit(1);
  }

  // 测试完成
  console.log('✅ 所有测试通过！');
  console.log('\n可以开始使用了：');
  console.log('   npm start         - 采集历史数据');
  console.log('   npm run monitor   - 实时监控\n');
}

// 运行测试
testConfig().catch(error => {
  console.error('❌ 测试失败:', error);
  process.exit(1);
});
