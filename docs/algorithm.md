# 导航 DHTI 算法文档

## 1. 项目来源与设计思路

本项目基于 **SBTI（Silly Behavioral Type Indicator）** 框架的源码理念（MIT License，原作者 pingfanfan/SBTI），将其核心"情景行为维度测量"方法论移植到**驾驶 / 导航场景**中，形成导航主题定制版测评系统。

### 三层体系总览：MBTI ⊃ SBTI ⊃ DHTI

```
MBTI（Myers-Briggs Type Indicator）
  ├─ 通用人格框架，4 个二元维度，16 种类型
  ├─ 1962 年由 Isabel Briggs Myers 发布
  └─ 衡量"静态特质"：I/E, N/S, T/F, J/P
       ↓ 框架借鉴，增加维度粒度
SBTI（Silly Behavioral Type Indicator）
  ├─ 情境行为框架，5 模型 × 3 子维度 = 15 维，27 种类型
  ├─ 2026 年由 B站 UP 主"蛆肉儿串儿"原创，pingfanfan 开源
  └─ 衡量"当代行为模式"：更细粒度、带荒诞感的社会人格
       ↓ 主题移植，驾驶情境专属化
DHTI（导航 DHTI，本项目）
  ├─ 驾驶场景框架，5 模型 × 3 子维度 = 15 维，27 种类型
  ├─ 基于 SBTI 源码改造，维度重命名为 NCRAS
  └─ 衡量"驾驶行为模式"：路感、车情、路途态度、行动、社交出行
```

| 对比项 | MBTI | SBTI | DHTI（本项目） |
|--------|------|------|----------------|
| 测量对象 | 静态人格特质 | 当代社会行为倾向 | 驾驶/导航行为倾向 |
| 维度数量 | 4 个二元维度 | 15 个子维度（5×3） | 15 个子维度（5×3） |
| 等级粒度 | 二元（I 或 E） | 三级（L / M / H） | 三级（L / M / H） |
| 匹配方式 | 字母组合直接映射 | 曼哈顿距离最近邻 | 曼哈顿距离最近邻 |
| 结果类型数 | 16 种 | 27 种（25+2 特殊） | 27 种（25+2 特殊） |
| 特殊机制 | 无 | 酒精隐藏人格触发 | 路怒彩蛋两步触发 |
| 风格定位 | 严肃学术 | 荒诞自嘲/网络梗 | 驾驶情境/趣味 |

SBTI 的核心洞察：**人在特定情境中的行为选择，比抽象特质描述更能反映其真实模式**。DHTI 将这一方法应用于"出行"这个每个人都熟悉的情境。

---

## 2. 测评模型：NCRAS

5 大维度模型，每个模型包含 3 个子维度，共 **15 个子维度**。

### N — 导航心理（Navigation Psychology）

| 子维度 | 名称 | 测量内容 |
|--------|------|----------|
| N1 | 路感自信 | 对空间方向的内在把握能力 |
| N2 | 目标清晰度 | 出行前对目的地和目的的明确程度 |
| N3 | 出行驱动力 | 效率导向 vs 过程导向 |

*MBTI 对应参考：N1/N2 类似 S（感觉）维度中的空间具身性；N3 类似 J/P 的效率倾向*

### C — 车内情感（Car Emotions）

| 子维度 | 名称 | 测量内容 |
|--------|------|----------|
| C1 | 路途焦虑感 | 面对不确定（堵车/迷路）时的情绪反应 |
| C2 | 出行投入度 | 对每次出行的认真程度和情感卷入 |
| C3 | 独行边界感 | 独处偏好 vs 社交偏好（驾车情境） |

*MBTI 对应参考：C1 类似 N（直觉）中的不确定耐受；C3 类似 I/E 维度在封闭空间中的投射*

### R — 路途态度（Road Attitude）

| 子维度 | 名称 | 测量内容 |
|--------|------|----------|
| R1 | 司机世界观 | 对他人驾驶行为的基本假设（善意 vs 恶意） |
| R2 | 规则灵活度 | 对交通规则的遵从程度 |
| R3 | 出行意义感 | 路途是否具有超越位移的意义 |

*MBTI 对应参考：R1 类似 T/F 的归因方式；R2 类似 J/P 的规则态度；R3 类似 N/S 的意义建构*

### A — 行动模式（Action Mode）

