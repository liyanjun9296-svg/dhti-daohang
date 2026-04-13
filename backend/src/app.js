/**
 * 后端入口
 * Express 轻量 API 服务
 * 端口：3001（前端 Vite 默认 5173，避免冲突）
 */
const express = require('express')
const cors = require('cors')
const quizRouter = require('./routes/quiz')

const app = express()
const PORT = process.env.PORT || 3001

// ── 中间件 ──────────────────────────────────────────────
app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
  methods: ['GET', 'POST'],
}))
app.use(express.json())

// ── 路由 ────────────────────────────────────────────────
app.use('/api', quizRouter)

// 健康检查
app.get('/health', (req, res) => res.json({ status: 'ok' }))

// ── 启动 ────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`[DHTI Backend] 运行在 http://localhost:${PORT}`)
})
