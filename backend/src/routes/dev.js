/**
 * 本地开发专用路由 — 不在生产环境注册
 * 用于 PreviewView 的 DHTI 数据内联编辑 + 写盘
 * 写盘时同步 frontend/src/data/ 和 backend/src/data/ 两份
 */
const express = require('express')
const fs = require('fs')
const path = require('path')

const router = express.Router()

const ROOT = path.resolve(__dirname, '../../..')

function filePaths(filename) {
  return [
    path.join(ROOT, 'frontend/src/data', filename),
    path.join(ROOT, 'backend/src/data', filename),
  ]
}

function readJson(filename) {
  return JSON.parse(fs.readFileSync(filePaths(filename)[0], 'utf-8'))
}

function writeJson(filename, data) {
  const json = JSON.stringify(data, null, 2)
  for (const p of filePaths(filename)) {
    fs.writeFileSync(p, json, 'utf-8')
  }
}

/**
 * GET /api/dev/dhti
 * 返回当前 types.json + questions.json 快照（供 session 快照使用）
 */
router.get('/dhti', (req, res) => {
  try {
    res.json({
      types: readJson('types.json'),
      questions: readJson('questions.json'),
    })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

/**
 * POST /api/dev/patch
 * 修改 DHTI 某个字段并写回磁盘（前后端两份同步）
 *
 * Body:
 *   file    'types' | 'questions'
 *   id      类型 code 或题目 id
 *   field   types: 'cn'|'intro'|'desc'|'tags'  questions: 'text'
 *   value   新值
 */
router.post('/patch', (req, res) => {
  const { file, id, field, value } = req.body
  if (!file || !id || !field || value === undefined) {
    return res.status(400).json({ error: 'Missing required fields: file, id, field, value' })
  }
  const allowed = {
    types: ['cn', 'intro', 'desc', 'tags'],
    questions: ['text'],
  }
  if (!allowed[file]) {
    return res.status(400).json({ error: 'file must be "types" or "questions"' })
  }
  if (!allowed[file].includes(field)) {
    return res.status(400).json({ error: `field "${field}" not allowed for file "${file}"` })
  }
  try {
    const filename = file + '.json'
    const data = readJson(filename)

    if (file === 'types') {
      const item = [...(data.standard || []), ...(data.special || [])].find(t => t.code === id)
      if (!item) return res.status(404).json({ error: `type "${id}" not found` })
      // 找在 standard 还是 special 里
      const arrKey = data.standard?.find(t => t.code === id) ? 'standard' : 'special'
      const idx = data[arrKey].findIndex(t => t.code === id)
      data[arrKey][idx][field] = value
    } else {
      const item = data.main?.find(q => q.id === id) || data.find?.(q => q.id === id)
      if (!item) return res.status(404).json({ error: `question "${id}" not found` })
      if (data.main) {
        data.main.find(q => q.id === id)[field] = value
      } else {
        data.find(q => q.id === id)[field] = value
      }
    }

    writeJson(filename, data)
    res.json({ ok: true, file, id, field, value })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

/**
 * POST /api/dev/restore
 * 把 types.json 和 questions.json 恢复为传入的快照
 *
 * Body: { types: {...}, questions: {...} }
 */
router.post('/restore', (req, res) => {
  try {
    const { types, questions } = req.body
    if (!types || !questions) {
      return res.status(400).json({ error: 'Body must have { types, questions }' })
    }
    writeJson('types.json', types)
    writeJson('questions.json', questions)
    res.json({ ok: true })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

module.exports = router
