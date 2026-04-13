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
 * 获取题目列表
 * 优先请求后端；失败时使用本地数据（特殊题插入第10题后）
 */
export async function fetchQuestions() {
  try {
    const res = await fetch(`${BASE_URL}/questions`, { signal: AbortSignal.timeout(3000) })
    if (!res.ok) throw new Error('API error')
    return await res.json()
  } catch {
    // 降级：本地数据
    const main = [...localQuestions.main]
    const gateQ = localQuestions.special.find(q => q.kind === 'rage_gate')
    if (gateQ) main.splice(10, 0, gateQ)
    return {
      questions: main,
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
