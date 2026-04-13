<script setup>
/**
 * 雷达图组件（复刻 SBTI chart.js）
 * Canvas 原生实现，15个维度，L/M/H 三档
 *
 * Props:
 *   - levels: { N1: 'H', N2: 'L', ... }
 *   - dimOrder: ['N1', 'N2', ..., 'S3']
 *   - dimDefs: 维度定义对象（含 shortName）
 */
import { ref, onMounted, watch } from 'vue'

const props = defineProps({
  levels: { type: Object, required: true },
  dimOrder: { type: Array, required: true },
  dimDefs: { type: Object, required: true },
})

const canvasRef = ref(null)

const LEVEL_NUM = { L: 1, M: 2, H: 3 }

// 主题色（导航蓝）
const THEME_COLOR = '26, 86, 160' // rgb values of #1a56a0

function draw() {
  const canvas = canvasRef.value
  if (!canvas) return

  const dpr = window.devicePixelRatio || 1
  const SIZE = 300 // 逻辑尺寸

  canvas.width = SIZE * dpr
  canvas.height = SIZE * dpr
  canvas.style.width = SIZE + 'px'
  canvas.style.height = SIZE + 'px'

  const ctx = canvas.getContext('2d')
  ctx.scale(dpr, dpr)

  const cx = SIZE / 2
  const cy = SIZE / 2
  const maxR = SIZE / 2 - 36 // 留边距给标签
  const n = props.dimOrder.length
  const angleStep = (Math.PI * 2) / n
  const startAngle = -Math.PI / 2 // 从12点方向开始

  ctx.clearRect(0, 0, SIZE, SIZE)

  // ── Step 1：背景同心圆（L/M/H 三层）──────────────────
  for (let level = 3; level >= 1; level--) {
    const r = (level / 3) * maxR
    ctx.beginPath()
    ctx.arc(cx, cy, r, 0, Math.PI * 2)

    const alpha = level === 3 ? 0.08 : level === 2 ? 0.05 : 0.03
    ctx.fillStyle = `rgba(${THEME_COLOR}, ${alpha})`
    ctx.fill()

    ctx.strokeStyle = `rgba(${THEME_COLOR}, 0.12)`
    ctx.lineWidth = 1
    ctx.stroke()
  }

  // ── Step 2：轴线 + 标签 ──────────────────────────────
  ctx.font = '10px -apple-system, PingFang SC, sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'

  for (let i = 0; i < n; i++) {
    const angle = startAngle + i * angleStep
    const x1 = cx + Math.cos(angle) * maxR
    const y1 = cy + Math.sin(angle) * maxR

    // 轴线
    ctx.beginPath()
    ctx.moveTo(cx, cy)
    ctx.lineTo(x1, y1)
    ctx.strokeStyle = `rgba(${THEME_COLOR}, 0.1)`
    ctx.lineWidth = 1
    ctx.stroke()

    // 标签（在轴末端外侧）
    const labelR = maxR + 20
    const lx = cx + Math.cos(angle) * labelR
    const ly = cy + Math.sin(angle) * labelR

    const dim = props.dimOrder[i]
    const shortName = props.dimDefs[dim]?.shortName || dim

    ctx.fillStyle = `rgba(${THEME_COLOR}, 0.7)`
    ctx.fillText(shortName, lx, ly)
  }

  // ── Step 3：用户数据多边形 ────────────────────────────
  ctx.beginPath()
  for (let i = 0; i < n; i++) {
    const angle = startAngle + i * angleStep
    const dim = props.dimOrder[i]
    const levelVal = LEVEL_NUM[props.levels[dim]] || 2
    const r = (levelVal / 3) * maxR

    const x = cx + Math.cos(angle) * r
    const y = cy + Math.sin(angle) * r

    if (i === 0) ctx.moveTo(x, y)
    else ctx.lineTo(x, y)
  }
  ctx.closePath()

  ctx.fillStyle = `rgba(${THEME_COLOR}, 0.2)`
  ctx.fill()
  ctx.strokeStyle = `rgba(${THEME_COLOR}, 0.65)`
  ctx.lineWidth = 2
  ctx.stroke()

  // ── Step 4：数据点 ────────────────────────────────────
  for (let i = 0; i < n; i++) {
    const angle = startAngle + i * angleStep
    const dim = props.dimOrder[i]
    const levelVal = LEVEL_NUM[props.levels[dim]] || 2
    const r = (levelVal / 3) * maxR

    const x = cx + Math.cos(angle) * r
    const y = cy + Math.sin(angle) * r

    ctx.beginPath()
    ctx.arc(x, y, 3.5, 0, Math.PI * 2)
    ctx.fillStyle = `rgb(${THEME_COLOR})`
    ctx.fill()
  }

  // ── Step 5：中心点 ────────────────────────────────────
  ctx.beginPath()
  ctx.arc(cx, cy, 2.5, 0, Math.PI * 2)
  ctx.fillStyle = `rgba(${THEME_COLOR}, 0.3)`
  ctx.fill()
}

onMounted(draw)
watch(() => props.levels, draw, { deep: true })
</script>

<template>
  <div class="radar">
    <canvas ref="canvasRef" class="radar__canvas" />
    <!-- 图例 -->
    <div class="radar__legend">
      <span class="legend-item legend-item--h">H 高</span>
      <span class="legend-item legend-item--m">M 中</span>
      <span class="legend-item legend-item--l">L 低</span>
    </div>
  </div>
</template>

<style scoped>
.radar {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
}

.radar__canvas {
  display: block;
}

.radar__legend {
  display: flex;
  gap: 1rem;
}

.legend-item {
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.15rem 0.6rem;
  border-radius: 999px;
}

.legend-item--h { background: var(--color-success-light); color: var(--color-success); }
.legend-item--m { background: var(--color-warning-light); color: var(--color-warning); }
.legend-item--l { background: var(--color-danger-light); color: var(--color-danger); }
</style>
