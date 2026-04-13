/**
 * 导航DHTI 评分引擎
 * 移植自 pingfanfan/SBTI (MIT License)
 * 算法逻辑完全保持原版，维度名称替换为导航主题
 *
 * 算法流程：
 * 1. calcDimensionScores: 答案 → 维度原始分（2-6）
 * 2. scoresToLevels:      原始分 → L/M/H 三级
 * 3. matchType:           用户向量 vs 类型 pattern → 曼哈顿距离
 * 4. determineResult:     匹配所有类型 + 应用特殊覆盖 → 最终结果
 */

/**
 * 步骤1：按维度累加答案分值
 * 每维度2道题，每题答案 1/2/3，相加范围 2-6
 *
 * @param {Object} answers - { q1: 2, q2: 3, ... }
 * @param {Array}  questions - 题目定义数组（含 id, dim 字段）
 * @returns {Object} - { N1: 5, N2: 3, C1: 4, ... }
 */
export function calcDimensionScores(answers, questions) {
  const scores = {}
  for (const q of questions) {
    if (answers[q.id] == null) continue
    scores[q.dim] = (scores[q.dim] || 0) + answers[q.id]
  }
  return scores
}

/**
 * 步骤2：原始分 → L/M/H 等级
 * 默认阈值：L=[2,3], M=[4,4], H=[5,6]
 *
 * @param {Object} scores     - { N1: 5, ... }
 * @param {Object} thresholds - { L: [2,3], M: [4,4], H: [5,6] }
 * @returns {Object} - { N1: 'H', N2: 'L', ... }
 */
export function scoresToLevels(scores, thresholds) {
  const levels = {}
  for (const [dim, score] of Object.entries(scores)) {
    if (score <= thresholds.L[1]) levels[dim] = 'L'
    else if (score >= thresholds.H[0]) levels[dim] = 'H'
    else levels[dim] = 'M'
  }
  return levels
}

/** 等级→数值映射（用于曼哈顿距离计算） */
const LEVEL_NUM = { L: 1, M: 2, H: 3 }

/**
 * 解析类型 pattern 字符串为数组
 * "HHL-LHH-LLH-HHH-LHL" → ['H','H','L','L','H','H','L','L','H','H','H','H','L','H','L']
 *
 * @param {string} pattern
 * @returns {string[]}
 */
export function parsePattern(pattern) {
  return pattern.replace(/-/g, '').split('')
}

/**
 * 步骤3：计算用户向量与某类型 pattern 的曼哈顿距离
 * 距离 = Σ|用户值 - 类型值|，范围 [0, 30]（15维 × 最大差2）
 * 匹配度 = max(0, round((1 - 距离/30) × 100))
 *
 * @param {Object} userLevels - { N1: 'H', N2: 'L', ... }
 * @param {Array}  dimOrder   - 维度顺序数组，如 ['N1','N2',...,'S3']
 * @param {string} pattern    - "HHL-LHH-..."
 * @returns {{ distance: number, exact: number, similarity: number }}
 */
export function matchType(userLevels, dimOrder, pattern) {
  const typeLevels = parsePattern(pattern)
  let distance = 0
  let exact = 0

  for (let i = 0; i < dimOrder.length; i++) {
    const userVal = LEVEL_NUM[userLevels[dimOrder[i]]] || 2
    const typeVal = LEVEL_NUM[typeLevels[i]] || 2
    const diff = Math.abs(userVal - typeVal)
    distance += diff
    if (diff === 0) exact++
  }

  const similarity = Math.max(0, Math.round((1 - distance / 30) * 100))
  return { distance, exact, similarity }
}

/**
 * 步骤4：匹配所有类型，排序，应用特殊规则
 *
 * 排序规则：距离升序 → 精准命中数降序 → 相似度降序
 * 特殊规则：
 *   - isRageDriver=true → 强制覆盖为 RAGE 路怒者
 *   - 最高相似度 < 60   → 兜底为 HHHH 随缘兜底侠
 *
 * @param {Object} userLevels
 * @param {Array}  dimOrder
 * @param {Array}  standardTypes - 标准人格类型数组
 * @param {Array}  specialTypes  - 特殊人格类型数组（RAGE / HHHH）
 * @param {Object} options       - { isRageDriver: boolean }
 * @returns {{ primary, secondary, rankings, mode }}
 */
export function determineResult(userLevels, dimOrder, standardTypes, specialTypes, options = {}) {
  // 计算所有标准类型的匹配距离
  const rankings = standardTypes.map((type) => ({
    ...type,
    ...matchType(userLevels, dimOrder, type.pattern),
  }))

  // 排序：距离升序 → 精确命中降序 → 相似度降序
  rankings.sort(
    (a, b) => a.distance - b.distance || b.exact - a.exact || b.similarity - a.similarity
  )

  const best = rankings[0]
  const rage = specialTypes.find((t) => t.code === 'RAGE')
  const fallback = specialTypes.find((t) => t.code === 'HHHH')

  // 路怒彩蛋覆盖
  if (options.isRageDriver && rage) {
    return {
      primary: { ...rage, similarity: best.similarity, exact: best.exact },
      secondary: best,
      rankings,
      mode: 'rage',
    }
  }

  // 相似度过低时兜底
  if (best.similarity < 60 && fallback) {
    return {
      primary: { ...fallback, similarity: best.similarity, exact: best.exact },
      secondary: best,
      rankings,
      mode: 'fallback',
    }
  }

  return {
    primary: best,
    secondary: rankings[1] || null,
    rankings,
    mode: 'normal',
  }
}
