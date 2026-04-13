/**
 * 测评路由
 * GET  /api/questions  - 返回题目列表（已插入特殊题）
 * POST /api/result     - 接收答案，返回计算结果
 */
const express = require('express')
const router = express.Router()
const path = require('path')

const questions = require(path.join(__dirname, '../data/questions.json'))
const dimensions = require(path.join(__dirname, '../data/dimensions.json'))
const types = require(path.join(__dirname, '../data/types.json'))
const config = require(path.join(__dirname, '../data/config.json'))
const { calcDimensionScores, scoresToLevels, determineResult } = require('../engine/scoring')

/**
 * GET /api/questions
 * 返回题目列表，特殊题按配置位置插入
 */
router.get('/questions', (req, res) => {
  // 将特殊题(rage_gate_q1)随机插入主题目第8-12题之间
  const main = [...questions.main]
  const gateQ = questions.special.find(q => q.kind === 'rage_gate')

  if (gateQ) {
    const insertPos = Math.floor(Math.random() * 5) + 8 // 8-12之间
    main.splice(insertPos, 0, gateQ)
  }

  res.json({
    questions: main,
    specialQuestions: questions.special,
    totalMain: questions.main.length,
  })
})

/**
 * POST /api/result
 * Body: { answers: { q1: 2, q2: 3, ... }, isRageDriver: boolean }
 * 返回: 完整结果对象
 */
router.post('/result', (req, res) => {
  const { answers, isRageDriver = false } = req.body

  if (!answers || typeof answers !== 'object') {
    return res.status(400).json({ error: '缺少 answers 参数' })
  }

  // 校验答题完整性（主题目必须全部作答）
  const mainIds = questions.main.map(q => q.id)
  const missing = mainIds.filter(id => answers[id] == null)
  if (missing.length > 0) {
    return res.status(400).json({ error: `以下题目未作答: ${missing.join(', ')}` })
  }

  // 计算结果
  const scores = calcDimensionScores(answers, questions.main)
  const levels = scoresToLevels(scores, config.scoring.thresholds)
  const result = determineResult(
    levels,
    dimensions.order,
    types.standard,
    types.special,
    { isRageDriver }
  )

  res.json({
    ...result,
    scores,
    levels,
    dimOrder: dimensions.order,
    dimDefs: dimensions.definitions,
  })
})

module.exports = router
