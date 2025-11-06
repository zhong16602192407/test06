# Solana 钱包交易监控工具

这是一个用于监控 Solana 钱包地址交易的工具，可以采集历史交易数据并导出为 CSV 格式，支持按代币分组。

## 功能特点

✅ **历史交易采集** - 获取指定钱包地址的所有历史交易
✅ **按代币分组** - 自动将交易按不同代币分组并单独导出
✅ **CSV 导出** - 符合需求文档的格式导出数据
✅ **实时监控** - 可选的实时监控模式，自动检测新交易
✅ **免费使用** - 基于 Solana 公共 RPC，无需付费 API
✅ **可选 Birdeye** - 如果有 Birdeye API Key，可获取更详细的价格数据

## 关于 Birdeye API

⚠️ **重要说明：Birdeye 没有免费 API**

- Birdeye 需要**付费订阅**，最低为 Standard 套餐
- Wallet 交易历史 API 速率限制：5 req/s, 75 req/min
- WebSocket 实时订阅需要 Business 套餐

**本工具的解决方案：**
- 主要使用 **Solana 公共 RPC**（免费）获取交易数据
- Birdeye API 为**可选**功能，用于增强价格和代币元数据
- 即使没有 Birdeye API Key，工具仍可正常运行

## 安装

```bash
# 1. 安装依赖
npm install

# 2. 配置环境变量（可选）
cp .env.example .env
nano .env
```

## 配置

编辑 `.env` 文件：

```bash
# Birdeye API Key（可选，如果有付费订阅）
BIRDEYE_API_KEY=your_api_key_here

# Solana RPC（默认使用公共 RPC）
SOLANA_RPC_URL=https://api.mainnet-beta.solana.com

# 推荐：使用 Helius 免费层（更快更稳定）
# 注册地址: https://www.helius.dev/
# SOLANA_RPC_URL=https://mainnet.helius-rpc.com/?api-key=YOUR_KEY

# 目标钱包地址
TARGET_WALLET=DDDD2zvzaPMLuZiC2Vos2i6TLFjJJ3bi1pN7kXQc3R5R

# 输出目录
OUTPUT_DIR=./output
```

## 使用方法

### 1. 历史数据采集

采集目标地址的所有历史交易并导出：

```bash
npm start
```

这将：
1. 获取钱包的所有交易（最多 1000 笔）
2. 按代币分组分析
3. 为每个代币生成一个 CSV 文件
4. 生成交易摘要 JSON

**输出格式：**
```
output/
  ├── 6TqkYb...Fp3(+42.5%).csv    # 代币1的交易数据
  ├── AbcDef...Xyz(-12.3%).csv    # 代币2的交易数据
  └── summary.json                 # 交易摘要
```

### 2. 实时监控模式

监控钱包地址的新交易：

```bash
npm run monitor

# 或指定其他地址
npm run monitor <钱包地址>
```

实时监控会：
- 每 10 秒检查一次新交易
- 发现新交易时立即显示详情
- 按 Ctrl+C 停止监控

### 3. 监控指定地址

直接在命令中指定地址：

```bash
node src/index.js
# 使用 .env 中配置的 TARGET_WALLET

node src/monitor.js DDDD2zvzaPMLuZiC2Vos2i6TLFjJJ3bi1pN7kXQc3R5R
# 监控指定地址
```

## CSV 数据字段说明

根据需求文档，每个 CSV 文件包含以下列：

| 列名 | 说明 |
|------|------|
| 序号 | 从第一笔交易开始的序号 |
| Slot(区块号) | 交易所在的区块编号 |
| 时间戳 | 交易时间（ISO 8601 格式） |
| 交易类型 | Buy / Sell |
| 交易地址 | 交易签名（缩写） |
| 交易数量(SOL) | 交易的 SOL 数量 |
| 封盘价 | 当前区块的收盘价 |
| 盈亏率(%) | 相对买入价的盈亏百分比 |
| 成交量 | 当前区块的总成交量 |
| 时间差(秒) | 与前一个区块的时间差 |
| 涨跌趋势(%) | 相对前一区块的价格变化 |
| 买单笔数 | 当前区块的买单数量 |
| 买单金额 | 当前区块的买单总金额 |
| 卖单笔数 | 当前区块的卖单数量 |
| 卖单金额 | 当前区块的卖单总金额 |
| 持币地址 | 持币地址数量 |
| 净买入 | 净买入金额 |

