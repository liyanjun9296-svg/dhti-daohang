/**
 * 后端评分引擎（与前端 engine/scoring.js 逻辑完全一致）
 * 用于服务端校验计算结果，防止前端篡改
 */

const LEVEL_NUM = { L: 1, M: 2, H: 3 }

function calcDimensionScores(answers, questions) {
  const scores = {}
  for (const q of questions) {
    if (answers[q.id] == null) continue
    scores[q.dim] = (scores[q.dim] || 0) + answers[q.id]
  }
  return scores
}

function scoresToLevels(scores, thresholds) {
  const levels = {}
  for (const [dim, score] of Object.entries(scores)) {
    if (score <= thresholds.L[1]) levels[dim] = 'L'
    else if (score >= thresholds.H[0]) levels[dim] = 'H'
    else levels[dim] = 'M'
  }
  return levels
}

function parsePattern(pattern) {
  return pattern.replace(/-/g, '').split('')
}

function matchType(userLevels, dimOrder, pattern) {
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

function determineResult(userLevels, dimOrder, standardTypes, specialTypes, options = {}) {
  const rankings = standardTypes.map((type) => ({
    ...type,
    ...matchType(userLevels, dimOrder, type.pattern),
  }))
  rankings.sort((a, b) => a.distance - b.distance || b.exact - a.exact || b.similarity - a.similarity)

  const best = rankings[0]
  const rage = specialTypes.find((t) => t.code === 'RAGE')
  const fallback = specialTypes.find((t) => t.code === 'HHHH')

  if (options.isRageDriver && rage) {
    return { primary: { ...rage, similarity: best.similarity, exact: best.exact }, secondary: best, rankings, mode: 'rage' }
  }
  if (best.similarity < 60 && fallback) {
    return { primary: { ...fallback, similarity: best.similarity, exact: best.exact }, secondary: best, rankings, mode: 'fallback' }
  }
  return { primary: best, secondary: rankings[1] || null, rankings, mode: 'normal' }
}

module.exports = { calcDimensionScores, scoresToLevels, determineResult }
