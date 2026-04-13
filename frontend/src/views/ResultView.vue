<script setup>
/**
 * 结果页
 * 展示人格类型、雷达图、TOP5匹配、维度详情
 */
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useQuizStore } from '@/stores/quiz'
import RadarChart from '@/components/RadarChart.vue'
import Top5List from '@/components/Top5List.vue'
import DimDetail from '@/components/DimDetail.vue'

const router = useRouter()
const quizStore = useQuizStore()
const result = quizStore.result
// API 返回结构：{ primary, secondary, rankings, mode, scores, levels, dimOrder, dimDefs }
const primary = result?.primary

// 分区展开/折叠
const showDimDetail = ref(false)

function retake() {
  quizStore.reset()
  router.push('/')
}
</script>

<template>
  <div class="result">

    <!-- ── 黑色 Hero 区 ─────────────────────────────── -->
    <section class="result__hero">

      <!-- 吸顶毛玻璃 Nav -->
      <nav class="result__nav">
        <div class="result__nav-inner">
          <button class="result__nav-back" @click="retake" aria-label="返回首页">
            <svg width="10" height="17" viewBox="0 0 10 17" fill="none" aria-hidden="true">
              <path d="M9 1L1 8.5L9 16" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
          <span class="result__nav-title">导航 DHTI</span>
        </div>
      </nav>

      <!-- Hero 内容 -->
      <div class="result__hero-inner">

        <!-- 角色配图 -->
        <div class="result__avatar">
          <img
            :src="`/types/${primary.code}.png`"
            :alt="primary.cn"
            class="result__avatar-img"
            @error="e => { e.target.src = '/types/placeholder.png' }"
          />
        </div>

        <!-- 相似度 -->
        <div class="result__similarity">
          <span class="result__similarity-num">{{ primary.similarity }}%</span>
          <span class="result__similarity-label"> 匹配</span>
        </div>

        <!-- 人格代码 -->
        <h1 class="result__code">{{ primary.code }}</h1>

        <!-- 中文名 -->
        <p class="result__cn">{{ primary.cn }}</p>

        <!-- 一句话介绍 -->
        <p class="result__intro">{{ primary.intro }}</p>

        <!-- 标签 -->
        <div class="result__tags">
          <span
            v-for="tag in primary.tags"
            :key="tag"
            class="pill pill-outline-dark"
          >{{ tag }}</span>
        </div>

      </div>
    </section>

    <!-- ── 浅灰信息区 ─────────────────────────────────── -->
    <div class="result__body">

      <!-- 人格描述 -->
      <section class="result__section">
        <h2 class="result__section-label">人格描述</h2>
        <p class="result__desc">{{ primary.desc }}</p>
      </section>

      <!-- 雷达图 -->
      <section class="result__section">
        <h2 class="result__section-label">出行人格维度</h2>
        <div class="result__radar">
          <RadarChart
            :levels="result.levels"
            :dim-order="result.dimOrder"
            :dim-defs="result.dimDefs"
          />
        </div>
      </section>

      <!-- TOP 5 匹配 -->
      <section class="result__section" v-if="result.rankings?.length">
        <h2 class="result__section-label">最接近的人格</h2>
        <Top5List :rankings="result.rankings" :top-n="5" />
      </section>

      <!-- 15 维度详情（可折叠） -->
      <section class="result__section">
        <button class="result__toggle" @click="showDimDetail = !showDimDetail">
          <h2 class="result__section-label result__section-label--inline">15 维度详情</h2>
          <span class="result__toggle-chevron" :class="{ 'is-open': showDimDetail }">
            <svg width="12" height="8" viewBox="0 0 12 8" fill="none" aria-hidden="true">
              <path d="M1 1.5L6 6.5L11 1.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </span>
        </button>
        <div v-if="showDimDetail" class="result__dim-wrap">
          <DimDetail
            :levels="result.levels"
            :dim-order="result.dimOrder"
            :dim-defs="result.dimDefs"
          />
        </div>
      </section>

      <!-- 底部双 CTA -->
      <div class="result__actions">
        <button class="btn btn-primary result__btn-retake" @click="retake">
          重新测试
        </button>
        <p class="result__footnote">仅供娱乐，请勿用于严肃场景</p>
      </div>

    </div>

  </div>
</template>

<style scoped>
/* ── 整体容器 ── */
.result {
  min-height: 100vh;
  background: var(--bg-light);
}

/* ══════════════════════════════════════
   黑色 Hero 区
══════════════════════════════════════ */
.result__hero {
  background: var(--bg-dark);
  position: relative;
}

/* 吸顶毛玻璃 Nav */
.result__nav {
  position: sticky;
  top: 0;
  z-index: 20;
  background: rgba(0, 0, 0, 0.72);
  backdrop-filter: saturate(180%) blur(20px);
  -webkit-backdrop-filter: saturate(180%) blur(20px);
}

