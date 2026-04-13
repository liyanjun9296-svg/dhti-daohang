<script setup>
/**
 * 答题流程页
 * 功能：加载题目，逐题作答，自动滚动，提交计算结果
 */
import { ref, nextTick, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useQuizStore } from '@/stores/quiz'
import ProgressBar from '@/components/ProgressBar.vue'
import QuizQuestion from '@/components/QuizQuestion.vue'

const router = useRouter()
const quizStore = useQuizStore()

// 题目 DOM 引用（用于滚动到下一题）
const questionEls = ref([])

// 加载失败状态
const loadError = ref(false)

onMounted(async () => {
  // 如果题目未加载，触发初始化
  if (!quizStore.questions.length) {
    try {
      await quizStore.init()
    } catch {
      loadError.value = true
    }
  }
})

/**
 * 处理用户选择答案
 * @param {string} qId - 题目 id
 * @param {number} value - 选项值
 * @param {number} index - 题目在列表中的索引
 */
async function handleAnswer(qId, value, index) {
  // 记录答案（同时处理路怒彩蛋逻辑）
  quizStore.setAnswer(qId, value, index)

  // 等待 DOM 更新后滚动到下一题
  await nextTick()
  const nextEl = questionEls.value[index + 1]
  if (nextEl) {
    // 延迟 280ms，让用户看到选中状态后再滚动
    setTimeout(() => {
      nextEl.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 280)
  }
}

/** 提交：计算结果并跳转 */
async function handleSubmit() {
  if (!quizStore.isCompleted || quizStore.loading) return
  await quizStore.calcResult()
  router.push('/result')
}

/** 返回首页 */
function goHome() {
  router.push('/')
}
</script>

<template>
  <div class="quiz">

    <!-- ── 吸顶毛玻璃 Header ── -->
    <header class="quiz__header">
      <div class="quiz__header-inner">
        <button class="quiz__back" @click="goHome" aria-label="返回首页">
          <svg width="10" height="17" viewBox="0 0 10 17" fill="none" aria-hidden="true">
            <path d="M9 1L1 8.5L9 16" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
        <div class="quiz__progress-wrap">
          <ProgressBar :progress="quizStore.progress" :dark="true" />
        </div>
        <div class="quiz__progress-text">
          {{ quizStore.progress }}%
        </div>
      </div>
    </header>

    <!-- 加载中 -->
    <div v-if="quizStore.loading && !quizStore.questions.length" class="quiz__loading">
      <div class="quiz__loading-spinner" />
      <p>加载题目中…</p>
    </div>

    <!-- 加载失败 -->
    <div v-else-if="loadError" class="quiz__error">
      <p>加载失败，请刷新重试</p>
      <button class="btn btn-primary" @click="quizStore.init()">重新加载</button>
    </div>

    <!-- 题目列表 -->
    <template v-else>
      <div class="quiz__body">
        <QuizQuestion
          v-for="(q, i) in quizStore.questions"
          :key="q.id"
          :ref="el => { if (el) questionEls[i] = el.$el ?? el }"
          :question="q"
          :index="i"
          :selected="quizStore.answers[q.id] ?? null"
          @answer="(val) => handleAnswer(q.id, val, i)"
        />
      </div>

      <!-- 底部提交区 -->
      <div class="quiz__footer">
        <p v-if="!quizStore.isCompleted" class="quiz__remaining">
          还有 {{ quizStore.mainQuestionCount - quizStore.answeredMainCount }} 题未完成
        </p>
        <p v-else class="quiz__ready">全部完成</p>

        <button
          class="btn btn-primary quiz__submit"
          :disabled="!quizStore.isCompleted || quizStore.loading"
          @click="handleSubmit"
        >
          <span v-if="quizStore.loading">计算中…</span>
          <span v-else>查看我的导航人格</span>
        </button>
      </div>
    </template>

  </div>
</template>

<style scoped>
/* ── 整体容器 ── */
.quiz {
  min-height: 100vh;
  background: var(--bg-light);
  padding-bottom: 140px;
}

/* ── 吸顶毛玻璃 Header ── */
.quiz__header {
  position: sticky;
  top: 0;
  z-index: 20;
  background: rgba(0, 0, 0, 0.72);
  backdrop-filter: saturate(180%) blur(20px);
  -webkit-backdrop-filter: saturate(180%) blur(20px);
}

.quiz__header-inner {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 20px;
  max-width: var(--max-width);
  margin: 0 auto;
}

/* 返回按钮 */
.quiz__back {
  flex-shrink: 0;
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.72);
  cursor: pointer;
  padding: 6px 8px;
  border-radius: var(--r-sm);
  display: flex;
  align-items: center;
  transition: color 0.15s;
}

.quiz__back:hover { color: #fff; }
.quiz__back:active { color: rgba(255, 255, 255, 0.48); }

/* 进度条容器 */
.quiz__progress-wrap {
  flex: 1;
}

/* 进度百分比 */
.quiz__progress-text {
  flex-shrink: 0;
  font-size: 13px;
  font-weight: 500;
  color: var(--blue-dark-bg);
  min-width: 36px;
  text-align: right;
  font-variant-numeric: tabular-nums;
}

/* ── 题目列表区 ── */
.quiz__body {
  padding: 20px 16px 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-width: var(--max-width);
  margin: 0 auto;
}

/* ── 加载 / 错误状态 ── */
.quiz__loading,
.quiz__error {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  min-height: 50vh;
  color: var(--text-secondary);
  font-size: 15px;
}

.quiz__loading-spinner {
  width: 32px;
  height: 32px;
  border: 2px solid rgba(0, 113, 227, 0.2);
  border-top-color: var(--blue);
  border-radius: 50%;
  animation: spin 0.75s linear infinite;
}

@keyframes spin { to { transform: rotate(360deg); } }

/* ── 底部固定提交区 ── */
.quiz__footer {
  position: fixed;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  max-width: var(--max-width);
  padding: 12px 16px 28px;
  background: linear-gradient(to top, var(--bg-light) 72%, transparent);
}

.quiz__remaining {
  text-align: center;
  font-size: 13px;
  color: var(--text-tertiary);
  margin-bottom: 8px;
}

.quiz__ready {
  text-align: center;
  font-size: 13px;
  color: var(--color-success);
  font-weight: 500;
  margin-bottom: 8px;
}

.quiz__submit {
  width: 100%;
  font-size: 17px;
  padding: 14px;
  border-radius: var(--r);
}

/* ── 桌面适配 ── */
@media (min-width: 768px) {
  .quiz__body {
    padding: 28px 0 0;
  }

  .quiz__footer {
    max-width: var(--max-width);
    left: 50%;
    transform: translateX(-50%);
  }
}
</style>
