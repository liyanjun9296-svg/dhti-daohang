<script setup>
import { RouterView } from 'vue-router'
</script>

<template>
  <div class="app-wrapper">
    <RouterView />
  </div>
</template>

<style>
/* ── CSS 变量：Apple 色板 ──────────────────────────────────── */
:root {
  /* 背景 */
  --bg-dark:          #000000;
  --bg-light:         #f5f5f7;
  --bg-white:         #ffffff;

  /* 文字 */
  --text-dark:        #1d1d1f;
  --text-white:       #ffffff;
  --text-secondary:   rgba(0, 0, 0, 0.56);
  --text-tertiary:    rgba(0, 0, 0, 0.36);
  --text-on-dark:     rgba(255, 255, 255, 0.72);

  /* 交互（唯一彩色） */
  --blue:             #0071e3;
  --blue-dark-bg:     #2997ff;
  --blue-link:        #0066cc;

  /* 卡片/表面 */
  --surface:          #ffffff;
  --surface-dark-1:   #272729;

  /* 分隔线 */
  --divider:          rgba(0, 0, 0, 0.10);
  --divider-dark:     rgba(255, 255, 255, 0.12);

  /* 阴影 */
  --shadow-card:      rgba(0, 0, 0, 0.22) 3px 5px 30px 0px;

  /* 圆角 */
  --r-sm:             5px;
  --r:                8px;
  --r-md:             12px;
  --r-pill:           980px;

  /* 布局 */
  --max-width:        1250px;

  /* 兼容旧变量（防止现有组件报错） */
  --color-bg:            var(--bg-light);
  --color-surface:       var(--surface);
  --color-border:        var(--divider);
  --color-hover:         #e8e8ed;
  --color-text:          var(--text-dark);
  --color-text-muted:    var(--text-secondary);
  --color-text-light:    var(--text-tertiary);
  --color-primary:       var(--blue);
  --color-primary-light: #e3f0fc;
  --color-primary-dark:  #0055a5;
  --color-success:       #1a8c4e;
  --color-success-light: #e6f4ed;
  --color-warning:       #b45309;
  --color-warning-light: #fefce8;
  --color-danger:        #cc1432;
  --color-danger-light:  #fff0f2;
  --radius:              var(--r);
  --radius-sm:           var(--r-sm);
  --radius-lg:           var(--r-md);
  --shadow:              0 2px 12px rgba(0, 0, 0, 0.06);
  --shadow-md:           var(--shadow-card);
}

/* ── Reset ──────────────────────────────────────────────── */
*, *::before, *::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html {
  -webkit-text-size-adjust: 100%;
  -webkit-tap-highlight-color: transparent;
}

body {
  font-family: -apple-system, 'SF Pro Text', 'PingFang SC',
    'Hiragino Sans GB', 'Microsoft YaHei', 'Helvetica Neue', sans-serif;
  font-size: 17px;
  line-height: 1.6;
  color: var(--text-dark);
  background: var(--bg-dark);
  min-height: 100vh;
}

/* ── App 容器 ────────────────────────────────────────────── */
.app-wrapper {
  width: 100%;
  min-height: 100vh;
  position: relative;
}

/* ── 全局卡片 ────────────────────────────────────────────── */
.card {
  background: var(--surface);
  border-radius: var(--r);
  /* 无 border：靠背景色对比营造层次（Apple 风格） */
}

/* ── 按钮基础 ────────────────────────────────────────────── */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: var(--r);
  font-family: inherit;
  font-size: 17px;
  font-weight: 400;
  cursor: pointer;
  transition: opacity 0.15s, background 0.15s, transform 0.1s;
  -webkit-tap-highlight-color: transparent;
  user-select: none;
  text-decoration: none;
}

.btn:active {
  opacity: 0.82;
  transform: scale(0.98);
}

/* Apple Blue 主按钮 */
.btn-primary {
  background: var(--blue);
  color: #fff;
  padding: 14px 24px;
}

.btn-primary:hover {
  background: #0077ed;
}

/* 深色按钮（次要） */
.btn-dark {
  background: var(--text-dark);
  color: #fff;
  padding: 14px 24px;
}

/* 胶囊轮廓按钮（"了解更多"型） */
.btn-pill {
  background: transparent;
  border: 1px solid var(--blue-link);
  color: var(--blue-link);
  border-radius: var(--r-pill);
  padding: 8px 20px;
  font-size: 15px;
}

.btn-pill:hover {
  text-decoration: underline;
}

/* 深色背景上的胶囊按钮 */
.btn-pill-dark {
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.5);
  color: #fff;
  border-radius: var(--r-pill);
  padding: 8px 20px;
  font-size: 15px;
}

.btn-pill-dark:hover {
  border-color: #fff;
}

/* 禁用状态 */
.btn:disabled {
  background: rgba(0, 0, 0, 0.12) !important;
  color: var(--text-tertiary) !important;
  border-color: transparent !important;
  cursor: not-allowed;
  transform: none;
  opacity: 1;
}

/* ── Pill 标签 ───────────────────────────────────────────── */
.pill {
  display: inline-block;
  border-radius: var(--r-pill);
  padding: 3px 12px;
  font-size: 12px;
  font-weight: 500;
  line-height: 1.5;
}

.pill-amber {
  background: #fffbeb;
  border: 1px solid #fde68a;
  color: #b45309;
}

.pill-slate {
  background: var(--bg-light);
  border: 1px solid var(--divider);
  color: var(--text-secondary);
  font-weight: 400;
}

.pill-primary {
  background: var(--color-primary-light);
  color: var(--blue);
}

/* 深色背景上的轮廓标签 */
.pill-outline-dark {
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.36);
  color: rgba(255, 255, 255, 0.88);
}
</style>
