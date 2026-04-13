<script setup>
/**
 * 单题组件
 * Props:
 *   - question: 题目对象 { id, text, options, special? }
 *   - index:    题目序号（0起）
 *   - selected: 已选答案值（null = 未选）
 * Emits:
 *   - answer(value): 用户选择选项时触发
 */
const props = defineProps({
  question: { type: Object, required: true },
  index: { type: Number, required: true },
  selected: { type: Number, default: null },
})

const emit = defineEmits(['answer'])

function select(value) {
  emit('answer', value)
}
</script>

<template>
  <div
    class="question"
    :class="{ 'question--answered': selected != null, 'question--special': question.special }"
    :data-id="question.id"
  >
    <!-- 题目头部 -->
    <div class="question__head">
      <span v-if="question.special" class="question__special-tag">彩蛋题</span>
      <h3 class="question__text">
        <span class="question__index">{{ index + 1 }}.</span>
        {{ question.text }}
      </h3>
    </div>

    <!-- 选项列表 -->
    <div class="question__options">
      <button
        v-for="opt in question.options"
        :key="opt.value"
        class="option"
        :class="{ 'option--selected': selected === opt.value }"
        @click="select(opt.value)"
      >
        <span class="option__label">{{ opt.label }}</span>
        <span v-if="selected === opt.value" class="option__check" aria-hidden="true">
          <svg width="14" height="11" viewBox="0 0 14 11" fill="none">
            <path d="M1 5.5L5 9.5L13 1.5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </span>
      </button>
    </div>
  </div>
</template>

<style scoped>
/* ── 题目卡片 ── */
.question {
  background: #ffffff;
  border-radius: var(--r);
  /* Apple 风格：无边框，靠背景色对比 */
  overflow: hidden;
  /* 滚动时留出吸顶 Header 的空间 */
  scroll-margin-top: 60px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
  transition: box-shadow 0.2s;
}

.question--answered {
  box-shadow: 0 2px 12px rgba(0, 113, 227, 0.10);
}

/* 彩蛋题：顶部橙色装饰条 */
.question--special {
  border-top: 3px solid #f59e0b;
}

/* ── 题目头部 ── */
.question__head {
  padding: 18px 18px 12px;
}

.question__special-tag {
  display: inline-block;
  font-size: 11px;
  font-weight: 600;
  color: #b45309;
  background: #fef3c7;
  border: 1px solid #fde68a;
  border-radius: 999px;
  padding: 2px 10px;
  margin-bottom: 8px;
  letter-spacing: 0.04em;
}

.question__text {
  font-size: 15px;
  font-weight: 500;
  line-height: 1.65;
  color: var(--text-dark);
}

.question__index {
  color: var(--text-tertiary);
  margin-right: 4px;
  font-weight: 400;
}

/* ── 选项列表 ── */
.question__options {
  padding: 0 14px 14px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

/* 选项按钮 */
.option {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  text-align: left;
  background: var(--bg-light);
  border: none;
  border-radius: var(--r-sm);
  padding: 13px 14px;
  font-family: inherit;
  font-size: 14px;
  font-weight: 400;
  line-height: 1.5;
  color: var(--text-dark);
  cursor: pointer;
  transition: background 0.15s, color 0.15s;
  -webkit-tap-highlight-color: transparent;
}

.option:active {
  background: #e8e8ed;
}

/* 选中：Apple Blue 填充 */
.option--selected {
  background: var(--blue);
  color: #ffffff;
  font-weight: 500;
}

.option__label {
  flex: 1;
}

.option__check {
  flex-shrink: 0;
  color: rgba(255, 255, 255, 0.90);
  display: flex;
  align-items: center;
}
</style>