| 子维度 | 名称 | 测量内容 |
|--------|------|----------|
| A1 | 冒险导向 | 风险偏好（激进/保守） |
| A2 | 路线决策力 | 面对选项时的决策速度和确定性 |
| A3 | 行程执行力 | 出发前准备充分度和计划执行度 |

*MBTI 对应参考：A1 对应 N/S 中的风险感知；A2 对应 J/P 的决策模式；A3 对应 J（计划性）*

### S — 社交出行（Social Travel）

| 子维度 | 名称 | 测量内容 |
|--------|------|----------|
| S1 | 拼车主动性 | 出行中主动社交、邀约他人的倾向 |
| S2 | 车内边界感 | 对他人行为的接受边界 |
| S3 | 路况分享度 | 信息分享的主动性（外向表达 vs 内敛） |

*MBTI 对应参考：S1/S3 类似 E/I 维度的社交主动性；S2 类似 J/P 的边界设定*

---

## 3. 评分算法

### 3.1 原始分计算

每道题有 3 个选项（`value = 1/2/3`），每个题目标注了所属子维度（`dim`）。

每个子维度由 **2 道题**组成，原始分范围为 **2 ~ 6 分**。

```
calcDimensionScores(answers, questions):
  for each question q:
    scores[q.dim] += answers[q.id]
```

### 3.2 等级转换（L/M/H）

| 等级 | 原始分 | 数值映射 |
|------|--------|----------|
| L（低） | 2 ~ 3 | 1 |
| M（中） | 4 | 2 |
| H（高） | 5 ~ 6 | 3 |

```
scoresToLevels(scores, thresholds):
  if score <= 3  → L
  if score >= 5  → H
  else           → M
```

### 3.3 人格匹配（曼哈顿距离）

每种人格类型有一个 **15 字符的特征模式**（pattern），格式如：`HHH-HHH-HHH-HHH-HHH`（连字符仅用于可读性，计算时忽略）。

匹配算法：对用户的 15 个维度等级与每种类型的模式逐维度比较，计算**曼哈顿距离**。

```
matchType(userLevels, dimOrder, pattern):
  distance = 0
  exact = 0
  for each dimension dim[i]:
    diff = |levelNum(userLevels[dim]) - levelNum(pattern[i])|
    distance += diff
    if diff == 0: exact++
  
  similarity = max(0, round((1 - distance / 30) * 100))
  return { distance, exact, similarity }
```

**最大距离 30** 的推导：15 个维度，每个维度最大差距为 2（L=1, H=3），所以 `15 × 2 = 30`。

相似度公式：`similarity = (1 - distance/30) × 100%`

所有标准类型按 `distance ASC → exact DESC → similarity DESC` 排序，取 distance 最小者为最佳匹配。

### 3.4 兜底与特殊逻辑

| 情况 | 触发条件 | 结果 |
|------|----------|------|
| 正常匹配 | 最高相似度 ≥ 60% | 返回 `primary = best` |
| 兜底模式 | 最高相似度 < 60% | 返回 `primary = 随缘兜底侠（HHHH）` |
| 路怒彩蛋 | `isRageDriver = true` | 返回 `primary = 路怒者（RAGE）` |

返回结构：`{ primary, secondary, rankings, mode, scores, levels, dimOrder, dimDefs }`

---

## 4. 路怒彩蛋机制

这是一个两步触发的隐藏人格系统：

```
Step 1：rage_gate_q1 插入
  后端在第 8~12 题随机位置插入特殊题（kind = 'rage_gate'）
  前端展示该题，用户无感知（外观与普通题相同）

Step 2：用户选择触发值
  rage_gate_q1 选第 3 项（"偶尔会在车里骂两句"）
  → 前端动态在当前题目后插入追问 rage_gate_q2

Step 3：追问确认
  rage_gate_q2 选第 2 项（"一旦上路脾气就上来了"）
  → isRageDriver = true

Step 4：提交时传递
  POST /api/result 的 body 中带 isRageDriver: true
  后端 determineResult 走路怒分支
```

如果用户在 Step 2 改选其他选项，追问题会被自动移除并重置标志。

---

## 5. 27 种人格类型

### 25 种标准类型

