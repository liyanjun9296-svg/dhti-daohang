/**
 * API 层
 * 封装与后端的通信；API 失败时自动降级到本地数据（离线可用）
 */
import localQuestions from '@/data/questions.json'
import localDimensions from '@/data/dimensions.json'
import localTypes from '@/data/types.json'
import localConfig from '@/data/config.json'
import {
  calcDimensionScores,
  scoresToLevels,
  determineResult,
} from '@/engine/scoring.js'

const BASE_URL = import.meta.env.VITE_API_BASE || 'http://localhost:3001/api'

/**
 * Fisher-Yates 洗牌：打乱主题目顺序，rage_gate_q1 保持在第 8-12 位
 * 每次答题顺序不同，但评分结果不受影响（评分引擎按 question.id 计算）
 */
function shuffleQuestions(questions) {
  // 1. 分离 rage_gate_q1（特殊题，需保持在中间位置）
  const gateIdx = questions.findIndex(q => q.id === 'rage_gate_q1')
  const gateQ = gateIdx > -1 ? questions.splice(gateIdx, 1)[0] : null

  // 2. Fisher-Yates 打乱剩余主题目
  for (let i = questions.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [questions[i], questions[j]] = [questions[j], questions[i]]
  }

  // 3. 把 rage_gate_q1 插回第 8-12 位（避免第一题就触发路怒彩蛋）
  if (gateQ) {
    const pos = Math.floor(Math.random() * 5) + 8
    questions.splice(pos, 0, gateQ)
  }

  return questions
}

/**
 * 获取题目列表
 * 优先请求后端；失败时使用本地数据（特殊题插入第10题后）
 */
export async function fetchQuestions() {
  try {
    const res = await fetch(`${BASE_URL}/questions`, { signal: AbortSignal.timeout(3000) })
    if (!res.ok) throw new Error('API error')
    const data = await res.json()
    return {
      questions: shuffleQuestions(data.questions),
      specialQuestions: data.specialQuestions,
      totalMain: data.totalMain,
    }
  } catch {
    // 降级：本地数据
    const main = [...localQuestions.main]
    const gateQ = localQuestions.special.find(q => q.kind === 'rage_gate')
    if (gateQ) main.splice(10, 0, gateQ)
    return {
      questions: shuffleQuestions(main),
      specialQuestions: localQuestions.special,
      totalMain: localQuestions.main.length,
    }
  }
}

/**
 * 提交答案，获取结果
 * 优先请求后端；失败时本地计算
 */
export async function submitAnswers(answers, isRageDriver) {
  try {
    const res = await fetch(`${BASE_URL}/result`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ answers, isRageDriver }),
      signal: AbortSignal.timeout(5000),
    })
    if (!res.ok) throw new Error('API error')
    return await res.json()
  } catch {
    // 降级：本地计算
    const scores = calcDimensionScores(answers, localQuestions.main)
    const levels = scoresToLevels(scores, localConfig.scoring.thresholds)
    const result = determineResult(
      levels,
      localDimensions.order,
      localTypes.standard,
      localTypes.special,
      { isRageDriver }
    )
    return {
      ...result,
      scores,
      levels,
      dimOrder: localDimensions.order,
      dimDefs: localDimensions.definitions,
    }
  }
}


/**
 * 提交答案，获取结果
 * 优先请求后端；失败时本地计算
 */
export async function submitAnswers(answers, isRageDriver) {
  try {
    const res = await fetch(`${BASE_URL}/result`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ answers, isRageDriver }),
      signal: AbortSignal.timeout(5000),
    })
    if (!res.ok) throw new Error('API error')
    return await res.json()
  } catch {
    // 降级：本地计算
    const scores = calcDimensionScores(answers, localQuestions.main)
    const levels = scoresToLevels(scores, localConfig.scoring.thresholds)
    const result = determineResult(
      levels,
      localDimensions.order,
      localTypes.standard,
      localTypes.special,
      { isRageDriver }
    )
    return {
      ...result,
      scores,
      levels,
      dimOrder: localDimensions.order,
      dimDefs: localDimensions.definitions,
    }
  }
}
