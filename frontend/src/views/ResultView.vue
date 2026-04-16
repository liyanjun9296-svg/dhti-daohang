<script setup>
/**
 * 结果页
 * 支持两种模式：
 *   1. 答题后结果（quizStore.result 存在）
 *   2. 分享链接落地（?type=CODE，从 types.json 加载）
 */
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useQuizStore } from '@/stores/quiz'
import typesData from '@/data/types.json'
import RadarChart from '@/components/RadarChart.vue'
import Top5List from '@/components/Top5List.vue'
import DimDetail from '@/components/DimDetail.vue'
import TypeAvatar from '@/components/TypeAvatar.vue'

const router = useRouter()
const route = useRoute()
const quizStore = useQuizStore()

// ── 来源判断：答题结果 OR 分享链接 ──────────────
const sharedCode = route.query.type
const isShared = !!sharedCode && !quizStore.result

let primary, result

if (isShared) {
  const allTypes = [...typesData.standard, ...typesData.special]
  const typeData = allTypes.find(t => t.code === String(sharedCode).toUpperCase())
  if (!typeData) {
    router.replace({ name: 'home' })
    primary = null
    result = null
  } else {
    const sim = route.query.sim ? Number(route.query.sim) : null
    primary = { ...typeData, similarity: sim }
    result = null
  }
} else {
  result = quizStore.result
  primary = result?.primary
}

// ── 维度详情展开/折叠 ─────────────────────────
const showDimDetail = ref(false)

// ── 操作 ──────────────────────────────────────
function retake() {
  quizStore.reset()
  router.push('/')
}

async function startTest() {
  quizStore.reset()
  await quizStore.init()
  router.push('/quiz')
}

// ── 分享功能 ──────────────────────────────────
const shareOpen = ref(false)
const copied = ref(false)
const shareHint = ref('')

const shareUrl = computed(() => {
  if (!primary?.code) return location.origin
  const sim = primary.similarity
  const simPart = (sim != null) ? `&sim=${sim}` : ''
  return `${location.origin}/result?type=${primary.code}${simPart}`
})

function openShare() {
  shareOpen.value = true
  copied.value = false
  shareHint.value = ''
}
function closeShare() {
  shareOpen.value = false
}

async function shareToWechat() {
  await doShare('链接已复制，打开微信 → 粘贴给好友或发朋友圈')
}
async function shareToDouyin() {
  await doShare('链接已复制，打开抖音 → 粘贴链接发动态')
}

async function doShare(hint) {
  if (navigator.share) {
    try {
      await navigator.share({
        title: `我是 ${primary.code} · ${primary.cn} | 导航 DHTI`,
        text: '我在导航 DHTI 测出了我的导航人格，快来测测你是哪种？',
        url: shareUrl.value,
      })
      closeShare()
      return
    } catch {}
  }
  await copyToClipboard(shareUrl.value)
  copied.value = true
  shareHint.value = hint
}

async function copyLink() {
  await copyToClipboard(shareUrl.value)
  copied.value = true
  shareHint.value = '链接已复制，可粘贴至任意应用分享'
}

async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text)
  } catch {
    const el = document.createElement('textarea')
    el.value = text
    el.style.cssText = 'position:fixed;opacity:0'
    document.body.appendChild(el)
    el.select()
    document.execCommand('copy')
    document.body.removeChild(el)
  }
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
      <div v-if="primary" class="result__hero-inner">

        <!-- 分享链接查看标识 -->
        <div v-if="isShared" class="result__shared-badge">
          正在查看TA的测试结果
        </div>

        <!-- 角色配图 -->
        <div class="result__avatar">
          <TypeAvatar :code="primary.code" :size="200" />
        </div>

        <!-- 相似度（分享模式若无 sim 参数则隐藏） -->
        <div v-if="primary.similarity != null" class="result__similarity">
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

        <!-- 分享按钮 -->
        <div class="result__share-wrap">
          <button class="result__share-btn" @click="openShare">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8"/>
              <polyline points="16 6 12 2 8 6"/>
              <line x1="12" y1="2" x2="12" y2="15"/>
            </svg>
            分享结果
          </button>
        </div>

      </div>
    </section>

    <!-- ── 浅灰信息区 ─────────────────────────────────── -->
    <div v-if="primary" class="result__body">

      <!-- 人格描述 -->
      <section class="result__section">
        <h2 class="result__section-label">人格描述</h2>
        <p class="result__desc">{{ primary.desc }}</p>
      </section>

      <!-- 雷达图（仅答题后展示，分享链接无数据） -->
      <section v-if="!isShared" class="result__section">
        <h2 class="result__section-label">出行人格维度</h2>
        <div class="result__radar">
          <RadarChart
            :levels="result.levels"
            :dim-order="result.dimOrder"
            :dim-defs="result.dimDefs"
          />
        </div>
      </section>

      <!-- TOP 5 匹配（仅答题后展示） -->
      <section v-if="!isShared && result.rankings?.length" class="result__section">
        <h2 class="result__section-label">最接近的人格</h2>
        <Top5List :rankings="result.rankings" :top-n="5" />
      </section>

      <!-- 15 维度详情（仅答题后展示） -->
      <section v-if="!isShared" class="result__section">
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

      <!-- 底部 CTA -->
      <div class="result__actions">
        <button v-if="!isShared" class="btn btn-primary result__btn-retake" @click="retake">
          重新测试
        </button>
        <button v-else class="btn btn-primary result__btn-retake" @click="startTest">
          我也来测 →
        </button>
        <p class="result__footnote">仅供娱乐，请勿用于严肃场景</p>
      </div>

    </div>

    <!-- ── 分享弹层（Teleport 至 body） ──────────────── -->
    <Teleport to="body">
      <div v-if="shareOpen" class="share-overlay" @click.self="closeShare">
        <div class="share-sheet">
          <div class="share-sheet__handle"></div>
          <p class="share-sheet__title">分享我的结果</p>
          <p class="share-sheet__preview">{{ primary?.code }} · {{ primary?.cn }}</p>

          <div class="share-sheet__opts">
            <!-- 微信 -->
            <button class="share-opt" @click="shareToWechat">
              <div class="share-opt__ico share-opt__ico--wechat">
                <svg width="26" height="26" viewBox="0 0 24 24" fill="white" aria-hidden="true">
                  <path d="M8.5 9a1 1 0 100 2 1 1 0 000-2zm5 0a1 1 0 100 2 1 1 0 000-2zm-2.5 5.5a1 1 0 100 2 1 1 0 000-2zm3.5 0a1 1 0 100 2 1 1 0 000-2zM12 2C6.477 2 2 6.477 2 12c0 1.89.52 3.66 1.43 5.18L2 22l4.82-1.43A9.97 9.97 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2z"/>
                </svg>
              </div>
              <span>微信</span>
            </button>

            <!-- 抖音 -->
            <button class="share-opt" @click="shareToDouyin">
              <div class="share-opt__ico share-opt__ico--douyin">
                <svg width="26" height="26" viewBox="0 0 24 24" fill="white" aria-hidden="true">
                  <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.34 6.34 0 00-.79-.05A6.34 6.34 0 003.15 15.3a6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.77 1.53v-3.4a4.85 4.85 0 01-1-.13z"/>
                </svg>
              </div>
              <span>抖音</span>
            </button>

            <!-- 复制链接 -->
            <button class="share-opt" :class="{ 'is-copied': copied && shareHint.includes('任意') }" @click="copyLink">
              <div class="share-opt__ico share-opt__ico--link">
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" aria-hidden="true">
                  <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/>
                  <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/>
                </svg>
              </div>
              <span>复制链接</span>
            </button>
          </div>

          <p v-if="shareHint" class="share-sheet__hint">{{ shareHint }}</p>

          <button class="share-sheet__cancel" @click="closeShare">取消</button>
        </div>
      </div>
    </Teleport>

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

