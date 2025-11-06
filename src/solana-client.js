import { Connection, PublicKey } from '@solana/web3.js';
import { config } from './config.js';

export class SolanaClient {
  constructor() {
    this.connection = new Connection(config.solanaRpcUrl, 'confirmed');
  }

  /**
   * 获取钱包的所有交易签名
   * @param {string} walletAddress - 钱包地址
   * @param {number} limit - 限制数量
   * @returns {Promise<Array>} 交易签名列表
   */
  async getSignaturesForAddress(walletAddress, limit = 1000) {
    try {
      const pubKey = new PublicKey(walletAddress);
      console.log(`正在获取地址 ${walletAddress} 的交易签名...`);

      const signatures = await this.connection.getSignaturesForAddress(
        pubKey,
        { limit }
      );

      console.log(`找到 ${signatures.length} 个交易签名`);
      return signatures;
    } catch (error) {
      console.error('获取交易签名失败:', error.message);
      throw error;
    }
  }

  /**
   * 获取交易详情
   * @param {string} signature - 交易签名
   * @returns {Promise<Object>} 交易详情
   */
  async getTransaction(signature) {
    try {
      const transaction = await this.connection.getTransaction(signature, {
        maxSupportedTransactionVersion: 0
      });
      return transaction;
    } catch (error) {
      console.error(`获取交易 ${signature} 失败:`, error.message);
      return null;
    }
  }

  /**
   * 批量获取交易详情（带延迟避免速率限制）
   * @param {Array} signatures - 交易签名列表
   * @returns {Promise<Array>} 交易详情列表
   */
  async getTransactionsBatch(signatures) {
    const transactions = [];
    console.log(`开始批量获取 ${signatures.length} 个交易详情...`);

    for (let i = 0; i < signatures.length; i++) {
      const sig = signatures[i];
      console.log(`进度: ${i + 1}/${signatures.length} - ${sig.signature}`);

      const tx = await this.getTransaction(sig.signature);
      if (tx) {
        transactions.push({
          signature: sig.signature,
          slot: sig.slot,
          blockTime: sig.blockTime,
          err: sig.err,
          transaction: tx
        });
      }

      // 延迟避免速率限制
      if (i < signatures.length - 1) {
        await this.sleep(config.rateLimitDelay);
      }
    }

    console.log(`成功获取 ${transactions.length} 个交易详情`);
    return transactions;
  }

  /**
   * 解析交易中的代币转账信息
   * @param {Object} transaction - 交易对象
   * @returns {Array} 代币转账信息
   */
  parseTokenTransfers(transaction) {
    const transfers = [];

    if (!transaction || !transaction.meta) {
      return transfers;
    }

    const { preTokenBalances, postTokenBalances } = transaction.meta;

    if (!preTokenBalances || !postTokenBalances) {
      return transfers;
    }

    // 通过比较前后余额来确定转账
    const balanceChanges = new Map();

    preTokenBalances.forEach(pre => {
      const key = `${pre.accountIndex}_${pre.mint}`;
      balanceChanges.set(key, {
        accountIndex: pre.accountIndex,
        mint: pre.mint,
        owner: pre.owner,
        preAmount: pre.uiTokenAmount.uiAmount,
        postAmount: 0
      });
    });

    postTokenBalances.forEach(post => {
      const key = `${post.accountIndex}_${post.mint}`;
      if (balanceChanges.has(key)) {
        const change = balanceChanges.get(key);
        change.postAmount = post.uiTokenAmount.uiAmount;
      } else {
        balanceChanges.set(key, {
          accountIndex: post.accountIndex,
          mint: post.mint,
          owner: post.owner,
          preAmount: 0,
          postAmount: post.uiTokenAmount.uiAmount
        });
      }
    });

    balanceChanges.forEach(change => {
      const delta = change.postAmount - change.preAmount;
      if (delta !== 0) {
        transfers.push({
          mint: change.mint,
          owner: change.owner,
          amount: Math.abs(delta),
          type: delta > 0 ? 'Buy' : 'Sell'
        });
      }
    });

    return transfers;
  }

  /**
   * 获取区块信息
   * @param {number} slot - 区块号
   * @returns {Promise<Object>} 区块信息
   */
  async getBlock(slot) {
    try {
      const block = await this.connection.getBlock(slot, {
        maxSupportedTransactionVersion: 0
      });
      return block;
    } catch (error) {
      console.error(`获取区块 ${slot} 失败:`, error.message);
      return null;
    }
  }

  /**
   * 延迟函数
   * @param {number} ms - 毫秒
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
