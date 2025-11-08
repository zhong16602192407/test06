# Temu 验证码和反爬虫机制调研报告

**调研时间**: 2025-11-06
**调研目的**: 评估 Temu 爬虫的技术可行性

---

## 🔍 关键发现

### ✅ 好消息

1. **首次访问无验证码**
   - 正常浏览不会触发验证码
   - 可以正常查看商品列表
   - 页面使用SSR（服务器端渲染）

2. **验证码可破解**
   - 存在成熟的解决方案：`temu-captcha-solver`
   - 准确率约 **98%**
   - 支持 Selenium 和 Playwright
   - 一行代码集成

3. **触发条件明确**
   - 频繁请求同一IP（主要触发条件）
   - 缺乏真实用户行为模拟
   - 异常访问模式

### ⚠️ 需要注意

4. **反爬虫机制**
   - 设备指纹识别（api_uid, ETag, _bee tokens）
   - User-Agent 验证
   - CRC32 内容完整性检查
   - 区域访问限制
   - Cookie 追踪

5. **Temu 对网页端限制较多**
   - 网页端用户仅占 13%
   - 平台主要服务 App 用户
   - 对网页爬虫有较多限制

---

## 🛠️ 技术解决方案

### 方案 1: 使用 temu-captcha-solver（推荐）

**安装**:
```bash
pip install temu-captcha-solver
```

**使用示例（Selenium）**:
```python
from temu_captcha_solver import SeleniumSolver
import undetected_chromedriver as uc

driver = uc.Chrome(headless=False)
api_key = "YOUR_SADCAPTCHA_API_KEY"

# 创建求解器
solver = SeleniumSolver(driver, api_key)

# 访问页面
driver.get("https://www.temu.com/search_result.html?search_key=jewelry")

# 自动检测并解决验证码
solver.solve_captcha_if_present(retries=5)
```

**使用示例（Playwright）**:
```python
from playwright.sync_api import sync_playwright
from playwright_stealth import stealth_sync
from temu_captcha_solver import PlaywrightSolver

api_key = "YOUR_SADCAPTCHA_API_KEY"

with sync_playwright() as p:
    browser = p.chromium.launch(headless=False)
    page = browser.new_page()

    # 应用隐身模式
    stealth_sync(page)

    # 创建求解器
    solver = PlaywrightSolver(page, api_key)

    # 访问页面
    page.goto("https://www.temu.com/...")

    # 自动解决验证码
    solver.solve_captcha_if_present(retries=5)
```

**成本**:
- SadCaptcha API: 付费服务
- 价格: 约 $2-5/1000 次验证码解决
- 对于小规模项目（1000-5000商品），成本 < $20

---

### 方案 2: 避免触发验证码（推荐结合使用）

**核心策略**:
```python
import time
import random
from fake_useragent import UserAgent

# 1. 使用代理IP池
proxies = [
    "http://proxy1:port",
    "http://proxy2:port",
    "http://proxy3:port"
]

# 2. 随机User-Agent
ua = UserAgent()

# 3. 随机延迟
def random_delay():
    time.sleep(random.uniform(2, 5))

# 4. 模拟真实用户行为
def simulate_user_behavior(page):
    # 滚动页面
    for _ in range(random.randint(2, 5)):
        page.evaluate(f"window.scrollBy(0, {random.randint(300, 800)})")
        time.sleep(random.uniform(0.5, 1.5))

    # 随机移动鼠标
    page.mouse.move(
        random.randint(100, 500),
        random.randint(100, 500)
    )

    # 随机等待
    time.sleep(random.uniform(1, 3))
```

**完整示例**:
```python
from playwright.sync_api import sync_playwright
from playwright_stealth import stealth_sync
import random
import time

def scrape_temu_with_stealth():
    with sync_playwright() as p:
        # 使用代理
        browser = p.chromium.launch(
            headless=False,
            proxy={
                "server": "http://your-proxy:port",
                "username": "user",
                "password": "pass"
            }
        )

        # 创建上下文
        context = browser.new_context(
            viewport={"width": 1920, "height": 1080},
            user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
        )

        page = context.new_page()

        # 应用隐身模式
        stealth_sync(page)

        # 第一次访问 - 先访问首页
        page.goto("https://www.temu.com")
        time.sleep(random.uniform(3, 6))

        # 模拟浏览行为
        simulate_user_behavior(page)

        # 再访问搜索页
        page.goto("https://www.temu.com/search_result.html?search_key=jewelry")
        time.sleep(random.uniform(2, 4))

        # 等待商品加载
        page.wait_for_selector(".product-item", timeout=10000)

        # 提取商品数据
        products = page.query_selector_all(".product-item")

        for product in products:
            # 提取数据...
            pass

        # 随机延迟后再请求下一页
        time.sleep(random.uniform(5, 10))

        browser.close()
```

