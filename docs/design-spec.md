# DHTI 设计规范

## 设计工具

- **设计稿**：`DHTI.pen`（项目根目录，Pencil 格式）
- **双向同步**：Pencil MCP ↔ Vue 代码
- **MCP 启动**：
  ```bash
  ~/.pencil/mcp/comate/out/mcp-server-darwin-arm64 --app comate --http --http-port 3846 &
  ```
- **画布尺寸**：1920×1080（QuizView / HomeView），1920×2200（ResultView 长页）

---

## 颜色系统

| Token | 色值 | 用途 |
|-------|------|------|
| `--bg-dark` | `#000000` | Hero 区背景、顶栏 |
| `--bg-light` | `#f5f5f7` | 内容区背景、选项默认态 |
| `--surface` | `#ffffff` | 卡片背景、InfoSection |
| `--blue` | `#0071e3` | 主色调、CTA、进度条、已选选项 |
| `--text-dark` | `#1d1d1f` | 正文 |
| `--text-secondary` | `#6e6e73` | 描述文字 |
| `--text-tertiary` | `#86868b` | 辅助标注、题号 |
| `--text-white` | `#ffffff` | 深色背景上的文字 |
| `#181818` | — | 角色图圆形背景 |
| `rgba(0,0,0,0.72)` | — | 毛玻璃 Header（配合 backdrop-filter blur） |

---

## 布局规范

| 属性 | 值 |
|------|----|
| 内容最大宽度 `--max-width` | **1250px** |
| 左右边距（1920px 下） | 335px（自动居中） |
| Hero 内容垂直间距 | **gap: 64px** |
| Hero padding | **64px** 上下左右 |
| Hero 最小高度（HomeView） | 804px |
| 卡片圆角 `--r-md` | 12px |
| 大卡片圆角 | 16px |
| 胶囊圆角 `--r-pill` | 980px |

---

## 字体规格

| 层级 | 字号 | 字重 | 用途 |
|------|------|------|------|
| Hero 主标题 | 64px | 600 | HomeView/ResultView 大标题 |
| Hero 副标题 | 24px | 400 | 标题下方说明 |
| 结果代码 | 72px | 600 | ResultView 人格代码（NAVI 等） |
| 中文名 | 36px | 400 | 人格中文名 |
| 数据大字 | 28px | 600 | Stats 数字 |
| 正文 | 17px | 400/500 | 题目、描述 |
| 选项 | 15px | 400 | 答题选项 |
| 标注/标签 | 12–13px | 400–600 | 题号、badge、维度标注 |

---

## 组件规范

### Badge 胶囊标签
- 高度：26px，横向 padding：12px
- 边框：`1px solid rgba(255,255,255,0.18)`
- 字色：`rgba(255,255,255,0.48)`，字号：12px

### Stats 数据框
- 尺寸：380×80px，圆角：12px
- 边框：`1px solid rgba(255,255,255,0.14)`
- 三列用 1px 分隔线隔开

### CTA 主按钮
- 尺寸：280×50px，圆角：12px
- 背景：`#0071e3`，文字白色，字号：17px

### 进度条
- 轨道：`rgba(255,255,255,0.18)`，高度：4px，圆角：2px
- 填充：`#0071e3`

### 题目卡片（QuizView）
- 背景：`#ffffff`，圆角：16px，padding：24px
- 选项高度：48px，圆角：10px
- 默认态：`#f5f5f7`；选中态：`#0071e3`（白色文字 + ✓ 图标）

### 角色图 Avatar（ResultView）
- 容器：200×200px，`border-radius: 50%`，背景：`#181818`，`overflow: hidden`
- 图片尺寸：302×302px，`object-fit: cover`（圆形裁切溢出）

### 毛玻璃顶栏
- 背景：`rgba(0,0,0,0.72)`
- 效果：`backdrop-filter: saturate(180%) blur(20px)`
- 高度：48–56px

---

## 图片资源规范

| 文件 | 路径 | 尺寸 | 说明 |
|------|------|------|------|
| 百度地图 Logo | `public/baidu-logo.png` | 78×78 | 首页图标，圆角 19px |
| 结果页占位图 | `public/types/placeholder.png` | 302×302 | 角色图 fallback |
| 人格角色图 | `public/types/{CODE}.png` | 302×302 | 27 种各一张（待添加） |

**角色图命名规则**：使用大写人格代码，如 `NAVI.png`、`RAGE.png`、`HHHH.png`

**生图建议**：提示词见 `docs/character-prompts.md`（已含 MBTI/SBTI 对应注释）

---

## 页面结构速查

### HomeView（黑 + 白）
```
黑色 Hero（min-height: 804px）
  └─ HeroContent（max-width: 1250px，vertical flex，gap: 64px）
       ├─ Badges 行（pill × 2）
       ├─ Logo（78×78）
       ├─ Title + Subtitle
       ├─ Stats box（380px）
       └─ CTA 区（按钮 + 副文案）
白色 InfoSection
  └─ 描述文字（620px）+ 免责声明框
```

### QuizView（灰底 + 深色顶栏）
```
毛玻璃 Header（sticky，56px）
  └─ 返回键 + 进度条 + 百分比
QuizBody（max-width: 1250px，垂直 flex）
  └─ Q1Card、Q2Card…（每题：题号 + 题目 + 4个竖向选项）
固定 Footer（底部渐变 + 提交按钮）
```

### ResultView（黑 Hero 上 + 灰底下 = 长页）
```
毛玻璃 Nav（sticky，48px）
黑色 Hero（600px）
  └─ Avatar（200px 圆）→ 相似度 → 代码 → 中文名 → 介绍 → Tags
浅灰 Body（含多个白色卡片）
  ├─ 人格描述
  ├─ 出行模式
  ├─ 15维度雷达图
  ├─ Top5 匹配列表
  ├─ 15维度详情（可折叠）
  └─ 重测按钮
```
