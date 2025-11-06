# 📖 使用说明

## ✅ 配置已完成

你的 Helius API Key 已经配置好了：
- **API Key**: `a0e8790e-223d-4096-9077-2b09dc52bc87`
- **免费额度**: 1,000,000 credits/月
- **速率限制**: 10 请求/秒
- **目标地址**: `DDDD2zvzaPMLuZiC2Vos2i6TLFjJJ3bi1pN7kXQc3R5R`

---

## 🚀 快速开始

### 1. 采集历史交易数据

```bash
npm start
```

这将：
- 获取目标钱包的最近 1000 笔交易
- 按代币分组分析
- 为每个代币生成独立的 CSV 文件
- 输出到 `./output/` 目录

**输出示例：**
```
output/
  ├── 6TqkYb...Fp3(+42.5%).csv    # 盈利 42.5%
  ├── AbcDef...Xyz(-12.3%).csv    # 亏损 12.3%
  └── summary.json                 # 交易摘要
```

### 2. 实时监控新交易

```bash
npm run monitor
```

这将：
- 每 10 秒检查一次新交易
- 发现新交易时立即显示详情
- 显示买入/卖出类型和代币信息
- 按 `Ctrl+C` 停止

### 3. 测试配置（可选）

```bash
npm run test-config
```

验证：
- ✅ RPC 连接正常
- ✅ 目标地址有效
- ✅ 可以获取交易数据

---

## 📊 CSV 数据字段

每个 CSV 文件包含以下列（符合需求文档）：

| 列 | 字段名 | 说明 |
|----|--------|------|
| 1 | 序号 | 从第一笔交易开始的序号 |
| 2 | Slot(区块号) | 交易所在的区块编号 |
| 3 | 时间戳 | ISO 8601 格式（2024-01-01T12:00:00Z） |
| 4 | 交易类型 | Buy / Sell |
| 5 | 交易地址 | 交易签名（缩短显示） |
| 6 | 交易数量(SOL) | SOL 数量 |
| 7 | 封盘价 | 区块收盘价 |
| 8 | 盈亏率(%) | 相对买入价的盈亏 |
| 9 | 成交量 | 区块总成交量 |
| 10 | 时间差(秒) | 与前一区块的时间差 |
| 11 | 涨跌趋势(%) | 相对前一区块的价格变化 |
| 12 | 买单笔数 | 当前区块买单数量 |
| 13 | 买单金额 | 当前区块买单总额 |
| 14 | 卖单笔数 | 当前区块卖单数量 |
| 15 | 卖单金额 | 当前区块卖单总额 |
| 16 | 持币地址 | 持币地址数量 |
| 17 | 净买入 | 净买入金额 |

**文件命名：** `代币地址(盈亏%).csv`

---

## 🎯 目标地址信息

**监控地址：**
```
DDDD2zvzaPMLuZiC2Vos2i6TLFjJJ3bi1pN7kXQc3R5R
```

**查看链上数据：**
- Solscan: https://solscan.io/account/DDDD2zvzaPMLuZiC2Vos2i6TLFjJJ3bi1pN7kXQc3R5R
- Solana Explorer: https://explorer.solana.com/address/DDDD2zvzaPMLuZiC2Vos2i6TLFjJJ3bi1pN7kXQc3R5R

---

## ⚙️ 修改配置

如需修改配置，编辑 `.env` 文件：

```bash
nano .env
```

**可配置项：**

```bash
# Solana RPC（已配置 Helius）
SOLANA_RPC_URL=https://mainnet.helius-rpc.com/?api-key=你的KEY

# 目标钱包地址
TARGET_WALLET=DDDD2zvzaPMLuZiC2Vos2i6TLFjJJ3bi1pN7kXQc3R5R

# 输出目录
OUTPUT_DIR=./output

# Birdeye API（可选，需付费）
BIRDEYE_API_KEY=
```

---

## 📈 性能参考

### Helius 免费层

- ✅ **1,000,000 credits/月**
- ✅ **10 请求/秒**
- ✅ 增强的交易解析
- ✅ 更稳定的连接

### 预计使用量

| 操作 | Credits 消耗 | 可执行次数 |
|------|--------------|------------|
| 获取 1000 笔交易 | ~2,000 | 每月 500 次 |
| 实时监控 1 小时 | ~360 | 每月 2,777 小时 |
| 获取单笔交易详情 | ~2 | 每月 500,000 次 |

**结论：免费额度非常充足！** 👍

---

## 🔍 常见问题

### Q: 如何查看我的 Helius 使用情况？

登录 Helius Dashboard：https://dashboard.helius.dev/
可以看到实时的 credits 使用情况。

### Q: 如果超出免费额度怎么办？

选项：
1. 等待下月 1 号重置
2. 升级到付费计划（$10-50/月）
3. 切换到公共 RPC（修改 `.env` 中的 `SOLANA_RPC_URL`）

### Q: 为什么有些数据字段是空的？

某些高级数据需要：
- 遍历完整区块数据（耗时）
- 使用专业索引服务
- 订阅 Birdeye API（付费）

当前版本提供基础框架，可按需扩展。

### Q: 如何监控其他钱包地址？

方法 1：修改 `.env` 文件中的 `TARGET_WALLET`

方法 2：直接传参
```bash
node src/monitor.js 其他钱包地址
```

### Q: CSV 可以在 Excel 中打开吗？

可以！CSV 格式兼容所有表格软件：
- Microsoft Excel
- Google Sheets
- LibreOffice Calc
- Numbers (Mac)

直接双击 CSV 文件即可打开。

---

## 📂 项目结构

```
test06/
├── src/
│   ├── config.js               # 配置管理
│   ├── solana-client.js        # Solana RPC 客户端
│   ├── birdeye-client.js       # Birdeye API（可选）
│   ├── transaction-analyzer.js # 交易数据分析
│   ├── csv-exporter.js         # CSV 导出
│   ├── index.js                # 主程序：历史数据
│   ├── monitor.js              # 实时监控
│   └── test-config.js          # 配置测试
├── output/                     # 输出目录（自动创建）
├── .env                        # 环境配置（已配置）
├── package.json
├── README.md                   # 完整文档
├── USAGE.md                    # 本文件
└── setup-guide.md              # 配置指南
```

---

## 🛠️ 扩展建议

想要更多功能？可以考虑：

### 1. 价格数据增强
- 集成 Jupiter 价格 API（免费）
- 使用 CoinGecko API
- 从 DEX 程序直接读取

### 2. 通知功能
- Telegram Bot 通知
- Discord Webhook
- 邮件告警

### 3. 数据可视化
- 生成价格走势图
- Web 界面展示
- Grafana 监控面板

### 4. 高级过滤
- 只监控特定代币
- 设置金额阈值
- 自定义交易规则

---

## 📞 获取帮助

**查看文档：**
- `README.md` - 完整文档
- `setup-guide.md` - 配置指南
- `USAGE.md` - 本文件

**检查配置：**
```bash
npm run test-config
```

**查看日志：**
程序运行时会显示详细的进度信息。

---

## 🎉 开始使用

一切准备就绪！现在运行：

```bash
# 采集历史数据
npm start

# 或实时监控
npm run monitor
```

祝你使用愉快！🚀