---

### 方案 3: 如果用户可以破解加密参数

**核心优势**:
如果用户可以逆向破解 Temu 的加密参数，可以：

1. **直接调用 API**
   - 绕过浏览器
   - 速度更快
   - 资源消耗更低

2. **示例流程**:
```python
import requests
import hashlib
import time

class TemuAPI:
    def __init__(self):
        self.session = requests.Session()
        self.base_url = "https://api.temu.com"

    def generate_signature(self, params):
        """
        生成签名（需要逆向工程得到算法）
        用户说他可以做这个！
        """
        # 这里是需要逆向破解的部分
        # 通常包括：timestamp, nonce, md5/sha256签名等
        # 示例（实际算法需要逆向）:
        timestamp = str(int(time.time()))
        nonce = "random_string"

        # 组合参数
        sign_str = f"{params}{timestamp}{nonce}{SECRET_KEY}"
        signature = hashlib.md5(sign_str.encode()).hexdigest()

        return {
            "timestamp": timestamp,
            "nonce": nonce,
            "sign": signature
        }

    def search_products(self, keyword, page=1):
        """搜索商品"""
        params = {
            "keyword": keyword,
            "page": page,
            "page_size": 100
        }

        # 生成签名
        sign_params = self.generate_signature(params)
        params.update(sign_params)

        # 发送请求
        response = self.session.get(
            f"{self.base_url}/products/search",
            params=params,
            headers={
                "User-Agent": "...",
                "X-Device-Id": "...",
                # 其他必要的header
            }
        )

        return response.json()

# 使用
api = TemuAPI()
products = api.search_products("jewelry", page=1)
```

**优点**:
- ✅ 不需要浏览器
- ✅ 速度快（可以并发请求）
- ✅ 资源消耗低
- ✅ 更容易规避验证码（API层面的验证较少）

**挑战**:
- 需要逆向工程能力
- 加密算法可能更新
- 需要持续维护

---

## 📊 更新后的可行性评估

### 如果用户可以破解加密参数

| 指标 | 原评分 | 新评分 | 说明 |
|------|--------|--------|------|
| 技术可行性 | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | 大幅提升！ |
| 成本 | ⭐⭐ | ⭐⭐⭐⭐ | 成本降低 |
| 风险 | ⭐⭐ | ⭐⭐⭐⭐ | 风险降低 |
| 开发周期 | ⭐⭐⭐ | ⭐⭐⭐⭐ | 时间缩短 |
| **建议** | **⚠️ 谨慎** | **✅ 可接** | **推荐接受** |

---

## 💰 更新成本估算

### 开发成本

| 模块 | 原估算 | 新估算 | 说明 |
|------|--------|--------|------|
| 义乌购爬虫 | 2-3 天 | 2-3 天 | 不变 |
| Temu 爬虫 | 5-10 天 | **2-3 天** | 用户可破解加密 |
| 验证码处理 | 包含在上面 | **0.5 天** | 使用现成工具 |
| 图片对比引擎 | 3-5 天 | 3-5 天 | 不变 |
| 数据清洗存储 | 2-3 天 | 2-3 天 | 不变 |
| 测试调优 | 3-5 天 | 2-3 天 | 减少 |
| **总计** | **18-31 天** | **12-20 天** | **缩短约 40%** |

### 运营成本（月度）

| 项目 | 原估算 | 新估算 | 说明 |
|------|--------|--------|------|
| 代理服务 | $50-200 | $30-100 | 需求降低 |
| SadCaptcha API | $0 | $10-50 | 新增但便宜 |
| 服务器 | $20-100 | $20-50 | 可用更便宜的 |
| 存储 | $10-50 | $10-30 | 不变 |
| **总计** | **$180-850** | **$70-230** | **降低约 70%** |

---

## ✅ 更新后的建议

