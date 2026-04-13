<script setup>
/**
 * 15维度详情列表
 * 展示每个维度的 L/M/H 等级 + 说明文字
 *
 * Props:
 *   - levels: { N1: 'H', ... }
 *   - dimOrder: 维度顺序数组
 *   - dimDefs: 维度定义（含 name/levels/model）
 */
const props = defineProps({
  levels: { type: Object, required: true },
  dimOrder: { type: Array, required: true },
  dimDefs: { type: Object, required: true },
})

// 将维度按模型分组（N/C/R/A/S 五组）
const MODELS = [
  { key: 'N', label: '导航心理', dims: ['N1', 'N2', 'N3'] },
  { key: 'C', label: '车内情感', dims: ['C1', 'C2', 'C3'] },
  { key: 'R', label: '路途态度', dims: ['R1', 'R2', 'R3'] },
  { key: 'A', label: '行动模式', dims: ['A1', 'A2', 'A3'] },
  { key: 'S', label: '社交出行', dims: ['S1', 'S2', 'S3'] },
]

function levelClass(level) {
  return { H: 'dim-level--h', M: 'dim-level--m', L: 'dim-level--l' }[level] || ''
}

function levelText(dim, level) {
  return props.dimDefs[dim]?.levels?.[level] || level
}
</script>

<template>
  <div class="dim-detail">
    <div v-for="model in MODELS" :key="model.key" class="dim-model">
      <div class="dim-model__label">{{ model.label }}</div>
      <div class="dim-model__rows">
        <div
          v-for="dim in model.dims"
          :key="dim"
          class="dim-row"
        >
          <!-- 维度名 -->
          <div class="dim-row__name">
            <span class="dim-row__code">{{ dim }}</span>
            <span class="dim-row__fullname">{{ dimDefs[dim]?.shortName }}</span>
          </div>
          <!-- 等级标签 -->
          <span class="dim-level" :class="levelClass(levels[dim])">
            {{ levels[dim] }}
          </span>
          <!-- 描述 -->
          <p class="dim-row__desc">{{ levelText(dim, levels[dim]) }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.dim-detail {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.dim-model__label {
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin-bottom: 0.5rem;
}

.dim-model__rows {
  display: flex;
  flex-direction: column;
  gap: 0;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  overflow: hidden;
}

.dim-row {
  display: grid;
  grid-template-columns: auto auto 1fr;
  align-items: start;
  gap: 0.5rem 0.75rem;
  padding: 0.7rem 0.875rem;
  background: var(--color-surface);
  border-bottom: 1px solid var(--color-border);
}

.dim-row:last-child { border-bottom: none; }

.dim-row__name {
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
  grid-row: span 1;
}

.dim-row__code {
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--color-text-muted);
  letter-spacing: 0.04em;
}

.dim-row__fullname {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--color-text);
  white-space: nowrap;
}

.dim-level {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 6px;
  font-size: 0.8125rem;
  font-weight: 800;
  flex-shrink: 0;
  margin-top: 0.1rem;
}

.dim-level--h { background: var(--color-success-light); color: var(--color-success); }
.dim-level--m { background: var(--color-warning-light); color: var(--color-warning); }
.dim-level--l { background: var(--color-danger-light);  color: var(--color-danger);  }

.dim-row__desc {
  font-size: 0.8125rem;
  color: var(--color-text-muted);
  line-height: 1.55;
  grid-column: 3;
}
</style>
