import axios from 'axios';
import { config } from './config.js';

export class BirdeyeClient {
  constructor() {
    this.baseUrl = config.birdeyeBaseUrl;
    this.apiKey = config.birdeyeApiKey;
    this.hasApiKey = !!this.apiKey;

    if (!this.hasApiKey) {
      console.warn('⚠️  警告: 未设置 BIRDEYE_API_KEY，将无法使用 Birdeye API');
      console.warn('   Birdeye API 需要付费订阅，最低为 Standard 套餐');
      console.warn('   程序将仅使用 Solana 公共 RPC 获取基础数据');
    }
  }

  /**
   * 获取代币价格历史
   * @param {string} tokenAddress - 代币地址
   * @param {number} from - 开始时间戳
   * @param {number} to - 结束时间戳
   * @returns {Promise<Array>} 价格历史数据
   */
  async getTokenPriceHistory(tokenAddress, from, to) {
    if (!this.hasApiKey) {
      console.log('⚠️  跳过 Birdeye 价格查询（无 API Key）');
      return [];
    }

    try {
      const response = await axios.get(
        `${this.baseUrl}/defi/history_price`,
        {
          params: {
            address: tokenAddress,
            address_type: 'token',
            type: '1m',
            time_from: from,
            time_to: to
          },
          headers: {
            'X-API-KEY': this.apiKey,
            'x-chain': 'solana'
          }
        }
      );

      return response.data.data?.items || [];
    } catch (error) {
      if (error.response?.status === 429) {
        console.error('速率限制: Birdeye API 请求过于频繁');
      } else if (error.response?.status === 401) {
        console.error('认证失败: Birdeye API Key 无效');
      } else {
        console.error('获取价格历史失败:', error.message);
      }
      return [];
    }
  }

  /**
   * 获取代币信息
   * @param {string} tokenAddress - 代币地址
   * @returns {Promise<Object>} 代币信息
   */
  async getTokenInfo(tokenAddress) {
    if (!this.hasApiKey) {
      return { address: tokenAddress, symbol: 'UNKNOWN', name: 'Unknown Token' };
    }

    try {
      const response = await axios.get(
        `${this.baseUrl}/defi/token_overview`,
        {
          params: {
            address: tokenAddress
          },
          headers: {
            'X-API-KEY': this.apiKey,
            'x-chain': 'solana'
          }
        }
      );

      return response.data.data || {};
    } catch (error) {
      console.error('获取代币信息失败:', error.message);
      return { address: tokenAddress, symbol: 'UNKNOWN', name: 'Unknown Token' };
    }
  }

  /**
   * 获取钱包交易历史 (需要付费API)
   * @param {string} walletAddress - 钱包地址
   * @returns {Promise<Array>} 交易历史
   */
  async getWalletTransactions(walletAddress) {
    if (!this.hasApiKey) {
      console.log('⚠️  跳过 Birdeye 钱包交易查询（无 API Key）');
      return [];
    }

    try {
      const response = await axios.get(
        `${this.baseUrl}/v1/wallet/multichain_tx_list`,
        {
          params: {
            wallet: walletAddress,
            chain: 'solana'
          },
          headers: {
            'X-API-KEY': this.apiKey,
            'accept': 'application/json'
          }
        }
      );

      return response.data.data?.items || [];
    } catch (error) {
      if (error.response?.status === 429) {
        console.error('速率限制: Birdeye Wallet API 限制为 5 req/s, 75 req/min');
      } else {
        console.error('获取钱包交易失败:', error.message);
      }
      return [];
    }
  }

  /**
   * 延迟函数（避免速率限制）
   * @param {number} ms - 毫秒
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
