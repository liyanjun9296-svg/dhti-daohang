/**
 * Pinia Store - 答题全局状态
 * 管理：题目列表、当前答案、路怒标记、最终结果
 */
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { fetchQuestions, submitAnswers } from '@/api/quiz.js'

export const useQuizStore = defineStore('quiz', () => {
  // ── 状态 ──────────────────────────────────────────────
  const questions = ref([])          // 当前问卷题目列表（含插入的特殊题）
  const specialQuestions = ref([])   // 特殊题列表（用于条件插入）
  const totalMain = ref(0)           // 主题目总数（不含特殊题）
  const answers = ref({})            // { q1: 2, q2: 3, ... }
  const isRageDriver = ref(false)    // 是否触发路怒彩蛋
  const result = ref(null)           // 最终结果对象
  const loading = ref(false)         // 加载/计算中
  const rageConfirmInserted = ref(false) // 路怒追问是否已插入

  // ── 计算属性 ──────────────────────────────────────────
  /** 主题目数量（不含特殊题） */
  const mainQuestionCount = computed(() => totalMain.value || 30)

  /** 已完成的主题目数（不含特殊题） */
  const answeredMainCount = computed(() => {
    const specialIds = new Set(specialQuestions.value.map(q => q.id))
    return Object.keys(answers.value).filter(id => !specialIds.has(id)).length
  })

  /** 进度百分比 */
  const progress = computed(() =>
    Math.min(100, Math.round((answeredMainCount.value / mainQuestionCount.value) * 100))
  )

  /** 是否所有主题目都已作答 */
  const isCompleted = computed(() => {
    const mainIds = questions.value
      .filter(q => !q.special)
      .map(q => q.id)
    return mainIds.length > 0 && mainIds.every(id => answers.value[id] != null)
  })

  // ── 动作 ──────────────────────────────────────────────
  /** 初始化：从 API 加载题目 */
  async function init() {
    loading.value = true
    try {
      const data = await fetchQuestions()
      questions.value = data.questions
      specialQuestions.value = data.specialQuestions
      totalMain.value = data.totalMain
    } finally {
      loading.value = false
    }
  }

  /**
   * 记录答案，处理特殊题逻辑
   * @param {string} qId - 题目 id
   * @param {number} value - 选项值
   * @param {number} insertAfterIndex - 答此题后，在该索引之后插入追问（可选）
   */
  function setAnswer(qId, value, insertAfterIndex) {
    answers.value[qId] = value

    // 路怒彩蛋：gate 题选"骂人"选项（value=3）→ 插入追问
    if (qId === 'rage_gate_q1' && value === 3 && !rageConfirmInserted.value) {
      const confirmQ = specialQuestions.value.find(q => q.kind === 'rage_trigger')
      if (confirmQ && insertAfterIndex != null) {
        const insertAt = insertAfterIndex + 1
        // 检查是否已插入
        if (!questions.value.find(q => q.id === confirmQ.id)) {
          questions.value.splice(insertAt, 0, confirmQ)
          rageConfirmInserted.value = true
        }
      }
    }

    // 路怒确认：追问选"乘客要闭麦"（value=2）→ 激活路怒模式
    if (qId === 'rage_gate_q2' && value === 2) {
      isRageDriver.value = true
    }

    // 路怒 gate 选了非"骂人"选项 → 移除已插入的追问
    if (qId === 'rage_gate_q1' && value !== 3 && rageConfirmInserted.value) {
      const idx = questions.value.findIndex(q => q.id === 'rage_gate_q2')
      if (idx > -1) questions.value.splice(idx, 1)
      rageConfirmInserted.value = false
      isRageDriver.value = false
      delete answers.value['rage_gate_q2']
    }
  }

  /** 提交答案，计算结果 */
  async function calcResult() {
    loading.value = true
    try {
      result.value = await submitAnswers(answers.value, isRageDriver.value)
      return result.value
    } finally {
      loading.value = false
    }
  }

  /** 重置全部状态 */
  function reset() {
    questions.value = []
    specialQuestions.value = []
    totalMain.value = 0
    answers.value = {}
    isRageDriver.value = false
    result.value = null
    loading.value = false
    rageConfirmInserted.value = false
  }

  return {
    // 状态
    questions, specialQuestions, totalMain, answers,
    isRageDriver, result, loading,
    // 计算属性
    mainQuestionCount, answeredMainCount, progress, isCompleted,
    // 动作
    init, setAnswer, calcResult, reset,
  }
})