.result__nav-inner {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 20px;
  max-width: var(--max-width);
  margin: 0 auto;
  height: 48px;
}

.result__nav-back {
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.72);
  cursor: pointer;
  padding: 6px 8px;
  border-radius: var(--r-sm);
  display: flex;
  align-items: center;
  transition: color 0.15s;
  flex-shrink: 0;
}

.result__nav-back:hover { color: #fff; }

.result__nav-title {
  font-size: 15px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.72);
}

/* Hero 内容区 */
.result__hero-inner {
  max-width: var(--max-width);
  margin: 0 auto;
  padding: 52px 24px 64px;
  text-align: center;
}

/* 角色配图 */
.result__avatar {
  width: 200px;
  height: 200px;
  border-radius: 50%;
  background: #181818;
  margin: 0 auto 24px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

.result__avatar-img {
  width: 302px;
  height: 302px;
  object-fit: cover;
}

/* 相似度 */
.result__similarity {
  margin-bottom: 12px;
}

.result__similarity-num {
  font-family: -apple-system, 'SF Pro Display', 'PingFang SC', sans-serif;
  font-size: 17px;
  font-weight: 600;
  color: var(--blue-dark-bg);
  letter-spacing: 0.3px;
}

.result__similarity-label {
  font-size: 15px;
  color: rgba(255, 255, 255, 0.48);
}

/* 人格代码大标题 */
.result__code {
  font-family: -apple-system, 'SF Pro Display', 'PingFang SC', sans-serif;
  font-size: 56px;
  font-weight: 600;
  line-height: 1.06;
  letter-spacing: 2px;
  color: var(--text-white);
  text-transform: uppercase;
  margin-bottom: 10px;
}

/* 中文名 */
.result__cn {
  font-family: -apple-system, 'SF Pro Display', 'PingFang SC', sans-serif;
  font-size: 28px;
  font-weight: 400;
  line-height: 1.2;
  color: var(--text-white);
  margin-bottom: 12px;
  letter-spacing: 0.3px;
}

/* 一句话介绍 */
.result__intro {
  font-size: 17px;
  line-height: 1.7;
  color: rgba(255, 255, 255, 0.60);
  margin-bottom: 28px;
  max-width: 480px;
  margin-left: auto;
  margin-right: auto;
}

/* 标签组 */
.result__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: center;
}

/* ══════════════════════════════════════
   浅灰信息区
══════════════════════════════════════ */
.result__body {
  background: var(--bg-light);
  padding: 0 0 48px;
}

/* 通用信息卡片 */
.result__section {
  background: var(--surface);
  max-width: var(--max-width);
  margin: 0 auto 2px;
  padding: 24px 20px;
}

/* 第一个 section 顶部间距 */
.result__body > .result__section:first-child {
  margin-top: 0;
}

/* Section 标签（全大写小字） */
.result__section-label {
  font-size: 12px;
  font-weight: 600;
  color: var(--text-tertiary);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  margin-bottom: 14px;
}

.result__section-label--inline {
  margin-bottom: 0;
}

/* 人格描述正文 */
.result__desc {
  font-size: 15px;
  line-height: 1.85;
  color: var(--text-dark);
}

/* 雷达图居中 */
.result__radar {
  display: flex;
  justify-content: center;
}

/* 折叠按钮 */
.result__toggle {
  width: 100%;
  background: none;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0;
  text-align: left;
}

.result__toggle-chevron {
  color: var(--text-tertiary);
  display: flex;
  align-items: center;
  transition: transform 0.2s;
}

.result__toggle-chevron.is-open {
  transform: rotate(180deg);
}

.result__dim-wrap {
  margin-top: 16px;
}

/* ── 底部 CTA ── */
.result__actions {
  max-width: var(--max-width);
  margin: 24px auto 0;
  padding: 0 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.result__btn-retake {
  width: 100%;
  font-size: 17px;
  padding: 14px;
  border-radius: var(--r);
}

.result__footnote {
  font-size: 12px;
  color: var(--text-tertiary);
  text-align: center;
}

/* ── 桌面适配 ── */
@media (min-width: 768px) {
  .result__hero-inner {
    padding: 80px 48px 88px;
  }

  .result__code {
    font-size: 72px;
  }

  .result__cn {
    font-size: 36px;
  }

  .result__intro {
    font-size: 19px;
  }

  .result__section {
    padding: 32px 28px;
    border-radius: var(--r);
    margin-bottom: 8px;
  }

  .result__body {
    padding: 24px 0 64px;
  }

  .result__btn-retake {
    max-width: 280px;
  }
}
</style>
