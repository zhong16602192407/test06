import dotenv from 'dotenv';
dotenv.config();

export const config = {
  // Birdeye API (可选)
  birdeyeApiKey: process.env.BIRDEYE_API_KEY || '',
  birdeyeBaseUrl: 'https://public-api.birdeye.so',

  // Solana RPC
  solanaRpcUrl: process.env.SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com',

  // 目标钱包地址
  targetWallet: process.env.TARGET_WALLET || 'DDDD2zvzaPMLuZiC2Vos2i6TLFjJJ3bi1pN7kXQc3R5R',

  // 输出目录
  outputDir: process.env.OUTPUT_DIR || './output',

  // API速率限制（毫秒）
  rateLimitDelay: 1000, // Solana公共RPC建议1秒延迟

  // 批量查询大小
  batchSize: 100,
};
