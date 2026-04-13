<script setup>
/**
 * 首页
 * 展示测试说明，点击进入答题流程
 */
import { useRouter } from 'vue-router'
import { useQuizStore } from '@/stores/quiz'

const router = useRouter()
const quizStore = useQuizStore()

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

        <!-- 顶部小标签 -->
        <div class="home__badges">
          <span class="home__badge">娱乐实验</span>
          <span class="home__badge">非正式心理测评</span>
        </div>

        <!-- 百度地图 Logo -->
        <div class="home__logo-wrap" aria-hidden="true">
          <img src="/baidu-logo.png" alt="百度地图" class="home__logo" />
        </div>

        <!-- 主标题 -->
        <h1 class="home__title">导航 DHTI</h1>
        <p class="home__subtitle">你是哪种导航人格？</p>

        <!-- 数据摘要 -->
        <div class="home__stats">
          <div class="home__stat">
            <span class="home__stat-num">15</span>
            <span class="home__stat-label">出行维度</span>
          </div>
          <div class="home__stat-divider" aria-hidden="true"></div>
          <div class="home__stat">
            <span class="home__stat-num">27</span>
            <span class="home__stat-label">导航人格</span>
          </div>
          <div class="home__stat-divider" aria-hidden="true"></div>
          <div class="home__stat">
            <span class="home__stat-num">~5</span>
            <span class="home__stat-label">分钟完成</span>
          </div>
        </div>

        <!-- 开始按钮 -->
        <button class="btn btn-primary home__cta" @click="startQuiz">
          开始测试
        </button>
        <p class="home__cta-sub">百度地图，为专属的你保驾护航</p>

      </div>
    </section>

    <!-- ── 浅灰信息区 ─────────────────────────────── -->
    <section class="home__info">
      <div class="home__info-inner">

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
  gap: 64px;
}

/* 顶部小标签 */
.home__badges {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  justify-content: center;
  margin: 0;
}

.home__badge {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.48);
  border: 1px solid rgba(255, 255, 255, 0.18);
  border-radius: var(--r-pill);
  padding: 3px 12px;
  line-height: 1.5;
}

/* 百度地图 Logo */
.home__logo-wrap {
  display: flex;
  justify-content: center;
}

.home__logo {
  width: 78px;
  height: 78px;
  border-radius: 19px;
  display: block;
}

/* 标题组（title + subtitle 共用一个间距块） */
.home__title {
  font-family: -apple-system, 'SF Pro Display', 'PingFang SC',
    'Hiragino Sans GB', 'Microsoft YaHei', sans-serif;
  font-size: 48px;
  font-weight: 600;
  line-height: 1.08;
  letter-spacing: -0.5px;
  color: var(--text-white);
  margin: 0 0 8px;
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

/* CTA 按钮 */
.home__cta {
  width: 100%;
  max-width: 320px;
  font-size: 17px;
  font-weight: 400;
  padding: 14px 24px;
  border-radius: var(--r);
  margin-bottom: 12px;
}

.home__cta-sub {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.3);
  letter-spacing: 0.01em;
  margin: 0;
}

/* ── 信息区：浅灰 ── */
.home__info {
  background: #ffffff;
}

.home__info-inner {
  width: 100%;
  max-width: var(--max-width);
  margin: 0 auto;
  padding: 40px 24px 48px;
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

  .home__cta {
    max-width: 280px;
    padding: 14px 48px;
  }

  .home__info-inner {
    padding: 56px 48px 72px;
  }

  .home__desc {
    font-size: 19px;
    max-width: 620px;
  }
}
</style>
