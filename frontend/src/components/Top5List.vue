<script setup>
/**
 * TOP5 匹配排名列表
 * Props:
 *   - rankings: 所有类型按匹配度排序的数组（来自 determineResult）
 *   - topN:     显示前N条，默认5
 */
const props = defineProps({
  rankings: { type: Array, required: true },
  topN: { type: Number, default: 5 },
})

const topList = props.rankings.slice(0, props.topN)
</script>

<template>
  <div class="top-list">
    <div
      v-for="(item, i) in topList"
      :key="item.code"
      class="top-item"
      :class="{ 'top-item--first': i === 0 }"
    >
      <!-- 排名 -->
      <span class="top-item__rank" :class="{ 'top-item__rank--gold': i === 0 }">
        {{ i === 0 ? '🥇' : `#${i + 1}` }}
      </span>
      <!-- 代码 -->
      <span class="top-item__code">{{ item.code }}</span>
      <!-- 名称 -->
      <span class="top-item__name">{{ item.cn }}</span>
      <!-- 相似度 -->
      <span class="top-item__score">{{ item.similarity }}%</span>
    </div>
  </div>
</template>

<style scoped>
.top-list {
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  overflow: hidden;
}

.top-item {
  display: grid;
  grid-template-columns: 2.5rem 3.5rem 1fr auto;
  align-items: center;
  gap: 0.5rem;
  padding: 0.7rem 0.875rem;
  background: var(--color-surface);
  border-bottom: 1px solid var(--color-border);
  font-size: 0.875rem;
  transition: background 0.15s;
}

.top-item:last-child { border-bottom: none; }

.top-item--first {
  background: var(--color-primary-light);
}

.top-item__rank {
  font-size: 0.8125rem;
  color: var(--color-text-muted);
  font-weight: 600;
}

.top-item__rank--gold {
  font-size: 1.125rem;
}

.top-item__code {
  font-size: 0.8125rem;
  font-weight: 700;
  color: var(--color-primary);
  letter-spacing: 0.04em;
}

.top-item__name {
  color: var(--color-text);
  font-weight: 500;
}

.top-item__score {
  font-weight: 700;
  color: var(--color-text-muted);
  font-size: 0.875rem;
  white-space: nowrap;
}

.top-item--first .top-item__score {
  color: var(--color-primary);
}
</style>
