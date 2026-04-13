<script setup>
/**
 * 进度条组件
 * Props:
 *   progress (0-100)
 *   dark     (boolean) - 深色背景模式（白色轨道 + 蓝色填充）
 */
const props = defineProps({
  progress: { type: Number, default: 0 },
  dark:     { type: Boolean, default: false },
})
</script>

<template>
  <div
    class="progress-bar"
    :class="{ 'progress-bar--dark': dark }"
    role="progressbar"
    :aria-valuenow="progress"
    aria-valuemin="0"
    aria-valuemax="100"
  >
    <div class="progress-bar__fill" :style="{ width: progress + '%' }" />
  </div>
</template>

<style scoped>
.progress-bar {
  width: 100%;
  height: 3px;
  background: rgba(0, 0, 0, 0.10);
  border-radius: 999px;
  overflow: hidden;
}

.progress-bar__fill {
  height: 100%;
  background: var(--blue, #0071e3);
  border-radius: 999px;
  transition: width 0.3s ease-out;
}

/* 深色背景：白色轨道 */
.progress-bar--dark {
  background: rgba(255, 255, 255, 0.18);
}
</style>