| 代码 | 名称 | 特征模式 | 简介 |
|------|------|----------|------|
| NAVI | 路神 | HHH-HHH-HHH-HHH-HHH | 全维度最高，传奇级别 |
| FAST | 速度怪 | HHL-LHH-LLH-HHH-LHL | 效率至上，油门是正义 |
| CTRL | 掌盘手 | HHH-HMH-MHH-HHH-MHM | 极强掌控欲，备选方案永远有 |
| VIBE | 路途冥想家 | LMH-HLH-HHL-LML-LHM | 享受过程，堵车也是禅 |
| SOLO | 孤独行者 | HHL-LLH-LHL-LML-LHM | 独行偏好，副驾留给包 |
| MOM | 车内管家婆 | MHH-HMM-HHM-MMH-MHL | 照顾全车人，安全第一 |
| BOSS | 出行CEO | HHH-HMH-MMH-HHH-LHL | 行程必须我来规划 |
| DRIFTR | 随机漂移侠 | MLH-MHM-MLH-MLH-LMH | 没有固定剧本，意外是惊喜 |
| MONK | 行者 | HHL-LLH-LLM-MML-LHM | 异乎寻常的平静，急没有用 |
| RADAR | 路况播报员 | MLH-MLH-HLH-MLM-MLH | 导航软件忠实共建者 |
| OG8K | 随缘司机 | MMH-MMM-HML-LMM-MML | 两个字：随缘 |
| PLAN | 行程规划师 | HHH-MML-HMH-HHH-MHM | ETA 差一分钟都受不了 |
| GHOST | 隐身出行者 | HHL-HMH-MLH-MHM-LHH | 来去无声，低调自由 |
| CHILL | 慢生活选手 | MLL-LHL-LLM-MLL-HLH | 不被快劫持，看窗外风景 |
| GPS | 人形GPS | HHH-HMH-MHH-HHM-LHH | 路感变态，去过一次记住 |
| CHEAP | 省钱达人 | HHL-MLH-LMH-HHH-LHL | 避高速费是原则问题 |
| WILD | 野路探索家 | MLH-MHH-LLH-HMH-HLM | 导航没到达的地方才有意思 |
| RELAY | 拼车组织者 | MLH-HML-HHL-MLM-HLM | 后排永远有人，不冷清 |
| LOST | 导航依赖症 | LLL-LLM-LML-LLL-LHM | 没导航不敢出发 |
| FLEX | 随机应变王 | MHH-MLM-MLH-MHM-HMM | 无论发生什么总能找下一步 |
| （其余5种） | — | — | 待补充 |

### 2 种特殊类型

| 代码 | 名称 | 触发条件 |
|------|------|----------|
| RAGE | 路怒者 | 路怒彩蛋两步触发 |
| HHHH | 随缘兜底侠 | 最高相似度 < 60% |

---

## 6. 前后端架构说明

```
用户答题（前端 QuizView）
    ↓
setAnswer() 实时记录答案 + 路怒彩蛋逻辑
    ↓
calcResult() → POST /api/result
    ↓
后端：calcDimensionScores → scoresToLevels → determineResult
    ↓
返回：{ primary, secondary, rankings, mode, scores, levels, dimOrder, dimDefs }
    ↓
前端 ResultView 展示：人格信息 + 雷达图 + TOP5 + 维度详情
```

**离线降级**：前端 `api/quiz.js` 实现了完整的本地计算降级，后端不可用时自动使用本地数据和引擎计算结果，用户无感知。

---

## 7. 响应式布局方案

### 断点设计

| 断点 | 触发宽度 | 布局效果 |
|------|----------|----------|
| 移动端 | < 768px | 480px 卡片居中，四周灰色背景，悬浮阴影 |
| 桌面端 | ≥ 768px | 100% 全屏铺满，无卡片边框，内容 max-width: 1200px 居中 |

### 实现位置

- `App.vue`：全局 `body` 和 `.app-wrapper` 的断点切换
- 各 View 文件：scoped `@media (min-width: 768px)` 控制内容宽度和居中

---

## 8. 角色配图规划

### 版权说明

MBTI 官方角色插图和 SBTI 的角色形象均为版权保护资产，**不可直接使用或爬取**。

### 推荐方案：AI 生图

为 27 种人格类型各生成一张风格统一的角色插图，建议使用 Midjourney 或 DALL-E。