/* 分享链接查看标识 */
.result__shared-badge {
  display: inline-block;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.55);
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.18);
  padding: 4px 12px;
  border-radius: 20px;
  margin-bottom: 20px;
}

/* 角色配图 */
.result__avatar {
  width: 200px;
  height: 200px;
  margin: 0 auto 24px;
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

/* 分享按钮 */
.result__share-wrap {
  margin-top: 24px;
}

.result__share-btn {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 10px 22px;
  border-radius: 22px;
  border: 1px solid rgba(255, 255, 255, 0.28);
  background: rgba(255, 255, 255, 0.10);
  color: rgba(255, 255, 255, 0.85);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.15s;
}
.result__share-btn:hover {
  background: rgba(255, 255, 255, 0.20);
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

/* ══════════════════════════════════════
   分享弹层
══════════════════════════════════════ */
.share-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.48);
  z-index: 1000;
  display: flex;
  align-items: flex-end;
  animation: overlayIn 0.2s ease;
}

@keyframes overlayIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.share-sheet {
  width: 100%;
  max-width: 560px;
  margin: 0 auto;
  background: #fff;
  border-radius: 20px 20px 0 0;
  padding: 12px 20px max(40px, env(safe-area-inset-bottom, 40px));
  animation: sheetIn 0.32s cubic-bezier(0.22, 1, 0.36, 1);
}

@keyframes sheetIn {
  from { transform: translateY(100%); }
  to { transform: translateY(0); }
}

.share-sheet__handle {
  width: 36px;
  height: 4px;
  background: #e5e5ea;
  border-radius: 2px;
  margin: 0 auto 18px;
}

.share-sheet__title {
  font-size: 15px;
  font-weight: 600;
  text-align: center;
  color: #1c1c1e;
  margin-bottom: 4px;
}

.share-sheet__preview {
  font-size: 13px;
  color: #8e8e93;
  text-align: center;
  margin-bottom: 28px;
}

.share-sheet__opts {
  display: flex;
  justify-content: center;
  gap: 32px;
  margin-bottom: 20px;
}

.share-opt {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
}

.share-opt__ico {
  width: 58px;
  height: 58px;
  border-radius: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: opacity 0.12s, transform 0.12s;
}
.share-opt:active .share-opt__ico {
  opacity: 0.75;
  transform: scale(0.93);
}

.share-opt__ico--wechat { background: #07C160; }
.share-opt__ico--douyin { background: #161823; }
.share-opt__ico--link   { background: #007AFF; }
.share-opt.is-copied .share-opt__ico--link { background: #34C759; }

.share-opt span {
  font-size: 12px;
  color: #3c3c43;
}

.share-sheet__hint {
  font-size: 12px;
  color: #8e8e93;
  text-align: center;
  line-height: 1.6;
  padding: 0 8px;
  margin-bottom: 16px;
}

.share-sheet__cancel {
  width: 100%;
  padding: 14px;
  border: none;
  border-radius: 14px;
  background: #f2f2f7;
  font-size: 16px;
  color: #1c1c1e;
  cursor: pointer;
  transition: background 0.1s;
}
.share-sheet__cancel:hover { background: #e5e5ea; }

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
  .share-sheet {
    border-radius: 20px;
    margin-bottom: 40px;
  }
}
</style>