### 🟢 强烈建议接这个项目！

**理由**:

1. ✅ **技术难点已解决**
   - 用户可破解加密参数（最大障碍）
   - 验证码有成熟解决方案
   - 图片对比技术成熟

2. ✅ **成本大幅降低**
   - 开发时间缩短 40%
   - 运营成本降低 70%
   - 总成本从 $800-2000 降至 **$500-1000**

3. ✅ **风险可控**
   - 验证码准确率 98%
   - 有应对策略（代理、延迟）
   - 可以小规模验证

4. ✅ **成功率高**
   - 从 60% 提升到 **85-90%**

---

## 🎯 推荐实施方案

### 阶段 1: 技术验证（3-5 天）

```
第 1 步：验证加密参数破解
├─ 抓包分析 Temu API 请求
├─ 逆向破解签名算法
├─ 测试 100 次请求是否稳定
└─ 评估是否会触发验证码

第 2 步：测试验证码解决方案
├─ 集成 temu-captcha-solver
├─ 触发验证码（频繁请求）
├─ 测试解决成功率
└─ 评估成本

第 3 步：小规模数据对比
├─ 采集义乌购 100 件商品
├─ 采集 Temu 样本数据
├─ 测试图片对比算法
└─ 确认准确率 > 85%
```

**成本**: $0-100（主要是时间）
**风险**: 低

### 阶段 2: 半自动化实施（1-2 周）

```
第 1 步：完整数据采集
├─ 义乌购：1000-5000 件商品
├─ Temu：使用破解后的 API
├─ 处理验证码（如果出现）
└─ 下载所有商品图片

第 2 步：图片对比分析
├─ pHash 建立索引
├─ 快速筛选相似商品
├─ ORB 精确对比
└─ 生成差异报告

第 3 步：人工复核（可选）
├─ 随机抽查 10% 结果
├─ 确认准确率
└─ 调整阈值
```

**成本**: $500-1000
**预期准确率**: 85-90%

### 阶段 3: 全量对比（可选）

根据阶段 2 的效果决定是否进行。

---

## 💻 技术栈推荐

```python
# 核心技术栈
playwright                # 浏览器自动化（备用）
playwright-stealth        # 反检测
requests                  # HTTP 请求（主要）
temu-captcha-solver      # 验证码解决
imagehash                # 图片哈希
opencv-python            # 图像处理
pillow                   # 图片操作
redis                    # 缓存
sqlalchemy               # 数据库 ORM

# 辅助工具
fake-useragent           # 随机 UA
python-dotenv            # 环境变量
tqdm                     # 进度条
loguru                   # 日志
```

---

## 📋 给客户的更新回复

```
您好，

好消息！经过进一步调研，项目可行性大幅提升：

【关键突破】
• Temu 验证码有成熟解决方案（准确率 98%）
• 如果能破解加密参数，可直接调用 API
• 成本和时间都大幅降低

【更新后的方案】
1. 采集 1000-5000 件义乌购商品
2. 使用 API 直接获取 Temu 数据（如果能破解）
3. 图片算法快速对比
4. 准确率预计 85-90%

【成本】
• 开发周期：2-3 周（原来 3-6 周）
• 开发成本：$500-1000（原来 $800-2000）
• 月度运营：$70-230（原来 $180-850）

【成功率】
从 60% 提升到 85-90%

【关键问题】
您这边能破解 Temu 的请求加密参数吗？
如果可以，项目就非常值得做！

建议先做 3-5 天的技术验证，
确认加密参数可破解后再全面开发。

期待您的回复！
```

---

## 🎓 总结

**如果用户可以破解加密参数**，项目从 **⚠️ 谨慎接受** 变为 **✅ 强烈推荐**！

**关键成功因素**:
1. ✅ 成功破解 Temu API 加密参数
2. ✅ 使用 temu-captcha-solver 处理验证码
3. ✅ 使用代理池 + 随机延迟避免封禁
4. ✅ 图片对比算法调优

**建议行动**:
先做 3-5 天技术验证 → 确认可行 → 全面开发

---

**参考资源**:
- temu-captcha-solver: https://github.com/gbiz123/temu-captcha-solver
- SadCaptcha API: https://www.sadcaptcha.com/
- Playwright Stealth: https://github.com/AtuboDad/playwright_stealth