**文件规范**
- 存放路径：`frontend/src/assets/types/{CODE}.png`
- 推荐尺寸：400×400px，透明背景或统一背景色
- 命名规则：与 `types.json` 中 `code` 字段完全一致（大写）

**接入方式**：在 `types.json` 每个类型中添加 `image` 字段：

```json
{
  "code": "NAVI",
  "cn": "路神",
  "image": "NAVI.png",
  ...
}
```

前端 `ResultView.vue` 中读取：

```js
const imgSrc = `/src/assets/types/${primary.image}`
```

### 27 种类型 AI 生图参考提示词

| 代码 | 中文名 | 英文提示词参考 |
|------|--------|----------------|
| NAVI | 路神 | confident navigator with glowing brain-map, no phone needed, cartoon driver |
| FAST | 速度怪 | speed-obsessed driver, speedometer eyes, always in a hurry, cartoon style |
| CTRL | 掌盘手 | strategic driver with multiple backup plans on dashboard, control freak, cartoon |
| VIBE | 路途冥想家 | zen driver, eyes half-closed, enjoying traffic jam, floating musical notes |
| SOLO | 孤独行者 | lone driver, empty passenger seat with jacket on it, peaceful expression |
| MOM | 车内管家婆 | caring driver checking on all passengers, motherly, safety first cartoon |
| BOSS | 出行CEO | executive driver, planning entire trip on tablet, business suit cartoon |
| DRIFTR | 随机漂移侠 | spontaneous driver, no destination planned, happy going anywhere cartoon |
| MONK | 行者 | ultra-calm driver meditating while in traffic, traffic zen master cartoon |
| RADAR | 路况播报员 | driver reporting road conditions on phone, radar dish as hat, cartoon |
| OG8K | 随缘司机 | extremely relaxed driver, "whatever" expression, no care in the world |
| PLAN | 行程规划师 | obsessive planner driver, multiple checklists, ETA countdown on screen |
| GHOST | 隐身出行者 | invisible driver with ghost outline, no social media, low profile cartoon |
| CHILL | 慢生活选手 | slow-lane driver, watching scenery, music notes around, relaxed smile |
| GPS | 人形GPS | human GPS driver, map patterns on brain, perfect spatial memory cartoon |
| CHEAP | 省钱达人 | budget driver avoiding toll roads, calculator in hand, piggy bank cartoon |
| WILD | 野路探索家 | off-road adventurer driver, exploring unmapped paths, explorer hat |
| RELAY | 拼车组织者 | social driver organizing carpools, multiple friends in car, coordinator |
| LOST | 导航依赖症 | terrified driver without GPS signal, clinging to phone, lost expression |
| FLEX | 随机应变王 | adaptable driver, calmly handling unexpected situation, problem-solver |
| RAGE | 路怒者 | angry driver, steam from head, gripping wheel hard, road rage cartoon |
| HHHH | 随缘兜底侠 | undefined personality, question marks around head, mysterious smile |

---

## 9. DHTI 与 MBTI 的映射关系

### 为什么数量不同

MBTI 通过 4 个二元维度定义 16 种人格（2⁴=16）。
DHTI 通过 15 个三级维度在"驾驶情境"下收敛出 20 种标准人格。

两者**不是翻译关系，而是粒度关系**：
- MBTI 是通用人格的宏观分类
- DHTI 是驾驶行为的情境细分

同一个 MBTI 类型在驾驶场景下，因关注点不同可以"分裂"为多个 DHTI 子类型。
例如同样是 ISTJ（守序务实），驾驶时可以表现为：
计划控（PLAN）、人形GPS（GPS）、省钱达人（CHEAP）——三种不同侧重。

### 一对多映射表

