<script setup>
/**
 * 首页
 * 展示测试说明，点击进入答题流程
 */
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useQuizStore } from '@/stores/quiz'

const router = useRouter()
const quizStore = useQuizStore()

// ── 入场动画：三组错落 ────────────────────────────
const g1 = ref(false)  // Logo + 标题 + 副标题
const g2 = ref(false)  // 数字统计
const g3 = ref(false)  // 按钮 + 辅助文字

// ── 数字计数器 ────────────────────────────────────
const num15 = ref(0)
const num27 = ref(0)

function countUp(setter, target, delay) {
  setTimeout(() => {
    const dur = 900
    const t0 = performance.now()
    const tick = (now) => {
      const p = Math.min((now - t0) / dur, 1)
      const ease = 1 - Math.pow(1 - p, 3)
      setter(Math.round(ease * target))
      if (p < 1) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }, delay)
}

onMounted(() => {
  setTimeout(() => { g1.value = true }, 100)
  setTimeout(() => { g2.value = true }, 260)
  setTimeout(() => { g3.value = true }, 440)
  countUp(v => { num15.value = v }, 15, 260)
  countUp(v => { num27.value = v }, 27, 380)
})

async function startQuiz() {
  quizStore.reset()
  await quizStore.init()
  router.push('/quiz')
}
</script>

<template>
  <div class="home">

    <!-- ── 黑色 Hero 区 ──────────────────────────── -->
    <section class="home__hero">
      <div class="home__hero-inner">

        <!-- Group 1: Logo + 标题 + 副标题 -->
        <div class="home__title-group anim-g" :class="{ 'anim-in': g1 }">
          <img src="/baidu-logo.png" alt="百度地图" class="home__logo" />
          <h1 class="home__title">导航 DHTI</h1>
          <p class="home__subtitle">你是哪种导航人格？</p>
        </div>

        <!-- Group 2: 数字统计（数字动态计数） -->
        <div class="home__stats anim-g" :class="{ 'anim-in': g2 }">
          <div class="home__stat">
            <span class="home__stat-num">{{ num15 }}</span>
            <span class="home__stat-label">出行维度</span>
          </div>
          <div class="home__stat-divider" aria-hidden="true"></div>
          <div class="home__stat">
            <span class="home__stat-num">{{ num27 }}</span>
            <span class="home__stat-label">导航人格</span>
          </div>
          <div class="home__stat-divider" aria-hidden="true"></div>
          <div class="home__stat">
            <span class="home__stat-num">~5</span>
            <span class="home__stat-label">分钟完成</span>
          </div>
        </div>

        <!-- Group 3: 按钮 + 辅助文字 -->
        <div class="home__cta-group anim-g" :class="{ 'anim-in': g3 }">
          <button class="btn btn-primary home__cta" @click="startQuiz">
            开始测试
          </button>
          <p class="home__cta-sub">百度地图，为专属的你保驾护航</p>
        </div>

      </div>
    </section>

    <!-- ── 浅灰信息区 ─────────────────────────────── -->
    <section class="home__info">
      <div class="home__info-inner">
        <div class="home__info-content">

          <p class="home__desc">
            选最接近你直觉的就行。这是一个基于驾驶出行场景的轻量人格测验，
            从导航心理、路途态度、行动模式等 15 个维度，
            帮你找到最像你的那种导航人格。
          </p>

          <!-- 免责声明 -->
          <div class="home__disclaimer">
            仅供娱乐，请勿用于招聘、保险、相亲或任何严肃场景。
          </div>

        </div>
      </div>
    </section>

  </div>
</template>

<style scoped>
/* ── 整体容器 ── */
.home {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

/* ── Hero：黑色全屏 ── */
.home__hero {
  background: var(--bg-dark);
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 64px 24px;
  min-height: 804px;
}

.home__hero-inner {
  width: 100%;
  max-width: var(--max-width);
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 66px;
}

/* ── 入场动画基类 ── */
.anim-g {
  opacity: 0;
  transform: translateY(28px);
  transition: opacity 0.65s cubic-bezier(0.22, 1, 0.36, 1),
              transform 0.65s cubic-bezier(0.22, 1, 0.36, 1);
  will-change: opacity, transform;
}
.anim-g.anim-in {
  opacity: 1;
  transform: translateY(0);
}

/* Logo + 标题组（Frame3 in Pencil, gap=8） */
.home__title-group {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 36px;
}

/* 百度地图 Logo */
.home__logo {
  width: 78px;
  height: 78px;
  border-radius: 19px;
  display: block;
}

/* 标题 */
.home__title {
  font-family: -apple-system, 'SF Pro Display', 'PingFang SC',
    'Hiragino Sans GB', 'Microsoft YaHei', sans-serif;
  font-size: 48px;
  font-weight: 600;
  line-height: 1.08;
  letter-spacing: -0.5px;
  color: var(--text-white);
  margin: 0;
}

/* 副标题 */
.home__subtitle {
  font-size: 21px;
  font-weight: 400;
  line-height: 1.3;
  color: rgba(255, 255, 255, 0.72);
  margin: 0;
  letter-spacing: 0.2px;
}

/* 数据摘要三栏 */
.home__stats {
  display: flex;
  align-items: center;
  gap: 0;
  border: 1px solid rgba(255, 255, 255, 0.14);
  border-radius: var(--r-md);
  overflow: hidden;
  width: 100%;
  max-width: 320px;
}

.home__stat {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16px 8px;
  gap: 4px;
}

.home__stat-num {
  font-family: -apple-system, 'SF Pro Display', 'PingFang SC', sans-serif;
  font-size: 28px;
  font-weight: 600;
  line-height: 1;
  color: var(--text-white);
  letter-spacing: -0.3px;
}

.home__stat-label {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.48);
  white-space: nowrap;
}

.home__stat-divider {
  width: 1px;
  height: 40px;
  background: rgba(255, 255, 255, 0.14);
  flex-shrink: 0;
}

/* CTA 组（Frame2 in Pencil, gap=12） */
.home__cta-group {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

/* CTA 按钮 */
.home__cta {
  width: 280px;
  height: 50px;
  font-size: 17px;
  font-weight: 400;
  padding: 0 48px;
  border-radius: var(--r);
}

.home__cta-sub {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.3);
  letter-spacing: 0.01em;
  margin: 0;
}

/* ── 信息区：白色 ── */
.home__info {
  background: #ffffff;
}

.home__info-inner {
  width: 100%;
  max-width: var(--max-width);
  margin: 0 auto;
  padding: 40px 24px 48px;
}

/* 白色区 620px 居中内容块（对应 Pencil InfoContent w=620） */
.home__info-content {
  max-width: 620px;
  margin: 0 auto;
}

.home__desc {
  font-size: 17px;
  line-height: 1.75;
  color: var(--text-secondary);
  margin-bottom: 24px;
  text-align: left;
}

.home__disclaimer {
  font-size: 13px;
  line-height: 1.6;
  color: var(--text-tertiary);
  padding: 12px 16px;
  background: rgba(0, 0, 0, 0.04);
  border-radius: var(--r);
}

/* ── 桌面适配 ── */
@media (min-width: 768px) {
  .home__hero {
    padding: 64px 48px;
  }

  .home__title {
    font-size: 64px;
    letter-spacing: -0.8px;
  }

  .home__subtitle {
    font-size: 24px;
  }

  .home__stats {
    max-width: 380px;
  }

  .home__info-inner {
    padding: 56px 48px 72px;
  }

  .home__desc {
    font-size: 19px;
  }
}
</style>
