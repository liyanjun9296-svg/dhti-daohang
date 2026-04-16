<script setup>
/**
 * TypeAvatar — 人格角色头像组件
 *
 * 逻辑：
 * 1. 默认渲染静态 PNG 图片（/types/{code}.png）
 * 2. 同时尝试 fetch /types/{code}.json（Lottie 动画文件）
 * 3. JSON 加载成功 → lottie-web 渲染动画，绝对定位压盖在 PNG 上，循环播放
 * 4. JSON 不存在 → 仅显示 PNG，无任何报错
 * 5. PNG 也加载失败 → 显示 placeholder.png
 */
import { ref, watch, onMounted, onBeforeUnmount } from 'vue'
import lottie from 'lottie-web'

const props = defineProps({
  code: { type: String, required: true },
  size: { type: Number, default: 200 },
})

const imgSrc = ref(`/types/${props.code}.png`)
const lottieContainer = ref(null)
const hasLottie = ref(false)
let lottieInstance = null

function onImgError(e) {
  e.target.src = '/types/placeholder.png'
}

async function loadLottie(code) {
  // 先销毁上一个实例
  if (lottieInstance) {
    lottieInstance.destroy()
    lottieInstance = null
    hasLottie.value = false
  }

  try {
    const res = await fetch(`/types/${code}.json`)
    if (!res.ok) return   // 文件不存在，静默跳过
    const animData = await res.json()
    if (!lottieContainer.value) return

    lottieInstance = lottie.loadAnimation({
      container: lottieContainer.value,
      renderer: 'svg',
      loop: true,
      autoplay: true,
      animationData: animData,
    })
    hasLottie.value = true
  } catch {
    // 加载或解析失败，静默保留 PNG
  }
}

onMounted(() => {
  imgSrc.value = `/types/${props.code}.png`
  loadLottie(props.code)
})

watch(() => props.code, (newCode) => {
  imgSrc.value = `/types/${newCode}.png`
  loadLottie(newCode)
})

onBeforeUnmount(() => {
  if (lottieInstance) {
    lottieInstance.destroy()
    lottieInstance = null
  }
})
</script>

<template>
  <div class="ta" :style="{ width: size + 'px', height: size + 'px' }">
    <!-- 静态 PNG（兜底，始终存在于 DOM） -->
    <img
      :src="imgSrc"
      :alt="code"
      class="ta__img"
      :style="{ width: size + 'px', height: size + 'px' }"
      @error="onImgError"
    />
    <!-- Lottie 容器（加载成功后压盖在上方） -->
    <div
      ref="lottieContainer"
      class="ta__lottie"
      :class="{ 'ta__lottie--visible': hasLottie }"
      :style="{ width: size + 'px', height: size + 'px' }"
    />
  </div>
</template>

<style scoped>
.ta {
  position: relative;
  flex-shrink: 0;
}

.ta__img {
  display: block;
  object-fit: cover;
  border-radius: 50%;
}

.ta__lottie {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  overflow: hidden;
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.ta__lottie--visible {
  opacity: 1;
}
</style>