| MBTI | 颜色 | 分组 | 对应DHTI类型 |
|------|------|------|--------------|
| INTJ | 🟣 紫 | 分析家 | NAVI（路神）/ GHOST（隐身出行者） |
| ENTJ | 🟣 紫 | 分析家 | CTRL（掌盘手）/ BOSS（出行CEO） |
| ENTP | 🟣 紫 | 分析家 | FLEX（随机应变王） |
| INTP | 🟣 紫 | 分析家 | —（待补充） |
| INFP | 🟢 绿 | 外交家 | VIBE（路途冥想家） |
| ENFP | 🟢 绿 | 外交家 | DRIFTR（随机漂移侠） |
| ENFJ | 🟢 绿 | 外交家 | RADAR（路况播报员）/ RELAY（拼车组织者） |
| INFJ | 🟢 绿 | 外交家 | —（待补充） |
| ISTP | 🟡 黄 | 探险家 | SOLO（孤独行者）/ WILD（野路探索家） |
| ISFP | 🟡 黄 | 探险家 | MONK（行者）/ OG8K（随缘司机）/ CHILL（慢生活选手） |
| ESTP | 🟡 黄 | 探险家 | FAST（速度怪） |
| ESFP | 🟡 黄 | 探险家 | —（待补充） |
| ISTJ | 🔵 青 | 守护者 | PLAN（行程规划师）/ GPS（人形GPS）/ CHEAP（省钱达人） |
| ISFJ | 🔵 青 | 守护者 | LOST（导航依赖症）/ MOM（车内管家婆） |
| ESTJ | 🔵 青 | 守护者 | —（待补充） |
| ESFJ | 🔵 青 | 守护者 | —（待补充） |

> 4 种 MBTI 类型（INTP / INFJ / ESFP / ESTJ）在当前 20 种标准人格中无直接对应，
> 说明这些人格在驾驶行为情境下特征不够显著，后续扩充人格库时可补充。

### MBTI 颜色在 DHTI 中的应用

每种 DHTI 类型继承对应 MBTI 分组的主题色，用于结果页卡片、配图背景、TOP5 颜色标记。

| 颜色 | 色值 | DHTI数量 | 代表特质 |
|------|------|---------|----------|
| 🟣 紫（分析家） | `#8B5CF6` | 5种 | 战略性、独立、掌控 |
| 🟢 绿（外交家） | `#10B981` | 4种 | 意义感、共情、社区 |
| 🟡 黄（探险家） | `#F59E0B` | 6种 | 自由、当下、随性 |
| 🔵 青（守护者） | `#06B6D4` | 5种 | 可靠、计划、守序 |

颜色落地方案：在 `types.json` 每个类型中添加 `mbti` 和 `color` 字段：

```json
{
  "code": "CTRL",
  "cn": "掌盘手",
  "mbti": "ENTJ",
  "color": "#8B5CF6",
  ...
}
```

---

## 10. SBTI 27 种类型完整参考

> 原作：B站 UP 主"蛆肉儿串儿"，开源复刻：pingfanfan/SBTI（MIT License）。
> DHTI 的架构、评分算法和数据结构均移植自此仓库。

### SBTI 4 大聚类与颜色

| 聚类 | 颜色 | 色值 | 维度和范围 | 核心特质 |
|------|------|------|-----------|---------|
| 🔴 高功能执行群 | 红 | `#EF4444` | 38–41 | 强掌控、高执行、社会资源掌控者 |
| 🟣 高认知独立群 | 紫 | `#8B5CF6` | 34–37 | 清醒、独立、拒绝内耗 |
| 🟢 情感关怀群 | 绿 | `#10B981` | 28–33 | 共情、给予、情绪中间态 |
| 🟡 社交混沌群 | 橙黄 | `#F59E0B` | 24–31 | 适应、随性、表面松弛 |
| ⚫ 低能量边缘群 | 灰 | `#6B7280` | 20–24 | 疲惫、虚无、丧文化 |
| 🔵 焦虑内耗群 | 蓝 | `#06B6D4` | 22–28 | 自我攻击、焦虑、敏感 |

### 25 种标准类型

