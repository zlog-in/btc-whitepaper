# Vibe Coding 记录：比特币白皮书交互式学习网站

## 项目概述

这是一个比特币白皮书的交互式学习网站，通过可视化演示帮助用户理解比特币的核心概念。项目支持中英文双语，采用纯前端实现（HTML + CSS + JavaScript），无需后端服务。

## 本次 Vibe Coding 会话内容

### 1. 工作量证明 (PoW) 页面完善

**目标**：详细解释 PoW 背后的能源基础、货币理论、博弈论等概念。

**实现内容**：

#### 核心概念可视化
- 展示"难度目标"与"哈希值"的关系
- 用前导零数量直观表示难度

#### 挖矿模拟器
- 可选择难度（1-4个前导零）
- 实时显示哈希尝试过程
- 显示哈希速率、尝试次数、期望次数
- 支持单步执行和自动挖矿

#### 能源基础理论
```
电力 → 计算 → 安全 → 价值
```
- 展示全球挖矿能耗数据（约 150 TWh/年）
- 与国家能耗对比（相当于阿根廷）
- 碳排放数据（约 65 Mt CO2/年）

#### 货币理论 - "不可伪造的成本"
Nick Szabo 的理论对比：
| 货币 | 生产成本 | 伪造难度 | 验证成本 |
|------|----------|----------|----------|
| 黄金 | 极高 | 极难 | 中等 |
| 比特币 | 极高 | 不可能 | 极低 |
| 纸币 | 极低 | 困难 | 中等 |

#### 博弈论分析
- 纳什均衡：诚实挖矿 vs 攻击网络
- 策略矩阵可视化
- 激励相容性说明

#### 51% 攻击成本计算器
- 基于 mempool.space 实时数据（~880 EH/s）
- 计算所需算力、硬件成本、电力成本
- 对比潜在收益与攻击成本
- 结论：攻击成本远超收益

#### 难度调整模拟
- 滑动条调整算力变化（-50% ~ +100%）
- 实时显示出块时间变化
- 展示 2016 区块调整周期

### 2. 共识传播页面（原 P2P 网络页面）

**目标**：用形象、直观的演示动画展示区块传播、分叉、共识收敛过程。

**页面重命名**：
- 中文：P2P 网络 → 共识传播
- 英文：P2P Network → Consensus Propagation

**实现内容**：

#### 区块传播演示
- Canvas 绘制的 P2P 网络拓扑
- 12 个节点随机分布
- BFS 算法模拟区块传播
- 实时统计：节点数、已接收数、传播进度、传播轮次
- 可调节传播速度
- 动画效果：脉冲、颜色变化

#### 区块链分叉演示
- 可视化展示主链和分叉点
- 矿工 A 和矿工 B 同时出块
- 分叉分支动画出现
- 三步解释：分叉发生 → 网络分裂 → 继续挖矿
- 可选择哪个矿工继续挖矿

#### 共识收敛演示
- 6 个节点网格显示
- 链 A vs 链 B 对比
- 分步演示：
  1. 初始状态
  2. 分叉传播（节点选边）
  3. 新区块产生（某链变长）
  4. 共识收敛（所有节点切换到最长链）
- 时间线进度指示器

#### 确认数与安全性
- 深度可视化链条
- 确认数表格：
  - 0 确认：未确认（不建议接受）
  - 1 确认：低（小额交易）
  - 3 确认：中等（普通交易）
  - 6 确认：高（大额交易）
  - 60+ 确认：极高（交易所充值）

#### 最终一致性要点
- 最长链规则
- 6 个确认标准
- 自动重组机制
- 孤块处理

### 3. 数据准确性修正

**问题**：初始使用的网络算力数据不准确（600 EH/s）

**解决方案**：
1. 通过 WebFetch 查询 mempool.space API
2. 获取实时数据：~882 EH/s
3. 更新为 880 EH/s（取整）
4. 添加数据来源标注链接

**用户反馈**：成本数据可能过时

**处理**：添加免责声明
```
* 成本数据为估算值，可能已过时，仅供参考
```

### 4. 全站导航更新

更新所有 HTML 文件中的导航文本：
- 18 个页面的导航菜单
- i18n.js 双语翻译
- pow.html 的"下一页"按钮
- index.html 首页卡片

## 技术实现细节

### 文件结构
```
btc-whitepaper/
├── index.html          # 首页
├── css/
│   └── style.css       # 全局样式（11000+ 行）
├── js/
│   ├── i18n.js         # 国际化翻译
│   ├── pow.js          # PoW 页面交互
│   └── p2p.js          # 共识传播页面交互
└── pages/
    ├── pow.html        # 工作量证明
    ├── p2p.html        # 共识传播
    └── ...             # 其他页面
```

### 关键技术点

#### Canvas 网络可视化
```javascript
class NetworkNode {
    constructor(id, x, y) {
        this.id = id;
        this.x = x;
        this.y = y;
        this.radius = 22;
        this.neighbors = [];
        this.state = 'waiting'; // waiting, received, source
    }

    draw() { /* 绘制节点 */ }
    pulse() { /* 脉冲动画 */ }
    update() { /* 更新状态 */ }
}
```

#### BFS 传播算法
```javascript
function propagateStep() {
    const nextQueue = [];
    for (const nodeId of propagationState.queue) {
        const node = nodes.find(n => n.id === nodeId);
        for (const neighborId of node.neighbors) {
            if (!propagationState.receivedNodes.has(neighborId)) {
                propagationState.receivedNodes.add(neighborId);
                nextQueue.push(neighborId);
            }
        }
    }
    propagationState.queue = nextQueue;
    propagationState.currentHop++;
}
```

#### 响应式设计
```css
@media (max-width: 768px) {
    .propagation-stats {
        grid-template-columns: repeat(2, 1fr);
    }
    .node-network {
        grid-template-columns: repeat(2, 1fr);
    }
    .chain-comparison {
        flex-direction: column;
    }
}
```

### 版本控制

使用缓存破坏版本号：
```html
<link rel="stylesheet" href="../css/style.css?v=20260203f">
<script src="../js/p2p.js?v=20260203f"></script>
```

## Git 提交历史

```
b0359be feat: transform P2P network page into consensus propagation demo
4e75e6b style: add disclaimer note for potentially outdated cost data
3478379 fix: update network hashrate to ~880 EH/s from mempool.space
bb59d21 feat: comprehensive PoW page with energy, monetary theory, and game theory
04ee2e3 feat: enhance blockchain page with interactive growth demo
f357c37 feat: add mining page as sub-page under block structure
```

## Vibe Coding 心得

### 什么是 Vibe Coding

Vibe Coding 是一种与 AI 协作的编程方式，用户提供高层次的需求和方向，AI 负责实现细节。这次会话的典型交互模式：

1. **用户**：提出概念性需求（如"详细解释 PoW 背后的能源基础、货币理论、博弈论"）
2. **AI**：设计结构、编写代码、添加样式
3. **用户**：指出问题（如"算力数据不对"）
4. **AI**：查询外部数据源、修正
5. **用户**：确认或继续迭代

### 关键成功因素

1. **清晰的愿景**：用户对最终效果有清晰的想象
2. **及时反馈**：发现问题立即指出
3. **信任但验证**：相信 AI 的实现能力，但验证关键数据
4. **迭代改进**：不追求一次完美，而是逐步完善

### 本次会话的亮点

- 从"P2P 网络"到"共识传播"的概念提升
- 用 Canvas 动画直观展示抽象概念
- 引入外部数据源保证准确性
- 完整的双语支持

---

*记录时间：2026-02-03*
*会话工具：Claude Code (Opus 4.5)*
