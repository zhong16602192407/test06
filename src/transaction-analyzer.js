import { SolanaClient } from './solana-client.js';
import { BirdeyeClient } from './birdeye-client.js';

export class TransactionAnalyzer {
  constructor() {
    this.solanaClient = new SolanaClient();
    this.birdeyeClient = new BirdeyeClient();
  }

  /**
   * 分析钱包的所有交易并按代币分组
   * @param {string} walletAddress - 钱包地址
   * @param {number} limit - 交易数量限制
   * @returns {Promise<Object>} 按代币分组的交易数据
   */
  async analyzeWalletTransactions(walletAddress, limit = 1000) {
    console.log(`\n开始分析钱包: ${walletAddress}`);
    console.log('='.repeat(80));

    // 1. 获取所有交易签名
    const signatures = await this.solanaClient.getSignaturesForAddress(walletAddress, limit);

    if (signatures.length === 0) {
      console.log('未找到任何交易');
      return {};
    }

    // 2. 获取交易详情
    const transactions = await this.solanaClient.getTransactionsBatch(signatures);

    // 3. 按代币分组交易
    const tokenGroups = this.groupTransactionsByToken(transactions, walletAddress);

    console.log(`\n找到 ${Object.keys(tokenGroups).length} 个不同的代币交易`);

    // 4. 分析每个代币的交易
    const analysisResults = {};

    for (const [tokenMint, tokenTxs] of Object.entries(tokenGroups)) {
      console.log(`\n正在分析代币: ${tokenMint}`);
      const analysis = await this.analyzeTokenTransactions(tokenMint, tokenTxs, walletAddress);
      analysisResults[tokenMint] = analysis;
    }

    return analysisResults;
  }

  /**
   * 按代币分组交易
   * @param {Array} transactions - 交易列表
   * @param {string} walletAddress - 钱包地址
   * @returns {Object} 按代币分组的交易
   */
  groupTransactionsByToken(transactions, walletAddress) {
    const groups = {};

    transactions.forEach(tx => {
      const transfers = this.solanaClient.parseTokenTransfers(tx.transaction);

      transfers.forEach(transfer => {
        // 只关注目标钱包的交易
        if (transfer.owner === walletAddress) {
          if (!groups[transfer.mint]) {
            groups[transfer.mint] = [];
          }

          groups[transfer.mint].push({
            signature: tx.signature,
            slot: tx.slot,
            blockTime: tx.blockTime,
            type: transfer.type,
            amount: transfer.amount,
            mint: transfer.mint,
            transaction: tx.transaction
          });
        }
      });
    });

    // 按时间排序（从旧到新）
    Object.values(groups).forEach(txs => {
      txs.sort((a, b) => a.blockTime - b.blockTime);
    });

    return groups;
  }

  /**
   * 分析单个代币的交易
   * @param {string} tokenMint - 代币地址
   * @param {Array} transactions - 该代币的所有交易
   * @param {string} walletAddress - 钱包地址
   * @returns {Promise<Object>} 分析结果
   */
  async analyzeTokenTransactions(tokenMint, transactions, walletAddress) {
    // 找到第一笔买入和最后一笔卖出
    const firstBuy = transactions.find(tx => tx.type === 'Buy');
    const lastSell = [...transactions].reverse().find(tx => tx.type === 'Sell');

    if (!firstBuy) {
      console.log('  未找到买入交易，跳过');
      return null;
    }

    // 计算盈亏（简化版本，实际需要根据价格计算）
    let profitPercent = 0;
    if (lastSell && firstBuy) {
      // 这里需要实际的价格数据来计算盈亏
      // 暂时使用占位符
      profitPercent = 0;
    }

    // 构建数据行
    const dataRows = [];
    let prevBlockTime = null;
    let prevPrice = null;

    for (let i = 0; i < transactions.length; i++) {
      const tx = transactions[i];
      const timestamp = new Date(tx.blockTime * 1000).toISOString();

      // 计算时间差
      let timeDiff = 0;
      if (prevBlockTime !== null) {
        timeDiff = tx.blockTime - prevBlockTime;
      }

      // 计算价格变化（需要实际价格数据）
      let priceChange = 0;

      const row = {
        index: i + 1,
        slot: tx.slot,
        timestamp: timestamp,
        type: tx.type,
        address: tx.signature.substring(0, 10) + '...',
        amount: tx.amount.toFixed(6),
        closePrice: 0, // 需要价格数据
        profitLoss: profitPercent.toFixed(2),
        volume: 0, // 需要从区块数据计算
        timeDiff: timeDiff,
        priceChange: priceChange.toFixed(2),
        buyCount: tx.type === 'Buy' ? 1 : 0,
        buyAmount: tx.type === 'Buy' ? tx.amount.toFixed(6) : 0,
        sellCount: tx.type === 'Sell' ? 1 : 0,
        sellAmount: tx.type === 'Sell' ? tx.amount.toFixed(6) : 0,
        holderCount: 0, // 需要额外查询
        netBuy: tx.type === 'Buy' ? tx.amount.toFixed(6) : (-tx.amount).toFixed(6)
      };

      dataRows.push(row);

      prevBlockTime = tx.blockTime;
      prevPrice = row.closePrice;
    }

    return {
      tokenMint: tokenMint,
      profitPercent: profitPercent,
      firstBuyTime: firstBuy.blockTime,
      lastSellTime: lastSell ? lastSell.blockTime : null,
      totalBuys: transactions.filter(tx => tx.type === 'Buy').length,
      totalSells: transactions.filter(tx => tx.type === 'Sell').length,
      dataRows: dataRows
    };
  }

  /**
   * 获取代币在指定区块范围内的详细数据
   * @param {string} tokenMint - 代币地址
   * @param {number} startSlot - 起始区块
   * @param {number} endSlot - 结束区块
   * @returns {Promise<Array>} 区块数据
   */
  async getTokenBlockData(tokenMint, startSlot, endSlot) {
    console.log(`获取区块 ${startSlot} 到 ${endSlot} 的数据...`);

    const blockData = [];
    const slots = endSlot - startSlot + 1;

    if (slots > 100) {
      console.warn(`⚠️  区块范围过大 (${slots} 个区块)，建议缩小范围`);
    }

    // 这里需要遍历每个区块并提取相关交易
    // 由于可能非常耗时，建议使用更高级的API或索引服务

    return blockData;
  }

  /**
   * 计算目标地址的盈亏
   * @param {Array} transactions - 交易列表
   * @param {number} buyPrice - 买入价格
   * @param {number} sellPrice - 卖出价格
   * @returns {number} 盈亏百分比
   */
  calculateProfitLoss(transactions, buyPrice, sellPrice) {
    if (!buyPrice || !sellPrice) {
      return 0;
    }

    return ((sellPrice - buyPrice) / buyPrice) * 100;
  }
}