| 代码 | 中文名 | 英文名 | 性格一句话 | 颜色聚类 | 特征模式（S-E-A-Ac-So） |
|------|--------|--------|-----------|---------|-------------------------|
| CTRL | 拿捏者 | The Handler | 运筹帷幄，一切尽在掌控 | 🔴 红 | HHH-HMH-MHH-HHH-LHL |
| BOSS | 领导者 | The Boss | 给我方向盘，行程我来定 | 🔴 红 | HHH-HMH-MMH-HHH-LHL |
| GOGO | 行人 | The Go-Goer | gogogo~出发，想这么多干嘛 | 🔴 红 | HHM-HMH-MMH-HHH-MHM |
| SEXY | 尤物 | The Heartthrob | 我一进门，照明系统都自动调暗 | 🟢 绿 | HMH-HHL-HMM-HMM-HLH |
| LOVE-R | 多情者 | The Lover | 爱意太满，现实总显得贫瘠 | 🟢 绿 | MLH-LHL-HLH-MLM-MLH |
| MUM | 妈妈型 | The Mom Friend | 后排系好安全带，零食我备了 | 🟢 绿 | MHH-HMM-HHM-MMH-MHL |
| ATM-er | 送钱者 | The Walking ATM | 不好意思拒绝，习惯性付出 | 🟢 绿 | MML-MLM-MLH-MMM-MHL |
| THAN-K | 感恩者 | The Thanker | 你对我的一点好，我记很久 | 🟢 绿 | MMH-MMM-HML-LMM-MML |
| FAKE | 伪人 | The Chameleon | 见谁都能聊，但聊完自己空了 | 🟡 橙黄 | MHM-LMH-MLH-MHM-HMM |
| OJBK | 无所谓人 | The Whatever | 都行，真的，随便，没所谓 | 🟡 橙黄 | MLM-LMM-MLL-LLM-MLL |
| MALO | 吗喽 | The Chaos Monkey | 人生是副本，我只是打工吗喽 | 🟡 橙黄 | LLM-LMH-LLH-MLH-HLM |
| JOKE-R | 小丑 | The Jester | 负责活跃气氛，但没人发现我不开心 | 🟡 橙黄 | LML-LLM-LML-LLL-MLL |
| WOC! | 震惊人 | The Whoa Person | 卧槽！这是什么人格！ | 🟣 紫 | HHL-MLH-LMH-HHH-LHL |
| THIN-K | 思考者 | The Thinker | 深度思考中，100秒不够用 | 🟣 紫 | HHL-MLH-HMH-HMH-LHM |
| SHIT | 草者 | The Malcontent | 这世界就是一坨…算了 | 🟣 紫 | HML-MML-HHL-HMH-LHL |
| POOR | 贫困者 | The Specialist | 我穷，但我精准，激光打哪儿哪儿冒烟 | 🟣 紫 | HHL-MLH-LMH-HHH-LHL |
| MONK | 僧人 | The Monk | 万物皆有独立轨道，人与人亦然 | 🔵 蓝 | HHL-LLH-LLM-MML-LHM |
| SOLO | 孤儿 | The Loner | 哭了，怎么会是孤独人格 | 🔵 蓝 | LML-LLH-LHL-LML-LHM |
| IMSB | 傻者 | The Self-Roaster | 认真的么？我真的是sb么？ | 🔵 蓝 | LLM-LMM-LLL-LLL-MLM |
| OH-NO | 哦不人 | The Alarmist | 哦不！这杯子再往右一厘米就要掉了！ | 🔵 蓝 | MML-LMH-MHH-MML-MML |
| DEAD | 死者 | The Deadpan | 我还活着吗？不确定，也无所谓 | ⚫ 灰 | LLL-LLM-LML-LLL-LHM |
| IMFW | 废物 | The Fragile One | 真的是废物吗？不是，只是耗尽了 | ⚫ 灰 | LLH-LHL-LML-LLL-MLL |
| ZZZZ | 装死者 | The Snoozer | 我没死，我只是在等 deadline | ⚫ 灰 | LLM-LLM-LLL-LML-LLL |
| FUCK | 草者 | The Wild One | 人形野草，除草剂无效 | ⚫ 灰 | HML-MML-LLH-HMH-HLM |
| Dior-s | 屌丝 | The Cynic Sage | 一边觉得自己不行，一边等着逆袭 | ⚫ 灰 | LMH-LLL-LLM-LMM-LLH |

### 2 种特殊类型

| 代码 | 中文名 | 英文名 | 触发条件 | 性格一句话 |
|------|--------|--------|---------|-----------|
| HHHH | 傻乐者 | The Goofball | 距离所有类型 > 12（兜底） | 哈哈哈哈哈哈，反正笑就对了 |
| DRUNK | 酒鬼 | The Drunkard | 隐藏分支题答"喝酒" | 烈酒烧喉，清醒从来不是选项 |

---

## 11. MBTI ⊃ SBTI ⊃ DHTI 三层完整映射

> 阅读说明：同一行代表"同一底层人格特质"在三个不同框架下的对应体现。
> DHTI 是 SBTI 的驾驶情境移植版，类型数量相同（均27种），维度并行对应。

### SBTI 维度 → DHTI 维度 平行关系

