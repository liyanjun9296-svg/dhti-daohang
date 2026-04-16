import { createRouter, createWebHistory } from 'vue-router'
import { useQuizStore } from '@/stores/quiz'

const routes = [
  {
    path: '/',
    name: 'home',
    component: () => import('@/views/HomeView.vue'),
  },
  // 仅本地开发可用：三层人格对照调试页
  ...(import.meta.env.DEV ? [{
    path: '/preview',
    name: 'preview',
    component: () => import('@/views/PreviewView.vue'),
  }] : []),
  {
    path: '/quiz',
    name: 'quiz',
    component: () => import('@/views/QuizView.vue'),
  },
  {
    path: '/result',
    name: 'result',
    component: () => import('@/views/ResultView.vue'),
    // 没有结果时重定向回首页
    beforeEnter: () => {
      const store = useQuizStore()
      if (!store.result) return { name: 'home' }
    },
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior: () => ({ top: 0 }),
})

export default router
