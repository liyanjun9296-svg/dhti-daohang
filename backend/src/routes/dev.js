/**
 * 本地开发专用路由 — 不在生产环境注册
 * 用于 PreviewView 的 SBTI 数据内联编辑 + 写盘
 */
const express = require('express')
const fs = require('fs')
const path = require('path')

const router = express.Router()

// sbti.json 的两个路径（前端 src/data/sbti.json）
const SBTI_JSON_PATH = path.resolve(
  __dirname,
  '../../../frontend/src/data/sbti.json'
)

function readSbti() {
  return JSON.parse(fs.readFileSync(SBTI_JSON_PATH, 'utf-8'))
}

function writeSbti(data) {
  fs.writeFileSync(SBTI_JSON_PATH, JSON.stringify(data, null, 2), 'utf-8')
}

/**
 * GET /api/dev/sbti
 * 返回当前 sbti.json 全量内容（供 session 快照使用）
 */
router.get('/sbti', (req, res) => {
  try {
    res.json(readSbti())
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

/**
 * POST /api/dev/patch
 * 修改 sbti.json 中某个字段并写回磁盘
 *
 * Body:
 *   section  'types' | 'questions'
 *   id       类型 code 或题目 id
 *   field    'cn' | 'pattern' | 'text'
 *   value    新值
 */
router.post('/patch', (req, res) => {
  const { section, id, field, value } = req.body
  if (!section || !id || !field || value === undefined) {
    return res.status(400).json({ error: 'Missing required fields: section, id, field, value' })
  }
  if (!['types', 'questions'].includes(section)) {
    return res.status(400).json({ error: 'section must be "types" or "questions"' })
  }
  const allowedFields = { types: ['cn', 'pattern'], questions: ['text'] }
  if (!allowedFields[section].includes(field)) {
    return res.status(400).json({ error: `field "${field}" not allowed for section "${section}"` })
  }
  try {
    const data = readSbti()
    const item = data[section].find(
      t => (section === 'types' ? t.code : t.id) === id
    )
    if (!item) {
      return res.status(404).json({ error: `${section} item "${id}" not found` })
    }
    item[field] = value
    writeSbti(data)
    res.json({ ok: true, section, id, field, value })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

/**
 * POST /api/dev/restore
 * 把整个 sbti.json 恢复为传入的快照数据
 *
 * Body: 完整的 sbti.json 对象（来自 session 快照）
 */
router.post('/restore', (req, res) => {
  try {
    const snapshot = req.body
    if (!snapshot || !Array.isArray(snapshot.types) || !Array.isArray(snapshot.questions)) {
      return res.status(400).json({ error: 'Invalid snapshot data' })
    }
    writeSbti(snapshot)
    res.json({ ok: true })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

module.exports = router