| SBTI 模型 | SBTI 子维度 | DHTI 模型 | DHTI 子维度 |
|-----------|------------|-----------|------------|
| S 自我模型 | S1 自尊自信 / S2 自我清晰度 / S3 核心价值观 | N 导航心理 | N1 路感自信 / N2 目标清晰度 / N3 出行驱动力 |
| E 情感模型 | E1 依恋安全感 / E2 情感投入度 / E3 边界与依赖 | C 车内情感 | C1 路途焦虑感 / C2 出行投入度 / C3 独行边界感 |
| A 态度模型 | A1 世界观倾向 / A2 规则与灵活 / A3 人生意义感 | R 路途态度 | R1 司机世界观 / R2 规则灵活度 / R3 出行意义感 |
| Ac 行动驱力 | Ac1 动机取向 / Ac2 决策风格 / Ac3 执行模式 | A 行动模式 | A1 冒险导向 / A2 路线决策力 / A3 行程执行力 |
| So 社交模型 | So1 社交主动性 / So2 人际边界 / So3 表达与真实 | S 社交出行 | S1 拼车主动性 / S2 车内边界感 / S3 路况分享度 |

> **结论**：DHTI 的 NCRAS 模型与 SBTI 的 SEAActSo 模型逐一平行，维度语义高度一致，差异仅在于情境词汇（"自尊自信" → "路感自信"）。

### 三层人格体系完整对照表

| MBTI 类型 | 颜色组 | SBTI 类型 | DHTI 类型 | 核心特质 |
|-----------|--------|-----------|-----------|---------|
| INTJ | 🟣 紫·分析家 | CTRL 拿捏者 | NAVI 路神 / GHOST 隐身出行者 | 战略掌控，独立自足 |
| ENTJ | 🟣 紫·分析家 | BOSS 领导者 / CTRL 拿捏者 | CTRL 掌盘手 / BOSS 出行CEO | 强执行，高掌控，主导一切 |
| ENTP | 🟣 紫·分析家 | FAKE 伪人 | FLEX 随机应变王 | 适应力强，随机应变 |
| INTP | 🟣 紫·分析家 | THIN-K 思考者 | GPS 人形GPS | 深度分析，独立思考 |
| INFP | 🟢 绿·外交家 | LOVE-R 多情者 | VIBE 路途冥想家 | 意义感强，享受过程 |
| ENFP | 🟢 绿·外交家 | MALO 吗喽 | DRIFTR 随机漂移侠 | 随性冲动，探索新鲜 |
| ENFJ | 🟢 绿·外交家 | THAN-K 感恩者 / ATM-er 送钱者 | RADAR 路况播报员 / RELAY 拼车组织者 | 连接他人，社群凝聚 |
| INFJ | 🟢 绿·外交家 | MONK 僧人 | —（待补充） | 深度意义感，独处修炼 |
| ISTP | 🟡 黄·探险家 | SOLO 孤儿 | SOLO 孤独行者 / WILD 野路探索家 | 独立动手，探索未知 |
| ISFP | 🟡 黄·探险家 | OJBK 无所谓人 / MONK 僧人 | MONK 行者 / OG8K 随缘司机 / CHILL 慢生活选手 | 随缘自在，拒绝内卷 |
| ESTP | 🟡 黄·探险家 | GOGO 行人 | FAST 速度怪 | 行动优先，效率第一 |
| ESFP | 🟡 黄·探险家 | SEXY 尤物 | —（待补充） | 高存在感，吸引力强 |
| ISTJ | 🔵 青·守护者 | OH-NO 哦不人 / POOR 贫困者 | PLAN 行程规划师 / GPS 人形GPS / CHEAP 省钱达人 | 计划严谨，规则守序 |
| ISFJ | 🔵 青·守护者 | MUM 妈妈型 | MOM 车内管家婆 / LOST 导航依赖症 | 照顾他人，安全第一 |
| ESTJ | 🔵 青·守护者 | BOSS 领导者 | —（待补充） | 组织管理，效率导向 |
| ESFJ | 🔵 青·守护者 | ATM-er 送钱者 | —（待补充） | 群体和谐，给予付出 |

> 特殊类型不在 MBTI 体系内：
> - RAGE / FUCK → 特定情绪激活，无对应 MBTI
> - HHHH / DRUNK → 测试特殊逻辑触发，无 MBTI 对应
