/**
 * 本地开发专用路由 — 不在生产环境注册
 * 用于 PreviewView 的 DHTI 数据内联编辑 + 写盘
 * 写盘时同步 frontend/src/data/ 和 backend/src/data/ 两份
 */
const express = require('express')
const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')

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

/** 读取 git HEAD 中某文件的内容 */
function readGitHead(relPath) {
  const out = execSync(`git show HEAD:${relPath}`, { cwd: ROOT }).toString('utf-8')
  return JSON.parse(out)
}

/**
 * GET /api/dev/dhti
 * 返回当前文件内容 + git HEAD 原始版本（供 session 对比）
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
 * GET /api/dev/dhti-original
 * 返回 git HEAD 中的 types.json + questions.json（最后一次 commit 的版本）
 */
router.get('/dhti-original', (req, res) => {
  try {
    res.json({
      types: readGitHead('frontend/src/data/types.json'),
      questions: readGitHead('frontend/src/data/questions.json'),
    })
  } catch (e) {
    res.status(500).json({ error: '读取 git HEAD 失败：' + e.message })
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
      const arrKey = data.standard?.find(t => t.code === id) ? 'standard' : 'special'
      const idx = data[arrKey]?.findIndex(t => t.code === id) ?? -1
      if (idx === -1) return res.status(404).json({ error: `type "${id}" not found` })
      data[arrKey][idx][field] = value
    } else {
      const idx = data.main?.findIndex(q => q.id === id) ?? -1
      if (idx === -1) return res.status(404).json({ error: `question "${id}" not found` })
      data.main[idx][field] = value
    }

    writeJson(filename, data)
    res.json({ ok: true, file, id, field, value })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

/**
 * POST /api/dev/restore
 * 恢复 types.json + questions.json 到指定版本
 *
 * Body:
 *   source  'git'（恢复到最后一次 commit）| 'snapshot'（使用传入快照）
 *   types    仅 source='snapshot' 时需要
 *   questions 仅 source='snapshot' 时需要
 */
router.post('/restore', (req, res) => {
  try {
    const { source } = req.body
    if (source === 'git') {
      const types = readGitHead('frontend/src/data/types.json')
      const questions = readGitHead('frontend/src/data/questions.json')
      writeJson('types.json', types)
      writeJson('questions.json', questions)
      res.json({ ok: true, source: 'git', types, questions })
    } else {
      const { types, questions } = req.body
      if (!types || !questions) {
        return res.status(400).json({ error: 'Body must have { types, questions } when source != git' })
      }
      writeJson('types.json', types)
      writeJson('questions.json', questions)
      res.json({ ok: true, source: 'snapshot' })
    }
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

module.exports = router