## 性能和限制

### Solana 公共 RPC
- ✅ 免费使用
- ⚠️  速率限制较严格（建议 1 req/s）
- ⚠️  可能偶尔不稳定

### 推荐：Helius 免费层
- ✅ 免费额度：100,000 credits/月
- ✅ 更快更稳定
- ✅ 增强的交易解析
- 🔗 注册地址：https://www.helius.dev/

### Birdeye API（可选）
- ⚠️  需要付费订阅
- Standard 套餐：$49/月（1 req/s）
- Business 套餐：支持 WebSocket

## 常见问题

### Q: 为什么有些数据字段是空的？

A: 某些高级数据（如精确的价格、成交量、持币地址数）需要：
1. 遍历完整区块数据（非常耗时）
2. 使用专业数据服务（如 Birdeye、Helius DAS API）
3. 自建索引服务

当前版本提供基础框架，你可以根据需求扩展。

### Q: 如何提高数据采集速度？

A:
1. 使用 Helius 或 QuickNode 的付费 RPC（更快的速率限制）
2. 订阅 Birdeye Business 套餐使用 WebSocket
3. 减少要获取的交易数量
4. 使用批量查询 API

### Q: 可以导出 Excel 格式吗？

A: CSV 可以直接在 Excel 中打开。如需 `.xlsx` 格式，可以安装 `xlsx` 包并修改 `csv-exporter.js`。

### Q: 如何获取更详细的价格数据？

A:
1. 使用 Birdeye API（需要付费）
2. 使用 Jupiter 或 Raydium 的价格 API
3. 从链上 DEX 程序直接读取价格

## 项目结构

```
.
├── src/
│   ├── config.js               # 配置管理
│   ├── solana-client.js        # Solana RPC 客户端
│   ├── birdeye-client.js       # Birdeye API 客户端（可选）
│   ├── transaction-analyzer.js # 交易分析器
│   ├── csv-exporter.js         # CSV 导出器
│   ├── index.js                # 主程序（历史数据）
│   └── monitor.js              # 监控程序（实时）
├── output/                     # 输出目录
├── package.json
├── .env.example
└── README.md
```

## 扩展建议

想要更完整的功能？可以考虑：

1. **价格数据**
   - 集成 Jupiter Aggregator API
   - 使用 CoinGecko 或 CoinMarketCap API
   - 直接从 DEX 程序读取池子数据

2. **区块级数据**
   - 使用 Helius Digital Asset Standard (DAS) API
   - 自建 Solana 索引节点
   - 使用 The Graph 或 Covalent

3. **实时监控增强**
   - 使用 WebSocket 连接
   - 添加 Telegram/Discord 通知
   - 设置价格告警

4. **数据可视化**
   - 添加 Chart.js 生成图表
   - 构建 Web 界面
   - 集成 Grafana 监控面板

## 目标地址

当前配置的目标地址：
```
DDDD2zvzaPMLuZiC2Vos2i6TLFjJJ3bi1pN7kXQc3R5R
```

在 Solana Explorer 查看：
https://solscan.io/account/DDDD2zvzaPMLuZiC2Vos2i6TLFjJJ3bi1pN7kXQc3R5R

## 许可证

MIT

## 免责声明

本工具仅供学习和研究使用。使用本工具进行交易决策风险自负。

---

**遇到问题？** 请检查：
1. Solana RPC 是否可访问
2. 钱包地址是否正确
3. 网络连接是否正常
4. Node.js 版本 >= 16

**需要帮助？** 查看代码注释或修改配置文件。
