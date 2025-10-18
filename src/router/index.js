// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router'

// 引入页面组件
import HomePage from '../view/HomePage.vue'
import LoginPage from '../view/LoginPage.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: HomePage,
    meta: { title: 'AI旅行助手 - 智能行程规划' }
  },
  {
    path: '/login',
    name: 'Login',
    component: LoginPage,
    meta: { title: '登录 - AI旅行助手' }
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/'
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior(to, from, savedPosition) {
    // 始终滚动到顶部
    return { top: 0 }
  }
})

// 路由守卫
router.beforeEach((to, from, next) => {
  // 更新页面标题
  document.title = to.meta.title || 'AI旅行助手'
  
  // 检查是否需要登录验证
  if (to.meta.requiresAuth) {
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true'
    if (isLoggedIn) {
      next()
    } else {
      next({
        path: '/login',
        query: { redirect: to.fullPath } // 登录后重定向到原页面
      })
    }
  } else {
    next()
  }
})

export default router